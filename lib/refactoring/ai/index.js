/**
 * AI Enhancement Layer - Main Exports
 * Phase 4: AI-powered code enhancement and validation
 */

// AI Clients
const AIClient = require('./AIClient');
const ClaudeClient = require('./ClaudeClient');
const QwenClient = require('./QwenClient');
const GeminiClient = require('./GeminiClient');
const MockAIClient = require('./MockAIClient');

// AI Services
const CodeEnhancer = require('./CodeEnhancer');
const WidgetOptimizer = require('./WidgetOptimizer');
const TestGenerator = require('./TestGenerator');
const AccessibilityChecker = require('./AccessibilityChecker');

/**
 * Create AI client based on provider
 * @param {string} provider - AI provider name ('claude', 'qwen', 'gemini', 'mock')
 * @param {Object} config - AI configuration
 * @returns {AIClient} AI client instance
 */
function createAIClient(provider, config = {}) {
  switch (provider.toLowerCase()) {
    case 'claude':
      return new ClaudeClient(config);
    case 'qwen':
      return new QwenClient(config);
    case 'gemini':
      return new GeminiClient(config);
    case 'mock':
      return new MockAIClient(config);
    default:
      throw new Error(`Unknown AI provider: ${provider}. Use 'claude', 'qwen', 'gemini', or 'mock'`);
  }
}

/**
 * Create AI enhancement services
 * @param {AIClient} aiClient - AI client instance
 * @param {Object} logger - Logger instance (defaults to console)
 * @returns {Object} AI services
 */
function createAIServices(aiClient, logger = console) {
  return {
    codeEnhancer: new CodeEnhancer(aiClient, logger),
    widgetOptimizer: new WidgetOptimizer(aiClient, logger),
    testGenerator: new TestGenerator(aiClient, logger),
    accessibilityChecker: new AccessibilityChecker(aiClient, logger)
  };
}

module.exports = {
  // Clients
  AIClient,
  ClaudeClient,
  QwenClient,
  GeminiClient,
  MockAIClient,

  // Services
  CodeEnhancer,
  WidgetOptimizer,
  TestGenerator,
  AccessibilityChecker,

  // Factory functions
  createAIClient,
  createAIServices
};
