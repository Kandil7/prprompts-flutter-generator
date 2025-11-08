/**
 * ApplyCommand - Apply conversion changes for specific features
 *
 * Features:
 * - Feature-specific application
 * - Git integration
 * - Conflict resolution
 * - Rollback capability
 * - Validation before apply
 * - Progress tracking
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const ora = require('ora');
const inquirer = require('inquirer');

class ApplyCommand {
  constructor(config = {}) {
    this.config = {
      outputPath: config.outputPath,
      mode: config.mode || 'safe', // safe, force, merge
      backup: config.backup !== false,
      validate: config.validate !== false,
      verbose: config.verbose || false,
      dryRun: config.dryRun || false,
      interactive: config.interactive || false,
      gitIntegration: config.gitIntegration !== false,
    };

    this.appliedFiles = [];
    this.conflicts = [];
    this.backupPath = null;
  }

  /**
   * Execute apply command
   * @param {string} feature - Feature name to apply
   * @param {string} outputPath - Flutter output path
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Apply result
   */
  async execute(feature, outputPath, options = {}) {
    this.config.outputPath = outputPath || this.config.outputPath;
    Object.assign(this.config, options);

    const spinner = ora('Preparing to apply changes...').start();

    try {
      // Validate environment
      spinner.text = 'Validating environment...';
      await this.validateEnvironment();

      // Load conversion artifacts
      const artifactsPath = path.join(this.config.outputPath, '.prprompts/artifacts');

      if (!await fs.pathExists(artifactsPath)) {
        spinner.fail('No conversion artifacts found');
        console.log(chalk.gray('Run "prprompts refactor" first to generate artifacts'));
        return { status: 'no_artifacts' };
      }

      // Select feature if not specified
      if (!feature && this.config.interactive) {
        spinner.stop();
        feature = await this.selectFeature(artifactsPath);
        if (!feature) {
          console.log(chalk.yellow('No feature selected'));
          return { status: 'cancelled' };
        }
        spinner.start('Preparing to apply changes...');
      }

      // Load feature data
      const featurePath = path.join(artifactsPath, 'features', feature);

      if (!await fs.pathExists(featurePath)) {
        spinner.fail(`Feature "${feature}" not found`);
        return { status: 'not_found' };
      }

      // Create backup if enabled
      if (this.config.backup && !this.config.dryRun) {
        spinner.text = 'Creating backup...';
        await this.createBackup();
      }

      // Load files to apply
      spinner.text = 'Loading conversion files...';
      const files = await this.loadFeatureFiles(featurePath);

      // Validate files if enabled
      if (this.config.validate) {
        spinner.text = 'Validating Dart code...';
        const valid = await this.validateFiles(files);
        if (!valid && this.config.mode === 'safe') {
          spinner.fail('Validation failed');
          await this.showValidationErrors();
          return { status: 'validation_failed' };
        }
      }

      // Check for conflicts
      spinner.text = 'Checking for conflicts...';
      await this.checkConflicts(files);

      if (this.conflicts.length > 0 && this.config.mode === 'safe') {
        spinner.stop();
        const proceed = await this.handleConflicts();
        if (!proceed) {
          console.log(chalk.yellow('Apply cancelled due to conflicts'));
          return { status: 'conflicts' };
        }
        spinner.start('Applying changes...');
      }

      // Apply files
      spinner.text = 'Applying changes...';
      const result = await this.applyFiles(files);

      // Update progress
      spinner.text = 'Updating progress...';
      await this.updateProgress(feature, result);

      // Post-apply actions
      if (!this.config.dryRun) {
        spinner.text = 'Running post-apply actions...';
        await this.postApplyActions();
      }

      spinner.succeed(`Feature "${feature}" applied successfully!`);

      // Display summary
      this.displaySummary(result);

      return {
        status: 'success',
        feature,
        appliedFiles: this.appliedFiles.length,
        conflicts: this.conflicts.length,
        result,
      };

    } catch (error) {
      spinner.fail(`Error: ${error.message}`);

      // Attempt rollback if backup exists
      if (this.backupPath && !this.config.dryRun) {
        console.log(chalk.yellow('🔄 Attempting rollback...'));
        await this.rollback();
      }

      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Validate environment
   */
  async validateEnvironment() {
    // Check if output directory exists
    if (!await fs.pathExists(this.config.outputPath)) {
      await fs.ensureDir(this.config.outputPath);
    }

    // Check Git status if Git integration is enabled
    if (this.config.gitIntegration) {
      try {
        const isGitRepo = await fs.pathExists(path.join(this.config.outputPath, '.git'));

        if (isGitRepo && this.config.mode === 'safe') {
          // Check for uncommitted changes
          const status = execSync('git status --porcelain', {
            cwd: this.config.outputPath,
            encoding: 'utf8',
          });

          if (status.trim()) {
            throw new Error('Uncommitted changes detected. Commit or stash changes before applying.');
          }
        }
      } catch (error) {
        if (this.config.verbose) {
          console.warn(chalk.yellow('Git check failed:', error.message));
        }
      }
    }
  }

  /**
   * Select feature interactively
   * @param {string} artifactsPath - Artifacts directory path
   * @returns {Promise<string>} Selected feature
   */
  async selectFeature(artifactsPath) {
    const featuresPath = path.join(artifactsPath, 'features');

    if (!await fs.pathExists(featuresPath)) {
      return null;
    }

    const features = await fs.readdir(featuresPath);

    if (features.length === 0) {
      return null;
    }

    // Load feature metadata and check status
    const featureChoices = [];

    for (const feature of features) {
      const metaPath = path.join(featuresPath, feature, 'meta.json');
      const appliedPath = path.join(featuresPath, feature, '.applied');

      let meta = { components: 0, status: 'ready' };
      if (await fs.pathExists(metaPath)) {
        meta = await fs.readJson(metaPath);
      }

      const isApplied = await fs.pathExists(appliedPath);
      const icon = isApplied ? '✅' : '⏳';
      const status = isApplied ? 'applied' : 'ready';

      featureChoices.push({
        name: `${icon} ${feature} (${meta.components} components) - ${status}`,
        value: feature,
        short: feature,
        disabled: isApplied && this.config.mode !== 'force',
      });
    }

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'feature',
        message: 'Select feature to apply:',
        choices: featureChoices,
        pageSize: 10,
      },
    ]);

    return answer.feature;
  }

  /**
   * Create backup of current state
   */
  async createBackup() {
    const timestamp = Date.now();
    this.backupPath = path.join(this.config.outputPath, '.prprompts/backups', `backup-${timestamp}`);

    await fs.ensureDir(this.backupPath);

    // Backup lib directory if it exists
    const libPath = path.join(this.config.outputPath, 'lib');
    if (await fs.pathExists(libPath)) {
      await fs.copy(libPath, path.join(this.backupPath, 'lib'));
    }

    // Backup pubspec.yaml if it exists
    const pubspecPath = path.join(this.config.outputPath, 'pubspec.yaml');
    if (await fs.pathExists(pubspecPath)) {
      await fs.copy(pubspecPath, path.join(this.backupPath, 'pubspec.yaml'));
    }

    // Save backup metadata
    await fs.writeJson(path.join(this.backupPath, 'meta.json'), {
      timestamp,
      date: new Date().toISOString(),
      feature: 'pre-apply',
    });

    if (this.config.verbose) {
      console.log(chalk.gray(`Backup created: ${this.backupPath}`));
    }
  }

  /**
   * Load feature files
   * @param {string} featurePath - Feature directory path
   * @returns {Promise<Array>} Files to apply
   */
  async loadFeatureFiles(featurePath) {
    const files = [];
    const filesPath = path.join(featurePath, 'files');

    if (!await fs.pathExists(filesPath)) {
      throw new Error('No files found for this feature');
    }

    // Read all generated files
    const items = await this.walkDirectory(filesPath);

    for (const item of items) {
      const relativePath = path.relative(filesPath, item);
      const targetPath = path.join(this.config.outputPath, relativePath);

      files.push({
        source: item,
        target: targetPath,
        relative: relativePath,
        content: await fs.readFile(item, 'utf8'),
      });
    }

    return files;
  }

  /**
   * Walk directory recursively
   * @param {string} dir - Directory path
   * @returns {Promise<Array>} File paths
   */
  async walkDirectory(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        const subFiles = await this.walkDirectory(fullPath);
        files.push(...subFiles);
      } else if (item.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Validate Dart files
   * @param {Array} files - Files to validate
   * @returns {Promise<boolean>} Validation result
   */
  async validateFiles(files) {
    const dartFiles = files.filter(f => f.relative.endsWith('.dart'));

    if (dartFiles.length === 0) {
      return true;
    }

    // Create temporary directory for validation
    const tempDir = path.join(this.config.outputPath, '.prprompts/temp', `validate-${Date.now()}`);
    await fs.ensureDir(tempDir);

    try {
      // Write files to temp directory
      for (const file of dartFiles) {
        const tempPath = path.join(tempDir, file.relative);
        await fs.ensureDir(path.dirname(tempPath));
        await fs.writeFile(tempPath, file.content, 'utf8');
      }

      // Run dart format to check syntax
      try {
        execSync('dart format --set-exit-if-changed --output=none .', {
          cwd: tempDir,
          stdio: 'pipe',
        });
        return true;
      } catch (error) {
        // Format failed - syntax errors
        if (this.config.verbose) {
          console.error(chalk.red('Validation error:'), error.message);
        }
        return false;
      }
    } finally {
      // Cleanup temp directory
      await fs.remove(tempDir);
    }
  }

  /**
   * Check for conflicts
   * @param {Array} files - Files to check
   */
  async checkConflicts(files) {
    this.conflicts = [];

    for (const file of files) {
      if (await fs.pathExists(file.target)) {
        const existing = await fs.readFile(file.target, 'utf8');

        if (existing !== file.content) {
          this.conflicts.push({
            path: file.relative,
            target: file.target,
            type: 'modified',
          });
        }
      }
    }
  }

  /**
   * Handle conflicts interactively
   * @returns {Promise<boolean>} Whether to proceed
   */
  async handleConflicts() {
    console.log(chalk.yellow(`\n⚠️  ${this.conflicts.length} conflict(s) detected:\n`));

    for (const conflict of this.conflicts) {
      console.log(`  • ${conflict.path} (${conflict.type})`);
    }

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices: [
          { name: 'Overwrite all conflicts', value: 'overwrite' },
          { name: 'Skip conflicting files', value: 'skip' },
          { name: 'Review each conflict', value: 'review' },
          { name: 'Cancel', value: 'cancel' },
        ],
      },
    ]);

    if (answer.action === 'review') {
      return await this.reviewConflicts();
    }

    if (answer.action === 'skip') {
      this.config.skipConflicts = true;
    }

    return answer.action !== 'cancel';
  }

  /**
   * Review conflicts one by one
   * @returns {Promise<boolean>} Whether to proceed
   */
  async reviewConflicts() {
    const resolved = [];

    for (const conflict of this.conflicts) {
      console.log(chalk.cyan(`\nConflict: ${conflict.path}`));

      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'Action for this file:',
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Skip', value: 'skip' },
            { name: 'View diff', value: 'diff' },
            { name: 'Cancel all', value: 'cancel' },
          ],
        },
      ]);

      if (answer.action === 'cancel') {
        return false;
      }

      if (answer.action === 'diff') {
        await this.showDiff(conflict.target);
        // Ask again after showing diff
        const retry = await this.reviewConflicts();
        return retry;
      }

      resolved.push({
        ...conflict,
        action: answer.action,
      });
    }

    this.conflicts = resolved;
    return true;
  }

  /**
   * Show diff for a file
   * @param {string} filePath - File path
   */
  async showDiff(filePath) {
    try {
      const diff = execSync(`git diff --no-index ${filePath} -`, {
        cwd: this.config.outputPath,
        encoding: 'utf8',
      });
      console.log(diff);
    } catch (error) {
      console.log(chalk.gray('Could not generate diff'));
    }
  }

  /**
   * Apply files to output
   * @param {Array} files - Files to apply
   * @returns {Promise<Object>} Apply result
   */
  async applyFiles(files) {
    const result = {
      applied: 0,
      skipped: 0,
      failed: 0,
      files: [],
    };

    for (const file of files) {
      try {
        // Check if should skip due to conflict
        const conflict = this.conflicts.find(c => c.target === file.target);
        if (conflict) {
          if (this.config.skipConflicts || conflict.action === 'skip') {
            result.skipped++;
            continue;
          }
        }

        // Apply file
        if (!this.config.dryRun) {
          await fs.ensureDir(path.dirname(file.target));
          await fs.writeFile(file.target, file.content, 'utf8');
        }

        this.appliedFiles.push(file.target);
        result.applied++;
        result.files.push(file.relative);

        if (this.config.verbose) {
          console.log(chalk.green(`  ✓ ${file.relative}`));
        }
      } catch (error) {
        result.failed++;

        if (this.config.verbose) {
          console.error(chalk.red(`  ✗ ${file.relative}: ${error.message}`));
        }
      }
    }

    return result;
  }

  /**
   * Update progress tracking
   * @param {string} feature - Feature name
   * @param {Object} result - Apply result
   */
  async updateProgress(feature) {
    const progressPath = path.join(this.config.outputPath, '.prprompts/progress.json');

    if (await fs.pathExists(progressPath)) {
      const progress = await fs.readJson(progressPath);

      // Update feature status
      const featureEntry = progress.features.find(f => f.name === feature);
      if (featureEntry) {
        featureEntry.status = 'applied';
        featureEntry.appliedAt = new Date().toISOString();
      }

      progress.lastUpdate = new Date().toISOString();

      await fs.writeJson(progressPath, progress, { spaces: 2 });
    }

    // Mark feature as applied
    const artifactsPath = path.join(this.config.outputPath, '.prprompts/artifacts/features', feature);
    if (await fs.pathExists(artifactsPath)) {
      await fs.writeFile(path.join(artifactsPath, '.applied'), new Date().toISOString());
    }
  }

  /**
   * Run post-apply actions
   */
  async postApplyActions() {
    const actions = [];

    // Format Dart code
    if (await this.commandExists('dart')) {
      actions.push(this.formatDartCode());
    }

    // Run pub get if pubspec.yaml was modified
    if (this.appliedFiles.some(f => f.includes('pubspec.yaml'))) {
      if (await this.commandExists('flutter')) {
        actions.push(this.runPubGet());
      }
    }

    // Create git commit if enabled
    if (this.config.gitIntegration) {
      actions.push(this.createGitCommit());
    }

    await Promise.all(actions);
  }

  /**
   * Format Dart code
   */
  async formatDartCode() {
    try {
      execSync('dart format lib/', {
        cwd: this.config.outputPath,
        stdio: this.config.verbose ? 'inherit' : 'ignore',
      });

      if (this.config.verbose) {
        console.log(chalk.green('  ✓ Formatted Dart code'));
      }
    } catch (error) {
      if (this.config.verbose) {
        console.warn(chalk.yellow('  ⚠ Could not format Dart code'));
      }
    }
  }

  /**
   * Run flutter pub get
   */
  async runPubGet() {
    try {
      execSync('flutter pub get', {
        cwd: this.config.outputPath,
        stdio: this.config.verbose ? 'inherit' : 'ignore',
      });

      if (this.config.verbose) {
        console.log(chalk.green('  ✓ Updated dependencies'));
      }
    } catch (error) {
      if (this.config.verbose) {
        console.warn(chalk.yellow('  ⚠ Could not update dependencies'));
      }
    }
  }

  /**
   * Create git commit
   */
  async createGitCommit() {
    try {
      const isGitRepo = await fs.pathExists(path.join(this.config.outputPath, '.git'));

      if (!isGitRepo) {
        return;
      }

      // Check if there are changes to commit
      const status = execSync('git status --porcelain', {
        cwd: this.config.outputPath,
        encoding: 'utf8',
      });

      if (!status.trim()) {
        return;
      }

      // Add changes
      execSync('git add .', {
        cwd: this.config.outputPath,
        stdio: 'ignore',
      });

      // Create commit
      const message = `Apply React-to-Flutter conversion for feature\n\nApplied ${this.appliedFiles.length} files`;
      execSync(`git commit -m "${message}"`, {
        cwd: this.config.outputPath,
        stdio: 'ignore',
      });

      if (this.config.verbose) {
        console.log(chalk.green('  ✓ Created git commit'));
      }
    } catch (error) {
      if (this.config.verbose) {
        console.warn(chalk.yellow('  ⚠ Could not create git commit'));
      }
    }
  }

  /**
   * Check if command exists
   * @param {string} command - Command to check
   * @returns {Promise<boolean>} Whether command exists
   */
  async commandExists(command) {
    try {
      execSync(`which ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rollback changes
   */
  async rollback() {
    if (!this.backupPath) {
      console.log(chalk.red('No backup available for rollback'));
      return;
    }

    try {
      // Restore lib directory
      const libBackup = path.join(this.backupPath, 'lib');
      if (await fs.pathExists(libBackup)) {
        const libPath = path.join(this.config.outputPath, 'lib');
        await fs.remove(libPath);
        await fs.copy(libBackup, libPath);
      }

      // Restore pubspec.yaml
      const pubspecBackup = path.join(this.backupPath, 'pubspec.yaml');
      if (await fs.pathExists(pubspecBackup)) {
        const pubspecPath = path.join(this.config.outputPath, 'pubspec.yaml');
        await fs.copy(pubspecBackup, pubspecPath);
      }

      console.log(chalk.green('✅ Rollback completed'));
    } catch (error) {
      console.error(chalk.red('Rollback failed:'), error.message);
    }
  }

  /**
   * Display summary
   * @param {Object} result - Apply result
   */
  displaySummary(result) {
    console.log(chalk.bold.blue('\n📋 Apply Summary\n'));

    console.log(`  Applied: ${chalk.green(result.applied)} files`);
    if (result.skipped > 0) {
      console.log(`  Skipped: ${chalk.yellow(result.skipped)} files`);
    }
    if (result.failed > 0) {
      console.log(`  Failed: ${chalk.red(result.failed)} files`);
    }

    if (this.config.dryRun) {
      console.log(chalk.yellow('\n  (Dry run - no files were actually modified)'));
    }

    console.log(chalk.gray('\n  Next steps:'));
    console.log(chalk.gray('  1. Run "flutter analyze" to check for issues'));
    console.log(chalk.gray('  2. Run "flutter test" to run tests'));
    console.log(chalk.gray('  3. Run "flutter run" to test the app'));
  }

  /**
   * Show validation errors
   */
  async showValidationErrors() {
    console.log(chalk.red('\n❌ Validation Errors\n'));
    console.log(chalk.gray('The generated Dart code contains syntax errors.'));
    console.log(chalk.gray('This may be due to incomplete conversion or missing dependencies.'));
    console.log(chalk.gray('\nOptions:'));
    console.log(chalk.gray('  1. Run with --mode=force to apply anyway'));
    console.log(chalk.gray('  2. Report the issue for improvement'));
    console.log(chalk.gray('  3. Manually fix the generated code'));
  }
}

module.exports = ApplyCommand;