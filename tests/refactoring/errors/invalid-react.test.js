const { ReactParser } = require('../../../lib/refactoring/parsers/ReactParser');
const { RefactorCommand } = require('../../../lib/refactoring/cli/RefactorCommand');
const path = require('path');
const fs = require('fs-extra');

describe('Invalid React Code Handling', () => {
  let parser;
  let tempDir;

  beforeEach(async () => {
    parser = new ReactParser();
    tempDir = path.join(__dirname, '..', 'temp', `error-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Syntax Errors', () => {
    test('should handle unclosed JSX tags', () => {
      const invalidCode = `
import React from 'react';

const BrokenComponent = () => {
  return (
    <div>
      <h1>Title
      <p>Content</p>
    </div>
  );
};

export default BrokenComponent;
`;

      expect(() => {
        parser.parse(invalidCode, 'BrokenComponent.jsx');
      }).toThrow(/Unexpected token|JSX/i);
    });

    test('should handle missing closing brace', () => {
      const invalidCode = `
import React from 'react';

const MissingBrace = () => {
  return (
    <div>Hello</div>
  // Missing closing brace
`;

      expect(() => {
        parser.parse(invalidCode, 'MissingBrace.jsx');
      }).toThrow();
    });

    test('should handle invalid JavaScript syntax', () => {
      const invalidCode = `
import React from 'react';

const InvalidJS = () => {
  const x = ;
  return <div>{x}</div>;
};
`;

      expect(() => {
        parser.parse(invalidCode, 'InvalidJS.jsx');
      }).toThrow(/Unexpected token/i);
    });

    test('should provide helpful error messages for syntax errors', () => {
      const invalidCode = `
import React from 'react';

const Component = () => {
  return <div>
    <span>Unclosed span
  </div>;
};
`;

      try {
        parser.parse(invalidCode, 'Component.jsx');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
        // Should include file name in error
        expect(error.message).toContain('Component.jsx');
      }
    });
  });

  describe('Missing Imports', () => {
    test('should handle missing React import', () => {
      const noImportCode = `
const Component = () => {
  return <div>Hello</div>;
};

export default Component;
`;

      // Should parse but warn about missing import
      const result = parser.parse(noImportCode, 'Component.jsx');

      expect(result).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.warnings.some(w => w.includes('React') || w.includes('import'))).toBe(true);
    });

    test('should handle missing custom component imports', () => {
      const code = `
import React from 'react';

const Parent = () => {
  return (
    <div>
      <CustomChild />
    </div>
  );
};

export default Parent;
`;

      const result = parser.parse(code, 'Parent.jsx');

      expect(result.warnings).toBeDefined();
      expect(result.warnings.some(w => w.includes('CustomChild'))).toBe(true);
    });
  });

  describe('Invalid JSX', () => {
    test('should handle self-closing tags incorrectly used', () => {
      const invalidCode = `
import React from 'react';

const Invalid = () => {
  return <div />Content here</div>;
};

export default Invalid;
`;

      expect(() => {
        parser.parse(invalidCode, 'Invalid.jsx');
      }).toThrow();
    });

    test('should handle invalid prop syntax', () => {
      const invalidCode = `
import React from 'react';

const Invalid = () => {
  return <div className=unclosed-quote>Content</div>;
};
`;

      expect(() => {
        parser.parse(invalidCode, 'Invalid.jsx');
      }).toThrow();
    });

    test('should handle invalid JSX expressions', () => {
      const invalidCode = `
import React from 'react';

const Invalid = () => {
  return <div>{{{}}}</div>;
};
`;

      expect(() => {
        parser.parse(invalidCode, 'Invalid.jsx');
      }).toThrow();
    });
  });

  describe('Runtime vs Parse-time Errors', () => {
    test('should not throw on runtime errors (null checks)', () => {
      // This is valid syntax but might have runtime issues
      const code = `
import React from 'react';

const Component = ({ data }) => {
  return <div>{data.value}</div>; // Might be null at runtime
};

export default Component;
`;

      // Should parse successfully
      expect(() => {
        const result = parser.parse(code, 'Component.jsx');
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    test('should parse code with potential logical errors', () => {
      const code = `
import React, { useState } from 'react';

const Component = () => {
  const [count, setCount] = useState(0);

  // Logical error: infinite re-render
  setCount(count + 1);

  return <div>{count}</div>;
};

export default Component;
`;

      // Should parse (it's valid syntax)
      const result = parser.parse(code, 'Component.jsx');
      expect(result).toBeDefined();
    });
  });

  describe('Error Recovery in Full Pipeline', () => {
    test('should gracefully fail on invalid React file in project', async () => {
      const reactPath = path.join(tempDir, 'react-app');
      const flutterPath = path.join(tempDir, 'flutter-app');

      await fs.ensureDir(path.join(reactPath, 'src'));

      // Create valid file
      await fs.writeFile(
        path.join(reactPath, 'src', 'Valid.jsx'),
        `
import React from 'react';
const Valid = () => <div>Valid</div>;
export default Valid;
`
      );

      // Create invalid file
      await fs.writeFile(
        path.join(reactPath, 'src', 'Invalid.jsx'),
        `
import React from 'react';
const Invalid = () => {
  return <div>Unclosed;
`
      );

      const command = new RefactorCommand();
      const result = await command.execute(reactPath, flutterPath, {
        ai: 'mock',
        continueOnError: true
      });

      // Should report errors but not crash
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);

      // Should still process valid files
      expect(result.processedFiles).toContain('Valid.jsx');
    });

    test('should collect all errors for reporting', async () => {
      const reactPath = path.join(tempDir, 'react-app');
      const flutterPath = path.join(tempDir, 'flutter-app');

      await fs.ensureDir(path.join(reactPath, 'src'));

      // Create multiple invalid files
      const invalidFiles = [
        { name: 'Error1.jsx', code: 'const X = () => <div>Unclosed;' },
        { name: 'Error2.jsx', code: 'import React from "react"; const Y = () => { return <div />Content</div>; };' },
        { name: 'Error3.jsx', code: 'const Z = ) => <div />;' }
      ];

      for (const { name, code } of invalidFiles) {
        await fs.writeFile(path.join(reactPath, 'src', name), code);
      }

      const command = new RefactorCommand();
      const result = await command.execute(reactPath, flutterPath, {
        ai: 'mock',
        continueOnError: true
      });

      // Should report all errors
      expect(result.errors.length).toBe(invalidFiles.length);

      // Each error should have file info
      result.errors.forEach(error => {
        expect(error.file).toBeDefined();
        expect(error.message).toBeDefined();
      });
    });
  });

  describe('Malformed Component Structures', () => {
    test('should handle components with no return statement', () => {
      const code = `
import React from 'react';

const NoReturn = () => {
  const x = 10;
  // Missing return
};

export default NoReturn;
`;

      const result = parser.parse(code, 'NoReturn.jsx');

      expect(result.warnings).toBeDefined();
      expect(result.warnings.some(w => w.includes('return'))).toBe(true);
    });

    test('should handle multiple default exports', () => {
      const code = `
import React from 'react';

const Component1 = () => <div>One</div>;
const Component2 = () => <div>Two</div>;

export default Component1;
export default Component2; // Invalid
`;

      expect(() => {
        parser.parse(code, 'MultiExport.jsx');
      }).toThrow();
    });

    test('should handle components with no name', () => {
      const code = `
import React from 'react';

export default () => <div>Anonymous</div>;
`;

      const result = parser.parse(code, 'Anonymous.jsx');

      // Should still parse but might use filename
      expect(result.name).toBeTruthy();
    });
  });

  describe('Error Message Quality', () => {
    test('should provide line and column numbers in errors', () => {
      const code = `
import React from 'react';

const Component = () => {
  return (
    <div>
      <span>Invalid
    </div>
  );
};
`;

      try {
        parser.parse(code, 'Component.jsx');
        fail('Should have thrown');
      } catch (error) {
        // Check for line number in error message
        expect(error.message).toMatch(/line \d+/i);
      }
    });

    test('should suggest fixes for common errors', () => {
      const code = `
import React from 'react'

const Component = () => {
  return <div>Content</div>
}

export default Component
`;

      try {
        parser.parse(code, 'Component.jsx');
      } catch (error) {
        // If missing semicolons cause error, suggest adding them
        if (error.message.includes('semicolon') || error.message.includes(';')) {
          expect(error.suggestion).toBeDefined();
        }
      }
    });
  });
});
