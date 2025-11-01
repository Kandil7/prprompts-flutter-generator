/**
 * ConversionContext.js
 * Maintains the state and context during React to Flutter conversion
 *
 * This context tracks all mappings, errors, warnings, and metadata
 * accumulated during the conversion process.
 */

const { ComponentModel } = require('./ComponentModel');
const { WidgetModel } = require('./WidgetModel');

/**
 * Conversion status
 * @enum {string}
 */
const ConversionStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PARTIAL: 'partial',
};

/**
 * Conversion phase
 * @enum {string}
 */
const ConversionPhase = {
  PARSING: 'parsing',
  MAPPING: 'mapping',
  GENERATION: 'generation',
  VALIDATION: 'validation',
  OUTPUT: 'output',
};

/**
 * Represents a conversion mapping between React and Flutter
 */
class ConversionMapping {
  /**
   * @param {Object} options
   * @param {string} options.reactElement - React element/component name
   * @param {string} options.flutterWidget - Flutter widget name
   * @param {Object} [options.propMapping={}] - Property name mappings
   * @param {string} [options.notes] - Additional notes
   */
  constructor({ reactElement, flutterWidget, propMapping = {}, notes = null }) {
    this._validate({ reactElement, flutterWidget });

    this.reactElement = reactElement;
    this.flutterWidget = flutterWidget;
    this.propMapping = propMapping;
    this.notes = notes;
  }

  _validate({ reactElement, flutterWidget }) {
    if (!reactElement || typeof reactElement !== 'string') {
      throw new Error('ConversionMapping: reactElement is required and must be a string');
    }
    if (!flutterWidget || typeof flutterWidget !== 'string') {
      throw new Error('ConversionMapping: flutterWidget is required and must be a string');
    }
  }

  toJSON() {
    return {
      reactElement: this.reactElement,
      flutterWidget: this.flutterWidget,
      propMapping: this.propMapping,
      notes: this.notes,
    };
  }

  static fromJSON(json) {
    return new ConversionMapping(json);
  }
}

/**
 * Represents a conversion error or warning
 */
class ConversionIssue {
  /**
   * @param {Object} options
   * @param {string} options.type - 'error' or 'warning'
   * @param {string} options.message - Issue message
   * @param {string} [options.phase] - Conversion phase where issue occurred
   * @param {string} [options.component] - Component/widget name
   * @param {string} [options.filePath] - File path where issue occurred
   * @param {number} [options.line] - Line number
   * @param {Object} [options.context={}] - Additional context
   */
  constructor({
    type,
    message,
    phase = null,
    component = null,
    filePath = null,
    line = null,
    context = {},
  }) {
    this._validate({ type, message });

    this.type = type;
    this.message = message;
    this.phase = phase;
    this.component = component;
    this.filePath = filePath;
    this.line = line;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  _validate({ type, message }) {
    if (!type || !['error', 'warning'].includes(type)) {
      throw new Error('ConversionIssue: type must be "error" or "warning"');
    }
    if (!message || typeof message !== 'string') {
      throw new Error('ConversionIssue: message is required and must be a string');
    }
  }

  toString() {
    let str = `[${this.type.toUpperCase()}]`;
    if (this.phase) str += ` [${this.phase}]`;
    if (this.component) str += ` ${this.component}`;
    if (this.filePath) str += ` (${this.filePath}${this.line ? `:${this.line}` : ''})`;
    str += `: ${this.message}`;
    return str;
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      phase: this.phase,
      component: this.component,
      filePath: this.filePath,
      line: this.line,
      context: this.context,
      timestamp: this.timestamp,
    };
  }

  static fromJSON(json) {
    const issue = new ConversionIssue(json);
    issue.timestamp = json.timestamp;
    return issue;
  }
}

/**
 * Main conversion context that tracks the entire conversion process
 */
class ConversionContext {
  /**
   * @param {Object} options
   * @param {string} [options.projectName] - Project name
   * @param {string} [options.sourceRoot] - React source root directory
   * @param {string} [options.targetRoot] - Flutter target root directory
   */
  constructor({ projectName = null, sourceRoot = null, targetRoot = null } = {}) {
    this.projectName = projectName;
    this.sourceRoot = sourceRoot;
    this.targetRoot = targetRoot;

    // Conversion state
    this.status = ConversionStatus.NOT_STARTED;
    this.currentPhase = null;
    this.startTime = null;
    this.endTime = null;

    // Components and widgets
    this.components = new Map(); // Map<string, ComponentModel>
    this.widgets = new Map(); // Map<string, WidgetModel>

    // Mappings
    this.elementMappings = new Map(); // Map<string, ConversionMapping>
    this.typeMappings = new Map(); // Map<string, string> - Type conversions
    this.packageMappings = new Map(); // Map<string, string> - Package/import conversions

    // Issues
    this.errors = [];
    this.warnings = [];

    // Metadata
    this.metadata = {
      reactVersion: null,
      flutterVersion: null,
      dependencies: {},
      statistics: {
        totalComponents: 0,
        convertedComponents: 0,
        failedComponents: 0,
        totalFiles: 0,
        generatedFiles: 0,
      },
    };

    // Options
    this.options = {
      preserveComments: true,
      generateTests: true,
      useNullSafety: true,
      stateManagementDefault: 'bloc',
    };
  }

