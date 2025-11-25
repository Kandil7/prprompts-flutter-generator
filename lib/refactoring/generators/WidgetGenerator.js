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
const styleConverter = require('./utils/styleConverter');

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

      // Store component context for tree generation
      this.currentComponent = component;

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
   * Generate widgets for multiple components
   * @param {ComponentModel[]} components
   * @returns {WidgetModel[]}
   */
  generateMultiple(components) {
    const widgets = [];
    for (const component of components) {
      try {
        widgets.push(this.generate(component));
      } catch (error) {
        logger.warn(`Skipping widget generation for ${component.name}: ${error.message}`);
      }
    }
    return widgets;
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

    // Import for forms
    if (component.forms && component.forms.usesForm) {
      imports.push(new WidgetImport({
        package: 'flutter_form_builder/flutter_form_builder.dart',
      }));
    }

    return imports;
  }

  /**
   * Generate widget tree from JSX children
   * @param {Object} jsxElement - JSX element from React AST
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild|WidgetChild[]|null}
   */
  generateWidgetTree(jsxElement, context = {}) {
    if (!jsxElement) return null;

    const t = require('@babel/types');

    logger.debug('Generating widget tree from JSX', { type: jsxElement.type });

    // Handle JSX Element
    if (t.isJSXElement(jsxElement)) {
      return this._handleJSXElement(jsxElement, context);
    }

    // Handle JSX Fragment
    if (t.isJSXFragment(jsxElement)) {
      return this._handleJSXFragment(jsxElement, context);
    }

    // Handle JSX Text
    if (t.isJSXText(jsxElement)) {
      return this._handleJSXText(jsxElement, context);
    }

    // Handle JSX Expression Container
    if (t.isJSXExpressionContainer(jsxElement)) {
      return this._handleJSXExpression(jsxElement.expression, context);
    }

    logger.warn('Unsupported JSX type', { type: jsxElement.type });
    return null;
  }

  /**
   * Handle JSX Element conversion
   * @param {Object} jsxElement - JSX element node
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild}
   * @private
   */
  _handleJSXElement(jsxElement, context) {
    const t = require('@babel/types');

    // Extract element name
    const elementName = this._getJSXElementName(jsxElement.openingElement.name);

    // Map to Flutter widget
    const flutterWidget = mapWidget(elementName);

    // Check for special handling (FlatList, etc.)
    const specialHandling = getSpecialHandling(elementName);

    if (specialHandling) {
      return this._handleSpecialWidget(jsxElement, elementName, specialHandling, context);
    }

    // Check for form handling
    if (elementName === 'form' || elementName === 'Form') {
      return this._handleFormWidget(jsxElement, context);
    }

    // Check for input handling (if inside form)
    if (elementName === 'input' || elementName === 'TextInput') {
      // Only map to FormBuilderTextField if the component uses forms
      if (this.currentComponent && this.currentComponent.forms && this.currentComponent.forms.usesForm) {
        return this._handleInputWidget(jsxElement, context);
      }
    }

    // Extract props
    const props = this._extractJSXProps(jsxElement.openingElement.attributes, context);

    // Extract children
    const children = this._extractJSXChildren(jsxElement.children, context);

    // Convert props to Flutter properties
    const flutterProperties = this._convertPropsToFlutter(props, flutterWidget, children.length > 0);

    // Create WidgetChild
    return new WidgetChild({
      name: flutterWidget,
      type: flutterWidget,
      properties: flutterProperties,
      children: children,
    });
  }

  /**
   * Handle Form widget
   * @private
   */
  _handleFormWidget(jsxElement, context) {
    const children = this._extractJSXChildren(jsxElement.children, context);

    return new WidgetChild({
      name: 'FormBuilder',
      type: 'FormBuilder',
      properties: {
        key: '_formKey',
        autovalidateMode: 'AutovalidateMode.onUserInteraction',
      },
      children: [
        new WidgetChild({
          name: 'Column',
          type: 'Column',
          properties: {
            children: children
          },
          children: []
        })
      ]
    });
  }

  /**
   * Handle Input widget
   * @private
   */
  _handleInputWidget(jsxElement, context) {
    const props = this._extractJSXProps(jsxElement.openingElement.attributes, context);
    const name = props.name || 'field';
    const label = props.label || props.placeholder || toPascalCase(name);

    return new WidgetChild({
      name: 'FormBuilderTextField',
      type: 'FormBuilderTextField',
      properties: {
        name: `'${name}'`,
        decoration: `InputDecoration(labelText: '${label}')`,
        validator: 'FormBuilderValidators.compose([FormBuilderValidators.required()])',
      },
      children: []
    });
  }

  /**
   * Handle JSX Fragment conversion
   * @param {Object} jsxFragment - JSX fragment node
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild[]}
   * @private
   */
  _handleJSXFragment(jsxFragment, context) {
    // Fragments don't render in Flutter, just return children directly
    return this._extractJSXChildren(jsxFragment.children, context);
  }

  /**
   * Handle JSX Text conversion
   * @param {Object} jsxText - JSX text node
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild|null}
   * @private
   */
  _handleJSXText(jsxText, context) {
    const text = jsxText.value.trim();
    if (!text) return null;

    return new WidgetChild({
      name: 'Text',
      type: 'Text',
      properties: {
        data: `'${text.replace(/'/g, "\\'")}'`
      },
      children: [],
    });
  }

  /**
   * Handle JSX Expression (conditionals, lists, variables)
   * @param {Object} expression - JSX expression node
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild|WidgetChild[]|null}
   * @private
   */
  _handleJSXExpression(expression, context) {
    const t = require('@babel/types');

    // Conditional expression: condition ? A : B
    if (t.isConditionalExpression(expression)) {
      return this._handleConditionalExpression(expression, context);
    }

    // Logical expression: condition && Widget
    if (t.isLogicalExpression(expression)) {
      return this._handleLogicalExpression(expression, context);
    }

    // Call expression: items.map(...)
    if (t.isCallExpression(expression)) {
      return this._handleCallExpression(expression, context);
    }

    // Identifier or member expression (variable reference)
    if (t.isIdentifier(expression) || t.isMemberExpression(expression)) {
      const varName = this._expressionToString(expression);
      logger.debug('Variable reference in JSX', { varName });

      // Return a placeholder widget with variable reference
      return new WidgetChild({
        name: 'Builder',
        type: 'Builder',
        properties: {
          builder: `(context) => ${varName}`,
        },
        children: [],
      });
    }

    logger.warn('Unsupported JSX expression', { type: expression.type });
    return null;
  }

  /**
   * Handle conditional expression (ternary)
   * @param {Object} expression - Conditional expression node
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild}
   * @private
   */
  _handleConditionalExpression(expression, context) {
    const condition = this._expressionToString(expression.test);
    const consequent = this.generateWidgetTree(expression.consequent, context);
    const alternate = this.generateWidgetTree(expression.alternate, context);

    // Create a Builder widget with conditional logic
    return new WidgetChild({
      name: 'Builder',
      type: 'Builder',
      properties: {
        builder: `(context) => ${condition} ? ${this._widgetToString(consequent)} : ${this._widgetToString(alternate)}`,
      },
      children: [],
    });
  }

  /**
   * Handle logical expression (condition && Widget)
   * @param {Object} expression - Logical expression node
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild}
   * @private
   */
  _handleLogicalExpression(expression, context) {
    const t = require('@babel/types');

    if (expression.operator === '&&') {
      const condition = this._expressionToString(expression.left);
      const widget = this.generateWidgetTree(expression.right, context);

      // if (condition) Widget() else SizedBox.shrink()
      return new WidgetChild({
        name: 'Builder',
        type: 'Builder',
        properties: {
          builder: `(context) => ${condition} ? ${this._widgetToString(widget)} : const SizedBox.shrink()`,
        },
        children: [],
      });
    }

    logger.warn('Unsupported logical operator', { operator: expression.operator });
    return null;
  }

  /**
   * Handle call expression (mainly .map for lists)
   * @param {Object} expression - Call expression node
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild}
   * @private
   */
  _handleCallExpression(expression, context) {
    const t = require('@babel/types');

    // Check if this is a .map() call
    if (t.isMemberExpression(expression.callee) &&
      t.isIdentifier(expression.callee.property) &&
      expression.callee.property.name === 'map') {

      const arrayName = this._expressionToString(expression.callee.object);
      const mapCallback = expression.arguments[0];

      if (t.isArrowFunctionExpression(mapCallback) || t.isFunctionExpression(mapCallback)) {
        const itemParam = mapCallback.params[0] ? mapCallback.params[0].name : 'item';
        const indexParam = mapCallback.params[1] ? mapCallback.params[1].name : 'index';

        // Extract the widget returned by map callback
        const mapBody = mapCallback.body;
        let itemWidget;

        if (t.isJSXElement(mapBody) || t.isJSXFragment(mapBody)) {
          itemWidget = this.generateWidgetTree(mapBody, { ...context, [itemParam]: 'dynamic' });
        } else if (t.isBlockStatement(mapBody)) {
          // Find return statement
          const returnStmt = mapBody.body.find(stmt => t.isReturnStatement(stmt));
          if (returnStmt && returnStmt.argument) {
            itemWidget = this.generateWidgetTree(returnStmt.argument, { ...context, [itemParam]: 'dynamic' });
          }
        }

        // Convert to ListView.builder
        return new WidgetChild({
          name: 'ListView.builder',
          type: 'ListView.builder',
          properties: {
            itemCount: `${arrayName}.length`,
            itemBuilder: `(context, ${indexParam}) { final ${itemParam} = ${arrayName}[${indexParam}]; return ${this._widgetToString(itemWidget)}; }`,
          },
          children: [],
        });
      }
    }

    logger.warn('Unsupported call expression', { type: expression.type });
    return null;
  }

  /**
   * Handle special widgets (FlatList, SectionList, etc.)
   * @param {Object} jsxElement - JSX element node
   * @param {string} elementName - React element name
   * @param {Object} specialHandling - Special handling config
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild}
   * @private
   */
  _handleSpecialWidget(jsxElement, elementName, specialHandling, context) {
    const props = this._extractJSXProps(jsxElement.openingElement.attributes, context);

    if (elementName === 'FlatList' || elementName === 'SectionList') {
      // FlatList/SectionList → ListView.builder
      const dataSource = props.data || '[]';
      const renderItem = props.renderItem || '({ item }) => Container()';

      return new WidgetChild({
        name: 'ListView.builder',
        type: 'ListView.builder',
        properties: {
          itemCount: `${dataSource}.length`,
          itemBuilder: `(context, index) { final item = ${dataSource}[index]; return ${renderItem}; }`,
        },
        children: [],
      });
    }

    return null;
  }

  /**
   * Get JSX element name from JSX identifier
   * @param {Object} jsxName - JSX identifier/member expression
   * @returns {string}
   * @private
   */
  _getJSXElementName(jsxName) {
    const t = require('@babel/types');

    if (t.isJSXIdentifier(jsxName)) {
      return jsxName.name;
    }

    if (t.isJSXMemberExpression(jsxName)) {
      // Handle namespaced components like React.Fragment
      return `${this._getJSXElementName(jsxName.object)}.${jsxName.property.name}`;
    }

    return 'Container';
  }

  /**
   * Extract props from JSX attributes
   * @param {Array} attributes - JSX attributes
   * @param {Object} context - Context for variable resolution
   * @returns {Object}
   * @private
   */
  _extractJSXProps(attributes, context) {
    const t = require('@babel/types');
    const props = {};

    for (const attr of attributes) {
      if (t.isJSXAttribute(attr)) {
        const propName = attr.name.name;
        let propValue;

        if (!attr.value) {
          // Boolean prop: <Button disabled />
          propValue = 'true';
        } else if (t.isStringLiteral(attr.value)) {
          // String prop: <Text title="Hello" />
          propValue = `'${attr.value.value}'`;
        } else if (t.isJSXExpressionContainer(attr.value)) {
          // Expression prop: <Button onPress={handlePress} />
          propValue = this._expressionToString(attr.value.expression);
        } else {
          propValue = 'null';
        }

        props[propName] = propValue;
      } else if (t.isJSXSpreadAttribute(attr)) {
        // Spread attributes: <Component {...props} />
        logger.debug('Spread attribute found (not fully supported)', {
          argument: this._expressionToString(attr.argument)
        });
      }
    }

    return props;
  }

  /**
   * Extract children from JSX
   * @param {Array} jsxChildren - JSX children nodes
   * @param {Object} context - Context for variable resolution
   * @returns {WidgetChild[]}
   * @private
   */
  _extractJSXChildren(jsxChildren, context) {
    const children = [];

    for (const child of jsxChildren) {
      const widget = this.generateWidgetTree(child, context);

      if (widget) {
        if (Array.isArray(widget)) {
          children.push(...widget);
        } else {
          children.push(widget);
        }
      }
    }

    return children;
  }

  /**
   * Convert React props to Flutter properties
   * @param {Object} props - React props
   * @param {string} flutterWidget - Flutter widget name
   * @param {boolean} hasChildren - Whether widget has children
   * @returns {Object}
   * @private
   */
  _convertPropsToFlutter(props, flutterWidget, hasChildren) {
    const flutterProps = {};

    for (const [propName, propValue] of Object.entries(props)) {
      // Skip style props (handled separately)
      if (isStyleProp(propName)) {
        const styleProps = this._convertStyleProp(propValue, flutterWidget);
        Object.assign(flutterProps, styleProps);
        continue;
      }

      // Map event handlers
      if (isEventHandler(propName)) {
        const mappedName = mapProp(propName);
        if (mappedName) {
          flutterProps[mappedName] = propValue;
        }
        continue;
      }

      // Map regular props
      const mappedPropName = mapProp(propName);

      if (mappedPropName === null) {
        // Prop should be excluded
        continue;
      }

      // Special handling for specific props
      if (propName === 'value' && flutterWidget === 'TextField') {
        // TextField value needs TextEditingController
        flutterProps['controller'] = `TextEditingController(text: ${propValue})`;
        continue;
      }

      if (propName === 'src' || propName === 'source') {
        // Image source conversion
        if (flutterWidget === 'Image') {
          flutterProps['image'] = this._convertImageSource(propValue);
          continue;
        }
      }

      flutterProps[mappedPropName || propName] = propValue;
    }

    return flutterProps;
  }

  /**
   * Convert style prop to Flutter properties
   * @param {string} styleValue - Style object string or expression
   * @param {string} widgetType - Flutter widget type for context
   * @returns {Object}
   * @private
   */
  _convertStyleProp(styleValue, widgetType = 'Container') {
    const flutterProps = {};

    try {
      // Handle object literal style: {backgroundColor: 'red', padding: 10}
      if (styleValue.trim().startsWith('{')) {
        // Parse the style object safely
        const styleObject = this._parseStyleObject(styleValue);

        if (styleObject) {
          // Use styleConverter to convert CSS/React styles to Flutter
          const convertedStyle = styleConverter.convertStyleObject(styleObject, widgetType);

          // Map converted properties to Flutter widget properties
          Object.assign(flutterProps, convertedStyle);

          logger.debug('Converted style object', {
            from: styleValue,
            to: Object.keys(convertedStyle)
          });
        }
      } else if (styleValue.includes('[') && styleValue.includes(',')) {
        // Handle array of styles: [styles.base, styles.active]
        logger.debug('Array style reference detected (requires manual review)', { styleValue });
        // For style arrays, we'd need to merge them - defer to developer
        flutterProps._styleComment = `// TODO: Convert style array: ${styleValue}`;
      } else {
        // Handle style reference: styles.container or this.props.style
        logger.debug('Style reference detected (requires manual review)', { styleValue });
        // For variable references, we can't statically convert
        flutterProps._styleComment = `// TODO: Convert style reference: ${styleValue}`;
      }
    } catch (error) {
      logger.warn('Failed to convert style prop', {
        styleValue,
        error: error.message
      });
      flutterProps._styleComment = `// TODO: Review style conversion: ${styleValue}`;
    }

    return flutterProps;
  }

  /**
   * Parse style object string into JavaScript object
   * @param {string} styleString - Style object as string
   * @returns {Object|null}
   * @private
   */
  _parseStyleObject(styleString) {
    try {
      // Remove outer braces and parse key-value pairs
      const cleaned = styleString.trim().replace(/^{/, '').replace(/}$/, '');

      if (!cleaned) return {};

      const styleObject = {};

      // Split by comma (but not inside strings or nested objects)
      const parts = this._smartSplit(cleaned, ',');

      for (const part of parts) {
        const colonIndex = part.indexOf(':');
        if (colonIndex === -1) continue;

        let key = part.substring(0, colonIndex).trim();
        let value = part.substring(colonIndex + 1).trim();

        // Remove quotes from property names (handles both 'border-radius' and "border-radius")
        if ((key.startsWith("'") && key.endsWith("'")) ||
          (key.startsWith('"') && key.endsWith('"'))) {
          key = key.slice(1, -1);
        }

        // Remove quotes from string values
        if ((value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }

        styleObject[key] = value;
      }

      return styleObject;
    } catch (error) {
      return null;
    }
  }

  /**
   * Smart split that ignores delimiters inside quotes or braces
   * @param {string} str
   * @param {string} delimiter
   * @returns {string[]}
   * @private
   */
  _smartSplit(str, delimiter) {
    const parts = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    let braceDepth = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (inQuote) {
        current += char;
        if (char === quoteChar && str[i - 1] !== '\\') {
          inQuote = false;
        }
      } else {
        if (char === "'" || char === '"') {
          inQuote = true;
          quoteChar = char;
          current += char;
        } else if (char === '{') {
          braceDepth++;
          current += char;
        } else if (char === '}') {
          braceDepth--;
          current += char;
        } else if (char === delimiter && braceDepth === 0) {
          parts.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  /**
   * Convert expression node to string
   * @param {Object} expression
   * @returns {string}
   * @private
   */
  _expressionToString(expression) {
    const t = require('@babel/types');

    if (t.isStringLiteral(expression)) return `'${expression.value}'`;
    if (t.isNumericLiteral(expression)) return String(expression.value);
    if (t.isBooleanLiteral(expression)) return String(expression.value);
    if (t.isIdentifier(expression)) return expression.name;

    if (t.isMemberExpression(expression)) {
      const object = this._expressionToString(expression.object);
      const property = expression.computed
        ? `[${this._expressionToString(expression.property)}]`
        : `.${expression.property.name}`;
      return `${object}${property}`;
    }

    if (t.isCallExpression(expression)) {
      const callee = this._expressionToString(expression.callee);
      const args = expression.arguments.map(arg => this._expressionToString(arg)).join(', ');
      return `${callee}(${args})`;
    }

    return '/* expression */';
  }

  /**
   * Convert widget child to string
   * @param {WidgetChild} widget
   * @returns {string}
   * @private
   */
  _widgetToString(widget) {
    if (!widget) return 'Container()';
    // This is a simplified representation, actual generation happens in CodeGenerator
    return `${widget.name}(...)`;
  }

  /**
   * Convert image source
   * @private
   */
  _convertImageSource(src) {
    if (src.startsWith("'http")) {
      return `NetworkImage(${src})`;
    }
    return `AssetImage(${src})`;
  }
}

/**
 * Create a WidgetGenerator instance
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
