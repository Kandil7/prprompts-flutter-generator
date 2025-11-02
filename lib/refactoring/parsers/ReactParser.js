/**
 * ReactParser.js
 * Main parser for React/TypeScript files using Babel AST
 *
 * Extracts component information, props, state, hooks, methods, and structure
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { ComponentModel, ComponentType, StateManagementPattern } = require('../models/ComponentModel');
const { createModuleLogger } = require('../utils/logger');
const astHelpers = require('./utils/astHelpers');

const logger = createModuleLogger('ReactParser');

/**
 * React Parser class
 */
class ReactParser {
  /**
   * @param {Object} options
   * @param {string} options.sourceType - 'module' or 'script'
   * @param {string[]} options.plugins - Babel parser plugins
   */
  constructor(options = {}) {
    this.options = {
      sourceType: options.sourceType || 'module',
      plugins: options.plugins || [
        'jsx',
        'typescript',
        'classProperties',
        'decorators-legacy',
        'objectRestSpread',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
    };
  }

  /**
   * Parse a React/TypeScript file
   * @param {string} sourceCode - Source code to parse
   * @param {string} filePath - File path for error reporting
   * @returns {ComponentModel|null} - Parsed component model
   */
  parse(sourceCode, filePath) {
    try {
      logger.info(`Parsing file: ${filePath}`);

      // Parse source code to AST
      const ast = parser.parse(sourceCode, this.options);

      // Extract component information
      const componentInfo = this._extractComponentInfo(ast, filePath);

      if (!componentInfo) {
        logger.warn(`No React component found in: ${filePath}`);
        return null;
      }

      // Create ComponentModel
      const component = new ComponentModel({
        filePath,
        name: componentInfo.name,
        type: componentInfo.type,
        props: componentInfo.props,
        state: componentInfo.state,
        hooks: componentInfo.hooks,
        methods: componentInfo.methods,
        children: componentInfo.children,
        imports: componentInfo.imports,
        exports: componentInfo.exports,
        styling: componentInfo.styling,
        stateManagement: componentInfo.stateManagement,
        feature: componentInfo.feature,
        apiEndpoints: componentInfo.apiEndpoints,
        isResponsive: componentInfo.isResponsive,
        description: componentInfo.description,
      });

      logger.success(`Successfully parsed: ${componentInfo.name}`);
      return component;

    } catch (error) {
      const location = error.loc ? ` at line ${error.loc.line}, column ${error.loc.column}` : '';
      logger.error(`Failed to parse ${filePath}${location}: ${error.message}`);
      throw new Error(`Parse error in ${filePath}${location}: ${error.message}`);
    }
  }

  /**
   * Extract component information from AST
   * @private
   */
  _extractComponentInfo(ast, filePath) {
    let componentNode = null;
    let componentName = null;
    let componentType = ComponentType.WIDGET;
    let isExported = false;

    const props = [];
    const state = [];
    const hooks = [];
    const methods = [];
    const children = new Set();
    const imports = [];
    const exports = [];
    let stateManagement = null;
    let description = null;

    // Traverse AST
    traverse(ast, {
      // Detect imports
      ImportDeclaration: (path) => {
        const importInfo = astHelpers.getImportInfo(path.node);
        imports.push(importInfo);

        // Detect state management from imports
        if (!stateManagement) {
          stateManagement = this._detectStateManagementFromImport(importInfo);
        }
      },

      // Detect exports
      ExportDeclaration: (path) => {
        const exportInfo = astHelpers.getExportInfo(path.node);
        exports.push(exportInfo);

        // Check if this is the main component export
        if (exportInfo.type === 'default' && astHelpers.isReactComponent(exportInfo.declaration)) {
          componentNode = exportInfo.declaration;
          componentName = astHelpers.getComponentName(exportInfo.declaration);
          isExported = true;
        }
      },

      // Detect functional components
      VariableDeclarator: (path) => {
        const node = path.node;

        // Check if this is a component
        if (!componentNode && astHelpers.isReactComponent(node.init)) {
          componentName = node.id.name;
          componentNode = node.init;

          // Extract JSDoc description
          description = this._extractDescription(path.parent);

          // Determine component type based on file path
          componentType = this._determineComponentType(filePath);

          // Extract props
          const propsParam = astHelpers.getPropsParameter(node.init);
          if (propsParam) {
            props.push(...this._extractPropsFromParameter(propsParam));
          }
        }
      },

      // Detect class components
      ClassDeclaration: (path) => {
        const node = path.node;

        if (!componentNode && astHelpers.isReactComponent(node)) {
          componentName = node.id.name;
          componentNode = node;

          // Extract JSDoc description
          description = this._extractDescription(node);

          componentType = this._determineComponentType(filePath);

          // Extract props from constructor or propTypes
          this._extractPropsFromClass(node, props);

          // Extract state from constructor
          this._extractStateFromClass(node, state, path);

          // Extract methods
          this._extractMethodsFromClass(node, methods);
        }
      },

      // Detect hooks in functional components
      CallExpression: (path) => {
        if (!componentNode) return;

        const node = path.node;

        // useState hook
        if (astHelpers.isUseStateHook(node)) {
          const parent = path.parent;
          if (parent && parent.type === 'VariableDeclarator') {
            const stateVar = astHelpers.getStateVariableFromUseState(parent);
            if (stateVar) {
              // Extract initial value
              const initialValue = node.arguments[0] ? this._getValueString(node.arguments[0]) : null;

              state.push({
                name: stateVar.name,
                type: this._inferTypeFromValue(initialValue),
                initialValue,
              });

              hooks.push('useState');
            }
          }
        }

        // Other hooks
        if (astHelpers.isHookCall(node)) {
          const hookName = astHelpers.getHookName(node);
          if (hookName && !hooks.includes(hookName)) {
            hooks.push(hookName);
          }
        }
      },

      // Detect JSX elements (child components)
      JSXElement: (path) => {
        const node = path.node;
        const tagName = this._getJSXTagName(node.openingElement);

        // Only track custom components (PascalCase)
        if (tagName && /^[A-Z]/.test(tagName)) {
          children.add(tagName);
        }
      },
    });

    if (!componentNode || !componentName) {
      return null;
    }

    return {
      name: componentName,
      type: componentType,
      props,
      state,
      hooks: Array.from(new Set(hooks)),
      methods,
      children: Array.from(children),
      imports,
      exports,
      styling: {},
      stateManagement,
      feature: this._extractFeatureFromPath(filePath),
      apiEndpoints: [], // Will be populated by ApiExtractor
      isResponsive: false, // Will be determined by StyleExtractor
      description,
    };
  }

  /**
   * Extract props from function parameter
   * @private
   */
  _extractPropsFromParameter(propsParam) {
    const props = [];

    // Destructured props
    if (propsParam.type === 'ObjectPattern') {
      const propNames = astHelpers.getDestructuredProps(propsParam);
      propNames.forEach(name => {
        props.push({
          name: name.replace(/^\.\.\./, ''), // Remove rest operator
          type: 'any', // Will be refined by TypeExtractor
          isRequired: false,
          defaultValue: null,
        });
      });
    }

    // Named props with type annotation
    if (propsParam.typeAnnotation) {
      // Will be handled by TypeExtractor
    }

    return props;
  }

  /**
   * Extract props from class component
   * @private
   */
  _extractPropsFromClass(classNode, propsArray) {
    // Look for static propTypes
    classNode.body.body.forEach(member => {
      if (member.type === 'ClassProperty' &&
          member.static &&
          member.key.name === 'propTypes') {
        // PropTypes will be handled by TypeExtractor
      }
    });
  }

  /**
   * Extract state from class constructor
   * @private
   */
  _extractStateFromClass(classNode, stateArray, parentPath) {
    // Find constructor
    const constructor = classNode.body.body.find(
      member => member.type === 'ClassMethod' && member.kind === 'constructor'
    );

    if (!constructor) return;

    // Capture this context
    const self = this;

    // Look for this.state = {...}
    traverse(constructor, {
      AssignmentExpression(path) {
        const node = path.node;

        if (node.left.type === 'MemberExpression' &&
            node.left.object.type === 'ThisExpression' &&
            node.left.property.name === 'state' &&
            node.right.type === 'ObjectExpression') {

          // Extract state properties
          node.right.properties.forEach(prop => {
            if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
              stateArray.push({
                name: prop.key.name,
                type: self._inferTypeFromValue(prop.value),
                initialValue: self._getValueString(prop.value),
              });
            }
          });
        }
      },
    }, parentPath.scope, parentPath);
  }

