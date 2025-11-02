/**
 * JSXPatternConverter - Convert complex React/JSX patterns to Flutter
 *
 * Handles:
 * - Higher-Order Components (HOCs) → Mixins
 * - Render Props → Builder pattern
 * - React.memo → const constructors
 * - React.forwardRef → GlobalKey
 * - React.Fragment → multiple children
 * - Complex conditional rendering
 * - List rendering with keys
 */

const { createModuleLogger } = require('../utils/logger');
const logger = createModuleLogger('JSXPatternConverter');

/**
 * Pattern types
 */
const PatternType = {
  HOC: 'HigherOrderComponent',
  RENDER_PROPS: 'RenderProps',
  MEMO: 'React.memo',
  FORWARD_REF: 'React.forwardRef',
  FRAGMENT: 'React.Fragment',
  CONDITIONAL: 'ConditionalRendering',
  LIST: 'ListRendering',
  PORTAL: 'React.Portal',
  SUSPENSE: 'React.Suspense',
  ERROR_BOUNDARY: 'ErrorBoundary',
};

/**
 * JSXPatternConverter class
 */
class JSXPatternConverter {
  /**
   * Detect and convert JSX patterns
   * @param {Object} ast - AST from React parser
   * @param {Object} context - Conversion context
   * @returns {Object} Conversion result
   */
  convertPatterns(ast, context = {}) {
    logger.debug('Analyzing JSX patterns');

    const result = {
      hocs: [],              // Higher-Order Components
      renderProps: [],       // Render Props patterns
      memoized: [],          // React.memo components
      forwardRefs: [],       // forwardRef components
      fragments: [],         // Fragment usages
      conditionals: [],      // Complex conditionals
      lists: [],             // List renderings
      mixins: [],            // Generated mixins
      builders: [],          // Builder patterns
      imports: new Set(),    // Required imports
    };

    // Detect patterns in AST
    this._detectPatterns(ast, result, context);

    logger.success(`Detected ${this._getTotalPatterns(result)} JSX patterns`);

    return result;
  }

  /**
   * Detect patterns in AST
   * @param {Object} ast - AST node
   * @param {Object} result - Result accumulator
   * @param {Object} context - Context
   * @private
   */
  _detectPatterns(ast, result, context) {
    const t = require('@babel/types');
    const traverse = require('@babel/traverse').default;

    traverse(ast, {
      // Detect all CallExpression patterns (HOCs, React.memo, forwardRef, list rendering)
      CallExpression: (path) => {
        if (this._isHOC(path.node)) {
          this._convertHOC(path.node, result);
        } else if (this._isReactMemo(path.node)) {
          this._convertMemo(path.node, result);
        } else if (this._isForwardRef(path.node)) {
          this._convertForwardRef(path.node, result);
        } else if (this._isListRendering(path.node)) {
          this._convertListRendering(path.node, result);
        }
      },

      // Detect Render Props
      JSXElement: (path) => {
        if (this._isRenderProps(path.node)) {
          this._convertRenderProps(path.node, result);
        }
      },

      // Detect Fragment
      JSXFragment: (path) => {
        this._convertFragment(path.node, result);
      },

      // Detect complex conditionals
      ConditionalExpression: (path) => {
        if (path.parent.type === 'JSXExpressionContainer') {
          this._convertConditional(path.node, result);
        }
      },
    });
  }

  /**
   * Check if node is a Higher-Order Component
   * @param {Object} node - AST node
   * @returns {boolean}
   * @private
   */
  _isHOC(node) {
    const t = require('@babel/types');

    // Pattern: withSomething(Component)
    if (t.isCallExpression(node) &&
        t.isIdentifier(node.callee) &&
        node.callee.name.startsWith('with')) {
      return true;
    }

    return false;
  }

  /**
   * Convert HOC to mixin
   * @param {Object} node - HOC call expression
   * @param {Object} result - Result accumulator
   * @private
   */
  _convertHOC(node, result) {
    const t = require('@babel/types');

    const hocName = node.callee.name; // e.g., 'withAuth'
    const componentArg = node.arguments[0];

    let componentName = 'Component';
    if (t.isIdentifier(componentArg)) {
      componentName = componentArg.name;
    }

    const mixinName = `${hocName.replace('with', '')}Mixin`;

    result.hocs.push({
      hocName,
      componentName,
      mixinName,
      pattern: 'mixin',
    });

    logger.debug('Detected HOC', { hocName, componentName, mixinName });
  }

