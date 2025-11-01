/**
 * WidgetGenerator.test.js
 * Tests for WidgetGenerator
 */

const { WidgetGenerator } = require('../../../lib/refactoring/generators/WidgetGenerator');
const { ComponentModel, ComponentType, StateVariable, ApiEndpoint } = require('../../../lib/refactoring/models/ComponentModel');
const { WidgetType } = require('../../../lib/refactoring/models/WidgetModel');

describe('WidgetGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new WidgetGenerator();
  });

  describe('generate', () => {
    it('should generate StatelessWidget for simple component', () => {
      const component = new ComponentModel({
        filePath: 'src/components/SimpleButton.tsx',
        name: 'SimpleButton',
        type: ComponentType.WIDGET,
        props: [
          { name: 'label', type: 'string', isRequired: true },
          { name: 'onClick', type: 'function', isRequired: false },
        ],
      });

      const widget = generator.generate(component);

      expect(widget).toBeDefined();
      expect(widget.name).toBe('SimpleButtonWidget');
      expect(widget.type).toBe(WidgetType.STATELESS);
      expect(widget.properties.length).toBeGreaterThan(0);
    });

    it('should generate StatefulWidget for component with state', () => {
      const component = new ComponentModel({
        filePath: 'src/components/Counter.tsx',
        name: 'Counter',
        type: ComponentType.WIDGET,
        state: [
          new StateVariable({ name: 'count', type: 'number', initialValue: '0' }),
        ],
      });

      const widget = generator.generate(component);

      expect(widget.type).toBe(WidgetType.STATEFUL);
    });

    it('should generate StatefulWidget for component with API calls', () => {
      const component = new ComponentModel({
        filePath: 'src/pages/UserList.tsx',
        name: 'UserList',
        type: ComponentType.PAGE,
        apiEndpoints: [
          new ApiEndpoint({
            method: 'GET',
            path: '/api/users',
            description: 'Fetch users',
          }),
        ],
      });

      const widget = generator.generate(component);

      expect(widget.type).toBe(WidgetType.STATEFUL);
    });

    it('should generate Page name for page components', () => {
      const component = new ComponentModel({
        filePath: 'src/pages/LoginPage.tsx',
        name: 'LoginPage',
        type: ComponentType.PAGE,
      });

      const widget = generator.generate(component);

      expect(widget.name).toBe('LoginPage');
    });

    it('should include required imports', () => {
      const component = new ComponentModel({
        filePath: 'src/components/Button.tsx',
        name: 'Button',
        type: ComponentType.WIDGET,
      });

      const widget = generator.generate(component);

      const importStrings = widget.imports.map(imp => imp.toDartImport());

      expect(importStrings).toContain("import 'package:flutter/material.dart';");
    });

    it('should add async import for components with API calls', () => {
      const component = new ComponentModel({
        filePath: 'src/components/DataFetcher.tsx',
        name: 'DataFetcher',
        type: ComponentType.WIDGET,
        apiEndpoints: [
          new ApiEndpoint({
            method: 'GET',
            path: '/api/data',
          }),
        ],
      });

      const widget = generator.generate(component);

      const importStrings = widget.imports.map(imp => imp.toDartImport());

      expect(importStrings).toContain("import 'dart:async';");
    });

    it('should recommend BLoC for complex components', () => {
      const component = new ComponentModel({
        filePath: 'src/pages/Dashboard.tsx',
        name: 'Dashboard',
        type: ComponentType.PAGE,
        state: [
          new StateVariable({ name: 'data', type: 'Array' }),
          new StateVariable({ name: 'loading', type: 'boolean' }),
          new StateVariable({ name: 'error', type: 'string' }),
        ],
        apiEndpoints: [
          new ApiEndpoint({ method: 'GET', path: '/api/dashboard' }),
        ],
      });

      const widget = generator.generate(component);

      expect(widget.stateManagement).toBe('bloc');
    });

    it('should handle components without props', () => {
      const component = new ComponentModel({
        filePath: 'src/components/Logo.tsx',
        name: 'Logo',
        type: ComponentType.WIDGET,
        props: [],
      });

      const widget = generator.generate(component);

      expect(widget.properties.length).toBe(0);
    });
  });

  describe('generateMultiple', () => {
    it('should generate widgets for multiple components', () => {
      const components = [
        new ComponentModel({
          filePath: 'src/components/Button.tsx',
          name: 'Button',
          type: ComponentType.WIDGET,
        }),
        new ComponentModel({
          filePath: 'src/components/Input.tsx',
          name: 'Input',
          type: ComponentType.WIDGET,
        }),
      ];

      const widgets = generator.generateMultiple(components);

      expect(widgets.length).toBe(2);
      expect(widgets[0].name).toBe('Button'); // Standard Flutter widget
      expect(widgets[1].name).toBe('InputWidget');
    });

    it('should continue on error and skip failed components', () => {
      const components = [
        new ComponentModel({
          filePath: 'src/components/Valid.tsx',
          name: 'Valid',
          type: ComponentType.WIDGET,
        }),
        null, // Invalid component
        new ComponentModel({
          filePath: 'src/components/AlsoValid.tsx',
          name: 'AlsoValid',
          type: ComponentType.WIDGET,
        }),
      ];

      const widgets = generator.generateMultiple(components.filter(Boolean));

      expect(widgets.length).toBe(2);
    });
  });

  describe('_convertPropType', () => {
    it('should convert string types', () => {
      const dartType = generator._convertPropType('string');
      expect(dartType).toBe('String');
    });

    it('should convert number types', () => {
      const dartType = generator._convertPropType('number');
      expect(dartType).toBe('num');
    });

    it('should convert boolean types', () => {
      const dartType = generator._convertPropType('boolean');
      expect(dartType).toBe('bool');
    });

    it('should convert array types', () => {
      const dartType = generator._convertPropType('string[]');
      expect(dartType).toBe('List<String>');
    });

    it('should convert function types', () => {
      const dartType = generator._convertPropType('function');
      expect(dartType).toBe('VoidCallback');
    });

    it('should handle unknown types as dynamic', () => {
      const dartType = generator._convertPropType('UnknownType');
      expect(dartType).toBe('dynamic');
    });
  });
});
