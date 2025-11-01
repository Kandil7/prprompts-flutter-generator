/**
 * AI-Powered Test Generator
 * Generates widget tests, unit tests, and integration tests
 */

class TestGenerator {
  constructor(aiClient, logger = console) {
    this.aiClient = aiClient;
    this.logger = logger;
  }

  /**
   * Generate all tests for a component
   * @param {Object} componentModel - Component model from Phase 1
   * @param {string} flutterCode - Generated Flutter code
   * @returns {Promise<Object>} Test files
   */
  async generateTests(componentModel, flutterCode) {
    try {
      this.logger.log('🧪 Generating tests...');

      const tests = {
        widgetTests: await this.generateWidgetTests(componentModel, flutterCode),
        unitTests: await this.generateUnitTests(componentModel, flutterCode),
        integrationTests: await this.generateIntegrationTests(componentModel, flutterCode)
      };

      const totalTests = this._countTests(tests);
      this.logger.log(`✓ Generated ${totalTests} tests`);

      return tests;

    } catch (error) {
      this.logger.error(`❌ Test generation failed: ${error.message}`);
      return {
        widgetTests: this._generateFallbackWidgetTest(componentModel),
        unitTests: '',
        integrationTests: ''
      };
    }
  }

  /**
   * Generate widget tests
   */
  async generateWidgetTests(componentModel, flutterCode) {
    try {
      const prompt = this._buildWidgetTestPrompt(componentModel, flutterCode);
      const result = await this.aiClient._makeRequest(prompt);

      // Extract Dart code from response
      return this._extractDartCode(result);

    } catch (error) {
      this.logger.warn(`⚠️  Widget test generation failed: ${error.message}`);
      return this._generateFallbackWidgetTest(componentModel);
    }
  }

  /**
   * Generate unit tests for BLoC/Cubit
   */
  async generateUnitTests(componentModel, flutterCode) {
    try {
      const prompt = this._buildUnitTestPrompt(componentModel, flutterCode);
      const result = await this.aiClient._makeRequest(prompt);

      return this._extractDartCode(result);

    } catch (error) {
      this.logger.warn(`⚠️  Unit test generation failed: ${error.message}`);
      return this._generateFallbackUnitTest(componentModel);
    }
  }

  /**
   * Generate integration tests
   */
  async generateIntegrationTests(componentModel, flutterCode) {
    try {
      // Only generate integration tests if component has API calls
      if (!componentModel.apiCalls || componentModel.apiCalls.length === 0) {
        return '// No integration tests needed (no API calls)';
      }

      const prompt = this._buildIntegrationTestPrompt(componentModel, flutterCode);
      const result = await this.aiClient._makeRequest(prompt);

      return this._extractDartCode(result);

    } catch (error) {
      this.logger.warn(`⚠️  Integration test generation failed: ${error.message}`);
      return '// Integration tests not generated due to error';
    }
  }

  /**
   * Build widget test prompt
   * @private
   */
  _buildWidgetTestPrompt(componentModel, flutterCode) {
    return `Generate comprehensive Flutter widget tests for this component.

**Component:**
- Name: ${componentModel.name}
- Type: ${componentModel.type}
- Props: ${JSON.stringify(componentModel.props || [])}
- State: ${JSON.stringify(componentModel.state || [])}

**Flutter Code:**
\`\`\`dart
${flutterCode.substring(0, 1500)}
\`\`\`

**Generate widget tests that:**
1. Test widget renders correctly
2. Test all user interactions (button taps, form inputs)
3. Test different states (loading, success, error)
4. Test prop variations
5. Use flutter_test best practices (testWidgets, find, expect, pump)

**Output only the complete Dart test file (no explanations):**
\`\`\`dart
// Widget tests here
\`\`\``;
  }

  /**
   * Build unit test prompt
   * @private
   */
  _buildUnitTestPrompt(componentModel, flutterCode) {
    return `Generate unit tests for the BLoC/Cubit state management.

**Component:**
- Name: ${componentModel.name}
- State Variables: ${JSON.stringify(componentModel.state || [])}
- Events/Methods: ${JSON.stringify(componentModel.methods || [])}

**Flutter Code:**
\`\`\`dart
${flutterCode.substring(0, 1500)}
\`\`\`

**Generate unit tests for:**
1. Initial state
2. All events/methods
3. State transitions
4. Error handling
5. Use bloc_test package best practices

**Output only the complete Dart test file (no explanations):**
\`\`\`dart
// Unit tests here
\`\`\``;
  }

  /**
   * Build integration test prompt
   * @private
   */
  _buildIntegrationTestPrompt(componentModel, flutterCode) {
    return `Generate integration tests for this component.

**Component:**
- Name: ${componentModel.name}
- API Calls: ${JSON.stringify(componentModel.apiCalls || [])}

**Flutter Code:**
\`\`\`dart
${flutterCode.substring(0, 1500)}
\`\`\`

**Generate integration tests for:**
1. End-to-end user flows
2. API integration (mock responses)
3. Navigation flows
4. Data persistence

**Output only the complete Dart test file (no explanations):**
\`\`\`dart
// Integration tests here
\`\`\``;
  }

  /**
   * Extract Dart code from AI response
   * @private
   */
  _extractDartCode(response) {
    // Remove markdown code blocks
    let code = response
      .replace(/```dart\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    // If no code blocks, return as is
    if (!code || code.length === 0) {
      return '// No test code generated';
    }

    return code;
  }

  /**
   * Generate fallback widget test
   * @private
   */
  _generateFallbackWidgetTest(componentModel) {
    const widgetName = this._pascalCase(componentModel.name);

    return `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:${componentModel.feature}/${componentModel.filePath}';

void main() {
  group('${widgetName} Widget Tests', () {
    testWidgets('should render without errors', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: ${widgetName}(),
        ),
      );

      expect(find.byType(${widgetName}), findsOneWidget);
    });

    // TODO: Add more widget tests
    // - Test user interactions
    // - Test different states
    // - Test error scenarios
  });
}
`;
  }

  /**
   * Generate fallback unit test
   * @private
   */
  _generateFallbackUnitTest(componentModel) {
    const blocName = this._pascalCase(componentModel.name) + 'Bloc';

    return `import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('${blocName} Unit Tests', () {
    // TODO: Add BLoC/Cubit unit tests
    // - Test initial state
    // - Test events/methods
    // - Test state transitions
  });
}
`;
  }

  /**
   * Count total tests
   * @private
   */
  _countTests(tests) {
    let count = 0;

    if (tests.widgetTests) {
      count += (tests.widgetTests.match(/testWidgets/g) || []).length;
      count += (tests.widgetTests.match(/test\(/g) || []).length;
    }

    if (tests.unitTests) {
      count += (tests.unitTests.match(/test\(/g) || []).length;
      count += (tests.unitTests.match(/blocTest</g) || []).length;
    }

    if (tests.integrationTests) {
      count += (tests.integrationTests.match(/testWidgets/g) || []).length;
    }

    return count;
  }

  /**
   * Convert to PascalCase
   * @private
   */
  _pascalCase(str) {
    return str
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (_, char) => char.toUpperCase());
  }
}

module.exports = TestGenerator;
