/**
 * Abstract AI Client Interface
 * Base class for all AI providers (Claude, Qwen, Gemini)
 */

class AIClient {
  constructor(config) {
    if (this.constructor === AIClient) {
      throw new Error('AIClient is abstract and cannot be instantiated directly');
    }

    this.config = {
      apiKey: config.apiKey || process.env.AI_API_KEY,
      model: config.model || 'default',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.3,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    this.cache = new Map();
    this.tokenUsage = {
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      requestCount: 0
    };
  }

  /**
   * Enhance generated Flutter code
   * @param {string} code - Generated Flutter code
   * @param {Object} context - Conversion context
   * @returns {Promise<Object>} Enhanced code and changelog
   */
  async enhance(code, context) {
    throw new Error('enhance() must be implemented by subclass');
  }

  /**
   * Optimize widget structure
   * @param {Object} widgetTree - Widget tree structure
   * @returns {Promise<Object>} Optimization suggestions
   */
  async optimize(widgetTree) {
    throw new Error('optimize() must be implemented by subclass');
  }

  /**
   * Generate suggestions for improvements
   * @param {string} code - Code to analyze
   * @param {Object} context - Analysis context
   * @returns {Promise<Array>} List of suggestions
   */
  async suggest(code, context) {
    throw new Error('suggest() must be implemented by subclass');
  }

  /**
   * Validate generated code
   * @param {string} code - Code to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation results
   */
  async validate(code, options = {}) {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * Make API request with retry logic
   * @protected
   */
  async _makeRequestWithRetry(requestFn, retryCount = 0) {
    try {
      const result = await this._withTimeout(requestFn(), this.config.timeout);
      this.tokenUsage.requestCount++;
      return result;
    } catch (error) {
      if (retryCount < this.config.retryAttempts) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        await this._sleep(delay);
        return this._makeRequestWithRetry(requestFn, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Check cache for existing response
   * @protected
   */
  _getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour TTL
      return cached.data;
    }
    return null;
  }

  /**
   * Store response in cache
   * @protected
   */
  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Generate cache key from prompt
   * @protected
   */
  _getCacheKey(prompt, context = {}) {
    const contextStr = JSON.stringify(context);
    return `${this.constructor.name}:${prompt.substring(0, 100)}:${contextStr}`.replace(/\s+/g, '_');
  }

  /**
   * Wrap promise with timeout
   * @protected
   */
  _withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), ms)
      )
    ]);
  }

  /**
   * Sleep utility
   * @protected
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse JSON from AI response (handles markdown code blocks)
   * @protected
   */
  _parseJSON(response) {
    try {
      // Remove markdown code blocks
      let cleaned = response
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      // Try direct parse
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        // Try to extract JSON object/array
        const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw e;
      }
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
    }
  }

  /**
   * Get token usage statistics
   * @returns {Object} Token usage stats
   */
  getTokenUsage() {
    return { ...this.tokenUsage };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = AIClient;
