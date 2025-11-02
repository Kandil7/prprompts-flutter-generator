/**
 * WidgetModel.js
 * Represents a Flutter widget with all its properties and metadata
 *
 * This model captures the complete structure of a Flutter widget
 * to facilitate code generation from React components.
 */

/**
 * Widget types supported
 * @enum {string}
 */
const WidgetType = {
  STATELESS: 'stateless',
  STATEFUL: 'stateful',
  INHERITED: 'inherited',
  PROVIDER: 'provider',
  CONSUMER: 'consumer',
};

/**
 * State management choices for Flutter
 * @enum {string}
 */
const StateManagementChoice = {
  BLOC: 'bloc',
  CUBIT: 'cubit',
  PROVIDER: 'provider',
  RIVERPOD: 'riverpod',
  GET_X: 'getx',
};

/**
 * Represents a widget property
 */
class WidgetProperty {
  /**
   * @param {Object} options
   * @param {string} options.name - Property name
   * @param {string} options.type - Property type (Dart type)
   * @param {boolean} [options.isRequired=false] - Whether the property is required
   * @param {boolean} [options.isFinal=true] - Whether the property is final
   * @param {string} [options.defaultValue] - Default value if any
   * @param {string} [options.description] - Property description
   */
  constructor({
    name,
    type,
    isRequired = false,
    isFinal = true,
    defaultValue = null,
    description = null,
  }) {
    this._validate({ name, type });

    this.name = name;
    this.type = type;
    this.isRequired = isRequired;
    this.isFinal = isFinal;
    this.defaultValue = defaultValue;
    this.description = description;
  }

  _validate({ name, type }) {
    if (!name || typeof name !== 'string') {
      throw new Error('WidgetProperty: name is required and must be a string');
    }
    if (!type || typeof type !== 'string') {
      throw new Error('WidgetProperty: type is required and must be a string');
    }
  }

  /**
   * Generate Dart property declaration
   * @returns {string}
   */
  toDartDeclaration() {
    const finalKeyword = this.isFinal ? 'final ' : '';
    const nullable = !this.isRequired ? '?' : '';
    return `${finalKeyword}${this.type}${nullable} ${this.name};`;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      isRequired: this.isRequired,
      isFinal: this.isFinal,
      defaultValue: this.defaultValue,
      description: this.description,
    };
  }

  static fromJSON(json) {
    return new WidgetProperty(json);
  }
}

/**
 * Represents a widget child/nested widget
 */
class WidgetChild {
  /**
   * @param {Object} options
   * @param {string} options.name - Child widget name
   * @param {string} options.type - Widget type
   * @param {Object} [options.properties={}] - Child properties
   * @param {WidgetChild[]} [options.children=[]] - Nested children
   */
  constructor({ name, type, properties = {}, children = [] }) {
    this._validate({ name, type });

    this.name = name;
    this.type = type;
    this.properties = properties;
    this.children = children.map(c => c instanceof WidgetChild ? c : new WidgetChild(c));
  }

  _validate({ name, type }) {
    if (!name || typeof name !== 'string') {
      throw new Error('WidgetChild: name is required and must be a string');
    }
    if (!type || typeof type !== 'string') {
      throw new Error('WidgetChild: type is required and must be a string');
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      properties: this.properties,
      children: this.children.map(c => c.toJSON()),
    };
  }

  static fromJSON(json) {
    return new WidgetChild(json);
  }
}

/**
 * Represents a Flutter import statement
 */
class WidgetImport {
  /**
   * @param {Object} options
   * @param {string} options.package - Package name
   * @param {string} [options.path] - Relative path (for local imports)
   * @param {string} [options.as] - Import alias
   * @param {string[]} [options.show=[]] - Specific symbols to show
   * @param {string[]} [options.hide=[]] - Specific symbols to hide
   */
  constructor({ package: packageName, path = null, as = null, show = [], hide = [] }) {
    this._validate({ packageName, path });

    this.package = packageName;
    this.path = path;
    this.as = as;
    this.show = show;
    this.hide = hide;
  }

  _validate({ packageName, path }) {
    if (!packageName && !path) {
      throw new Error('WidgetImport: either package or path is required');
    }
  }

  /**
   * Generate Dart import statement
   * @returns {string}
   */
  toDartImport() {
    let importPath;
    if (this.package) {
      // dart: imports don't need package: prefix
      if (this.package.startsWith('dart:')) {
        importPath = this.package;
      } else {
        importPath = `package:${this.package}`;
      }
    } else {
      importPath = this.path;
    }

    let statement = `import '${importPath}'`;

    if (this.as) {
      statement += ` as ${this.as}`;
    }

    if (this.show.length > 0) {
      statement += ` show ${this.show.join(', ')}`;
    }

    if (this.hide.length > 0) {
      statement += ` hide ${this.hide.join(', ')}`;
    }

    return `${statement};`;
  }

  toJSON() {
    return {
      package: this.package,
      path: this.path,
      as: this.as,
      show: this.show,
      hide: this.hide,
    };
  }

  static fromJSON(json) {
    return new WidgetImport(json);
  }
}

/**
 * Represents a Flutter widget
 */
