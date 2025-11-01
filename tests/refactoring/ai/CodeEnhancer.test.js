/**
 * CodeEnhancer Tests
 * Tests for AI-powered code enhancement service
 */

const CodeEnhancer = require('../../../lib/refactoring/ai/CodeEnhancer');
const MockAIClient = require('../../../lib/refactoring/ai/MockAIClient');

describe('CodeEnhancer', () => {
  let enhancer;
  let mockClient;
  let mockLogger;

  beforeEach(() => {
    mockClient = new MockAIClient();
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    enhancer = new CodeEnhancer(mockClient, mockLogger);
  });

  describe('enhance()', () => {
    it('should enhance code successfully', async () => {
      const code = 'Widget build() { return Text("Hello"); }';
      const context = { componentName: 'TestWidget', feature: 'auth' };

      const result = await enhancer.enhance(code, context);

      expect(result).toHaveProperty('enhancedCode');
      expect(result).toHaveProperty('changelog');
      expect(result).toHaveProperty('confidence');
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should add Flutter material import if missing', async () => {
      const code = 'Widget build() { return Container(); }';

      const result = await enhancer.enhance(code, {});

      expect(result.enhancedCode).toContain('import \'package:flutter/material.dart\';');
    });

    it('should preserve Flutter material import if present', async () => {
      const code = 'import \'package:flutter/material.dart\';\nWidget build() { return Container(); }';

      const result = await enhancer.enhance(code, {});

      // Should have only one import
      const importCount = (result.enhancedCode.match(/import 'package:flutter\/material.dart';/g) || []).length;
      expect(importCount).toBe(1);
    });

    it('should handle AI enhancement failure gracefully', async () => {
      const failingClient = new MockAIClient();
      failingClient.enhance = jest.fn().mockRejectedValue(new Error('API error'));

      const failingEnhancer = new CodeEnhancer(failingClient, mockLogger);
      const code = 'Text("Hello")';

      const result = await failingEnhancer.enhance(code, {});

      expect(result.enhancedCode).toBe(code);
      expect(result.confidence).toBe(0.0);
      expect(result.changelog[0].type).toBe('error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle empty AI response', async () => {
      mockClient.setMockResponse('enhance', { enhanced_code: '', changes: [], confidence: 0.9 });

      const result = await enhancer.enhance('code', {});

      expect(result.enhancedCode).toBe('code'); // Original code preserved
      expect(result.changelog[0].type).toBe('warning');
    });

    it('should detect no changes needed', async () => {
      const code = 'Text("Hello")';
      mockClient.setMockResponse('enhance', { enhanced_code: code, changes: [], confidence: 1.0 });

      const result = await enhancer.enhance(code, {});

      expect(result.enhancedCode).toBe(code);
      expect(result.changelog[0].description).toContain('already optimal');
    });

    it('should remove hardcoded secrets', async () => {
      const codeWithSecret = 'const apiKey = "sk-1234567890abcdefghijklmnop";';
      mockClient.setMockResponse('enhance', { enhanced_code: codeWithSecret, changes: [], confidence: 0.9 });

      const result = await enhancer.enhance('code', {});

      expect(result.enhancedCode).toContain('REMOVED_FOR_SECURITY');
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('secret'));
    });

    it('should remove hardcoded passwords', async () => {
      const codeWithPassword = 'const password = "mypassword123";';
      mockClient.setMockResponse('enhance', { enhanced_code: codeWithPassword, changes: [], confidence: 0.9 });

      const result = await enhancer.enhance('code', {});

      expect(result.enhancedCode).toContain('REMOVED_FOR_SECURITY');
    });
  });

  describe('formatChangelog()', () => {
    it('should format empty changelog', () => {
      const formatted = enhancer.formatChangelog([]);

      expect(formatted).toBe('No changes made');
    });

    it('should group changes by type', () => {
      const changelog = [
        { type: 'naming', description: 'Renamed variable', reason: 'Better naming' },
        { type: 'performance', description: 'Added const', reason: 'Performance' },
        { type: 'naming', description: 'Renamed class', reason: 'Convention' }
      ];

      const formatted = enhancer.formatChangelog(changelog);

      expect(formatted).toContain('📝 Naming');
      expect(formatted).toContain('⚡ Performance');
      expect(formatted).toContain('Renamed variable');
      expect(formatted).toContain('Added const');
      expect(formatted).toContain('Better naming');
    });

    it('should include all change sections', () => {
      const changelog = [
        { type: 'naming', description: 'Test1' },
        { type: 'performance', description: 'Test2' },
        { type: 'error_handling', description: 'Test3' },
        { type: 'idiomatic', description: 'Test4' },
        { type: 'comments', description: 'Test5' },
        { type: 'security', description: 'Test6' }
      ];

      const formatted = enhancer.formatChangelog(changelog);

      expect(formatted).toContain('📝 Naming');
      expect(formatted).toContain('⚡ Performance');
      expect(formatted).toContain('🛡️ Error handling');
      expect(formatted).toContain('✨ Idiomatic');
      expect(formatted).toContain('💬 Comments');
      expect(formatted).toContain('🔒 Security');
    });
  });
});
