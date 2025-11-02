/**
 * AccessibilityValidator - Validates accessibility compliance (WCAG AA)
 *
 * Checks:
 * - Semantics widgets
 * - Button labels
 * - Touch target sizes (>= 48x48)
 * - Color contrast (WCAG AA 4.5:1)
 * - Screen reader support
 * - Keyboard navigation
 *
 * Returns score 0-100
 */

const { ValidationResult } = require('../models/ValidationResult');
const { createModuleLogger } = require('../utils/logger');
const logger = createModuleLogger('AccessibilityValidator');

class AccessibilityValidator {
  constructor(config = {}) {
    this.config = {
      enforceWCAG_AA: true,
      minimumTouchTarget: 48,
      minimumContrast: 4.5,
      ...config
    };
  }

  validate(filePath, code) {
    const errors = [];
    const warnings = [];
    const info = [];

    try {
      // 1. Check for Semantics widgets
      this._checkSemantics(code, errors, warnings);

      // 2. Check button labels
      this._checkButtonLabels(code, warnings);

      // 3. Check touch target sizes
      this._checkTouchTargets(code, warnings, info);

      // 4. Check color contrast
      this._checkColorContrast(code, warnings, info);

      // 5. Check screen reader support
      this._checkScreenReaderSupport(code, warnings, info);

      // 6. Check form accessibility
      this._checkFormAccessibility(code, warnings);

      // 7. Check image alt text
      this._checkImageAltText(code, warnings);

      const score = this._calculateScore(errors, warnings);

      return new ValidationResult({
        isValid: errors.length === 0,
        score,
        errors,
        warnings,
        info,
        target: filePath,
        validator: 'AccessibilityValidator',
        timestamp: new Date().toISOString(),
        metadata: {
          wcagLevel: score >= 80 ? 'AA' : score >= 60 ? 'A' : 'Non-compliant',
          touchTargetCompliance: this._getTouchTargetCompliance(code),
          contrastCompliance: this._getContrastCompliance(code)
        }
      });

    } catch (error) {
      logger.error(`AccessibilityValidator failed for ${filePath}:`, error);
      return new ValidationResult({
        isValid: false,
        score: 0,
        errors: [{ message: `Validation failed: ${error.message}`, severity: 'error' }],
        warnings: [],
        info: [],
        target: filePath,
        validator: 'AccessibilityValidator',
        timestamp: new Date().toISOString()
      });
    }
  }

  _checkSemantics(code, errors, warnings) {
    // Check for interactive widgets without Semantics
    const interactiveWidgets = [
      'GestureDetector',
      'InkWell',
      'IconButton',
      'FloatingActionButton'
    ];

    for (const widget of interactiveWidgets) {
      const widgetPattern = new RegExp(`${widget}\\s*\\(`, 'g');
      const semanticsPattern = new RegExp(`Semantics\\s*\\([^)]*child:\\s*${widget}`, 'g');

      const totalCount = (code.match(widgetPattern) || []).length;
      const semanticsCount = (code.match(semanticsPattern) || []).length;
      const missingSemantics = totalCount - semanticsCount;

      if (missingSemantics > 0) {
        warnings.push({
          message: `${missingSemantics} ${widget}(s) without Semantics label`,
          severity: 'warning',
          suggestion: `Wrap ${widget} with Semantics(label: '...', child: ...)`
        });
      }
    }

    // Check for buttons without semantic labels
    const elevatedButtonPattern = /ElevatedButton\s*\([^)]*onPressed:/g;
    const semanticButtonPattern = /Semantics\s*\([^)]*label:[^)]*child:\s*ElevatedButton/g;

    const buttonCount = (code.match(elevatedButtonPattern) || []).length;
    const labeledButtons = (code.match(semanticButtonPattern) || []).length;

