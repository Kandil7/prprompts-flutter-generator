/**
 * Qwen AI Client Implementation
 * Alibaba Qwen API integration for code enhancement
 */

const AIClient = require('./AIClient');
const https = require('https');

class QwenClient extends AIClient {
  constructor(config = {}) {
    super({
      apiKey: config.apiKey || process.env.QWEN_API_KEY,
      model: config.model || 'qwen-max',
      ...config
    });

    this.apiUrl = 'dashscope.aliyuncs.com';
  }

  /**
   * Enhance Flutter code with AI improvements
   */
  async enhance(code, context) {
    const cacheKey = this._getCacheKey('enhance', { code: code.substring(0, 200), context });
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = this._buildEnhancePrompt(code, context);
    const response = await this._makeRequest(prompt);

    try {
      const result = this._parseJSON(response);
      this._setCache(cacheKey, result);
      return result;
    } catch (error) {
      return {
        enhanced_code: code,
        changes: [{
          type: 'note',
          description: 'AI enhancement failed, using original code',
          reason: error.message
        }],
        confidence: 0.5
      };
    }
  }

  /**
   * Optimize widget structure
   */
  async optimize(widgetTree) {
    const cacheKey = this._getCacheKey('optimize', { widgetTree });
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = this._buildOptimizePrompt(widgetTree);
    const response = await this._makeRequest(prompt);

    const result = this._parseJSON(response);
    this._setCache(cacheKey, result);
    return result;
  }

  /**
   * Generate improvement suggestions
   */
  async suggest(code, context) {
    const cacheKey = this._getCacheKey('suggest', { code: code.substring(0, 200), context });
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = this._buildSuggestPrompt(code, context);
    const response = await this._makeRequest(prompt);

    const result = this._parseJSON(response);
    this._setCache(cacheKey, result);
    return result;
  }

  /**
   * Validate generated code
   */
  async validate(code, options = {}) {
    const cacheKey = this._getCacheKey('validate', { code: code.substring(0, 200), options });
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    const prompt = this._buildValidatePrompt(code, options);
    const response = await this._makeRequest(prompt);

    const result = this._parseJSON(response);
    this._setCache(cacheKey, result);
    return result;
  }

  /**
   * Build enhancement prompt (same as Claude)
   * @private
   */
  _buildEnhancePrompt(code, context) {
    const { reactCode, componentName, feature } = context;

    return `You are a Flutter expert. Improve the following Dart code generated from React.

**Original React Component:**
${reactCode ? reactCode.substring(0, 500) + '...' : 'N/A'}

**Generated Flutter Code:**
${code}

**Context:**
- Component: ${componentName || 'Unknown'}
- Feature: ${feature || 'Unknown'}

**Enhancement Goals:**
1. Better variable/method naming (Flutter conventions)
2. More idiomatic Dart code
3. Performance optimizations (const constructors)
4. Proper error handling
5. Comments for complex logic

**Output Format (JSON only):**
\`\`\`json
{
  "enhanced_code": "complete enhanced code here",
  "changes": [
    {
      "type": "naming | performance | error_handling | idiomatic | comments",
      "description": "What was changed",
      "reason": "Why this improvement matters"
    }
  ],
  "confidence": 0.95
}
\`\`\``;
  }

  /**
   * Build optimization prompt
   * @private
   */
  _buildOptimizePrompt(widgetTree) {
    return `Analyze this Flutter widget tree and suggest optimizations.

**Widget Tree:**
${JSON.stringify(widgetTree, null, 2)}

**Output Format (JSON only):**
\`\`\`json
{
  "optimizations": [
    {
      "type": "const | extraction | rebuild | performance | keys",
      "widget": "widget name",
      "suggestion": "specific improvement",
      "impact": "high | medium | low",
      "code_snippet": "example code"
    }
  ],
  "overall_score": 0.85,
  "summary": "widget tree health summary"
}
\`\`\``;
  }

  /**
   * Build suggestion prompt
   * @private
   */
  _buildSuggestPrompt(code, context) {
    return `Review this Flutter code and provide improvement suggestions.

**Code:**
${code}

**Context:**
${JSON.stringify(context, null, 2)}

**Output Format (JSON only):**
\`\`\`json
{
  "suggestions": [
    {
      "category": "organization | state | errors | performance | accessibility | testing",
      "priority": "high | medium | low",
      "description": "what to improve",
      "example": "code example"
    }
  ],
  "quality_score": 0.85
}
\`\`\``;
  }

  /**
   * Build validation prompt
   * @private
   */
  _buildValidatePrompt(code, options) {
    const { checkAccessibility, checkPerformance, checkSecurity } = options;

    return `Validate this Flutter code for quality and correctness.

**Code:**
${code}

**Validation Checks:**
${checkAccessibility ? '- Accessibility' : ''}
${checkPerformance ? '- Performance' : ''}
${checkSecurity ? '- Security' : ''}

**Output Format (JSON only):**
\`\`\`json
{
  "valid": true,
  "issues": [
    {
      "severity": "error | warning | info",
      "category": "accessibility | performance | security | null_safety | errors | best_practices",
      "description": "issue description",
      "line": 42,
      "suggestion": "how to fix"
    }
  ],
  "score": 0.92,
  "summary": "overall validation summary"
}
\`\`\``;
  }

  /**
   * Make API request to Qwen
   * @private
   */
  async _makeRequest(prompt) {
    return this._makeRequestWithRetry(async () => {
      const payload = JSON.stringify({
        model: this.config.model,
        input: {
          messages: [
            {
              role: 'system',
              content: 'You are an expert Flutter developer specializing in React-to-Flutter migrations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        }
      });

      return new Promise((resolve, reject) => {
        const options = {
          hostname: this.apiUrl,
          path: '/api/v1/services/aigc/text-generation/generation',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            if (res.statusCode !== 200) {
              reject(new Error(`Qwen API error ${res.statusCode}: ${data}`));
              return;
            }

            try {
              const json = JSON.parse(data);

              // Track token usage
              if (json.usage) {
                this.tokenUsage.totalTokens += json.usage.total_tokens || 0;
                this.tokenUsage.promptTokens += json.usage.input_tokens || 0;
                this.tokenUsage.completionTokens += json.usage.output_tokens || 0;
              }

              const content = json.output?.text || '';
              resolve(content);
            } catch (error) {
              reject(new Error(`Failed to parse Qwen response: ${error.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`Qwen API request failed: ${error.message}`));
        });

        req.write(payload);
        req.end();
      });
    });
  }
}

module.exports = QwenClient;
