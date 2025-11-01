/**
 * namingConventions.js
 * Naming convention converters for Dart/Flutter
 *
 * Provides functions to convert between naming conventions:
 * - PascalCase (classes, widgets)
 * - camelCase (variables, methods)
 * - snake_case (file names)
 * - UPPER_SNAKE_CASE (constants)
 */

/**
 * Convert string to PascalCase
 * @param {string} str
 * @returns {string}
 */
function toPascalCase(str) {
  if (!str) return '';

  return str
    // Handle snake_case
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    // Handle kebab-case
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    // Handle space-separated
    .replace(/\s+([a-z])/g, (_, letter) => letter.toUpperCase())
    // Capitalize first letter
    .replace(/^[a-z]/, letter => letter.toUpperCase())
    // Remove remaining separators
    .replace(/[_\-\s]/g, '');
}

/**
 * Convert string to camelCase
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  if (!str) return '';

  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to snake_case
 * @param {string} str
 * @returns {string}
 */
function toSnakeCase(str) {
  if (!str) return '';

  return str
    // Insert underscore before uppercase letters
    .replace(/([A-Z])/g, '_$1')
    // Handle numbers
    .replace(/([0-9]+)/g, '_$1')
    // Convert to lowercase
    .toLowerCase()
    // Remove leading underscore
    .replace(/^_/, '')
    // Replace spaces and hyphens with underscores
    .replace(/[\s-]+/g, '_')
    // Remove duplicate underscores
    .replace(/_+/g, '_');
}

/**
 * Convert string to UPPER_SNAKE_CASE
 * @param {string} str
 * @returns {string}
 */
function toUpperSnakeCase(str) {
  return toSnakeCase(str).toUpperCase();
}

/**
 * Convert string to kebab-case
 * @param {string} str
 * @returns {string}
 */
function toKebabCase(str) {
  return toSnakeCase(str).replace(/_/g, '-');
}

/**
 * Check if string is in PascalCase
 * @param {string} str
 * @returns {boolean}
 */
function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Check if string is in camelCase
 * @param {string} str
 * @returns {boolean}
 */
function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

/**
 * Check if string is in snake_case
 * @param {string} str
 * @returns {boolean}
 */
function isSnakeCase(str) {
  return /^[a-z][a-z0-9_]*$/.test(str);
}

/**
 * Check if string is in UPPER_SNAKE_CASE
 * @param {string} str
 * @returns {boolean}
 */
function isUpperSnakeCase(str) {
  return /^[A-Z][A-Z0-9_]*$/.test(str);
}

/**
 * Convert React component name to Flutter widget name
 * Ensures it ends with Widget if not already a standard Flutter widget
 * @param {string} name
 * @returns {string}
 */
function toFlutterWidgetName(name) {
  const pascalName = toPascalCase(name);

  // Standard Flutter widgets that don't need Widget suffix
  const standardWidgets = [
    'Container', 'Text', 'Column', 'Row', 'Stack', 'Scaffold',
    'AppBar', 'ListView', 'GridView', 'Card', 'Button',
  ];

  if (standardWidgets.includes(pascalName)) {
    return pascalName;
  }

  // Add Widget suffix if not present
  if (!pascalName.endsWith('Widget')) {
    return `${pascalName}Widget`;
  }

  return pascalName;
}

/**
 * Convert React component name to Flutter page name
 * @param {string} name
 * @returns {string}
 */
function toFlutterPageName(name) {
  const pascalName = toPascalCase(name);

  if (!pascalName.endsWith('Page')) {
    return `${pascalName}Page`;
  }

  return pascalName;
}

/**
 * Convert widget/page name to file name
 * @param {string} name
 * @returns {string}
 */
function toFileName(name) {
  // Remove Widget/Page suffix before converting
  const baseName = name
    .replace(/Widget$/, '')
    .replace(/Page$/, '')
    .replace(/Screen$/, '');

  return `${toSnakeCase(baseName)}.dart`;
}

/**
 * Convert feature name to directory name
 * @param {string} featureName
 * @returns {string}
 */
function toFeatureDirName(featureName) {
  return toSnakeCase(featureName);
}

/**
 * Generate BLoC class name from feature
 * @param {string} featureName
 * @returns {string}
 */
function toBlocName(featureName) {
  return `${toPascalCase(featureName)}Bloc`;
}

/**
 * Generate Cubit class name from feature
 * @param {string} featureName
 * @returns {string}
 */
function toCubitName(featureName) {
  return `${toPascalCase(featureName)}Cubit`;
}

/**
 * Generate Event class name from feature
 * @param {string} featureName
 * @returns {string}
 */
