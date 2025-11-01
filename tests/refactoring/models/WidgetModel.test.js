/**
 * WidgetModel.test.js
 * Unit tests for WidgetModel and related classes
 */

const {
  WidgetModel,
  WidgetProperty,
  WidgetChild,
  WidgetImport,
  WidgetType,
  StateManagementChoice,
} = require('../../../lib/refactoring/models/WidgetModel');

describe('WidgetProperty', () => {
  test('should create a valid WidgetProperty', () => {
    const property = new WidgetProperty({
      name: 'title',
      type: 'String',
      isRequired: true,
      isFinal: true,
    });

    expect(property.name).toBe('title');
    expect(property.type).toBe('String');
    expect(property.isRequired).toBe(true);
    expect(property.isFinal).toBe(true);
  });

  test('should throw error for missing name', () => {
    expect(() => {
      new WidgetProperty({ type: 'String' });
    }).toThrow('WidgetProperty: name is required');
  });

  test('should generate Dart declaration', () => {
    const property = new WidgetProperty({
      name: 'title',
      type: 'String',
      isRequired: true,
      isFinal: true,
    });

    expect(property.toDartDeclaration()).toBe('final String title;');
  });

  test('should generate nullable Dart declaration', () => {
    const property = new WidgetProperty({
      name: 'subtitle',
      type: 'String',
      isRequired: false,
      isFinal: true,
    });

    expect(property.toDartDeclaration()).toBe('final String? subtitle;');
  });

  test('should serialize and deserialize', () => {
    const property = new WidgetProperty({
      name: 'count',
      type: 'int',
      isRequired: true,
      isFinal: false,
      defaultValue: '0',
    });

    const json = property.toJSON();
    const restored = WidgetProperty.fromJSON(json);

    expect(restored.name).toBe(property.name);
    expect(restored.type).toBe(property.type);
    expect(restored.isFinal).toBe(property.isFinal);
  });
});

describe('WidgetChild', () => {
  test('should create a valid WidgetChild', () => {
    const child = new WidgetChild({
      name: 'Container',
      type: 'Container',
      properties: { padding: '8.0' },
    });

    expect(child.name).toBe('Container');
    expect(child.type).toBe('Container');
    expect(child.properties).toEqual({ padding: '8.0' });
    expect(child.children).toEqual([]);
  });

  test('should create nested children', () => {
    const child = new WidgetChild({
      name: 'Column',
      type: 'Column',
      children: [
        { name: 'Text1', type: 'Text', properties: { text: 'Hello' } },
        { name: 'Text2', type: 'Text', properties: { text: 'World' } },
      ],
    });

    expect(child.children).toHaveLength(2);
    expect(child.children[0]).toBeInstanceOf(WidgetChild);
    expect(child.children[1]).toBeInstanceOf(WidgetChild);
  });

  test('should serialize and deserialize with nested children', () => {
    const child = new WidgetChild({
      name: 'Container',
      type: 'Container',
      children: [
        { name: 'Text', type: 'Text', properties: { text: 'Hello' } },
      ],
    });

    const json = child.toJSON();
    const restored = WidgetChild.fromJSON(json);

    expect(restored.children).toHaveLength(1);
    expect(restored.children[0]).toBeInstanceOf(WidgetChild);
  });
});

