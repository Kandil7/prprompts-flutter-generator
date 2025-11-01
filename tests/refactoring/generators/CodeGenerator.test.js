/**
 * CodeGenerator.test.js
 * Tests for CodeGenerator
 */

const { CodeGenerator } = require('../../../lib/refactoring/generators/CodeGenerator');
const { WidgetModel, WidgetProperty, WidgetType, WidgetImport } = require('../../../lib/refactoring/models/WidgetModel');
const { ComponentModel, ComponentType, StateVariable } = require('../../../lib/refactoring/models/ComponentModel');

describe('CodeGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new CodeGenerator();
  });

  describe('generate', () => {
    it('should generate StatelessWidget code', () => {
      const widget = new WidgetModel({
        name: 'SimpleWidget',
        type: WidgetType.STATELESS,
        properties: [
          new WidgetProperty({
            name: 'title',
            type: 'String',
            isRequired: true,
          }),
        ],
        imports: [
          new WidgetImport({ package: 'flutter/material.dart' }),
        ],
      });

      const component = new ComponentModel({
        filePath: 'test.tsx',
        name: 'Simple',
        type: ComponentType.WIDGET,
      });

      const code = generator.generate(widget, component);

      expect(code).toContain('import \'package:flutter/material.dart\';');
      expect(code).toContain('class SimpleWidget extends StatelessWidget');
      expect(code).toContain('final String title;');
      expect(code).toContain('const SimpleWidget({');
      expect(code).toContain('required this.title');
      expect(code).toContain('Widget build(BuildContext context)');
    });

    it('should generate StatefulWidget code', () => {
      const widget = new WidgetModel({
        name: 'CounterWidget',
        type: WidgetType.STATEFUL,
        properties: [],
        imports: [
          new WidgetImport({ package: 'flutter/material.dart' }),
        ],
      });

      const component = new ComponentModel({
        filePath: 'test.tsx',
        name: 'Counter',
        type: ComponentType.WIDGET,
        state: [
          new StateVariable({ name: 'count', type: 'number', initialValue: '0' }),
        ],
      });

      const code = generator.generate(widget, component);

      expect(code).toContain('class CounterWidget extends StatefulWidget');
      expect(code).toContain('State<CounterWidget> createState()');
      expect(code).toContain('class _CounterWidgetState extends State<CounterWidget>');
      expect(code).toContain('num count = 0;');
    });

    it('should generate constructor with key parameter', () => {
      const widget = new WidgetModel({
        name: 'TestWidget',
        type: WidgetType.STATELESS,
        imports: [],
      });

      const component = ComponentModel.createMinimal();

      const code = generator.generate(widget, component);

      expect(code).toContain('Key? key');
      expect(code).toContain('super(key)'); // Positional parameter in super call
    });

    it('should generate const constructor', () => {
      const widget = new WidgetModel({
        name: 'TestWidget',
        type: WidgetType.STATELESS,
        imports: [],
      });

      const component = ComponentModel.createMinimal();

      const code = generator.generate(widget, component);

      expect(code).toContain('const TestWidget({');
    });

    it('should include required and optional parameters', () => {
      const widget = new WidgetModel({
        name: 'TestWidget',
        type: WidgetType.STATELESS,
        properties: [
          new WidgetProperty({ name: 'title', type: 'String', isRequired: true }),
          new WidgetProperty({ name: 'subtitle', type: 'String', isRequired: false }),
        ],
        imports: [],
      });

      const component = ComponentModel.createMinimal();

      const code = generator.generate(widget, component);

      expect(code).toContain('required this.title');
      expect(code).toContain('this.subtitle');
    });

    it('should generate build method with override annotation', () => {
      const widget = WidgetModel.createMinimal();
      const component = ComponentModel.createMinimal();

      const code = generator.generate(widget, component);

      expect(code).toContain('@override');
      expect(code).toContain('Widget build(BuildContext context)');
    });

    it('should generate initState if component has async operations', () => {
      const widget = new WidgetModel({
        name: 'DataWidget',
        type: WidgetType.STATEFUL,
        imports: [],
      });

      const component = new ComponentModel({
        filePath: 'test.tsx',
        name: 'Data',
        type: ComponentType.WIDGET,
        apiEndpoints: [
          { method: 'GET', path: '/api/data' },
        ],
      });

      const code = generator.generate(widget, component);

      expect(code).toContain('void initState()');
      expect(code).toContain('super.initState()');
    });
  });

  describe('getFileName', () => {
    it('should convert widget name to snake_case file name', () => {
      const widget = new WidgetModel({
        name: 'MyCustomWidget',
        type: WidgetType.STATELESS,
        imports: [],
      });

      const fileName = generator.getFileName(widget);

      expect(fileName).toBe('my_custom.dart'); // Widget suffix is stripped
    });

    it('should handle single word names', () => {
      const widget = new WidgetModel({
        name: 'Button',
        type: WidgetType.STATELESS,
        imports: [],
      });

      const fileName = generator.getFileName(widget);

      expect(fileName).toBe('button.dart');
    });
  });

  describe('generateMultiple', () => {
    it('should generate code for multiple widgets', () => {
      const widgetsAndComponents = [
        {
          widget: new WidgetModel({
            name: 'Widget1',
            type: WidgetType.STATELESS,
            imports: [],
          }),
          component: ComponentModel.createMinimal({ name: 'Component1' }),
        },
        {
          widget: new WidgetModel({
            name: 'Widget2',
            type: WidgetType.STATELESS,
            imports: [],
          }),
          component: ComponentModel.createMinimal({ name: 'Component2' }),
        },
      ];

      const results = generator.generateMultiple(widgetsAndComponents);

      expect(results.length).toBe(2);
      expect(results[0].fileName).toBe('widget_1.dart'); // Snake case conversion
      expect(results[1].fileName).toBe('widget_2.dart');
      expect(results[0].code).toContain('class Widget1');
      expect(results[1].code).toContain('class Widget2');
    });
  });

  describe('_generateImports', () => {
    it('should format imports correctly', () => {
      const widget = new WidgetModel({
        name: 'TestWidget',
        type: WidgetType.STATELESS,
        imports: [
          new WidgetImport({ package: 'flutter/material.dart' }),
          new WidgetImport({ package: 'dart:async' }),
        ],
      });

      const imports = generator._generateImports(widget);

      expect(imports).toContain("import 'package:flutter/material.dart';");
      expect(imports).toContain("import 'dart:async';");
    });

    it('should remove duplicate imports', () => {
      const widget = new WidgetModel({
        name: 'TestWidget',
        type: WidgetType.STATELESS,
        imports: [
          new WidgetImport({ package: 'flutter/material.dart' }),
          new WidgetImport({ package: 'flutter/material.dart' }),
        ],
      });

      const imports = generator._generateImports(widget);

      const materialImports = imports.filter(i => i.includes('material.dart'));
      expect(materialImports.length).toBe(1);
    });
  });

  describe('_convertType', () => {
    it('should convert TypeScript types to Dart types', () => {
      expect(generator._convertType('string')).toBe('String');
      expect(generator._convertType('number')).toBe('num');
      expect(generator._convertType('boolean')).toBe('bool');
      expect(generator._convertType('Array')).toBe('List');
      expect(generator._convertType('object')).toBe('Map<String, dynamic>');
    });

    it('should handle unknown types as dynamic', () => {
      expect(generator._convertType('UnknownType')).toBe('dynamic');
    });
  });

  describe('_getDefaultValue', () => {
    it('should return default values for common types', () => {
      expect(generator._getDefaultValue('String')).toBe("''");
      expect(generator._getDefaultValue('num')).toBe('0');
      expect(generator._getDefaultValue('int')).toBe('0');
      expect(generator._getDefaultValue('bool')).toBe('false');
      expect(generator._getDefaultValue('List')).toBe('const []');
      expect(generator._getDefaultValue('Map')).toBe('const {}');
    });

    it('should return null for unknown types', () => {
      expect(generator._getDefaultValue('CustomType')).toBe('null');
    });
  });
});
