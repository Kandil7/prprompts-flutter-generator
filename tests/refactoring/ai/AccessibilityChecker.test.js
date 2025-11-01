/**
 * AccessibilityChecker Tests
 * Tests for AI-powered accessibility validation service
 */

const AccessibilityChecker = require('../../../lib/refactoring/ai/AccessibilityChecker');
const MockAIClient = require('../../../lib/refactoring/ai/MockAIClient');

describe('AccessibilityChecker', () => {
  let checker;
  let mockClient;
  let mockLogger;

  beforeEach(() => {
    mockClient = new MockAIClient();
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    checker = new AccessibilityChecker(mockClient, mockLogger);
  });

  describe('check()', () => {
    it('should check accessibility and return report', async () => {
      const code = 'Widget build() { return Text("Hello"); }';

      const result = await checker.check(code);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('recommendations');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should detect missing Semantics widgets', async () => {
      const code = `
        Widget build() {
          return IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {},
          );
        }
      `;

      const result = await checker.check(code);

      const semanticsIssues = result.issues.filter(i => i.category === 'semantics');
      expect(semanticsIssues.length).toBeGreaterThan(0);
    });

    it('should detect missing semantic labels on IconButton', async () => {
      const code = `
        IconButton(
          icon: Icon(Icons.delete),
          onPressed: () {},
        )
      `;

      const result = await checker.check(code);

      const labelIssues = result.issues.filter(i => i.category === 'labels');
      expect(labelIssues.length).toBeGreaterThan(0);
      expect(labelIssues[0].description).toContain('IconButton');
      expect(labelIssues[0].severity).toBe('error');
    });

    it('should detect missing labels on FloatingActionButton', async () => {
      const code = `
        FloatingActionButton(
          onPressed: () {},
          child: Icon(Icons.add),
        )
      `;

      const result = await checker.check(code);

      const labelIssues = result.issues.filter(i => i.category === 'labels');
      expect(labelIssues.length).toBeGreaterThan(0);
      expect(labelIssues[0].description).toContain('FloatingActionButton');
    });

    it('should detect potential low contrast issues', async () => {
      const code = `
        Container(
          color: Colors.white,
          child: Text(
            'Light text',
            style: TextStyle(color: Colors.grey),
          ),
        )
      `;

      const result = await checker.check(code);

      const contrastIssues = result.issues.filter(i => i.category === 'contrast');
      expect(contrastIssues.length).toBeGreaterThan(0);
    });

    it('should detect missing form labels', async () => {
      const code = `
        TextField(
          decoration: InputDecoration(
            hintText: 'Enter text',
          ),
        )
      `;

      const result = await checker.check(code);

      const formIssues = result.issues.filter(i => i.category === 'forms');
      expect(formIssues.length).toBeGreaterThan(0);
      expect(formIssues[0].suggestion).toContain('labelText');
    });

    it('should detect tap target size reminders', async () => {
      const code = `
        GestureDetector(
          onTap: () {},
          child: Container(),
        )
      `;

      const result = await checker.check(code);

      const tapTargetIssues = result.issues.filter(i => i.category === 'tap_targets');
      expect(tapTargetIssues.length).toBeGreaterThan(0);
      expect(tapTargetIssues[0].suggestion).toContain('48');
    });

    it('should calculate score correctly', async () => {
      const code = 'Widget build() { return Container(); }';

      const result = await checker.check(code);

      // Perfect code should have high score
      if (result.issues.length === 0) {
        expect(result.score).toBe(1.0);
      } else {
        expect(result.score).toBeLessThan(1.0);
      }
    });

    it('should generate appropriate summary', async () => {
      // Test with code that has no issues (high score)
      const perfectCode = `
        Semantics(
          label: 'Button',
          child: IconButton(semanticLabel: 'Close', icon: Icon(Icons.close), onPressed: () {}),
        )
      `;

      const result1 = await checker.check(perfectCode);
      expect(result1.score).toBeGreaterThan(0.7);
      expect(result1.summary).toMatch(/Excellent|Good/);
    });

    it('should generate recommendations', async () => {
      const code = `
        IconButton(icon: Icon(Icons.delete), onPressed: () {})
        TextField()
      `;

      const result = await checker.check(code);

      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations.some(r => r.includes('semantic labels'))).toBe(true);
    });

    it('should handle AI check failure gracefully', async () => {
      mockClient.validate = jest.fn().mockRejectedValue(new Error('AI error'));

      const result = await checker.check('code');

      // Local checks still run, so we get a score
      expect(result.score).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('AI accessibility check failed'));
    });
  });

  describe('formatReport()', () => {
    it('should format accessibility report', () => {
      const report = {
        score: 0.85,
        summary: 'Good accessibility',
        issues: [
          {
            severity: 'warning',
            category: 'labels',
            description: 'Missing semantic label',
            suggestion: 'Add semantic label',
            line: 42
          }
        ],
        recommendations: ['Fix labels', 'Check contrast']
      };

      const formatted = checker.formatReport(report);

      expect(formatted).toContain('Accessibility Report');
      expect(formatted).toContain('85%');
      expect(formatted).toContain('Good accessibility');
      expect(formatted).toContain('Missing semantic label');
      expect(formatted).toContain('Line: 42');
      expect(formatted).toContain('Recommendations');
    });

    it('should group issues by category', () => {
      const report = {
        score: 0.7,
        summary: 'Test',
        issues: [
          { severity: 'error', category: 'labels', description: 'Issue 1', suggestion: 'Fix 1' },
          { severity: 'warning', category: 'labels', description: 'Issue 2', suggestion: 'Fix 2' },
          { severity: 'info', category: 'contrast', description: 'Issue 3', suggestion: 'Fix 3' }
        ],
        recommendations: []
      };

      const formatted = checker.formatReport(report);

      const labelsIndex = formatted.indexOf('Labels (2)');
      const contrastIndex = formatted.indexOf('Contrast (1)');

      expect(labelsIndex).toBeGreaterThan(0);
      expect(contrastIndex).toBeGreaterThan(labelsIndex);
    });

    it('should show no issues message when perfect', () => {
      const report = {
        score: 1.0,
        summary: 'Perfect',
        issues: [],
        recommendations: []
      };

      const formatted = checker.formatReport(report);

      expect(formatted).toContain('No accessibility issues found');
    });

    it('should use correct icons for severity', () => {
      const report = {
        score: 0.6,
        summary: 'Test',
        issues: [
          { severity: 'error', category: 'labels', description: 'Error issue', suggestion: 'Fix' },
          { severity: 'warning', category: 'contrast', description: 'Warning issue', suggestion: 'Fix' },
          { severity: 'info', category: 'forms', description: 'Info issue', suggestion: 'Fix' }
        ],
        recommendations: []
      };

      const formatted = checker.formatReport(report);

      expect(formatted).toContain('❌');
      expect(formatted).toContain('⚠️');
      expect(formatted).toContain('ℹ️');
    });
  });
});