  /**
   * Extract methods from class component
   * @private
   */
  _extractMethodsFromClass(classNode, methodsArray) {
    classNode.body.body.forEach(member => {
      if (member.type === 'ClassMethod' && member.kind === 'method') {
        methodsArray.push({
          name: member.key.name,
          isAsync: member.async,
          params: member.params.map(p => p.name || 'unknown'),
        });
      }
    });
  }

  /**
   * Detect state management from imports
   * @private
   */
  _detectStateManagementFromImport(importInfo) {
    const source = importInfo.source.toLowerCase();

    if (source.includes('redux')) {
      return StateManagementPattern.REDUX;
    }
    if (source.includes('zustand')) {
      return StateManagementPattern.ZUSTAND;
    }
    if (source.includes('mobx')) {
      return StateManagementPattern.MOBX;
    }
    if (source.includes('recoil')) {
      return StateManagementPattern.RECOIL;
    }

    return null;
  }

  /**
   * Get JSX tag name
   * @private
   */
  _getJSXTagName(openingElement) {
    if (openingElement.name.type === 'JSXIdentifier') {
      return openingElement.name.name;
    }
    if (openingElement.name.type === 'JSXMemberExpression') {
      // Handle Component.SubComponent
      let name = '';
      let current = openingElement.name;
      while (current) {
        if (current.type === 'JSXIdentifier') {
          name = current.name + (name ? '.' + name : '');
          break;
        }
        if (current.property) {
          name = current.property.name + (name ? '.' + name : '');
        }
        current = current.object;
      }
      return name;
    }
    return null;
  }

