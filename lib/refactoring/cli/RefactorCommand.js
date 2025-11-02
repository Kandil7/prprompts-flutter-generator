/**
 * RefactorCommand - Main React-to-Flutter conversion orchestrator
 * Integrates parsing, generation, AI enhancement, and validation
 */

const fs = require('fs').promises;
const path = require('path');
const ReactParser = require('../parsers/ReactParser');
const CodeGenerator = require('../generators/CodeGenerator');
const CleanArchitectureGenerator = require('../generators/CleanArchitectureGenerator');
const { CodeEnhancer, WidgetOptimizer, TestGenerator } = require('../ai');
const { ValidationOrchestrator, ReportGenerator } = require('../validation');
const ProgressBar = require('./ProgressBar');
const Reporter = require('./Reporter');
const logger = require('../utils/logger');

class RefactorCommand {
  constructor(options = {}) {
    this.options = {
      reactSource: options.reactSource,
      flutterTarget: options.flutterTarget,
      ai: options.ai || 'none',
      validate: options.validate !== false,
      stateManagement: options.stateManagement || 'auto',
      architecture: options.architecture || 'clean',
      config: options.config,
      dryRun: options.dryRun || false,
      verbose: options.verbose || false
    };

    this.stats = {
      filesProcessed: 0,
      filesGenerated: 0,
      components: 0,
      widgets: 0,
      linesOfCode: {
        react: 0,
        flutter: 0
      },
      stateManagement: {},
      errors: [],
      warnings: []
    };
  }

  /**
   * Main conversion workflow
   */
  async execute() {
    try {
      const startTime = Date.now();

      logger.info('🚀 Starting React-to-Flutter conversion...\n');

      // Step 1: Validate inputs
      await this.validateInputs();

      // Step 2: Parse React files
      const components = await this.parseReactFiles();

      // Step 3: Generate Flutter code
      const generatedFiles = await this.generateFlutterCode(components);

      // Step 4: Enhance with AI (if enabled)
      if (this.options.ai !== 'none') {
        await this.enhanceWithAI(generatedFiles);
      }

      // Step 5: Validate output (if enabled)
      let validationResults = null;
      if (this.options.validate) {
        validationResults = await this.validateOutput();
      }

      // Step 6: Write files (unless dry run)
      if (!this.options.dryRun) {
        await this.writeFiles(generatedFiles);
      }

      // Step 7: Generate report
      const duration = Date.now() - startTime;
      await this.generateReport(validationResults, duration);

      logger.success('\n✅ Conversion complete!');

      return {
        success: true,
        stats: this.stats,
        duration,
        validationResults
      };

    } catch (error) {
      logger.error(`\n❌ Conversion failed: ${error.message}`);
      if (this.options.verbose) {
        logger.error(error.stack);
      }

      return {
        success: false,
        error: error.message,
        stats: this.stats
      };
    }
  }

  /**
   * Validate inputs
   */
  async validateInputs() {
    logger.info('🔍 Validating inputs...');

    // Check React source directory
    try {
      const stats = await fs.stat(this.options.reactSource);
      if (!stats.isDirectory()) {
        throw new Error(`React source path is not a directory: ${this.options.reactSource}`);
      }
    } catch (error) {
      throw new Error(`React source directory not found: ${this.options.reactSource}`);
    }

    // Check Flutter target (create if doesn't exist)
    try {
      await fs.access(this.options.flutterTarget);
    } catch {
      if (!this.options.dryRun) {
        logger.info(`Creating target directory: ${this.options.flutterTarget}`);
        await fs.mkdir(this.options.flutterTarget, { recursive: true });
      }
    }

    // Validate AI provider
    if (this.options.ai !== 'none') {
      const validProviders = ['claude', 'qwen', 'gemini', 'none'];
      if (!validProviders.includes(this.options.ai)) {
        throw new Error(`Invalid AI provider: ${this.options.ai}. Valid options: ${validProviders.join(', ')}`);
      }
    }

    // Validate state management
    const validStateManagement = ['bloc', 'cubit', 'provider', 'auto'];
    if (!validStateManagement.includes(this.options.stateManagement)) {
      throw new Error(`Invalid state management: ${this.options.stateManagement}. Valid options: ${validStateManagement.join(', ')}`);
    }

    // Validate architecture
    const validArchitectures = ['clean', 'mvc', 'mvvm'];
    if (!validArchitectures.includes(this.options.architecture)) {
      throw new Error(`Invalid architecture: ${this.options.architecture}. Valid options: ${validArchitectures.join(', ')}`);
    }

    logger.success('✅ Inputs validated\n');
  }

