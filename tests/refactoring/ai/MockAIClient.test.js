/**
 * MockAIClient Tests
 * Tests for the mock AI client used in testing
 */

const MockAIClient = require('../../../lib/refactoring/ai/MockAIClient');

describe('MockAIClient', () => {
  let client;

  beforeEach(() => {
    client = new MockAIClient();
  });

  describe('constructor', () => {
    it('should create instance with default config', () => {
      expect(client).toBeInstanceOf(MockAIClient);
      expect(client.config.apiKey).toBe('mock-key');
      expect(client.config.model).toBe('mock-model');
    });

    it('should accept custom mock responses', () => {
      const customClient = new MockAIClient({
        mockResponses: {
          enhance: { enhanced_code: 'custom', changes: [], confidence: 0.9 }
        }
      });

      expect(customClient.mockResponses.enhance).toBeDefined();
    });
  });

  describe('enhance()', () => {
    it('should return mock enhancement result', async () => {
      const code = 'Text("Hello")';
      const context = { componentName: 'TestWidget' };

      const result = await client.enhance(code, context);

      expect(result).toHaveProperty('enhanced_code');
      expect(result).toHaveProperty('changes');
      expect(result).toHaveProperty('confidence');
      expect(Array.isArray(result.changes)).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should log calls', async () => {
      await client.enhance('code', { test: true });

      const log = client.getCallLog();
      expect(log).toHaveLength(1);
      expect(log[0].method).toBe('enhance');
      expect(log[0].args.context).toEqual({ test: true });
    });

    it('should add const to Text widgets', async () => {
      const code = 'Text("Hello")';
      const result = await client.enhance(code, {});

      expect(result.enhanced_code).toContain('const Text');
    });

    it('should return custom mock response if set', async () => {
      const customResponse = {
        enhanced_code: 'CustomCode',
        changes: [{ type: 'custom', description: 'test' }],
        confidence: 1.0
      };

      client.setMockResponse('enhance', customResponse);

      const result = await client.enhance('code', {});
      expect(result).toEqual(customResponse);
    });
  });

  describe('optimize()', () => {
    it('should return mock optimization result', async () => {
      const widgetTree = { type: 'Container', children: [] };

      const result = await client.optimize(widgetTree);

      expect(result).toHaveProperty('optimizations');
      expect(result).toHaveProperty('overall_score');
      expect(result).toHaveProperty('summary');
      expect(Array.isArray(result.optimizations)).toBe(true);
    });

    it('should include different optimization types', async () => {
      const result = await client.optimize({ type: 'Widget' });

      const types = result.optimizations.map(o => o.type);
      expect(types).toContain('const');
      expect(types).toContain('extraction');
    });
  });

  describe('suggest()', () => {
    it('should return mock suggestions', async () => {
      const code = 'Widget build() { return Text("Hi"); }';

      const result = await client.suggest(code, {});

      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('quality_score');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should include different suggestion categories', async () => {
      const result = await client.suggest('code', {});

      const categories = result.suggestions.map(s => s.category);
      expect(categories).toContain('performance');
      expect(categories).toContain('accessibility');
      expect(categories).toContain('testing');
    });
  });

  describe('validate()', () => {
    it('should return validation result', async () => {
      const code = 'Widget build() { return Container(); }';

      const result = await client.validate(code);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('summary');
    });

    it('should check accessibility when requested', async () => {
      const result = await client.validate('code', { checkAccessibility: true });

      const accessibilityIssues = result.issues.filter(i => i.category === 'accessibility');
      expect(accessibilityIssues.length).toBeGreaterThan(0);
    });

    it('should check performance when requested', async () => {
      const result = await client.validate('code', { checkPerformance: true });

      const performanceIssues = result.issues.filter(i => i.category === 'performance');
      expect(performanceIssues.length).toBeGreaterThan(0);
    });

    it('should check security when requested', async () => {
      const result = await client.validate('code', { checkSecurity: true });

      const securityIssues = result.issues.filter(i => i.category === 'security');
      expect(securityIssues.length).toBeGreaterThan(0);
    });
  });

  describe('call logging', () => {
    it('should log all method calls', async () => {
      await client.enhance('code1', {});
      await client.optimize({ type: 'Widget' });
      await client.suggest('code2', {});
      await client.validate('code3', {});

      const log = client.getCallLog();
      expect(log).toHaveLength(4);
      expect(log.map(c => c.method)).toEqual(['enhance', 'optimize', 'suggest', 'validate']);
    });

    it('should clear call log', async () => {
      await client.enhance('code', {});
      await client.optimize({});

      client.clearCallLog();

      expect(client.getCallLog()).toHaveLength(0);
    });
  });

  describe('token usage', () => {
    it('should track token usage', async () => {
      await client.enhance('code', {});
      await client.optimize({});

      const usage = client.getTokenUsage();
      expect(usage.totalTokens).toBeGreaterThan(0);
      expect(usage.requestCount).toBe(2);
    });
  });

  describe('statistics', () => {
    it('should provide call statistics', async () => {
      await client.enhance('code', {});
      await client.enhance('code', {});
      await client.optimize({});

      const stats = client.getStats();
      expect(stats.totalCalls).toBe(3);
      expect(stats.callsByMethod.enhance).toBe(2);
      expect(stats.callsByMethod.optimize).toBe(1);
    });
  });

  describe('caching', () => {
    it('should cache responses', async () => {
      const code = 'Text("Hello")';
      const context = { componentName: 'Test' };

      const result1 = await client.enhance(code, context);
      const result2 = await client.enhance(code, context);

      // Should be cached (same result)
      expect(result1).toEqual(result2);

      // Call count should be 2 (cache doesn't prevent logging)
      expect(client.getCallLog()).toHaveLength(2);
    });

    it('should clear cache', async () => {
      await client.enhance('code', {});

      client.clearCache();

      expect(client.cache.size).toBe(0);
    });
  });
});
