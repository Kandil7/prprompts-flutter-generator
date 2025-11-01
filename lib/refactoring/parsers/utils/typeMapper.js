/**
 * typeMapper.js
 * Maps React/TypeScript types to Dart types
 *
 * Handles primitive types, complex types, generics, unions, and intersections
 */

const { createModuleLogger } = require('../../utils/logger');

const logger = createModuleLogger('TypeMapper');

/**
 * Default type mappings from React/TS to Dart
 */
const DEFAULT_TYPE_MAPPINGS = {
  // Primitives
  'string': 'String',
  'number': 'num',
  'boolean': 'bool',
  'any': 'dynamic',
  'void': 'void',
  'null': 'Null',
  'undefined': 'Null',
  'never': 'Never',

  // Built-in types
  'Date': 'DateTime',
  'RegExp': 'RegExp',
  'Error': 'Exception',

  // Collections
  'Array': 'List',
  'Map': 'Map',
  'Set': 'Set',
  'WeakMap': 'Map',
  'WeakSet': 'Set',

  // Async
  'Promise': 'Future',
  'Observable': 'Stream',

  // React types
  'React.ReactNode': 'Widget',
  'React.ReactElement': 'Widget',
  'ReactNode': 'Widget',
  'ReactElement': 'Widget',
  'JSX.Element': 'Widget',

  // Function types
  'Function': 'Function',
  'VoidFunction': 'VoidCallback',

  // React Native types
  'StyleProp': 'TextStyle',
  'ViewStyle': 'BoxDecoration',
  'TextStyle': 'TextStyle',
  'ImageStyle': 'BoxDecoration',
};

/**
 * Type mapper class
 */
class TypeMapper {
  /**
   * @param {Object} customMappings - Custom type mappings to override defaults
   */
  constructor(customMappings = {}) {
    this.mappings = { ...DEFAULT_TYPE_MAPPINGS, ...customMappings };
  }

  /**
   * Map a React/TypeScript type to Dart type
   * @param {string} reactType - React type string
   * @param {Object} options - Mapping options
   * @param {boolean} options.nullable - Whether to make type nullable
   * @param {boolean} options.optional - Whether type is optional
   * @returns {string} - Dart type string
   */
  mapType(reactType, options = {}) {
    if (!reactType || typeof reactType !== 'string') {
      logger.warn('Invalid type provided to mapType:', reactType);
      return 'dynamic';
    }

    const { nullable = false, optional = false } = options;

    // Trim whitespace
    const trimmedType = reactType.trim();

    // Handle union types (e.g., string | number)
    if (trimmedType.includes('|')) {
      return this._mapUnionType(trimmedType, options);
    }

    // Handle intersection types (e.g., Type1 & Type2)
    if (trimmedType.includes('&')) {
      return this._mapIntersectionType(trimmedType, options);
    }

    // Handle array types (e.g., string[], Array<string>)
    const arrayMatch = trimmedType.match(/^(.+)\[\]$/) || trimmedType.match(/^Array<(.+)>$/);
    if (arrayMatch) {
      const elementType = this.mapType(arrayMatch[1].trim());
      return this._makeNullable(`List<${elementType}>`, nullable || optional);
    }

    // Handle generic types (e.g., Promise<User>, Map<string, number>)
    const genericMatch = trimmedType.match(/^(\w+)<(.+)>$/);
    if (genericMatch) {
      return this._mapGenericType(genericMatch[1], genericMatch[2], options);
    }

    // Handle function types (e.g., (x: number) => string)
    if (trimmedType.includes('=>') || trimmedType.startsWith('(') && trimmedType.includes(':')) {
      return this._mapFunctionType(trimmedType, options);
    }

    // Handle tuple types (e.g., [string, number])
    if (trimmedType.startsWith('[') && trimmedType.endsWith(']')) {
      return this._mapTupleType(trimmedType, options);
    }

    // Handle object literal types (e.g., { name: string, age: number })
    if (trimmedType.startsWith('{') && trimmedType.endsWith('}')) {
      return this._mapObjectType(trimmedType, options);
    }

    // Direct mapping
    const dartType = this.mappings[trimmedType] || this._toPascalCase(trimmedType);

    return this._makeNullable(dartType, nullable || optional);
  }

