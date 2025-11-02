/**
 * Style Converter - Convert React/CSS styles to Flutter styling
 *
 * Handles:
 * - Color conversion (named, hex, rgb, rgba)
 * - Dimension conversion (px, %, rem → logical pixels)
 * - BoxDecoration (background, border, shadow, radius)
 * - EdgeInsets (padding, margin)
 * - TextStyle (font, size, weight, color, height)
 * - Flexbox (alignment, direction)
 */

const { createModuleLogger } = require('../../utils/logger');
const logger = createModuleLogger('StyleConverter');

/**
 * Named color map for CSS color names to Flutter Colors
 */
const NAMED_COLORS = {
  // Basic colors
  'transparent': 'Colors.transparent',
  'black': 'Colors.black',
  'white': 'Colors.white',
  'red': 'Colors.red',
  'green': 'Colors.green',
  'blue': 'Colors.blue',
  'yellow': 'Colors.yellow',
  'orange': 'Colors.orange',
  'purple': 'Colors.purple',
  'pink': 'Colors.pink',
  'brown': 'Colors.brown',
  'grey': 'Colors.grey',
  'gray': 'Colors.grey',
  'cyan': 'Colors.cyan',
  'indigo': 'Colors.indigo',
  'lime': 'Colors.lime',
  'teal': 'Colors.teal',
  'amber': 'Colors.amber',

  // Extended colors
  'lightblue': 'Colors.lightBlue',
  'lightgreen': 'Colors.lightGreen',
  'deeporange': 'Colors.deepOrange',
  'deeppurple': 'Colors.deepPurple',
  'bluegrey': 'Colors.blueGrey',
  'bluegray': 'Colors.blueGrey',
};

/**
 * Font weight map from CSS to Flutter
 */
const FONT_WEIGHTS = {
  'normal': 'FontWeight.normal',
  '400': 'FontWeight.normal',
  'bold': 'FontWeight.bold',
  '700': 'FontWeight.bold',
  '100': 'FontWeight.w100',
  '200': 'FontWeight.w200',
  '300': 'FontWeight.w300',
  '500': 'FontWeight.w500',
  '600': 'FontWeight.w600',
  '800': 'FontWeight.w800',
  '900': 'FontWeight.w900',
};

/**
 * Text align map from CSS to Flutter
 */
const TEXT_ALIGN = {
  'left': 'TextAlign.left',
  'right': 'TextAlign.right',
  'center': 'TextAlign.center',
  'justify': 'TextAlign.justify',
  'start': 'TextAlign.start',
  'end': 'TextAlign.end',
};

/**
 * Main axis alignment (justifyContent in CSS)
 */
const JUSTIFY_CONTENT = {
  'flex-start': 'MainAxisAlignment.start',
  'flex-end': 'MainAxisAlignment.end',
  'center': 'MainAxisAlignment.center',
  'space-between': 'MainAxisAlignment.spaceBetween',
  'space-around': 'MainAxisAlignment.spaceAround',
  'space-evenly': 'MainAxisAlignment.spaceEvenly',
};

/**
 * Cross axis alignment (alignItems in CSS)
 */
const ALIGN_ITEMS = {
  'flex-start': 'CrossAxisAlignment.start',
  'flex-end': 'CrossAxisAlignment.end',
  'center': 'CrossAxisAlignment.center',
  'stretch': 'CrossAxisAlignment.stretch',
  'baseline': 'CrossAxisAlignment.baseline',
};

/**
 * StyleConverter class - Main style conversion engine
 */
