/**
 * astHelpers.js
 * AST traversal and manipulation utilities for React/TypeScript parsing
 *
 * Provides helper functions for working with Babel AST nodes
 */

const t = require('@babel/types');

/**
 * Check if node is a React component (class or functional)
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function isReactComponent(node) {
  // Check for class component extending React.Component or Component
  if (t.isClassDeclaration(node)) {
    if (node.superClass) {
      const superClassName = getSuperClassName(node.superClass);
      return ['Component', 'React.Component', 'PureComponent', 'React.PureComponent'].includes(superClassName);
    }
  }

  // Check for functional component (arrow function or function declaration)
  if (t.isFunctionDeclaration(node) || t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
    // Must have a JSX return or JSX in body
    return containsJSX(node);
  }

  return false;
}

/**
 * Get the super class name from a class declaration
 * @param {Object} superClass - Super class node
 * @returns {string}
 */
function getSuperClassName(superClass) {
  if (t.isIdentifier(superClass)) {
    return superClass.name;
  }
  if (t.isMemberExpression(superClass)) {
    const object = superClass.object.name || '';
    const property = superClass.property.name || '';
    return `${object}.${property}`;
  }
  return '';
}

/**
 * Check if node contains JSX
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function containsJSX(node) {
  let hasJSX = false;

  const checkNode = (n) => {
    if (!n) return;

    if (t.isJSXElement(n) || t.isJSXFragment(n)) {
      hasJSX = true;
      return;
    }

    // Check return statements
    if (t.isReturnStatement(n) && n.argument) {
      if (t.isJSXElement(n.argument) || t.isJSXFragment(n.argument)) {
        hasJSX = true;
        return;
      }
    }

    // Recursively check children
    if (n.body) {
      if (Array.isArray(n.body)) {
        n.body.forEach(checkNode);
      } else {
        checkNode(n.body);
      }
    }
  };

  checkNode(node);
  return hasJSX;
}

/**
 * Extract component name from various node types
 * @param {Object} node - AST node
 * @returns {string|null}
 */
function getComponentName(node) {
  // Class or function declaration
  if (t.isClassDeclaration(node) || t.isFunctionDeclaration(node)) {
    return node.id ? node.id.name : null;
  }

  // Variable declaration with component
  if (t.isVariableDeclarator(node)) {
    return node.id.name;
  }

  return null;
}

/**
 * Extract props parameter from component function
 * @param {Object} node - Function node
 * @returns {Object|null} - Props parameter node
 */
function getPropsParameter(node) {
  if (!node.params || node.params.length === 0) {
    return null;
  }

  const firstParam = node.params[0];

  // Handle destructured props: ({ prop1, prop2 }) => {}
  if (t.isObjectPattern(firstParam)) {
    return firstParam;
  }

  // Handle typed props: (props: PropsType) => {}
  if (t.isIdentifier(firstParam)) {
    return firstParam;
  }

  return null;
}

/**
 * Extract destructured prop names from object pattern
 * @param {Object} pattern - ObjectPattern node
 * @returns {string[]}
 */
