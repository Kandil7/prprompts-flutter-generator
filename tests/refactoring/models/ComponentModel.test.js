/**
 * ComponentModel.test.js
 * Unit tests for ComponentModel and related classes
 */

const {
  ComponentModel,
  ComponentProp,
  StateVariable,
  ApiEndpoint,
  ComponentType,
  StateManagementPattern,
} = require('../../../lib/refactoring/models/ComponentModel');

describe('ComponentProp', () => {
  test('should create a valid ComponentProp', () => {
    const prop = new ComponentProp({
      name: 'title',
      type: 'string',
      isRequired: true,
    });

    expect(prop.name).toBe('title');
    expect(prop.type).toBe('string');
    expect(prop.isRequired).toBe(true);
    expect(prop.defaultValue).toBeNull();
  });

  test('should throw error for missing name', () => {
    expect(() => {
      new ComponentProp({ type: 'string' });
    }).toThrow('ComponentProp: name is required');
  });

  test('should throw error for missing type', () => {
    expect(() => {
      new ComponentProp({ name: 'title' });
    }).toThrow('ComponentProp: type is required');
  });

  test('should serialize to JSON', () => {
    const prop = new ComponentProp({
      name: 'count',
      type: 'number',
      isRequired: false,
      defaultValue: '0',
    });

    const json = prop.toJSON();
    expect(json).toEqual({
      name: 'count',
      type: 'number',
      isRequired: false,
      defaultValue: '0',
    });
  });

  test('should deserialize from JSON', () => {
    const json = {
      name: 'enabled',
      type: 'boolean',
      isRequired: true,
      defaultValue: 'true',
    };

    const prop = ComponentProp.fromJSON(json);
    expect(prop.name).toBe('enabled');
    expect(prop.type).toBe('boolean');
    expect(prop.isRequired).toBe(true);
  });
});

describe('StateVariable', () => {
  test('should create a valid StateVariable', () => {
    const state = new StateVariable({
      name: 'isLoading',
      type: 'boolean',
      initialValue: 'false',
    });

    expect(state.name).toBe('isLoading');
    expect(state.type).toBe('boolean');
    expect(state.initialValue).toBe('false');
  });

  test('should throw error for missing name', () => {
    expect(() => {
      new StateVariable({ type: 'string' });
    }).toThrow('StateVariable: name is required');
  });

  test('should serialize and deserialize', () => {
    const state = new StateVariable({
      name: 'count',
      type: 'number',
      initialValue: '0',
    });

    const json = state.toJSON();
    const restored = StateVariable.fromJSON(json);

    expect(restored.name).toBe(state.name);
    expect(restored.type).toBe(state.type);
    expect(restored.initialValue).toBe(state.initialValue);
  });
});

describe('ApiEndpoint', () => {
  test('should create a valid ApiEndpoint', () => {
    const endpoint = new ApiEndpoint({
      method: 'POST',
      path: '/api/users',
      description: 'Create user',
      parameters: ['name', 'email'],
    });

    expect(endpoint.method).toBe('POST');
    expect(endpoint.path).toBe('/api/users');
    expect(endpoint.description).toBe('Create user');
    expect(endpoint.parameters).toEqual(['name', 'email']);
  });

  test('should normalize method to uppercase', () => {
    const endpoint = new ApiEndpoint({
      method: 'get',
      path: '/api/users',
    });

    expect(endpoint.method).toBe('GET');
  });

  test('should throw error for invalid method', () => {
    expect(() => {
      new ApiEndpoint({
        method: 'INVALID',
        path: '/api/users',
      });
    }).toThrow('method must be one of');
  });

  test('should throw error for missing path', () => {
    expect(() => {
      new ApiEndpoint({ method: 'GET' });
    }).toThrow('ApiEndpoint: path is required');
  });

  test('should serialize and deserialize', () => {
    const endpoint = new ApiEndpoint({
      method: 'PUT',
      path: '/api/users/:id',
      description: 'Update user',
      parameters: ['id', 'name'],
    });

    const json = endpoint.toJSON();
    const restored = ApiEndpoint.fromJSON(json);

    expect(restored.method).toBe(endpoint.method);
    expect(restored.path).toBe(endpoint.path);
    expect(restored.parameters).toEqual(endpoint.parameters);
  });
});

