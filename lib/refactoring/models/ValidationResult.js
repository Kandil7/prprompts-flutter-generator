/**
 * ValidationResult.js
 * Represents validation results with severity levels, messages, and suggestions
 *
 * Used to track validation issues during React to Flutter conversion
 */

/**
 * Validation severity levels
 * @enum {string}
 */
const ValidationSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success',
};

/**
 * Validation categories
 * @enum {string}
 */
const ValidationCategory = {
  SYNTAX: 'syntax',
  TYPE: 'type',
  STRUCTURE: 'structure',
  NAMING: 'naming',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  ACCESSIBILITY: 'accessibility',
  BEST_PRACTICE: 'best_practice',
};

/**
 * Represents a single validation issue
 */
class ValidationIssue {
  /**
   * @param {Object} options
   * @param {string} options.severity - Severity level
   * @param {string} options.message - Issue message
   * @param {string} [options.category] - Issue category
   * @param {string} [options.code] - Error/warning code
   * @param {string} [options.file] - File path
   * @param {number} [options.line] - Line number
   * @param {number} [options.column] - Column number
   * @param {string} [options.snippet] - Code snippet
   * @param {string[]} [options.suggestions=[]] - Suggested fixes
   * @param {string} [options.documentationUrl] - Link to documentation
   */
  constructor({
    severity,
    message,
    category = null,
    code = null,
    file = null,
    line = null,
    column = null,
    snippet = null,
    suggestions = [],
    documentationUrl = null,
  }) {
    this._validate({ severity, message });

    this.severity = severity;
    this.message = message;
    this.category = category;
    this.code = code;
    this.file = file;
    this.line = line;
    this.column = column;
    this.snippet = snippet;
    this.suggestions = suggestions;
    this.documentationUrl = documentationUrl;
    this.timestamp = new Date().toISOString();
  }

  _validate({ severity, message }) {
    if (!severity || !Object.values(ValidationSeverity).includes(severity)) {
      throw new Error(`ValidationIssue: severity must be one of ${Object.values(ValidationSeverity).join(', ')}`);
    }
    if (!message || typeof message !== 'string') {
      throw new Error('ValidationIssue: message is required and must be a string');
    }
  }

  /**
   * Get location string (file:line:column)
   * @returns {string|null}
   */
  getLocation() {
    if (!this.file) return null;

    let location = this.file;
    if (this.line !== null) {
      location += `:${this.line}`;
      if (this.column !== null) {
        location += `:${this.column}`;
      }
    }
    return location;
  }

  /**
   * Check if issue is an error
   * @returns {boolean}
   */
  isError() {
    return this.severity === ValidationSeverity.ERROR;
  }

  /**
   * Check if issue is a warning
   * @returns {boolean}
   */
  isWarning() {
    return this.severity === ValidationSeverity.WARNING;
  }

  /**
   * Check if issue is informational
   * @returns {boolean}
   */
  isInfo() {
    return this.severity === ValidationSeverity.INFO;
  }

  /**
   * Format issue as string
   * @param {boolean} [includeSnippet=false] - Include code snippet
   * @returns {string}
   */
  toString(includeSnippet = false) {
    let str = `[${this.severity.toUpperCase()}]`;

    if (this.code) {
      str += ` ${this.code}`;
    }

    if (this.category) {
      str += ` [${this.category}]`;
    }

    const location = this.getLocation();
    if (location) {
      str += ` ${location}`;
    }

    str += `: ${this.message}`;

    if (this.suggestions.length > 0) {
      str += '\n  Suggestions:';
      this.suggestions.forEach(suggestion => {
        str += `\n    - ${suggestion}`;
      });
    }

    if (includeSnippet && this.snippet) {
      str += `\n  Code:\n${this.snippet.split('\n').map(l => `    ${l}`).join('\n')}`;
    }

    if (this.documentationUrl) {
      str += `\n  Docs: ${this.documentationUrl}`;
    }

    return str;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      severity: this.severity,
      message: this.message,
      category: this.category,
      code: this.code,
      file: this.file,
      line: this.line,
      column: this.column,
      snippet: this.snippet,
      suggestions: this.suggestions,
      documentationUrl: this.documentationUrl,
      timestamp: this.timestamp,
    };
  }

  /**
   * Create from JSON
   * @param {Object} json
   * @returns {ValidationIssue}
   */
  static fromJSON(json) {
    const issue = new ValidationIssue(json);
    issue.timestamp = json.timestamp;
    return issue;
  }
}

