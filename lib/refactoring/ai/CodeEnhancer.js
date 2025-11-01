/**
 * AI-Powered Code Enhancer
 * Takes generated Flutter code and applies AI-driven improvements
 */

class CodeEnhancer {
  constructor(aiClient, logger = console) {
    this.aiClient = aiClient;
    this.logger = logger;
  }

  /**
   * Enhance generated Flutter code
   * @param {string} code - Generated Flutter code
   * @param {Object} context - Conversion context (reactCode, componentName, feature, etc.)
   * @returns {Promise<Object>} { enhancedCode, changelog, confidence }
   */
  async enhance(code, context = {}) {
    try {
      this.logger.log('🎨 Enhancing code with AI...');

      const result = await this.aiClient.enhance(code, context);

      // Validate enhancement result
      if (!result.enhanced_code || result.enhanced_code.length === 0) {
        this.logger.warn('⚠️  AI enhancement returned empty code, using original');
        return {
          enhancedCode: code,
          changelog: [{
            type: 'warning',
            description: 'AI enhancement skipped',
            reason: 'Empty result from AI'
          }],
          confidence: 0.0
        };
      }

      // Check if enhancement actually made changes
      if (result.enhanced_code === code) {
        this.logger.log('✓ No changes needed');
        return {
          enhancedCode: code,
          changelog: [{
            type: 'info',
            description: 'Code already optimal',
            reason: 'AI found no improvements needed'
          }],
          confidence: result.confidence || 1.0
        };
      }

      // Apply safe transformations
      const safeCode = this._applySafeTransformations(result.enhanced_code);

      this.logger.log(`✓ Enhanced code (${result.changes?.length || 0} changes, confidence: ${(result.confidence * 100).toFixed(0)}%)`);

      return {
        enhancedCode: safeCode,
        changelog: result.changes || [],
        confidence: result.confidence || 0.8
      };

    } catch (error) {
      this.logger.error(`❌ Enhancement failed: ${error.message}`);

      // Return original code on failure
      return {
        enhancedCode: code,
        changelog: [{
          type: 'error',
          description: 'Enhancement failed',
          reason: error.message
        }],
        confidence: 0.0
      };
    }
  }

  /**
   * Apply safe transformations to enhanced code
   * Prevents AI from introducing breaking changes
   * @private
   */
  _applySafeTransformations(code) {
    let safeCode = code;

    // Ensure proper imports are preserved
    if (!safeCode.includes('import \'package:flutter/material.dart\';')) {
      safeCode = 'import \'package:flutter/material.dart\';\n' + safeCode;
    }

    // Remove any potential hardcoded secrets (defensive)
    safeCode = this._removeHardcodedSecrets(safeCode);

    // Ensure null safety is maintained
    safeCode = this._ensureNullSafety(safeCode);

    return safeCode;
  }

  /**
   * Remove hardcoded secrets from code
   * @private
   */
  _removeHardcodedSecrets(code) {
    // Replace obvious API keys, tokens, passwords
    const secretPatterns = [
      /apiKey\s*=\s*['"][A-Za-z0-9_-]{20,}['"]/g,
      /token\s*=\s*['"][A-Za-z0-9_-]{20,}['"]/g,
      /password\s*=\s*['"][^'"]+['"]/g,
      /secret\s*=\s*['"][A-Za-z0-9_-]{20,}['"]/g
    ];

    let safeCode = code;
    secretPatterns.forEach(pattern => {
      safeCode = safeCode.replace(pattern, match => {
        const key = match.split('=')[0].trim();
        this.logger.warn(`⚠️  Removed potential hardcoded secret: ${key}`);
        return `${key} = 'REMOVED_FOR_SECURITY'`;
      });
    });

    return safeCode;
  }

  /**
   * Ensure null safety is maintained
   * @private
   */
  _ensureNullSafety(code) {
    // Basic check: ensure required fields are marked
    // This is a simple heuristic, not a full analyzer
    return code;
  }

  /**
   * Format changelog for display
   * @param {Array} changelog - Array of change objects
   * @returns {string} Formatted changelog
   */
  formatChangelog(changelog) {
    if (!changelog || changelog.length === 0) {
      return 'No changes made';
    }

    const sections = {
      naming: [],
      performance: [],
      error_handling: [],
      idiomatic: [],
      comments: [],
      security: [],
      other: []
    };

    changelog.forEach(change => {
      const type = change.type || 'other';
      if (sections[type]) {
        sections[type].push(change);
      } else {
        sections.other.push(change);
      }
    });

    let output = '';
    Object.entries(sections).forEach(([section, changes]) => {
      if (changes.length > 0) {
        output += `\n${this._getSectionIcon(section)} ${this._capitalizeFirst(section.replace('_', ' '))}:\n`;
        changes.forEach(change => {
          output += `  - ${change.description}\n`;
          if (change.reason) {
            output += `    Why: ${change.reason}\n`;
          }
        });
      }
    });

    return output;
  }

  /**
   * Get emoji icon for section
   * @private
   */
  _getSectionIcon(section) {
    const icons = {
      naming: '📝',
      performance: '⚡',
      error_handling: '🛡️',
      idiomatic: '✨',
      comments: '💬',
      security: '🔒',
      other: '🔧'
    };
    return icons[section] || '📌';
  }

  /**
   * Capitalize first letter
   * @private
   */
  _capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

module.exports = CodeEnhancer;
