/**
 * Style Integration Tests
 * Tests the integration between WidgetGenerator and StyleConverter
 */

const { WidgetGenerator } = require('../../../lib/refactoring/generators/WidgetGenerator');

describe('WidgetGenerator - Style Integration', () => {
  let generator;

  beforeEach(() => {
    generator = new WidgetGenerator();
  });

  describe('Inline Style Object Conversion', () => {
    test('should convert backgroundColor to Flutter decoration', () => {
      const styleValue = "{backgroundColor: 'red'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toBeDefined();
      expect(result.decoration).toContain('BoxDecoration');
      expect(result.decoration).toContain('Colors.red');
    });

    test('should convert padding to EdgeInsets', () => {
      const styleValue = "{padding: 10}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.padding).toBeDefined();
      expect(result.padding).toContain('EdgeInsets.all(10)');
    });

    test('should convert multiple style properties', () => {
      const styleValue = "{backgroundColor: 'blue', padding: 16, margin: 8}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toContain('Colors.blue');
      expect(result.padding).toContain('EdgeInsets.all(16)');
      expect(result.margin).toContain('EdgeInsets.all(8)');
    });

    test('should convert hex colors', () => {
      const styleValue = "{backgroundColor: '#FF5733'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toContain('Color(0x');
      expect(result.decoration).toContain('FF5733');
    });

    test('should convert rgba colors', () => {
      const styleValue = "{backgroundColor: 'rgba(255, 0, 0, 0.5)'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toContain('Color.fromRGBO');
      expect(result.decoration).toContain('255');
      expect(result.decoration).toContain('0.5');
    });

    test('should convert width and height', () => {
      const styleValue = "{width: 100, height: 200}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.width).toBe(100);
      expect(result.height).toBe(200);
    });

    test('should convert borderRadius', () => {
      const styleValue = "{borderRadius: 8}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toContain('borderRadius');
      expect(result.decoration).toContain('BorderRadius.circular(8)');
    });

    test('should convert border properties', () => {
      const styleValue = "{borderWidth: 2, borderColor: 'black'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toContain('border');
      expect(result.decoration).toContain('Border.all');
      expect(result.decoration).toContain('Colors.black');
    });

    test('should convert box shadow', () => {
      const styleValue = "{boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toContain('boxShadow');
      expect(result.decoration).toContain('BoxShadow');
    });
  });

  describe('Text Style Conversion', () => {
    test('should convert fontSize', () => {
      const styleValue = "{fontSize: 16}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toBeDefined();
      expect(result.style).toContain('TextStyle');
      expect(result.style).toContain('fontSize: 16');
    });

    test('should convert fontWeight', () => {
      const styleValue = "{fontWeight: 'bold'}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toContain('fontWeight: FontWeight.bold');
    });

    test('should convert color for text', () => {
      const styleValue = "{color: 'blue'}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toContain('color: Colors.blue');
    });

    test('should convert textAlign', () => {
      const styleValue = "{textAlign: 'center'}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.textAlign).toBe('TextAlign.center');
    });

    test('should convert fontFamily', () => {
      const styleValue = "{fontFamily: 'Roboto'}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toContain('fontFamily');
      expect(result.style).toContain('Roboto');
    });

    test('should convert lineHeight', () => {
      const styleValue = "{lineHeight: 1.5}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toContain('height: 1.5');
    });

    test('should convert letterSpacing', () => {
      const styleValue = "{letterSpacing: 2}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toContain('letterSpacing: 2');
    });

    test('should convert textDecoration', () => {
      const styleValue = "{textDecoration: 'underline'}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toContain('decoration: TextDecoration.underline');
    });
  });

  describe('Flexbox Style Conversion', () => {
    test('should convert flex property', () => {
      const styleValue = "{flex: 1}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.flex).toBe(1);
    });

    test('should convert justifyContent', () => {
      const styleValue = "{justifyContent: 'center'}";
      const result = generator._convertStyleProp(styleValue, 'Column');

      expect(result.mainAxisAlignment).toBe('MainAxisAlignment.center');
    });

    test('should convert alignItems', () => {
      const styleValue = "{alignItems: 'flex-start'}";
      const result = generator._convertStyleProp(styleValue, 'Row');

      expect(result.crossAxisAlignment).toBe('CrossAxisAlignment.start');
    });

    test('should convert space-between', () => {
      const styleValue = "{justifyContent: 'space-between'}";
      const result = generator._convertStyleProp(styleValue, 'Column');

      expect(result.mainAxisAlignment).toBe('MainAxisAlignment.spaceBetween');
    });

    test('should convert space-around', () => {
      const styleValue = "{justifyContent: 'space-around'}";
      const result = generator._convertStyleProp(styleValue, 'Row');

      expect(result.mainAxisAlignment).toBe('MainAxisAlignment.spaceAround');
    });
  });

  describe('Dimension Conversion', () => {
    test('should convert pixel values', () => {
      const styleValue = "{width: '100px'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.width).toBe(100);
    });

    test('should convert rem values', () => {
      const styleValue = "{fontSize: '2rem'}";
      const result = generator._convertStyleProp(styleValue, 'Text');

      expect(result.style).toContain('fontSize: 32'); // 2 * 16
    });

    test('should handle percentage values', () => {
      const styleValue = "{width: '50%'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.width).toBe('50%');
    });

    test('should convert minWidth/maxWidth', () => {
      const styleValue = "{minWidth: 100, maxWidth: 300}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.constraints).toBeDefined();
      expect(result.constraints).toContain('BoxConstraints');
      expect(result.constraints).toContain('minWidth: 100');
      expect(result.constraints).toContain('maxWidth: 300');
    });

    test('should convert minHeight/maxHeight', () => {
      const styleValue = "{minHeight: 50, maxHeight: 200}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.constraints).toContain('minHeight: 50');
      expect(result.constraints).toContain('maxHeight: 200');
    });
  });

  describe('Padding/Margin Variations', () => {
    test('should convert paddingTop/Left/Right/Bottom', () => {
      const styleValue = "{paddingTop: 10, paddingLeft: 20}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.padding).toContain('EdgeInsets');
      expect(result.padding).toContain('top: 10');
      expect(result.padding).toContain('left: 20');
    });

    test('should convert symmetric padding', () => {
      const styleValue = "{padding: '10 20'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.padding).toContain('EdgeInsets.symmetric');
      expect(result.padding).toContain('vertical: 10');
      expect(result.padding).toContain('horizontal: 20');
    });

    test('should convert LTRB padding', () => {
      const styleValue = "{padding: '10 20 30 40'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.padding).toContain('EdgeInsets.fromLTRB');
    });

    test('should convert margin with all sides', () => {
      const styleValue = "{marginTop: 5, marginBottom: 10, marginLeft: 15, marginRight: 20}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.margin).toContain('EdgeInsets');
    });
  });

  describe('Complex Styles', () => {
    test('should convert comprehensive style object', () => {
      const styleValue = `{
        backgroundColor: '#ffffff',
        padding: 16,
        margin: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        width: 300,
        height: 200
      }`;

      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toBeDefined();
      expect(result.padding).toBeDefined();
      expect(result.margin).toBeDefined();
      expect(result.width).toBe(300);
      expect(result.height).toBe(200);
    });

    test('should handle opacity', () => {
      const styleValue = "{opacity: 0.5}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.opacity).toBe(0.5);
    });

    test('should handle transform scale', () => {
      const styleValue = "{transform: 'scale(1.2)'}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.transform).toBeDefined();
      expect(result.transform).toContain('Matrix4');
    });

    test('should handle position absolute', () => {
      const styleValue = "{position: 'absolute', top: 10, left: 20}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.positioned).toBeDefined();
      expect(result.positioned.top).toBe(10);
      expect(result.positioned.left).toBe(20);
    });
  });

  describe('Style Reference Handling', () => {
    test('should detect and comment style variable reference', () => {
      const styleValue = "styles.container";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result._styleComment).toBeDefined();
      expect(result._styleComment).toContain('TODO');
      expect(result._styleComment).toContain('styles.container');
    });

    test('should detect and comment style array', () => {
      const styleValue = "[styles.base, styles.active]";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result._styleComment).toBeDefined();
      expect(result._styleComment).toContain('TODO');
      expect(result._styleComment).toContain('array');
    });

    test('should detect and comment this.props.style', () => {
      const styleValue = "this.props.style";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result._styleComment).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty style object', () => {
      const styleValue = "{}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(Object.keys(result).length).toBe(0);
    });

    test('should handle malformed style gracefully', () => {
      const styleValue = "{backgroundColor: }"; // Invalid
      const result = generator._convertStyleProp(styleValue, 'Container');

      // Should not throw, might have comment
      expect(result).toBeDefined();
    });

    test('should handle nested object styles', () => {
      const styleValue = "{padding: 10, backgroundColor: 'red', fontSize: 16}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      // Should handle both container and text styles
      expect(result.padding).toBeDefined();
      expect(result.decoration).toBeDefined();
    });

    test('should handle camelCase and kebab-case properties', () => {
      const styleValue = "{backgroundColor: 'red', 'border-radius': 8}";
      const result = generator._convertStyleProp(styleValue, 'Container');

      expect(result.decoration).toContain('Colors.red');
      expect(result.decoration).toContain('BorderRadius.circular');
    });
  });

  describe('_parseStyleObject Helper', () => {
    test('should parse simple style object', () => {
      const styleString = "{backgroundColor: 'red', padding: 10}";
      const result = generator._parseStyleObject(styleString);

      expect(result.backgroundColor).toBe('red');
      expect(result.padding).toBe(10);
    });

    test('should handle quoted string values', () => {
      const styleString = "{fontFamily: 'Roboto', color: \"blue\"}";
      const result = generator._parseStyleObject(styleString);

      expect(result.fontFamily).toBe('Roboto');
      expect(result.color).toBe('blue');
    });

    test('should convert numeric strings to numbers', () => {
      const styleString = "{width: 100, height: 200.5}";
      const result = generator._parseStyleObject(styleString);

      expect(result.width).toBe(100);
      expect(result.height).toBe(200.5);
    });

    test('should handle negative numbers', () => {
      const styleString = "{marginLeft: -10}";
      const result = generator._parseStyleObject(styleString);

      expect(result.marginLeft).toBe(-10);
    });
  });

  describe('_smartSplit Helper', () => {
    test('should split simple comma-separated values', () => {
      const result = generator._smartSplit("a, b, c", ",");

      expect(result).toEqual(["a", " b", " c"]);
    });

    test('should not split inside strings', () => {
      const result = generator._smartSplit("a, 'b, c', d", ",");

      expect(result).toEqual(["a", " 'b, c'", " d"]);
    });

    test('should not split inside nested objects', () => {
      const result = generator._smartSplit("a, {b: 1, c: 2}, d", ",");

      expect(result.length).toBe(3);
      expect(result[1]).toContain('{b: 1, c: 2}');
    });

    test('should handle nested arrays', () => {
      const result = generator._smartSplit("a, [1, 2, 3], b", ",");

      expect(result.length).toBe(3);
      expect(result[1]).toContain('[1, 2, 3]');
    });
  });
});