describe('WidgetImport', () => {
  test('should create package import', () => {
    const imp = new WidgetImport({
      package: 'flutter/material.dart',
    });

    expect(imp.package).toBe('flutter/material.dart');
    expect(imp.toDartImport()).toBe("import 'package:flutter/material.dart';");
  });

  test('should create import with alias', () => {
    const imp = new WidgetImport({
      package: 'flutter/material.dart',
      as: 'material',
    });

    expect(imp.toDartImport()).toBe("import 'package:flutter/material.dart' as material;");
  });

  test('should create import with show', () => {
    const imp = new WidgetImport({
      package: 'flutter/material.dart',
      show: ['Text', 'Container'],
    });

    expect(imp.toDartImport()).toBe("import 'package:flutter/material.dart' show Text, Container;");
  });

  test('should create import with hide', () => {
    const imp = new WidgetImport({
      package: 'flutter/material.dart',
      hide: ['Navigator'],
    });

    expect(imp.toDartImport()).toBe("import 'package:flutter/material.dart' hide Navigator;");
  });

  test('should create relative import', () => {
    const imp = new WidgetImport({
      path: '../widgets/custom_button.dart',
    });

    expect(imp.toDartImport()).toBe("import '../widgets/custom_button.dart';");
  });

  test('should throw error when both package and path are missing', () => {
    expect(() => {
      new WidgetImport({});
    }).toThrow('either package or path is required');
  });

  test('should serialize and deserialize', () => {
    const imp = new WidgetImport({
      package: 'flutter_bloc/flutter_bloc.dart',
      as: 'bloc',
      show: ['BlocProvider', 'BlocBuilder'],
    });

    const json = imp.toJSON();
    const restored = WidgetImport.fromJSON(json);

    expect(restored.package).toBe(imp.package);
    expect(restored.as).toBe(imp.as);
    expect(restored.show).toEqual(imp.show);
  });
});

