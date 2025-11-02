/**
 * HooksConverter - Convert React Hooks to Flutter patterns
 *
 * Handles:
 * - useState → StatefulWidget state fields
 * - useEffect → Lifecycle methods (initState, didUpdateWidget, dispose)
 * - useContext → Provider/Consumer pattern
 * - useMemo/useCallback → Builders and cached values
 * - Custom hooks → Mixins
 */

const { createModuleLogger } = require('../utils/logger');
const logger = createModuleLogger('HooksConverter');

/**
 * Hook types
 */
const HookType = {
  USE_STATE: 'useState',
  USE_EFFECT: 'useEffect',
  USE_CONTEXT: 'useContext',
  USE_REDUCER: 'useReducer',
  USE_CALLBACK: 'useCallback',
  USE_MEMO: 'useMemo',
  USE_REF: 'useRef',
  USE_IMPERATIVE_HANDLE: 'useImperativeHandle',
  USE_LAYOUT_EFFECT: 'useLayoutEffect',
  USE_DEBUG_VALUE: 'useDebugValue',
  CUSTOM: 'custom',
};

/**
 * Lifecycle mapping for useEffect
 */
const LifecycleMapping = {
  INIT_STATE: 'initState',        // useEffect(() => {}, [])
  DID_UPDATE_WIDGET: 'didUpdateWidget', // useEffect(() => {}, [deps])
  DISPOSE: 'dispose',              // useEffect(() => { return cleanup }, [])
  BUILD: 'build',                  // No deps, runs every render
};

/**
 * HooksConverter class
 */
class HooksConverter {
  /**
   * Convert all hooks in a component to Flutter patterns
   * @param {Array} hooks - Array of hook objects from ReactParser
   * @param {Object} componentData - Additional component context
   * @returns {Object} Conversion result with Flutter patterns
   */
  convertHooks(hooks, componentData = {}) {
    logger.debug('Converting hooks to Flutter patterns', { count: hooks.length });

    const result = {
      stateFields: [],           // StatefulWidget state fields
      lifecycleMethods: {},      // initState, dispose, didUpdateWidget
      providers: [],             // Provider dependencies
      memoizedValues: [],        // Cached computations
      refs: [],                  // Ref objects
      mixins: [],                // Custom hook mixins
      imports: new Set(),        // Required imports
    };

    // Process each hook
    for (const hook of hooks) {
      this._processHook(hook, result, componentData);
    }

    // Optimize lifecycle methods
    this._optimizeLifecycleMethods(result);

    logger.success(`Converted ${hooks.length} hooks to Flutter patterns`);

    return result;
  }

  /**
   * Process a single hook
   * @param {Object} hook - Hook object
   * @param {Object} result - Accumulator for conversion results
   * @param {Object} componentData - Component context
   * @private
   */
  _processHook(hook, result, componentData) {
    const hookType = this._identifyHookType(hook.name);

    switch (hookType) {
      case HookType.USE_STATE:
        this._convertUseState(hook, result);
        break;

      case HookType.USE_EFFECT:
        this._convertUseEffect(hook, result);
        break;

      case HookType.USE_CONTEXT:
        this._convertUseContext(hook, result);
        break;

      case HookType.USE_REDUCER:
        this._convertUseReducer(hook, result);
        break;

      case HookType.USE_CALLBACK:
        this._convertUseCallback(hook, result);
        break;

      case HookType.USE_MEMO:
        this._convertUseMemo(hook, result);
        break;

      case HookType.USE_REF:
        this._convertUseRef(hook, result);
        break;

      case HookType.CUSTOM:
        this._convertCustomHook(hook, result);
        break;

      default:
        logger.warn('Unsupported hook type', { hook: hook.name });
    }
  }