  /**
   * Infer type from value
   * @private
   */
  _inferTypeFromValue(value) {
    if (!value) return 'any';

    switch (value.type) {
      case 'StringLiteral':
      case 'TemplateLiteral':
        return 'string';
      case 'NumericLiteral':
        return 'number';
      case 'BooleanLiteral':
        return 'boolean';
      case 'ArrayExpression':
        return 'Array';
      case 'ObjectExpression':
        return 'object';
      case 'NullLiteral':
        return 'null';
      case 'ArrowFunctionExpression':
      case 'FunctionExpression':
        return 'function';
      default:
        return 'any';
    }
  }

  /**
   * Get string representation of value
   * @private
   */
  _getValueString(node) {
    const literal = astHelpers.getLiteralValue(node);
    if (literal !== null) {
      return String(literal);
    }

    if (node.type === 'ArrayExpression') {
      return '[]';
    }
    if (node.type === 'ObjectExpression') {
      return '{}';
    }
    if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
      return '() => {}';
    }

    return null;
  }

  /**
   * Determine component type from file path
   * @private
   */
  _determineComponentType(filePath) {
    const normalized = filePath.toLowerCase();

    if (normalized.includes('/pages/') || normalized.includes('/screens/')) {
      return ComponentType.PAGE;
    }
    if (normalized.includes('/hooks/')) {
      return ComponentType.HOOK;
    }
    if (normalized.includes('/context/') || normalized.includes('/contexts/')) {
      return ComponentType.CONTEXT;
    }
    if (normalized.includes('/hoc/') || normalized.includes('with')) {
      return ComponentType.HOC;
    }

    return ComponentType.WIDGET;
  }

  /**
   * Extract feature name from file path
   * @private
   */
  _extractFeatureFromPath(filePath) {
    // Try to extract feature from path like /features/auth/Login.tsx
    const featureMatch = filePath.match(/\/features\/([^/]+)/);
    if (featureMatch) {
      return featureMatch[1];
    }

    // Try /src/auth/Login.tsx
    const srcMatch = filePath.match(/\/src\/([^/]+)/);
    if (srcMatch && !['components', 'pages', 'screens', 'hooks', 'utils'].includes(srcMatch[1])) {
      return srcMatch[1];
    }

    return null;
  }

  /**
   * Extract description from JSDoc
   * @private
   */
  _extractDescription(node) {
    const jsdoc = astHelpers.getJSDocComment(node);
    if (jsdoc) {
      // Extract description (first paragraph)
      const lines = jsdoc.split('\n').map(line => line.trim().replace(/^\*\s*/, ''));
      const description = lines.find(line => line && !line.startsWith('@'));
      return description || null;
    }
    return null;
  }

  /**
   * Parse multiple files
   * @param {Object[]} files - Array of { path, content } objects
   * @returns {ComponentModel[]}
   */
  parseMultiple(files) {
    const components = [];

    for (const file of files) {
      try {
        const component = this.parse(file.content, file.path);
        if (component) {
          components.push(component);
        }
      } catch (error) {
        logger.error(`Skipping ${file.path}: ${error.message}`);
      }
    }

    logger.info(`Parsed ${components.length} components from ${files.length} files`);
    return components;
  }
}

module.exports = {
  ReactParser,
};