function toEventName(featureName) {
  return `${toPascalCase(featureName)}Event`;
}

/**
 * Generate State class name from feature
 * @param {string} featureName
 * @returns {string}
 */
function toStateName(featureName) {
  return `${toPascalCase(featureName)}State`;
}

/**
 * Generate Repository interface name from feature
 * @param {string} featureName
 * @returns {string}
 */
function toRepositoryName(featureName) {
  return `${toPascalCase(featureName)}Repository`;
}

/**
 * Generate Repository implementation name from feature
 * @param {string} featureName
 * @returns {string}
 */
function toRepositoryImplName(featureName) {
  return `${toPascalCase(featureName)}RepositoryImpl`;
}

/**
 * Generate Entity class name
 * @param {string} entityName
 * @returns {string}
 */
function toEntityName(entityName) {
  return toPascalCase(entityName);
}

/**
 * Generate Model class name (Data layer)
 * @param {string} entityName
 * @returns {string}
 */
function toModelName(entityName) {
  const baseName = toPascalCase(entityName);
  if (!baseName.endsWith('Model')) {
    return `${baseName}Model`;
  }
  return baseName;
}

/**
 * Generate UseCase class name
 * @param {string} actionName
 * @param {string} entityName
 * @returns {string}
 */
function toUseCaseName(actionName, entityName) {
  return `${toPascalCase(actionName)}${toPascalCase(entityName)}UseCase`;
}

/**
 * Generate data source class name
 * @param {string} featureName
 * @param {string} type - 'remote' or 'local'
 * @returns {string}
 */
function toDataSourceName(featureName, type = 'remote') {
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
  return `${toPascalCase(featureName)}${typeCapitalized}DataSource`;
}

/**
 * Generate private variable name (with underscore prefix)
 * @param {string} name
 * @returns {string}
 */
function toPrivateVarName(name) {
  const camelName = toCamelCase(name);
  return `_${camelName}`;
}

/**
 * Generate getter name from variable
 * @param {string} varName
 * @returns {string}
 */
function toGetterName(varName) {
  // Remove leading underscore if present
  return varName.replace(/^_/, '');
}

/**
 * Generate constant name
 * @param {string} name
 * @returns {string}
 */
function toConstantName(name) {
  return `k${toPascalCase(name)}`;
}

/**
 * Pluralize a word (simple implementation)
 * @param {string} word
 * @returns {string}
 */
function pluralize(word) {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Singularize a word (simple implementation)
 * @param {string} word
 * @returns {string}
 */
function singularize(word) {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Validate Dart identifier
 * @param {string} identifier
 * @returns {boolean}
 */
function isValidDartIdentifier(identifier) {
  // Dart reserved keywords
  const reserved = [
    'abstract', 'as', 'assert', 'async', 'await', 'break', 'case', 'catch',
    'class', 'const', 'continue', 'default', 'deferred', 'do', 'dynamic',
    'else', 'enum', 'export', 'extends', 'external', 'factory', 'false',
    'final', 'finally', 'for', 'get', 'if', 'implements', 'import', 'in',
    'is', 'library', 'new', 'null', 'operator', 'part', 'rethrow', 'return',
    'set', 'static', 'super', 'switch', 'sync', 'this', 'throw', 'true',
    'try', 'typedef', 'var', 'void', 'while', 'with', 'yield',
  ];

  if (reserved.includes(identifier)) {
    return false;
  }

  // Valid Dart identifier pattern
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(identifier);
}

/**
 * Sanitize identifier to be valid Dart
 * @param {string} identifier
 * @returns {string}
 */
function sanitizeIdentifier(identifier) {
  let sanitized = identifier;

  // Remove invalid characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9_$]/g, '_');

  // Ensure it doesn't start with a number
  if (/^[0-9]/.test(sanitized)) {
    sanitized = '_' + sanitized;
  }

  // Handle reserved keywords
  if (!isValidDartIdentifier(sanitized)) {
    sanitized = sanitized + '_';
  }

  return sanitized;
}

module.exports = {
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  toUpperSnakeCase,
  toKebabCase,
  isPascalCase,
  isCamelCase,
  isSnakeCase,
  isUpperSnakeCase,
  toFlutterWidgetName,
  toFlutterPageName,
  toFileName,
  toFeatureDirName,
  toBlocName,
  toCubitName,
  toEventName,
  toStateName,
  toRepositoryName,
  toRepositoryImplName,
  toEntityName,
  toModelName,
  toUseCaseName,
  toDataSourceName,
  toPrivateVarName,
  toGetterName,
  toConstantName,
  pluralize,
  singularize,
  isValidDartIdentifier,
  sanitizeIdentifier,
};
