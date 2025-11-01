/**
 * dartFormatter.js
 * Dart code formatting utilities
 *
 * Provides functions to format Dart code with proper indentation, spacing, and structure
 */

/**
 * Formatter options
 */
const DEFAULT_OPTIONS = {
  indent: 2,
  useTabs: false,
  lineLength: 80,
  trailingComma: true,
  singleQuotes: true,
};

/**
 * DartFormatter class
 */
class DartFormatter {
  /**
   * @param {Object} options
   */
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get indentation string
   * @param {number} level
   * @returns {string}
   */
  indent(level = 1) {
    if (this.options.useTabs) {
      return '\t'.repeat(level);
    }
    return ' '.repeat(this.options.indent * level);
  }

  /**
   * Format import statements
   * @param {string[]} imports
   * @returns {string}
   */
  formatImports(imports) {
    if (!imports || imports.length === 0) return '';

    // Separate into categories
    const dartImports = [];
    const flutterImports = [];
    const packageImports = [];
    const relativeImports = [];

    imports.forEach(imp => {
      if (imp.startsWith('dart:')) {
        dartImports.push(imp);
      } else if (imp.startsWith('package:flutter/')) {
        flutterImports.push(imp);
      } else if (imp.startsWith('package:')) {
        packageImports.push(imp);
      } else {
        relativeImports.push(imp);
      }
    });

    // Sort each category
    dartImports.sort();
    flutterImports.sort();
    packageImports.sort();
    relativeImports.sort();

    // Combine with blank lines between categories
    const sections = [dartImports, flutterImports, packageImports, relativeImports]
      .filter(section => section.length > 0);

    return sections.map(section => section.join('\n')).join('\n\n');
  }

  /**
   * Format class declaration
   * @param {Object} classInfo
   * @returns {string}
   */
  formatClass(classInfo) {
    const {
      name,
      extends: extendsClass,
      implements: implementsList = [],
      with: withList = [],
      isAbstract = false,
      constructor,
      properties = [],
      methods = [],
      fields = [],
    } = classInfo;

    let code = '';

    // Class declaration
    const abstractKeyword = isAbstract ? 'abstract ' : '';
    code += `${abstractKeyword}class ${name}`;

    if (extendsClass) {
      code += ` extends ${extendsClass}`;
    }

    if (withList.length > 0) {
      code += ` with ${withList.join(', ')}`;
    }

    if (implementsList.length > 0) {
      code += ` implements ${implementsList.join(', ')}`;
    }

    code += ' {\n';

    // Fields
    if (fields.length > 0) {
      fields.forEach(field => {
        code += `${this.indent()}${field}\n`;
      });
      code += '\n';
    }

    // Properties
    if (properties.length > 0) {
      properties.forEach(prop => {
        code += `${this.indent()}${prop}\n`;
      });
      code += '\n';
    }

    // Constructor
    if (constructor) {
      code += this.formatConstructor(constructor, 1);
      code += '\n';
    }

    // Methods
    methods.forEach((method, index) => {
      if (index > 0) code += '\n';
      code += this.formatMethod(method, 1);
    });

    code += '}\n';

    return code;
  }

  /**
   * Format constructor
   * @param {Object} constructorInfo
   * @param {number} indentLevel
   * @returns {string}
   */
  formatConstructor(constructorInfo, indentLevel = 0) {
    const {
      name,
      isConst = false,
      params = [],
      superParams = [],
      initializers = [],
    } = constructorInfo;

    const indent = this.indent(indentLevel);
    let code = '';

    // Constructor signature
    const constKeyword = isConst ? 'const ' : '';
    code += `${indent}${constKeyword}${name}(`;

    if (params.length === 0) {
      code += ')';
    } else {
      code += '{\n';
      params.forEach((param, index) => {
        code += `${this.indent(indentLevel + 1)}${param},\n`;
      });
      code += `${indent}}`;
      code += ')';
    }

    // Super call
    if (superParams.length > 0) {
      code += ` : super(${superParams.join(', ')})`;
    }

    // Initializers
    if (initializers.length > 0) {
      if (superParams.length === 0) {
        code += ' : ';
      } else {
        code += ',\n${indent}  ';
      }
      code += initializers.join(',\n${indent}  ');
    }

    code += ';\n';

    return code;
  }

  /**
   * Format method
   * @param {Object} methodInfo
   * @param {number} indentLevel
   * @returns {string}
   */
  formatMethod(methodInfo, indentLevel = 0) {
    const {
      name,
      returnType = 'void',
      params = [],
      isAsync = false,
      isOverride = false,
      body = '',
    } = methodInfo;

    const indent = this.indent(indentLevel);
    let code = '';

    // Override annotation
    if (isOverride) {
      code += `${indent}@override\n`;
    }

    // Method signature
    code += `${indent}${returnType} ${name}(`;

    if (params.length === 0) {
      code += ')';
    } else if (params.length === 1) {
      code += `${params[0]})`;
    } else {
      code += '\n';
      params.forEach((param, index) => {
        code += `${this.indent(indentLevel + 1)}${param},\n`;
      });
      code += `${indent})`;
    }

    const asyncKeyword = isAsync ? ' async' : '';
    code += `${asyncKeyword} {\n`;

    // Method body
    const bodyLines = body.split('\n');
    bodyLines.forEach(line => {
      if (line.trim()) {
        code += `${this.indent(indentLevel + 1)}${line}\n`;
      } else {
        code += '\n';
      }
    });

    code += `${indent}}\n`;

    return code;
  }

