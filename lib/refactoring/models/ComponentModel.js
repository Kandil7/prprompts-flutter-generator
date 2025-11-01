/**
 * ComponentModel.js
 * Represents a parsed React component with all its properties and metadata
 *
 * This model captures the complete structure of a React/React Native component
 * to facilitate conversion to Flutter widgets.
 */

/**
 * Component types supported
 * @enum {string}
 */
const ComponentType = {
  PAGE: 'page',
  WIDGET: 'widget',
  HOOK: 'hook',
  CONTEXT: 'context',
  HOC: 'hoc', // Higher-Order Component
};

/**
 * State management patterns
 * @enum {string}
 */
const StateManagementPattern = {
  REDUX: 'redux',
  ZUSTAND: 'zustand',
  CONTEXT: 'context',
  USE_STATE: 'useState',
  MOBX: 'mobx',
  RECOIL: 'recoil',
};

/**
 * Represents a component property/prop
 */
class ComponentProp {
  /**
   * @param {Object} options
   * @param {string} options.name - Property name
   * @param {string} options.type - Property type
   * @param {boolean} [options.isRequired=false] - Whether the prop is required
   * @param {string} [options.defaultValue] - Default value if any
   */
  constructor({ name, type, isRequired = false, defaultValue = null }) {
    this._validate({ name, type });

    this.name = name;
    this.type = type;
    this.isRequired = isRequired;
    this.defaultValue = defaultValue;
  }

  _validate({ name, type }) {
    if (!name || typeof name !== 'string') {
      throw new Error('ComponentProp: name is required and must be a string');
    }
    if (!type || typeof type !== 'string') {
      throw new Error('ComponentProp: type is required and must be a string');
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      isRequired: this.isRequired,
      defaultValue: this.defaultValue,
    };
  }

  static fromJSON(json) {
    return new ComponentProp(json);
  }
}

/**
 * Represents a state variable
 */
class StateVariable {
  /**
   * @param {Object} options
   * @param {string} options.name - Variable name
   * @param {string} options.type - Variable type
   * @param {string} [options.initialValue] - Initial value
   */
  constructor({ name, type, initialValue = null }) {
    this._validate({ name, type });

    this.name = name;
    this.type = type;
    this.initialValue = initialValue;
  }

  _validate({ name, type }) {
    if (!name || typeof name !== 'string') {
      throw new Error('StateVariable: name is required and must be a string');
    }
    if (!type || typeof type !== 'string') {
      throw new Error('StateVariable: type is required and must be a string');
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      initialValue: this.initialValue,
    };
  }

  static fromJSON(json) {
    return new StateVariable(json);
  }
}

/**
 * Represents an API endpoint
 */
class ApiEndpoint {
  /**
   * @param {Object} options
   * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {string} options.path - API endpoint path
   * @param {string} [options.description] - Endpoint description
   * @param {string[]} [options.parameters=[]] - Parameters used
   */
  constructor({ method, path, description = null, parameters = [] }) {
    this._validate({ method, path });

    this.method = method.toUpperCase();
    this.path = path;
    this.description = description;
    this.parameters = parameters;
  }

  _validate({ method, path }) {
    if (!method || typeof method !== 'string') {
      throw new Error('ApiEndpoint: method is required and must be a string');
    }
    if (!path || typeof path !== 'string') {
      throw new Error('ApiEndpoint: path is required and must be a string');
    }

    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(method.toUpperCase())) {
      throw new Error(`ApiEndpoint: method must be one of ${validMethods.join(', ')}`);
    }
  }

  toJSON() {
    return {
      method: this.method,
      path: this.path,
      description: this.description,
      parameters: this.parameters,
    };
  }

  static fromJSON(json) {
    return new ApiEndpoint(json);
  }
}

/**
 * Represents a parsed React component
 */
