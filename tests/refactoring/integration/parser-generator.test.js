const { ReactParser } = require('../../../lib/refactoring/parsers/ReactParser');
const { WidgetGenerator } = require('../../../lib/refactoring/generators/WidgetGenerator');
const { ComponentModel } = require('../../../lib/refactoring/models/ComponentModel');

describe('Parser to Generator Flow', () => {
  let parser;
  let generator;

  beforeEach(() => {
    parser = new ReactParser();
    generator = new WidgetGenerator();
  });

  describe('Simple Component Transformation', () => {
    test('should parse React component and generate Flutter widget', () => {
      const reactCode = `
import React from 'react';

const HelloWidget = ({ name }) => {
  return (
    <div className="container">
      <h1>Hello {name}!</h1>
    </div>
  );
};

export default HelloWidget;
`;

      // Parse React
      const componentModel = parser.parse(reactCode, 'HelloWidget.jsx');

      expect(componentModel).toBeInstanceOf(ComponentModel);
      expect(componentModel.name).toBe('HelloWidget');
      expect(componentModel.type).toBe('functional');
      expect(componentModel.props).toHaveLength(1);
      expect(componentModel.props[0].name).toBe('name');

      // Generate Flutter
      const widgetModel = generator.generate(componentModel);

      expect(widgetModel.name).toBe('HelloWidget');
      expect(widgetModel.type).toBe('stateless');
      expect(widgetModel.dartCode).toContain('class HelloWidget extends StatelessWidget');
      expect(widgetModel.dartCode).toContain('final String name');
    });

    test('should preserve component structure through transformation', () => {
      const reactCode = `
import React from 'react';

const ProfileCard = ({ user, onEdit }) => {
  return (
    <div className="profile-card">
      <img src={user.avatar} alt="Avatar" />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <button onClick={onEdit}>Edit Profile</button>
    </div>
  );
};

export default ProfileCard;
`;

      const componentModel = parser.parse(reactCode, 'ProfileCard.jsx');
      const widgetModel = generator.generate(componentModel);

      // Verify props transformation
      expect(componentModel.props.map(p => p.name)).toContain('user');
      expect(componentModel.props.map(p => p.name)).toContain('onEdit');

      // Verify Flutter output
      expect(widgetModel.dartCode).toContain('final User user');
      expect(widgetModel.dartCode).toContain('final VoidCallback onEdit');
      expect(widgetModel.dartCode).toContain('Image.network');
      expect(widgetModel.dartCode).toContain('ElevatedButton');
    });
  });

  describe('Stateful Component Transformation', () => {
    test('should convert useState to StatefulWidget', () => {
      const reactCode = `
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default Counter;
`;

      const componentModel = parser.parse(reactCode, 'Counter.jsx');
      const widgetModel = generator.generate(componentModel);

      // Verify state detection
      expect(componentModel.hasState).toBe(true);
      expect(componentModel.state).toContainEqual({
        name: 'count',
        type: 'int',
        initialValue: '0'
      });

      // Verify Flutter StatefulWidget
      expect(widgetModel.type).toBe('stateful');
      expect(widgetModel.dartCode).toContain('class Counter extends StatefulWidget');
      expect(widgetModel.dartCode).toContain('class _CounterState extends State<Counter>');
      expect(widgetModel.dartCode).toContain('int count = 0');
      expect(widgetModel.dartCode).toContain('setState(() {');
    });

    test('should handle multiple state variables', () => {
      const reactCode = `
import React, { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <form>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <button disabled={loading}>Login</button>
    </form>
  );
};

export default LoginForm;
`;

      const componentModel = parser.parse(reactCode, 'LoginForm.jsx');
      const widgetModel = generator.generate(componentModel);

      // Verify all state variables
      expect(componentModel.state).toHaveLength(3);
      expect(componentModel.state.map(s => s.name)).toEqual(['email', 'password', 'loading']);

      // Verify Flutter state
      expect(widgetModel.dartCode).toContain('String email = \'\'');
      expect(widgetModel.dartCode).toContain('String password = \'\'');
      expect(widgetModel.dartCode).toContain('bool loading = false');
    });
  });

  describe('ComponentModel to WidgetModel Mapping', () => {
    test('should correctly map component types', () => {
      const testCases = [
        {
          react: 'functional-stateless',
          componentHasState: false,
          expectedWidget: 'stateless'
        },
        {
          react: 'functional-stateful',
          componentHasState: true,
          expectedWidget: 'stateful'
        },
        {
          react: 'class-component',
          componentHasState: true,
          expectedWidget: 'stateful'
        }
      ];

      testCases.forEach(({ react, componentHasState, expectedWidget }) => {
        const model = new ComponentModel({
          name: 'TestComponent',
          type: react,
          hasState: componentHasState
        });

        const widget = generator.generate(model);
        expect(widget.type).toBe(expectedWidget);
      });
    });

    test('should map React props to Flutter constructor parameters', () => {
      const model = new ComponentModel({
        name: 'TestWidget',
        props: [
          { name: 'title', type: 'string', required: true },
          { name: 'count', type: 'number', required: false },
          { name: 'onPress', type: 'function', required: false }
        ]
      });

      const widget = generator.generate(model);

      expect(widget.dartCode).toContain('required String title');
      expect(widget.dartCode).toContain('int? count');
      expect(widget.dartCode).toContain('VoidCallback? onPress');
    });

    test('should map React lifecycle to Flutter lifecycle', () => {
      const reactCode = `
import React, { useEffect } from 'react';

const DataFetcher = () => {
  useEffect(() => {
    fetchData();
  }, []);

  return <div>Data</div>;
};

export default DataFetcher;
`;

      const componentModel = parser.parse(reactCode, 'DataFetcher.jsx');
      const widgetModel = generator.generate(componentModel);

      // useEffect with empty deps → initState
      expect(widgetModel.dartCode).toContain('@override');
      expect(widgetModel.dartCode).toContain('void initState()');
      expect(widgetModel.dartCode).toContain('super.initState()');
    });
  });

  describe('Code Generation Quality', () => {
    test('should generate properly formatted Dart code', () => {
      const reactCode = `
import React from 'react';

const SimpleWidget = () => {
  return <div>Hello</div>;
};

export default SimpleWidget;
`;

      const componentModel = parser.parse(reactCode, 'SimpleWidget.jsx');
      const widgetModel = generator.generate(componentModel);

      // Check formatting
      expect(widgetModel.dartCode).toMatch(/^class \w+ extends \w+Widget/m);
      expect(widgetModel.dartCode).toContain('@override');
      expect(widgetModel.dartCode).toContain('Widget build(BuildContext context)');

      // No syntax errors (basic check)
      expect(widgetModel.dartCode).not.toContain('undefined');
      expect(widgetModel.dartCode).not.toContain('null');
    });

    test('should include necessary imports', () => {
      const reactCode = `
import React, { useState } from 'react';

const TestWidget = () => {
  const [value, setValue] = useState('');
  return <input value={value} />;
};

export default TestWidget;
`;

      const componentModel = parser.parse(reactCode, 'TestWidget.jsx');
      const widgetModel = generator.generate(componentModel);

      expect(widgetModel.imports).toContain('package:flutter/material.dart');
    });

    test('should generate constructor with proper syntax', () => {
      const reactCode = `
import React from 'react';

const ConfigurableWidget = ({ title, color, onTap }) => {
  return <button onClick={onTap}>{title}</button>;
};

export default ConfigurableWidget;
`;

      const componentModel = parser.parse(reactCode, 'ConfigurableWidget.jsx');
      const widgetModel = generator.generate(componentModel);

      // Check constructor syntax
      expect(widgetModel.dartCode).toMatch(/const \w+\(\{/);
      expect(widgetModel.dartCode).toContain('required this.title');
      expect(widgetModel.dartCode).toContain('this.color');
      expect(widgetModel.dartCode).toContain('this.onTap');
      expect(widgetModel.dartCode).toContain('Key? key');
      expect(widgetModel.dartCode).toContain('}) : super(key: key)');
    });
  });

  describe('Error Handling in Transformation', () => {
    test('should handle parsing errors gracefully', () => {
      const invalidCode = `
import React from 'react';
const Invalid = () => {
  return <div>Unclosed div;
`;

      expect(() => {
        parser.parse(invalidCode, 'Invalid.jsx');
      }).toThrow();
    });

    test('should handle unsupported React features', () => {
      const reactCode = `
import React from 'react';

class UnsupportedComponent extends React.Component {
  componentWillMount() {
    // Deprecated lifecycle
  }

  render() {
    return <div>Test</div>;
  }
}

export default UnsupportedComponent;
`;

      const componentModel = parser.parse(reactCode, 'UnsupportedComponent.jsx');
      const widgetModel = generator.generate(componentModel);

      // Should still generate, but with warnings
      expect(widgetModel.warnings).toBeDefined();
      expect(widgetModel.warnings.length).toBeGreaterThan(0);
    });
  });
});