  /**
   * Check if node is React.memo
   * @param {Object} node - AST node
   * @returns {boolean}
   * @private
   */
  _isReactMemo(node) {
    const t = require('@babel/types');

    // Pattern: React.memo(Component) or memo(Component)
    if (t.isCallExpression(node)) {
      if (t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: 'React' }) &&
          t.isIdentifier(node.callee.property, { name: 'memo' })) {
        return true;
      }

      if (t.isIdentifier(node.callee, { name: 'memo' })) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert React.memo to const constructor
   * @param {Object} node - React.memo call
   * @param {Object} result - Result accumulator
   * @private
   */
  _convertMemo(node, result) {
    const t = require('@babel/types');

    const componentArg = node.arguments[0];
    let componentName = 'Component';

    if (t.isIdentifier(componentArg)) {
      componentName = componentArg.name;
    } else if (t.isArrowFunctionExpression(componentArg) ||
               t.isFunctionExpression(componentArg)) {
      componentName = 'MemoizedComponent';
    }

    result.memoized.push({
      componentName,
      pattern: 'const_constructor',
      flutterPattern: 'Use const constructor for immutable widgets',
    });

    logger.debug('Detected React.memo', { componentName });
  }

  /**
   * Check if node is React.forwardRef
   * @param {Object} node - AST node
   * @returns {boolean}
   * @private
   */
  _isForwardRef(node) {
    const t = require('@babel/types');

    // Pattern: React.forwardRef((props, ref) => ...)
    if (t.isCallExpression(node)) {
      if (t.isMemberExpression(node.callee) &&
          t.isIdentifier(node.callee.object, { name: 'React' }) &&
          t.isIdentifier(node.callee.property, { name: 'forwardRef' })) {
        return true;
      }

      if (t.isIdentifier(node.callee, { name: 'forwardRef' })) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert React.forwardRef to GlobalKey
   * @param {Object} node - forwardRef call
   * @param {Object} result - Result accumulator
   * @private
   */
  _convertForwardRef(node, result) {
    result.forwardRefs.push({
      pattern: 'GlobalKey',
      flutterPattern: 'Use GlobalKey to access widget from parent',
      implementation: 'final key = GlobalKey<MyWidgetState>();',
    });

    logger.debug('Detected React.forwardRef');
  }

  /**
   * Check if JSX element uses render props pattern
   * @param {Object} node - JSX element
   * @returns {boolean}
   * @private
   */
  _isRenderProps(node) {
    const t = require('@babel/types');

    // Check if any prop is a function (render prop)
    if (node.openingElement && node.openingElement.attributes) {
      for (const attr of node.openingElement.attributes) {
        if (t.isJSXAttribute(attr) &&
            t.isJSXExpressionContainer(attr.value)) {
          const expr = attr.value.expression;
          if (t.isArrowFunctionExpression(expr) ||
              t.isFunctionExpression(expr)) {
            // Common render prop names
            const propName = attr.name.name;
            if (propName === 'render' ||
                propName === 'children' ||
                propName.startsWith('render')) {
              return true;
            }
          }
        }
      }
    }

    // Check if children is a function (render prop pattern)
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (t.isJSXExpressionContainer(child)) {
          const expr = child.expression;
          if (t.isArrowFunctionExpression(expr) ||
              t.isFunctionExpression(expr)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Convert render props to Builder pattern
   * @param {Object} node - JSX element with render props
   * @param {Object} result - Result accumulator
   * @private
   */
  _convertRenderProps(node, result) {
    const t = require('@babel/types');

    const elementName = node.openingElement.name.name || 'Component';

    // Find the render prop - first check attributes
    let renderPropName = 'render';
    if (node.openingElement.attributes) {
      for (const attr of node.openingElement.attributes) {
        if (t.isJSXAttribute(attr) &&
            t.isJSXExpressionContainer(attr.value)) {
          const expr = attr.value.expression;
          if (t.isArrowFunctionExpression(expr) ||
              t.isFunctionExpression(expr)) {
            const propName = attr.name.name;
            if (propName.startsWith('render') || propName === 'children') {
              renderPropName = propName;
              break;
            }
          }
        }
      }
    }

    // If no render prop in attributes, check if children is a function
    if (renderPropName === 'render' && node.children) {
      for (const child of node.children) {
        if (t.isJSXExpressionContainer(child)) {
          const expr = child.expression;
          if (t.isArrowFunctionExpression(expr) ||
              t.isFunctionExpression(expr)) {
            renderPropName = 'children';
            break;
          }
        }
      }
    }

    result.renderProps.push({
      componentName: elementName,
      renderPropName,
      pattern: 'Builder',
      flutterPattern: 'Use Builder widget with builder callback',
    });

    logger.debug('Detected Render Props', { componentName: elementName, renderPropName });
  }

  /**
   * Convert Fragment
   * @param {Object} node - Fragment node
   * @param {Object} result - Result accumulator
   * @private
   */
  _convertFragment(node, result) {
    const t = require('@babel/types');

    // Count only JSX elements (not text nodes or whitespace)
    const jsxChildCount = node.children.filter(child =>
      t.isJSXElement(child) || t.isJSXFragment(child)
    ).length;

    result.fragments.push({
      pattern: 'multiple_children',
      flutterPattern: 'Return array of widgets or use Column/Row',
      childCount: jsxChildCount,
    });

    logger.debug('Detected Fragment', { childCount: jsxChildCount });
  }

  /**
   * Convert conditional rendering
   * @param {Object} node - Conditional expression
   * @param {Object} result - Result accumulator
   * @private
   */
  _convertConditional(node, result) {
    result.conditionals.push({
      pattern: 'ternary',
      flutterPattern: 'condition ? Widget1() : Widget2()',
      hasAlternate: !!node.alternate,
    });

    logger.debug('Detected conditional rendering');
  }

  /**
   * Check if node is list rendering
   * @param {Object} node - AST node
   * @returns {boolean}
   * @private
   */
  _isListRendering(node) {
    const t = require('@babel/types');

    // Pattern: array.map(item => <Component key={item.id} />)
    if (t.isCallExpression(node) &&
        t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.property, { name: 'map' })) {
      return true;
    }

    return false;
  }

  /**
   * Convert list rendering
   * @param {Object} node - Map call expression
   * @param {Object} result - Result accumulator
   * @private
   */
  _convertListRendering(node, result) {
    const t = require('@babel/types');

    const arrayName = t.isMemberExpression(node.callee)
      ? this._expressionToString(node.callee.object)
      : 'items';

    result.lists.push({
      arrayName,
      pattern: 'ListView.builder',
      flutterPattern: 'Use ListView.builder with itemCount and itemBuilder',
    });

    logger.debug('Detected list rendering', { arrayName });
  }

  /**
   * Generate Flutter code from patterns
   * @param {Object} patterns - Detected patterns
   * @returns {Object} Generated code
   */
  generateFlutterCode(patterns) {
    const code = {
      mixins: this._generateMixins(patterns.hocs),
      builders: this._generateBuilders(patterns.renderProps),
      memoizedWidgets: this._generateMemoizedWidgets(patterns.memoized),
      forwardRefWidgets: this._generateForwardRefWidgets(patterns.forwardRefs),
      listBuilders: this._generateListBuilders(patterns.lists),
      comments: this._generateComments(patterns),
    };

    return code;
  }

  /**
   * Generate mixins from HOCs
   * @param {Array} hocs - HOC patterns
   * @returns {string} Mixin code
   * @private
   */
  _generateMixins(hocs) {
    if (hocs.length === 0) return '';

    const mixins = hocs.map(hoc => {
      return `
// Mixin converted from HOC: ${hoc.hocName}
mixin ${hoc.mixinName}<T extends StatefulWidget> on State<T> {
  // TODO: Implement ${hoc.hocName} logic here
  // This was originally a Higher-Order Component wrapping ${hoc.componentName}
}

// Usage: class MyWidgetState extends State<MyWidget> with ${hoc.mixinName} { }
`;
    }).join('\n');

    return mixins;
  }

  /**
   * Generate builders from render props
   * @param {Array} renderProps - Render props patterns
   * @returns {string} Builder code
   * @private
   */
  _generateBuilders(renderProps) {
    if (renderProps.length === 0) return '';

    const builders = renderProps.map(rp => {
      return `
// Builder pattern converted from render prop: ${rp.componentName}.${rp.renderPropName}
Builder(
  builder: (BuildContext context) {
    // TODO: Implement builder logic
    // Original render prop: ${rp.renderPropName}
    return Container();
  },
)
`;
    }).join('\n');

    return builders;
  }

  /**
   * Generate memoized widgets
   * @param {Array} memoized - Memoized patterns
   * @returns {string} Memoized widget code
   * @private
   */
  _generateMemoizedWidgets(memoized) {
    if (memoized.length === 0) return '';

    const widgets = memoized.map(memo => {
      return `
// Memoized widget (converted from React.memo)
class ${memo.componentName} extends StatelessWidget {
  const ${memo.componentName}({Key? key}) : super(key: key); // Use const constructor

  @override
  Widget build(BuildContext context) {
    // Widget is automatically memoized when using const constructor
    return Container();
  }
}
`;
    }).join('\n');

    return widgets;
  }

  /**
   * Generate forwardRef widgets
   * @param {Array} forwardRefs - ForwardRef patterns
   * @returns {string} ForwardRef code
   * @private
   */
  _generateForwardRefWidgets(forwardRefs) {
    if (forwardRefs.length === 0) return '';

    return `
// ForwardRef pattern using GlobalKey
final myWidgetKey = GlobalKey<MyWidgetState>();

// Access widget state from parent:
// myWidgetKey.currentState?.someMethod();
`;
  }

  /**
   * Generate list builders
   * @param {Array} lists - List patterns
   * @returns {string} List builder code
   * @private
   */
  _generateListBuilders(lists) {
    if (lists.length === 0) return '';

    const builders = lists.map(list => {
      return `
// List rendering (converted from ${list.arrayName}.map)
ListView.builder(
  itemCount: ${list.arrayName}.length,
  itemBuilder: (context, index) {
    final item = ${list.arrayName}[index];
    return ItemWidget(item: item);
  },
)
`;
    }).join('\n');

    return builders;
  }

  /**
   * Generate helpful comments
   * @param {Object} patterns - All patterns
   * @returns {string} Comments
   * @private
   */
  _generateComments(patterns) {
    const comments = [];

    if (patterns.fragments.length > 0) {
      comments.push('// Fragments: In Flutter, return array of widgets or wrap in Column/Row');
    }

    if (patterns.conditionals.length > 0) {
      comments.push('// Conditionals: Use ternary (condition ? Widget1() : Widget2()) or if statements');
    }

    return comments.join('\n');
  }

  /**
   * Convert expression to string
   * @param {Object} expression - AST expression
   * @returns {string}
   * @private
   */
  _expressionToString(expression) {
    const generate = require('@babel/generator').default;

    try {
      return generate(expression, { concise: true }).code;
    } catch (error) {
      logger.warn('Failed to convert expression to string', { error: error.message });
      return 'expression';
    }
  }

  /**
   * Get total pattern count
   * @param {Object} result - Pattern result
   * @returns {number}
   * @private
   */
  _getTotalPatterns(result) {
    return result.hocs.length +
           result.renderProps.length +
           result.memoized.length +
           result.forwardRefs.length +
           result.fragments.length +
           result.conditionals.length +
           result.lists.length;
  }

  /**
   * Generate comprehensive conversion guide
   * @param {Object} patterns - Detected patterns
   * @returns {string} Markdown guide
   */
  generateConversionGuide(patterns) {
    let guide = '# JSX Pattern Conversion Guide\n\n';

    if (patterns.hocs.length > 0) {
      guide += '## Higher-Order Components (HOCs)\n\n';
      patterns.hocs.forEach(hoc => {
        guide += `### ${hoc.hocName}\n`;
        guide += `- **Pattern**: Mixin\n`;
        guide += `- **Flutter**: \`${hoc.mixinName}\`\n`;
        guide += `- **Usage**: \`class MyWidgetState extends State<MyWidget> with ${hoc.mixinName} {}\`\n\n`;
      });
    }

    if (patterns.renderProps.length > 0) {
      guide += '## Render Props\n\n';
      patterns.renderProps.forEach(rp => {
        guide += `### ${rp.componentName}.${rp.renderPropName}\n`;
        guide += `- **Pattern**: Builder\n`;
        guide += `- **Flutter**: Use \`Builder\` widget with \`builder\` callback\n\n`;
      });
    }

    if (patterns.memoized.length > 0) {
      guide += '## React.memo\n\n';
      guide += '- **Flutter**: Use \`const\` constructors for immutable widgets\n';
      guide += '- **Auto-optimization**: Flutter automatically optimizes const widgets\n\n';
    }

    if (patterns.forwardRefs.length > 0) {
      guide += '## React.forwardRef\n\n';
      guide += '- **Flutter**: Use \`GlobalKey\` to access widget/state from parent\n';
      guide += '- **Example**: \`final key = GlobalKey<MyWidgetState>();\`\n\n';
    }

    if (patterns.lists.length > 0) {
      guide += '## List Rendering\n\n';
      guide += '- **Flutter**: Use \`ListView.builder\` for efficient rendering\n';
      guide += '- **Keys**: Flutter handles keys automatically in lists\n\n';
    }

    return guide;
  }
}

module.exports = new JSXPatternConverter();
module.exports.JSXPatternConverter = JSXPatternConverter;
module.exports.PatternType = PatternType;