class ComponentModel {
  /**
   * @param {Object} options
   * @param {string} options.filePath - Component file path
   * @param {string} options.name - Component name
   * @param {string} options.type - Component type (from ComponentType enum)
   * @param {ComponentProp[]} [options.props=[]] - Component props
   * @param {StateVariable[]} [options.state=[]] - State variables
   * @param {string[]} [options.hooks=[]] - React hooks used
   * @param {Object[]} [options.methods=[]] - Component methods
   * @param {string[]} [options.children=[]] - Child components
   * @param {Object[]} [options.imports=[]] - Import statements
   * @param {Object[]} [options.exports=[]] - Export statements
   * @param {Object} [options.styling={}] - Styling information
   * @param {string} [options.stateManagement] - State management pattern
   * @param {string} [options.feature] - Feature category
   * @param {string[]} [options.apiEndpoints=[]] - API endpoints used
   * @param {boolean} [options.isResponsive=false] - Whether component is responsive
   * @param {string} [options.description] - Component description
   */
  constructor({
    filePath,
    name,
    type,
    props = [],
    state = [],
    hooks = [],
    methods = [],
    children = [],
    imports = [],
    exports = [],
    styling = {},
    stateManagement = null,
    feature = null,
    apiEndpoints = [],
    isResponsive = false,
    description = null,
  }) {
    this._validate({ filePath, name, type });

    this.filePath = filePath;
    this.name = name;
    this.type = type;
    this.props = props.map(p => p instanceof ComponentProp ? p : new ComponentProp(p));
    this.state = state.map(s => s instanceof StateVariable ? s : new StateVariable(s));
    this.hooks = hooks;
    this.methods = methods;
    this.children = children;
    this.imports = imports;
    this.exports = exports;
    this.styling = styling;
    this.stateManagement = stateManagement;
    this.feature = feature;
    this.apiEndpoints = apiEndpoints.map(e => e instanceof ApiEndpoint ? e : new ApiEndpoint(e));
    this.isResponsive = isResponsive;
    this.description = description;
  }

  _validate({ filePath, name, type }) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('ComponentModel: filePath is required and must be a string');
    }
    if (!name || typeof name !== 'string') {
      throw new Error('ComponentModel: name is required and must be a string');
    }
    if (!type || typeof type !== 'string') {
      throw new Error('ComponentModel: type is required and must be a string');
    }
    if (!Object.values(ComponentType).includes(type)) {
      throw new Error(`ComponentModel: type must be one of ${Object.values(ComponentType).join(', ')}`);
    }
  }

  /**
   * Get all required props
   * @returns {ComponentProp[]}
   */
  getRequiredProps() {
    return this.props.filter(p => p.isRequired);
  }

  /**
   * Get all optional props
   * @returns {ComponentProp[]}
   */
  getOptionalProps() {
    return this.props.filter(p => !p.isRequired);
  }

  /**
   * Check if component uses async operations
   * @returns {boolean}
   */
  hasAsyncOperations() {
    return this.apiEndpoints.length > 0 ||
           this.hooks.some(h => h.includes('useEffect') || h.includes('useAsync'));
  }

  /**
   * Get complexity score (0-10)
   * @returns {number}
   */
  getComplexityScore() {
    let score = 0;

    // Base complexity
    score += this.props.length * 0.5;
    score += this.state.length * 1;
    score += this.methods.length * 1;
    score += this.apiEndpoints.length * 2;
    score += this.children.length * 0.5;

    // State management adds complexity
    if (this.stateManagement === StateManagementPattern.REDUX) score += 2;
    if (this.stateManagement === StateManagementPattern.MOBX) score += 2;

    return Math.min(Math.round(score), 10);
  }

  /**
   * Determine if component should use BLoC or Cubit in Flutter
   * @returns {string} 'bloc' or 'cubit'
   */
  recommendedFlutterStateManagement() {
    const complexity = this.getComplexityScore();
    const hasAsync = this.hasAsyncOperations();

    if (complexity > 5 || hasAsync) {
      return 'bloc';
    }
    return 'cubit';
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      filePath: this.filePath,
      name: this.name,
      type: this.type,
      props: this.props.map(p => p.toJSON()),
      state: this.state.map(s => s.toJSON()),
      hooks: this.hooks,
      methods: this.methods,
      children: this.children,
      imports: this.imports,
      exports: this.exports,
      styling: this.styling,
      stateManagement: this.stateManagement,
      feature: this.feature,
      apiEndpoints: this.apiEndpoints.map(e => e.toJSON()),
      isResponsive: this.isResponsive,
      description: this.description,
    };
  }

  /**
   * Create from JSON
   * @param {Object} json
   * @returns {ComponentModel}
   */
  static fromJSON(json) {
    return new ComponentModel(json);
  }

  /**
   * Create a minimal component for testing
   * @param {Object} overrides
   * @returns {ComponentModel}
   */
  static createMinimal(overrides = {}) {
    return new ComponentModel({
      filePath: 'test/Component.tsx',
      name: 'TestComponent',
      type: ComponentType.WIDGET,
      ...overrides,
    });
  }
}

module.exports = {
  ComponentModel,
  ComponentProp,
  StateVariable,
  ApiEndpoint,
  ComponentType,
  StateManagementPattern,
};
