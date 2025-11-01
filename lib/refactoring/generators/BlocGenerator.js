/**
 * BlocGenerator.js
 * Generates BLoC or Cubit for state management
 *
 * Creates BLoC for complex state (10+ variables, async ops)
 * Creates Cubit for simple state (< 10 variables)
 */

const { createModuleLogger } = require('../utils/logger');
const { createFormatter } = require('./utils/dartFormatter');
const {
  toBlocName,
  toCubitName,
  toEventName,
  toStateName,
  toPascalCase,
  toCamelCase,
  toSnakeCase,
} = require('./utils/namingConventions');

const logger = createModuleLogger('BlocGenerator');

/**
 * BlocGenerator class
 */
class BlocGenerator {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.options = options;
    this.formatter = createFormatter(options.format);
  }

  /**
   * Generate BLoC or Cubit based on component complexity
   * @param {ComponentModel} component
   * @returns {Object} - {type: 'bloc'|'cubit', files: [{fileName, code}]}
   */
  generate(component) {
    const stateManagement = component.recommendedFlutterStateManagement();

    logger.info(`Generating ${stateManagement} for: ${component.name}`);

    if (stateManagement === 'bloc') {
      return this.generateBloc(component);
    } else {
      return this.generateCubit(component);
    }
  }

  /**
   * Generate BLoC (for complex state)
   * @param {ComponentModel} component
   * @returns {Object}
   */
  generateBloc(component) {
    const featureName = component.feature || component.name;
    const blocName = toBlocName(featureName);
    const eventName = toEventName(featureName);
    const stateName = toStateName(featureName);

    const files = [];

    // Generate event file
    files.push({
      fileName: `${toSnakeCase(featureName)}_event.dart`,
      code: this._generateEventClass(component, eventName),
    });

    // Generate state file
    files.push({
      fileName: `${toSnakeCase(featureName)}_state.dart`,
      code: this._generateStateClass(component, stateName),
    });

    // Generate bloc file
    files.push({
      fileName: `${toSnakeCase(featureName)}_bloc.dart`,
      code: this._generateBlocClass(component, blocName, eventName, stateName),
    });

    logger.success(`Generated BLoC files for: ${featureName}`);

    return {
      type: 'bloc',
      files,
    };
  }

  /**
   * Generate Event class
   * @param {ComponentModel} component
   * @param {string} eventName
   * @returns {string}
   * @private
   */
  _generateEventClass(component, eventName) {
    const events = this._extractEvents(component);

    const imports = [
      "import 'package:equatable/equatable.dart';",
    ];

    // Base event class
    let code = this.formatter.formatFile({
      imports,
      classes: [
        {
          name: eventName,
          extends: 'Equatable',
          isAbstract: true,
          constructor: {
            name: eventName,
            isConst: true,
            params: [],
          },
          methods: [
            {
              name: 'props',
              returnType: 'List<Object?>',
              params: [],
              isOverride: true,
              body: 'return [];',
            },
          ],
        },
      ],
    });

    // Add event subclasses
    events.forEach(event => {
      code += '\n';
      code += this.formatter.formatClass({
        name: event.name,
        extends: eventName,
        properties: event.params.map(p => `final ${p.type} ${p.name};`),
        constructor: {
          name: event.name,
          isConst: true,
          params: event.params.map(p => `required this.${p.name}`),
        },
        methods: [
          {
            name: 'props',
            returnType: 'List<Object?>',
            params: [],
            isOverride: true,
            body: `return [${event.params.map(p => p.name).join(', ')}];`,
          },
        ],
      });
    });

    return code;
  }

  /**
   * Generate State class
   * @param {ComponentModel} component
   * @param {string} stateName
   * @returns {string}
   * @private
   */
  _generateStateClass(component, stateName) {
    const imports = [
      "import 'package:equatable/equatable.dart';",
      "import 'package:freezed_annotation/freezed_annotation.dart';",
    ];

    const stateProperties = component.state.map(stateVar => ({
      name: toCamelCase(stateVar.name),
      type: this._convertType(stateVar.type),
      defaultValue: stateVar.initialValue,
    }));

    // Using freezed for immutable states
    let code = this.formatter.formatFile({
      imports,
    });

    code += `
part '${toSnakeCase(component.feature || component.name)}_state.freezed.dart';

@freezed
class ${stateName} with _$${stateName} {
  const factory ${stateName}({
    @Default(false) bool isLoading,
    @Default('') String error,
`;

    stateProperties.forEach(prop => {
      const defaultVal = prop.defaultValue ? `@Default(${prop.defaultValue})` : '@Default(null)';
      code += `    ${defaultVal} ${prop.type}${prop.defaultValue ? '' : '?'} ${prop.name},\n`;
    });

    code += `  }) = _${stateName};

  const ${stateName}._();

  bool get hasError => error.isNotEmpty;
  bool get isIdle => !isLoading && error.isEmpty;
}
`;

    return code;
  }

  /**
   * Generate BLoC class
   * @param {ComponentModel} component
   * @param {string} blocName
   * @param {string} eventName
   * @param {string} stateName
   * @returns {string}
   * @private
   */
  _generateBlocClass(component, blocName, eventName, stateName) {
    const featureName = toSnakeCase(component.feature || component.name);

    const imports = [
      "import 'package:flutter_bloc/flutter_bloc.dart';",
      `import '${featureName}_event.dart';`,
      `import '${featureName}_state.dart';`,
    ];

    // Add repository import if has API endpoints
    if (component.apiEndpoints.length > 0) {
      imports.push(
        `import '../../domain/repositories/${featureName}_repository.dart';`
      );
    }

    const events = this._extractEvents(component);

    let code = this.formatter.formatFile({ imports });

    code += `
class ${blocName} extends Bloc<${eventName}, ${stateName}> {
`;

    // Add repository field if needed
    if (component.apiEndpoints.length > 0) {
      code += `  final ${toPascalCase(featureName)}Repository repository;\n\n`;
    }

    // Constructor
    code += `  ${blocName}(${component.apiEndpoints.length > 0 ? 'this.repository' : ''}) : super(const ${stateName}()) {\n`;

    // Register event handlers
    events.forEach(event => {
      code += `    on<${event.name}>(_on${event.name});\n`;
    });

    code += `  }\n\n`;

    // Generate event handlers
    events.forEach(event => {
      code += this._generateEventHandler(event, stateName, component);
      code += '\n';
    });

    code += '}\n';

    return code;
  }

  /**
   * Generate event handler method
   * @param {Object} event
   * @param {string} stateName
   * @param {ComponentModel} component
   * @returns {string}
   * @private
   */
  _generateEventHandler(event, stateName, component) {
    const params = [`${event.name} event`, `Emitter<${stateName}> emit`];

    let body = 'emit(state.copyWith(isLoading: true, error: \'\'));\n\n';

    body += 'try {\n';

    // Add API call if event corresponds to an endpoint
    if (event.apiEndpoint) {
      const endpoint = event.apiEndpoint;
      const methodName = this._getRepositoryMethodName(endpoint);

      body += `  final result = await repository.${methodName}(`;

      if (event.params.length > 0) {
        body += event.params.map(p => `event.${p.name}`).join(', ');
      }

      body += ');\n\n';

      body += '  emit(state.copyWith(\n';
      body += '    isLoading: false,\n';
      body += '    // TODO: Update state with result\n';
      body += '  ));\n';
    } else {
      body += '  // TODO: Implement event logic\n';
      body += '  emit(state.copyWith(isLoading: false));\n';
    }

    body += '} catch (error) {\n';
    body += '  emit(state.copyWith(\n';
    body += '    isLoading: false,\n';
    body += '    error: error.toString(),\n';
    body += '  ));\n';
    body += '}';

    return `  Future<void> _on${event.name}(\n    ${params.join(',\n    ')},\n  ) async {\n    ${body}\n  }`;
  }

  /**
   * Generate Cubit (for simple state)
   * @param {ComponentModel} component
   * @returns {Object}
   */
  generateCubit(component) {
    const featureName = component.feature || component.name;
    const cubitName = toCubitName(featureName);
    const stateName = toStateName(featureName);

    const files = [];

    // Generate state file (same as BLoC)
    files.push({
      fileName: `${toSnakeCase(featureName)}_state.dart`,
      code: this._generateStateClass(component, stateName),
    });

    // Generate cubit file
    files.push({
      fileName: `${toSnakeCase(featureName)}_cubit.dart`,
      code: this._generateCubitClass(component, cubitName, stateName),
    });

    logger.success(`Generated Cubit files for: ${featureName}`);

    return {
      type: 'cubit',
      files,
    };
  }

  /**
   * Generate Cubit class
   * @param {ComponentModel} component
   * @param {string} cubitName
   * @param {string} stateName
   * @returns {string}
   * @private
   */
  _generateCubitClass(component, cubitName, stateName) {
    const featureName = toSnakeCase(component.feature || component.name);

    const imports = [
      "import 'package:flutter_bloc/flutter_bloc.dart';",
      `import '${featureName}_state.dart';`,
    ];

    // Add repository import if has API endpoints
    if (component.apiEndpoints.length > 0) {
      imports.push(
        `import '../../domain/repositories/${featureName}_repository.dart';`
      );
    }

    let code = this.formatter.formatFile({ imports });

    code += `
class ${cubitName} extends Cubit<${stateName}> {
`;

    // Add repository field if needed
    if (component.apiEndpoints.length > 0) {
      code += `  final ${toPascalCase(featureName)}Repository repository;\n\n`;
    }

    // Constructor
    code += `  ${cubitName}(${component.apiEndpoints.length > 0 ? 'this.repository' : ''}) : super(const ${stateName}());\n\n`;

    // Generate methods for state changes
    component.methods.forEach(method => {
      if (this._isStateChangeMethod(method)) {
        code += this._generateCubitMethod(method, stateName, component);
        code += '\n';
      }
    });

    // Generate methods for API endpoints
    component.apiEndpoints.forEach(endpoint => {
      code += this._generateCubitApiMethod(endpoint, stateName);
      code += '\n';
    });

    code += '}\n';

    return code;
  }

  /**
   * Generate Cubit method
   * @param {Object} method
   * @param {string} stateName
   * @param {ComponentModel} component
   * @returns {string}
   * @private
   */
  _generateCubitMethod(method, stateName, component) {
    const methodName = toCamelCase(method.name);
    const params = method.params.map(p => `dynamic ${p}`).join(', ');

    let body = 'emit(state.copyWith(\n';
    body += '  // TODO: Update state\n';
    body += '));\n';

    return `  void ${methodName}(${params}) {\n    ${body}  }`;
  }

  /**
   * Generate Cubit method for API endpoint
   * @param {ApiEndpoint} endpoint
   * @param {string} stateName
   * @returns {string}
   * @private
   */
  _generateCubitApiMethod(endpoint, stateName) {
    const methodName = this._getRepositoryMethodName(endpoint);

    let body = 'emit(state.copyWith(isLoading: true, error: \'\'));\n\n';

    body += 'try {\n';
    body += `  final result = await repository.${methodName}();\n\n`;
    body += '  emit(state.copyWith(\n';
    body += '    isLoading: false,\n';
    body += '    // TODO: Update state with result\n';
    body += '  ));\n';
    body += '} catch (error) {\n';
    body += '  emit(state.copyWith(\n';
    body += '    isLoading: false,\n';
    body += '    error: error.toString(),\n';
    body += '  ));\n';
    body += '}';

    return `  Future<void> ${methodName}() async {\n    ${body}\n  }`;
  }

  /**
   * Extract events from component
   * @param {ComponentModel} component
   * @returns {Array}
   * @private
   */
  _extractEvents(component) {
    const events = [];

    // Generate events from API endpoints
    component.apiEndpoints.forEach(endpoint => {
      const eventName = this._getEventName(endpoint);

      events.push({
        name: eventName,
        params: this._getEventParams(endpoint),
        apiEndpoint: endpoint,
      });
    });

    // Generate events from methods that change state
    component.methods.forEach(method => {
      if (this._isStateChangeMethod(method)) {
        events.push({
          name: toPascalCase(method.name),
          params: method.params.map(p => ({ name: p, type: 'dynamic' })),
        });
      }
    });

    return events;
  }

  /**
   * Get event name from API endpoint
   * @param {ApiEndpoint} endpoint
   * @returns {string}
   * @private
   */
  _getEventName(endpoint) {
    const action = endpoint.method.toLowerCase();
    const resource = endpoint.path.split('/').filter(Boolean).pop() || 'Data';

    const actionMap = {
      get: 'Fetch',
      post: 'Create',
      put: 'Update',
      delete: 'Delete',
      patch: 'Update',
    };

    return `${actionMap[action] || 'Fetch'}${toPascalCase(resource)}`;
  }

  /**
   * Get event parameters from endpoint
   * @param {ApiEndpoint} endpoint
   * @returns {Array}
   * @private
   */
  _getEventParams(endpoint) {
    return endpoint.parameters.map(param => ({
      name: toCamelCase(param),
      type: 'String', // Could be refined based on type analysis
    }));
  }

  /**
   * Get repository method name from endpoint
   * @param {ApiEndpoint} endpoint
   * @returns {string}
   * @private
   */
  _getRepositoryMethodName(endpoint) {
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
   * Check if method changes state
   * @param {Object} method
   * @returns {boolean}
   * @private
   */
  _isStateChangeMethod(method) {
    const stateChangePrefixes = ['set', 'update', 'toggle', 'add', 'remove', 'reset'];
    return stateChangePrefixes.some(prefix => method.name.toLowerCase().startsWith(prefix));
  }

  /**
   * Convert type
   * @param {string} type
   * @returns {string}
   * @private
   */
  _convertType(type) {
    const typeMappings = {
      string: 'String',
      number: 'num',
      boolean: 'bool',
      any: 'dynamic',
      Array: 'List',
      object: 'Map<String, dynamic>',
    };

    return typeMappings[type] || 'dynamic';
  }
}

/**
 * Create a BLoC generator instance
 * @param {Object} options
 * @returns {BlocGenerator}
 */
function createBlocGenerator(options) {
  return new BlocGenerator(options);
}

module.exports = {
  BlocGenerator,
  createBlocGenerator,
};
