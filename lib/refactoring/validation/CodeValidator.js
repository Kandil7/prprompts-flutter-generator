/**
 * CodeValidator - Validates Dart code syntax and conventions
 *
 * Checks:
 * - Dart syntax validity
 * - Required imports
 * - Class structure (extends/implements)
 * - Proper constructors (Key? key, super())
 * - Method signatures (build(), initState(), dispose())
 * - Null safety compliance (String?, required, late)
 */

const { ValidationResult } = require('../models/ValidationResult');
const logger = require('../utils/logger');

class CodeValidator {
  constructor(config = {}) {
    this.config = {
      strictNullSafety: true,
      requireConstConstructors: true,
      requireKeyParameter: true,
      ...config
    };
  }

  /**
   * Validate Dart code file
   * @param {string} filePath - Path to the Dart file
   * @param {string} code - Dart source code
   * @returns {ValidationResult}
   */
  validate(filePath, code) {
    const errors = [];
    const warnings = [];
    const info = [];

    try {
      // 1. Check basic syntax
      this._validateSyntax(code, errors);

      // 2. Check imports
      this._validateImports(code, errors, warnings);

      // 3. Check class structure
      this._validateClassStructure(code, errors, warnings);

      // 4. Check constructors
      this._validateConstructors(code, errors, warnings);

      // 5. Check method signatures
      this._validateMethodSignatures(code, errors, warnings);

      // 6. Check null safety
      this._validateNullSafety(code, errors, warnings);

      // 7. Check naming conventions
      this._validateNamingConventions(code, warnings, info);

      // 8. Check best practices
      this._validateBestPractices(code, warnings, info);

      const score = this._calculateScore(errors, warnings);

      return new ValidationResult({
        isValid: errors.length === 0,
        score,
        errors,
        warnings,
        info,
        target: filePath,
        validator: 'CodeValidator',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`CodeValidator failed for ${filePath}:`, error);
      return new ValidationResult({
        isValid: false,
        score: 0,
        errors: [{ message: `Validation failed: ${error.message}`, line: 0 }],
        warnings: [],
        info: [],
        target: filePath,
        validator: 'CodeValidator',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validate basic Dart syntax
   */
  _validateSyntax(code, errors) {
    // Check for unmatched braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        message: 'Unmatched braces in code',
        line: 0,
        severity: 'error',
        suggestion: 'Ensure all { have matching }'
      });
    }

    // Check for unmatched parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        message: 'Unmatched parentheses in code',
        line: 0,
        severity: 'error',
        suggestion: 'Ensure all ( have matching )'
      });
    }

    // Check for semicolons after class/function declarations
    const invalidSemicolons = code.match(/^\s*(class|abstract class|mixin|enum)\s+\w+.*\{.*;/gm);
    if (invalidSemicolons) {
      errors.push({
        message: 'Invalid semicolon after class/enum declaration',
        line: 0,
        severity: 'error',
        suggestion: 'Remove semicolon after { in class declarations'
      });
    }
  }

