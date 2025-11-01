/**
 * RepositoryGenerator.js
 * Generates Repository interfaces and implementations for API layer
 *
 * Creates:
 * - Repository interface (abstract class)
 * - Repository implementation with Dio
 * - Request/response models
 * - Error handling
 */

const { createModuleLogger } = require('../utils/logger');
const { createFormatter } = require('./utils/dartFormatter');
const {
  toRepositoryName,
  toRepositoryImplName,
  toModelName,
  toPascalCase,
  toCamelCase,
  toSnakeCase,
} = require('./utils/namingConventions');

const logger = createModuleLogger('RepositoryGenerator');

/**
 * RepositoryGenerator class
 */
class RepositoryGenerator {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.options = options;
    this.formatter = createFormatter(options.format);
  }

  /**
   * Generate repository files from component with API endpoints
   * @param {ComponentModel} component
   * @returns {Object} - {files: [{fileName, code}]}
   */
  generate(component) {
    logger.info(`Generating repository for: ${component.name}`);

    if (component.apiEndpoints.length === 0) {
      logger.warn(`No API endpoints found in ${component.name}, skipping repository generation`);
      return { files: [] };
    }

    const featureName = component.feature || component.name;
    const files = [];

    // Generate repository interface
    files.push({
      fileName: `${toSnakeCase(featureName)}_repository.dart`,
      code: this._generateRepositoryInterface(component, featureName),
      directory: 'domain/repositories',
    });

    // Generate repository implementation
    files.push({
      fileName: `${toSnakeCase(featureName)}_repository_impl.dart`,
      code: this._generateRepositoryImpl(component, featureName),
      directory: 'data/repositories',
    });

    // Generate remote data source
    files.push({
      fileName: `${toSnakeCase(featureName)}_remote_datasource.dart`,
      code: this._generateRemoteDataSource(component, featureName),
      directory: 'data/datasources',
    });

    // Generate models (if needed)
    const models = this._extractModels(component);
    models.forEach(model => {
      files.push({
        fileName: `${toSnakeCase(model.name)}_model.dart`,
        code: this._generateModel(model),
        directory: 'data/models',
      });
    });

    logger.success(`Generated ${files.length} repository files for: ${featureName}`);

    return { files };
  }

  /**
   * Generate repository interface (abstract class)
   * @param {ComponentModel} component
   * @param {string} featureName
   * @returns {string}
   * @private
   */
  _generateRepositoryInterface(component, featureName) {
    const repositoryName = toRepositoryName(featureName);
    const methods = this._generateRepositoryMethods(component);

    const imports = [
      "import 'package:dartz/dartz.dart';",
      "import '../../core/errors/failures.dart';",
    ];

    let code = this.formatter.formatFile({ imports });

    code += `\n/// Repository interface for ${featureName}\n`;
    code += `/// Defines contract for data operations\n`;
    code += `abstract class ${repositoryName} {\n`;

    methods.forEach(method => {
      code += `  /// ${method.description}\n`;
      code += `  Future<Either<Failure, ${method.returnType}>> ${method.name}(`;

      if (method.params.length > 0) {
        code += '\n';
        method.params.forEach((param, index) => {
          const comma = index < method.params.length - 1 ? ',' : '';
          code += `    ${param.type} ${param.name}${comma}\n`;
        });
        code += '  ';
      }

      code += ');\n\n';
    });

    code += '}\n';

    return code;
  }

  /**
   * Generate repository implementation
   * @param {ComponentModel} component
   * @param {string} featureName
   * @returns {string}
   * @private
   */
  _generateRepositoryImpl(component, featureName) {
    const repositoryName = toRepositoryName(featureName);
    const implName = toRepositoryImplName(featureName);
    const dataSourceName = `${toPascalCase(featureName)}RemoteDataSource`;

    const imports = [
      "import 'package:dartz/dartz.dart';",
      "import '../../core/errors/failures.dart';",
      "import '../../core/errors/exceptions.dart';",
      `import '../../domain/repositories/${toSnakeCase(featureName)}_repository.dart';`,
      `import '../datasources/${toSnakeCase(featureName)}_remote_datasource.dart';`,
    ];

    let code = this.formatter.formatFile({ imports });

    code += `\nclass ${implName} implements ${repositoryName} {\n`;
    code += `  final ${dataSourceName} remoteDataSource;\n\n`;
    code += `  ${implName}(this.remoteDataSource);\n\n`;

    const methods = this._generateRepositoryMethods(component);

    methods.forEach(method => {
      code += `  @override\n`;
      code += `  Future<Either<Failure, ${method.returnType}>> ${method.name}(`;

      if (method.params.length > 0) {
        code += '\n';
        method.params.forEach((param, index) => {
          const comma = index < method.params.length - 1 ? ',' : '';
          code += `    ${param.type} ${param.name}${comma}\n`;
        });
        code += '  ';
      }

      code += ') async {\n';
      code += '    try {\n';
      code += `      final result = await remoteDataSource.${method.name}(`;

      if (method.params.length > 0) {
        code += method.params.map(p => p.name).join(', ');
      }

      code += ');\n';
      code += '      return Right(result);\n';
      code += '    } on ServerException catch (e) {\n';
      code += '      return Left(ServerFailure(e.message));\n';
      code += '    } on NetworkException catch (e) {\n';
      code += '      return Left(NetworkFailure(e.message));\n';
      code += '    } catch (e) {\n';
      code += '      return Left(UnexpectedFailure(e.toString()));\n';
      code += '    }\n';
      code += '  }\n\n';
    });

    code += '}\n';

    return code;
  }

  /**
   * Generate remote data source
   * @param {ComponentModel} component
   * @param {string} featureName
   * @returns {string}
   * @private
   */
  _generateRemoteDataSource(component, featureName) {
    const dataSourceName = `${toPascalCase(featureName)}RemoteDataSource`;

    const imports = [
      "import 'package:dio/dio.dart';",
      "import '../../core/network/dio_client.dart';",
      "import '../../core/errors/exceptions.dart';",
    ];

    let code = this.formatter.formatFile({ imports });

    code += `\nclass ${dataSourceName} {\n`;
    code += '  final DioClient dioClient;\n\n';
    code += `  ${dataSourceName}(this.dioClient);\n\n`;

    component.apiEndpoints.forEach(endpoint => {
      code += this._generateDataSourceMethod(endpoint, component);
      code += '\n';
    });

    code += '}\n';

    return code;
  }

  /**
   * Generate data source method
   * @param {ApiEndpoint} endpoint
   * @param {ComponentModel} component
   * @returns {string}
   * @private
   */
  _generateDataSourceMethod(endpoint, component) {
    const methodName = this._getMethodName(endpoint);
    const returnType = this._getReturnType(endpoint);
    const params = this._getMethodParams(endpoint);

    let code = `  /// ${endpoint.description || `${endpoint.method} ${endpoint.path}`}\n`;
    code += `  Future<${returnType}> ${methodName}(`;

    if (params.length > 0) {
      code += '\n';
      params.forEach((param, index) => {
        const comma = index < params.length - 1 ? ',' : '';
        code += `    ${param.type} ${param.name}${comma}\n`;
      });
      code += '  ';
    }

    code += ') async {\n';
    code += '    try {\n';

    // Generate API call
    const path = this._buildPath(endpoint);
    const method = endpoint.method.toLowerCase();

    if (method === 'get') {
      code += `      final response = await dioClient.get('${path}');\n`;
    } else if (method === 'post') {
      code += '      final response = await dioClient.post(\n';
      code += `        '${path}',\n`;
      code += '        data: {\n';
      params.forEach(param => {
        code += `          '${param.name}': ${param.name},\n`;
      });
      code += '        },\n';
      code += '      );\n';
    } else if (method === 'put') {
      code += '      final response = await dioClient.put(\n';
      code += `        '${path}',\n`;
      code += '        data: {\n';
      params.forEach(param => {
        code += `          '${param.name}': ${param.name},\n`;
      });
      code += '        },\n';
      code += '      );\n';
    } else if (method === 'delete') {
      code += `      final response = await dioClient.delete('${path}');\n`;
    }

    code += '\n';
    code += '      // Parse response\n';
    code += `      // TODO: Parse response.data to ${returnType}\n`;
    code += '      return response.data as ${returnType};\n';
    code += '    } on DioException catch (e) {\n';
    code += '      if (e.type == DioExceptionType.connectionTimeout ||\n';
    code += '          e.type == DioExceptionType.receiveTimeout) {\n';
    code += "        throw NetworkException('Connection timeout');\n";
    code += '      }\n';
    code += '      throw ServerException(e.message ?? \'Unknown error\');\n';
    code += '    } catch (e) {\n';
    code += "      throw ServerException('Failed to fetch data: \${e.toString()}');\n";
    code += '    }\n';
    code += '  }';

    return code;
  }

  /**
   * Generate model class
   * @param {Object} model
   * @returns {string}
   * @private
   */
  _generateModel(model) {
    const className = toModelName(model.name);

    const imports = [
      "import 'package:freezed_annotation/freezed_annotation.dart';",
    ];

    // Add entity import if exists
    imports.push(
      `import '../../domain/entities/${toSnakeCase(model.name)}.dart';`
    );

    let code = this.formatter.formatFile({ imports });

    code += `\npart '${toSnakeCase(model.name)}_model.freezed.dart';\n`;
    code += `part '${toSnakeCase(model.name)}_model.g.dart';\n\n`;

    code += `@freezed\n`;
    code += `class ${className} with _$${className} {\n`;
    code += `  const factory ${className}({\n`;

    model.properties.forEach(prop => {
      code += `    @Default(${this._getDefaultValue(prop.type)}) ${prop.type} ${prop.name},\n`;
    });

    code += `  }) = _${className};\n\n`;

    code += `  const ${className}._();\n\n`;

    // fromJson
    code += `  factory ${className}.fromJson(Map<String, dynamic> json) =>\n`;
    code += `      _$${className}FromJson(json);\n\n`;

    // toEntity
    code += `  ${toPascalCase(model.name)} toEntity() {\n`;
    code += `    return ${toPascalCase(model.name)}(\n`;
    model.properties.forEach(prop => {
      code += `      ${prop.name}: ${prop.name},\n`;
    });
    code += '    );\n';
    code += '  }\n';

    code += '}\n';

    return code;
  }

  /**
   * Generate repository methods from API endpoints
   * @param {ComponentModel} component
   * @returns {Array}
   * @private
   */
  _generateRepositoryMethods(component) {
    return component.apiEndpoints.map(endpoint => {
      const methodName = this._getMethodName(endpoint);
      const returnType = this._getReturnType(endpoint);
      const params = this._getMethodParams(endpoint);

      return {
        name: methodName,
        returnType,
        params,
        description: endpoint.description || `${endpoint.method} ${endpoint.path}`,
      };
    });
  }

  /**
   * Get method name from endpoint
   * @param {ApiEndpoint} endpoint
   * @returns {string}
   * @private
   */
  _getMethodName(endpoint) {
    const action = endpoint.method.toLowerCase();
    const resource = endpoint.path.split('/').filter(Boolean).pop() || 'data';

    const actionMap = {
      get: 'get',
      post: 'create',
      put: 'update',
      delete: 'delete',
      patch: 'update',
    };

    return `${actionMap[action]}${toPascalCase(resource)}`;
  }

  /**
   * Get return type from endpoint
   * @param {ApiEndpoint} endpoint
   * @returns {string}
   * @private
   */
  _getReturnType(endpoint) {
    // This would be refined based on type analysis
    // For now, return a generic type
    const resource = endpoint.path.split('/').filter(Boolean).pop() || 'Data';

    if (endpoint.method === 'GET' && endpoint.path.includes('list')) {
      return `List<${toPascalCase(resource)}>`;
    }

    if (endpoint.method === 'DELETE') {
      return 'void';
    }

    return toPascalCase(resource);
  }

  /**
   * Get method parameters from endpoint
   * @param {ApiEndpoint} endpoint
   * @returns {Array}
   * @private
   */
  _getMethodParams(endpoint) {
    return endpoint.parameters.map(param => ({
      name: toCamelCase(param),
      type: 'String', // Could be refined based on type analysis
    }));
  }

  /**
   * Build API path with parameter interpolation
   * @param {ApiEndpoint} endpoint
   * @returns {string}
   * @private
   */
  _buildPath(endpoint) {
    let path = endpoint.path;

    // Replace :id with ${id}
    path = path.replace(/:(\w+)/g, '${$1}');

    return path;
  }

  /**
   * Extract models from component
   * @param {ComponentModel} component
   * @returns {Array}
   * @private
   */
  _extractModels(component) {
    // This would analyze the API endpoints and component types
    // to determine what models are needed

    const models = [];

    // For now, create a basic model based on the feature
    if (component.apiEndpoints.length > 0) {
      const featureName = component.feature || component.name;

      models.push({
        name: featureName,
        properties: [
          { name: 'id', type: 'String' },
          { name: 'name', type: 'String' },
          // Would extract actual properties from component
        ],
      });
    }

    return models;
  }

  /**
   * Get default value for type
   * @param {string} type
   * @returns {string}
   * @private
   */
  _getDefaultValue(type) {
    const defaults = {
      String: "''",
      int: '0',
      num: '0',
      double: '0.0',
      bool: 'false',
      List: 'const []',
      Map: 'const {}',
    };

    return defaults[type] || 'null';
  }
}

/**
 * Create a repository generator instance
 * @param {Object} options
 * @returns {RepositoryGenerator}
 */
function createRepositoryGenerator(options) {
  return new RepositoryGenerator(options);
}

module.exports = {
  RepositoryGenerator,
  createRepositoryGenerator,
};
