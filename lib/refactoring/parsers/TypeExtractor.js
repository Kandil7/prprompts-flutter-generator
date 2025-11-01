/**
 * TypeExtractor.js
 * Extracts TypeScript type information and PropTypes from React components
 *
 * Maps React types to Dart types for Flutter conversion
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const { defaultTypeMapper } = require('./utils/typeMapper');
const { createModuleLogger } = require('../utils/logger');

const logger = createModuleLogger('TypeExtractor');

/**
 * Type Extractor class
 */
class TypeExtractor {
  /**
   * @param {Object} options
   * @param {Object} options.typeMapper - Custom type mapper instance
   */
  constructor(options = {}) {
    this.typeMapper = options.typeMapper || defaultTypeMapper;
    this.extractedTypes = new Map();
    this.interfaces = new Map();
    this.typeAliases = new Map();
    this.enums = new Map();
  }

  /**
   * Extract type information from source code
   * @param {string} sourceCode - Source code to analyze
   * @param {string} filePath - File path for error reporting
   * @returns {Object} - Extracted type information
   */
  extract(sourceCode, filePath) {
    try {
      logger.info(`Extracting types from: ${filePath}`);

      const ast = parser.parse(sourceCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      const result = {
        interfaces: [],
        typeAliases: [],
        enums: [],
        propTypes: {},
        componentProps: [],
      };

      traverse(ast, {
        // TypeScript Interface
        TSInterfaceDeclaration: (path) => {
          const interfaceInfo = this._extractInterface(path.node);
          result.interfaces.push(interfaceInfo);
          this.interfaces.set(interfaceInfo.name, interfaceInfo);
        },

        // TypeScript Type Alias
        TSTypeAliasDeclaration: (path) => {
          const typeAliasInfo = this._extractTypeAlias(path.node);
          result.typeAliases.push(typeAliasInfo);
          this.typeAliases.set(typeAliasInfo.name, typeAliasInfo);
        },

        // TypeScript Enum
        TSEnumDeclaration: (path) => {
          const enumInfo = this._extractEnum(path.node);
          result.enums.push(enumInfo);
          this.enums.set(enumInfo.name, enumInfo);
        },

        // PropTypes (static class property or variable)
        ClassProperty: (path) => {
          if (path.node.static && path.node.key.name === 'propTypes') {
            result.propTypes = this._extractPropTypes(path.node.value);
          }
        },

        // Functional component with typed props
        VariableDeclarator: (path) => {
          const node = path.node;
          if (this._isFunctionalComponent(node.init)) {
            const propsType = this._extractPropsFromFunction(node.init);
            if (propsType) {
              result.componentProps = propsType;
            }
          }
        },
      });

      logger.success(`Extracted ${result.interfaces.length} interfaces, ${result.typeAliases.length} type aliases, ${result.enums.length} enums`);
      return result;

    } catch (error) {
      logger.error(`Failed to extract types from ${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract interface information
   * @private
   */
  _extractInterface(node) {
    const interfaceName = node.id.name;
    const properties = [];

    if (node.body && node.body.body) {
      node.body.body.forEach(member => {
        if (t.isTSPropertySignature(member)) {
          const prop = this._extractTypeProperty(member);
          if (prop) {
            properties.push(prop);
          }
        }
      });
    }

    const dartClass = this._generateDartClass(interfaceName, properties);

    return {
      name: interfaceName,
      properties,
      dartEquivalent: dartClass,
      extends: node.extends ? node.extends.map(e => e.expression.name) : [],
    };
  }

  /**
   * Extract type alias information
   * @private
   */
  _extractTypeAlias(node) {
    const typeName = node.id.name;
    const typeAnnotation = node.typeAnnotation;

    let dartEquivalent = `typedef ${typeName}`;
    let properties = [];

    // Object type alias
    if (t.isTSTypeLiteral(typeAnnotation)) {
      properties = typeAnnotation.members
        .filter(m => t.isTSPropertySignature(m))
        .map(m => this._extractTypeProperty(m))
        .filter(Boolean);

      dartEquivalent = this._generateDartClass(typeName, properties);
    }
    // Primitive or other type alias
    else {
      const mappedType = this._extractTypeAnnotation(typeAnnotation);
      dartEquivalent = `typedef ${typeName} = ${mappedType};`;
    }

    return {
      name: typeName,
      properties,
      dartEquivalent,
      originalType: this._typeAnnotationToString(typeAnnotation),
    };
  }

  /**
   * Extract enum information
   * @private
   */
  _extractEnum(node) {
    const enumName = node.id.name;
    const members = node.members.map(member => {
      const name = member.id.name;
      const value = member.initializer
        ? this._extractEnumValue(member.initializer)
        : null;

      return { name, value };
    });

    const dartEnum = this._generateDartEnum(enumName, members);

    return {
      name: enumName,
      members,
      dartEquivalent: dartEnum,
    };
  }

  /**
   * Extract property from type
   * @private
   */
  _extractTypeProperty(propertyNode) {
    if (!propertyNode.key) return null;

    const name = propertyNode.key.name || propertyNode.key.value;
    const isOptional = propertyNode.optional || false;
    const isReadonly = propertyNode.readonly || false;

    let type = 'dynamic';
    if (propertyNode.typeAnnotation) {
      type = this._extractTypeAnnotation(propertyNode.typeAnnotation.typeAnnotation);
    }

    const dartType = this.typeMapper.mapType(type, {
      nullable: isOptional,
      optional: isOptional,
    });

    return {
      name,
      type,
      dartType,
      isOptional,
      isReadonly,
    };
  }

  /**
   * Extract type annotation
   * @private
   */
  _extractTypeAnnotation(typeAnnotation) {
    if (!typeAnnotation) return 'dynamic';

    // Keyword types (string, number, boolean, etc.)
    if (t.isTSStringKeyword(typeAnnotation)) return 'string';
    if (t.isTSNumberKeyword(typeAnnotation)) return 'number';
    if (t.isTSBooleanKeyword(typeAnnotation)) return 'boolean';
    if (t.isTSAnyKeyword(typeAnnotation)) return 'any';
    if (t.isTSVoidKeyword(typeAnnotation)) return 'void';
    if (t.isTSNullKeyword(typeAnnotation)) return 'null';
    if (t.isTSUndefinedKeyword(typeAnnotation)) return 'undefined';

    // Type references (User, Array<string>, etc.)
    if (t.isTSTypeReference(typeAnnotation)) {
      const typeName = typeAnnotation.typeName.name;
      const typeParams = typeAnnotation.typeParameters;

      if (typeParams && typeParams.params.length > 0) {
        const params = typeParams.params
          .map(p => this._extractTypeAnnotation(p))
          .join(', ');
        return `${typeName}<${params}>`;
      }

      return typeName;
    }

    // Array types
    if (t.isTSArrayType(typeAnnotation)) {
      const elementType = this._extractTypeAnnotation(typeAnnotation.elementType);
      return `${elementType}[]`;
    }

    // Union types (string | number)
    if (t.isTSUnionType(typeAnnotation)) {
      const types = typeAnnotation.types
        .map(t => this._extractTypeAnnotation(t))
        .join(' | ');
      return types;
    }

    // Intersection types (Type1 & Type2)
    if (t.isTSIntersectionType(typeAnnotation)) {
      const types = typeAnnotation.types
        .map(t => this._extractTypeAnnotation(t))
        .join(' & ');
      return types;
    }

    // Literal types ('success' | 'error')
    if (t.isTSLiteralType(typeAnnotation)) {
      return this._extractLiteralType(typeAnnotation.literal);
    }

    // Function types
    if (t.isTSFunctionType(typeAnnotation)) {
      return this._extractFunctionType(typeAnnotation);
    }

    // Tuple types [string, number]
    if (t.isTSTupleType(typeAnnotation)) {
      const elements = typeAnnotation.elementTypes
        .map(e => this._extractTypeAnnotation(e))
        .join(', ');
      return `[${elements}]`;
    }

    // Object literal types
    if (t.isTSTypeLiteral(typeAnnotation)) {
      return '{ ... }'; // Simplified representation
    }

    return 'any';
  }

  /**
   * Extract literal type value
   * @private
   */
  _extractLiteralType(literal) {
    if (t.isStringLiteral(literal)) return `'${literal.value}'`;
    if (t.isNumericLiteral(literal)) return String(literal.value);
    if (t.isBooleanLiteral(literal)) return String(literal.value);
    return 'unknown';
  }

  /**
   * Extract function type
   * @private
   */
  _extractFunctionType(functionType) {
    const params = functionType.parameters
      .map(p => this._extractTypeAnnotation(p.typeAnnotation?.typeAnnotation))
      .join(', ');

    const returnType = this._extractTypeAnnotation(functionType.typeAnnotation?.typeAnnotation);

    return `(${params}) => ${returnType}`;
  }

  /**
   * Convert type annotation to string
   * @private
   */
  _typeAnnotationToString(typeAnnotation) {
    return this._extractTypeAnnotation(typeAnnotation);
  }

  /**
   * Extract PropTypes
   * @private
   */
  _extractPropTypes(propTypesNode) {
    const propTypes = {};

    if (t.isObjectExpression(propTypesNode)) {
      propTypesNode.properties.forEach(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const propName = prop.key.name;
          const propType = this._extractPropType(prop.value);
          propTypes[propName] = propType;
        }
      });
    }

    return propTypes;
  }

  /**
   * Extract single PropType
   * @private
   */
  _extractPropType(propTypeNode) {
    // PropTypes.string
    if (t.isMemberExpression(propTypeNode) &&
        t.isIdentifier(propTypeNode.object, { name: 'PropTypes' })) {
      const typeName = propTypeNode.property.name;
      const dartType = this.typeMapper.mapPropType(`PropTypes.${typeName}`);

      return {
        type: typeName,
        dartType,
        isRequired: false,
      };
    }

    // PropTypes.string.isRequired
    if (t.isMemberExpression(propTypeNode) &&
        t.isMemberExpression(propTypeNode.object) &&
        t.isIdentifier(propTypeNode.object.object, { name: 'PropTypes' }) &&
        t.isIdentifier(propTypeNode.property, { name: 'isRequired' })) {
      const typeName = propTypeNode.object.property.name;
      const dartType = this.typeMapper.mapPropType(`PropTypes.${typeName}`, { nullable: false });

      return {
        type: typeName,
        dartType,
        isRequired: true,
      };
    }

    return {
      type: 'any',
      dartType: 'dynamic',
      isRequired: false,
    };
  }

  /**
   * Check if node is a functional component
   * @private
   */
  _isFunctionalComponent(node) {
    if (!node) return false;

    return (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) &&
           this._returnsJSX(node);
  }

  /**
   * Check if function returns JSX
   * @private
   */
  _returnsJSX(funcNode) {
    let returnsJSX = false;

    if (funcNode.body) {
      // Arrow function with direct return: () => <div />
      if (t.isJSXElement(funcNode.body) || t.isJSXFragment(funcNode.body)) {
        returnsJSX = true;
      }
      // Function with block body
      else if (t.isBlockStatement(funcNode.body)) {
        // Manually check return statements without full traverse
        const checkStatements = (statements) => {
          for (const stmt of statements) {
            if (t.isReturnStatement(stmt)) {
              if (t.isJSXElement(stmt.argument) || t.isJSXFragment(stmt.argument)) {
                returnsJSX = true;
                break;
              }
            }
            if (t.isBlockStatement(stmt) && stmt.body) {
              checkStatements(stmt.body);
            }
          }
        };

        checkStatements(funcNode.body.body);
      }
    }

    return returnsJSX;
  }

  /**
   * Extract props type from functional component
   * @private
   */
  _extractPropsFromFunction(funcNode) {
    if (!funcNode.params || funcNode.params.length === 0) {
      return [];
    }

    const propsParam = funcNode.params[0];

    // Destructured props with types: ({ name, age }: Props) => {}
    if (t.isObjectPattern(propsParam)) {
      const props = propsParam.properties.map(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const name = prop.key.name;
          let type = 'any';

          // Check for type annotation on destructured prop
          if (prop.value && prop.value.typeAnnotation) {
            type = this._extractTypeAnnotation(prop.value.typeAnnotation.typeAnnotation);
          }

          const dartType = this.typeMapper.mapType(type);

          return { name, type, dartType, isOptional: false };
        }
        return null;
      }).filter(Boolean);

      return props;
    }

    // Named props with type: (props: PropsType) => {}
    if (t.isIdentifier(propsParam) && propsParam.typeAnnotation) {
      const typeAnnotation = propsParam.typeAnnotation.typeAnnotation;

      // Type reference to interface
      if (t.isTSTypeReference(typeAnnotation)) {
        const typeName = typeAnnotation.typeName.name;
        // Look up interface in extracted types
        const interfaceInfo = this.interfaces.get(typeName);
        if (interfaceInfo) {
          return interfaceInfo.properties.map(p => ({
            name: p.name,
            type: p.type,
            dartType: p.dartType,
            isOptional: p.isOptional,
          }));
        }
      }

      // Inline type literal
      if (t.isTSTypeLiteral(typeAnnotation)) {
        return typeAnnotation.members
          .filter(m => t.isTSPropertySignature(m))
          .map(m => {
            const prop = this._extractTypeProperty(m);
            return {
              name: prop.name,
              type: prop.type,
              dartType: prop.dartType,
              isOptional: prop.isOptional,
            };
          });
      }
    }

    return [];
  }

  /**
   * Generate Dart class from properties
   * @private
   */
  _generateDartClass(className, properties) {
    const props = properties.map(p => {
      const modifier = p.isReadonly ? 'final' : '';
      return `  ${modifier} ${p.dartType} ${p.name};`;
    }).join('\n');

    return `class ${className} {\n${props}\n\n  ${className}({\n${
      properties.map(p => `    ${p.isOptional ? '' : 'required '}this.${p.name},`).join('\n')
    }\n  });\n}`;
  }

  /**
   * Generate Dart enum
   * @private
   */
  _generateDartEnum(enumName, members) {
    const enumValues = members.map(m => `  ${m.name}`).join(',\n');
    return `enum ${enumName} {\n${enumValues},\n}`;
  }

  /**
   * Extract enum value
   * @private
   */
  _extractEnumValue(initializer) {
    if (t.isStringLiteral(initializer)) return initializer.value;
    if (t.isNumericLiteral(initializer)) return initializer.value;
    return null;
  }

  /**
   * Get all extracted interfaces
   * @returns {Map}
   */
  getInterfaces() {
    return new Map(this.interfaces);
  }

  /**
   * Get all extracted type aliases
   * @returns {Map}
   */
  getTypeAliases() {
    return new Map(this.typeAliases);
  }

  /**
   * Get all extracted enums
   * @returns {Map}
   */
  getEnums() {
    return new Map(this.enums);
  }
}

module.exports = {
  TypeExtractor,
};
