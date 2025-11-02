/**
 * JSXPatternConverter Tests
 * Tests complex JSX pattern detection and conversion
 */

const jsxPatternConverter = require('../../../lib/refactoring/generators/JSXPatternConverter');
const { PatternType } = require('../../../lib/refactoring/generators/JSXPatternConverter');
const parser = require('@babel/parser');

describe('JSXPatternConverter', () => {
  /**
   * Helper to parse code
   */
  function parseCode(code) {
    return parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  }

  describe('Higher-Order Components (HOCs)', () => {
    test('should detect withAuth HOC', () => {
      const code = `
        const EnhancedComponent = withAuth(MyComponent);
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.hocs).toHaveLength(1);
      expect(result.hocs[0].hocName).toBe('withAuth');
      expect(result.hocs[0].componentName).toBe('MyComponent');
      expect(result.hocs[0].mixinName).toBe('AuthMixin');
    });

    test('should detect withRouter HOC', () => {
      const code = `
        export default withRouter(ProfilePage);
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.hocs).toHaveLength(1);
      expect(result.hocs[0].hocName).toBe('withRouter');
      expect(result.hocs[0].mixinName).toBe('RouterMixin');
    });

    test('should detect multiple HOCs', () => {
      const code = `
        const Enhanced1 = withAuth(Component1);
        const Enhanced2 = withTheme(Component2);
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.hocs).toHaveLength(2);
      expect(result.hocs[0].hocName).toBe('withAuth');
      expect(result.hocs[1].hocName).toBe('withTheme');
    });
  });

  describe('React.memo', () => {
    test('should detect React.memo', () => {
      const code = `
        const MemoizedComponent = React.memo(MyComponent);
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.memoized).toHaveLength(1);
      expect(result.memoized[0].componentName).toBe('MyComponent');
      expect(result.memoized[0].pattern).toBe('const_constructor');
    });

    test('should detect memo without React prefix', () => {
      const code = `
        const MemoizedComponent = memo(MyComponent);
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.memoized).toHaveLength(1);
      expect(result.memoized[0].componentName).toBe('MyComponent');
    });

    test('should detect React.memo with inline component', () => {
      const code = `
        const MemoizedComponent = React.memo(() => {
          return <div>Hello</div>;
        });
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.memoized).toHaveLength(1);
      expect(result.memoized[0].componentName).toBe('MemoizedComponent');
    });
  });

  describe('React.forwardRef', () => {
    test('should detect React.forwardRef', () => {
      const code = `
        const RefComponent = React.forwardRef((props, ref) => {
          return <input ref={ref} />;
        });
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.forwardRefs).toHaveLength(1);
      expect(result.forwardRefs[0].pattern).toBe('GlobalKey');
    });

    test('should detect forwardRef without React prefix', () => {
      const code = `
        const RefComponent = forwardRef((props, ref) => {
          return <input ref={ref} />;
        });
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.forwardRefs).toHaveLength(1);
    });
  });

  describe('Render Props', () => {
    test('should detect render prop pattern', () => {
      const code = `
        <DataProvider render={(data) => <Display data={data} />} />
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.renderProps).toHaveLength(1);
      expect(result.renderProps[0].componentName).toBe('DataProvider');
      expect(result.renderProps[0].renderPropName).toBe('render');
      expect(result.renderProps[0].pattern).toBe('Builder');
    });

    test('should detect children as function (render prop)', () => {
      const code = `
        <MouseTracker>
          {(position) => <div>x: {position.x}, y: {position.y}</div>}
        </MouseTracker>
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.renderProps).toHaveLength(1);
      expect(result.renderProps[0].renderPropName).toBe('children');
    });

    test('should detect custom render prop names', () => {
      const code = `
        <ListComponent renderItem={(item) => <Item data={item} />} />
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.renderProps).toHaveLength(1);
      expect(result.renderProps[0].renderPropName).toBe('renderItem');
    });
  });

  describe('React.Fragment', () => {
    test('should detect Fragment', () => {
      const code = `
        <>
          <div>First</div>
          <div>Second</div>
        </>
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.fragments).toHaveLength(1);
      expect(result.fragments[0].pattern).toBe('multiple_children');
      expect(result.fragments[0].childCount).toBe(2);
    });

    test('should detect multiple Fragments', () => {
      const code = `
        const Component1 = () => (
          <>
            <div>A</div>
            <div>B</div>
          </>
        );

        const Component2 = () => (
          <>
            <span>C</span>
          </>
        );
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.fragments).toHaveLength(2);
    });
  });

  describe('Conditional Rendering', () => {
    test('should detect ternary conditional', () => {
      const code = `
        const Component = () => (
          <div>
            {isLoggedIn ? <Dashboard /> : <Login />}
          </div>
        );
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.conditionals).toHaveLength(1);
      expect(result.conditionals[0].pattern).toBe('ternary');
      expect(result.conditionals[0].hasAlternate).toBe(true);
    });

    test('should detect multiple conditionals', () => {
      const code = `
        const Component = () => (
          <div>
            {isAdmin ? <AdminPanel /> : <UserPanel />}
            {loading ? <Spinner /> : <Content />}
          </div>
        );
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.conditionals).toHaveLength(2);
    });
  });

  describe('List Rendering', () => {
    test('should detect array.map list rendering', () => {
      const code = `
        const List = () => (
          <div>
            {items.map(item => <Item key={item.id} data={item} />)}
          </div>
        );
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.lists).toHaveLength(1);
      expect(result.lists[0].arrayName).toBe('items');
      expect(result.lists[0].pattern).toBe('ListView.builder');
    });

    test('should detect list rendering with index', () => {
      const code = `
        const List = () => (
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user.name}</li>
            ))}
          </ul>
        );
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.lists).toHaveLength(1);
      expect(result.lists[0].arrayName).toBe('users');
    });

    test('should detect multiple list renderings', () => {
      const code = `
        const Component = () => (
          <div>
            {posts.map(post => <Post key={post.id} />)}
            {comments.map(comment => <Comment key={comment.id} />)}
          </div>
        );
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.lists).toHaveLength(2);
      expect(result.lists[0].arrayName).toBe('posts');
      expect(result.lists[1].arrayName).toBe('comments');
    });
  });

  describe('Code Generation', () => {
    test('should generate mixin from HOC', () => {
      const code = `
        const Enhanced = withAuth(MyComponent);
      `;

      const ast = parseCode(code);
      const patterns = jsxPatternConverter.convertPatterns(ast);
      const flutterCode = jsxPatternConverter.generateFlutterCode(patterns);

      expect(flutterCode.mixins).toContain('mixin AuthMixin');
      expect(flutterCode.mixins).toContain('withAuth');
    });

    test('should generate const constructor for React.memo', () => {
      const code = `
        const Memoized = React.memo(MyComponent);
      `;

      const ast = parseCode(code);
      const patterns = jsxPatternConverter.convertPatterns(ast);
      const flutterCode = jsxPatternConverter.generateFlutterCode(patterns);

      expect(flutterCode.memoizedWidgets).toContain('const MyComponent');
      expect(flutterCode.memoizedWidgets).toContain('const constructor');
    });

    test('should generate Builder for render props', () => {
      const code = `
        <DataProvider render={(data) => <div>{data}</div>} />
      `;

      const ast = parseCode(code);
      const patterns = jsxPatternConverter.convertPatterns(ast);
      const flutterCode = jsxPatternConverter.generateFlutterCode(patterns);

      expect(flutterCode.builders).toContain('Builder');
      expect(flutterCode.builders).toContain('builder: (BuildContext context)');
    });

    test('should generate GlobalKey for forwardRef', () => {
      const code = `
        const Ref = React.forwardRef((props, ref) => <input ref={ref} />);
      `;

      const ast = parseCode(code);
      const patterns = jsxPatternConverter.convertPatterns(ast);
      const flutterCode = jsxPatternConverter.generateFlutterCode(patterns);

      expect(flutterCode.forwardRefWidgets).toContain('GlobalKey');
    });

    test('should generate ListView.builder for list rendering', () => {
      const code = `
        {items.map(item => <Item key={item.id} />)}
      `;

      const ast = parseCode(code);
      const patterns = jsxPatternConverter.convertPatterns(ast);
      const flutterCode = jsxPatternConverter.generateFlutterCode(patterns);

      expect(flutterCode.listBuilders).toContain('ListView.builder');
      expect(flutterCode.listBuilders).toContain('itemCount: items.length');
      expect(flutterCode.listBuilders).toContain('itemBuilder');
    });
  });

  describe('Complex Scenarios', () => {
    test('should detect multiple pattern types in one component', () => {
      const code = `
        const Component = withAuth(React.memo((props) => {
          return (
            <>
              {items.map(item => <Item key={item.id} />)}
              {loading ? <Spinner /> : <Content />}
            </>
          );
        }));
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.hocs).toHaveLength(1);
      expect(result.memoized).toHaveLength(1);
      expect(result.fragments).toHaveLength(1);
      expect(result.lists).toHaveLength(1);
      expect(result.conditionals).toHaveLength(1);
    });

    test('should handle nested HOCs', () => {
      const code = `
        const Enhanced = withAuth(withRouter(withTheme(MyComponent)));
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.hocs).toHaveLength(3);
      expect(result.hocs[0].hocName).toBe('withAuth');
      expect(result.hocs[1].hocName).toBe('withRouter');
      expect(result.hocs[2].hocName).toBe('withTheme');
    });
  });

  describe('Conversion Guide Generation', () => {
    test('should generate comprehensive conversion guide', () => {
      const code = `
        const Enhanced = withAuth(React.memo(MyComponent));
        <DataProvider render={(data) => <div>{data}</div>} />
        {items.map(item => <Item key={item.id} />)}
      `;

      const ast = parseCode(code);
      const patterns = jsxPatternConverter.convertPatterns(ast);
      const guide = jsxPatternConverter.generateConversionGuide(patterns);

      expect(guide).toContain('# JSX Pattern Conversion Guide');
      expect(guide).toContain('## Higher-Order Components');
      expect(guide).toContain('## React.memo');
      expect(guide).toContain('## Render Props');
      expect(guide).toContain('## List Rendering');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty AST', () => {
      const code = ``;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.hocs).toHaveLength(0);
      expect(result.memoized).toHaveLength(0);
      expect(result.renderProps).toHaveLength(0);
    });

    test('should handle code without JSX patterns', () => {
      const code = `
        const x = 1;
        function foo() { return x; }
      `;

      const ast = parseCode(code);
      const result = jsxPatternConverter.convertPatterns(ast);

      expect(result.hocs).toHaveLength(0);
      expect(result.memoized).toHaveLength(0);
    });

    test('should handle malformed JSX gracefully', () => {
      // This test just ensures no crash on unusual patterns
      const code = `
        const Component = () => <div>Hello</div>;
      `;

      const ast = parseCode(code);
      expect(() => {
        jsxPatternConverter.convertPatterns(ast);
      }).not.toThrow();
    });
  });
});
