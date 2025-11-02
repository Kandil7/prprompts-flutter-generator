/**
 * AI-Powered Accessibility Checker
 * Validates accessibility compliance and suggests improvements
 */

class AccessibilityChecker {
  constructor(aiClient, logger = console) {
    this.aiClient = aiClient;
    this.logger = logger;
  }

  /**
   * Check accessibility of generated code
   * @param {string} code - Flutter code to check
   * @param {Object} options - Check options
   * @returns {Promise<Object>} Accessibility report
   */
  async check(code, options = {}) {
    try {
      this.logger.log('♿ Checking accessibility...');

      // Run local checks first
      const localIssues = this._checkLocally(code);

      // Enhance with AI
      const aiResult = await this._checkWithAI(code, options);

      // Merge issues
      const allIssues = this._mergeIssues(localIssues, aiResult.issues || []);

      // Calculate score
      const score = this._calculateScore(allIssues);

      this.logger.log(`✓ Accessibility score: ${(score * 100).toFixed(0)}% (${allIssues.length} issues)`);

      return {
        score,
        issues: allIssues,
        summary: this._generateSummary(score, allIssues),
        recommendations: this._generateRecommendations(allIssues)
      };

    } catch (error) {
      this.logger.error(`❌ Accessibility check failed: ${error.message}`);
      return {
        score: 0.5,
        issues: [],
        summary: `Accessibility check failed: ${error.message}`,
        recommendations: []
      };
    }
  }

  /**
   * Local accessibility checks
   * @private
   */
  _checkLocally(code) {
    const issues = [];

    // Check for Semantics widgets
    if (!code.includes('Semantics(')) {
      issues.push({
        severity: 'warning',
        category: 'semantics',
        description: 'No Semantics widgets found',
        suggestion: 'Add Semantics widgets for screen reader support',
        line: null
      });
    }

    // Check for screen reader labels on interactive widgets
    const interactiveWidgets = [
      'IconButton',
      'FloatingActionButton',
      'GestureDetector',
      'InkWell'
    ];

    interactiveWidgets.forEach(widget => {
      const pattern = new RegExp(`${widget}\\s*\\(`, 'g');
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const snippet = code.substring(match.index, match.index + 200);
        if (!snippet.includes('semanticLabel:') && !snippet.includes('Semantics(')) {
          issues.push({
            severity: 'error',
            category: 'labels',
            description: `${widget} missing semantic label`,
            suggestion: `Add semanticLabel: 'description' to ${widget}`,
            line: this._getLineNumber(code, match.index)
          });
        }
      }
    });

    // Check for text contrast (heuristic)
    if (code.includes('Colors.grey') && code.includes('Colors.white')) {
      issues.push({
        severity: 'warning',
        category: 'contrast',
        description: 'Potential low contrast between grey and white',
        suggestion: 'Ensure text has sufficient contrast ratio (WCAG AA: 4.5:1)',
        line: null
      });
    }

    // Check for non-accessible form fields
    if (code.includes('TextField') || code.includes('TextFormField')) {
      const fieldPattern = /(?:TextField|TextFormField)\s*\(/g;
      let match;
      while ((match = fieldPattern.exec(code)) !== null) {
        const snippet = code.substring(match.index, match.index + 300);
        if (!snippet.includes('decoration:') || !snippet.includes('labelText:')) {
          issues.push({
            severity: 'warning',
            category: 'forms',
            description: 'Text field missing label',
            suggestion: 'Add labelText to TextField decoration for accessibility',
            line: this._getLineNumber(code, match.index)
          });
        }
      }
    }

    // Check for tap target size
    if (code.includes('GestureDetector') || code.includes('InkWell')) {
      issues.push({
        severity: 'info',
        category: 'tap_targets',
        description: 'Verify tap targets are at least 48x48 pixels',
        suggestion: 'Use Material Design minimum touch target size (48dp)',
        line: null
      });
    }

    return issues;
  }

