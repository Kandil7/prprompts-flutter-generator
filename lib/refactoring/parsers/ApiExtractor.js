/**
 * ApiExtractor.js
 * Extracts API endpoint information from React components
 *
 * Detects fetch, axios, GraphQL calls and generates Flutter service metadata
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { ApiEndpoint } = require('../models/ComponentModel');
const { createModuleLogger } = require('../utils/logger');
const astHelpers = require('./utils/astHelpers');

const logger = createModuleLogger('ApiExtractor');

/**
 * API Extractor class
 */
class ApiExtractor {
  constructor() {
    this.endpoints = [];
    this.baseUrl = null;
    this.authMethod = null;
  }

  /**
   * Extract API endpoints from source code
   * @param {string} sourceCode - Source code to analyze
   * @param {string} filePath - File path for error reporting
   * @returns {Object} - Extracted API information
   */
  extract(sourceCode, filePath) {
    try {
      logger.info(`Extracting API endpoints from: ${filePath}`);

      const ast = parser.parse(sourceCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      const result = {
        endpoints: [],
        baseUrl: null,
        authMethod: null,
        hasGraphQL: false,
      };

      traverse(ast, {
        // Detect base URL
        VariableDeclarator: (path) => {
          const node = path.node;
          if (t.isIdentifier(node.id) &&
              (node.id.name.toLowerCase().includes('baseurl') ||
               node.id.name.toLowerCase().includes('api_url'))) {
            result.baseUrl = astHelpers.getStringValue(node.init);
          }
        },

        // Detect API calls
        CallExpression: (path) => {
          const node = path.node;

          // fetch() calls
          if (t.isIdentifier(node.callee, { name: 'fetch' })) {
            const endpoint = this._extractFetchCall(node);
            if (endpoint) {
              result.endpoints.push(endpoint);
            }
          }

          // axios calls
          if (this._isAxiosCall(node)) {
            const endpoint = this._extractAxiosCall(node);
            if (endpoint) {
              result.endpoints.push(endpoint);
            }
          }

          // GraphQL
          if (this._isGraphQLCall(node)) {
            result.hasGraphQL = true;
            const endpoint = this._extractGraphQLCall(node);
            if (endpoint) {
              result.endpoints.push(endpoint);
            }
          }
        },
      });

      logger.success(`Extracted ${result.endpoints.length} API endpoints`);
      return result;

    } catch (error) {
      logger.error(`Failed to extract API endpoints from ${filePath}: ${error.message}`);
      return {
        endpoints: [],
        baseUrl: null,
        authMethod: null,
        hasGraphQL: false,
      };
    }
  }

  /**
   * Extract fetch() call
   * @private
   */
  _extractFetchCall(node) {
    if (!node.arguments || node.arguments.length === 0) {
      return null;
    }

    const urlArg = node.arguments[0];
    const optionsArg = node.arguments[1];

    let path = astHelpers.getStringValue(urlArg);
    if (!path && t.isTemplateLiteral(urlArg)) {
      path = this._extractTemplateLiteral(urlArg);
    }

    if (!path) return null;

    let method = 'GET';
    const parameters = [];

    // Extract options
    if (optionsArg && t.isObjectExpression(optionsArg)) {
      optionsArg.properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          // Method
          if (prop.key.name === 'method') {
            const methodValue = astHelpers.getStringValue(prop.value);
            if (methodValue) {
              method = methodValue.toUpperCase();
            }
          }

          // Body (parameters)
          if (prop.key.name === 'body' && t.isCallExpression(prop.value)) {
            if (t.isIdentifier(prop.value.callee, { name: 'JSON' }) ||
                (t.isMemberExpression(prop.value.callee) &&
                 t.isIdentifier(prop.value.callee.property, { name: 'stringify' }))) {
              const bodyArg = prop.value.arguments[0];
              if (t.isObjectExpression(bodyArg)) {
                bodyArg.properties.forEach(p => {
                  if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
                    parameters.push(p.key.name);
                  }
                });
              }
            }
          }
        }
      });
    }

    return new ApiEndpoint({
      method,
      path,
      description: `${method} ${path}`,
      parameters,
    });
  }

  /**
   * Check if call is axios
   * @private
   */
  _isAxiosCall(node) {
    const callee = node.callee;

    // axios()
    if (t.isIdentifier(callee, { name: 'axios' })) {
      return true;
    }

    // axios.get(), axios.post(), etc.
    if (t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object, { name: 'axios' })) {
      return true;
    }

    // api.get() where api is axios instance
    if (t.isMemberExpression(callee) && t.isIdentifier(callee.object)) {
      const objectName = callee.object.name.toLowerCase();
      return ['api', 'client', 'http', 'request'].includes(objectName);
    }

    return false;
  }

  /**
   * Extract axios call
   * @private
   */
  _extractAxiosCall(node) {
    const callee = node.callee;
    let method = 'GET';
    let path = null;
    const parameters = [];

    // axios.get(url), axios.post(url, data)
    if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
      method = callee.property.name.toUpperCase();

      if (node.arguments.length > 0) {
        const urlArg = node.arguments[0];
        path = astHelpers.getStringValue(urlArg);
        if (!path && t.isTemplateLiteral(urlArg)) {
          path = this._extractTemplateLiteral(urlArg);
        }

        // Extract data parameter
        if (node.arguments.length > 1 && t.isObjectExpression(node.arguments[1])) {
          node.arguments[1].properties.forEach(prop => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
              parameters.push(prop.key.name);
            }
          });
        }
      }
    }

    // axios({ method, url, data })
    if (t.isIdentifier(callee, { name: 'axios' }) &&
        node.arguments.length > 0 &&
        t.isObjectExpression(node.arguments[0])) {
      const config = node.arguments[0];

      config.properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          if (prop.key.name === 'method') {
            const methodValue = astHelpers.getStringValue(prop.value);
            if (methodValue) method = methodValue.toUpperCase();
          }
          if (prop.key.name === 'url') {
            path = astHelpers.getStringValue(prop.value);
          }
          if (prop.key.name === 'data' && t.isObjectExpression(prop.value)) {
            prop.value.properties.forEach(p => {
              if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
                parameters.push(p.key.name);
              }
            });
          }
        }
      });
    }

    if (!path) return null;

    return new ApiEndpoint({
      method,
      path,
      description: `${method} ${path}`,
      parameters,
    });
  }

  /**
   * Check if call is GraphQL
   * @private
   */
  _isGraphQLCall(node) {
    if (!t.isCallExpression(node)) return false;

    const callee = node.callee;

    // useQuery, useMutation
    if (t.isIdentifier(callee) &&
        (callee.name === 'useQuery' || callee.name === 'useMutation')) {
      return true;
    }

    // client.query()
    if (t.isMemberExpression(callee) &&
        t.isIdentifier(callee.property) &&
        (callee.property.name === 'query' || callee.property.name === 'mutate')) {
      return true;
    }

    return false;
  }

  /**
   * Extract GraphQL call
   * @private
   */
  _extractGraphQLCall(node) {
    let method = 'GRAPHQL';
    let path = '/graphql';
    const parameters = [];

    // Try to extract query/mutation name
    if (node.arguments.length > 0) {
      const firstArg = node.arguments[0];

      // Tagged template: gql`query { ... }`
      if (t.isTaggedTemplateExpression(firstArg)) {
        const query = this._extractGraphQLQuery(firstArg);
        if (query) {
          path = `/graphql (${query.type}: ${query.name})`;
          method = query.type.toUpperCase();
        }
      }
    }

    return new ApiEndpoint({
      method,
      path,
      description: `GraphQL ${method}`,
      parameters,
    });
  }

  /**
   * Extract GraphQL query information
   * @private
   */
  _extractGraphQLQuery(taggedTemplate) {
    const quasi = taggedTemplate.quasi;
    if (!quasi.quasis || quasi.quasis.length === 0) return null;

    const queryString = quasi.quasis[0].value.cooked;

    // Extract query/mutation name
    const queryMatch = queryString.match(/query\s+(\w+)/);
    const mutationMatch = queryString.match(/mutation\s+(\w+)/);

    if (queryMatch) {
      return { type: 'query', name: queryMatch[1] };
    }
    if (mutationMatch) {
      return { type: 'mutation', name: mutationMatch[1] };
    }

    return { type: 'query', name: 'unknown' };
  }

  /**
   * Extract template literal to path string
   * @private
   */
  _extractTemplateLiteral(node) {
    if (!t.isTemplateLiteral(node)) return null;

    let path = '';
    node.quasis.forEach((quasi, index) => {
      path += quasi.value.cooked;
      if (index < node.expressions.length) {
        const expr = node.expressions[index];
        if (t.isIdentifier(expr)) {
          path += `:${expr.name}`;
        } else {
          path += '${...}';
        }
      }
    });

    return path;
  }

  /**
   * Generate Flutter service code suggestion
   * @param {Object} extractionResult - Result from extract()
   * @returns {Object} - Service generation suggestions
   */
  generateFlutterService(extractionResult) {
    const { endpoints, baseUrl, hasGraphQL } = extractionResult;

    const suggestion = {
      packages: ['dio: ^5.0.0'],
      serviceName: 'ApiService',
      methods: [],
    };

    if (hasGraphQL) {
      suggestion.packages.push('graphql_flutter: ^5.0.0');
    }

    // Generate method for each endpoint
    endpoints.forEach(endpoint => {
      const methodName = this._generateMethodName(endpoint);
      const dartMethod = this._generateDartServiceMethod(endpoint, methodName);
      suggestion.methods.push(dartMethod);
    });

    return suggestion;
  }

  /**
   * Generate method name from endpoint
   * @private
   */
  _generateMethodName(endpoint) {
    const method = endpoint.method.toLowerCase();
    const pathParts = endpoint.path.split('/').filter(p => p && !p.startsWith(':'));
    const resource = pathParts[pathParts.length - 1] || 'data';

    return `${method}${this._toPascalCase(resource)}`;
  }

  /**
   * Generate Dart service method
   * @private
   */
  _generateDartServiceMethod(endpoint, methodName) {
    const params = endpoint.parameters.map(p => `required ${this._toPascalCase(p)} ${p}`).join(', ');

    return `Future<Response> ${methodName}({${params}}) async {
  return await dio.${endpoint.method.toLowerCase()}('${endpoint.path}');
}`;
  }

  /**
   * Convert to PascalCase
   * @private
   */
  _toPascalCase(str) {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }
}

module.exports = {
  ApiExtractor,
};