  /**
   * Start conversion process
   * @param {string} phase - Starting phase
   */
  start(phase = ConversionPhase.PARSING) {
    this.status = ConversionStatus.IN_PROGRESS;
    this.currentPhase = phase;
    this.startTime = new Date().toISOString();
  }

  /**
   * Complete conversion process
   * @param {boolean} [success=true] - Whether conversion was successful
   */
  complete(success = true) {
    this.status = success ? ConversionStatus.COMPLETED : ConversionStatus.FAILED;
    this.currentPhase = null;
    this.endTime = new Date().toISOString();
  }

  /**
   * Set current conversion phase
   * @param {string} phase
   */
  setPhase(phase) {
    if (!Object.values(ConversionPhase).includes(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }
    this.currentPhase = phase;
  }

  /**
   * Add a React component
   * @param {ComponentModel} component
   */
  addComponent(component) {
    if (!(component instanceof ComponentModel)) {
      throw new Error('ConversionContext: component must be an instance of ComponentModel');
    }
    this.components.set(component.name, component);
    this.metadata.statistics.totalComponents++;
  }

  /**
   * Get a component by name
   * @param {string} name
   * @returns {ComponentModel|undefined}
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * Add a Flutter widget
   * @param {WidgetModel} widget
   */
  addWidget(widget) {
    if (!(widget instanceof WidgetModel)) {
      throw new Error('ConversionContext: widget must be an instance of WidgetModel');
    }
    this.widgets.set(widget.name, widget);
    this.metadata.statistics.convertedComponents++;
  }

  /**
   * Get a widget by name
   * @param {string} name
   * @returns {WidgetModel|undefined}
   */
  getWidget(name) {
    return this.widgets.get(name);
  }

  /**
   * Add an element mapping
   * @param {ConversionMapping|Object} mapping
   */
  addMapping(mapping) {
    const conversionMapping = mapping instanceof ConversionMapping ?
      mapping : new ConversionMapping(mapping);
    this.elementMappings.set(conversionMapping.reactElement, conversionMapping);
  }

  /**
   * Get Flutter widget for React element
   * @param {string} reactElement
   * @returns {string|null}
   */
  getFlutterWidget(reactElement) {
    const mapping = this.elementMappings.get(reactElement);
    return mapping ? mapping.flutterWidget : null;
  }

  /**
   * Add a type mapping
   * @param {string} reactType - React/TypeScript type
   * @param {string} dartType - Dart type
   */
  addTypeMapping(reactType, dartType) {
    this.typeMappings.set(reactType, dartType);
  }

  /**
   * Get Dart type for React type
   * @param {string} reactType
   * @returns {string|null}
   */
  getDartType(reactType) {
    return this.typeMappings.get(reactType) || null;
  }

  /**
   * Add a package mapping
   * @param {string} reactPackage - React package name
   * @param {string} dartPackage - Dart package name
   */
  addPackageMapping(reactPackage, dartPackage) {
    this.packageMappings.set(reactPackage, dartPackage);
  }

  /**
   * Get Dart package for React package
   * @param {string} reactPackage
   * @returns {string|null}
   */
  getDartPackage(reactPackage) {
    return this.packageMappings.get(reactPackage) || null;
  }

  /**
   * Add an error
   * @param {ConversionIssue|Object} error
   */
  addError(error) {
    const issue = error instanceof ConversionIssue ?
      error : new ConversionIssue({ type: 'error', ...error });
    this.errors.push(issue);
  }

  /**
   * Add a warning
   * @param {ConversionIssue|Object} warning
   */
  addWarning(warning) {
    const issue = warning instanceof ConversionIssue ?
      warning : new ConversionIssue({ type: 'warning', ...warning });
    this.warnings.push(issue);
  }

  /**
   * Check if conversion has errors
   * @returns {boolean}
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Check if conversion has warnings
   * @returns {boolean}
   */
  hasWarnings() {
    return this.warnings.length > 0;
  }

  /**
   * Get all issues (errors + warnings)
   * @returns {ConversionIssue[]}
   */
  getAllIssues() {
    return [...this.errors, ...this.warnings];
  }

  /**
   * Get issues by phase
   * @param {string} phase
   * @returns {ConversionIssue[]}
   */
  getIssuesByPhase(phase) {
    return this.getAllIssues().filter(issue => issue.phase === phase);
  }

  /**
   * Get issues by component
   * @param {string} component
   * @returns {ConversionIssue[]}
   */
  getIssuesByComponent(component) {
    return this.getAllIssues().filter(issue => issue.component === component);
  }

  /**
   * Calculate conversion duration in seconds
   * @returns {number|null}
   */
  getDuration() {
    if (!this.startTime) return null;
    const end = this.endTime ? new Date(this.endTime) : new Date();
    const start = new Date(this.startTime);
    return (end - start) / 1000;
  }

  /**
   * Get conversion statistics
   * @returns {Object}
   */
  getStatistics() {
    return {
      ...this.metadata.statistics,
      duration: this.getDuration(),
      successRate: this.metadata.statistics.totalComponents > 0 ?
        (this.metadata.statistics.convertedComponents / this.metadata.statistics.totalComponents * 100).toFixed(2) + '%' : 'N/A',
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
    };
  }

  /**
   * Generate conversion summary
   * @returns {string}
   */
  getSummary() {
    const stats = this.getStatistics();
    return `Conversion Summary:
  Status: ${this.status}
  Duration: ${stats.duration ? stats.duration.toFixed(2) + 's' : 'N/A'}
  Components: ${stats.convertedComponents}/${stats.totalComponents} (${stats.successRate})
  Errors: ${stats.errorCount}
  Warnings: ${stats.warningCount}`;
  }

  /**
   * Initialize default mappings
   */
  initializeDefaultMappings() {
    // Common React to Flutter widget mappings
    const defaultMappings = [
      { reactElement: 'View', flutterWidget: 'Container' },
      { reactElement: 'Text', flutterWidget: 'Text' },
      { reactElement: 'Image', flutterWidget: 'Image' },
      { reactElement: 'TouchableOpacity', flutterWidget: 'InkWell' },
      { reactElement: 'ScrollView', flutterWidget: 'SingleChildScrollView' },
      { reactElement: 'FlatList', flutterWidget: 'ListView' },
      { reactElement: 'TextInput', flutterWidget: 'TextField' },
      { reactElement: 'Button', flutterWidget: 'ElevatedButton' },
      { reactElement: 'Modal', flutterWidget: 'Dialog' },
      { reactElement: 'SafeAreaView', flutterWidget: 'SafeArea' },
    ];

    defaultMappings.forEach(mapping => this.addMapping(mapping));

    // Common type mappings
    this.addTypeMapping('string', 'String');
    this.addTypeMapping('number', 'num');
    this.addTypeMapping('boolean', 'bool');
    this.addTypeMapping('any', 'dynamic');
    this.addTypeMapping('void', 'void');
    this.addTypeMapping('null', 'Null');
    this.addTypeMapping('undefined', 'Null');
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      projectName: this.projectName,
      sourceRoot: this.sourceRoot,
      targetRoot: this.targetRoot,
      status: this.status,
      currentPhase: this.currentPhase,
      startTime: this.startTime,
      endTime: this.endTime,
      components: Array.from(this.components.entries()).map(([name, component]) => ({
        name,
        component: component.toJSON(),
      })),
      widgets: Array.from(this.widgets.entries()).map(([name, widget]) => ({
        name,
        widget: widget.toJSON(),
      })),
      elementMappings: Array.from(this.elementMappings.entries()).map(([name, mapping]) => ({
        name,
        mapping: mapping.toJSON(),
      })),
      typeMappings: Array.from(this.typeMappings.entries()),
      packageMappings: Array.from(this.packageMappings.entries()),
      errors: this.errors.map(e => e.toJSON()),
      warnings: this.warnings.map(w => w.toJSON()),
      metadata: this.metadata,
      options: this.options,
    };
  }