  /**
   * Identify hook type
   * @param {string} hookName - Name of the hook
   * @returns {string} Hook type constant
   * @private
   */
  _identifyHookType(hookName) {
    if (hookName === 'useState') return HookType.USE_STATE;
    if (hookName === 'useEffect') return HookType.USE_EFFECT;
    if (hookName === 'useContext') return HookType.USE_CONTEXT;
    if (hookName === 'useReducer') return HookType.USE_REDUCER;
    if (hookName === 'useCallback') return HookType.USE_CALLBACK;
    if (hookName === 'useMemo') return HookType.USE_MEMO;
    if (hookName === 'useRef') return HookType.USE_REF;
    if (hookName === 'useImperativeHandle') return HookType.USE_IMPERATIVE_HANDLE;
    if (hookName === 'useLayoutEffect') return HookType.USE_LAYOUT_EFFECT;
    if (hookName === 'useDebugValue') return HookType.USE_DEBUG_VALUE;
    if (hookName.startsWith('use')) return HookType.CUSTOM;
    return null;
  }

  /**
   * Convert useState to StatefulWidget state field
   * @param {Object} hook - useState hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertUseState(hook, result) {
    // useState(initialValue) → state field + setState call
    // const [count, setCount] = useState(0);
    // →
    // int count = 0;
    // void _setCount(int value) { setState(() { count = value; }); }

    const stateVar = hook.variables?.[0]; // 'count'
    const setterVar = hook.variables?.[1]; // 'setCount'
    // Use nullish coalescing to handle 0 and '' as valid values
    const initialValue = hook.initialValue !== undefined ? hook.initialValue : this._getDefaultValue(hook.type);

    if (!stateVar) {
      logger.warn('useState hook missing variable name', { hook });
      return;
    }

    const dartType = this._inferDartType(hook.type, initialValue);

    result.stateFields.push({
      name: stateVar,
      type: dartType,
      initialValue: this._convertValue(initialValue, dartType),
      setter: setterVar,
      isPrivate: false,
      isNullable: initialValue === 'null' || initialValue === null,
    });

    logger.debug('Converted useState', {
      from: `const [${stateVar}, ${setterVar}] = useState(${initialValue})`,
      to: `${dartType} ${stateVar} = ${this._convertValue(initialValue, dartType)}`,
    });
  }

  /**
   * Convert useEffect to lifecycle method
   * @param {Object} hook - useEffect hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertUseEffect(hook, result) {
    // useEffect(() => { ... }, deps) → initState/didUpdateWidget/dispose

    const { callback, dependencies, hasCleanup } = hook;
    const lifecycle = this._determineLifecycleMethod(dependencies, hasCleanup);

    if (!result.lifecycleMethods[lifecycle]) {
      result.lifecycleMethods[lifecycle] = [];
    }

    result.lifecycleMethods[lifecycle].push({
      code: callback,
      dependencies: dependencies || [],
      hasCleanup,
      lifecycle,
    });

    logger.debug('Converted useEffect', {
      dependencies: dependencies || 'none',
      lifecycle,
      hasCleanup,
    });
  }

  /**
   * Determine which lifecycle method for useEffect
   * @param {Array|null} dependencies - Dependency array
   * @param {boolean} hasCleanup - Whether effect has cleanup function
   * @returns {string} Lifecycle method name
   * @private
   */
  _determineLifecycleMethod(dependencies, hasCleanup) {
    // useEffect(() => {}, []) → initState (mount only)
    if (Array.isArray(dependencies) && dependencies.length === 0) {
      return hasCleanup ? LifecycleMapping.INIT_STATE : LifecycleMapping.INIT_STATE;
    }

    // useEffect(() => {}, [dep1, dep2]) → didUpdateWidget (on dep change)
    if (Array.isArray(dependencies) && dependencies.length > 0) {
      return LifecycleMapping.DID_UPDATE_WIDGET;
    }

    // useEffect(() => {}) → runs every render (use with caution)
    // In Flutter, this would be in build() but that's not recommended
    return LifecycleMapping.BUILD;
  }

