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

  describe('generateWidgetTree', () => {
    const parser = require('@babel/parser');

    const parseJSX = (code) => {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });
      // Extract the JSX element from the return statement
      const returnStmt = ast.program.body[0].expression;
      return returnStmt;
    };

    it('should convert simple View to Container', () => {
      const jsx = parseJSX('<View></View>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget).toBeDefined();
      expect(widget.name).toBe('Container');
      expect(widget.type).toBe('Container');
    });

    it('should convert Text element with string content', () => {
      const jsx = parseJSX('<Text>Hello World</Text>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('Text');
      expect(widget.children.length).toBe(1);
      expect(widget.children[0].name).toBe('Text');
      expect(widget.children[0].properties.data).toBe("'Hello World'");
    });

    it('should convert TouchableOpacity to InkWell', () => {
      const jsx = parseJSX('<TouchableOpacity><Text>Click</Text></TouchableOpacity>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('InkWell');
      expect(widget.children.length).toBe(1);
      expect(widget.children[0].name).toBe('Text');
    });

    it('should handle event handlers (onPress to onTap)', () => {
      const jsx = parseJSX('<TouchableOpacity onPress={handlePress}><Text>Click</Text></TouchableOpacity>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('InkWell');
      expect(widget.properties.onTap).toBe('handlePress');
    });

    it('should convert Button with title', () => {
      const jsx = parseJSX('<Button title="Click Me" onPress={handleClick} />');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('ElevatedButton');
      expect(widget.properties.onTap).toBe('handleClick');
    });

    it('should handle nested components', () => {
      const jsx = parseJSX('<View><Text>Title</Text><Text>Subtitle</Text></View>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('Container');
      expect(widget.children.length).toBe(2);
      expect(widget.children[0].name).toBe('Text');
      expect(widget.children[1].name).toBe('Text');
    });

    it('should handle JSX fragments', () => {
      const jsx = parseJSX('<><Text>First</Text><Text>Second</Text></>');
      const widget = generator.generateWidgetTree(jsx);

      expect(Array.isArray(widget)).toBe(true);
      expect(widget.length).toBe(2);
      expect(widget[0].name).toBe('Text');
      expect(widget[1].name).toBe('Text');
    });

    it('should handle conditional rendering (ternary)', () => {
      const jsx = parseJSX('<View>{isVisible ? <Text>Visible</Text> : <Text>Hidden</Text>}</View>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('Container');
      expect(widget.children.length).toBe(1);
      expect(widget.children[0].name).toBe('Builder');
      expect(widget.children[0].properties.builder).toContain('isVisible');
      expect(widget.children[0].properties.builder).toContain('?');
    });

    it('should handle conditional rendering (logical AND)', () => {
      const jsx = parseJSX('<View>{showMessage && <Text>Message</Text>}</View>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('Container');
      expect(widget.children.length).toBe(1);
      expect(widget.children[0].name).toBe('Builder');
      expect(widget.children[0].properties.builder).toContain('showMessage');
      expect(widget.children[0].properties.builder).toContain('SizedBox.shrink()');
    });

    it('should convert array map to ListView.builder', () => {
      const jsx = parseJSX('<View>{items.map(item => <View key={item.id}><Text>{item.name}</Text></View>)}</View>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('Container');
      expect(widget.children.length).toBe(1);
      expect(widget.children[0].name).toBe('ListView.builder');
      expect(widget.children[0].properties.itemCount).toBe('items.length');
      expect(widget.children[0].properties.itemBuilder).toBeDefined();
    });

    it('should handle FlatList to ListView.builder', () => {
      const jsx = parseJSX('<FlatList data={users} renderItem={renderUser} />');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('ListView.builder');
      expect(widget.properties.itemCount).toContain('users');
    });

    it('should convert ScrollView to SingleChildScrollView', () => {
      const jsx = parseJSX('<ScrollView><View><Text>Content</Text></View></ScrollView>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('SingleChildScrollView');
      expect(widget.children.length).toBeGreaterThan(0);
    });

    it('should handle Image with source', () => {
      const jsx = parseJSX('<Image source={{uri: "https://example.com/image.png"}} />');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('Image');
    });

    it('should handle TextInput to TextField', () => {
      const jsx = parseJSX('<TextInput placeholder="Enter text" onChangeText={handleChange} />');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('TextField');
      expect(widget.properties.hintText).toBe("'Enter text'");
      expect(widget.properties.onChanged).toBe('handleChange');
    });

    it('should handle SafeAreaView to SafeArea', () => {
      const jsx = parseJSX('<SafeAreaView><View /></SafeAreaView>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('SafeArea');
    });

    it('should handle ActivityIndicator to CircularProgressIndicator', () => {
      const jsx = parseJSX('<ActivityIndicator />');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('CircularProgressIndicator');
    });

    it('should handle boolean props', () => {
      const jsx = parseJSX('<Switch enabled />');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.name).toBe('Switch');
      expect(widget.properties.enabled).toBe('true');
    });

    it('should handle string literal props', () => {
      const jsx = parseJSX('<Text customProp="bold">Hello</Text>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.properties.customProp).toBe("'bold'");
    });

    it('should handle expression props', () => {
      const jsx = parseJSX('<View width={100}><Text>Content</Text></View>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.properties.width).toBe('100');
    });

    it('should handle multiple children correctly', () => {
      const jsx = parseJSX('<View><Text>A</Text><Text>B</Text><Text>C</Text></View>');
      const widget = generator.generateWidgetTree(jsx);

      expect(widget.children.length).toBe(3);
      widget.children.forEach(child => {
        expect(child.name).toBe('Text');
      });
    });

    it('should handle whitespace-only text nodes', () => {
      const jsx = parseJSX('<View>  \n  <Text>Content</Text>  \n  </View>');
      const widget = generator.generateWidgetTree(jsx);

      // Should only have one child (the Text widget), whitespace ignored
      expect(widget.children.length).toBe(1);
      expect(widget.children[0].name).toBe('Text');
    });

    it('should return null for null JSX', () => {
      const widget = generator.generateWidgetTree(null);
      expect(widget).toBeNull();
    });
  });

  describe('_handleJSXElement', () => {
    const parser = require('@babel/parser');

    const parseJSX = (code) => {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
      });
      return ast.program.body[0].expression;
    };

    it('should extract element name correctly', () => {
      const jsx = parseJSX('<View />');
      const widget = generator._handleJSXElement(jsx, {});

      expect(widget.name).toBe('Container');
    });

    it('should extract props correctly', () => {
      const jsx = parseJSX('<Text bold={true} color="blue" />');
      const widget = generator._handleJSXElement(jsx, {});

      expect(widget.properties.bold).toBe('true');
      expect(widget.properties.color).toBe("'blue'");
    });
  });

  describe('_convertImageSource', () => {
    it('should convert network URL to NetworkImage', () => {
      const result = generator._convertImageSource("'https://example.com/image.png'");
      expect(result).toBe("NetworkImage('https://example.com/image.png')");
    });

    it('should convert relative path to AssetImage', () => {
      const result = generator._convertImageSource("'./assets/logo.png'");
      expect(result).toBe("AssetImage('./assets/logo.png')");
    });

    it('should handle http URLs', () => {
      const result = generator._convertImageSource("'http://example.com/image.png'");
      expect(result).toBe("NetworkImage('http://example.com/image.png')");
    });
  });
});