describe('WidgetModel', () => {
  test('should create a minimal WidgetModel', () => {
    const widget = new WidgetModel({
      name: 'MyWidget',
      type: WidgetType.STATELESS,
    });

    expect(widget.name).toBe('MyWidget');
    expect(widget.type).toBe(WidgetType.STATELESS);
    expect(widget.properties).toEqual([]);
    expect(widget.children).toEqual([]);
    expect(widget.imports).toEqual([]);
  });

  test('should create WidgetModel with properties', () => {
    const widget = new WidgetModel({
      name: 'LoginPage',
      type: WidgetType.STATEFUL,
      properties: [
        { name: 'title', type: 'String', isRequired: true },
        { name: 'subtitle', type: 'String', isRequired: false },
      ],
      stateManagement: StateManagementChoice.BLOC,
    });

    expect(widget.properties).toHaveLength(2);
    expect(widget.properties[0]).toBeInstanceOf(WidgetProperty);
    expect(widget.stateManagement).toBe(StateManagementChoice.BLOC);
  });

  test('should throw error for invalid type', () => {
    expect(() => {
      new WidgetModel({
        name: 'MyWidget',
        type: 'invalid-type',
      });
    }).toThrow('type must be one of');
  });

  test('should get required properties', () => {
    const widget = new WidgetModel({
      name: 'MyWidget',
      type: WidgetType.STATELESS,
      properties: [
        { name: 'required1', type: 'String', isRequired: true },
        { name: 'optional1', type: 'String', isRequired: false },
        { name: 'required2', type: 'int', isRequired: true },
      ],
    });

    const requiredProps = widget.getRequiredProperties();
    expect(requiredProps).toHaveLength(2);
  });

  test('should detect if needs state management', () => {
    const stateless = new WidgetModel({
      name: 'StatelessWidget',
      type: WidgetType.STATELESS,
    });
    expect(stateless.needsStateManagement()).toBe(false);

    const stateful = new WidgetModel({
      name: 'StatefulWidget',
      type: WidgetType.STATEFUL,
    });
    expect(stateful.needsStateManagement()).toBe(true);

    const withBloc = new WidgetModel({
      name: 'BlocWidget',
      type: WidgetType.STATELESS,
      stateManagement: StateManagementChoice.BLOC,
    });
    expect(withBloc.needsStateManagement()).toBe(true);
  });

  test('should generate class name', () => {
    const widget1 = new WidgetModel({
      name: 'Login',
      type: WidgetType.STATELESS,
    });
    expect(widget1.getClassName()).toBe('LoginWidget');

    const widget2 = new WidgetModel({
      name: 'LoginWidget',
      type: WidgetType.STATELESS,
    });
    expect(widget2.getClassName()).toBe('LoginWidget');
  });

  test('should generate file name', () => {
    const widget = new WidgetModel({
      name: 'LoginPage',
      type: WidgetType.STATELESS,
    });
    expect(widget.getFileName()).toBe('login_page.dart');
  });

  test('should add import', () => {
    const widget = new WidgetModel({
      name: 'MyWidget',
      type: WidgetType.STATELESS,
    });

    widget.addImport({
      package: 'flutter/material.dart',
    });

    expect(widget.imports).toHaveLength(1);
    expect(widget.imports[0]).toBeInstanceOf(WidgetImport);
  });

  test('should add property', () => {
    const widget = new WidgetModel({
      name: 'MyWidget',
      type: WidgetType.STATELESS,
    });

    widget.addProperty({
      name: 'title',
      type: 'String',
      isRequired: true,
    });

    expect(widget.properties).toHaveLength(1);
    expect(widget.properties[0]).toBeInstanceOf(WidgetProperty);
  });

  test('should add child', () => {
    const widget = new WidgetModel({
      name: 'MyWidget',
      type: WidgetType.STATELESS,
    });

    widget.addChild({
      name: 'Container',
      type: 'Container',
    });

    expect(widget.children).toHaveLength(1);
    expect(widget.children[0]).toBeInstanceOf(WidgetChild);
  });

  test('should generate skeleton code', () => {
    const widget = new WidgetModel({
      name: 'MyButton',
      type: WidgetType.STATELESS,
      properties: [
        { name: 'onPressed', type: 'VoidCallback', isRequired: true },
        { name: 'label', type: 'String', isRequired: true },
      ],
      imports: [
        { package: 'flutter/material.dart' },
      ],
    });

    const code = widget.generateSkeletonCode();
    expect(code).toContain("import 'package:flutter/material.dart';");
    expect(code).toContain('class MyButtonWidget extends StatelessWidget');
    expect(code).toContain('final VoidCallback onPressed;');
    expect(code).toContain('final String label;');
    expect(code).toContain('Widget build(BuildContext context)');
  });

  test('should serialize to JSON', () => {
    const widget = new WidgetModel({
      name: 'TestWidget',
      type: WidgetType.STATELESS,
      properties: [
        { name: 'title', type: 'String', isRequired: true },
      ],
      description: 'Test widget',
    });

    const json = widget.toJSON();
    expect(json.name).toBe('TestWidget');
    expect(json.type).toBe(WidgetType.STATELESS);
    expect(json.properties).toHaveLength(1);
    expect(json.description).toBe('Test widget');
  });

  test('should deserialize from JSON', () => {
    const json = {
      name: 'TestWidget',
      type: WidgetType.STATEFUL,
      properties: [
        { name: 'title', type: 'String', isRequired: true },
      ],
      imports: [
        { package: 'flutter/material.dart' },
      ],
      stateManagement: StateManagementChoice.CUBIT,
    };

    const widget = WidgetModel.fromJSON(json);
    expect(widget.name).toBe('TestWidget');
    expect(widget.properties).toHaveLength(1);
    expect(widget.properties[0]).toBeInstanceOf(WidgetProperty);
    expect(widget.imports).toHaveLength(1);
    expect(widget.imports[0]).toBeInstanceOf(WidgetImport);
    expect(widget.stateManagement).toBe(StateManagementChoice.CUBIT);
  });

  test('should create minimal widget via static method', () => {
    const widget = WidgetModel.createMinimal({
      name: 'CustomWidget',
      type: WidgetType.STATEFUL,
    });

    expect(widget.name).toBe('CustomWidget');
    expect(widget.type).toBe(WidgetType.STATEFUL);
  });
});

describe('WidgetType enum', () => {
  test('should have correct values', () => {
    expect(WidgetType.STATELESS).toBe('stateless');
    expect(WidgetType.STATEFUL).toBe('stateful');
    expect(WidgetType.INHERITED).toBe('inherited');
    expect(WidgetType.PROVIDER).toBe('provider');
    expect(WidgetType.CONSUMER).toBe('consumer');
  });
});

describe('StateManagementChoice enum', () => {
  test('should have correct values', () => {
    expect(StateManagementChoice.BLOC).toBe('bloc');
    expect(StateManagementChoice.CUBIT).toBe('cubit');
    expect(StateManagementChoice.PROVIDER).toBe('provider');
    expect(StateManagementChoice.RIVERPOD).toBe('riverpod');
    expect(StateManagementChoice.GET_X).toBe('getx');
  });
});