  /**
   * Parse React files
   */
  async parseReactFiles() {
    logger.info('📖 Parsing React files...');

    const parser = new ReactParser();
    const reactFiles = await this.findReactFiles(this.options.reactSource);

    const progressBar = new ProgressBar({
      total: reactFiles.length,
      format: 'Parsing React files... {bar} {percentage}% ({value}/{total} files) [{eta}s]'
    });

    const components = [];

    for (const file of reactFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        this.stats.linesOfCode.react += content.split('\n').length;

        const component = await parser.parseComponent(file, content);
        components.push(component);

        this.stats.filesProcessed++;
        this.stats.components += component.isComponent ? 1 : 0;

        // Track state management patterns
        if (component.stateManagement) {
          this.stats.stateManagement[component.stateManagement] =
            (this.stats.stateManagement[component.stateManagement] || 0) + 1;
        }

        progressBar.increment();

        if (this.options.verbose) {
          logger.info(`  ✓ Parsed: ${path.basename(file)}`);
        }

      } catch (error) {
        this.stats.errors.push({
          file,
          error: error.message
        });
        logger.warn(`  ⚠ Error parsing ${path.basename(file)}: ${error.message}`);
        progressBar.increment();
      }
    }

    progressBar.stop();

    logger.success(`✅ Parsed ${components.length} components\n`);

