/**
 * ValidationOrchestrator - Orchestrates all validators and generates comprehensive report
 *
 * Runs validators:
 * - CodeValidator
 * - ArchitectureValidator
 * - SecurityValidator
 * - PerformanceValidator
 * - AccessibilityValidator
 * - StateValidator
 * - PropsValidator
 * - ApiValidator
 *
 * Outputs:
 * - Overall score (0-100)
 * - Comprehensive report (JSON/HTML/Markdown)
 * - Categorized issues by severity
 * - Actionable fix suggestions
 */

const CodeValidator = require('./CodeValidator');
const ArchitectureValidator = require('./ArchitectureValidator');
const SecurityValidator = require('./SecurityValidator');
const PerformanceValidator = require('./PerformanceValidator');
const AccessibilityValidator = require('./AccessibilityValidator');
const { ValidationResult } = require('../models/ValidationResult');
const ReportGenerator = require('./ReportGenerator');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ValidationOrchestrator {
  constructor(config = {}) {
    this.config = {
      enabledValidators: {
        code: true,
        architecture: true,
        security: true,
        performance: true,
        accessibility: true,
        state: false,    // Optional: requires React comparison
        props: false,    // Optional: requires React comparison
        api: false       // Optional: requires React comparison
      },
      thresholds: {
        minimumScore: 80,
        errorTolerance: 0,
        warningTolerance: 10
      },
      reportFormats: ['json', 'html', 'markdown'],
      outputPath: './validation-reports',
      ...config
    };

    // Initialize validators
    this.validators = {
      code: new CodeValidator(config.code),
      architecture: new ArchitectureValidator(config.architecture),
      security: new SecurityValidator(config.security),
      performance: new PerformanceValidator(config.performance),
      accessibility: new AccessibilityValidator(config.accessibility)
    };

    this.reportGenerator = new ReportGenerator(config.reportGenerator);
  }

  /**
   * Validate entire Flutter project
   * @param {string} projectPath - Path to Flutter project root
   * @param {object} options - Validation options
   * @returns {Promise<object>} Comprehensive validation report
   */
  async validateProject(projectPath, options = {}) {
    logger.info(`Starting comprehensive validation for: ${projectPath}`);

    const startTime = Date.now();
    const results = {
      projectPath,
      timestamp: new Date().toISOString(),
      validators: {},
      overallScore: 0,
      grade: 'F',
      passed: false,
      summary: {
        totalErrors: 0,
        totalWarnings: 0,
        totalInfo: 0,
        filesValidated: 0,
        criticalIssues: 0
      },
      issues: [],
      recommendations: []
    };

    try {
      // 1. Validate architecture (if enabled)
      if (this.config.enabledValidators.architecture) {
        logger.info('Running architecture validation...');
        results.validators.architecture = this.validators.architecture.validate(projectPath);
        this._aggregateResult(results, results.validators.architecture);
      }

      // 2. Validate security (if enabled)
      if (this.config.enabledValidators.security) {
        logger.info('Running security validation...');
        results.validators.security = this.validators.security.validate(projectPath);
        this._aggregateResult(results, results.validators.security);
      }

      // 3. Validate code files
      if (this.config.enabledValidators.code || this.config.enabledValidators.performance || this.config.enabledValidators.accessibility) {
        logger.info('Running code validation...');
        const codeResults = await this._validateCodeFiles(projectPath);
        results.validators = { ...results.validators, ...codeResults.validators };
        results.summary.filesValidated = codeResults.filesValidated;

        // Aggregate code validation results
        if (codeResults.code) this._aggregateResult(results, codeResults.code);
        if (codeResults.performance) this._aggregateResult(results, codeResults.performance);
        if (codeResults.accessibility) this._aggregateResult(results, codeResults.accessibility);
      }

      // 4. Calculate overall score
      results.overallScore = this._calculateOverallScore(results.validators);
      results.grade = this._calculateGrade(results.overallScore);
      results.passed = this._checkThresholds(results);

      // 5. Generate recommendations
      results.recommendations = this._generateRecommendations(results);

      // 6. Calculate validation duration
      results.duration = `${((Date.now() - startTime) / 1000).toFixed(2)}s`;

      // 7. Generate reports
      if (this.config.reportFormats && this.config.reportFormats.length > 0) {
        await this._generateReports(results);
      }

      logger.info(`Validation complete. Score: ${results.overallScore}/100 (${results.grade})`);

      return results;

    } catch (error) {
      logger.error('Validation orchestration failed:', error);
      throw error;
    }
  }

  /**
   * Validate individual Dart file
   * @param {string} filePath - Path to Dart file
   * @param {string} code - Optional: Dart source code
   * @returns {object} Validation results
   */
  async validateFile(filePath, code = null) {
    logger.info(`Validating file: ${filePath}`);

    if (!code) {
      code = fs.readFileSync(filePath, 'utf-8');
    }

    const results = {
      filePath,
      timestamp: new Date().toISOString(),
      validators: {},
      overallScore: 0,
      grade: 'F',
      passed: false,
      issues: []
    };

    // Run enabled validators
    if (this.config.enabledValidators.code) {
      results.validators.code = this.validators.code.validate(filePath, code);
      this._aggregateResult(results, results.validators.code);
    }

    if (this.config.enabledValidators.security) {
      results.validators.security = this.validators.security.validate(filePath, code);
      this._aggregateResult(results, results.validators.security);
    }

    if (this.config.enabledValidators.performance) {
      results.validators.performance = this.validators.performance.validate(filePath, code);
      this._aggregateResult(results, results.validators.performance);
    }

    if (this.config.enabledValidators.accessibility) {
      results.validators.accessibility = this.validators.accessibility.validate(filePath, code);
      this._aggregateResult(results, results.validators.accessibility);
    }

    // Calculate scores
    results.overallScore = this._calculateOverallScore(results.validators);
    results.grade = this._calculateGrade(results.overallScore);
    results.passed = results.overallScore >= this.config.thresholds.minimumScore;

    return results;
  }

  /**
   * Validate all Dart files in project
   */
  async _validateCodeFiles(projectPath) {
    const libPath = path.join(projectPath, 'lib');
    const dartFiles = [];

    // Find all Dart files
    this._findDartFiles(libPath, dartFiles);

    logger.info(`Found ${dartFiles.length} Dart files to validate`);

    const aggregatedResults = {
      code: new ValidationResult({ isValid: true, score: 100, errors: [], warnings: [], info: [], target: projectPath, validator: 'CodeValidator' }),
      performance: new ValidationResult({ isValid: true, score: 100, errors: [], warnings: [], info: [], target: projectPath, validator: 'PerformanceValidator' }),
      accessibility: new ValidationResult({ isValid: true, score: 100, errors: [], warnings: [], info: [], target: projectPath, validator: 'AccessibilityValidator' }),
      filesValidated: dartFiles.length
    };

    for (const filePath of dartFiles) {
      try {
        const code = fs.readFileSync(filePath, 'utf-8');

        // Run code validator
        if (this.config.enabledValidators.code) {
          const result = this.validators.code.validate(filePath, code);
          this._mergeResults(aggregatedResults.code, result);
        }

        // Run performance validator
        if (this.config.enabledValidators.performance) {
          const result = this.validators.performance.validate(filePath, code);
          this._mergeResults(aggregatedResults.performance, result);
        }

        // Run accessibility validator
        if (this.config.enabledValidators.accessibility) {
          const result = this.validators.accessibility.validate(filePath, code);
          this._mergeResults(aggregatedResults.accessibility, result);
        }

      } catch (error) {
        logger.error(`Failed to validate ${filePath}:`, error);
      }
    }

    // Recalculate average scores
    aggregatedResults.code.score = this._calculateAverageScore(aggregatedResults.code);
    aggregatedResults.performance.score = this._calculateAverageScore(aggregatedResults.performance);
    aggregatedResults.accessibility.score = this._calculateAverageScore(aggregatedResults.accessibility);

    return {
      validators: {
        code: aggregatedResults.code,
        performance: aggregatedResults.performance,
        accessibility: aggregatedResults.accessibility
      },
      filesValidated: dartFiles.length
    };
  }

  /**
   * Recursively find all Dart files
   */
  _findDartFiles(dirPath, results) {
    if (!fs.existsSync(dirPath)) return;

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip generated files
        if (entry.name === 'generated' || entry.name.endsWith('.g.dart')) continue;
        this._findDartFiles(fullPath, results);
      } else if (entry.name.endsWith('.dart')) {
        results.push(fullPath);
      }
    }
  }

  /**
   * Merge validation results
   */
  _mergeResults(target, source) {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.info.push(...source.info);
    target.isValid = target.isValid && source.isValid;
  }

  /**
   * Calculate average score from merged results
   */
  _calculateAverageScore(result) {
    const errorPenalty = result.errors.length * 5;
    const warningPenalty = result.warnings.length * 2;
    return Math.max(0, Math.min(100, 100 - errorPenalty - warningPenalty));
  }

  /**
   * Aggregate result into main results
   */
  _aggregateResult(results, validationResult) {
    results.summary.totalErrors += validationResult.errors.length;
    results.summary.totalWarnings += validationResult.warnings.length;
    results.summary.totalInfo += validationResult.info.length;

    // Add critical issues (errors from security or architecture)
    if (validationResult.validator === 'SecurityValidator' || validationResult.validator === 'ArchitectureValidator') {
      results.summary.criticalIssues += validationResult.errors.length;
    }

    // Collect all issues with metadata
    const issues = [
      ...validationResult.errors.map(e => ({ ...e, severity: 'error', validator: validationResult.validator })),
      ...validationResult.warnings.map(w => ({ ...w, severity: 'warning', validator: validationResult.validator })),
      ...validationResult.info.map(i => ({ ...i, severity: 'info', validator: validationResult.validator }))
    ];

    results.issues.push(...issues);
  }

  /**
   * Calculate overall score (weighted average)
   */
  _calculateOverallScore(validators) {
    const weights = {
      architecture: 0.25,
      security: 0.25,
      code: 0.20,
      performance: 0.15,
      accessibility: 0.15
    };

    let totalWeight = 0;
    let weightedScore = 0;

    for (const [name, validator] of Object.entries(validators)) {
      if (validator && validator.score !== undefined) {
        const weight = weights[name] || 0.1;
        weightedScore += validator.score * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  /**
   * Calculate letter grade
   */
  _calculateGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Check if results pass thresholds
   */
  _checkThresholds(results) {
    const { minimumScore, errorTolerance, warningTolerance } = this.config.thresholds;

    return results.overallScore >= minimumScore &&
           results.summary.totalErrors <= errorTolerance &&
           results.summary.totalWarnings <= warningTolerance;
  }

  /**
   * Generate actionable recommendations
   */
  _generateRecommendations(results) {
    const recommendations = [];

    // Critical issues
    if (results.summary.criticalIssues > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'Security/Architecture',
        message: `Fix ${results.summary.criticalIssues} critical issue(s) before production`,
        action: 'Review security and architecture errors immediately'
      });
    }

    // Performance recommendations
    if (results.validators.performance && results.validators.performance.score < 70) {
      recommendations.push({
        priority: 'high',
        category: 'Performance',
        message: 'Performance score below 70 - app may have UX issues',
        action: 'Optimize const constructors, ListView.builder usage, and image loading'
      });
    }

    // Accessibility recommendations
    if (results.validators.accessibility && results.validators.accessibility.score < 70) {
      recommendations.push({
        priority: 'medium',
        category: 'Accessibility',
        message: 'Accessibility score below WCAG AA standard',
        action: 'Add Semantics labels, improve touch targets, and check color contrast'
      });
    }

    // Architecture recommendations
    if (results.validators.architecture && results.validators.architecture.score < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'Architecture',
        message: 'Clean Architecture compliance below 80%',
        action: 'Review layer dependencies and ensure proper separation of concerns'
      });
    }

    // Warning accumulation
    if (results.summary.totalWarnings > 20) {
      recommendations.push({
        priority: 'low',
        category: 'Code Quality',
        message: `${results.summary.totalWarnings} warnings detected`,
        action: 'Address warnings to improve code maintainability'
      });
    }

    return recommendations;
  }

  /**
   * Generate reports in multiple formats
   */
  async _generateReports(results) {
    const outputPath = this.config.outputPath;

    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    for (const format of this.config.reportFormats) {
      try {
        let reportContent;
        let fileName;

        switch (format) {
          case 'json':
            reportContent = JSON.stringify(results, null, 2);
            fileName = `validation-report-${timestamp}.json`;
            break;

          case 'html':
            reportContent = this.reportGenerator.generateHTML(results);
            fileName = `validation-report-${timestamp}.html`;
            break;

          case 'markdown':
            reportContent = this.reportGenerator.generateMarkdown(results);
            fileName = `validation-report-${timestamp}.md`;
            break;

          default:
            logger.warn(`Unknown report format: ${format}`);
            continue;
        }

        const filePath = path.join(outputPath, fileName);
        fs.writeFileSync(filePath, reportContent, 'utf-8');
        logger.info(`Generated ${format} report: ${filePath}`);

      } catch (error) {
        logger.error(`Failed to generate ${format} report:`, error);
      }
    }
  }
}

module.exports = ValidationOrchestrator;
