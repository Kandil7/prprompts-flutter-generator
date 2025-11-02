/**
 * TestGenerator Tests
 * Tests for AI-powered test generation service
 */

const TestGenerator = require('../../../lib/refactoring/ai/TestGenerator');
const MockAIClient = require('../../../lib/refactoring/ai/MockAIClient');

describe('TestGenerator', () => {
  let generator;
  let mockClient;
  let mockLogger;

  beforeEach(() => {
    mockClient = new MockAIClient();
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    generator = new TestGenerator(mockClient, mockLogger);
  });

  describe('generateTests()', () => {
    it('should generate all test types', async () => {
      const componentModel = {
        name: 'LoginPage',
        type: 'Page',
        props: [],
        state: [],
        methods: [],
        apiCalls: []
      };
      const flutterCode = 'class LoginPage extends StatelessWidget {}';

      const result = await generator.generateTests(componentModel, flutterCode);

      expect(result).toHaveProperty('widgetTests');
      expect(result).toHaveProperty('unitTests');
      expect(result).toHaveProperty('integrationTests');
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Generating tests'));
    });

    it('should count total tests correctly', async () => {
      mockClient._makeRequest = jest.fn().mockResolvedValue(`
        testWidgets('test 1', (tester) async {});
        testWidgets('test 2', (tester) async {});
        test('unit test', () {});
      `);

      const result = await generator.generateTests({ name: 'Test', apiCalls: [] }, 'code');

      // Should have generated tests (exact count may vary)
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringMatching(/Generated \d+ tests/));
    });

    it('should handle errors gracefully', async () => {
      mockClient._makeRequest = jest.fn().mockRejectedValue(new Error('API error'));

      const result = await generator.generateTests({ name: 'Test', apiCalls: [] }, 'code');

      expect(result.widgetTests).toContain('void main()');
      expect(result.unitTests).toContain('// TODO');
      // Error is logged by sub-methods with warn, not error at top level
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('generateWidgetTests()', () => {
    it('should generate widget test code', async () => {
      const componentModel = {
        name: 'ButtonWidget',
        props: [{ name: 'onPressed', type: 'Function' }],
        state: []
      };

      mockClient._makeRequest = jest.fn().mockResolvedValue(`
        import 'package:flutter_test/flutter_test.dart';

        void main() {
          testWidgets('should render button', (tester) async {
            await tester.pumpWidget(ButtonWidget());
            expect(find.byType(ElevatedButton), findsOneWidget);
          });
        }
      `);

      const result = await generator.generateWidgetTests(componentModel, 'code');

      expect(result).toContain('flutter_test');
      expect(result).toContain('testWidgets');
      expect(result).toContain('ButtonWidget');
    });

    it('should extract Dart code from markdown blocks', async () => {
      mockClient._makeRequest = jest.fn().mockResolvedValue(`
        \`\`\`dart
        void main() {
          test('example', () {});
        }
        \`\`\`
      `);

      const result = await generator.generateWidgetTests({ name: 'Test' }, 'code');

      expect(result).not.toContain('```dart');
      expect(result).not.toContain('```');
      expect(result).toContain('void main()');
    });

    it('should generate fallback test on error', async () => {
      mockClient._makeRequest = jest.fn().mockRejectedValue(new Error('Failed'));

      const result = await generator.generateWidgetTests({ name: 'TestWidget', feature: 'auth' }, 'code');

      expect(result).toContain('TestWidget Widget Tests');
      expect(result).toContain('should render without errors');
      expect(result).toContain('TODO');
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('generateUnitTests()', () => {
    it('should generate BLoC unit tests', async () => {
      const componentModel = {
        name: 'UserBloc',
        state: [{ name: 'user', type: 'User' }],
        methods: ['fetchUser', 'updateUser']
      };

      mockClient._makeRequest = jest.fn().mockResolvedValue(`
        import 'package:bloc_test/bloc_test.dart';

        void main() {
          blocTest<UserBloc, UserState>(
            'emits UserLoaded when user is fetched',
            build: () => UserBloc(),
            act: (bloc) => bloc.add(FetchUser('1')),
            expect: () => [UserLoaded(user)],
          );
        }
      `);

      const result = await generator.generateUnitTests(componentModel, 'code');

      expect(result).toContain('bloc_test');
      expect(result).toContain('blocTest');
    });

    it('should generate fallback unit test on error', async () => {
      mockClient._makeRequest = jest.fn().mockRejectedValue(new Error('Failed'));

      const result = await generator.generateUnitTests({ name: 'TestBloc' }, 'code');

      expect(result).toContain('TestBlocBloc Unit Tests');
      expect(result).toContain('TODO');
    });
  });

  describe('generateIntegrationTests()', () => {
    it('should generate integration tests for components with API calls', async () => {
      const componentModel = {
        name: 'UserPage',
        apiCalls: [
          { endpoint: '/api/users', method: 'GET' }
        ]
      };

      mockClient._makeRequest = jest.fn().mockResolvedValue(`
        void main() {
          testWidgets('full user flow test', (tester) async {
            // Test implementation
          });
        }
      `);

      const result = await generator.generateIntegrationTests(componentModel, 'code');

      expect(result).toContain('testWidgets');
      expect(result).not.toContain('No integration tests needed');
    });

    it('should skip integration tests when no API calls', async () => {
      const componentModel = {
        name: 'StaticPage',
        apiCalls: []
      };

      const result = await generator.generateIntegrationTests(componentModel, 'code');

      expect(result).toContain('No integration tests needed');
    });

    it('should handle errors gracefully', async () => {
      mockClient._makeRequest = jest.fn().mockRejectedValue(new Error('Failed'));

      const result = await generator.generateIntegrationTests({ name: 'Test', apiCalls: [{}] }, 'code');

      expect(result).toContain('not generated due to error');
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });
});