  /**
   * Format widget tree
   * @param {Object} widget
   * @param {number} indentLevel
   * @returns {string}
   */
  formatWidget(widget, indentLevel = 0) {
    const { type, properties = {}, children = [] } = widget;
    const indent = this.indent(indentLevel);
    let code = '';

    // Widget name
    code += `${indent}${type}(`;

    const propEntries = Object.entries(properties);
    const hasChildren = children.length > 0;

    // If no props and no children, close immediately
    if (propEntries.length === 0 && !hasChildren) {
      code += ')';
      return code;
    }

    code += '\n';

    // Format properties
    propEntries.forEach(([key, value]) => {
      code += `${this.indent(indentLevel + 1)}${key}: ${value},\n`;
    });

    // Format children
    if (hasChildren) {
      if (children.length === 1) {
        code += `${this.indent(indentLevel + 1)}child: `;
        code += this.formatWidget(children[0], 0);
        code += ',\n';
      } else {
        code += `${this.indent(indentLevel + 1)}children: [\n`;
        children.forEach(child => {
          code += this.formatWidget(child, indentLevel + 2);
          code += ',\n';
        });
        code += `${this.indent(indentLevel + 1)}],\n`;
      }
    }

    code += `${indent})`;

    return code;
  }

  /**
   * Format parameter list
   * @param {Object[]} params
   * @returns {string}
   */
  formatParams(params) {
    if (params.length === 0) return '';

    const required = params.filter(p => p.isRequired);
    const optional = params.filter(p => !p.isRequired);

    const parts = [];

    // Required parameters
    required.forEach(param => {
      parts.push(`required ${param.type} ${param.name}`);
    });

    // Optional parameters
    optional.forEach(param => {
      const defaultVal = param.defaultValue ? ` = ${param.defaultValue}` : '';
      parts.push(`${param.type}? ${param.name}${defaultVal}`);
    });

    return parts.join(', ');
  }

  /**
   * Format documentation comment
   * @param {string} comment
   * @param {number} indentLevel
   * @returns {string}
   */
  formatDocComment(comment, indentLevel = 0) {
    const indent = this.indent(indentLevel);
    const lines = comment.split('\n');

    let formatted = `${indent}/// ${lines[0]}\n`;

    for (let i = 1; i < lines.length; i++) {
      formatted += `${indent}/// ${lines[i]}\n`;
    }

    return formatted;
  }

  /**
   * Format enum
   * @param {Object} enumInfo
   * @returns {string}
   */
  formatEnum(enumInfo) {
    const { name, values } = enumInfo;
    let code = `enum ${name} {\n`;

    values.forEach((value, index) => {
      const comma = index < values.length - 1 ? ',' : '';
      code += `${this.indent()}${value}${comma}\n`;
    });

    code += '}\n';

    return code;
  }

  /**
   * Wrap string to line length
   * @param {string} str
   * @returns {string}
   */
  wrapToLineLength(str) {
    // Simple implementation - can be enhanced
    return str;
  }

  /**
   * Format entire file
   * @param {Object} fileInfo
   * @returns {string}
   */
  formatFile(fileInfo) {
    const {
      imports = [],
      classes = [],
      functions = [],
      enums = [],
      constants = [],
    } = fileInfo;

    let code = '';

    // Imports
    if (imports.length > 0) {
      code += this.formatImports(imports);
      code += '\n\n';
    }

    // Constants
    if (constants.length > 0) {
      constants.forEach(constant => {
        code += `${constant}\n`;
      });
      code += '\n';
    }

    // Enums
    if (enums.length > 0) {
      enums.forEach(enumInfo => {
        code += this.formatEnum(enumInfo);
        code += '\n';
      });
    }

    // Classes
    classes.forEach((classInfo, index) => {
      if (index > 0) code += '\n';
      code += this.formatClass(classInfo);
    });

    // Functions
    if (functions.length > 0) {
      code += '\n';
      functions.forEach(func => {
        code += this.formatMethod(func, 0);
        code += '\n';
      });
    }

    return code;
  }

  /**
   * Add proper null safety operators
   * @param {string} code
   * @returns {string}
   */
  addNullSafety(code) {
    // This is a placeholder - in production, would use AST analysis
    return code;
  }

  /**
   * Organize imports alphabetically
   * @param {string[]} imports
   * @returns {string[]}
   */
  organizeImports(imports) {
    return [...new Set(imports)].sort();
  }
}

/**
 * Create a formatter instance
 * @param {Object} options
 * @returns {DartFormatter}
 */
function createFormatter(options) {
  return new DartFormatter(options);
}

/**
 * Quick format function
 * @param {Object} fileInfo
 * @param {Object} options
 * @returns {string}
 */
function formatDartCode(fileInfo, options = {}) {
  const formatter = new DartFormatter(options);
  return formatter.formatFile(fileInfo);
}

module.exports = {
  DartFormatter,
  createFormatter,
  formatDartCode,
  DEFAULT_OPTIONS,
};