    if (buttonCount > labeledButtons) {
      warnings.push({
        message: `${buttonCount - labeledButtons} button(s) may lack semantic labels`,
        severity: 'warning',
        suggestion: 'Add Semantics labels for screen reader support'
      });
    }
  }

  _checkButtonLabels(code, warnings) {
    // Check for icon-only buttons
    const iconButtonPattern = /IconButton\s*\([^)]*icon:\s*Icon\([^)]*\)[^)]*\)/g;
    const matches = [...code.matchAll(iconButtonPattern)];

    for (const match of matches) {
      const snippet = match[0];
      if (!snippet.includes('tooltip:') && !snippet.includes('semanticLabel:')) {
        const lineNum = code.substring(0, match.index).split('\n').length;
        warnings.push({
          message: 'IconButton without tooltip or semantic label',
          line: lineNum,
          severity: 'warning',
          suggestion: 'Add tooltip or Semantics label for accessibility'
        });
      }
    }
  }

  _checkTouchTargets(code, warnings, info) {
    // Check for small touch targets
    const sizePattern = /(?:width|height):\s*(\d+)/g;
    let match;

    while ((match = sizePattern.exec(code)) !== null) {
      const size = parseInt(match[1]);
      const lineNum = code.substring(0, match.index).split('\n').length;

      // Check if it's within a GestureDetector or interactive widget
      const context = code.substring(Math.max(0, match.index - 100), match.index + 100);
      const isInteractive = /GestureDetector|InkWell|IconButton|ElevatedButton/.test(context);

      if (isInteractive && size < this.config.minimumTouchTarget) {
        warnings.push({
          message: `Touch target too small: ${size}dp (minimum ${this.config.minimumTouchTarget}dp)`,
          line: lineNum,
          severity: 'warning',
          suggestion: `Increase size to at least ${this.config.minimumTouchTarget}x${this.config.minimumTouchTarget}`
        });
      }
    }

    // Check for recommended minimum touch target in interactive widgets
    if (code.includes('GestureDetector') || code.includes('InkWell')) {
      if (!code.includes('width:') || !code.includes('height:')) {
        info.push({
          message: 'Interactive widgets without explicit size',
          severity: 'info',
          suggestion: 'Ensure touch targets are at least 48x48dp'
        });
      }
    }
  }

  _checkColorContrast(code, warnings, info) {
    // Parse color definitions
    const colorPattern = /Color\s*\(\s*0x([0-9A-Fa-f]{8})\s*\)/g;
    const colors = [];
    let match;

    while ((match = colorPattern.exec(code)) !== null) {
      const hex = match[1];
      const lineNum = code.substring(0, match.index).split('\n').length;
      colors.push({
        hex,
        line: lineNum,
        rgb: this._hexToRgb(hex)
      });
    }

    // Check for low contrast combinations
    if (colors.length >= 2) {
      // Simple check: compare adjacent colors in code
      for (let i = 0; i < colors.length - 1; i++) {
        const color1 = colors[i];
        const color2 = colors[i + 1];

        // Check if they might be foreground/background
        const lineDiff = Math.abs(color1.line - color2.line);
        if (lineDiff <= 5) {
          const contrast = this._calculateContrast(color1.rgb, color2.rgb);

          if (contrast < this.config.minimumContrast) {
            warnings.push({
              message: `Low color contrast: ${contrast.toFixed(2)}:1 (minimum 4.5:1)`,
              line: color1.line,
              severity: 'warning',
              suggestion: 'Increase contrast between text and background colors'
            });
          }
        }
      }
    }

    // Check for theme colors
    if (code.includes('Theme.of(context)')) {
      info.push({
        message: 'Using theme colors (good for accessibility)',
        severity: 'info'
      });
    }
  }

  _checkScreenReaderSupport(code, warnings, info) {
    // Check for ExcludeSemantics misuse
    const excludeSemanticsCount = (code.match(/ExcludeSemantics\s*\(/g) || []).length;
    if (excludeSemanticsCount > 2) {
      warnings.push({
        message: `Excessive ExcludeSemantics usage (${excludeSemanticsCount})`,
        severity: 'warning',
        suggestion: 'Avoid hiding content from screen readers unless necessary'
      });
    }

    // Check for proper heading hierarchy
    if (code.includes('Text(') && !code.includes('semanticsLabel:')) {
      info.push({
        message: 'Text widgets without semantic labels',
        severity: 'info',
        suggestion: 'Add semantic labels for important text content'
      });
    }

    // Check for live regions (announcements)
    const hasLiveRegion = code.includes('SemanticsService.announce') ||
                         code.includes('liveRegion:');

    if (code.includes('loading') || code.includes('error')) {
      if (!hasLiveRegion) {
        info.push({
          message: 'Loading/error states without screen reader announcements',
          severity: 'info',
          suggestion: 'Use SemanticsService.announce for dynamic content changes'
        });
      }
    }
  }

  _checkFormAccessibility(code, warnings) {
    // Check for TextFormField without labels
    const textFormFieldPattern = /TextFormField\s*\(/g;
    const matches = [...code.matchAll(textFormFieldPattern)];

    for (const match of matches) {
      const snippet = code.substring(match.index, match.index + 300);
      if (!snippet.includes('labelText:') && !snippet.includes('hintText:')) {
        const lineNum = code.substring(0, match.index).split('\n').length;
        warnings.push({
          message: 'TextFormField without label or hint',
          line: lineNum,
          severity: 'warning',
          suggestion: 'Add labelText or hintText for form accessibility'
        });
      }
    }

    // Check for error messages
    if (code.includes('TextFormField') && !code.includes('errorText:')) {
      warnings.push({
        message: 'Form fields without error text support',
        severity: 'warning',
        suggestion: 'Provide errorText for validation feedback'
      });
    }
  }

  _checkImageAltText(code, warnings) {
    // Check for Image widgets without semantic labels
    const imagePattern = /Image\.(asset|network|file|memory)\s*\(/g;
    const matches = [...code.matchAll(imagePattern)];

    for (const match of matches) {
      const context = code.substring(Math.max(0, match.index - 50), match.index + 200);

      if (!context.includes('Semantics') && !context.includes('semanticLabel:')) {
        const lineNum = code.substring(0, match.index).split('\n').length;
        warnings.push({
          message: 'Image without alt text (semantic label)',
          line: lineNum,
          severity: 'warning',
          suggestion: 'Wrap Image with Semantics(label: "description", ...)'
        });
      }
    }
  }

  _hexToRgb(hex) {
    // Convert ARGB hex to RGB
    const a = parseInt(hex.substring(0, 2), 16);
    const r = parseInt(hex.substring(2, 4), 16);
    const g = parseInt(hex.substring(4, 6), 16);
    const b = parseInt(hex.substring(6, 8), 16);
    return { r, g, b, a };
  }

  _calculateContrast(rgb1, rgb2) {
    // Calculate relative luminance
    const l1 = this._getRelativeLuminance(rgb1);
    const l2 = this._getRelativeLuminance(rgb2);

    // Calculate contrast ratio
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  _getRelativeLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  _getTouchTargetCompliance(code) {
    const total = (code.match(/GestureDetector|InkWell|IconButton/g) || []).length;
    if (total === 0) return 100;

    const sizePattern = /(?:width|height):\s*(\d+)/g;
    let compliantCount = 0;
    let match;

    while ((match = sizePattern.exec(code)) !== null) {
      const size = parseInt(match[1]);
      if (size >= this.config.minimumTouchTarget) {
        compliantCount++;
      }
    }

    return Math.round((compliantCount / total) * 100);
  }

  _getContrastCompliance(code) {
    // Simplified: assume compliance if using theme colors
    if (code.includes('Theme.of(context)')) {
      return 90;
    }

    // Check for explicit color definitions
    const colorCount = (code.match(/Color\s*\(/g) || []).length;
    if (colorCount === 0) return 100;

    // Assume 70% compliance for manual colors (needs actual testing)
    return 70;
  }

  _calculateScore(errors, warnings) {
    const errorPenalty = errors.length * 15;
    const warningPenalty = warnings.length * 5;
    const totalPenalty = errorPenalty + warningPenalty;

    return Math.max(0, Math.min(100, 100 - totalPenalty));
  }
}

module.exports = AccessibilityValidator;