  /**
   * Map union type to Dart
   * @private
   */
  _mapUnionType(unionType, options) {
    const types = unionType.split('|').map(t => t.trim());

    // Check for nullable union (e.g., string | null)
    if (types.includes('null') || types.includes('undefined')) {
      const nonNullTypes = types.filter(t => t !== 'null' && t !== 'undefined');
      if (nonNullTypes.length === 1) {
        return this.mapType(nonNullTypes[0], { ...options, nullable: true });
      }
    }

    // Map all types
    const mappedTypes = types.map(t => this.mapType(t, { ...options, nullable: false }));

    // If all types are the same, return single type
    const uniqueTypes = [...new Set(mappedTypes)];
    if (uniqueTypes.length === 1) {
      return this._makeNullable(uniqueTypes[0], options.nullable);
    }

    // Use Object as common base type for unions
    logger.info(`Union type ${unionType} mapped to Object (consider creating custom class)`);
    return this._makeNullable('Object', options.nullable);
  }

  /**
   * Map intersection type to Dart
   * @private
   */
  _mapIntersectionType(intersectionType, options) {
    // Dart doesn't have intersection types, use Object or suggest custom class
    logger.warn(`Intersection type ${intersectionType} cannot be directly mapped to Dart`);
    return this._makeNullable('Object', options.nullable);
  }

  /**
   * Map generic type to Dart
   * @private
   */
  _mapGenericType(baseType, typeArgs, options) {
    const dartBaseType = this.mapType(baseType, { nullable: false });
    const dartTypeArgs = typeArgs
      .split(',')
      .map(arg => this.mapType(arg.trim(), { nullable: false }))
      .join(', ');

    return this._makeNullable(`${dartBaseType}<${dartTypeArgs}>`, options.nullable);
  }

  /**
   * Map function type to Dart
   * @private
   */
  _mapFunctionType(funcType, options) {
    // Extract return type
    const arrowMatch = funcType.match(/=>\s*(.+)$/);
    const returnType = arrowMatch ? this.mapType(arrowMatch[1].trim()) : 'void';

    // Extract parameters
    const paramsMatch = funcType.match(/^\(([^)]*)\)/);
    if (paramsMatch) {
      const params = paramsMatch[1]
        .split(',')
        .filter(p => p.trim())
        .map(param => {
          const [name, type] = param.split(':').map(s => s.trim());
          const dartType = type ? this.mapType(type) : 'dynamic';
          return dartType;
        });

      if (params.length > 0) {
        return this._makeNullable(`${returnType} Function(${params.join(', ')})`, options.nullable);
      }
    }

    // Simple callback
    if (returnType === 'void') {
      return this._makeNullable('VoidCallback', options.nullable);
    }

