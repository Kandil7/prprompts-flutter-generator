/**
 * WidgetOptimizer Tests
 * Tests for AI-powered widget optimization service
 */

const WidgetOptimizer = require('../../../lib/refactoring/ai/WidgetOptimizer');
const MockAIClient = require('../../../lib/refactoring/ai/MockAIClient');

describe('WidgetOptimizer', () => {
  let optimizer;
  let mockClient;
  let mockLogger;

  beforeEach(() => {
    mockClient = new MockAIClient();
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    optimizer = new WidgetOptimizer(mockClient, mockLogger);
  });

  describe('optimize()', () => {
    it('should analyze widget tree and return optimizations', async () => {
      const widgetModel = {
        type: 'StatefulWidget',
        name: 'TestWidget',
        children: []
      };
      const code = 'Widget build() { return Container(); }';

      const result = await optimizer.optimize(widgetModel, code);

      expect(result).toHaveProperty('optimizations');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.optimizations)).toBe(true);
    });

    it('should find const constructor opportunities', async () => {
      const code = `
        Widget build() {
          return Column(
            children: [
              Text('Hello'),
              Icon(Icons.home),
            ],
          );
        }
      `;

      const result = await optimizer.optimize({ type: 'Widget' }, code);

      const constOpts = result.optimizations.filter(o => o.type === 'const');
      expect(constOpts.length).toBeGreaterThan(0);
    });

    it('should detect complex build methods', async () => {
      const longCode = 'Widget build() {\n' + '  return Container();\n'.repeat(120) + '}';

      const result = await optimizer.optimize({ type: 'Widget' }, longCode);

      const extractionOpts = result.optimizations.filter(o => o.type === 'extraction');
      expect(extractionOpts.length).toBeGreaterThan(0);
      expect(extractionOpts[0].impact).toBe('high');
    });

    it('should detect missing buildWhen on BlocBuilder', async () => {
      const code = `
        BlocBuilder<UserBloc, UserState>(
          builder: (context, state) {
            return Text(state.name);
          },
        )
      `;

      const result = await optimizer.optimize({ type: 'Widget' }, code);

      const rebuildOpts = result.optimizations.filter(o => o.type === 'rebuild');
      expect(rebuildOpts.length).toBeGreaterThan(0);
      expect(rebuildOpts[0].suggestion).toContain('buildWhen');
    });

    it('should detect ListView without builder', async () => {
      const code = `
        ListView(
          children: items.map((item) => ListTile()).toList(),
        )
      `;

      const result = await optimizer.optimize({ type: 'Widget' }, code);

      const performanceOpts = result.optimizations.filter(o => o.type === 'performance');
      expect(performanceOpts.length).toBeGreaterThan(0);
      expect(performanceOpts[0].suggestion).toContain('ListView.builder');
    });

    it('should detect missing keys in lists', async () => {
      const code = `
        ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) => ListTile(title: Text(items[index])),
        )
      `;

      const result = await optimizer.optimize({ type: 'Widget' }, code);

      const keyOpts = result.optimizations.filter(o => o.type === 'keys');
      expect(keyOpts.length).toBeGreaterThan(0);
    });

    it('should prioritize by impact level', async () => {
      mockClient.setMockResponse('optimize', {
        optimizations: [
          { type: 'const', impact: 'low', suggestion: 'Low priority' },
          { type: 'extraction', impact: 'high', suggestion: 'High priority' },
          { type: 'rebuild', impact: 'medium', suggestion: 'Medium priority' }
        ],
        overall_score: 0.7
      });

      const result = await optimizer.optimize({ type: 'Widget' }, 'code');

      expect(result.optimizations[0].impact).toBe('high');
      expect(result.optimizations[1].impact).toBe('medium');
      expect(result.optimizations[2].impact).toBe('low');
    });

    it('should calculate overall score correctly', async () => {
      const code = 'Widget build() { return Container(); }';

      const result = await optimizer.optimize({ type: 'Widget' }, code);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });

    it('should handle AI failure gracefully', async () => {
      mockClient.optimize = jest.fn().mockRejectedValue(new Error('AI error'));

      const result = await optimizer.optimize({ type: 'Widget' }, 'code');

      // Local optimizations may still run, so check for fallback behavior
      expect(result.overallScore).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('AI optimization failed'));
    });
  });

  describe('formatOptimizations()', () => {
    it('should format optimization report', () => {
      const result = {
        overallScore: 0.85,
        summary: 'Good performance',
        optimizations: [
          { type: 'const', impact: 'high', suggestion: 'Add const', widget: 'Text' },
          { type: 'extraction', impact: 'medium', suggestion: 'Extract widget', widget: 'build' }
        ]
      };

      const formatted = optimizer.formatOptimizations(result);

      expect(formatted).toContain('Widget Optimization Report');
      expect(formatted).toContain('85%');
      expect(formatted).toContain('Good performance');
      expect(formatted).toContain('Add const');
      expect(formatted).toContain('Extract widget');
    });

    it('should group by impact level', () => {
      const result = {
        overallScore: 0.75,
        summary: 'Test',
        optimizations: [
          { type: 'const', impact: 'high', suggestion: 'High1', widget: 'W1' },
          { type: 'keys', impact: 'low', suggestion: 'Low1', widget: 'W2' },
          { type: 'rebuild', impact: 'high', suggestion: 'High2', widget: 'W3' },
          { type: 'extraction', impact: 'medium', suggestion: 'Med1', widget: 'W4' }
        ]
      };

      const formatted = optimizer.formatOptimizations(result);

      const highIndex = formatted.indexOf('HIGH Impact');
      const mediumIndex = formatted.indexOf('MEDIUM Impact');
      const lowIndex = formatted.indexOf('LOW Impact');

      expect(highIndex).toBeGreaterThan(0);
      expect(mediumIndex).toBeGreaterThan(highIndex);
      expect(lowIndex).toBeGreaterThan(mediumIndex);
    });

    it('should show no optimizations message when empty', () => {
      const result = {
        overallScore: 1.0,
        summary: 'Perfect',
        optimizations: []
      };

      const formatted = optimizer.formatOptimizations(result);

      expect(formatted).toContain('No optimizations needed');
    });

    it('should include code snippets if provided', () => {
      const result = {
        overallScore: 0.8,
        summary: 'Test',
        optimizations: [
          {
            type: 'const',
            impact: 'high',
            suggestion: 'Add const',
            widget: 'Text',
            code_snippet: 'const Text("Hello")'
          }
        ]
      };

      const formatted = optimizer.formatOptimizations(result);

      expect(formatted).toContain('Example:');
      expect(formatted).toContain('const Text("Hello")');
    });
  });
});