function getDestructuredProps(pattern) {
  if (!t.isObjectPattern(pattern)) {
    return [];
  }

  return pattern.properties
    .filter(prop => t.isObjectProperty(prop) || t.isRestElement(prop))
    .map(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        return prop.key.name;
      }
      if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
        return `...${prop.argument.name}`;
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Check if node is a useState hook call
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function isUseStateHook(node) {
  return t.isCallExpression(node) &&
         t.isIdentifier(node.callee) &&
         node.callee.name === 'useState';
}

/**
 * Check if node is a useEffect hook call
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function isUseEffectHook(node) {
  return t.isCallExpression(node) &&
         t.isIdentifier(node.callee) &&
         node.callee.name === 'useEffect';
}

/**
 * Check if node is a hook call (useXxx)
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function isHookCall(node) {
  return t.isCallExpression(node) &&
         t.isIdentifier(node.callee) &&
         node.callee.name.startsWith('use') &&
         node.callee.name.length > 3 &&
         node.callee.name[3] === node.callee.name[3].toUpperCase();
}

/**
 * Get hook name from call expression
 * @param {Object} node - CallExpression node
 * @returns {string|null}
 */
function getHookName(node) {
  if (isHookCall(node) && t.isIdentifier(node.callee)) {
    return node.callee.name;
  }
  return null;
}

/**
 * Extract state variable name from useState destructuring
 * @param {Object} node - VariableDeclarator with useState
 * @returns {{name: string, setter: string}|null}
 */
function getStateVariableFromUseState(node) {
  if (!t.isVariableDeclarator(node)) {
    return null;
  }

  const init = node.init;
  if (!isUseStateHook(init)) {
    return null;
  }

  // Check if destructured: const [value, setValue] = useState()
  if (t.isArrayPattern(node.id) && node.id.elements.length >= 2) {
    const nameNode = node.id.elements[0];
    const setterNode = node.id.elements[1];

    if (t.isIdentifier(nameNode) && t.isIdentifier(setterNode)) {
      return {
        name: nameNode.name,
        setter: setterNode.name,
      };
    }
  }

  return null;
}

/**
 * Check if node is a method call (e.g., fetch, axios.get)
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function isApiCall(node) {
  if (!t.isCallExpression(node)) {
    return false;
  }

  const callee = node.callee;

  // Direct function calls: fetch(), axios()
  if (t.isIdentifier(callee)) {
    const name = callee.name;
    return ['fetch', 'axios', 'api', 'request'].includes(name);
  }

  // Member expressions: axios.get(), api.post()
  if (t.isMemberExpression(callee)) {
    const object = callee.object;
    const property = callee.property;

    if (t.isIdentifier(object) && t.isIdentifier(property)) {
      const objectName = object.name;
      const methodName = property.name;
      const apiObjects = ['axios', 'api', 'http', 'client', 'fetch'];
      const apiMethods = ['get', 'post', 'put', 'delete', 'patch', 'request'];

      return apiObjects.includes(objectName) || apiMethods.includes(methodName);
    }
  }

  return false;
}

/**
 * Extract string value from node
 * @param {Object} node - AST node
 * @returns {string|null}
 */
function getStringValue(node) {
  if (t.isStringLiteral(node)) {
    return node.value;
  }
  if (t.isTemplateLiteral(node) && node.quasis.length === 1) {
    return node.quasis[0].value.cooked;
  }
  return null;
}

/**
 * Extract number value from node
 * @param {Object} node - AST node
 * @returns {number|null}
 */
function getNumberValue(node) {
  if (t.isNumericLiteral(node)) {
    return node.value;
  }
  return null;
}

/**
 * Extract boolean value from node
 * @param {Object} node - AST node
 * @returns {boolean|null}
 */
function getBooleanValue(node) {
  if (t.isBooleanLiteral(node)) {
    return node.value;
  }
  return null;
}

/**
 * Get literal value from various node types
 * @param {Object} node - AST node
 * @returns {*}
 */
function getLiteralValue(node) {
  const strVal = getStringValue(node);
  if (strVal !== null) return strVal;

  const numVal = getNumberValue(node);
  if (numVal !== null) return numVal;

  const boolVal = getBooleanValue(node);
  if (boolVal !== null) return boolVal;

  if (t.isNullLiteral(node)) return null;
  if (t.isIdentifier(node) && node.name === 'undefined') return undefined;

  return null;
}

/**
 * Check if node is an import declaration
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function isImportDeclaration(node) {
  return t.isImportDeclaration(node);
}

/**
 * Extract import information
 * @param {Object} node - ImportDeclaration node
 * @returns {Object}
 */
function getImportInfo(node) {
  if (!t.isImportDeclaration(node)) {
    return null;
  }

  return {
    source: node.source.value,
    specifiers: node.specifiers.map(spec => {
      if (t.isImportDefaultSpecifier(spec)) {
        return { type: 'default', local: spec.local.name };
      }
      if (t.isImportSpecifier(spec)) {
        return {
          type: 'named',
          local: spec.local.name,
          imported: spec.imported.name,
        };
      }
      if (t.isImportNamespaceSpecifier(spec)) {
        return { type: 'namespace', local: spec.local.name };
      }
      return null;
    }).filter(Boolean),
  };
}

/**
 * Check if node is an export declaration
 * @param {Object} node - AST node
 * @returns {boolean}
 */
function isExportDeclaration(node) {
  return t.isExportNamedDeclaration(node) ||
         t.isExportDefaultDeclaration(node) ||
         t.isExportAllDeclaration(node);
}

/**
 * Get export type and name
 * @param {Object} node - Export declaration node
 * @returns {Object}
 */
function getExportInfo(node) {
  if (t.isExportDefaultDeclaration(node)) {
    return {
      type: 'default',
      declaration: node.declaration,
    };
  }

  if (t.isExportNamedDeclaration(node)) {
    return {
      type: 'named',
      specifiers: node.specifiers.map(spec => ({
        local: spec.local.name,
        exported: spec.exported.name,
      })),
      declaration: node.declaration,
    };
  }

  return null;
}

/**
 * Find all nodes of a specific type in AST
 * @param {Object} ast - AST root
 * @param {Function} predicate - Function to test each node
 * @returns {Array}
 */
function findNodes(ast, predicate) {
  const results = [];

  const traverse = (node) => {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (predicate(node)) {
      results.push(node);
    }

    // Traverse all properties
    Object.keys(node).forEach(key => {
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach(traverse);
      } else if (value && typeof value === 'object') {
        traverse(value);
      }
    });
  };

  traverse(ast);
  return results;
}

/**
 * Get the line and column from a node's location
 * @param {Object} node - AST node with loc property
 * @returns {{line: number, column: number}|null}
 */
function getNodeLocation(node) {
  if (node && node.loc && node.loc.start) {
    return {
      line: node.loc.start.line,
      column: node.loc.start.column,
    };
  }
  return null;
}

/**
 * Extract JSDoc comment from node
 * @param {Object} node - AST node
 * @returns {string|null}
 */
function getJSDocComment(node) {
  if (node && node.leadingComments) {
    const jsdocComment = node.leadingComments.find(
      comment => comment.type === 'CommentBlock' && comment.value.startsWith('*')
    );
    return jsdocComment ? jsdocComment.value : null;
  }
  return null;
}

module.exports = {
  // Component detection
  isReactComponent,
  getSuperClassName,
  containsJSX,
  getComponentName,

  // Props handling
  getPropsParameter,
  getDestructuredProps,

  // Hooks
  isUseStateHook,
  isUseEffectHook,
  isHookCall,
  getHookName,
  getStateVariableFromUseState,

  // API calls
  isApiCall,

  // Values
  getStringValue,
  getNumberValue,
  getBooleanValue,
  getLiteralValue,

  // Imports/Exports
  isImportDeclaration,
  getImportInfo,
  isExportDeclaration,
  getExportInfo,

  // Traversal
  findNodes,
  getNodeLocation,
  getJSDocComment,
};
