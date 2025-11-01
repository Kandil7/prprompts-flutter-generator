/**
 * WidgetGenerator.js
 * Converts React ComponentModel to Flutter WidgetModel
 *
 * Transforms React components into Flutter widgets with proper structure,
 * state management, and property mappings.
 */

const { WidgetModel, WidgetProperty, WidgetChild, WidgetImport, WidgetType } = require('../models/WidgetModel');
const { ComponentType } = require('../models/ComponentModel');
const { createModuleLogger } = require('../utils/logger');
const { mapWidget, mapProp, isStyleProp, isEventHandler, getChildProperty, getSpecialHandling } = require('./utils/widgetMapper');
const { toFlutterWidgetName, toFlutterPageName, toCamelCase, toPascalCase } = require('./utils/namingConventions');

const logger = createModuleLogger('WidgetGenerator');

/**
 * WidgetGenerator class
 * Converts ComponentModel to WidgetModel
 */
class WidgetGenerator {
  /**
   * @param {Object} options
   * @param {Object} [options.config] - Configuration object
   */
  constructor(options = {}) {
    this.config = options.config || {};
  }

  /**
   * Generate Flutter widget from React component
   * @param {ComponentModel} component - React component model
   * @returns {WidgetModel}
   */
  generate(component) {
    logger.info(`Generating Flutter widget for: ${component.name}`);

    try {
      // Determine widget type (StatelessWidget or StatefulWidget)
      const widgetType = this._determineWidgetType(component);

      // Determine widget name
      const widgetName = this._generateWidgetName(component);

      // Convert props to widget properties
      const properties = this._convertProps(component.props);

      // Add state variables as private fields (for StatefulWidget)
      if (widgetType === WidgetType.STATEFUL) {
        // State will be handled in the State class
      }

      // Generate imports
      const imports = this._generateImports(component);

      // Determine state management
      const stateManagement = component.recommendedFlutterStateManagement();

      // Generate widget model
      const widget = new WidgetModel({
        name: widgetName,
        type: widgetType,
        properties,
        imports,
        stateManagement,
        description: component.description,
        isResponsive: component.isResponsive,
        metadata: {
          sourceComponent: component.name,
          sourceFile: component.filePath,
          hasAsyncOps: component.hasAsyncOperations(),
          complexityScore: component.getComplexityScore(),
        },
      });

      logger.success(`Generated widget: ${widgetName} (${widgetType})`);

      return widget;

    } catch (error) {
      logger.error(`Failed to generate widget for ${component.name}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Determine if widget should be Stateless or Stateful
   * @param {ComponentModel} component
   * @returns {string}
   * @private
   */
  _determineWidgetType(component) {
    // Has state or lifecycle methods → StatefulWidget
    if (component.state.length > 0) {
      return WidgetType.STATEFUL;
    }

    // Has async operations (API calls) → StatefulWidget
    if (component.hasAsyncOperations()) {
      return WidgetType.STATEFUL;
    }

    // Has hooks that imply state (useState, useReducer, etc.)
    const statefulHooks = ['useState', 'useReducer', 'useEffect'];
    if (component.hooks.some(hook => statefulHooks.includes(hook))) {
      return WidgetType.STATEFUL;
    }

    // Default to StatelessWidget
    return WidgetType.STATELESS;
  }

  /**
   * Generate widget name from component
   * @param {ComponentModel} component
   * @returns {string}
   * @private
   */
  _generateWidgetName(component) {
    if (component.type === ComponentType.PAGE) {
      return toFlutterPageName(component.name);
    } else {
      return toFlutterWidgetName(component.name);
    }
  }

  /**
   * Convert React props to Flutter widget properties
   * @param {ComponentProp[]} props
   * @returns {WidgetProperty[]}
   * @private
   */
  _convertProps(props) {
    return props
      .filter(prop => !isStyleProp(prop.name)) // Style props handled separately
      .map(prop => {
        const flutterPropName = this._convertPropName(prop.name);
        const flutterType = this._convertPropType(prop.type);

        return new WidgetProperty({
          name: flutterPropName,
          type: flutterType,
          isRequired: prop.isRequired,
          isFinal: true, // Flutter widget properties are typically final
          defaultValue: this._convertDefaultValue(prop.defaultValue, flutterType),
          description: `Converted from React prop: ${prop.name}`,
        });
      });
  }

  /**
   * Convert React prop name to Flutter property name
   * @param {string} propName
   * @returns {string}
   * @private
   */
  _convertPropName(propName) {
    const mapped = mapProp(propName);
    if (mapped === null) {
      // Prop should be excluded
      return null;
    }
    return mapped || toCamelCase(propName);
  }

  /**
   * Convert React prop type to Dart type
   * @param {string} reactType
   * @returns {string}
   * @private
   */
  _convertPropType(reactType) {
    const typeMappings = this.config.getTypeMappings?.() || {
      string: 'String',
      number: 'num',
      boolean: 'bool',
      any: 'dynamic',
      void: 'void',
      null: 'Null',
      undefined: 'Null',
      Date: 'DateTime',
      Array: 'List',
      Map: 'Map',
      Promise: 'Future',
      function: 'VoidCallback',
    };

    // Handle array types
    if (reactType.endsWith('[]')) {
      const elementType = reactType.slice(0, -2);
      const dartElementType = this._convertPropType(elementType);
      return `List<${dartElementType}>`;
    }

    // Handle generic types (e.g., Array<string>)
    const genericMatch = reactType.match(/^(\w+)<(.+)>$/);
    if (genericMatch) {
      const [, container, inner] = genericMatch;
      const dartContainer = typeMappings[container] || container;
      const dartInner = this._convertPropType(inner);
      return `${dartContainer}<${dartInner}>`;
    }

    return typeMappings[reactType] || 'dynamic';
  }

  /**
   * Convert default value to Dart syntax
   * @param {string} defaultValue
   * @param {string} dartType
   * @returns {string|null}
   * @private
   */
  _convertDefaultValue(defaultValue, dartType) {
    if (!defaultValue) return null;

    // String values
    if (dartType === 'String') {
      return `'${defaultValue.replace(/'/g, "\\'")}'`;
    }

