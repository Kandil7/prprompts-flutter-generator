/**
 * Mock AI Client for Testing
 * Simulates AI behavior without making actual API calls
 */

const AIClient = require('./AIClient');

class MockAIClient extends AIClient {
  constructor(config = {}) {
    super({
      apiKey: 'mock-key',
      model: 'mock-model',
      ...config
    });

    // Predefined responses for deterministic testing
    this.mockResponses = config.mockResponses || {};
    this.callLog = [];
  }

  /**
   * Mock enhance implementation
   */
  async enhance(code, context) {
    this._logCall('enhance', { code: code.substring(0, 100), context });

    // Return predefined response or default
    if (this.mockResponses.enhance) {
      return this.mockResponses.enhance;
    }

    // Default mock enhancement
    return {
      enhanced_code: this._applyMockEnhancements(code),
      changes: [
        {
          type: 'naming',
          description: 'Renamed variable userdata to userData',
          reason: 'Follow camelCase convention'
        },
        {
          type: 'performance',
          description: 'Added const to Text widget',
          reason: 'Prevent unnecessary rebuilds'
        },
        {
          type: 'comments',
          description: 'Added comment explaining business logic',
          reason: 'Improve code maintainability'
        }
      ],
      confidence: 0.92
    };
  }

  /**
   * Mock optimize implementation
   */
  async optimize(widgetTree) {
    this._logCall('optimize', { widgetTree });

    if (this.mockResponses.optimize) {
      return this.mockResponses.optimize;
    }

    // Default mock optimization
    return {
      optimizations: [
        {
          type: 'const',
          widget: 'Text',
          suggestion: 'Add const constructor to Text widget',
          impact: 'medium',
          code_snippet: 'const Text("Hello")'
        },
        {
          type: 'extraction',
          widget: 'build method',
          suggestion: 'Extract complex widget tree to separate method',
          impact: 'high',
          code_snippet: 'Widget _buildHeader() { ... }'
        }
      ],
      overall_score: 0.85,
      summary: 'Good widget structure with minor optimization opportunities'
    };
  }

  /**
   * Mock suggest implementation
   */
  async suggest(code, context) {
    this._logCall('suggest', { code: code.substring(0, 100), context });

    if (this.mockResponses.suggest) {
      return this.mockResponses.suggest;
    }

    // Default mock suggestions
    return {
      suggestions: [
        {
          category: 'performance',
          priority: 'high',
          description: 'Use ListView.builder instead of ListView with children',
          example: 'ListView.builder(itemCount: items.length, itemBuilder: ...)'
        },
        {
          category: 'accessibility',
          priority: 'medium',
          description: 'Add Semantics widget for screen reader support',
          example: 'Semantics(label: "Submit button", child: ElevatedButton(...))'
        },
        {
          category: 'testing',
          priority: 'low',
          description: 'Add widget keys for easier testing',
          example: 'key: const Key("submit-button")'
        }
      ],
      quality_score: 0.82
    };
  }

  /**
   * Mock validate implementation
   */
  async validate(code, options = {}) {
    this._logCall('validate', { code: code.substring(0, 100), options });

    if (this.mockResponses.validate) {
      return this.mockResponses.validate;
    }

    // Default mock validation
    const issues = [];

    if (options.checkAccessibility) {
      issues.push({
        severity: 'warning',
        category: 'accessibility',
        description: 'Missing semantic labels on IconButton',
        line: 42,
        suggestion: 'Add semanticLabel property'
      });
    }

    if (options.checkPerformance) {
      issues.push({
        severity: 'info',
        category: 'performance',
        description: 'Consider using const constructors',
        line: 15,
        suggestion: 'Add const keyword where possible'
      });
    }

    if (options.checkSecurity) {
      issues.push({
        severity: 'error',
        category: 'security',
        description: 'Hardcoded API key detected',
        line: 8,
        suggestion: 'Move API key to environment variables'
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      score: 0.88,
      summary: issues.length === 0 ? 'No issues found' : `Found ${issues.length} issue(s)`
    };
  }

  /**
   * Apply mock enhancements to code
   * @private
   */
  _applyMockEnhancements(code) {
    let enhanced = code;

    // Add const to Text widgets
    enhanced = enhanced.replace(/Text\(/g, 'const Text(');

    // Add a mock comment
    if (!enhanced.includes('// Business logic:')) {
      enhanced = '// Business logic: Handles user authentication\n' + enhanced;
    }

    return enhanced;
  }

  /**
   * Log method calls for testing verification
   * @private
   */
  _logCall(method, args) {
    this.callLog.push({
      method,
      args,
      timestamp: Date.now()
    });

    // Update token usage (mock)
    this.tokenUsage.totalTokens += 1000;
    this.tokenUsage.requestCount++;
  }

  /**
   * Set custom mock response for specific method
   */
  setMockResponse(method, response) {
    this.mockResponses[method] = response;
  }

  /**
   * Get call log for testing
   */
  getCallLog() {
    return [...this.callLog];
  }

  /**
   * Clear call log
   */
  clearCallLog() {
    this.callLog = [];
  }

  /**
   * Simulate API delay (configurable)
   */
  async _simulateDelay() {
    const delay = this.config.mockDelay || 0;
    if (delay > 0) {
      await this._sleep(delay);
    }
  }

  /**
   * Override _makeRequest to avoid actual HTTP calls
   * @protected
   */
  async _makeRequest(prompt) {
    await this._simulateDelay();
    return JSON.stringify({ mock: 'response' });
  }

  /**
   * Get statistics for testing
   */
  getStats() {
    return {
      totalCalls: this.callLog.length,
      callsByMethod: this._groupCallsByMethod(),
      averageResponseTime: this._calculateAverageResponseTime(),
      tokenUsage: this.getTokenUsage()
    };
  }

  /**
   * Group calls by method
   * @private
   */
  _groupCallsByMethod() {
    const grouped = {};
    this.callLog.forEach(call => {
      grouped[call.method] = (grouped[call.method] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Calculate average response time
   * @private
   */
  _calculateAverageResponseTime() {
    if (this.callLog.length === 0) return 0;

    const times = [];
    for (let i = 1; i < this.callLog.length; i++) {
      times.push(this.callLog[i].timestamp - this.callLog[i - 1].timestamp);
    }

    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
}

module.exports = MockAIClient;