class StyleConverter {
  /**
   * Convert React/CSS style object to Flutter properties
   * @param {Object} styleObject - Style object with CSS properties
   * @param {string} widgetType - Type of widget ('Container', 'Text', etc.)
   * @returns {Object} Flutter properties
   */
  convertStyleObject(styleObject, widgetType = 'Container') {
    if (!styleObject || typeof styleObject !== 'object') {
      return {};
    }

    logger.debug('Converting style object', { styleObject, widgetType });

    const flutterStyle = {
      decoration: {},
      padding: null,
      margin: null,
      width: null,
      height: null,
      textStyle: {},
      alignment: null,
      constraints: null,
      transform: null,
      flex: null,
      mainAxisAlignment: null,
      crossAxisAlignment: null,
    };

    // Process each style property
    for (const [key, value] of Object.entries(styleObject)) {
      this._applyStyleProperty(key, value, flutterStyle);
    }

    // Build final Flutter properties
    return this._buildFlutterProperties(flutterStyle, widgetType);
  }

  /**
   * Apply a single style property to Flutter style object
   * @param {string} key - CSS property name
   * @param {*} value - CSS property value
   * @param {Object} flutterStyle - Accumulator for Flutter properties
   * @private
   */
  _applyStyleProperty(key, value, flutterStyle) {
    switch (key) {
      // Background color
      case 'backgroundColor':
      case 'background-color':
        flutterStyle.decoration.color = this._convertColor(value);
        break;

      // Padding
      case 'padding':
        flutterStyle.padding = this._convertPadding(value);
        break;
      case 'paddingTop':
      case 'padding-top':
        flutterStyle.padding = this._mergePadding(flutterStyle.padding, 'top', value);
        break;
      case 'paddingBottom':
      case 'padding-bottom':
        flutterStyle.padding = this._mergePadding(flutterStyle.padding, 'bottom', value);
        break;
      case 'paddingLeft':
      case 'padding-left':
        flutterStyle.padding = this._mergePadding(flutterStyle.padding, 'left', value);
        break;
      case 'paddingRight':
      case 'padding-right':
        flutterStyle.padding = this._mergePadding(flutterStyle.padding, 'right', value);
        break;

      // Margin
      case 'margin':
        flutterStyle.margin = this._convertPadding(value);
        break;
      case 'marginTop':
      case 'margin-top':
        flutterStyle.margin = this._mergePadding(flutterStyle.margin, 'top', value);
        break;
      case 'marginBottom':
      case 'margin-bottom':
        flutterStyle.margin = this._mergePadding(flutterStyle.margin, 'bottom', value);
        break;
      case 'marginLeft':
      case 'margin-left':
        flutterStyle.margin = this._mergePadding(flutterStyle.margin, 'left', value);
        break;
      case 'marginRight':
      case 'margin-right':
        flutterStyle.margin = this._mergePadding(flutterStyle.margin, 'right', value);
        break;

      // Dimensions
      case 'width':
        flutterStyle.width = this._convertDimension(value);
        break;
      case 'height':
        flutterStyle.height = this._convertDimension(value);
        break;
      case 'minWidth':
      case 'min-width':
        flutterStyle.constraints = flutterStyle.constraints || {};
        flutterStyle.constraints.minWidth = this._convertDimension(value);
        break;
      case 'maxWidth':
      case 'max-width':
        flutterStyle.constraints = flutterStyle.constraints || {};
        flutterStyle.constraints.maxWidth = this._convertDimension(value);
        break;
      case 'minHeight':
      case 'min-height':
        flutterStyle.constraints = flutterStyle.constraints || {};
        flutterStyle.constraints.minHeight = this._convertDimension(value);
        break;
      case 'maxHeight':
      case 'max-height':
        flutterStyle.constraints = flutterStyle.constraints || {};
        flutterStyle.constraints.maxHeight = this._convertDimension(value);
        break;

      // Border
      case 'borderRadius':
      case 'border-radius':
        flutterStyle.decoration.borderRadius = this._convertBorderRadius(value);
        break;
      case 'borderWidth':
      case 'border-width':
        flutterStyle.decoration.border = this._convertBorder(value, null);
        break;
      case 'borderColor':
      case 'border-color':
        flutterStyle.decoration.borderColor = this._convertColor(value);
        break;
      case 'border':
        const borderParts = this._parseBorderShorthand(value);
        if (borderParts) {
          flutterStyle.decoration.border = this._convertBorder(
            borderParts.width,
            borderParts.color
          );
        }
        break;

      // Shadow
      case 'boxShadow':
      case 'box-shadow':
        flutterStyle.decoration.boxShadow = this._convertBoxShadow(value);
        break;

      // Text styles
      case 'fontSize':
      case 'font-size':
        flutterStyle.textStyle.fontSize = this._convertFontSize(value);
        break;
      case 'fontWeight':
      case 'font-weight':
        flutterStyle.textStyle.fontWeight = this._convertFontWeight(value);
        break;
      case 'fontFamily':
      case 'font-family':
        flutterStyle.textStyle.fontFamily = this._convertFontFamily(value);
        break;
      case 'color':
        flutterStyle.textStyle.color = this._convertColor(value);
        break;
      case 'textAlign':
      case 'text-align':
        flutterStyle.textAlign = this._convertTextAlign(value);
        break;
      case 'lineHeight':
      case 'line-height':
        flutterStyle.textStyle.height = this._convertLineHeight(value);
        break;
      case 'letterSpacing':
      case 'letter-spacing':
        flutterStyle.textStyle.letterSpacing = this._convertDimension(value);
        break;
      case 'textDecoration':
      case 'text-decoration':
        flutterStyle.textStyle.decoration = this._convertTextDecoration(value);
        break;

      // Flexbox
      case 'flex':
        flutterStyle.flex = parseInt(value, 10);
        break;
      case 'flexDirection':
      case 'flex-direction':
        // This affects parent widget choice (Row vs Column)
        flutterStyle.flexDirection = value;
        break;
      case 'justifyContent':
      case 'justify-content':
        flutterStyle.mainAxisAlignment = this._convertJustifyContent(value);
        break;
      case 'alignItems':
      case 'align-items':
        flutterStyle.crossAxisAlignment = this._convertAlignItems(value);
        break;

      // Alignment
      case 'alignSelf':
      case 'align-self':
        flutterStyle.alignment = this._convertAlignSelf(value);
        break;

      // Opacity
      case 'opacity':
        flutterStyle.opacity = parseFloat(value);
        break;

      // Transform
      case 'transform':
        flutterStyle.transform = this._convertTransform(value);
        break;

      // Position
      case 'position':
        flutterStyle.position = value;
        break;
      case 'top':
        flutterStyle.top = this._convertDimension(value);
        break;
      case 'bottom':
        flutterStyle.bottom = this._convertDimension(value);
        break;
      case 'left':
        flutterStyle.left = this._convertDimension(value);
        break;
      case 'right':
        flutterStyle.right = this._convertDimension(value);
        break;
      case 'zIndex':
      case 'z-index':
        flutterStyle.zIndex = parseInt(value, 10);
        break;

      default:
        logger.debug('Unsupported style property', { key, value });
    }
  }

