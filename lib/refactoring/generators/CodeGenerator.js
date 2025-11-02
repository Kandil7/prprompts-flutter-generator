/**
 * CodeGenerator.js
 * Generates complete Dart code from WidgetModel and ComponentModel
 *
 * Produces properly formatted Flutter code with:
 * - Imports
 * - Class declaration (StatelessWidget or StatefulWidget)
 * - Constructor
 * - Build method
 * - State management
 * - Null safety
 */

const { WidgetType } = require('../models/WidgetModel');
const { createModuleLogger } = require('../utils/logger');
const { createFormatter } = require('./utils/dartFormatter');
const { toFileName, toPascalCase, toCamelCase, toPrivateVarName } = require('./utils/namingConventions');

const logger = createModuleLogger('CodeGenerator');

/**
 * CodeGenerator class
 */
class CodeGenerator {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.options = options;
    this.formatter = createFormatter(options.format);
  }

  /**
   * Generate complete Dart file code from WidgetModel
   * @param {WidgetModel} widget
   * @param {ComponentModel} component - Original React component for additional context
   * @returns {string}
   */
  generate(widget, component) {
    logger.info(`Generating Dart code for: ${widget.name}`);

    try {
      // Generate imports
      const imports = this._generateImports(widget);

      // Generate class(es)
      const classes = [];

      if (widget.type === WidgetType.STATELESS) {
        classes.push(this._generateStatelessWidget(widget, component));
      } else if (widget.type === WidgetType.STATEFUL) {
        classes.push(this._generateStatefulWidget(widget, component));
        classes.push(this._generateStateClass(widget, component));
      }

      // Format complete file
      const code = this.formatter.formatFile({
        imports,
        classes,
      });

      logger.success(`Generated ${code.split('\n').length} lines of Dart code`);

      return code;

    } catch (error) {
      logger.error(`Failed to generate code for ${widget.name}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate imports
   * @param {WidgetModel} widget
   * @returns {string[]}
   * @private
   */
  _generateImports(widget) {
    const imports = widget.imports.map(imp => imp.toDartImport());

    // Remove duplicates and return
    return [...new Set(imports)];
  }

  /**
   * Generate StatelessWidget class
   * @param {WidgetModel} widget
   * @param {ComponentModel} component
   * @returns {Object}
   * @private
   */
  _generateStatelessWidget(widget, component) {
    const className = widget.name;

    // Generate properties
    const properties = widget.properties.map(prop => prop.toDartDeclaration());

    // Generate constructor
    const constructor = this._generateConstructor(widget);

    // Generate build method
    const buildMethod = this._generateBuildMethod(widget, component);

    return {
      name: className,
      extends: 'StatelessWidget',
      properties,
      constructor,
      methods: [buildMethod],
    };
  }

  /**
   * Generate StatefulWidget class
   * @param {WidgetModel} widget
   * @param {ComponentModel} component
   * @returns {Object}
   * @private
   */
  _generateStatefulWidget(widget, component) {
    const className = widget.name;

    // Generate properties (final, immutable)
    const properties = widget.properties.map(prop => prop.toDartDeclaration());

    // Generate constructor
    const constructor = this._generateConstructor(widget);

    // Generate createState method
    const createStateMethod = {
      name: 'createState',
      returnType: `State<${className}>`,
      params: [],
      isAsync: false,
      isOverride: true,
      body: `return _${className}State();`,
    };

    return {
      name: className,
      extends: 'StatefulWidget',
      properties,
      constructor,
      methods: [createStateMethod],
    };
  }

  /**
   * Generate State class for StatefulWidget
   * @param {WidgetModel} widget
   * @param {ComponentModel} component
   * @returns {Object}
   * @private
   */
  _generateStateClass(widget, component) {
    const className = `_${widget.name}State`;

    // Generate state variables (mutable)
    const fields = component.state.map(stateVar => {
      const type = this._convertType(stateVar.type);
      const initialValue = stateVar.initialValue || this._getDefaultValue(type);
      return `${type} ${toCamelCase(stateVar.name)} = ${initialValue};`;
    });

    // Generate lifecycle methods
    const methods = [];

    // initState if needed
    if (this._needsInitState(component)) {
      methods.push(this._generateInitState(component));
    }

    // dispose if needed
    if (this._needsDispose(component)) {
      methods.push(this._generateDispose(component));
    }

    // Build method
    methods.push(this._generateBuildMethod(widget, component));

    // Generate methods from component
    component.methods.forEach(method => {
      methods.push(this._generateMethod(method, component));
    });

    return {
      name: className,
      extends: `State<${widget.name}>`,
      fields,
      methods,
    };
  }

  /**
   * Generate constructor
   * @param {WidgetModel} widget
   * @returns {Object}
   * @private
   */
  _generateConstructor(widget) {
    const params = [];

    // Add key parameter (always first)
    params.push('Key? key');

    // Add required properties
    widget.getRequiredProperties().forEach(prop => {
      params.push(`required this.${prop.name}`);
    });

    // Add optional properties
    widget.getOptionalProperties().forEach(prop => {
      if (prop.defaultValue) {
        params.push(`this.${prop.name} = ${prop.defaultValue}`);
      } else {
        params.push(`this.${prop.name}`);
      }
    });

    return {
      name: widget.name,
      isConst: true,
      params,
      superParams: ['key'],
    };
  }

  /**
   * Generate build method
   * @param {WidgetModel} widget
   * @param {ComponentModel} component
   * @returns {Object}
   * @private
   */
  _generateBuildMethod(widget, component) {
    const body = this._generateBuildMethodBody(widget, component);

    return {
      name: 'build',
      returnType: 'Widget',
      params: ['BuildContext context'],
      isAsync: false,
      isOverride: true,
      body,
    };
  }

  /**
   * Generate build method body
   * @param {WidgetModel} widget
   * @param {ComponentModel} component
   * @returns {string}
   * @private
   */
  _generateBuildMethodBody(widget, component) {
    // For now, generate a simple Container
    // In a full implementation, would parse JSX and convert to Flutter widgets

    if (widget.children.length > 0) {
      // Generate widget tree from children
      return this._generateWidgetTree(widget.children[0]);
    }

    // Default placeholder
    return `return Scaffold(
  appBar: AppBar(
    title: const Text('${widget.name}'),
  ),
  body: Center(
    child: const Text('${widget.name}'),
  ),
);`;
  }

  /**
   * Generate widget tree from WidgetChild
   * @param {WidgetChild} child
   * @param {number} indentLevel
   * @returns {string}
   * @private
   */
  _generateWidgetTree(child, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    let code = `${indent}return ${child.type}(\n`;

    // Add properties
    Object.entries(child.properties).forEach(([key, value]) => {
      code += `${indent}  ${key}: ${value},\n`;
    });

    // Add children
    if (child.children.length > 0) {
      if (child.children.length === 1) {
        code += `${indent}  child: `;
        code += this._generateWidgetTree(child.children[0], indentLevel + 2);
        code += ',\n';
      } else {
        code += `${indent}  children: [\n`;
        child.children.forEach(grandChild => {
          code += this._generateWidgetTree(grandChild, indentLevel + 3);
          code += ',\n';
        });
        code += `${indent}  ],\n`;
      }
    }

    code += `${indent})`;

    return code;
  }

  /**
   * Check if initState is needed
   * @param {ComponentModel} component
   * @returns {boolean}
   * @private
   */
  _needsInitState(component) {
    // Need initState if:
    // - Has API calls
    // - Has useEffect with empty dependency array
    // - Has componentDidMount equivalent

    return component.hasAsyncOperations() ||
           component.hooks.includes('useEffect');
  }

  /**
   * Generate initState method
   * @param {ComponentModel} component
   * @returns {Object}
   * @private
   */
  _generateInitState(component) {
    let body = 'super.initState();\n';

    // Add initialization code
    if (component.apiEndpoints.length > 0) {
      body += '// TODO: Initialize data\n';
      body += '// _loadData();\n';
    }

    return {
      name: 'initState',
      returnType: 'void',
      params: [],
      isAsync: false,
      isOverride: true,
      body,
    };
  }

  /**
   * Check if dispose is needed
   * @param {ComponentModel} component
   * @returns {boolean}
   * @private
   */
  _needsDispose(component) {
    // Need dispose if has controllers, subscriptions, etc.
    return component.state.some(s => s.type === 'controller') ||
           component.hooks.includes('useEffect');
  }

  /**
   * Generate dispose method
   * @param {ComponentModel} component
   * @returns {Object}
   * @private
   */
  _generateDispose(component) {
    let body = '';

    // Add cleanup code
    component.state.forEach(stateVar => {
      if (stateVar.type.includes('Controller')) {
        body += `${toCamelCase(stateVar.name)}.dispose();\n`;
      }
    });

    body += 'super.dispose();';

    return {
      name: 'dispose',
      returnType: 'void',
      params: [],
      isAsync: false,
      isOverride: true,
      body,
    };
  }

  /**
   * Generate method from component method
   * @param {Object} method
   * @param {ComponentModel} component
   * @returns {Object}
   * @private
   */
  _generateMethod(method, component) {
    const methodName = toCamelCase(method.name);
    const params = method.params.map(p => `dynamic ${p}`);
    const isAsync = method.isAsync;

    let body = '// TODO: Implement method\n';

    // Check if this is an event handler
    if (methodName.startsWith('handle') || methodName.startsWith('on')) {
      body += '// Event handler\n';

      // If method updates state, add setState call
      body += 'setState(() {\n';
      body += '  // Update state\n';
      body += '});\n';
    }

    return {
      name: methodName,
      returnType: isAsync ? 'Future<void>' : 'void',
      params,
      isAsync,
      isOverride: false,
      body,
    };
  }

  /**
   * Convert React/TypeScript type to Dart type
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
      void: 'void',
      null: 'Null',
      Array: 'List',
      object: 'Map<String, dynamic>',
      Date: 'DateTime',
      Promise: 'Future',
      function: 'Function',
    };

    return typeMappings[type] || 'dynamic';
  }

  /**
   * Get default value for type
   * @param {string} dartType
   * @returns {string}
   * @private
   */
  _getDefaultValue(dartType) {
    const defaults = {
      String: "''",
      num: '0',
      int: '0',
      double: '0.0',
      bool: 'false',
      List: 'const []',
      Map: 'const {}',
      Set: 'const {}',
    };

    return defaults[dartType] || 'null';
  }

  /**
   * Generate file name for widget
   * @param {WidgetModel} widget
   * @returns {string}
   */
  getFileName(widget) {
    return toFileName(widget.name);
  }

  /**
   * Generate multiple files
   * @param {Array} widgetsAndComponents - Array of {widget, component} pairs
   * @returns {Object[]} Array of {fileName, code} objects
   */
  generateMultiple(widgetsAndComponents) {
    logger.info(`Generating code for ${widgetsAndComponents.length} widgets`);

    return widgetsAndComponents.map(({ widget, component }) => {
      const code = this.generate(widget, component);
      const fileName = this.getFileName(widget);

      return { fileName, code };
    });
  }
}

/**
 * Create a code generator instance
 * @param {Object} options
 * @returns {CodeGenerator}
 */
function createCodeGenerator(options) {
  return new CodeGenerator(options);
}

module.exports = {
  CodeGenerator,
  createCodeGenerator,
};