  /**
   * Create from JSON
   * @param {Object} json
   * @returns {ConversionContext}
   */
  static fromJSON(json) {
    const context = new ConversionContext({
      projectName: json.projectName,
      sourceRoot: json.sourceRoot,
      targetRoot: json.targetRoot,
    });

    context.status = json.status;
    context.currentPhase = json.currentPhase;
    context.startTime = json.startTime;
    context.endTime = json.endTime;

    // Restore components
    json.components?.forEach(({ name, component }) => {
      context.components.set(name, ComponentModel.fromJSON(component));
    });

    // Restore widgets
    json.widgets?.forEach(({ name, widget }) => {
      context.widgets.set(name, WidgetModel.fromJSON(widget));
    });

    // Restore mappings
    json.elementMappings?.forEach(({ name, mapping }) => {
      context.elementMappings.set(name, ConversionMapping.fromJSON(mapping));
    });

    json.typeMappings?.forEach(([reactType, dartType]) => {
      context.typeMappings.set(reactType, dartType);
    });

    json.packageMappings?.forEach(([reactPackage, dartPackage]) => {
      context.packageMappings.set(reactPackage, dartPackage);
    });

    // Restore issues
    json.errors?.forEach(error => {
      context.errors.push(ConversionIssue.fromJSON(error));
    });

    json.warnings?.forEach(warning => {
      context.warnings.push(ConversionIssue.fromJSON(warning));
    });

    context.metadata = json.metadata || context.metadata;
    context.options = json.options || context.options;

    return context;
  }
}

module.exports = {
  ConversionContext,
  ConversionMapping,
  ConversionIssue,
  ConversionStatus,
  ConversionPhase,
};