/**
 * Represents the complete validation result
 */
class ValidationResult {
  /**
   * @param {Object} options
   * @param {boolean} [options.valid=true] - Whether validation passed
   * @param {string} [options.target] - Validation target (file, component, etc.)
   * @param {ValidationIssue[]} [options.issues=[]] - Validation issues
   * @param {Object} [options.metadata={}] - Additional metadata
   */
  constructor({
    valid = true,
    target = null,
    issues = [],
    errors = [],
    warnings = [],
    info = [],
    metadata = {},
  } = {}) {
    this.valid = valid;
    this.target = target;
    this.issues = issues.map(i => i instanceof ValidationIssue ? i : new ValidationIssue(i));

    // Support legacy/alternative input format
    if (errors.length > 0) {
      errors.forEach(e => this.addError(e.message || e, e));
    }
    if (warnings.length > 0) {
      warnings.forEach(w => this.addWarning(w.message || w, w));
    }
    if (info.length > 0) {
      info.forEach(i => this.addInfo(i.message || i, i));
    }

    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  get errors() {
    return this.getErrors();
  }

  get warnings() {
    return this.getWarnings();
  }

  get info() {
    return this.getInfos();
  }

  /**
   * Add a validation issue
   * @param {ValidationIssue|Object} issue
   */
  addIssue(issue) {
    const validationIssue = issue instanceof ValidationIssue ? issue : new ValidationIssue(issue);
    this.issues.push(validationIssue);

    // Update valid flag if error is added
    if (validationIssue.isError()) {
      this.valid = false;
    }
  }

  /**
   * Add an error
   * @param {string} message
   * @param {Object} options - Additional issue options
   */
  addError(message, options = {}) {
    this.addIssue({
      severity: ValidationSeverity.ERROR,
      message,
      ...options,
    });
  }

  /**
   * Add a warning
   * @param {string} message
   * @param {Object} options - Additional issue options
   */
  addWarning(message, options = {}) {
    this.addIssue({
      severity: ValidationSeverity.WARNING,
      message,
      ...options,
    });
  }

  /**
   * Add an info message
   * @param {string} message
   * @param {Object} options - Additional issue options
   */
  addInfo(message, options = {}) {
    this.addIssue({
      severity: ValidationSeverity.INFO,
      message,
      ...options,
    });
  }

  /**
   * Add a success message
   * @param {string} message
   * @param {Object} options - Additional issue options
   */
  addSuccess(message, options = {}) {
    this.addIssue({
      severity: ValidationSeverity.SUCCESS,
      message,
      ...options,
    });
  }

  /**
   * Get all errors
   * @returns {ValidationIssue[]}
   */
  getErrors() {
    return this.issues.filter(i => i.isError());
  }

  /**
   * Get all warnings
   * @returns {ValidationIssue[]}
   */
  getWarnings() {
    return this.issues.filter(i => i.isWarning());
  }

  /**
   * Get all info messages
   * @returns {ValidationIssue[]}
   */
  getInfos() {
    return this.issues.filter(i => i.isInfo());
  }

  /**
   * Get issues by category
   * @param {string} category
   * @returns {ValidationIssue[]}
   */
  getIssuesByCategory(category) {
    return this.issues.filter(i => i.category === category);
  }

  /**
   * Get issues by severity
   * @param {string} severity
   * @returns {ValidationIssue[]}
   */
  getIssuesBySeverity(severity) {
    return this.issues.filter(i => i.severity === severity);
  }

  /**
   * Check if result has errors
   * @returns {boolean}
   */
  hasErrors() {
    return this.getErrors().length > 0;
  }

  /**
   * Check if result has warnings
   * @returns {boolean}
   */
  hasWarnings() {
    return this.getWarnings().length > 0;
  }

  /**
   * Check if result has any issues
   * @returns {boolean}
   */
  hasIssues() {
    return this.issues.length > 0;
  }

  /**
   * Get issue count by severity
   * @returns {Object}
   */
  getIssueCounts() {
    return {
      errors: this.getErrors().length,
      warnings: this.getWarnings().length,
      infos: this.getInfos().length,
      total: this.issues.length,
    };
  }

  /**
   * Get validation score (0-100)
   * @returns {number}
   */
  getScore() {
    const counts = this.getIssueCounts();

    if (counts.total === 0) return 100;

    // Calculate score: errors = -10, warnings = -5, infos = -1
    const deductions = (counts.errors * 10) + (counts.warnings * 5) + (counts.infos * 1);
    const score = Math.max(0, 100 - deductions);

    return Math.round(score);
  }

  /**
   * Get validation grade (A-F)
   * @returns {string}
   */
  getGrade() {
    const score = this.getScore();

    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Format result as string
   * @param {boolean} [verbose=false] - Include all issue details
   * @returns {string}
   */
  toString(verbose = false) {
    const counts = this.getIssueCounts();
    const score = this.getScore();
    const grade = this.getGrade();

    let str = `Validation Result`;
    if (this.target) {
      str += ` for ${this.target}`;
    }
    str += `:\n`;

    str += `  Status: ${this.valid ? 'PASS' : 'FAIL'}\n`;
    str += `  Score: ${score}/100 (Grade: ${grade})\n`;
    str += `  Errors: ${counts.errors}\n`;
    str += `  Warnings: ${counts.warnings}\n`;
    str += `  Info: ${counts.infos}\n`;

    if (verbose && this.issues.length > 0) {
      str += `\nIssues:\n`;
      this.issues.forEach(issue => {
        str += issue.toString(true) + '\n\n';
      });
    }

    return str;
  }

  /**
   * Format result as summary
   * @returns {string}
   */
  getSummary() {
    return this.toString(false);
  }

  /**
   * Format result as detailed report
   * @returns {string}
   */
  getDetailedReport() {
    return this.toString(true);
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      valid: this.valid,
      target: this.target,
      issues: this.issues.map(i => i.toJSON()),
      metadata: this.metadata,
      timestamp: this.timestamp,
      score: this.getScore(),
      grade: this.getGrade(),
      counts: this.getIssueCounts(),
    };
  }

  /**
   * Create from JSON
   * @param {Object} json
   * @returns {ValidationResult}
   */
  static fromJSON(json) {
    const result = new ValidationResult({
      valid: json.valid,
      target: json.target,
      issues: json.issues || [],
      metadata: json.metadata || {},
    });
    result.timestamp = json.timestamp;
    return result;
  }

  /**
   * Merge multiple validation results
   * @param {ValidationResult[]} results
   * @returns {ValidationResult}
   */
  static merge(results) {
    const merged = new ValidationResult({
      valid: results.every(r => r.valid),
      target: 'merged',
    });

    results.forEach(result => {
      result.issues.forEach(issue => merged.addIssue(issue));
    });

    return merged;
  }

  /**
   * Create a passing result
   * @param {string} target
   * @returns {ValidationResult}
   */
  static createPass(target = null) {
    const result = new ValidationResult({ valid: true, target });
    result.addSuccess('Validation passed');
    return result;
  }

  /**
   * Create a failing result
   * @param {string} target
   * @param {string} message
   * @returns {ValidationResult}
   */
  static createFail(target = null, message = 'Validation failed') {
    const result = new ValidationResult({ valid: false, target });
    result.addError(message);
    return result;
  }
}

module.exports = {
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  ValidationCategory,
};
