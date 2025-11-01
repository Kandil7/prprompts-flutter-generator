/**
 * ReportGenerator - Generates validation reports in multiple formats
 *
 * Formats:
 * - JSON: Machine-readable format
 * - HTML: Interactive web view with charts and styling
 * - Markdown: Documentation format for README/docs
 *
 * Features:
 * - Severity breakdown charts
 * - Actionable fix suggestions
 * - Before/after examples
 * - Color-coded issues
 */

const logger = require('../../utils/logger');

class ReportGenerator {
  constructor(config = {}) {
    this.config = {
      includeCharts: true,
      includeCodeSnippets: true,
      groupByValidator: true,
      ...config
    };
  }

  /**
   * Generate HTML report with styling and charts
   */
  generateHTML(results) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validation Report - ${this._getProjectName(results.projectPath)}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #2c3e50; margin-bottom: 10px; }
        h2 { color: #34495e; margin: 30px 0 15px; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        h3 { color: #555; margin: 20px 0 10px; }

        .header { text-align: center; margin-bottom: 40px; }
        .score {
            font-size: 72px;
            font-weight: bold;
            margin: 20px 0;
            color: ${this._getScoreColor(results.overallScore)};
        }
        .grade {
            font-size: 48px;
            font-weight: bold;
            color: ${this._getScoreColor(results.overallScore)};
        }
        .status {
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            background: ${results.passed ? '#27ae60' : '#e74c3c'};
            color: white;
            margin-top: 10px;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .metric {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3498db;
        }
        .metric-value {
            font-size: 36px;
            font-weight: bold;
            color: #2c3e50;
        }
        .metric-label {
            color: #7f8c8d;
            margin-top: 5px;
            font-size: 14px;
        }

        .validators {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .validator {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
        }
        .validator-name {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .validator-score {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        .score-bar {
            height: 8px;
            background: #ecf0f1;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 10px;
        }
        .score-fill {
            height: 100%;
            transition: width 0.3s;
        }

        .issues {
            margin: 20px 0;
        }
        .issue {
            background: white;
            border-left: 4px solid #95a5a6;
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .issue.error { border-left-color: #e74c3c; background: #fff5f5; }
        .issue.warning { border-left-color: #f39c12; background: #fffbf0; }
        .issue.info { border-left-color: #3498db; background: #f0f8ff; }

        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .severity-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .severity-badge.error { background: #e74c3c; color: white; }
        .severity-badge.warning { background: #f39c12; color: white; }
        .severity-badge.info { background: #3498db; color: white; }

        .issue-message {
            font-weight: 500;
            margin-bottom: 8px;
        }
        .issue-suggestion {
            color: #27ae60;
            font-size: 14px;
            margin-top: 8px;
        }
        .issue-location {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 5px;
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }

        .recommendations {
            background: #fff;
            border: 2px solid #3498db;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .recommendation {
            padding: 15px;
            margin: 10px 0;
            border-radius: 4px;
            background: #f8f9fa;
        }
        .recommendation.critical { background: #ffe5e5; border-left: 4px solid #e74c3c; }
        .recommendation.high { background: #fff5e5; border-left: 4px solid #f39c12; }
        .recommendation.medium { background: #e5f5ff; border-left: 4px solid #3498db; }
        .recommendation.low { background: #f0f0f0; border-left: 4px solid #95a5a6; }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #7f8c8d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Validation Report</h1>
            <p>${results.projectPath}</p>
            <div class="score">${results.overallScore}</div>
            <div class="grade">Grade: ${results.grade}</div>
            <div class="status">${results.passed ? 'PASSED ✓' : 'FAILED ✗'}</div>
            <p style="margin-top: 10px; color: #7f8c8d;">Generated: ${results.timestamp}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value">${results.summary.totalErrors}</div>
                <div class="metric-label">Errors</div>
            </div>
            <div class="metric">
                <div class="metric-value">${results.summary.totalWarnings}</div>
                <div class="metric-label">Warnings</div>
            </div>
            <div class="metric">
                <div class="metric-value">${results.summary.totalInfo}</div>
                <div class="metric-label">Info</div>
            </div>
            <div class="metric">
                <div class="metric-value">${results.summary.filesValidated || 'N/A'}</div>
                <div class="metric-label">Files Validated</div>
            </div>
        </div>

        <h2>Validator Scores</h2>
        <div class="validators">
            ${this._generateValidatorCards(results.validators)}
        </div>

        ${results.recommendations && results.recommendations.length > 0 ? this._generateRecommendationsHTML(results.recommendations) : ''}

        <h2>Issues (${results.issues.length})</h2>
        <div class="issues">
            ${this._generateIssuesHTML(results.issues)}
        </div>

        <div class="footer">
            <p>Generated by PRPROMPTS Flutter Generator - Validation System</p>
            <p>Duration: ${results.duration || 'N/A'}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate Markdown report
   */
  generateMarkdown(results) {
    const lines = [];

    // Header
    lines.push(`# Validation Report`);
    lines.push(`**Project:** ${results.projectPath}`);
    lines.push(`**Generated:** ${results.timestamp}`);
    lines.push(`**Duration:** ${results.duration || 'N/A'}`);
    lines.push('');

    // Overall Score
    lines.push(`## Overall Score: ${results.overallScore}/100 (Grade: ${results.grade})`);
    lines.push(`**Status:** ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');

    // Summary
    lines.push(`## Summary`);
    lines.push(`- **Errors:** ${results.summary.totalErrors}`);
    lines.push(`- **Warnings:** ${results.summary.totalWarnings}`);
    lines.push(`- **Info:** ${results.summary.totalInfo}`);
    lines.push(`- **Files Validated:** ${results.summary.filesValidated || 'N/A'}`);
    if (results.summary.criticalIssues > 0) {
      lines.push(`- **Critical Issues:** ${results.summary.criticalIssues} ⚠️`);
    }
    lines.push('');

    // Validator Scores
    lines.push(`## Validator Scores`);
    lines.push('');
    for (const [name, validator] of Object.entries(results.validators)) {
      if (validator && validator.score !== undefined) {
        const emoji = this._getScoreEmoji(validator.score);
        lines.push(`- **${this._capitalize(name)}:** ${validator.score}/100 ${emoji}`);
        lines.push(`  - Errors: ${validator.errors.length}`);
        lines.push(`  - Warnings: ${validator.warnings.length}`);
        lines.push(`  - Info: ${validator.info.length}`);
      }
    }
    lines.push('');

    // Recommendations
    if (results.recommendations && results.recommendations.length > 0) {
      lines.push(`## Recommendations`);
      lines.push('');
      for (const rec of results.recommendations) {
        const emoji = rec.priority === 'critical' ? '🚨' :
                     rec.priority === 'high' ? '⚠️' :
                     rec.priority === 'medium' ? '💡' : 'ℹ️';
        lines.push(`### ${emoji} ${rec.category} (${rec.priority.toUpperCase()})`);
        lines.push(`**Issue:** ${rec.message}`);
        lines.push(`**Action:** ${rec.action}`);
        lines.push('');
      }
    }

    // Issues by Severity
    const errorIssues = results.issues.filter(i => i.severity === 'error');
    const warningIssues = results.issues.filter(i => i.severity === 'warning');
    const infoIssues = results.issues.filter(i => i.severity === 'info');

    if (errorIssues.length > 0) {
      lines.push(`## ❌ Errors (${errorIssues.length})`);
      lines.push('');
      for (const issue of errorIssues.slice(0, 20)) {
        lines.push(`### ${issue.message}`);
        if (issue.path) lines.push(`**File:** \`${issue.path}\``);
        if (issue.line) lines.push(`**Line:** ${issue.line}`);
        if (issue.suggestion) lines.push(`**Fix:** ${issue.suggestion}`);
        if (issue.code) lines.push(`\`\`\`dart\n${issue.code}\n\`\`\``);
        lines.push('');
      }
      if (errorIssues.length > 20) {
        lines.push(`*... and ${errorIssues.length - 20} more errors*`);
        lines.push('');
      }
    }

    if (warningIssues.length > 0) {
      lines.push(`## ⚠️ Warnings (${warningIssues.length})`);
      lines.push('');
      for (const issue of warningIssues.slice(0, 15)) {
        lines.push(`- **${issue.message}**`);
        if (issue.suggestion) lines.push(`  - Fix: ${issue.suggestion}`);
        if (issue.path) lines.push(`  - File: \`${issue.path}\``);
      }
      if (warningIssues.length > 15) {
        lines.push(`- *... and ${warningIssues.length - 15} more warnings*`);
      }
      lines.push('');
    }

    if (infoIssues.length > 0) {
      lines.push(`## ℹ️ Info (${infoIssues.length})`);
      lines.push('');
      lines.push(`<details>`);
      lines.push(`<summary>Show info messages</summary>`);
      lines.push('');
      for (const issue of infoIssues) {
        lines.push(`- ${issue.message}`);
        if (issue.suggestion) lines.push(`  - ${issue.suggestion}`);
      }
      lines.push('');
      lines.push(`</details>`);
      lines.push('');
    }

    // Footer
    lines.push(`---`);
    lines.push(`*Generated by PRPROMPTS Flutter Generator - Validation System*`);

    return lines.join('\n');
  }

  /**
   * Helper methods
   */

  _getProjectName(projectPath) {
    return projectPath.split(/[/\\]/).pop() || 'Unknown Project';
  }

  _getScoreColor(score) {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#2ecc71';
    if (score >= 70) return '#f39c12';
    if (score >= 60) return '#e67e22';
    return '#e74c3c';
  }

  _getScoreEmoji(score) {
    if (score >= 90) return '🎯';
    if (score >= 80) return '✅';
    if (score >= 70) return '⚠️';
    if (score >= 60) return '❌';
    return '🚨';
  }

  _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  _generateValidatorCards(validators) {
    const cards = [];

    for (const [name, validator] of Object.entries(validators)) {
      if (!validator || validator.score === undefined) continue;

      const score = validator.score;
      const color = this._getScoreColor(score);

      cards.push(`
        <div class="validator">
          <div class="validator-name">${this._capitalize(name)}</div>
          <div class="validator-score" style="color: ${color};">${score}</div>
          <div class="score-bar">
            <div class="score-fill" style="width: ${score}%; background: ${color};"></div>
          </div>
          <div style="margin-top: 10px; font-size: 14px; color: #7f8c8d;">
            ${validator.errors.length} errors, ${validator.warnings.length} warnings
          </div>
        </div>
      `);
    }

    return cards.join('');
  }

  _generateRecommendationsHTML(recommendations) {
    let html = '<h2>🎯 Recommendations</h2><div class="recommendations">';

    for (const rec of recommendations) {
      html += `
        <div class="recommendation ${rec.priority}">
          <h3>${rec.category}</h3>
          <p><strong>Issue:</strong> ${rec.message}</p>
          <p><strong>Action:</strong> ${rec.action}</p>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  _generateIssuesHTML(issues) {
    if (issues.length === 0) {
      return '<p style="text-align: center; color: #27ae60; padding: 40px;">No issues found! 🎉</p>';
    }

    // Group by validator
    const groupedIssues = {};
    for (const issue of issues) {
      const validator = issue.validator || 'Unknown';
      if (!groupedIssues[validator]) {
        groupedIssues[validator] = [];
      }
      groupedIssues[validator].push(issue);
    }

    let html = '';

    for (const [validator, validatorIssues] of Object.entries(groupedIssues)) {
      html += `<h3>${validator}</h3>`;

      for (const issue of validatorIssues) {
        html += `
          <div class="issue ${issue.severity}">
            <div class="issue-header">
              <span class="issue-message">${issue.message}</span>
              <span class="severity-badge ${issue.severity}">${issue.severity}</span>
            </div>
            ${issue.suggestion ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>` : ''}
            ${issue.path || issue.line ? `
              <div class="issue-location">
                ${issue.path ? `📁 ${issue.path}` : ''}
                ${issue.line ? ` (line ${issue.line})` : ''}
              </div>
            ` : ''}
            ${issue.code ? `<pre><code>${this._escapeHtml(issue.code)}</code></pre>` : ''}
          </div>
        `;
      }
    }

    return html;
  }

  _escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = ReportGenerator;
