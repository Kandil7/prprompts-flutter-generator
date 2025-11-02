/**
 * HooksConverter Tests
 * Tests React Hooks to Flutter pattern conversion
 */

const hooksConverter = require('../../../lib/refactoring/generators/HooksConverter');
const { HookType, LifecycleMapping } = require('../../../lib/refactoring/generators/HooksConverter');

describe('HooksConverter', () => {
  describe('useState Conversion', () => {
    test('should convert simple useState to state field', () => {
      const hooks = [{
        name: 'useState',
        variables: ['count', 'setCount'],
        initialValue: 0,
        type: 'number',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields).toHaveLength(1);
      expect(result.stateFields[0].name).toBe('count');
      expect(result.stateFields[0].type).toBe('num');
      expect(result.stateFields[0].initialValue).toBe('0');
      expect(result.stateFields[0].setter).toBe('setCount');
    });

    test('should convert useState with string type', () => {
      const hooks = [{
        name: 'useState',
        variables: ['name', 'setName'],
        initialValue: 'John',
        type: 'string',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('String');
      expect(result.stateFields[0].initialValue).toBe("'John'");
    });

    test('should convert useState with boolean type', () => {
      const hooks = [{
        name: 'useState',
        variables: ['isActive', 'setIsActive'],
        initialValue: true,
        type: 'boolean',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('bool');
      expect(result.stateFields[0].initialValue).toBe('true');
    });

    test('should handle useState with null initial value', () => {
      const hooks = [{
        name: 'useState',
        variables: ['data', 'setData'],
        initialValue: null,
        type: 'any',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].initialValue).toBe('null');
      expect(result.stateFields[0].isNullable).toBe(true);
    });

    test('should convert multiple useState hooks', () => {
      const hooks = [
        {
          name: 'useState',
          variables: ['email', 'setEmail'],
          initialValue: '',
          type: 'string',
        },
        {
          name: 'useState',
          variables: ['password', 'setPassword'],
          initialValue: '',
          type: 'string',
        },
        {
          name: 'useState',
          variables: ['loading', 'setLoading'],
          initialValue: false,
          type: 'boolean',
        },
      ];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields).toHaveLength(3);
      expect(result.stateFields[0].name).toBe('email');
      expect(result.stateFields[1].name).toBe('password');
      expect(result.stateFields[2].name).toBe('loading');
    });

    test('should infer type from initial value when type not provided', () => {
      const hooks = [{
        name: 'useState',
        variables: ['count', 'setCount'],
        initialValue: 42,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('num');
    });
  });

  describe('useEffect Conversion', () => {
    test('should convert useEffect with empty deps to initState', () => {
      const hooks = [{
        name: 'useEffect',
        callback: 'fetchData()',
        dependencies: [],
        hasCleanup: false,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.lifecycleMethods[LifecycleMapping.INIT_STATE]).toBeDefined();
      expect(result.lifecycleMethods[LifecycleMapping.INIT_STATE]).toHaveLength(1);
      expect(result.lifecycleMethods[LifecycleMapping.INIT_STATE][0].code).toBe('fetchData()');
    });

    test('should convert useEffect with deps to didUpdateWidget', () => {
      const hooks = [{
        name: 'useEffect',
        callback: 'updateData()',
        dependencies: ['userId', 'filter'],
        hasCleanup: false,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.lifecycleMethods[LifecycleMapping.DID_UPDATE_WIDGET]).toBeDefined();
      expect(result.lifecycleMethods[LifecycleMapping.DID_UPDATE_WIDGET][0].dependencies).toEqual(['userId', 'filter']);
    });

    test('should handle useEffect with cleanup', () => {
      const hooks = [{
        name: 'useEffect',
        callback: 'const subscription = subscribe(); return () => subscription.unsubscribe();',
        dependencies: [],
        hasCleanup: true,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.lifecycleMethods[LifecycleMapping.INIT_STATE][0].hasCleanup).toBe(true);
    });

    test('should handle useEffect without deps (runs every render)', () => {
      const hooks = [{
        name: 'useEffect',
        callback: 'console.log("render")',
        dependencies: null, // No deps array
        hasCleanup: false,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.lifecycleMethods[LifecycleMapping.BUILD]).toBeDefined();
    });

    test('should combine multiple useEffect hooks', () => {
      const hooks = [
        {
          name: 'useEffect',
          callback: 'fetchUser()',
          dependencies: [],
          hasCleanup: false,
        },
        {
          name: 'useEffect',
          callback: 'fetchPosts()',
          dependencies: [],
          hasCleanup: false,
        },
      ];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.lifecycleMethods[LifecycleMapping.INIT_STATE]).toHaveLength(2);
    });
  });

  describe('useContext Conversion', () => {
    test('should convert useContext to Provider pattern', () => {
      const hooks = [{
        name: 'useContext',
        variables: ['theme'],
        contextType: 'Theme',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.providers).toHaveLength(1);
      expect(result.providers[0].variable).toBe('theme');
      expect(result.providers[0].type).toBe('Theme');
      expect(result.providers[0].providerClass).toBe('ThemeProvider');
      expect(result.imports.has('package:provider/provider.dart')).toBe(true);
    });

    test('should convert multiple useContext hooks', () => {
      const hooks = [
        {
          name: 'useContext',
          variables: ['theme'],
          contextType: 'Theme',
        },
        {
          name: 'useContext',
          variables: ['auth'],
          contextType: 'Auth',
        },
      ];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.providers).toHaveLength(2);
      expect(result.providers[0].type).toBe('Theme');
      expect(result.providers[1].type).toBe('Auth');
    });
  });

  describe('useReducer Conversion', () => {
    test('should convert useReducer to Cubit pattern', () => {
      const hooks = [{
        name: 'useReducer',
        variables: ['state', 'dispatch'],
        reducerName: 'counterReducer',
        initialState: '{ count: 0 }',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.mixins).toHaveLength(1);
      expect(result.mixins[0].type).toBe('cubit');
      expect(result.mixins[0].name).toBe('counterReducerCubit');
      expect(result.imports.has('package:flutter_bloc/flutter_bloc.dart')).toBe(true);
    });
  });

  describe('useCallback Conversion', () => {
    test('should convert useCallback to memoized callback', () => {
      const hooks = [{
        name: 'useCallback',
        variables: ['handleClick'],
        callback: '() => console.log("clicked")',
        dependencies: ['count'],
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.memoizedValues).toHaveLength(1);
      expect(result.memoizedValues[0].type).toBe('callback');
      expect(result.memoizedValues[0].name).toBe('handleClick');
      expect(result.memoizedValues[0].dependencies).toEqual(['count']);
    });

    test('should handle useCallback without dependencies', () => {
      const hooks = [{
        name: 'useCallback',
        variables: ['handleSubmit'],
        callback: '() => submit()',
        dependencies: [],
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.memoizedValues[0].dependencies).toEqual([]);
    });
  });

  describe('useMemo Conversion', () => {
    test('should convert useMemo to memoized value', () => {
      const hooks = [{
        name: 'useMemo',
        variables: ['expensiveValue'],
        computation: '() => calculate(a, b)',
        dependencies: ['a', 'b'],
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.memoizedValues).toHaveLength(1);
      expect(result.memoizedValues[0].type).toBe('memo');
      expect(result.memoizedValues[0].name).toBe('expensiveValue');
      expect(result.memoizedValues[0].pattern).toBe('conditional');
    });

    test('should handle useMemo without dependencies', () => {
      const hooks = [{
        name: 'useMemo',
        variables: ['value'],
        computation: '() => compute()',
        dependencies: [],
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.memoizedValues[0].pattern).toBe('always');
    });
  });

  describe('useRef Conversion', () => {
    test('should convert useRef to FocusNode for focus refs', () => {
      const hooks = [{
        name: 'useRef',
        variables: ['focusRef'],
        initialValue: null,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.refs).toHaveLength(1);
      expect(result.refs[0].name).toBe('focusRef');
      expect(result.refs[0].type).toBe('FocusNode');
      expect(result.refs[0].needsDispose).toBe(true);
    });

    test('should convert useRef to TextEditingController for input refs', () => {
      const hooks = [{
        name: 'useRef',
        variables: ['inputController'],
        initialValue: null,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.refs[0].type).toBe('TextEditingController');
      expect(result.refs[0].needsDispose).toBe(true);
    });

    test('should convert useRef to ScrollController for scroll refs', () => {
      const hooks = [{
        name: 'useRef',
        variables: ['scrollController'],
        initialValue: null,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.refs[0].type).toBe('ScrollController');
      expect(result.refs[0].needsDispose).toBe(true);
    });

    test('should convert generic useRef to GlobalKey', () => {
      const hooks = [{
        name: 'useRef',
        variables: ['myRef'],
        initialValue: null,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.refs[0].type).toBe('GlobalKey');
      expect(result.refs[0].needsDispose).toBe(false);
    });
  });

  describe('Custom Hooks Conversion', () => {
    test('should convert custom hook to mixin', () => {
      const hooks = [{
        name: 'useCustomHook',
        variables: ['data', 'loading'],
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.mixins).toHaveLength(1);
      expect(result.mixins[0].type).toBe('custom');
      expect(result.mixins[0].name).toBe('useCustomHook');
    });
  });

  describe('Code Generation', () => {
    test('should generate imports section', () => {
      const hooks = [
        {
          name: 'useContext',
          variables: ['theme'],
          contextType: 'Theme',
        },
        {
          name: 'useReducer',
          variables: ['state', 'dispatch'],
          initialState: '{}',
        },
      ];

      const result = hooksConverter.convertHooks(hooks);
      const code = hooksConverter.generateFlutterCode(result);

      expect(code.imports).toContain('package:provider/provider.dart');
      expect(code.imports).toContain('package:flutter_bloc/flutter_bloc.dart');
    });

    test('should generate state class fields', () => {
      const hooks = [
        {
          name: 'useState',
          variables: ['count', 'setCount'],
          initialValue: 0,
          type: 'number',
        },
        {
          name: 'useState',
          variables: ['name', 'setName'],
          initialValue: '',
          type: 'string',
        },
      ];

      const result = hooksConverter.convertHooks(hooks);
      const code = hooksConverter.generateFlutterCode(result);

      expect(code.stateClass).toContain('num count = 0');
      expect(code.stateClass).toContain("String name = ''");
    });

    test('should generate initState method', () => {
      const hooks = [{
        name: 'useEffect',
        callback: 'fetchData();',
        dependencies: [],
        hasCleanup: false,
      }];

      const result = hooksConverter.convertHooks(hooks);
      const code = hooksConverter.generateFlutterCode(result);

      expect(code.initState).toContain('@override');
      expect(code.initState).toContain('void initState()');
      expect(code.initState).toContain('super.initState()');
      expect(code.initState).toContain('fetchData()');
    });

    test('should generate dispose method for refs', () => {
      const hooks = [{
        name: 'useRef',
        variables: ['focusNode'],
        initialValue: null,
      }];

      const result = hooksConverter.convertHooks(hooks);
      const code = hooksConverter.generateFlutterCode(result);

      expect(code.dispose).toContain('@override');
      expect(code.dispose).toContain('void dispose()');
      expect(code.dispose).toContain('focusNode.dispose()');
      expect(code.dispose).toContain('super.dispose()');
    });

    test('should generate didUpdateWidget for dep-based effects', () => {
      const hooks = [{
        name: 'useEffect',
        callback: 'updateData();',
        dependencies: ['userId'],
        hasCleanup: false,
      }];

      const result = hooksConverter.convertHooks(hooks);
      const code = hooksConverter.generateFlutterCode(result);

      expect(code.didUpdateWidget).toContain('@override');
      expect(code.didUpdateWidget).toContain('void didUpdateWidget');
      expect(code.didUpdateWidget).toContain('super.didUpdateWidget');
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle component with multiple hook types', () => {
      const hooks = [
        {
          name: 'useState',
          variables: ['count', 'setCount'],
          initialValue: 0,
        },
        {
          name: 'useEffect',
          callback: 'fetchData()',
          dependencies: [],
        },
        {
          name: 'useContext',
          variables: ['theme'],
          contextType: 'Theme',
        },
        {
          name: 'useRef',
          variables: ['inputRef'],
          initialValue: null,
        },
      ];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields).toHaveLength(1);
      expect(result.lifecycleMethods[LifecycleMapping.INIT_STATE]).toHaveLength(1);
      expect(result.providers).toHaveLength(1);
      expect(result.refs).toHaveLength(1);
    });

    test('should handle state with array initial value', () => {
      const hooks = [{
        name: 'useState',
        variables: ['items', 'setItems'],
        initialValue: [],
        type: 'array',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('List');
      expect(result.stateFields[0].initialValue).toBe('[]');
    });

    test('should handle state with object initial value', () => {
      const hooks = [{
        name: 'useState',
        variables: ['user', 'setUser'],
        initialValue: {},
        type: 'object',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('Map');
      expect(result.stateFields[0].initialValue).toBe('{}');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty hooks array', () => {
      const result = hooksConverter.convertHooks([]);

      expect(result.stateFields).toHaveLength(0);
      expect(result.providers).toHaveLength(0);
      expect(result.refs).toHaveLength(0);
    });

    test('should handle hook without variables', () => {
      const hooks = [{
        name: 'useState',
        initialValue: 0,
      }];

      const result = hooksConverter.convertHooks(hooks);

      // Should not crash, just skip
      expect(result.stateFields).toHaveLength(0);
    });

    test('should handle unknown hook gracefully', () => {
      const hooks = [{
        name: 'useUnknownHook',
        variables: ['value'],
      }];

      const result = hooksConverter.convertHooks(hooks);

      // Should treat as custom hook
      expect(result.mixins).toHaveLength(1);
    });
  });

  describe('Type Inference', () => {
    test('should infer num from numeric value', () => {
      const hooks = [{
        name: 'useState',
        variables: ['count', 'setCount'],
        initialValue: 42,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('num');
    });

    test('should infer String from string value', () => {
      const hooks = [{
        name: 'useState',
        variables: ['name', 'setName'],
        initialValue: 'John',
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('String');
    });

    test('should infer bool from boolean value', () => {
      const hooks = [{
        name: 'useState',
        variables: ['isActive', 'setIsActive'],
        initialValue: true,
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('bool');
    });

    test('should infer List from array value', () => {
      const hooks = [{
        name: 'useState',
        variables: ['items', 'setItems'],
        initialValue: [1, 2, 3],
      }];

      const result = hooksConverter.convertHooks(hooks);

      expect(result.stateFields[0].type).toBe('List');
    });
  });
});
