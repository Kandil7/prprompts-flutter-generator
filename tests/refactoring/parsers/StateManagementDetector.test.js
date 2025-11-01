/**
 * StateManagementDetector tests
 */

const { StateManagementDetector, FlutterStateManagement } = require('../../../lib/refactoring/parsers/StateManagementDetector');
const { StateManagementPattern } = require('../../../lib/refactoring/models/ComponentModel');

describe('StateManagementDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new StateManagementDetector();
  });

  describe('Redux Detection', () => {
    test('should detect Redux usage', () => {
      const code = `
        import { useSelector, useDispatch } from 'react-redux';

        const MyComponent = () => {
          const state = useSelector(state => state.user);
          const dispatch = useDispatch();

          return <div>{state.name}</div>;
        };
      `;

      const result = detector.detect(code, 'test.jsx');
      expect(result.pattern).toBe(StateManagementPattern.REDUX);
      expect(result.flutterRecommendation).toBe(FlutterStateManagement.BLOC);
    });
  });

  describe('Zustand Detection', () => {
    test('should detect Zustand usage', () => {
      const code = `
        import create from 'zustand';

        const useStore = create((set) => ({
          count: 0,
          increment: () => set((state) => ({ count: state.count + 1 })),
        }));
      `;

      const result = detector.detect(code, 'test.js');
      expect(result.pattern).toBe(StateManagementPattern.ZUSTAND);
      expect(result.flutterRecommendation).toBe(FlutterStateManagement.CUBIT);
    });
  });

  describe('Context API Detection', () => {
    test('should detect Context API usage', () => {
      const code = `
        import React, { createContext, useContext } from 'react';

        const ThemeContext = createContext();

        const MyComponent = () => {
          const theme = useContext(ThemeContext);
          return <div>{theme}</div>;
        };
      `;

      const result = detector.detect(code, 'test.jsx');
      expect(result.pattern).toBe(StateManagementPattern.CONTEXT);
      expect(result.flutterRecommendation).toBe(FlutterStateManagement.PROVIDER);
    });
  });

  describe('useState Detection', () => {
    test('should detect useState as default', () => {
      const code = `
        import React, { useState } from 'react';

        const Counter = () => {
          const [count, setCount] = useState(0);
          return <div>{count}</div>;
        };
      `;

      const result = detector.detect(code, 'test.jsx');
      expect(result.pattern).toBe(StateManagementPattern.USE_STATE);
      expect(result.flutterRecommendation).toBe(FlutterStateManagement.CUBIT);
    });
  });

  describe('Complexity Assessment', () => {
    test('should return higher complexity for Redux', () => {
      const code = `import { useSelector } from 'react-redux';`;
      const result = detector.detect(code, 'test.js');
      expect(result.complexity).toBeGreaterThan(5);
    });

    test('should return lower complexity for useState', () => {
      const code = `import { useState } from 'react';`;
      const result = detector.detect(code, 'test.js');
      expect(result.complexity).toBeLessThan(5);
    });
  });

  describe('Flutter Suggestion Generation', () => {
    test('should generate Flutter suggestion', () => {
      const detectionResult = {
        pattern: StateManagementPattern.REDUX,
        flutterRecommendation: FlutterStateManagement.BLOC,
        stateStructure: {},
        actions: [],
        complexity: 8,
      };

      const suggestion = detector.generateFlutterSuggestion(detectionResult);
      expect(suggestion.stateManagement).toBe(FlutterStateManagement.BLOC);
      expect(suggestion.packages).toContain('flutter_bloc: ^8.1.0');
    });
  });
});