  /**
   * Convert color value to Flutter Color
   * @param {string} colorValue - CSS color value
   * @returns {string} Flutter Color expression
   * @private
   */
  _convertColor(colorValue) {
    if (!colorValue) return null;

    const value = colorValue.toString().trim().toLowerCase();

    // Named colors
    if (NAMED_COLORS[value]) {
      return NAMED_COLORS[value];
    }

    // Hex colors (#RGB, #RRGGBB, #RRGGBBAA)
    if (value.startsWith('#')) {
      const hex = value.slice(1);
      let r, g, b, a = 'FF';

      if (hex.length === 3) {
        // #RGB
        r = hex[0] + hex[0];
        g = hex[1] + hex[1];
        b = hex[2] + hex[2];
      } else if (hex.length === 6) {
        // #RRGGBB
        r = hex.slice(0, 2);
        g = hex.slice(2, 4);
        b = hex.slice(4, 6);
      } else if (hex.length === 8) {
        // #RRGGBBAA
        r = hex.slice(0, 2);
        g = hex.slice(2, 4);
        b = hex.slice(4, 6);
        a = hex.slice(6, 8);
      } else {
        logger.warn('Invalid hex color format', { colorValue });
        return 'Colors.transparent';
      }

      return `Color(0x${a.toUpperCase()}${r.toUpperCase()}${g.toUpperCase()}${b.toUpperCase()})`;
    }

    // RGB/RGBA
    const rgbMatch = value.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
    if (rgbMatch) {
      const [, r, g, b, alpha = '1'] = rgbMatch;
      return `Color.fromRGBO(${r}, ${g}, ${b}, ${alpha})`;
    }

    // HSL/HSLA (basic support - convert to RGB)
    const hslMatch = value.match(/hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)/);
    if (hslMatch) {
      const [, h, s, l, alpha = '1'] = hslMatch;
      // Note: Complex HSL to RGB conversion would be needed
      logger.warn('HSL color conversion not fully supported', { colorValue });
      return 'Colors.grey';
    }