    return components;
  }

  /**
   * Generate Flutter code
   */
  async generateFlutterCode(components) {
    logger.info('🏗️  Generating Flutter code...');

    const generator = this.options.architecture === 'clean'
      ? new CleanArchitectureGenerator({
          stateManagement: this.options.stateManagement,
          targetPath: this.options.flutterTarget
        })
      : new CodeGenerator({
          architecture: this.options.architecture,
          stateManagement: this.options.stateManagement
        });

    const progressBar = new ProgressBar({
      total: components.length,
      format: 'Generating Flutter code... {bar} {percentage}% ({value}/{total} components) [ETA: {eta}s]'
    });

    const generatedFiles = {};

    for (const component of components) {
      try {
        const files = await generator.generateFromComponent(component);

        // Merge files
        Object.assign(generatedFiles, files);

        // Update stats
        this.stats.filesGenerated += Object.keys(files).length;
        this.stats.widgets += component.children?.length || 0;

        // Count lines
        for (const content of Object.values(files)) {
          this.stats.linesOfCode.flutter += content.split('\n').length;
        }

        progressBar.increment();

        if (this.options.verbose) {
          logger.info(`  ✓ Generated: ${component.name} → ${Object.keys(files).length} files`);
        }

      } catch (error) {
        this.stats.errors.push({
          component: component.name,
          error: error.message
        });
        logger.warn(`  ⚠ Error generating ${component.name}: ${error.message}`);
        progressBar.increment();
      }
    }

    progressBar.stop();

    logger.success(`✅ Generated ${this.stats.filesGenerated} Flutter files\n`);

    return generatedFiles;
  }

  /**
   * Enhance with AI
   */
  async enhanceWithAI(generatedFiles) {
    logger.info(`🤖 Enhancing with ${this.options.ai.toUpperCase()}...`);

    const enhancer = new CodeEnhancer({ provider: this.options.ai });
    const optimizer = new WidgetOptimizer({ provider: this.options.ai });
    const testGenerator = new TestGenerator({ provider: this.options.ai });

    const progressBar = new ProgressBar({
      total: Object.keys(generatedFiles).length,
      format: 'AI Enhancement... {bar} {percentage}% ({value}/{total} files) [ETA: {eta}s]'
    });

    for (const [filePath, content] of Object.entries(generatedFiles)) {
      try {
        // Enhance code quality
        const enhanced = await enhancer.enhanceCode(content, { filePath });

        // Optimize widgets
        if (filePath.includes('/widgets/') || filePath.includes('/pages/')) {
          const optimized = await optimizer.optimizeWidget(enhanced);
          generatedFiles[filePath] = optimized;
        } else {
          generatedFiles[filePath] = enhanced;
        }

        // Generate tests
        if (!filePath.includes('_test.dart')) {
          const testPath = filePath.replace(/\.dart$/, '_test.dart').replace('/lib/', '/test/');
          const testCode = await testGenerator.generateTest(generatedFiles[filePath], { filePath });
          generatedFiles[testPath] = testCode;
          this.stats.filesGenerated++;
        }

        progressBar.increment();

      } catch (error) {
        this.stats.warnings.push({
          file: filePath,
          warning: `AI enhancement failed: ${error.message}`
        });
        progressBar.increment();
      }
    }

    progressBar.stop();

    logger.success('✅ AI enhancement complete\n');
  }

  /**
   * Validate output
   */
  async validateOutput() {
    logger.info('🔍 Validating Flutter code...');

    const orchestrator = new ValidationOrchestrator({
      projectPath: this.options.flutterTarget,
      config: 'standard'
    });

    const results = await orchestrator.validate();

    // Display results summary
    const score = results.summary.overallScore;
    const scoreColor = score >= 85 ? 'green' : score >= 70 ? 'yellow' : 'red';

    logger.log(`\n  Overall Score: ${this.colorize(score + '/100', scoreColor)} (${this.getGrade(score)})`);
    logger.log(`  ✓ Code Quality: ${results.summary.codeScore}/100`);
    logger.log(`  ✓ Security: ${results.summary.securityScore}/100`);
    logger.log(`  ✓ Performance: ${results.summary.performanceScore}/100`);
    logger.log(`  ✓ Accessibility: ${results.summary.accessibilityScore}/100\n`);

    // Show issues summary
    if (results.issues.length > 0) {
      const errors = results.issues.filter(i => i.severity === 'error');
      const warnings = results.issues.filter(i => i.severity === 'warning');

      logger.warn(`  Issues: ${errors.length} errors, ${warnings.length} warnings`);
    }

    return results;
  }

  /**
   * Write files to disk
   */
  async writeFiles(generatedFiles) {
    logger.info('💾 Writing files...');

    const progressBar = new ProgressBar({
      total: Object.keys(generatedFiles).length,
      format: 'Writing files... {bar} {percentage}% ({value}/{total} files)'
    });

    for (const [filePath, content] of Object.entries(generatedFiles)) {
      try {
        const fullPath = path.join(this.options.flutterTarget, filePath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, 'utf8');
        progressBar.increment();
      } catch (error) {
        this.stats.errors.push({
          file: filePath,
          error: `Write failed: ${error.message}`
        });
        progressBar.increment();
      }
    }

    progressBar.stop();

    logger.success(`✅ Wrote ${Object.keys(generatedFiles).length} files\n`);
  }

  /**
   * Generate report
   */
  async generateReport(validationResults, duration) {
    logger.info('📊 Generating report...\n');

    const reporter = new Reporter();

    // Conversion summary
    reporter.section('Conversion Summary');
    reporter.table([
      ['Files converted', this.stats.filesProcessed],
      ['Components', this.stats.components],
      ['Widgets', this.stats.widgets],
      ['Files generated', this.stats.filesGenerated],
      ['React LOC', this.stats.linesOfCode.react],
      ['Flutter LOC', this.stats.linesOfCode.flutter],
      ['Duration', `${(duration / 1000).toFixed(1)}s`]
    ]);

    // State management breakdown
    if (Object.keys(this.stats.stateManagement).length > 0) {
      reporter.section('State Management');
      const stateTable = Object.entries(this.stats.stateManagement).map(([type, count]) => [
        type.toUpperCase(), `${count} components`
      ]);
      reporter.table(stateTable);
    }

    // Validation results
    if (validationResults) {
      reporter.section('Validation Results');
      reporter.validationSummary(validationResults);
    }

    // Errors and warnings
    if (this.stats.errors.length > 0) {
      reporter.section(`Errors (${this.stats.errors.length})`);
      this.stats.errors.slice(0, 5).forEach(err => {
        logger.error(`  ❌ ${err.file || err.component}: ${err.error}`);
      });
      if (this.stats.errors.length > 5) {
        logger.warn(`  ... and ${this.stats.errors.length - 5} more errors`);
      }
    }

    if (this.stats.warnings.length > 0) {
      reporter.section(`Warnings (${this.stats.warnings.length})`);
      this.stats.warnings.slice(0, 5).forEach(warn => {
        logger.warn(`  ⚠ ${warn.file}: ${warn.warning}`);
      });
      if (this.stats.warnings.length > 5) {
        logger.warn(`  ... and ${this.stats.warnings.length - 5} more warnings`);
      }
    }

    // Recommendations
    reporter.section('Next Steps');
    logger.info('  1. Review generated code in:', this.options.flutterTarget);
    logger.info('  2. Run: cd', this.options.flutterTarget, '&& flutter pub get');
    logger.info('  3. Run: flutter analyze');
    logger.info('  4. Run: flutter test');

    if (validationResults) {
      const reportPath = path.join(this.options.flutterTarget, '.prprompts', 'validation-report.html');
      logger.info(`  5. View validation report: ${reportPath}`);
    }

    console.log('');
  }

  /**
   * Find React files recursively
   */
  async findReactFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, build, dist, etc.
        if (!['node_modules', 'build', 'dist', '.git'].includes(entry.name)) {
          files.push(...await this.findReactFiles(fullPath));
        }
      } else if (entry.isFile()) {
        // Include .jsx, .tsx, .js, .ts files
        if (/\.(jsx|tsx|js|ts)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    return files;
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
   * Colorize text (simple version)
   */
  colorize(text, color) {
    const colors = {
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      reset: '\x1b[0m'
    };
    return `${colors[color] || ''}${text}${colors.reset}`;
  }
}

module.exports = RefactorCommand;
