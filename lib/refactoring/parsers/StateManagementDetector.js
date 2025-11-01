/**
 * StateManagementDetector.js
 * Detects state management patterns (Redux, Zustand, Context API, etc.)
 *
 * Recommends Flutter equivalent (BLoC, Cubit, Provider, Riverpod)
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { StateManagementPattern } = require('../models/ComponentModel');
const { createModuleLogger } = require('../utils/logger');

const logger = createModuleLogger('StateManagementDetector');

/**
 * Flutter state management recommendations
 */
const FlutterStateManagement = {
  BLOC: 'bloc',
  CUBIT: 'cubit',
  PROVIDER: 'provider',
  RIVERPOD: 'riverpod',
  GETX: 'getx',
};

/**
 * State Management Detector class
 */
class StateManagementDetector {
  constructor() {
    this.detectedPatterns = [];
    this.stateStructure = {};
    this.actions = [];
  }

  /**
   * Detect state management pattern from source code
   * @param {string} sourceCode - Source code to analyze
   * @param {string} filePath - File path for error reporting
   * @returns {Object} - Detected pattern information
   */
  detect(sourceCode, filePath) {
    try {
      logger.info(`Detecting state management in: ${filePath}`);

      const ast = parser.parse(sourceCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      const result = {
        pattern: null,
        flutterRecommendation: null,
        stateStructure: {},
        actions: [],
        complexity: 0,
      };

      let hasRedux = false;
      let hasZustand = false;
      let hasContext = false;
      let hasMobX = false;
      let hasRecoil = false;

      traverse(ast, {
        // Detect imports
        ImportDeclaration: (path) => {
          const source = path.node.source.value;

          if (source.includes('redux') || source === 'react-redux') {
            hasRedux = true;
          } else if (source.includes('zustand')) {
            hasZustand = true;
          } else if (source.includes('mobx')) {
            hasMobX = true;
          } else if (source.includes('recoil')) {
            hasRecoil = true;
          }
        },

        // Detect Context API usage
        CallExpression: (path) => {
          const node = path.node;

          // React.createContext or createContext
          if (t.isIdentifier(node.callee, { name: 'createContext' }) ||
              (t.isMemberExpression(node.callee) &&
               t.isIdentifier(node.callee.object, { name: 'React' }) &&
               t.isIdentifier(node.callee.property, { name: 'createContext' }))) {
            hasContext = true;
          }

          // Redux hooks: useSelector, useDispatch
          if (hasRedux) {
            if (t.isIdentifier(node.callee, { name: 'useSelector' })) {
              result.actions.push({ type: 'selector', pattern: 'redux' });
            }
            if (t.isIdentifier(node.callee, { name: 'useDispatch' })) {
              result.actions.push({ type: 'dispatch', pattern: 'redux' });
            }
          }

          // Zustand: create
          if (hasZustand && t.isIdentifier(node.callee, { name: 'create' })) {
            const storeDefinition = this._extractZustandStore(node);
            if (storeDefinition) {
              result.stateStructure = storeDefinition;
            }
          }

          // Context API: useContext
          if (t.isIdentifier(node.callee, { name: 'useContext' })) {
            result.actions.push({ type: 'context', pattern: 'context' });
          }
        },

        // Detect Redux reducers
        FunctionDeclaration: (path) => {
          if (hasRedux && path.node.params.length === 2) {
            const firstParam = path.node.params[0];
            const secondParam = path.node.params[1];

            // Typical reducer signature: (state, action) => {}
            if (t.isIdentifier(firstParam) && t.isIdentifier(secondParam) &&
                (firstParam.name === 'state' || secondParam.name === 'action')) {
              const reducerActions = this._extractReduxActions(path.node);
              result.actions.push(...reducerActions);
            }
          }
        },
      });

      // Determine pattern
      if (hasRedux) {
        result.pattern = StateManagementPattern.REDUX;
        result.flutterRecommendation = FlutterStateManagement.BLOC;
        result.complexity = 8; // Redux is complex
      } else if (hasZustand) {
        result.pattern = StateManagementPattern.ZUSTAND;
        result.flutterRecommendation = FlutterStateManagement.CUBIT;
        result.complexity = 4;
      } else if (hasMobX) {
        result.pattern = StateManagementPattern.MOBX;
        result.flutterRecommendation = FlutterStateManagement.BLOC;
        result.complexity = 7;
      } else if (hasRecoil) {
        result.pattern = StateManagementPattern.RECOIL;
        result.flutterRecommendation = FlutterStateManagement.RIVERPOD;
        result.complexity = 6;
      } else if (hasContext) {
        result.pattern = StateManagementPattern.CONTEXT;
        result.flutterRecommendation = FlutterStateManagement.PROVIDER;
        result.complexity = 3;
      } else {
        result.pattern = StateManagementPattern.USE_STATE;
        result.flutterRecommendation = FlutterStateManagement.CUBIT;
        result.complexity = 2;
      }

      logger.success(`Detected ${result.pattern}, recommending ${result.flutterRecommendation}`);
      return result;

    } catch (error) {
      logger.error(`Failed to detect state management in ${filePath}: ${error.message}`);
      return {
        pattern: StateManagementPattern.USE_STATE,
        flutterRecommendation: FlutterStateManagement.CUBIT,
        stateStructure: {},
        actions: [],
        complexity: 2,
      };
    }
  }

  /**
   * Extract Zustand store definition
   * @private
   */
  _extractZustandStore(callNode) {
    if (!callNode.arguments || callNode.arguments.length === 0) {
      return null;
    }

    const storeFunc = callNode.arguments[0];
    if (!t.isArrowFunctionExpression(storeFunc) && !t.isFunctionExpression(storeFunc)) {
      return null;
    }

    const store = {};

    // Extract state and actions from returned object
    if (t.isObjectExpression(storeFunc.body)) {
      storeFunc.body.properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const key = prop.key.name;

          // State variable
          if (!t.isArrowFunctionExpression(prop.value) && !t.isFunctionExpression(prop.value)) {
            store[key] = {
              type: 'state',
              initialValue: this._getValueString(prop.value),
            };
          }
          // Action
          else {
            store[key] = {
              type: 'action',
              params: prop.value.params.map(p => p.name || 'unknown'),
            };
          }
        }
      });
    }

    return store;
  }

  /**
   * Extract Redux actions from reducer
   * @private
   */
  _extractReduxActions(reducerNode) {
    const actions = [];

    traverse(reducerNode, {
      SwitchCase: (path) => {
        // Extract action types from switch cases
        if (path.node.test && t.isMemberExpression(path.node.test)) {
          const actionType = this._getActionTypeFromCase(path.node.test);
          if (actionType) {
            actions.push({
              type: 'redux_action',
              actionType,
              pattern: 'redux',
            });
          }
        }
      },
    }, reducerNode.scope);

    return actions;
  }

  /**
   * Get action type from switch case
   * @private
   */
  _getActionTypeFromCase(testNode) {
    // action.type === 'ACTION_TYPE'
    if (t.isMemberExpression(testNode) &&
        t.isIdentifier(testNode.object, { name: 'action' }) &&
        t.isIdentifier(testNode.property, { name: 'type' })) {
      return 'action.type';
    }
    return null;
  }

  /**
   * Get value as string
   * @private
   */
  _getValueString(node) {
    if (t.isStringLiteral(node)) return `"${node.value}"`;
    if (t.isNumericLiteral(node)) return String(node.value);
    if (t.isBooleanLiteral(node)) return String(node.value);
    if (t.isNullLiteral(node)) return 'null';
    if (t.isArrayExpression(node)) return '[]';
    if (t.isObjectExpression(node)) return '{}';
    return 'unknown';
  }

  /**
   * Generate Flutter BLoC/Cubit code suggestion
   * @param {Object} detectionResult - Result from detect()
   * @returns {Object} - Code generation suggestions
   */
  generateFlutterSuggestion(detectionResult) {
    const { pattern, flutterRecommendation, stateStructure, actions } = detectionResult;

    const suggestion = {
      stateManagement: flutterRecommendation,
      packages: [],
      stateClass: '',
      eventClasses: [],
      blocClass: '',
    };

    // Add required packages
    if (flutterRecommendation === FlutterStateManagement.BLOC) {
      suggestion.packages.push('flutter_bloc: ^8.1.0');
    } else if (flutterRecommendation === FlutterStateManagement.CUBIT) {
      suggestion.packages.push('flutter_bloc: ^8.1.0');
    } else if (flutterRecommendation === FlutterStateManagement.PROVIDER) {
      suggestion.packages.push('provider: ^6.0.0');
    } else if (flutterRecommendation === FlutterStateManagement.RIVERPOD) {
      suggestion.packages.push('flutter_riverpod: ^2.0.0');
    }

    // Generate state class
    suggestion.stateClass = this._generateStateClass(stateStructure);

    // Generate events (for BLoC)
    if (flutterRecommendation === FlutterStateManagement.BLOC) {
      suggestion.eventClasses = this._generateEventClasses(actions);
      suggestion.blocClass = this._generateBlocClass(actions);
    }

    return suggestion;
  }

  /**
   * Generate Flutter state class
   * @private
   */
  _generateStateClass(stateStructure) {
    const properties = Object.entries(stateStructure)
      .filter(([key, value]) => value.type === 'state')
      .map(([key, value]) => `  final dynamic ${key};`)
      .join('\n');

    return `class AppState {
${properties}

  AppState({${Object.keys(stateStructure).map(k => `this.${k}`).join(', ')}});
}`;
  }

  /**
   * Generate Flutter event classes
   * @private
   */
  _generateEventClasses(actions) {
    return actions.map(action => {
      return `class ${this._toPascalCase(action.actionType || action.type)}Event extends AppEvent {}`;
    });
  }

  /**
   * Generate Flutter BLoC class
   * @private
   */
  _generateBlocClass(actions) {
    return `class AppBloc extends Bloc<AppEvent, AppState> {
  AppBloc() : super(AppState()) {
    // Register event handlers
  }
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
  StateManagementDetector,
  FlutterStateManagement,
};