    logger.warn('Unknown color format', { colorValue });
    return 'Colors.transparent';
  }

  /**
   * Convert padding/margin value to Flutter EdgeInsets
   * @param {string|number} value - CSS padding value
   * @returns {string} Flutter EdgeInsets expression
   * @private
   */
  _convertPadding(value) {
    if (!value) return null;

    const strValue = value.toString().trim();

    // Single value: padding: 10
    if (!strValue.includes(' ')) {
      const num = this._extractNumber(strValue);
      return `EdgeInsets.all(${num})`;
    }

    // Multiple values: padding: '10 20' or '10 20 30 40'
    const parts = strValue.split(/\s+/).map(p => this._extractNumber(p));

    if (parts.length === 2) {
      // vertical horizontal
      return `EdgeInsets.symmetric(vertical: ${parts[0]}, horizontal: ${parts[1]})`;
    } else if (parts.length === 4) {
      // top right bottom left
      return `EdgeInsets.fromLTRB(${parts[3]}, ${parts[0]}, ${parts[1]}, ${parts[2]})`;
    }

    return `EdgeInsets.all(${parts[0]})`;
  }

  /**
   * Merge individual padding properties
   * @param {string} existing - Existing EdgeInsets expression
   * @param {string} side - 'top', 'bottom', 'left', 'right'
   * @param {*} value - Value to set
   * @returns {string} Updated EdgeInsets expression
   * @private
   */
  _mergePadding(existing, side, value) {
    const num = this._extractNumber(value);

    // If no existing padding, create only() with this side
    if (!existing) {
      return `EdgeInsets.only(${side}: ${num})`;
    }

    // Parse existing EdgeInsets
    if (existing.includes('EdgeInsets.all')) {
      const allValue = existing.match(/EdgeInsets\.all\((\d+(?:\.\d+)?)\)/)?.[1] || '0';
      const sides = {
        top: allValue,
        bottom: allValue,
        left: allValue,
        right: allValue,
      };
      sides[side] = num;
      return `EdgeInsets.fromLTRB(${sides.left}, ${sides.top}, ${sides.right}, ${sides.bottom})`;
    }

    if (existing.includes('EdgeInsets.only')) {
      // Add to existing only()
      const sideMatch = existing.match(/EdgeInsets\.only\(([^)]+)\)/)?.[1];
      if (sideMatch) {
        const newSides = sideMatch + `, ${side}: ${num}`;
        return `EdgeInsets.only(${newSides})`;
      }
    }

    // Fallback
    return `EdgeInsets.only(${side}: ${num})`;
  }

  /**
   * Convert dimension value (width, height, etc.)
   * @param {string|number} value - CSS dimension value
   * @returns {number|string} Flutter dimension value
   * @private
   */
  _convertDimension(value) {
    if (typeof value === 'number') return value;
    if (!value) return null;

    const strValue = value.toString().trim();

    // Remove 'px' suffix
    if (strValue.endsWith('px')) {
      return parseFloat(strValue);
    }

    // Percentage (needs context - return as is)
    if (strValue.endsWith('%')) {
      return strValue;
    }

    // Rem/em (assume 16px base)
    if (strValue.endsWith('rem') || strValue.endsWith('em')) {
      return parseFloat(strValue) * 16;
    }

    // Try to parse as number
    const num = parseFloat(strValue);
    return isNaN(num) ? null : num;
  }

  /**
   * Convert border radius
   * @param {string|number} value - CSS border-radius value
   * @returns {string} Flutter BorderRadius expression
   * @private
   */
  _convertBorderRadius(value) {
    const num = this._extractNumber(value);
    return `BorderRadius.circular(${num})`;
  }

  /**
   * Convert border
   * @param {string|number} width - Border width
   * @param {string} color - Border color
   * @returns {string} Flutter Border expression
   * @private
   */
  _convertBorder(width, color) {
    const widthNum = this._extractNumber(width);
    const colorStr = color ? this._convertColor(color) : null;

    if (colorStr) {
      return `Border.all(width: ${widthNum}, color: ${colorStr})`;
    }
    return `Border.all(width: ${widthNum})`;
  }

  /**
   * Parse border shorthand (e.g., '1px solid red')
   * @param {string} value - Border shorthand value
   * @returns {Object} Parsed border parts
   * @private
   */
  _parseBorderShorthand(value) {
    const parts = value.split(/\s+/);
    if (parts.length < 2) return null;

    return {
      width: parts[0],
      style: parts[1], // solid, dashed, etc.
      color: parts[2] || 'black',
    };
  }

  /**
   * Convert box shadow
   * @param {string} value - CSS box-shadow value
   * @returns {string} Flutter BoxShadow list
   * @private
   */
  _convertBoxShadow(value) {
    if (!value || value === 'none') return null;

    // Parse box-shadow: offsetX offsetY blurRadius spreadRadius color
    // Example: '0 2px 4px 0 rgba(0,0,0,0.1)'
    const match = value.match(/([-\d.]+)(?:px)?\s+([-\d.]+)(?:px)?\s+([-\d.]+)(?:px)?(?:\s+([-\d.]+)(?:px)?)?\s+(.*)/);

    if (match) {
      const [, offsetX, offsetY, blurRadius, spreadRadius, color] = match;
      const flutterColor = this._convertColor(color || 'rgba(0,0,0,0.1)');

      return `[BoxShadow(offset: Offset(${offsetX}, ${offsetY}), blurRadius: ${blurRadius}, color: ${flutterColor})]`;
    }

    return null;
  }

  /**
   * Convert font size
   * @param {string|number} value - CSS font-size value
   * @returns {number} Flutter font size
   * @private
   */
  _convertFontSize(value) {
    // Use _convertDimension to handle units like px, rem, em
    return this._convertDimension(value);
  }

  /**
   * Convert font weight
   * @param {string|number} value - CSS font-weight value
   * @returns {string} Flutter FontWeight
   * @private
   */
  _convertFontWeight(value) {
    const strValue = value.toString().trim();
    return FONT_WEIGHTS[strValue] || 'FontWeight.normal';
  }

  /**
   * Convert font family
   * @param {string} value - CSS font-family value
   * @returns {string} Flutter font family
   * @private
   */
  _convertFontFamily(value) {
    // Remove quotes and take first font
    const cleaned = value.replace(/['"]/g, '').split(',')[0].trim();
    return `'${cleaned}'`;
  }

  /**
   * Convert text align
   * @param {string} value - CSS text-align value
   * @returns {string} Flutter TextAlign
   * @private
   */
  _convertTextAlign(value) {
    return TEXT_ALIGN[value] || 'TextAlign.left';
  }

  /**
   * Convert line height
   * @param {string|number} value - CSS line-height value
   * @returns {number} Flutter text height multiplier
   * @private
   */
  _convertLineHeight(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 1.0 : num;
  }

  /**
   * Convert text decoration
   * @param {string} value - CSS text-decoration value
   * @returns {string} Flutter TextDecoration
   * @private
   */
  _convertTextDecoration(value) {
    if (value.includes('underline')) return 'TextDecoration.underline';
    if (value.includes('line-through')) return 'TextDecoration.lineThrough';
    if (value.includes('overline')) return 'TextDecoration.overline';
    return 'TextDecoration.none';
  }

  /**
   * Convert justify-content
   * @param {string} value - CSS justify-content value
   * @returns {string} Flutter MainAxisAlignment
   * @private
   */
  _convertJustifyContent(value) {
    return JUSTIFY_CONTENT[value] || 'MainAxisAlignment.start';
  }

  /**
   * Convert align-items
   * @param {string} value - CSS align-items value
   * @returns {string} Flutter CrossAxisAlignment
   * @private
   */
  _convertAlignItems(value) {
    return ALIGN_ITEMS[value] || 'CrossAxisAlignment.start';
  }

  /**
   * Convert align-self
   * @param {string} value - CSS align-self value
   * @returns {string} Flutter Alignment
   * @private
   */
  _convertAlignSelf(value) {
    const alignMap = {
      'center': 'Alignment.center',
      'flex-start': 'Alignment.topCenter',
      'flex-end': 'Alignment.bottomCenter',
    };
    return alignMap[value] || 'Alignment.center';
  }

  /**
   * Convert transform
   * @param {string} value - CSS transform value
   * @returns {string} Flutter Matrix4 or Transform hint
   * @private
   */
  _convertTransform(value) {
    // Basic transform support
    if (value.includes('scale')) {
      const scaleMatch = value.match(/scale\(([\d.]+)\)/);
      if (scaleMatch) {
        return `Matrix4.diagonal3Values(${scaleMatch[1]}, ${scaleMatch[1]}, 1)`;
      }
    }
    return null;
  }

  /**
   * Build final Flutter properties from style accumulator
   * @param {Object} flutterStyle - Accumulated Flutter style properties
   * @param {string} widgetType - Type of widget
   * @returns {Object} Final Flutter properties
   * @private
   */
  _buildFlutterProperties(flutterStyle, widgetType) {
    const properties = {};

    // BoxDecoration
    if (Object.keys(flutterStyle.decoration).length > 0) {
      properties.decoration = this._buildBoxDecoration(flutterStyle.decoration);
    }

    // Padding
    if (flutterStyle.padding) {
      properties.padding = flutterStyle.padding;
    }

    // Margin (Flutter uses Container with margin)
    if (flutterStyle.margin) {
      properties.margin = flutterStyle.margin;
    }

    // Width/Height
    if (flutterStyle.width !== null) {
      properties.width = flutterStyle.width;
    }
    if (flutterStyle.height !== null) {
      properties.height = flutterStyle.height;
    }

    // Constraints
    if (flutterStyle.constraints) {
      properties.constraints = this._buildConstraints(flutterStyle.constraints);
    }

    // TextStyle
    if (Object.keys(flutterStyle.textStyle).length > 0) {
      properties.style = this._buildTextStyle(flutterStyle.textStyle);
    }

    // Text align
    if (flutterStyle.textAlign) {
      properties.textAlign = flutterStyle.textAlign;
    }

    // Alignment
    if (flutterStyle.alignment) {
      properties.alignment = flutterStyle.alignment;
    }

    // Flex
    if (flutterStyle.flex !== null) {
      properties.flex = flutterStyle.flex;
    }

    // Axis alignments
    if (flutterStyle.mainAxisAlignment) {
      properties.mainAxisAlignment = flutterStyle.mainAxisAlignment;
    }
    if (flutterStyle.crossAxisAlignment) {
      properties.crossAxisAlignment = flutterStyle.crossAxisAlignment;
    }

    // Opacity
    if (flutterStyle.opacity !== undefined) {
      properties.opacity = flutterStyle.opacity;
    }

    // Transform
    if (flutterStyle.transform) {
      properties.transform = flutterStyle.transform;
    }

    // Position (for Positioned widget)
    if (flutterStyle.position === 'absolute') {
      properties.positioned = {
        top: flutterStyle.top,
        bottom: flutterStyle.bottom,
        left: flutterStyle.left,
        right: flutterStyle.right,
      };
    }

    return properties;
  }

  /**
   * Build BoxDecoration string
   * @param {Object} decorationParts - Decoration parts
   * @returns {string} Flutter BoxDecoration expression
   * @private
   */
  _buildBoxDecoration(decorationParts) {
    const parts = [];

    if (decorationParts.color) {
      parts.push(`color: ${decorationParts.color}`);
    }

    if (decorationParts.borderRadius) {
      parts.push(`borderRadius: ${decorationParts.borderRadius}`);
    }

    // Handle border - if we have borderColor but no border, or border without color, combine them
    if (decorationParts.border) {
      // If border exists but borderColor is also set, update the border
      if (decorationParts.borderColor && !decorationParts.border.includes('color:')) {
        // Extract width from existing border
        const widthMatch = decorationParts.border.match(/width:\s*(\d+(?:\.\d+)?)/);
        const width = widthMatch ? widthMatch[1] : '1';
        parts.push(`border: Border.all(width: ${width}, color: ${decorationParts.borderColor})`);
      } else {
        parts.push(`border: ${decorationParts.border}`);
      }
    } else if (decorationParts.borderColor) {
      parts.push(`border: Border.all(color: ${decorationParts.borderColor})`);
    }

    if (decorationParts.boxShadow) {
      parts.push(`boxShadow: ${decorationParts.boxShadow}`);
    }

    if (parts.length === 0) return null;

    return `BoxDecoration(${parts.join(', ')})`;
  }

  /**
   * Build BoxConstraints string
   * @param {Object} constraints - Constraints object
   * @returns {string} Flutter BoxConstraints expression
   * @private
   */
  _buildConstraints(constraints) {
    const parts = [];

    if (constraints.minWidth !== undefined) {
      parts.push(`minWidth: ${constraints.minWidth}`);
    }
    if (constraints.maxWidth !== undefined) {
      parts.push(`maxWidth: ${constraints.maxWidth}`);
    }
    if (constraints.minHeight !== undefined) {
      parts.push(`minHeight: ${constraints.minHeight}`);
    }
    if (constraints.maxHeight !== undefined) {
      parts.push(`maxHeight: ${constraints.maxHeight}`);
    }

    if (parts.length === 0) return null;

    return `BoxConstraints(${parts.join(', ')})`;
  }

  /**
   * Build TextStyle string
   * @param {Object} textStyleParts - TextStyle parts
   * @returns {string} Flutter TextStyle expression
   * @private
   */
  _buildTextStyle(textStyleParts) {
    const parts = [];

    if (textStyleParts.fontSize !== undefined) {
      parts.push(`fontSize: ${textStyleParts.fontSize}`);
    }

    if (textStyleParts.fontWeight) {
      parts.push(`fontWeight: ${textStyleParts.fontWeight}`);
    }

    if (textStyleParts.fontFamily) {
      parts.push(`fontFamily: ${textStyleParts.fontFamily}`);
    }

    if (textStyleParts.color) {
      parts.push(`color: ${textStyleParts.color}`);
    }

    if (textStyleParts.height !== undefined) {
      parts.push(`height: ${textStyleParts.height}`);
    }

    if (textStyleParts.letterSpacing !== undefined) {
      parts.push(`letterSpacing: ${textStyleParts.letterSpacing}`);
    }

    if (textStyleParts.decoration) {
      parts.push(`decoration: ${textStyleParts.decoration}`);
    }

    if (parts.length === 0) return null;

    return `TextStyle(${parts.join(', ')})`;
  }

  /**
   * Extract numeric value from string
   * @param {string|number} value - Value to extract from
   * @returns {number} Extracted number
   * @private
   */
  _extractNumber(value) {
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
}

module.exports = new StyleConverter();