    // Boolean values
    if (dartType === 'bool') {
      return defaultValue === 'true' || defaultValue === true ? 'true' : 'false';
    }

    // Number values
    if (dartType === 'num' || dartType === 'int' || dartType === 'double') {
      return defaultValue.toString();
    }

    // Arrays
    if (defaultValue === '[]') {
      return 'const []';
    }

    // Objects
    if (defaultValue === '{}') {
      return 'const {}';
    }

    // Functions
    if (defaultValue === '() => {}') {
      return 'null';
    }

    return defaultValue;
  }

  /**
   * Generate imports for widget
   * @param {ComponentModel} component
   * @returns {WidgetImport[]}
   * @private
   */
  _generateImports(component) {
    const imports = [];

    // Always import material
    imports.push(new WidgetImport({
      package: 'flutter/material.dart',
    }));

    // Import for async operations
    if (component.hasAsyncOperations()) {
      imports.push(new WidgetImport({
        package: 'dart:async',
      }));
    }

    // Import for state management
    const stateManagement = component.recommendedFlutterStateManagement();
    if (stateManagement === 'bloc') {
      imports.push(new WidgetImport({
        package: 'flutter_bloc/flutter_bloc.dart',
      }));
    }

    return imports;
  }

  /**
   * Generate widget tree from JSX children
   * @param {Object} jsxElement - JSX element from React AST
   * @returns {WidgetChild}
   */
  generateWidgetTree(jsxElement) {
    // This would parse JSX and convert to Flutter widgets
    // For now, return a placeholder

    logger.debug('Generating widget tree from JSX');

    // Would use AST traversal to convert JSX to Flutter widgets
    // Map React components to Flutter widgets
    // Handle props, children, conditional rendering, lists, etc.

    return new WidgetChild({
      name: 'Container',
      type: 'Container',
      properties: {},
      children: [],
    });
  }

  /**
   * Convert conditional rendering (ternary) to Flutter
   * @param {Object} conditionalExpression
   * @returns {string}
   */
  convertConditionalRendering(conditionalExpression) {
    // condition ? Widget1() : Widget2()
    // Stays similar in Flutter

    const { test, consequent, alternate } = conditionalExpression;

    // Would generate Dart ternary or if/else
    return `${test} ? ${consequent} : ${alternate}`;
  }

  /**
   * Convert list rendering (.map) to ListView.builder
   * @param {Object} mapExpression
   * @returns {Object}
   */
  convertListRendering(mapExpression) {
    // items.map(item => <Widget key={item.id} {...item} />)
    // → ListView.builder(itemCount: items.length, itemBuilder: (context, index) => Widget(...))

    logger.debug('Converting list rendering to ListView.builder');

    return {
      widget: 'ListView.builder',
      properties: {
        itemCount: 'items.length',
        itemBuilder: '(context, index) { /* widget */ }',
      },
    };
  }

  /**
   * Convert event handlers to Flutter callbacks
   * @param {string} eventName
   * @param {string} handler
   * @returns {Object}
   */
  convertEventHandler(eventName, handler) {
    const flutterEventName = mapProp(eventName);

    // onClick → onTap
    // onChange → onChanged
    // etc.

    return {
      name: flutterEventName,
      handler: this._convertHandlerFunction(handler),
    };
  }

  /**
   * Convert React handler function to Dart
   * @param {string} handler
   * @returns {string}
   * @private
   */
  _convertHandlerFunction(handler) {
    // () => { } → () { }
    // (e) => { } → () { }  (event param often not needed in Flutter)

    return handler
      .replace(/=>/g, '')
      .replace(/function\s*\(/g, '(');
  }

  /**
   * Generate multiple widgets from multiple components
   * @param {ComponentModel[]} components
   * @returns {WidgetModel[]}
   */
  generateMultiple(components) {
    logger.info(`Generating ${components.length} Flutter widgets`);

    const widgets = [];

    for (const component of components) {
      try {
        const widget = this.generate(component);
        widgets.push(widget);
      } catch (error) {
        logger.error(`Skipping ${component.name}: ${error.message}`);
      }
    }

    logger.success(`Generated ${widgets.length}/${components.length} widgets`);

    return widgets;
  }
}

/**
 * Create a widget generator instance
 * @param {Object} options
 * @returns {WidgetGenerator}
 */
function createWidgetGenerator(options) {
  return new WidgetGenerator(options);
}

module.exports = {
  WidgetGenerator,
  createWidgetGenerator,
};