    return this._makeNullable(`${returnType} Function()`, options.nullable);
  }

  /**
   * Map tuple type to Dart (using records if Dart 3.0+)
   * @private
   */
  _mapTupleType(tupleType, options) {
    const elements = tupleType
      .slice(1, -1) // Remove [ ]
      .split(',')
      .map(el => this.mapType(el.trim()));

    // For Dart 3.0+ records: (String, int, bool)
    // For older Dart: List<dynamic>
    const dartTuple = `(${elements.join(', ')})`;
    logger.info(`Tuple type ${tupleType} mapped to record ${dartTuple} (requires Dart 3.0+)`);

    return this._makeNullable(dartTuple, options.nullable);
  }

  /**
   * Map object literal type to Dart
   * @private
   */
  _mapObjectType(objectType, options) {
    // Suggest creating a custom class
    logger.info(`Object literal type detected: ${objectType}. Consider creating a custom Dart class.`);
    return this._makeNullable('Map<String, dynamic>', options.nullable);
  }

  /**
   * Make a type nullable by adding ?
   * @private
   */
  _makeNullable(dartType, nullable) {
    if (nullable && !dartType.endsWith('?') && !dartType.endsWith('dynamic')) {
      return `${dartType}?`;
    }
    return dartType;
  }

  /**
   * Convert string to PascalCase
   * @private
   */
  _toPascalCase(str) {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, (_, c) => c.toUpperCase());
  }

  /**
   * Add custom type mapping
   * @param {string} reactType - React type
   * @param {string} dartType - Dart type
   */
  addMapping(reactType, dartType) {
    this.mappings[reactType] = dartType;
  }

  /**
   * Get all current mappings
   * @returns {Object}
   */
  getMappings() {
    return { ...this.mappings };
  }

  /**
   * Map PropTypes type to Dart type
   * @param {string} propType - PropTypes type (e.g., PropTypes.string)
   * @param {Object} options - Mapping options
   * @returns {string}
   */
  mapPropType(propType, options = {}) {
    const propTypeMap = {
      'PropTypes.string': 'String',
      'PropTypes.number': 'num',
      'PropTypes.bool': 'bool',
      'PropTypes.func': 'Function',
      'PropTypes.array': 'List',
      'PropTypes.object': 'Map<String, dynamic>',
      'PropTypes.any': 'dynamic',
      'PropTypes.node': 'Widget',
      'PropTypes.element': 'Widget',
      'PropTypes.symbol': 'Symbol',
      'PropTypes.instanceOf': 'Object',
      'PropTypes.oneOf': 'dynamic', // Use enum if possible
      'PropTypes.oneOfType': 'dynamic',
      'PropTypes.arrayOf': 'List',
      'PropTypes.objectOf': 'Map',
      'PropTypes.shape': 'Map<String, dynamic>',
      'PropTypes.exact': 'Map<String, dynamic>',
    };

    const baseType = propTypeMap[propType] || 'dynamic';
    return this._makeNullable(baseType, options.nullable || options.optional);
  }

  /**
   * Extract type from TypeScript interface or type alias
   * @param {string} typeDef - Type definition string
   * @returns {Object} - Parsed type information
   */
  parseTypeDefinition(typeDef) {
    const trimmed = typeDef.trim();

    // Interface
    if (trimmed.startsWith('interface')) {
      return this._parseInterface(trimmed);
    }

    // Type alias
    if (trimmed.startsWith('type')) {
      return this._parseTypeAlias(trimmed);
    }

    // Enum
    if (trimmed.startsWith('enum')) {
      return this._parseEnum(trimmed);
    }

    return { type: 'unknown', dartEquivalent: 'dynamic' };
  }

  /**
   * Parse TypeScript interface
   * @private
   */
  _parseInterface(interfaceDef) {
    const nameMatch = interfaceDef.match(/interface\s+(\w+)/);
    const name = nameMatch ? nameMatch[1] : 'UnknownInterface';

    return {
      type: 'interface',
      name,
      dartEquivalent: `class ${name}`,
      suggestion: `Create a Dart class named ${name} with freezed annotation`,
    };
  }

  /**
   * Parse TypeScript type alias
   * @private
   */
  _parseTypeAlias(typeDef) {
    const nameMatch = typeDef.match(/type\s+(\w+)/);
    const name = nameMatch ? nameMatch[1] : 'UnknownType';

    return {
      type: 'typeAlias',
      name,
      dartEquivalent: `typedef ${name}`,
      suggestion: `Consider using typedef or creating a class for ${name}`,
    };
  }

  /**
   * Parse TypeScript enum
   * @private
   */
  _parseEnum(enumDef) {
    const nameMatch = enumDef.match(/enum\s+(\w+)/);
    const name = nameMatch ? nameMatch[1] : 'UnknownEnum';

    return {
      type: 'enum',
      name,
      dartEquivalent: `enum ${name}`,
      suggestion: `Create a Dart enum named ${name}`,
    };
  }
}

// Export singleton instance
const defaultTypeMapper = new TypeMapper();

module.exports = {
  TypeMapper,
  defaultTypeMapper,
  DEFAULT_TYPE_MAPPINGS,
};