  /**
   * Convert useContext to Provider pattern
   * @param {Object} hook - useContext hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertUseContext(hook, result) {
    // const theme = useContext(ThemeContext);
    // →
    // final theme = context.watch<ThemeProvider>();

    const contextVar = hook.variables?.[0];
    const contextType = hook.contextType || 'dynamic';

    result.providers.push({
      variable: contextVar,
      type: contextType,
      providerClass: `${contextType}Provider`,
      accessPattern: 'watch', // watch, read, or select
    });

    result.imports.add('package:provider/provider.dart');

    logger.debug('Converted useContext', {
      variable: contextVar,
      type: contextType,
    });
  }

  /**
   * Convert useReducer to BLoC or Cubit
   * @param {Object} hook - useReducer hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertUseReducer(hook, result) {
    // const [state, dispatch] = useReducer(reducer, initialState);
    // →
    // BlocProvider or Cubit pattern

    logger.debug('Converting useReducer to BLoC pattern');

    result.imports.add('package:flutter_bloc/flutter_bloc.dart');

    // This would typically create a Cubit class
    result.mixins.push({
      type: 'cubit',
      name: `${hook.reducerName || 'State'}Cubit`,
      initialState: hook.initialState,
      reducerLogic: hook.reducerFunction,
    });
  }

  /**
   * Convert useCallback to cached function
   * @param {Object} hook - useCallback hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertUseCallback(hook, result) {
    // const handleClick = useCallback(() => { ... }, [deps]);
    // →
    // Cache function or just use regular method

    const functionName = hook.variables?.[0];
    const dependencies = hook.dependencies || [];

    result.memoizedValues.push({
      type: 'callback',
      name: functionName,
      function: hook.callback,
      dependencies,
      comment: '// Memoized callback (use regular method in Flutter)',
    });

    logger.debug('Converted useCallback', {
      name: functionName,
      dependencies,
    });
  }

  /**
   * Convert useMemo to cached computation
   * @param {Object} hook - useMemo hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertUseMemo(hook, result) {
    // const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);
    // →
    // Getter with caching or computed property

    const valueName = hook.variables?.[0];
    const computation = hook.computation;
    const dependencies = hook.dependencies || [];

    result.memoizedValues.push({
      type: 'memo',
      name: valueName,
      computation,
      dependencies,
      pattern: dependencies.length > 0 ? 'conditional' : 'always',
    });

    logger.debug('Converted useMemo', {
      name: valueName,
      dependencies,
    });
  }

  /**
   * Convert useRef to Flutter equivalent
   * @param {Object} hook - useRef hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertUseRef(hook, result) {
    // const inputRef = useRef(null);
    // →
    // final inputRef = GlobalKey() or FocusNode() or TextEditingController()

    const refName = hook.variables?.[0];
    const initialValue = hook.initialValue;

    // Determine Flutter ref type based on usage
    const refType = this._determineRefType(refName, initialValue);

    result.refs.push({
      name: refName,
      type: refType,
      initialValue: this._getRefInitializer(refType),
      needsDispose: this._refNeedsDispose(refType),
    });

    logger.debug('Converted useRef', {
      name: refName,
      type: refType,
    });
  }

  /**
   * Convert custom hook to mixin
   * @param {Object} hook - Custom hook data
   * @param {Object} result - Conversion result accumulator
   * @private
   */
  _convertCustomHook(hook, result) {
    // const { data, loading } = useCustomHook();
    // →
    // Mixin or separate class

    logger.debug('Converting custom hook to mixin', { name: hook.name });

    result.mixins.push({
      type: 'custom',
      name: hook.name,
      variables: hook.variables,
      comment: `// TODO: Implement ${hook.name} as mixin or separate class`,
    });
  }

  /**
   * Optimize lifecycle methods (combine multiple effects)
   * @param {Object} result - Conversion result
   * @private
   */
  _optimizeLifecycleMethods(result) {
    // Combine multiple useEffect hooks into single lifecycle methods
    for (const [lifecycle, effects] of Object.entries(result.lifecycleMethods)) {
      if (effects.length > 1) {
        logger.debug(`Combining ${effects.length} effects into ${lifecycle}`);
      }
    }
  }

