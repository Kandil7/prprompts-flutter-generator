/**
 * StyleExtractor.js
 * Extracts styling information from React components
 *
 * Handles inline styles, StyleSheet, styled-components, CSS-in-JS
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { createModuleLogger } = require('../utils/logger');

const logger = createModuleLogger('StyleExtractor');

/**
 * Style Extractor class
 */
class StyleExtractor {
  constructor() {
    this.styles = {};
    this.themeVariables = {};
    this.responsiveBreakpoints = [];
  }

  /**
   * Extract styling information from source code
   * @param {string} sourceCode - Source code to analyze
   * @param {string} filePath - File path for error reporting
   * @returns {Object} - Extracted style information
   */
  extract(sourceCode, filePath) {
    try {
      logger.info(`Extracting styles from: ${filePath}`);

      const ast = parser.parse(sourceCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      const result = {
        styles: {},
        inlineStyles: [],
        styledComponents: [],
        responsiveStyles: [],
        themeVariables: {},
        cssModules: [],
      };

      let hasStyledComponents = false;
      let hasEmotion = false;

      traverse(ast, {
        // Detect imports
        ImportDeclaration: (path) => {
          const source = path.node.source.value;

          if (source === 'styled-components' || source.includes('styled-components')) {
            hasStyledComponents = true;
          }
          if (source.includes('@emotion')) {
            hasEmotion = true;
          }

          // CSS module imports
          if (source.endsWith('.css') || source.endsWith('.scss') || source.endsWith('.module.css')) {
            result.cssModules.push(source);
          }
        },

        // React Native StyleSheet.create
        CallExpression: (path) => {
          const node = path.node;

          if (t.isMemberExpression(node.callee) &&
              t.isIdentifier(node.callee.object, { name: 'StyleSheet' }) &&
              t.isIdentifier(node.callee.property, { name: 'create' })) {
            const styles = this._extractStyleSheet(node);
            Object.assign(result.styles, styles);
          }
        },

        // Inline styles on JSX elements
        JSXAttribute: (path) => {
          const node = path.node;

          if (t.isJSXIdentifier(node.name, { name: 'style' }) &&
              t.isJSXExpressionContainer(node.value)) {
            const styleObj = this._extractInlineStyle(node.value.expression);
            if (styleObj) {
              result.inlineStyles.push(styleObj);
            }
          }
        },

        // styled-components
        TaggedTemplateExpression: (path) => {
          if (hasStyledComponents || hasEmotion) {
            const styledComponent = this._extractStyledComponent(path.node);
            if (styledComponent) {
              result.styledComponents.push(styledComponent);
            }
          }
        },

        // Theme object
        VariableDeclarator: (path) => {
          const node = path.node;

          if (t.isIdentifier(node.id) &&
              (node.id.name.toLowerCase().includes('theme') ||
               node.id.name.toLowerCase().includes('colors') ||
               node.id.name.toLowerCase().includes('spacing'))) {
            if (t.isObjectExpression(node.init)) {
              const themeVars = this._extractThemeVariables(node.init);
              Object.assign(result.themeVariables, themeVars);
            }
          }
        },
      });

      // Detect responsive design
      result.responsiveStyles = this._detectResponsivePatterns(result.styles, result.inlineStyles);

      logger.success(`Extracted ${Object.keys(result.styles).length} styles, ${result.inlineStyles.length} inline styles`);
      return result;

    } catch (error) {
      logger.error(`Failed to extract styles from ${filePath}: ${error.message}`);
      return {
        styles: {},
        inlineStyles: [],
        styledComponents: [],
        responsiveStyles: [],
        themeVariables: {},
        cssModules: [],
      };
    }
  }

  /**
   * Extract StyleSheet.create styles
   * @private
   */
  _extractStyleSheet(callNode) {
    if (!callNode.arguments || callNode.arguments.length === 0) {
      return {};
    }

    const stylesArg = callNode.arguments[0];
    if (!t.isObjectExpression(stylesArg)) {
      return {};
    }

    const styles = {};

    stylesArg.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const styleName = prop.key.name;
        const styleObj = this._parseStyleObject(prop.value);
        styles[styleName] = styleObj;
      }
    });

    return styles;
  }

  /**
   * Extract inline style
   * @private
   */
  _extractInlineStyle(expression) {
    if (t.isObjectExpression(expression)) {
      return this._parseStyleObject(expression);
    }
    return null;
  }

  /**
   * Parse style object
   * @private
   */
  _parseStyleObject(objectExpr) {
    if (!t.isObjectExpression(objectExpr)) {
      return {};
    }

    const style = {};

    objectExpr.properties.forEach(prop => {
      if (t.isObjectProperty(prop)) {
        const key = t.isIdentifier(prop.key) ? prop.key.name : prop.key.value;
        const value = this._getStyleValue(prop.value);
        style[key] = value;
      }
    });

    return style;
  }

  /**
   * Get style value
   * @private
   */
  _getStyleValue(node) {
    if (t.isStringLiteral(node)) return node.value;
    if (t.isNumericLiteral(node)) return node.value;
    if (t.isBooleanLiteral(node)) return node.value;
    if (t.isIdentifier(node)) return `var(${node.name})`;
    if (t.isUnaryExpression(node) && node.operator === '-' && t.isNumericLiteral(node.argument)) {
      return -node.argument.value;
    }
    return 'unknown';
  }

  /**
   * Extract styled-component
   * @private
   */
  _extractStyledComponent(taggedTemplate) {
    const tag = taggedTemplate.tag;
    let componentType = 'div';

    // styled.div`...`
    if (t.isMemberExpression(tag) &&
        t.isIdentifier(tag.object, { name: 'styled' }) &&
        t.isIdentifier(tag.property)) {
      componentType = tag.property.name;
    }

    // styled(Component)`...`
    if (t.isCallExpression(tag) &&
        t.isIdentifier(tag.callee, { name: 'styled' })) {
      if (tag.arguments[0] && t.isIdentifier(tag.arguments[0])) {
        componentType = tag.arguments[0].name;
      }
    }

    const cssString = this._extractCSSFromTemplate(taggedTemplate.quasi);

    return {
      type: componentType,
      css: cssString,
      flutterEquivalent: this._mapToFlutterWidget(componentType),
    };
  }

  /**
   * Extract CSS from template literal
   * @private
   */
  _extractCSSFromTemplate(quasi) {
    let css = '';
    quasi.quasis.forEach((q, index) => {
      css += q.value.cooked;
      if (index < quasi.expressions.length) {
        css += '${...}'; // Placeholder for expressions
      }
    });
    return css;
  }

  /**
   * Extract theme variables
   * @private
   */
  _extractThemeVariables(objectExpr) {
    const theme = {};

    objectExpr.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const key = prop.key.name;
        const value = this._getStyleValue(prop.value);
        theme[key] = value;
      }
    });

    return theme;
  }

  /**
   * Detect responsive patterns
   * @private
   */
  _detectResponsivePatterns(styles, inlineStyles) {
    const responsivePatterns = [];

    // Check for media queries in CSS strings
    const mediaQueryPattern = /@media|min-width|max-width|breakpoint/i;

    Object.entries(styles).forEach(([name, styleObj]) => {
      if (typeof styleObj === 'object') {
        const styleStr = JSON.stringify(styleObj);
        if (mediaQueryPattern.test(styleStr)) {
          responsivePatterns.push({
            type: 'mediaQuery',
            styleName: name,
          });
        }
      }
    });

    // Check for responsive properties
    inlineStyles.forEach((style, index) => {
      if (this._hasResponsiveProperties(style)) {
        responsivePatterns.push({
          type: 'responsiveProperties',
          index,
        });
      }
    });

    return responsivePatterns;
  }

  /**
   * Check if style has responsive properties
   * @private
   */
  _hasResponsiveProperties(style) {
    const responsiveProps = ['flexDirection', 'flexWrap', 'width', 'height', 'fontSize'];
    return responsiveProps.some(prop => prop in style);
  }

  /**
   * Map HTML/React Native component to Flutter widget
   * @private
   */
  _mapToFlutterWidget(componentType) {
    const mapping = {
      'div': 'Container',
      'View': 'Container',
      'span': 'Text',
      'Text': 'Text',
      'button': 'ElevatedButton',
      'Button': 'ElevatedButton',
      'input': 'TextField',
      'TextInput': 'TextField',
      'img': 'Image',
      'Image': 'Image',
      'a': 'GestureDetector',
      'TouchableOpacity': 'InkWell',
      'ScrollView': 'SingleChildScrollView',
      'FlatList': 'ListView',
    };

    return mapping[componentType] || 'Widget';
  }

  /**
   * Generate Flutter theme suggestion
   * @param {Object} extractionResult - Result from extract()
   * @returns {Object} - Theme generation suggestions
   */
  generateFlutterTheme(extractionResult) {
    const { styles, themeVariables, responsiveStyles } = extractionResult;

    const suggestion = {
      themeData: this._generateThemeData(themeVariables),
      textStyles: this._generateTextStyles(styles),
      colors: this._extractColors(themeVariables),
      responsive: responsiveStyles.length > 0,
      packages: [],
    };

    if (suggestion.responsive) {
      suggestion.packages.push('flutter_screenutil: ^5.0.0');
    }

    return suggestion;
  }

  /**
   * Generate ThemeData code
   * @private
   */
  _generateThemeData(themeVars) {
    return `ThemeData(
  primaryColor: ${themeVars.primary || 'Colors.blue'},
  scaffoldBackgroundColor: ${themeVars.background || 'Colors.white'},
  // Add more theme properties
)`;
  }

  /**
   * Generate TextStyle objects
   * @private
   */
  _generateTextStyles(styles) {
    const textStyles = {};

    Object.entries(styles).forEach(([name, style]) => {
      if (this._isTextStyle(style)) {
        textStyles[name] = this._convertToFlutterTextStyle(style);
      }
    });

    return textStyles;
  }

  /**
   * Check if style is for text
   * @private
   */
  _isTextStyle(style) {
    const textProps = ['fontSize', 'fontWeight', 'fontFamily', 'color', 'lineHeight'];
    return textProps.some(prop => prop in style);
  }

  /**
   * Convert to Flutter TextStyle
   * @private
   */
  _convertToFlutterTextStyle(style) {
    const properties = [];

    if (style.fontSize) {
      properties.push(`fontSize: ${style.fontSize}`);
    }
    if (style.fontWeight) {
      properties.push(`fontWeight: FontWeight.${this._mapFontWeight(style.fontWeight)}`);
    }
    if (style.color) {
      properties.push(`color: ${this._convertColor(style.color)}`);
    }

    return `TextStyle(${properties.join(', ')})`;
  }

  /**
   * Map font weight
   * @private
   */
  _mapFontWeight(weight) {
    const mapping = {
      'normal': 'normal',
      'bold': 'bold',
      '100': 'w100',
      '200': 'w200',
      '300': 'w300',
      '400': 'normal',
      '500': 'w500',
      '600': 'w600',
      '700': 'bold',
      '800': 'w800',
      '900': 'w900',
    };

    return mapping[String(weight)] || 'normal';
  }

  /**
   * Convert color
   * @private
   */
  _convertColor(color) {
    if (typeof color === 'string' && color.startsWith('#')) {
      return `Color(0xFF${color.substring(1)})`;
    }
    return `Colors.${color}`;
  }

  /**
   * Extract color palette
   * @private
   */
  _extractColors(themeVars) {
    const colors = {};

    Object.entries(themeVars).forEach(([key, value]) => {
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        colors[key] = value;
      }
    });

    return colors;
  }
}

module.exports = {
  StyleExtractor,
};
