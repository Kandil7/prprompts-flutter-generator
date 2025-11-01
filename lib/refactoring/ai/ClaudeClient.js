/**
 * Claude AI Client Implementation
 * Anthropic Claude API integration for code enhancement
 */

const AIClient = require('./AIClient');
const https = require('https');

class ClaudeClient extends AIClient {
  constructor(config = {}) {
    super({
      apiKey: config.apiKey || process.env.CLAUDE_API_KEY,
      model: config.model || 'claude-sonnet-4-20250514',
      ...config
    });

    this.apiUrl = 'api.anthropic.com';
    this.apiVersion = '2023-06-01';
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
      // Fallback: return original code with note
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
   * Build enhancement prompt
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
1. Better variable/method naming (Flutter conventions: camelCase for variables, PascalCase for classes)
2. More idiomatic Dart code (use ??= for null-aware operators, => for single-line functions)
3. Performance optimizations (const constructors, build method optimization)
4. Proper error handling (try-catch, proper exception types)
5. Comments for complex logic (business rules, workarounds)

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
\`\`\`

**Flutter Best Practices:**
- Use const constructors where possible: const Text('Hello')
- Prefer composition over inheritance
- Extract complex widgets to separate classes when build() > 100 lines
- Use proper null safety (?, !, required, late)
- Follow Flutter style guide: https://dart.dev/guides/language/effective-dart/style`;
  }

  /**
   * Build optimization prompt
   * @private
   */
  _buildOptimizePrompt(widgetTree) {
    return `Analyze this Flutter widget tree and suggest optimizations.

**Widget Tree:**
${JSON.stringify(widgetTree, null, 2)}

**Optimization Goals:**
1. Suggest const constructors
2. Recommend widget extraction (when build() method is complex)
3. Detect unnecessary rebuilds
4. Suggest performance improvements (ListView.builder vs ListView)
5. Identify missing keys

**Output Format (JSON only):**
\`\`\`json
{
  "optimizations": [
    {
      "type": "const | extraction | rebuild | performance | keys",
      "widget": "widget name or path",
      "suggestion": "specific improvement to make",
      "impact": "high | medium | low",
      "code_snippet": "example code if applicable"
    }
  ],
  "overall_score": 0.85,
  "summary": "brief summary of widget tree health"
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

**Review Areas:**
1. Code organization and structure
2. State management patterns
3. Error handling completeness
4. Performance considerations
5. Accessibility (Semantics widgets, screen reader support)
6. Testing considerations

**Output Format (JSON only):**
\`\`\`json
{
  "suggestions": [
    {
      "category": "organization | state | errors | performance | accessibility | testing",
      "priority": "high | medium | low",
      "description": "what to improve",
      "example": "code example if helpful"
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
${checkAccessibility ? '- Accessibility (Semantics widgets, contrast, labels)' : ''}
${checkPerformance ? '- Performance (unnecessary rebuilds, const usage, ListView.builder)' : ''}
${checkSecurity ? '- Security (hardcoded secrets, insecure storage, API keys)' : ''}
- Null safety compliance
- Error handling completeness
- Flutter best practices

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
   * Make API request to Claude
   * @private
   */
  async _makeRequest(prompt) {
    return this._makeRequestWithRetry(async () => {
      const payload = JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return new Promise((resolve, reject) => {
        const options = {
          hostname: this.apiUrl,
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': this.apiVersion,
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
              reject(new Error(`Claude API error ${res.statusCode}: ${data}`));
              return;
            }

            try {
              const json = JSON.parse(data);

              // Track token usage
              if (json.usage) {
                this.tokenUsage.totalTokens += json.usage.input_tokens + json.usage.output_tokens;
                this.tokenUsage.promptTokens += json.usage.input_tokens;
                this.tokenUsage.completionTokens += json.usage.output_tokens;
              }

              const content = json.content?.[0]?.text || '';
              resolve(content);
            } catch (error) {
              reject(new Error(`Failed to parse Claude response: ${error.message}`));
            }
          });
        });

        req.on('error', (error) => {
          reject(new Error(`Claude API request failed: ${error.message}`));
        });

        req.write(payload);
        req.end();
      });
    });
  }
}

module.exports = ClaudeClient;