  /**
   * AI-powered accessibility check
   * @private
   */
  async _checkWithAI(code, options) {
    try {
      const result = await this.aiClient.validate(code, {
        checkAccessibility: true,
        checkPerformance: false,
        checkSecurity: false
      });

      // Filter for accessibility issues only
      const accessibilityIssues = (result.issues || []).filter(issue =>
        issue.category === 'accessibility'
      );

      return {
        issues: accessibilityIssues,
        score: result.score || 0.7
      };

    } catch (error) {
      this.logger.warn(`⚠️  AI accessibility check failed: ${error.message}`);
      return { issues: [], score: 0.5 };
    }
  }

  /**
   * Merge local and AI issues
   * @private
   */
  _mergeIssues(local, ai) {
    const merged = [...local];

    // Add AI issues that aren't duplicates
    ai.forEach(aiIssue => {
      const duplicate = merged.some(localIssue =>
        localIssue.description === aiIssue.description
      );
      if (!duplicate) {
        merged.push(aiIssue);
      }
    });

    return merged;
  }

  /**
   * Calculate accessibility score (0-100)
   * @private
   */
  _calculateScore(issues) {
    if (issues.length === 0) return 1.0;

    let score = 1.0;

    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 0.15;
          break;
        case 'warning':
          score -= 0.08;
          break;
        case 'info':
          score -= 0.03;
          break;
      }
    });

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate summary
   * @private
   */
  _generateSummary(score, issues) {
    if (score >= 0.9) {
      return 'Excellent accessibility - minor improvements possible';
    } else if (score >= 0.7) {
      return 'Good accessibility - some improvements recommended';
    } else if (score >= 0.5) {
      return 'Fair accessibility - several issues need attention';
    } else {
      return 'Poor accessibility - significant improvements required';
    }
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations(issues) {
    const recommendations = [];

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (errorCount > 0) {
      recommendations.push(`Fix ${errorCount} critical accessibility error(s)`);
    }

    if (warningCount > 0) {
      recommendations.push(`Address ${warningCount} accessibility warning(s)`);
    }

    // Category-specific recommendations
    const categories = {};
    issues.forEach(issue => {
      categories[issue.category] = (categories[issue.category] || 0) + 1;
    });

    if (categories.semantics) {
      recommendations.push('Add Semantics widgets for screen reader support');
    }

    if (categories.labels) {
      recommendations.push('Add semantic labels to all interactive elements');
    }

    if (categories.contrast) {
      recommendations.push('Verify color contrast meets WCAG AA standards (4.5:1)');
    }

    if (categories.forms) {
      recommendations.push('Ensure all form fields have proper labels');
    }

    return recommendations;
  }

  /**
   * Get line number from index
   * @private
   */
  _getLineNumber(code, index) {
    const lines = code.substring(0, index).split('\n');
    return lines.length;
  }

  /**
   * Format accessibility report
   */
  formatReport(report) {
    let output = `\n♿ Accessibility Report\n`;
    output += `Score: ${(report.score * 100).toFixed(0)}%\n`;
    output += `Summary: ${report.summary}\n\n`;

    if (report.issues.length === 0) {
      output += '✓ No accessibility issues found\n';
      return output;
    }

    const byCategory = {};
    report.issues.forEach(issue => {
      if (!byCategory[issue.category]) {
        byCategory[issue.category] = [];
      }
      byCategory[issue.category].push(issue);
    });

    Object.entries(byCategory).forEach(([category, issues]) => {
      output += `📋 ${this._capitalizeFirst(category)} (${issues.length}):\n`;
      issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        output += `  ${icon} ${issue.description}\n`;
        output += `     ${issue.suggestion}\n`;
        if (issue.line) {
          output += `     Line: ${issue.line}\n`;
        }
      });
      output += '\n';
    });

    if (report.recommendations.length > 0) {
      output += '💡 Recommendations:\n';
      report.recommendations.forEach(rec => {
        output += `  • ${rec}\n`;
      });
    }

    return output;
  }

  /**
   * Capitalize first letter
   * @private
   */
  _capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }
}

module.exports = AccessibilityChecker;
