/**
 * Reporter - Terminal report formatting and visualization
 * Provides colorized output, tables, and charts for CLI
 */

class Reporter {
  constructor(options = {}) {
    this.stream = options.stream || process.stdout;
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m',
      bgRed: '\x1b[41m',
      bgGreen: '\x1b[42m',
      bgYellow: '\x1b[43m',
      bgBlue: '\x1b[44m'
    };
  }

  /**
   * Colorize text
   */
  colorize(text, color) {
    if (!this.colors[color]) {
      return text;
    }
    return `${this.colors[color]}${text}${this.colors.reset}`;
  }

  /**
   * Print section header
   */
  section(title) {
    this.stream.write('\n');
    this.stream.write(this.colorize('─'.repeat(60), 'cyan') + '\n');
    this.stream.write(this.colorize(`  ${title}`, 'bright') + '\n');
    this.stream.write(this.colorize('─'.repeat(60), 'cyan') + '\n');
  }

  /**
   * Print table
   */
  table(rows, options = {}) {
    const columnWidths = this.calculateColumnWidths(rows);
    const border = options.border !== false;

    if (border) {
      this.stream.write(this.renderTableBorder(columnWidths, 'top') + '\n');
    }

    rows.forEach((row, index) => {
      this.stream.write(this.renderTableRow(row, columnWidths));

      if (border && index === 0 && options.header !== false) {
        this.stream.write(this.renderTableBorder(columnWidths, 'middle') + '\n');
      }
    });

    if (border) {
      this.stream.write(this.renderTableBorder(columnWidths, 'bottom') + '\n');
    }
  }

  /**
   * Calculate column widths
   */
  calculateColumnWidths(rows) {
    const widths = [];

    rows.forEach(row => {
      row.forEach((cell, index) => {
        const cellStr = String(cell);
        widths[index] = Math.max(widths[index] || 0, cellStr.length);
      });
    });

    return widths;
  }

  /**
   * Render table row
   */
  renderTableRow(row, widths) {
    const cells = row.map((cell, index) => {
      const cellStr = String(cell);
      const padding = ' '.repeat(widths[index] - cellStr.length);
      return ` ${cellStr}${padding} `;
    });

    return '│' + cells.join('│') + '│\n';
  }

  /**
   * Render table border
   */
  renderTableBorder(widths, position) {
    const chars = {
      top: { left: '┌', middle: '┬', right: '┐', horizontal: '─' },
      middle: { left: '├', middle: '┼', right: '┤', horizontal: '─' },
      bottom: { left: '└', middle: '┴', right: '┘', horizontal: '─' }
    };

    const c = chars[position];
    const segments = widths.map(w => c.horizontal.repeat(w + 2));

    return c.left + segments.join(c.middle) + c.right;
  }

  /**
   * Print score box
   */
  scoreBox(score, grade, color = 'cyan') {
    const width = 40;
    const scoreText = `Score: ${score}/100`;
    const gradeText = `Grade: ${grade}`;

    this.stream.write('\n');
    this.stream.write(this.colorize('┌' + '─'.repeat(width - 2) + '┐', color) + '\n');

    // Score line
    const scorePadding = Math.floor((width - scoreText.length - 2) / 2);
    this.stream.write(
      this.colorize('│', color) +
      ' '.repeat(scorePadding) +
      this.colorize(scoreText, 'bright') +
      ' '.repeat(width - scorePadding - scoreText.length - 2) +
      this.colorize('│', color) +
      '\n'
    );

    // Grade line
    const gradePadding = Math.floor((width - gradeText.length - 2) / 2);
    this.stream.write(
      this.colorize('│', color) +
      ' '.repeat(gradePadding) +
      this.colorize(gradeText, 'bright') +
      ' '.repeat(width - gradePadding - gradeText.length - 2) +
      this.colorize('│', color) +
      '\n'
    );

    this.stream.write(this.colorize('└' + '─'.repeat(width - 2) + '┘', color) + '\n');
    this.stream.write('\n');
  }

  /**
   * Print ASCII bar chart
   */
  barChart(data, options = {}) {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = options.barWidth || 40;
    const showValues = options.showValues !== false;

    data.forEach(item => {
      const barLength = Math.floor((item.value / maxValue) * barWidth);
      const bar = '█'.repeat(barLength) + '░'.repeat(barWidth - barLength);

      const color = this.getBarColor(item.value, maxValue);
      const label = item.label.padEnd(20);
      const value = showValues ? ` ${item.value}` : '';

      this.stream.write(
        `  ${label} ${this.colorize(bar, color)}${value}\n`
      );
    });
  }

  /**
   * Get bar color based on value
   */
  getBarColor(value, max) {
    const percentage = (value / max) * 100;

    if (percentage >= 85) return 'green';
    if (percentage >= 70) return 'yellow';
    return 'red';
  }

  /**
   * Print validation summary
   */
  validationSummary(results) {
    const issues = {
      error: results.issues.filter(i => i.severity === 'error').length,
      warning: results.issues.filter(i => i.severity === 'warning').length,
      info: results.issues.filter(i => i.severity === 'info').length
    };

    this.table([
      ['Overall Score', `${results.summary.overallScore}/100`, this.getGrade(results.summary.overallScore)],
      ['Code Quality', `${results.summary.codeScore}/100`, this.getGrade(results.summary.codeScore)],
      ['Security', `${results.summary.securityScore}/100`, this.getGrade(results.summary.securityScore)],
      ['Performance', `${results.summary.performanceScore}/100`, this.getGrade(results.summary.performanceScore)],
      ['Accessibility', `${results.summary.accessibilityScore}/100`, this.getGrade(results.summary.accessibilityScore)],
      ['', '', ''],
      ['Errors', issues.error, issues.error === 0 ? '✅' : '❌'],
      ['Warnings', issues.warning, issues.warning === 0 ? '✅' : '⚠️'],
      ['Info', issues.info, 'ℹ️']
    ]);
  }

  /**
   * Print issue list
   */
  issueList(issues, options = {}) {
    const maxIssues = options.maxIssues || 10;
    const grouped = this.groupIssuesBySeverity(issues);

    // Errors
    if (grouped.error.length > 0) {
      this.stream.write(this.colorize('\n  Errors:\n', 'red'));
      grouped.error.slice(0, maxIssues).forEach(issue => {
        this.printIssue(issue, 'error');
      });

      if (grouped.error.length > maxIssues) {
        this.stream.write(
          this.colorize(`    ... and ${grouped.error.length - maxIssues} more errors\n`, 'dim')
        );
      }
    }

    // Warnings
    if (grouped.warning.length > 0) {
      this.stream.write(this.colorize('\n  Warnings:\n', 'yellow'));
      grouped.warning.slice(0, maxIssues).forEach(issue => {
        this.printIssue(issue, 'warning');
      });

      if (grouped.warning.length > maxIssues) {
        this.stream.write(
          this.colorize(`    ... and ${grouped.warning.length - maxIssues} more warnings\n`, 'dim')
        );
      }
    }
  }

  /**
   * Print single issue
   */
  printIssue(issue, severity) {
    const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
    const color = severity === 'error' ? 'red' : severity === 'warning' ? 'yellow' : 'cyan';

    this.stream.write(`    ${icon} `);
    this.stream.write(this.colorize(`[${issue.category}]`, color));
    this.stream.write(` ${issue.message}\n`);
    this.stream.write(this.colorize(`       ${issue.file}:${issue.line || '?'}\n`, 'dim'));

    if (issue.fixable) {
      this.stream.write(this.colorize('       💡 Auto-fixable with --fix\n', 'dim'));
    }
  }

  /**
   * Group issues by severity
   */
  groupIssuesBySeverity(issues) {
    return {
      error: issues.filter(i => i.severity === 'error'),
      warning: issues.filter(i => i.severity === 'warning'),
      info: issues.filter(i => i.severity === 'info')
    };
  }

  /**
   * Print recommendations
   */
  recommendations(recs) {
    this.section('Recommendations');

    recs.forEach((rec, index) => {
      this.stream.write(`  ${index + 1}. ${rec}\n`);
    });

    this.stream.write('\n');
  }

  /**
   * Print success message
   */
  success(message) {
    this.stream.write(this.colorize(`✅ ${message}`, 'green') + '\n');
  }

  /**
   * Print error message
   */
  error(message) {
    this.stream.write(this.colorize(`❌ ${message}`, 'red') + '\n');
  }

  /**
   * Print warning message
   */
  warn(message) {
    this.stream.write(this.colorize(`⚠️  ${message}`, 'yellow') + '\n');
  }

  /**
   * Print info message
   */
  info(message) {
    this.stream.write(this.colorize(`ℹ️  ${message}`, 'cyan') + '\n');
  }

  /**
   * Print box
   */
  box(content, options = {}) {
    const lines = content.split('\n');
    const width = Math.max(...lines.map(l => l.length)) + 4;
    const color = options.color || 'cyan';

    this.stream.write('\n');
    this.stream.write(this.colorize('┌' + '─'.repeat(width - 2) + '┐', color) + '\n');

    lines.forEach(line => {
      const padding = ' '.repeat(width - line.length - 4);
      this.stream.write(
        this.colorize('│', color) +
        ` ${line}${padding} ` +
        this.colorize('│', color) +
        '\n'
      );
    });

    this.stream.write(this.colorize('└' + '─'.repeat(width - 2) + '┘', color) + '\n');
    this.stream.write('\n');
  }

  /**
   * Get grade from score
   */
  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Format duration
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

module.exports = Reporter;
