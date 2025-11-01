/**
 * ValidateCommand - Run validation on Flutter code
 * Supports multiple output formats and validation presets
 */

const fs = require('fs').promises;
const path = require('path');
const { ValidationOrchestrator, ReportGenerator } = require('../validation');
const Reporter = require('./Reporter');
const logger = require('../utils/logger');
const { execSync } = require('child_process');

class ValidateCommand {
  constructor(options = {}) {
    this.options = {
      flutterPath: options.flutterPath || process.cwd(),
      config: options.config || 'standard',
      format: options.format || 'terminal',
      output: options.output,
      threshold: options.threshold || 0,
      fix: options.fix || false,
      ci: options.ci || false
    };

    this.validationPresets = {
      strict: {
        minScore: 85,
        failOnWarnings: true,
        checkAll: true
      },
      standard: {
        minScore: 70,
        failOnWarnings: false,
        checkAll: true
      },
      lenient: {
        minScore: 50,
        failOnWarnings: false,
        checkAll: false
      },
      security: {
        minScore: 90,
        focusOn: ['security'],
        failOnSecurityIssues: true
      },
      performance: {
        minScore: 75,
        focusOn: ['performance'],
        warnOnSlowWidgets: true
      }
    };
  }

  /**
   * Execute validation
   */
  async execute() {
    try {
      const startTime = Date.now();

      if (!this.options.ci) {
        logger.info('🔍 Starting Flutter code validation...\n');
      }

      // Step 1: Validate inputs
      await this.validateInputs();

      // Step 2: Run validation
      const results = await this.runValidation();

      // Step 3: Auto-fix issues (if enabled)
      if (this.options.fix) {
        await this.autoFixIssues(results);
      }

      // Step 4: Generate report
      await this.generateReport(results);

      // Step 5: Check threshold
      const passed = this.checkThreshold(results);

      const duration = Date.now() - startTime;

      if (!this.options.ci) {
        logger.success(`\n✅ Validation complete (${(duration / 1000).toFixed(1)}s)`);
      }

      // Exit with appropriate code in CI mode
      if (this.options.ci) {
        process.exit(passed ? 0 : 1);
      }

      return {
        success: passed,
        results,
        duration
      };

    } catch (error) {
      logger.error(`\n❌ Validation failed: ${error.message}`);

      if (this.options.ci) {
        process.exit(1);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate inputs
   */
  async validateInputs() {
    // Check Flutter project path
    try {
      const stats = await fs.stat(this.options.flutterPath);
      if (!stats.isDirectory()) {
        throw new Error(`Path is not a directory: ${this.options.flutterPath}`);
      }

      // Check for pubspec.yaml
      const pubspecPath = path.join(this.options.flutterPath, 'pubspec.yaml');
      await fs.access(pubspecPath);

    } catch (error) {
      throw new Error(`Invalid Flutter project path: ${this.options.flutterPath}`);
    }

    // Validate config preset
    const validConfigs = Object.keys(this.validationPresets);
    if (!validConfigs.includes(this.options.config)) {
      throw new Error(`Invalid config preset: ${this.options.config}. Valid options: ${validConfigs.join(', ')}`);
    }

    // Validate format
    const validFormats = ['terminal', 'json', 'html', 'markdown'];
    if (!validFormats.includes(this.options.format)) {
      throw new Error(`Invalid format: ${this.options.format}. Valid options: ${validFormats.join(', ')}`);
    }

    // Validate threshold
    if (this.options.threshold < 0 || this.options.threshold > 100) {
      throw new Error('Threshold must be between 0 and 100');
    }
  }

  /**
   * Run validation
   */
  async runValidation() {
    const preset = this.validationPresets[this.options.config];

    if (!this.options.ci) {
      logger.info(`📋 Using "${this.options.config}" validation preset`);
      logger.info(`🎯 Minimum score: ${preset.minScore}/100\n`);
    }

    const orchestrator = new ValidationOrchestrator({
      projectPath: this.options.flutterPath,
      config: this.options.config,
      preset
    });

    const results = await orchestrator.validate();

    return results;
  }

  /**
   * Auto-fix issues
   */
  async autoFixIssues(results) {
    logger.info('\n🔧 Auto-fixing issues...');

    const fixableIssues = results.issues.filter(issue => issue.fixable);

    if (fixableIssues.length === 0) {
      logger.info('  No auto-fixable issues found');
      return;
    }

    logger.info(`  Found ${fixableIssues.length} fixable issues`);

    let fixed = 0;

    for (const issue of fixableIssues) {
      try {
        // Apply fix based on issue type
        await this.applyFix(issue);
        fixed++;
      } catch (error) {
        logger.warn(`  ⚠ Failed to fix ${issue.rule}: ${error.message}`);
      }
    }

    logger.success(`  ✅ Fixed ${fixed}/${fixableIssues.length} issues\n`);

    // Re-run validation
    logger.info('🔄 Re-running validation...\n');
    return await this.runValidation();
  }

  /**
   * Apply a fix for an issue
   */
  async applyFix(issue) {
    const filePath = path.join(this.options.flutterPath, issue.file);
    let content = await fs.readFile(filePath, 'utf8');

    switch (issue.rule) {
      case 'missing-const':
        // Add const keyword to constructors
        content = content.replace(
          /(\w+)\s*\(/g,
          (match, name) => `const ${name}(`
        );
        break;

      case 'missing-key':
        // Add key parameter to widgets
        content = content.replace(
          /Widget\s+build\(BuildContext\s+context\)\s*{/g,
          'Widget build(BuildContext context) {\n    return Container(key: key, '
        );
        break;

      case 'async-without-await':
        // Remove async keyword if no await
        if (!content.includes('await')) {
          content = content.replace(/async\s*{/g, '{');
        }
        break;

      default:
        logger.warn(`  Unknown fix rule: ${issue.rule}`);
        return;
    }

    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * Generate report
   */
  async generateReport(results) {
    const reportGenerator = new ReportGenerator();

    switch (this.options.format) {
      case 'terminal':
        this.generateTerminalReport(results);
        break;

      case 'json':
        await this.generateJSONReport(results, reportGenerator);
        break;

      case 'html':
        await this.generateHTMLReport(results, reportGenerator);
        break;

      case 'markdown':
        await this.generateMarkdownReport(results, reportGenerator);
        break;
    }
  }

  /**
   * Generate terminal report
   */
  generateTerminalReport(results) {
    const reporter = new Reporter();

    reporter.section('Validation Results');

    // Overall score
    const score = results.summary.overallScore;
    const grade = this.getGrade(score);
    const scoreColor = this.getScoreColor(score);

    reporter.scoreBox(score, grade, scoreColor);

    // Detailed scores
    reporter.section('Detailed Scores');
    reporter.table([
      ['Code Quality', `${results.summary.codeScore}/100`, this.getGrade(results.summary.codeScore)],
      ['Security', `${results.summary.securityScore}/100`, this.getGrade(results.summary.securityScore)],
      ['Performance', `${results.summary.performanceScore}/100`, this.getGrade(results.summary.performanceScore)],
      ['Accessibility', `${results.summary.accessibilityScore}/100`, this.getGrade(results.summary.accessibilityScore)],
      ['Architecture', `${results.summary.architectureScore || 'N/A'}/100`, this.getGrade(results.summary.architectureScore || 0)]
    ]);

    // Issues summary
    if (results.issues.length > 0) {
      reporter.section('Issues');

      const errors = results.issues.filter(i => i.severity === 'error');
      const warnings = results.issues.filter(i => i.severity === 'warning');
      const info = results.issues.filter(i => i.severity === 'info');

      reporter.table([
        ['Errors', errors.length, errors.length > 0 ? '❌' : '✅'],
        ['Warnings', warnings.length, warnings.length > 0 ? '⚠️' : '✅'],
        ['Info', info.length, info.length > 0 ? 'ℹ️' : '✅']
      ]);

      // Show top issues
      reporter.section('Top Issues');

      const topIssues = results.issues
        .filter(i => i.severity === 'error')
        .slice(0, 10);

      if (topIssues.length > 0) {
        topIssues.forEach(issue => {
          const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          logger.log(`  ${icon} [${issue.category}] ${issue.message}`);
          logger.log(`     ${issue.file}:${issue.line || '?'}`);
          if (issue.fixable) {
            logger.log(`     💡 Auto-fixable with --fix`);
          }
        });
      } else {
        logger.success('  No critical issues found!');
      }
    } else {
      logger.success('\n  ✨ No issues found!');
    }

    // Recommendations
    if (results.recommendations && results.recommendations.length > 0) {
      reporter.section('Recommendations');
      results.recommendations.slice(0, 5).forEach((rec, index) => {
        logger.info(`  ${index + 1}. ${rec}`);
      });
    }
  }

  /**
   * Generate JSON report
   */
  async generateJSONReport(results, reportGenerator) {
    const json = JSON.stringify(results, null, 2);

    if (this.options.output) {
      await fs.writeFile(this.options.output, json, 'utf8');
      logger.success(`\n📄 JSON report saved to: ${this.options.output}`);
    } else {
      console.log(json);
    }
  }

  /**
   * Generate HTML report
   */
  async generateHTMLReport(results, reportGenerator) {
    const html = await reportGenerator.generateHTML(results);

    const outputPath = this.options.output ||
      path.join(this.options.flutterPath, '.prprompts', 'validation-report.html');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, 'utf8');

    logger.success(`\n📄 HTML report saved to: ${outputPath}`);

    // Try to open in browser
    try {
      const opener = process.platform === 'win32' ? 'start' :
                     process.platform === 'darwin' ? 'open' : 'xdg-open';
      execSync(`${opener} "${outputPath}"`, { stdio: 'ignore' });
      logger.info('🌐 Opening report in browser...');
    } catch {
      logger.info(`\n💡 Open the report manually: ${outputPath}`);
    }
  }

  /**
   * Generate Markdown report
   */
  async generateMarkdownReport(results, reportGenerator) {
    const markdown = await reportGenerator.generateMarkdown(results);

    const outputPath = this.options.output ||
      path.join(this.options.flutterPath, '.prprompts', 'validation-report.md');

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, markdown, 'utf8');

    logger.success(`\n📄 Markdown report saved to: ${outputPath}`);
  }

  /**
   * Check if results meet threshold
   */
  checkThreshold(results) {
    const score = results.summary.overallScore;
    const threshold = this.options.threshold;

    if (score < threshold) {
      if (!this.options.ci) {
        logger.error(`\n❌ Validation failed: Score ${score}/100 is below threshold ${threshold}/100`);
      }
      return false;
    }

    if (!this.options.ci) {
      logger.success(`\n✅ Validation passed: Score ${score}/100 meets threshold ${threshold}/100`);
    }

    return true;
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
   * Get color for score
   */
  getScoreColor(score) {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    return 'red';
  }
}

module.exports = ValidateCommand;