  /**
   * Infer Dart type from React type and value
   * @param {string} reactType - React type annotation
   * @param {*} initialValue - Initial value
   * @returns {string} Dart type
   * @private
   */
  _inferDartType(reactType, initialValue) {
    // Prioritize explicit type annotation if provided
    if (reactType) {
      const typeMap = {
        'number': 'num',
        'string': 'String',
        'boolean': 'bool',
        'array': 'List',
        'object': 'Map',
        'any': 'dynamic',
        'void': 'void',
        'null': 'Null',
      };

      if (typeMap[reactType]) {
        return typeMap[reactType];
      }
    }

    // Type inference from initial value
    if (initialValue !== undefined && initialValue !== null) {
      if (typeof initialValue === 'number') return 'num';
      if (typeof initialValue === 'string') return 'String';
      if (typeof initialValue === 'boolean') return 'bool';
      if (Array.isArray(initialValue)) return 'List';
      if (typeof initialValue === 'object') return 'Map';
    }

    return 'dynamic';
  }

  /**
   * Convert JavaScript value to Dart value
   * @param {*} value - JavaScript value
   * @param {string} dartType - Target Dart type
   * @returns {string} Dart value expression
   * @private
   */
  _convertValue(value, dartType) {
    // Check for null/undefined explicitly (not falsy, because 0 and '' are valid)
    if (value === null || value === 'null') return 'null';
    if (value === undefined) return this._getDefaultValue(dartType);

    if (dartType === 'String') {
      return `'${value.toString().replace(/'/g, "\\'")}'`;
    }

    if (dartType === 'bool') {
      return value === true || value === 'true' ? 'true' : 'false';
    }

    if (dartType === 'num' || dartType === 'int' || dartType === 'double') {
      return value.toString();
    }

    if (dartType === 'List') {
      return Array.isArray(value) ? `[${value.join(', ')}]` : '[]';
    }

    if (dartType === 'Map') {
      return '{}';
    }

    return value.toString();
  }

  /**
   * Get default value for Dart type
   * @param {string} dartType - Dart type
   * @returns {string} Default value
   * @private
   */
  _getDefaultValue(dartType) {
    const defaults = {
      'num': '0',
      'int': '0',
      'double': '0.0',
      'String': "''",
      'bool': 'false',
      'List': '[]',
      'Map': '{}',
      'dynamic': 'null',
    };

    return defaults[dartType] || 'null';
  }

  /**
   * Determine Flutter ref type from usage
   * @param {string} refName - Reference variable name
   * @param {*} initialValue - Initial value
   * @returns {string} Flutter ref type
   * @private
   */
  _determineRefType(refName, initialValue) {
    const name = refName.toLowerCase();

    // Check specific types before generic ones
    if (name.includes('focus')) return 'FocusNode';
    if (name.includes('scroll')) return 'ScrollController';
    if (name.includes('animation')) return 'AnimationController';
    if (name.includes('controller') || name.includes('input')) return 'TextEditingController';

    return 'GlobalKey';
  }

  /**
   * Get initializer for ref type
   * @param {string} refType - Flutter ref type
   * @returns {string} Initializer expression
   * @private
   */
  _getRefInitializer(refType) {
    const initializers = {
      'FocusNode': 'FocusNode()',
      'TextEditingController': 'TextEditingController()',
      'ScrollController': 'ScrollController()',
      'AnimationController': 'null', // Needs vsync
      'GlobalKey': 'GlobalKey()',
    };

    return initializers[refType] || 'null';
  }

  /**
   * Check if ref needs dispose
   * @param {string} refType - Flutter ref type
   * @returns {boolean} Whether ref needs dispose
   * @private
   */
  _refNeedsDispose(refType) {
    const disposableTypes = [
      'FocusNode',
      'TextEditingController',
      'ScrollController',
      'AnimationController',
    ];

    return disposableTypes.includes(refType);
  }

