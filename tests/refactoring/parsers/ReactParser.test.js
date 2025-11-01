/**
 * ReactParser tests
 */

const path = require('path');
const fs = require('fs');
const { ReactParser } = require('../../../lib/refactoring/parsers/ReactParser');
const { ComponentType } = require('../../../lib/refactoring/models/ComponentModel');

describe('ReactParser', () => {
  let parser;

  beforeEach(() => {
    parser = new ReactParser();
  });

  describe('Simple Functional Component', () => {
    let component;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../fixtures/react/SimpleComponent.tsx');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      component = parser.parse(sourceCode, filePath);
    });

    test('should parse component successfully', () => {
      expect(component).not.toBeNull();
    });

    test('should extract component name', () => {
      expect(component.name).toBe('SimpleComponent');
    });

    test('should identify as widget type', () => {
      expect(component.type).toBe(ComponentType.WIDGET);
    });

    test('should extract props', () => {
      expect(component.props.length).toBeGreaterThan(0);
      const propNames = component.props.map(p => p.name);
      expect(propNames).toContain('title');
      expect(propNames).toContain('onPress');
    });

    test('should detect exports', () => {
      expect(component.exports.length).toBeGreaterThan(0);
    });
  });

  describe('Stateful Component', () => {
    let component;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../fixtures/react/StatefulComponent.tsx');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      component = parser.parse(sourceCode, filePath);
    });

    test('should parse component successfully', () => {
      expect(component).not.toBeNull();
    });

    test('should extract component name', () => {
      expect(component.name).toBe('LoginPage');
    });

    test('should extract state variables', () => {
      expect(component.state.length).toBeGreaterThanOrEqual(2);
      const stateNames = component.state.map(s => s.name);
      expect(stateNames).toContain('email');
      expect(stateNames).toContain('password');
    });

    test('should detect hooks', () => {
      expect(component.hooks).toContain('useState');
      expect(component.hooks).toContain('useEffect');
    });

    test('should have async operations', () => {
      expect(component.hasAsyncOperations()).toBe(true);
    });

    test('should recommend BLoC for state management', () => {
      const recommendation = component.recommendedFlutterStateManagement();
      expect(recommendation).toBe('bloc');
    });

    test('should have complexity score greater than 0', () => {
      const complexity = component.getComplexityScore();
      expect(complexity).toBeGreaterThan(0);
    });
  });

  describe('Class Component', () => {
    let component;

    beforeAll(() => {
      const filePath = path.join(__dirname, '../fixtures/react/ClassComponent.tsx');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      component = parser.parse(sourceCode, filePath);
    });

    test('should parse class component successfully', () => {
      expect(component).not.toBeNull();
    });

    test('should extract component name', () => {
      expect(component.name).toBe('UserProfile');
    });

    test('should extract state from constructor', () => {
      expect(component.state.length).toBeGreaterThan(0);
      const stateNames = component.state.map(s => s.name);
      expect(stateNames).toContain('user');
      expect(stateNames).toContain('isLoading');
    });

    test('should extract methods', () => {
      expect(component.methods.length).toBeGreaterThan(0);
      const methodNames = component.methods.map(m => m.name);
      expect(methodNames).toContain('fetchUser');
    });

    test('should extract required props', () => {
      const requiredProps = component.getRequiredProps();
      expect(Array.isArray(requiredProps)).toBe(true);
    });
  });

  describe('Component Model Methods', () => {
    test('should calculate complexity score', () => {
      const filePath = path.join(__dirname, '../fixtures/react/StatefulComponent.tsx');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      const component = parser.parse(sourceCode, filePath);

      const complexity = component.getComplexityScore();
      expect(typeof complexity).toBe('number');
      expect(complexity).toBeGreaterThanOrEqual(0);
      expect(complexity).toBeLessThanOrEqual(10);
    });

    test('should serialize to JSON and back', () => {
      const filePath = path.join(__dirname, '../fixtures/react/SimpleComponent.tsx');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      const component = parser.parse(sourceCode, filePath);

      const json = component.toJSON();
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('type');
      expect(json).toHaveProperty('props');
      expect(json).toHaveProperty('state');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JavaScript', () => {
      const invalidCode = 'const x = {{{invalid';

      expect(() => {
        parser.parse(invalidCode, 'test.jsx');
      }).toThrow();
    });

    test('should return null for non-component files', () => {
      const nonComponent = `
        const util = (x) => x * 2;
        export default util;
      `;

      const result = parser.parse(nonComponent, 'utils.js');
      expect(result).toBeNull();
    });
  });

  describe('Multiple Files Parsing', () => {
    test('should parse multiple files', () => {
      const files = [
        {
          path: path.join(__dirname, '../fixtures/react/SimpleComponent.tsx'),
          content: fs.readFileSync(path.join(__dirname, '../fixtures/react/SimpleComponent.tsx'), 'utf-8'),
        },
        {
          path: path.join(__dirname, '../fixtures/react/StatefulComponent.tsx'),
          content: fs.readFileSync(path.join(__dirname, '../fixtures/react/StatefulComponent.tsx'), 'utf-8'),
        },
      ];

      const components = parser.parseMultiple(files);
      expect(components.length).toBe(2);
      expect(components[0].name).toBeTruthy();
      expect(components[1].name).toBeTruthy();
    });
  });
});
