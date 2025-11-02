/**
 * CodeValidator Tests
 */

const CodeValidator = require('../../../lib/refactoring/validation/CodeValidator');

describe('CodeValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new CodeValidator();
  });

  describe('Syntax Validation', () => {
    test('should detect unmatched braces', () => {
      const code = `
        class MyWidget extends StatelessWidget {
          @override
          Widget build(BuildContext context) {
            return Container(
              child: Text('Hello')
            ); // Missing closing brace
      `;

      const result = validator.validate('test.dart', code);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Unmatched braces'))).toBe(true);
    });

    test('should accept valid syntax', () => {
      const code = `
        class MyWidget extends StatelessWidget {
          @override
          Widget build(BuildContext context) {
            return Container(
              child: const Text('Hello'),
            );
          }
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('Import Validation', () => {
    test('should detect missing Flutter import', () => {
      const code = `
        class MyWidget extends StatelessWidget {
          @override
          Widget build(BuildContext context) {
            return Container();
          }
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.errors.some(e => e.message.includes('Missing required import'))).toBe(true);
    });

    test('should accept code with proper imports', () => {
      const code = `
        import 'package:flutter/material.dart';

        class MyWidget extends StatelessWidget {
          @override
          Widget build(BuildContext context) {
            return const Container();
          }
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.errors.filter(e => e.message.includes('import')).length).toBe(0);
    });
  });

  describe('Constructor Validation', () => {
    test('should warn about missing Key parameter', () => {
      const code = `
        import 'package:flutter/material.dart';

        class MyWidget extends StatelessWidget {
          @override
          Widget build(BuildContext context) {
            return Container();
          }
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.warnings.some(w => w.message.includes('Key parameter'))).toBe(true);
    });

    test('should accept const constructor with Key', () => {
      const code = `
        import 'package:flutter/material.dart';

        class MyWidget extends StatelessWidget {
          const MyWidget({Key? key}) : super(key: key);

          @override
          Widget build(BuildContext context) {
            return const Container();
          }
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.warnings.filter(w => w.message.includes('Key')).length).toBe(0);
    });
  });

  describe('Null Safety Validation', () => {
    test('should detect non-nullable fields without initialization', () => {
      const code = `
        class MyClass {
          String name;
          int age;
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.warnings.some(w => w.message.includes('not be initialized'))).toBe(true);
    });

    test('should accept nullable fields', () => {
      const code = `
        class MyClass {
          String? name;
          int? age;
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.warnings.filter(w => w.message.includes('initialized')).length).toBe(0);
    });
  });

  describe('Best Practices', () => {
    test('should detect print statements', () => {
      const code = `
        void myFunction() {
          print('Debug message');
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.warnings.some(w => w.message.includes('print()'))).toBe(true);
    });

    test('should detect missing const on widgets', () => {
      const code = `
        Widget build(BuildContext context) {
          return Container(
            child: Text('Hello'),
          );
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.warnings.some(w => w.message.includes('const'))).toBe(true);
    });
  });

  describe('Score Calculation', () => {
    test('should calculate high score for clean code', () => {
      const code = `
        import 'package:flutter/material.dart';

        class MyWidget extends StatelessWidget {
          const MyWidget({Key? key}) : super(key: key);

          @override
          Widget build(BuildContext context) {
            return const Container(
              child: Text('Hello'),
            );
          }
        }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.score).toBeGreaterThan(80);
    });

    test('should calculate low score for problematic code', () => {
      const code = `
        class MyWidget {
          Widget build() {
            print('test');
            return Container(
              child: Text('Hello')
          }
      `;

      const result = validator.validate('test.dart', code);
      expect(result.score).toBeLessThan(60);
    });
  });
});

module.exports = {};