  /**
   * Validate required imports
   */
  _validateImports(code, errors, warnings) {
    const lines = code.split('\n');

    // Check if StatelessWidget/StatefulWidget is used without import
    if (code.includes('extends StatelessWidget') || code.includes('extends StatefulWidget')) {
      if (!code.includes("import 'package:flutter/material.dart'")) {
        errors.push({
          message: 'Missing required import: package:flutter/material.dart',
          line: 1,
          severity: 'error',
          suggestion: "Add: import 'package:flutter/material.dart';"
        });
      }
    }

    // Check for BLoC usage without import
    if (code.includes('BlocProvider') || code.includes('BlocBuilder') || code.includes('BlocListener')) {
      if (!code.includes("import 'package:flutter_bloc/flutter_bloc.dart'")) {
        errors.push({
          message: 'Missing required import: package:flutter_bloc/flutter_bloc.dart',
          line: 1,
          severity: 'error',
          suggestion: "Add: import 'package:flutter_bloc/flutter_bloc.dart';"
        });
      }
    }

    // Check for relative imports (warning)
    const relativeImports = code.match(/import\s+['"]\.\.?\//g);
    if (relativeImports) {
      warnings.push({
        message: `Found ${relativeImports.length} relative import(s)`,
        line: 0,
        severity: 'warning',
        suggestion: 'Consider using absolute imports for better maintainability'
      });
    }

    // Check for unused imports (basic check)
    const importMatches = code.matchAll(/import\s+['"]package:(\w+)\/[\w\/]+\.dart['"]\s+as\s+(\w+);/g);
    for (const match of importMatches) {
      const alias = match[2];
      const usagePattern = new RegExp(`\\b${alias}\\.`, 'g');
      if (!usagePattern.test(code.substring(code.indexOf(match[0]) + match[0].length))) {
        warnings.push({
          message: `Unused import alias: ${alias}`,
          line: 0,
          severity: 'warning',
          suggestion: `Remove unused import: ${match[0]}`
        });
      }
    }
  }

  /**
   * Validate class structure
   */
  _validateClassStructure(code, errors, warnings) {
    // Check for class declaration
    const classMatch = code.match(/class\s+(\w+)/);
    if (!classMatch) {
      warnings.push({
        message: 'No class declaration found',
        line: 0,
        severity: 'warning',
        suggestion: 'Dart files should typically contain a class definition'
      });
      return;
    }

    const className = classMatch[1];

    // Check if StatefulWidget has corresponding State class
    if (code.includes('extends StatefulWidget')) {
      const stateClassName = `_${className}State`;
      if (!code.includes(`class ${stateClassName}`)) {
        errors.push({
          message: `Missing State class: ${stateClassName}`,
          line: 0,
          severity: 'error',
          suggestion: `Add: class ${stateClassName} extends State<${className}> { ... }`
        });
      }
    }

    // Check for proper extends/implements usage
    if (code.includes('extends')) {
      const extendsMatch = code.match(/extends\s+(\w+)/);
      if (extendsMatch) {
        const baseClass = extendsMatch[1];
        // Widget classes should extend Widget-related classes
        if (className.includes('Page') || className.includes('Screen') || className.includes('Widget')) {
          const validBases = ['StatelessWidget', 'StatefulWidget', 'Widget'];
          if (!validBases.includes(baseClass)) {
            warnings.push({
              message: `Unusual base class for widget: ${baseClass}`,
              line: 0,
              severity: 'warning',
              suggestion: 'Widget classes typically extend StatelessWidget or StatefulWidget'
            });
          }
        }
      }
    }

    // Check for missing @override annotations
    const methodPattern = /^\s*(Widget|void|Future<\w+>|Stream<\w+>)\s+(build|initState|dispose|didUpdateWidget)\s*\(/gm;
    let match;
    while ((match = methodPattern.exec(code)) !== null) {
      const methodName = match[2];
      const linesBefore = code.substring(0, match.index).split('\n');
      const lastLine = linesBefore[linesBefore.length - 1] || '';

      if (!lastLine.trim().includes('@override')) {
        warnings.push({
          message: `Missing @override annotation for ${methodName}()`,
          line: linesBefore.length,
          severity: 'warning',
          suggestion: `Add @override before ${methodName}() method`
        });
      }
    }
  }

  /**
   * Validate constructors
   */
  _validateConstructors(code, errors, warnings) {
    const lines = code.split('\n');

    // Check for StatelessWidget/StatefulWidget constructors
    if (code.includes('extends StatelessWidget') || code.includes('extends StatefulWidget')) {
      const classMatch = code.match(/class\s+(\w+)/);
      if (classMatch) {
        const className = classMatch[1];

        // Should have a constructor with Key parameter
        const constructorPattern = new RegExp(`${className}\\s*\\(\\s*\\{\\s*(?:super\\.)?Key\\?\\s+key`, 'g');
        if (!constructorPattern.test(code)) {
          if (this.config.requireKeyParameter) {
            warnings.push({
              message: `Missing Key parameter in ${className} constructor`,
              line: 0,
              severity: 'warning',
              suggestion: `Add constructor: const ${className}({Key? key}) : super(key: key);`
            });
          }
        }

        // Check if constructor is const
        const constConstructorPattern = new RegExp(`const\\s+${className}\\s*\\(`);
        if (!constConstructorPattern.test(code) && this.config.requireConstConstructors) {
          warnings.push({
            message: `Constructor should be const: ${className}`,
            line: 0,
            severity: 'warning',
            suggestion: `Make constructor const if possible: const ${className}({Key? key})`
          });
        }

        // Check for super(key: key) call
        const superKeyPattern = /super\s*\(\s*key\s*:\s*key\s*\)/;
        if (code.includes(`${className}({`) && !superKeyPattern.test(code)) {
          warnings.push({
            message: 'Missing super(key: key) call in constructor',
            line: 0,
            severity: 'warning',
            suggestion: 'Add : super(key: key); after constructor parameters'
          });
        }
      }
    }

    // Check for named constructor syntax
    const namedConstructorPattern = /\w+\.\w+\s*\(/g;
    let match;
    while ((match = namedConstructorPattern.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      // This is okay, just info
    }
  }

  /**
   * Validate method signatures
   */
  _validateMethodSignatures(code, errors, warnings) {
    // Check build() method
    if (code.includes('extends StatelessWidget') || code.includes('extends State<')) {
      if (!code.includes('Widget build(BuildContext context)')) {
        errors.push({
          message: 'Missing or invalid build() method',
          line: 0,
          severity: 'error',
          suggestion: 'Add: @override Widget build(BuildContext context) { ... }'
        });
      }
    }

    // Check initState() in StatefulWidget
    if (code.includes('extends State<')) {
      if (code.includes('initState(')) {
        if (!code.match(/void\s+initState\s*\(\s*\)/)) {
          warnings.push({
            message: 'Invalid initState() signature',
            line: 0,
            severity: 'warning',
            suggestion: 'Signature should be: void initState()'
          });
        }
        if (!code.includes('super.initState()')) {
          errors.push({
            message: 'Missing super.initState() call',
            line: 0,
            severity: 'error',
            suggestion: 'Add super.initState(); as first line in initState()'
          });
        }
      }
    }

    // Check dispose() in StatefulWidget
    if (code.includes('extends State<')) {
      if (code.includes('dispose(')) {
        if (!code.match(/void\s+dispose\s*\(\s*\)/)) {
          warnings.push({
            message: 'Invalid dispose() signature',
            line: 0,
            severity: 'warning',
            suggestion: 'Signature should be: void dispose()'
          });
        }
        if (!code.includes('super.dispose()')) {
          errors.push({
            message: 'Missing super.dispose() call',
            line: 0,
            severity: 'error',
            suggestion: 'Add super.dispose(); as last line in dispose()'
          });
        }
      }
    }

    // Check for async build() methods (bad practice)
    if (code.match(/Widget\s+build\s*\(\s*BuildContext\s+context\s*\)\s+async/)) {
      errors.push({
        message: 'build() method should not be async',
        line: 0,
        severity: 'error',
        suggestion: 'Use FutureBuilder or StreamBuilder for async operations'
      });
    }
  }

  /**
   * Validate null safety compliance
   */
  _validateNullSafety(code, errors, warnings) {
    if (!this.config.strictNullSafety) return;

    // Check for non-nullable fields without initialization
    const fieldPattern = /^\s*(?:final|var|late)\s+(?!int\?|String\?|bool\?|double\?)(\w+)\s+(\w+)\s*;/gm;
    let match;
    while ((match = fieldPattern.exec(code)) !== null) {
      const type = match[1];
      const name = match[2];

      // Skip if it's a primitive type with clear default
      if (['int', 'double', 'bool'].includes(type)) continue;

      // Check if field is initialized in constructor
      const constructorInit = new RegExp(`this\\.${name}\\s*=`);
      if (!constructorInit.test(code) && !code.includes(`required this.${name}`)) {
        warnings.push({
          message: `Non-nullable field '${name}' may not be initialized`,
          line: code.substring(0, match.index).split('\n').length,
          severity: 'warning',
          suggestion: `Make nullable (${type}? ${name}), use 'late', or provide default value`
        });
      }
    }

    // Check for missing 'required' on non-nullable parameters
    const paramPattern = /\{\s*(?!required\s+)(?:this\.)?(\w+)\s+(\w+)\s*(?:,|\})/g;
    while ((match = paramPattern.exec(code)) !== null) {
      const type = match[1];
      const name = match[2];

      // Skip nullable types
      if (type.endsWith('?')) continue;

      warnings.push({
        message: `Non-nullable parameter '${name}' should be marked 'required'`,
        line: code.substring(0, match.index).split('\n').length,
        severity: 'warning',
        suggestion: `Add 'required' keyword: required ${type} ${name}`
      });
    }

    // Check for unsafe null operations
    const unsafeNullOps = code.match(/\w+\s*!\s*\./g);
    if (unsafeNullOps) {
      warnings.push({
        message: `Found ${unsafeNullOps.length} unsafe null assertion(s) (!)`,
        line: 0,
        severity: 'warning',
        suggestion: 'Use ?. (null-aware operator) or check for null explicitly'
      });
    }

    // Check for late keyword usage (potential runtime errors)
    const lateFields = code.match(/late\s+\w+/g);
    if (lateFields && lateFields.length > 3) {
      warnings.push({
        message: `Excessive use of 'late' keyword (${lateFields.length} occurrences)`,
        line: 0,
        severity: 'warning',
        suggestion: 'Consider using nullable types or providing default values instead'
      });
    }
  }

  /**
   * Validate naming conventions
   */
  _validateNamingConventions(code, warnings, info) {
    // Check class names (PascalCase)
    const classMatches = code.matchAll(/class\s+([a-z]\w*)/g);
    for (const match of classMatches) {
      warnings.push({
        message: `Class name should be PascalCase: ${match[1]}`,
        line: code.substring(0, match.index).split('\n').length,
        severity: 'warning',
        suggestion: `Rename to ${match[1].charAt(0).toUpperCase() + match[1].slice(1)}`
      });
    }

    // Check private class names (should start with _)
    const privateClassPattern = /class\s+([A-Z]\w*State)\s+extends\s+State</g;
    let match;
    while ((match = privateClassPattern.exec(code)) !== null) {
      const className = match[1];
      if (!className.startsWith('_')) {
        info.push({
          message: `State class should be private: ${className}`,
          line: code.substring(0, match.index).split('\n').length,
          severity: 'info',
          suggestion: `Rename to _${className}`
        });
      }
    }

    // Check variable names (camelCase)
    const varMatches = code.matchAll(/(?:var|final|const)\s+([A-Z]\w*)\s*=/g);
    for (const match of varMatches) {
      warnings.push({
        message: `Variable name should be camelCase: ${match[1]}`,
        line: code.substring(0, match.index).split('\n').length,
        severity: 'warning',
        suggestion: `Rename to ${match[1].charAt(0).toLowerCase() + match[1].slice(1)}`
      });
    }

    // Check file names should match class names
    const classMatch = code.match(/class\s+(\w+)/);
    if (classMatch) {
      const className = classMatch[1];
      const expectedFileName = className.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1) + '.dart';
      info.push({
        message: `Expected file name: ${expectedFileName}`,
        line: 0,
        severity: 'info',
        suggestion: 'Ensure file name matches class name in snake_case'
      });
    }
  }

  /**
   * Validate best practices
   */
  _validateBestPractices(code, warnings, info) {
    // Check for print() statements (should use logger)
    const printStatements = code.match(/print\s*\(/g);
    if (printStatements) {
      warnings.push({
        message: `Found ${printStatements.length} print() statement(s)`,
        line: 0,
        severity: 'warning',
        suggestion: 'Use a proper logging library instead of print()'
      });
    }

    // Check for TODO comments
    const todos = code.match(/\/\/\s*TODO:/gi);
    if (todos) {
      info.push({
        message: `Found ${todos.length} TODO comment(s)`,
        line: 0,
        severity: 'info',
        suggestion: 'Address TODO comments before production'
      });
    }

    // Check for hardcoded strings (potential i18n issues)
    const hardcodedStrings = code.match(/Text\s*\(\s*['"][^'"]{20,}['"]\s*\)/g);
    if (hardcodedStrings) {
      info.push({
        message: `Found ${hardcodedStrings.length} long hardcoded string(s)`,
        line: 0,
        severity: 'info',
        suggestion: 'Consider using localization for text content'
      });
    }

    // Check for magic numbers
    const magicNumbers = code.match(/(?:width|height|padding|margin):\s*(\d{2,})/g);
    if (magicNumbers) {
      info.push({
        message: `Found ${magicNumbers.length} magic number(s)`,
        line: 0,
        severity: 'info',
        suggestion: 'Consider extracting numbers to constants or theme values'
      });
    }

    // Check for missing const keywords on widgets
    const nonConstWidgets = code.match(/(?<!const\s)(?:Text|Icon|SizedBox|Padding|Container)\s*\(/g);
    if (nonConstWidgets && nonConstWidgets.length > 5) {
      warnings.push({
        message: `Found ${nonConstWidgets.length} non-const widget(s)`,
        line: 0,
        severity: 'warning',
        suggestion: 'Use const constructors where possible for better performance'
      });
    }

    // Check for setState() in StatefulWidget
    if (code.includes('setState(')) {
      const setStateCount = (code.match(/setState\s*\(/g) || []).length;
      if (setStateCount > 5) {
        info.push({
          message: `Multiple setState() calls (${setStateCount})`,
          line: 0,
          severity: 'info',
          suggestion: 'Consider using BLoC/Cubit for complex state management'
        });
      }
    }

    // Check for nested ternary operators
    const nestedTernary = code.match(/\?\s*[^:]+\?\s*[^:]+:/g);
    if (nestedTernary) {
      warnings.push({
        message: 'Nested ternary operators detected',
        line: 0,
        severity: 'warning',
        suggestion: 'Extract to separate methods for better readability'
      });
    }
  }

  /**
   * Calculate validation score (0-100)
   */
  _calculateScore(errors, warnings) {
    const errorPenalty = errors.length * 10;
    const warningPenalty = warnings.length * 3;
    const totalPenalty = errorPenalty + warningPenalty;

    return Math.max(0, Math.min(100, 100 - totalPenalty));
  }
}

module.exports = CodeValidator;