class WidgetModel {
  /**
   * @param {Object} options
   * @param {string} options.name - Widget name
   * @param {string} options.type - Widget type (from WidgetType enum)
   * @param {WidgetProperty[]} [options.properties=[]] - Widget properties
   * @param {WidgetChild[]} [options.children=[]] - Child widgets
   * @param {WidgetImport[]} [options.imports=[]] - Import statements
   * @param {string} [options.stateManagement] - State management choice
   * @param {string} [options.filePath] - Target file path
   * @param {string} [options.package] - Package name
   * @param {string} [options.description] - Widget description
   * @param {Object} [options.lifecycle={}] - Lifecycle methods
   * @param {Object} [options.styling={}] - Styling information
   * @param {boolean} [options.isResponsive=false] - Whether widget is responsive
   * @param {Object} [options.metadata={}] - Additional metadata
   */
  constructor({
    name,
    type,
    properties = [],
    children = [],
    imports = [],
    stateManagement = null,
    filePath = null,
    package: packageName = null,
    description = null,
    lifecycle = {},
    styling = {},
    isResponsive = false,
    metadata = {},
  }) {
    this._validate({ name, type });

    this.name = name;
    this.type = type;
    this.properties = properties.map(p => p instanceof WidgetProperty ? p : new WidgetProperty(p));
    this.children = children.map(c => c instanceof WidgetChild ? c : new WidgetChild(c));
    this.imports = imports.map(i => i instanceof WidgetImport ? i : new WidgetImport(i));
    this.stateManagement = stateManagement;
    this.filePath = filePath;
    this.package = packageName;
    this.description = description;
    this.lifecycle = lifecycle;
    this.styling = styling;
    this.isResponsive = isResponsive;
    this.metadata = metadata;
  }

  _validate({ name, type }) {
    if (!name || typeof name !== 'string') {
      throw new Error('WidgetModel: name is required and must be a string');
    }
    if (!type || typeof type !== 'string') {
      throw new Error('WidgetModel: type is required and must be a string');
    }
    if (!Object.values(WidgetType).includes(type)) {
      throw new Error(`WidgetModel: type must be one of ${Object.values(WidgetType).join(', ')}`);
    }
  }

  /**
   * Get all required properties
   * @returns {WidgetProperty[]}
   */
  getRequiredProperties() {
    return this.properties.filter(p => p.isRequired);
  }

  /**
   * Get all optional properties
   * @returns {WidgetProperty[]}
   */
  getOptionalProperties() {
    return this.properties.filter(p => !p.isRequired);
  }

  /**
   * Check if widget needs state management
   * @returns {boolean}
   */
  needsStateManagement() {
    return this.type === WidgetType.STATEFUL || this.stateManagement !== null;
  }

  /**
   * Generate widget class name
   * @returns {string}
   */
  getClassName() {
    return this.name.endsWith('Widget') ? this.name : `${this.name}Widget`;
  }

  /**
   * Get file name (snake_case)
   * @returns {string}
   */
  getFileName() {
    return this.name
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '') + '.dart';
  }

  /**
   * Add an import
   * @param {WidgetImport|Object} importObj
   */
  addImport(importObj) {
    const widgetImport = importObj instanceof WidgetImport ? importObj : new WidgetImport(importObj);
    this.imports.push(widgetImport);
  }

  /**
   * Add a property
   * @param {WidgetProperty|Object} propertyObj
   */
  addProperty(propertyObj) {
    const property = propertyObj instanceof WidgetProperty ? propertyObj : new WidgetProperty(propertyObj);
    this.properties.push(property);
  }

  /**
   * Add a child widget
   * @param {WidgetChild|Object} childObj
   */
  addChild(childObj) {
    const child = childObj instanceof WidgetChild ? childObj : new WidgetChild(childObj);
    this.children.push(child);
  }

  /**
   * Generate basic widget structure (for preview)
   * @returns {string}
   */
  generateSkeletonCode() {
    const imports = this.imports.map(i => i.toDartImport()).join('\n');
    const properties = this.properties.map(p => `  ${p.toDartDeclaration()}`).join('\n');

    return `${imports}

class ${this.getClassName()} extends ${this.type === WidgetType.STATELESS ? 'StatelessWidget' : 'StatefulWidget'} {
${properties}

  const ${this.getClassName()}({
    Key? key,
${this.properties.map(p => `    ${p.isRequired ? 'required ' : ''}this.${p.name},`).join('\n')}
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // TODO: Implement widget build method
    return Container();
  }
}`;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      type: this.type,
      properties: this.properties.map(p => p.toJSON()),
      children: this.children.map(c => c.toJSON()),
      imports: this.imports.map(i => i.toJSON()),
      stateManagement: this.stateManagement,
      filePath: this.filePath,
      package: this.package,
      description: this.description,
      lifecycle: this.lifecycle,
      styling: this.styling,
      isResponsive: this.isResponsive,
      metadata: this.metadata,
    };
  }

  /**
   * Create from JSON
   * @param {Object} json
   * @returns {WidgetModel}
   */
  static fromJSON(json) {
    return new WidgetModel(json);
  }

  /**
   * Create a minimal widget for testing
   * @param {Object} overrides
   * @returns {WidgetModel}
   */
  static createMinimal(overrides = {}) {
    return new WidgetModel({
      name: 'TestWidget',
      type: WidgetType.STATELESS,
      ...overrides,
    });
  }
}

module.exports = {
  WidgetModel,
  WidgetProperty,
  WidgetChild,
  WidgetImport,
  WidgetType,
  StateManagementChoice,
};