  /**
   * Generate Flutter code from conversion result
   * @param {Object} conversionResult - Result from convertHooks()
   * @returns {Object} Generated code sections
   */
  generateFlutterCode(conversionResult) {
    const code = {
      imports: this._generateImports(conversionResult.imports),
      stateClass: this._generateStateClass(conversionResult),
      initState: this._generateInitState(conversionResult.lifecycleMethods[LifecycleMapping.INIT_STATE]),
      dispose: this._generateDispose(conversionResult),
      didUpdateWidget: this._generateDidUpdateWidget(conversionResult.lifecycleMethods[LifecycleMapping.DID_UPDATE_WIDGET]),
      build: this._generateBuild(conversionResult.lifecycleMethods[LifecycleMapping.BUILD]),
    };

    return code;
  }

  /**
   * Generate imports section
   * @param {Set} imports - Set of import paths
   * @returns {string} Import statements
   * @private
   */
  _generateImports(imports) {
    if (imports.size === 0) return '';

    const importStatements = Array.from(imports).map(imp => `import '${imp}';`);
    return importStatements.join('\n');
  }

  /**
   * Generate State class fields
   * @param {Object} conversionResult - Conversion result
   * @returns {string} State class code
   * @private
   */
  _generateStateClass(conversionResult) {
    const { stateFields, refs } = conversionResult;
    const fields = [];

    // State fields
    for (const field of stateFields) {
      const nullable = field.isNullable ? '?' : '';
      fields.push(`  ${field.type}${nullable} ${field.name} = ${field.initialValue};`);
    }

    // Refs
    for (const ref of refs) {
      fields.push(`  late ${ref.type} ${ref.name};`);
    }

    return fields.join('\n');
  }

  /**
   * Generate initState method
   * @param {Array} initEffects - Effects to run on init
   * @returns {string} initState code
   * @private
   */
  _generateInitState(initEffects) {
    if (!initEffects || initEffects.length === 0) return '';

    const effectCodes = initEffects.map(effect => `    ${effect.code}`).join('\n');

    return `
  @override
  void initState() {
    super.initState();
${effectCodes}
  }
`;
  }

  /**
   * Generate dispose method
   * @param {Object} conversionResult - Conversion result
   * @returns {string} dispose code
   * @private
   */
  _generateDispose(conversionResult) {
    const { refs, lifecycleMethods } = conversionResult;
    const disposables = [];

    // Dispose refs
    for (const ref of refs) {
      if (ref.needsDispose) {
        disposables.push(`    ${ref.name}.dispose();`);
      }
    }

    // Cleanup from effects
    const cleanupEffects = lifecycleMethods[LifecycleMapping.INIT_STATE]?.filter(e => e.hasCleanup) || [];
    for (const effect of cleanupEffects) {
      disposables.push(`    // Cleanup from useEffect`);
    }

    if (disposables.length === 0) return '';

    return `
  @override
  void dispose() {
${disposables.join('\n')}
    super.dispose();
  }
`;
  }

  /**
   * Generate didUpdateWidget method
   * @param {Array} updateEffects - Effects to run on update
   * @returns {string} didUpdateWidget code
   * @private
   */
  _generateDidUpdateWidget(updateEffects) {
    if (!updateEffects || updateEffects.length === 0) return '';

    const effectCodes = updateEffects.map(effect => {
      const depCheck = effect.dependencies.length > 0
        ? `if (${effect.dependencies.map(d => `oldWidget.${d} != widget.${d}`).join(' || ')}) {`
        : '';
      const depCheckEnd = effect.dependencies.length > 0 ? '    }' : '';

      return `${depCheck ? '    ' + depCheck : ''}
      ${effect.code}
${depCheckEnd}`;
    }).join('\n');

    return `
  @override
  void didUpdateWidget(covariant MyWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
${effectCodes}
  }
`;
  }

  /**
   * Generate build method additions
   * @param {Array} buildEffects - Effects to run in build
   * @returns {string} build additions
   * @private
   */
  _generateBuild(buildEffects) {
    if (!buildEffects || buildEffects.length === 0) return '';

    // Note: Running effects in build is not recommended
    return `    // TODO: Review useEffect without dependencies (runs every render)`;
  }
}

module.exports = new HooksConverter();
module.exports.HooksConverter = HooksConverter;
module.exports.HookType = HookType;
module.exports.LifecycleMapping = LifecycleMapping;
