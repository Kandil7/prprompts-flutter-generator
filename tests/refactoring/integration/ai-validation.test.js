const { CodeEnhancer } = require('../../../lib/refactoring/ai/CodeEnhancer');
const MockAIClient = require('../../../lib/refactoring/ai/MockAIClient');
const { ValidationOrchestrator } = require('../../../lib/refactoring/validation/ValidationOrchestrator');

describe('AI Enhancement to Validation Flow', () => {
  let mockAI;
  let enhancer;
  let validator;

  beforeEach(() => {
    mockAI = new MockAIClient();
    enhancer = new CodeEnhancer(mockAI);
    validator = new ValidationOrchestrator();
  });

  describe('Code Enhancement Pipeline', () => {
    test('should enhance generated Flutter code with AI', async () => {
      const basicCode = `
class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String email = '';
  String password = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TextField(),
          TextField(),
          ElevatedButton(onPressed: () {}, child: Text('Login')),
        ],
      ),
    );
  }
}
`;

      const enhanced = await enhancer.enhance(basicCode, {
        addValidation: true,
        improveAccessibility: true,
        optimizePerformance: true
      });

      expect(enhanced).toBeDefined();
      expect(enhanced.length).toBeGreaterThan(basicCode.length);

      // Should add validation
      expect(enhanced).toContain('Form');
      expect(enhanced).toContain('validator');

      // Should add accessibility
      expect(enhanced).toContain('semanticsLabel');

      // Should add error handling
      expect(enhanced).toContain('try');
      expect(enhanced).toContain('catch');
    });

    test('should improve code quality metrics through enhancement', async () => {
      const simpleCode = `
class SimpleWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(child: Text('Hello'));
  }
}
`;

      // Validate before enhancement
      const beforeValidation = await validator.validate({ code: simpleCode });

      // Enhance
      const enhanced = await enhancer.enhance(simpleCode, {
        addDocumentation: true,
        improveNaming: true
      });

      // Validate after enhancement
      const afterValidation = await validator.validate({ code: enhanced });

      // Quality should improve
      expect(afterValidation.score).toBeGreaterThan(beforeValidation.score);
    });
  });

  describe('Validation After Enhancement', () => {
    test('should pass all validation checks after AI enhancement', async () => {
      const basicWidgetCode = `
class UserCard extends StatelessWidget {
  final String name;
  final String email;

  UserCard({this.name, this.email});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: [
          Text(name),
          Text(email),
        ],
      ),
    );
  }
}
`;

      // Enhance code
      const enhanced = await enhancer.enhance(basicWidgetCode, {
        addNullSafety: true,
        addConstConstructors: true,
        addDocumentation: true
      });

      // Validate enhanced code
      const validation = await validator.validate({ code: enhanced });

      expect(validation.passed).toBe(true);
      expect(validation.issues.filter(i => i.severity === 'error')).toHaveLength(0);

      // Should have improvements
      expect(enhanced).toContain('required');
      expect(enhanced).toContain('const UserCard');
      expect(enhanced).toContain('///');
    });

    test('should validate accessibility improvements', async () => {
      const codeWithoutAccessibility = `
class ImageButton extends StatelessWidget {
  final VoidCallback onTap;

  const ImageButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Image.network('https://example.com/image.png'),
    );
  }
}
`;

      const enhanced = await enhancer.enhance(codeWithoutAccessibility, {
        improveAccessibility: true
      });

      const validation = await validator.validate({ code: enhanced });

      // Should pass accessibility checks
      const accessibilityIssues = validation.issues.filter(
        i => i.category === 'accessibility'
      );
      expect(accessibilityIssues.filter(i => i.severity === 'error')).toHaveLength(0);

      // Should have accessibility widgets
      expect(enhanced).toContain('Semantics');
    });

    test('should validate performance optimizations', async () => {
      const unoptimizedCode = `
class LongList extends StatelessWidget {
  final List<String> items;

  const LongList({required this.items});

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: items.map((item) => ListTile(title: Text(item))).toList(),
    );
  }
}
`;

      const enhanced = await enhancer.enhance(unoptimizedCode, {
        optimizePerformance: true
      });

      const validation = await validator.validate({ code: enhanced });

      // Should use ListView.builder for better performance
      expect(enhanced).toContain('ListView.builder');
      expect(enhanced).toContain('itemCount');
      expect(enhanced).toContain('itemBuilder');

      // Performance issues should be resolved
      const perfIssues = validation.issues.filter(
        i => i.category === 'performance'
      );
      expect(perfIssues.filter(i => i.severity === 'warning')).toHaveLength(0);
    });
  });

  describe('Iterative Enhancement and Validation', () => {
    test('should improve code through multiple enhancement cycles', async () => {
      let code = `
class BasicWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('Hello');
  }
}
`;

      let previousScore = 0;

      // Enhancement cycle
      for (let i = 0; i < 3; i++) {
        code = await enhancer.enhance(code, {
          addDocumentation: true,
          improveNaming: true,
          addConstConstructors: true
        });

        const validation = await validator.validate({ code });

        // Score should improve or stay the same
        expect(validation.score).toBeGreaterThanOrEqual(previousScore);
        previousScore = validation.score;
      }

      // Final validation should be excellent
      const finalValidation = await validator.validate({ code });
      expect(finalValidation.score).toBeGreaterThan(85);
    });

    test('should fix validation issues through targeted enhancement', async () => {
      const codeWithIssues = `
class ProblematicWidget extends StatelessWidget {
  String data; // Non-final field
  ProblematicWidget(this.data); // Missing const, missing null safety

  @override
  Widget build(BuildContext context) {
    return Text(data);
  }
}
`;

      // Initial validation
      const initialValidation = await validator.validate({ code: codeWithIssues });
      const initialIssues = initialValidation.issues.filter(i => i.severity === 'error');
      expect(initialIssues.length).toBeGreaterThan(0);

      // Enhance to fix issues
      const enhanced = await enhancer.enhance(codeWithIssues, {
        fixIssues: initialIssues
      });

      // Re-validate
      const finalValidation = await validator.validate({ code: enhanced });
      const remainingErrors = finalValidation.issues.filter(i => i.severity === 'error');

      expect(remainingErrors.length).toBeLessThan(initialIssues.length);
    });
  });

  describe('AI-Generated Test Validation', () => {
    test('should validate AI-generated test code', async () => {
      const widgetCode = `
class Counter extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int count = 0;

  void increment() {
    setState(() => count++);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $count'),
        ElevatedButton(onPressed: increment, child: Text('Increment')),
      ],
    );
  }
}
`;

      // Generate tests using AI
      const testCode = await mockAI.generateTests(widgetCode);

      expect(testCode).toBeDefined();
      expect(testCode).toContain('testWidgets');
      expect(testCode).toContain('expect');
      expect(testCode).toContain('find');

      // Validate test code structure
      expect(testCode).toMatch(/void main\(\) \{/);
      expect(testCode).toMatch(/testWidgets\(/);
    });
  });

  describe('Validation Report Integration', () => {
    test('should generate comprehensive report after enhancement', async () => {
      const code = `
class TestWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
`;

      const enhanced = await enhancer.enhance(code);
      const validation = await validator.validate({ code: enhanced });

      expect(validation.report).toBeDefined();
      expect(validation.report.summary).toBeDefined();
      expect(validation.report.summary.totalChecks).toBeGreaterThan(0);
      expect(validation.report.summary.passed).toBeDefined();
      expect(validation.report.summary.failed).toBeDefined();
      expect(validation.report.summary.warnings).toBeDefined();
    });

    test('should track improvements in validation report', async () => {
      const beforeCode = `
class Widget1 extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('Test');
  }
}
`;

      const beforeValidation = await validator.validate({ code: beforeCode });

      const afterCode = await enhancer.enhance(beforeCode, {
        addDocumentation: true,
        addConstConstructors: true
      });

      const afterValidation = await validator.validate({ code: afterCode });

      // Compare improvements
      expect(afterValidation.score).toBeGreaterThan(beforeValidation.score);
      expect(afterValidation.issues.length).toBeLessThanOrEqual(beforeValidation.issues.length);
    });
  });
});
