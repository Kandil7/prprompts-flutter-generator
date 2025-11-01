/**
 * TypeExtractor tests
 */

const { TypeExtractor } = require('../../../lib/refactoring/parsers/TypeExtractor');

describe('TypeExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new TypeExtractor();
  });

  describe('Interface Extraction', () => {
    test('should extract interface', () => {
      const code = `
        interface User {
          name: string;
          age: number;
          email?: string;
        }
      `;

      const result = extractor.extract(code, 'test.ts');
      expect(result.interfaces.length).toBe(1);
      expect(result.interfaces[0].name).toBe('User');
      expect(result.interfaces[0].properties.length).toBe(3);
    });

    test('should map TypeScript types to Dart', () => {
      const code = `
        interface Props {
          title: string;
          count: number;
          isActive: boolean;
        }
      `;

      const result = extractor.extract(code, 'test.ts');
      const props = result.interfaces[0].properties;

      const titleProp = props.find(p => p.name === 'title');
      expect(titleProp.dartType).toBe('String');

      const countProp = props.find(p => p.name === 'count');
      expect(countProp.dartType).toBe('num');

      const activeProp = props.find(p => p.name === 'isActive');
      expect(activeProp.dartType).toBe('bool');
    });

    test('should handle optional properties', () => {
      const code = `
        interface Config {
          required: string;
          optional?: number;
        }
      `;

      const result = extractor.extract(code, 'test.ts');
      const props = result.interfaces[0].properties;

      const optionalProp = props.find(p => p.name === 'optional');
      expect(optionalProp.isOptional).toBe(true);
      expect(optionalProp.dartType).toContain('?');
    });
  });

  describe('Type Alias Extraction', () => {
    test('should extract type alias', () => {
      const code = `
        type Status = 'pending' | 'success' | 'error';
      `;

      const result = extractor.extract(code, 'test.ts');
      expect(result.typeAliases.length).toBe(1);
      expect(result.typeAliases[0].name).toBe('Status');
    });
  });

  describe('Enum Extraction', () => {
    test('should extract enum', () => {
      const code = `
        enum Color {
          Red,
          Green,
          Blue
        }
      `;

      const result = extractor.extract(code, 'test.ts');
      expect(result.enums.length).toBe(1);
      expect(result.enums[0].name).toBe('Color');
      expect(result.enums[0].members.length).toBe(3);
    });
  });

  describe('PropTypes', () => {
    test('should extract PropTypes', () => {
      const code = `
        import PropTypes from 'prop-types';

        class MyComponent extends React.Component {
          static propTypes = {
            name: PropTypes.string.isRequired,
            age: PropTypes.number,
          };
        }
      `;

      const result = extractor.extract(code, 'test.jsx');
      expect(result.propTypes).toBeDefined();
    });
  });

  describe('Functional Component Props', () => {
    test('should extract props from functional component', () => {
      const code = `
        interface ButtonProps {
          label: string;
          onClick: () => void;
        }

        const Button: React.FC<ButtonProps> = ({ label, onClick }) => {
          return <button onClick={onClick}>{label}</button>;
        };
      `;

      const result = extractor.extract(code, 'test.tsx');
      expect(result.componentProps.length).toBeGreaterThan(0);
    });
  });
});