describe('ComponentModel', () => {
  test('should create a minimal ComponentModel', () => {
    const component = new ComponentModel({
      filePath: 'src/components/Button.tsx',
      name: 'Button',
      type: ComponentType.WIDGET,
    });

    expect(component.filePath).toBe('src/components/Button.tsx');
    expect(component.name).toBe('Button');
    expect(component.type).toBe(ComponentType.WIDGET);
    expect(component.props).toEqual([]);
    expect(component.state).toEqual([]);
  });

  test('should create ComponentModel with props and state', () => {
    const component = new ComponentModel({
      filePath: 'src/pages/Login.tsx',
      name: 'LoginPage',
      type: ComponentType.PAGE,
      props: [
        { name: 'onSuccess', type: 'function', isRequired: false },
      ],
      state: [
        { name: 'email', type: 'string', initialValue: '""' },
        { name: 'password', type: 'string', initialValue: '""' },
        { name: 'isLoading', type: 'boolean', initialValue: 'false' },
      ],
      apiEndpoints: [
        { method: 'POST', path: '/auth/login', parameters: ['email', 'password'] },
      ],
    });

    expect(component.props.length).toBe(1);
    expect(component.props[0]).toBeInstanceOf(ComponentProp);
    expect(component.state.length).toBe(3);
    expect(component.state[0]).toBeInstanceOf(StateVariable);
    expect(component.apiEndpoints.length).toBe(1);
    expect(component.apiEndpoints[0]).toBeInstanceOf(ApiEndpoint);
  });

  test('should throw error for invalid type', () => {
    expect(() => {
      new ComponentModel({
        filePath: 'src/Component.tsx',
        name: 'Component',
        type: 'invalid-type',
      });
    }).toThrow('type must be one of');
  });

  test('should get required props', () => {
    const component = new ComponentModel({
      filePath: 'src/Component.tsx',
      name: 'Component',
      type: ComponentType.WIDGET,
      props: [
        { name: 'required1', type: 'string', isRequired: true },
        { name: 'optional1', type: 'string', isRequired: false },
        { name: 'required2', type: 'number', isRequired: true },
      ],
    });

    const requiredProps = component.getRequiredProps();
    expect(requiredProps.length).toBe(2);
    expect(requiredProps[0].name).toBe('required1');
    expect(requiredProps[1].name).toBe('required2');
  });

  test('should get optional props', () => {
    const component = new ComponentModel({
      filePath: 'src/Component.tsx',
      name: 'Component',
      type: ComponentType.WIDGET,
      props: [
        { name: 'required1', type: 'string', isRequired: true },
        { name: 'optional1', type: 'string', isRequired: false },
        { name: 'optional2', type: 'number', isRequired: false },
      ],
    });

    const optionalProps = component.getOptionalProps();
    expect(optionalProps.length).toBe(2);
  });

  test('should detect async operations', () => {
    const componentWithApi = new ComponentModel({
      filePath: 'src/Component.tsx',
      name: 'Component',
      type: ComponentType.WIDGET,
      apiEndpoints: [
        { method: 'GET', path: '/api/data' },
      ],
    });

    expect(componentWithApi.hasAsyncOperations()).toBe(true);

    const componentWithoutApi = ComponentModel.createMinimal();
    expect(componentWithoutApi.hasAsyncOperations()).toBe(false);
  });

  test('should calculate complexity score', () => {
    const simpleComponent = ComponentModel.createMinimal();
    expect(simpleComponent.getComplexityScore()).toBe(0);

    const complexComponent = new ComponentModel({
      filePath: 'src/Complex.tsx',
      name: 'Complex',
      type: ComponentType.PAGE,
      props: [
        { name: 'prop1', type: 'string' },
        { name: 'prop2', type: 'number' },
      ],
      state: [
        { name: 'state1', type: 'string' },
        { name: 'state2', type: 'boolean' },
        { name: 'state3', type: 'object' },
      ],
      methods: [
        { name: 'method1' },
        { name: 'method2' },
      ],
      apiEndpoints: [
        { method: 'GET', path: '/api/data1' },
        { method: 'POST', path: '/api/data2' },
      ],
      stateManagement: StateManagementPattern.REDUX,
    });

    const score = complexComponent.getComplexityScore();
    expect(score).toBeGreaterThan(5);
    expect(score).toBeLessThanOrEqual(10);
  });

  test('should recommend Flutter state management', () => {
    const simpleComponent = ComponentModel.createMinimal();
    expect(simpleComponent.recommendedFlutterStateManagement()).toBe('cubit');

    const complexComponent = new ComponentModel({
      filePath: 'src/Complex.tsx',
      name: 'Complex',
      type: ComponentType.PAGE,
      state: [
        { name: 'state1', type: 'string' },
        { name: 'state2', type: 'string' },
        { name: 'state3', type: 'string' },
        { name: 'state4', type: 'string' },
      ],
      apiEndpoints: [
        { method: 'GET', path: '/api/data' },
      ],
    });

    expect(complexComponent.recommendedFlutterStateManagement()).toBe('bloc');
  });

  test('should serialize to JSON', () => {
    const component = new ComponentModel({
      filePath: 'src/Component.tsx',
      name: 'TestComponent',
      type: ComponentType.WIDGET,
      props: [
        { name: 'title', type: 'string', isRequired: true },
      ],
      description: 'Test component',
    });

    const json = component.toJSON();
    expect(json.filePath).toBe('src/Component.tsx');
    expect(json.name).toBe('TestComponent');
    expect(json.type).toBe(ComponentType.WIDGET);
    expect(json.props).toHaveLength(1);
    expect(json.description).toBe('Test component');
  });

  test('should deserialize from JSON', () => {
    const json = {
      filePath: 'src/Component.tsx',
      name: 'TestComponent',
      type: ComponentType.WIDGET,
      props: [
        { name: 'title', type: 'string', isRequired: true },
      ],
      state: [
        { name: 'count', type: 'number', initialValue: '0' },
      ],
      apiEndpoints: [
        { method: 'GET', path: '/api/data' },
      ],
      description: 'Test component',
    };

    const component = ComponentModel.fromJSON(json);
    expect(component.name).toBe('TestComponent');
    expect(component.props).toHaveLength(1);
    expect(component.props[0]).toBeInstanceOf(ComponentProp);
    expect(component.state).toHaveLength(1);
    expect(component.state[0]).toBeInstanceOf(StateVariable);
    expect(component.apiEndpoints).toHaveLength(1);
    expect(component.apiEndpoints[0]).toBeInstanceOf(ApiEndpoint);
  });

  test('should create minimal component via static method', () => {
    const component = ComponentModel.createMinimal({
      name: 'CustomComponent',
      type: ComponentType.PAGE,
    });

    expect(component.name).toBe('CustomComponent');
    expect(component.type).toBe(ComponentType.PAGE);
    expect(component.filePath).toBe('test/Component.tsx');
  });
});

describe('ComponentType enum', () => {
  test('should have correct values', () => {
    expect(ComponentType.PAGE).toBe('page');
    expect(ComponentType.WIDGET).toBe('widget');
    expect(ComponentType.HOOK).toBe('hook');
    expect(ComponentType.CONTEXT).toBe('context');
    expect(ComponentType.HOC).toBe('hoc');
  });
});

describe('StateManagementPattern enum', () => {
  test('should have correct values', () => {
    expect(StateManagementPattern.REDUX).toBe('redux');
    expect(StateManagementPattern.ZUSTAND).toBe('zustand');
    expect(StateManagementPattern.CONTEXT).toBe('context');
    expect(StateManagementPattern.USE_STATE).toBe('useState');
    expect(StateManagementPattern.MOBX).toBe('mobx');
    expect(StateManagementPattern.RECOIL).toBe('recoil');
  });
});
