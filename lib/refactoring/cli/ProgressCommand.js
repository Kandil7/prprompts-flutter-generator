/**
 * ProgressCommand - Track and display conversion progress
 *
 * Features:
 * - Real-time progress tracking
 * - Feature-by-feature status
 * - Time estimates and ETA
 * - Visual progress bars
 * - Resume capability
 * - Progress persistence
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');
const Table = require('cli-table3');

class ProgressCommand {
  constructor(config = {}) {
    this.config = {
      projectPath: config.projectPath,
      outputPath: config.outputPath,
      progressFile: config.progressFile || '.prprompts/progress.json',
      verbose: config.verbose || false,
      watch: config.watch || false,
      interval: config.interval || 2000, // Watch interval in ms
      format: config.format || 'detailed', // detailed, simple, json
    };

    this.progress = null;
    this.watchInterval = null;
  }

  /**
   * Execute progress command
   * @param {string} projectPath - React project path
   * @param {string} outputPath - Flutter output path
   * @returns {Promise<Object>} Progress information
   */
  async execute(projectPath, outputPath) {
    this.config.projectPath = projectPath || this.config.projectPath;
    this.config.outputPath = outputPath || this.config.outputPath;

    const progressPath = path.join(this.config.outputPath, this.config.progressFile);

    try {
      // Check if progress file exists
      if (!await fs.pathExists(progressPath)) {
        console.log(chalk.yellow('⚠️  No conversion in progress'));
        console.log(chalk.gray(`Progress file not found: ${progressPath}`));

        // Check if there's a completed conversion
        const completedPath = path.join(this.config.outputPath, '.prprompts/completed.json');
        if (await fs.pathExists(completedPath)) {
          console.log(chalk.green('✅ Conversion completed!'));
          await this.displayCompletedInfo(completedPath);
        } else {
          console.log(chalk.gray('Run "prprompts refactor" to start conversion'));
        }

        return { status: 'not_started' };
      }

      // Load progress data
      this.progress = await this.loadProgress(progressPath);

      // Display progress based on format
      switch (this.config.format) {
        case 'json':
          console.log(JSON.stringify(this.progress, null, 2));
          break;

        case 'simple':
          this.displaySimpleProgress();
          break;

        case 'detailed':
        default:
          await this.displayDetailedProgress();
          break;
      }

      // Watch mode
      if (this.config.watch) {
        console.log(chalk.cyan('\n👁️  Watching for changes... (Press Ctrl+C to stop)'));
        await this.startWatching(progressPath);
      }

      return {
        status: 'success',
        progress: this.progress,
      };

    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Load progress from file
   * @param {string} progressPath - Path to progress file
   * @returns {Promise<Object>} Progress data
   */
  async loadProgress(progressPath) {
    const progress = await fs.readJson(progressPath);

    // Validate progress structure
    if (!progress.project || !progress.features) {
      throw new Error('Invalid progress file format');
    }

    // Calculate derived metrics
    progress.metrics = this.calculateMetrics(progress);

    return progress;
  }

  /**
   * Calculate progress metrics
   * @param {Object} progress - Progress data
   * @returns {Object} Calculated metrics
   */
  calculateMetrics(progress) {
    const metrics = {
      totalFeatures: progress.features.length,
      completedFeatures: 0,
      inProgressFeatures: 0,
      pendingFeatures: 0,
      failedFeatures: 0,
      totalComponents: 0,
      completedComponents: 0,
      overallProgress: 0,
      estimatedTimeRemaining: 0,
      averageTimePerFeature: 0,
    };

    // Count features by status
    for (const feature of progress.features) {
      metrics.totalComponents += feature.components?.length || 0;

      switch (feature.status) {
        case 'completed':
          metrics.completedFeatures++;
          metrics.completedComponents += feature.components?.length || 0;
          break;
        case 'in_progress':
          metrics.inProgressFeatures++;
          metrics.completedComponents += Math.floor((feature.components?.length || 0) * (feature.progress || 0) / 100);
          break;
        case 'pending':
          metrics.pendingFeatures++;
          break;
        case 'failed':
          metrics.failedFeatures++;
          break;
      }
    }

    // Calculate overall progress
    if (metrics.totalFeatures > 0) {
      metrics.overallProgress = Math.round(
        (metrics.completedFeatures / metrics.totalFeatures) * 100
      );
    }

    // Calculate time estimates
    if (progress.startedAt && metrics.completedFeatures > 0) {
      const elapsedMs = Date.now() - new Date(progress.startedAt).getTime();
      metrics.averageTimePerFeature = elapsedMs / metrics.completedFeatures;
      metrics.estimatedTimeRemaining =
        metrics.averageTimePerFeature * (metrics.totalFeatures - metrics.completedFeatures);
    }

    return metrics;
  }

  /**
   * Display simple progress
   */
  displaySimpleProgress() {
    const m = this.progress.metrics;

    console.log(chalk.bold.blue('\n📊 Conversion Progress\n'));

    // Overall progress bar
    const progressBar = this.createProgressBar(m.overallProgress);
    console.log(`Overall: ${progressBar} ${m.overallProgress}%`);
    console.log(`Features: ${m.completedFeatures}/${m.totalFeatures}`);
    console.log(`Components: ${m.completedComponents}/${m.totalComponents}`);

    if (m.estimatedTimeRemaining > 0) {
      const eta = this.formatTime(m.estimatedTimeRemaining);
      console.log(`ETA: ${eta}`);
    }

    // Current feature
    const currentFeature = this.progress.features.find(f => f.status === 'in_progress');
    if (currentFeature) {
      console.log(`\nCurrent: ${chalk.cyan(currentFeature.name)} (${currentFeature.progress || 0}%)`);
    }
  }

  /**
   * Display detailed progress
   */
  async displayDetailedProgress() {
    console.clear();

    // Header
    console.log(chalk.bold.blue('╔════════════════════════════════════════════════════╗'));
    console.log(chalk.bold.blue('║        React to Flutter Conversion Progress        ║'));
    console.log(chalk.bold.blue('╚════════════════════════════════════════════════════╝'));
    console.log();

    // Project info
    console.log(chalk.bold('📦 Project Information'));
    console.log(`   Name: ${chalk.cyan(this.progress.project.name)}`);
    console.log(`   Source: ${this.progress.project.sourcePath}`);
    console.log(`   Output: ${this.progress.project.outputPath}`);
    console.log(`   Started: ${new Date(this.progress.startedAt).toLocaleString()}`);

    if (this.progress.lastUpdate) {
      console.log(`   Last Update: ${new Date(this.progress.lastUpdate).toLocaleString()}`);
    }

    console.log();

    // Overall metrics
    const m = this.progress.metrics;
    console.log(chalk.bold('📊 Overall Progress'));

    // Visual progress bar
    const progressBar = new cliProgress.SingleBar({
      format: '   {bar} {percentage}% | Features: {completed}/{total}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    });

    progressBar.start(m.totalFeatures, m.completedFeatures);
    progressBar.stop();

    console.log(`   Components: ${chalk.green(m.completedComponents)}/${m.totalComponents}`);

    if (m.estimatedTimeRemaining > 0) {
      console.log(`   ETA: ${chalk.yellow(this.formatTime(m.estimatedTimeRemaining))}`);
    }

    console.log();

    // Feature table
    console.log(chalk.bold('📂 Feature Status'));

    const table = new Table({
      head: ['Feature', 'Status', 'Progress', 'Components', 'Time'],
      colWidths: [20, 12, 15, 12, 10],
      style: {
        head: ['cyan'],
      },
    });

    for (const feature of this.progress.features) {
      const status = this.getStatusIcon(feature.status) + ' ' + feature.status;
      const progress = feature.progress !== undefined
        ? this.createMiniProgressBar(feature.progress)
        : '-';
      const components = `${feature.completedComponents || 0}/${feature.components?.length || 0}`;
      const time = feature.duration ? this.formatTime(feature.duration) : '-';

      table.push([
        feature.name,
        status,
        progress,
        components,
        time,
      ]);
    }

    console.log(table.toString());

    // Current activity
    const currentFeature = this.progress.features.find(f => f.status === 'in_progress');
    if (currentFeature) {
      console.log();
      console.log(chalk.bold('🔄 Current Activity'));
      console.log(`   Feature: ${chalk.cyan(currentFeature.name)}`);

      if (currentFeature.currentComponent) {
        console.log(`   Component: ${currentFeature.currentComponent}`);
      }

      if (currentFeature.currentStep) {
        console.log(`   Step: ${currentFeature.currentStep}`);
      }

      // Show recent logs
      if (currentFeature.logs && currentFeature.logs.length > 0) {
        console.log(`   Recent:`);
        for (const log of currentFeature.logs.slice(-3)) {
          console.log(`     • ${log.message} ${chalk.gray(this.getTimeAgo(log.timestamp))}`);
        }
      }
    }

    // Issues/Errors
    const failedFeatures = this.progress.features.filter(f => f.status === 'failed');
    if (failedFeatures.length > 0) {
      console.log();
      console.log(chalk.bold.red('❌ Issues'));
      for (const feature of failedFeatures) {
        console.log(`   ${feature.name}: ${feature.error || 'Unknown error'}`);
      }
    }

    // Recommendations
    if (this.progress.recommendations && this.progress.recommendations.length > 0) {
      console.log();
      console.log(chalk.bold('💡 Recommendations'));
      for (const rec of this.progress.recommendations.slice(0, 3)) {
        console.log(`   • ${rec}`);
      }
    }

    // Footer
    console.log();
    console.log(chalk.gray('─'.repeat(56)));
    console.log(chalk.gray('Press Ctrl+C to exit' + (this.config.watch ? ' (watching enabled)' : '')));
  }

  /**
   * Create progress bar string
   * @param {number} percentage - Progress percentage
   * @returns {string} Progress bar
   */
  createProgressBar(percentage) {
    const width = 20;
    const filled = Math.round(width * percentage / 100);
    const empty = width - filled;

    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  /**
   * Create mini progress bar
   * @param {number} percentage - Progress percentage
   * @returns {string} Mini progress bar
   */
  createMiniProgressBar(percentage) {
    const width = 10;
    const filled = Math.round(width * percentage / 100);
    const empty = width - filled;

    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
  }

  /**
   * Get status icon
   * @param {string} status - Feature status
   * @returns {string} Status icon
   */
  getStatusIcon(status) {
    const icons = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      failed: '❌',
      skipped: '⏭️',
    };

    return icons[status] || '❓';
  }

  /**
   * Format time duration
   * @param {number} ms - Milliseconds
   * @returns {string} Formatted time
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get time ago string
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Time ago string
   */
  getTimeAgo(timestamp) {
    const ms = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(ms / 1000);

    if (seconds < 60) {
      return `${seconds}s ago`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ago`;
    } else if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)}h ago`;
    } else {
      return `${Math.floor(seconds / 86400)}d ago`;
    }
  }

  /**
   * Start watching for progress changes
   * @param {string} progressPath - Progress file path
   */
  async startWatching(progressPath) {
    let lastModified = null;

    this.watchInterval = setInterval(async () => {
      try {
        const stats = await fs.stat(progressPath);

        if (!lastModified || stats.mtimeMs > lastModified) {
          lastModified = stats.mtimeMs;

          // Reload progress
          const newProgress = await this.loadProgress(progressPath);

          // Check for changes
          if (JSON.stringify(newProgress) !== JSON.stringify(this.progress)) {
            this.progress = newProgress;

            // Redisplay
            if (this.config.format === 'detailed') {
              await this.displayDetailedProgress();
            } else {
              this.displaySimpleProgress();
            }
          }
        }
      } catch (error) {
        // File might be temporarily unavailable during write
        if (this.config.verbose) {
          console.error(chalk.gray(`Watch error: ${error.message}`));
        }
      }
    }, this.config.interval);

    // Handle cleanup
    process.on('SIGINT', () => {
      this.stopWatching();
      process.exit(0);
    });
  }

  /**
   * Stop watching
   */
  stopWatching() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      console.log(chalk.yellow('\n\n👋 Stopped watching'));
    }
  }

  /**
   * Display completed conversion info
   * @param {string} completedPath - Path to completed.json
   */
  async displayCompletedInfo(completedPath) {
    try {
      const completed = await fs.readJson(completedPath);

      console.log();
      console.log(chalk.bold.green('Conversion Summary'));
      console.log(`  Project: ${chalk.cyan(completed.project.name)}`);
      console.log(`  Duration: ${this.formatTime(completed.duration)}`);
      console.log(`  Features: ${completed.features.length}`);
      console.log(`  Components: ${completed.totalComponents}`);

      if (completed.outputPath) {
        console.log(`  Output: ${completed.outputPath}`);
      }

      if (completed.report) {
        console.log();
        console.log('📊 Report available at:');
        console.log(`  ${completed.report}`);
      }

      if (completed.nextSteps && completed.nextSteps.length > 0) {
        console.log();
        console.log('📝 Next Steps:');
        for (const step of completed.nextSteps) {
          console.log(`  • ${step}`);
        }
      }

    } catch (error) {
      console.error(chalk.gray('Could not load completion details'));
    }
  }

  /**
   * Get progress summary for external use
   * @returns {Object} Progress summary
   */
  getProgressSummary() {
    if (!this.progress) {
      return null;
    }

    return {
      project: this.progress.project.name,
      overallProgress: this.progress.metrics.overallProgress,
      features: {
        total: this.progress.metrics.totalFeatures,
        completed: this.progress.metrics.completedFeatures,
        inProgress: this.progress.metrics.inProgressFeatures,
        pending: this.progress.metrics.pendingFeatures,
        failed: this.progress.metrics.failedFeatures,
      },
      components: {
        total: this.progress.metrics.totalComponents,
        completed: this.progress.metrics.completedComponents,
      },
      eta: this.progress.metrics.estimatedTimeRemaining,
      currentFeature: this.progress.features.find(f => f.status === 'in_progress')?.name,
    };
  }

  /**
   * Update progress (for internal use by conversion process)
   * @param {Object} update - Progress update
   * @returns {Promise<void>}
   */
  async updateProgress(update) {
    const progressPath = path.join(this.config.outputPath, this.config.progressFile);

    // Load current progress
    let progress = {};
    if (await fs.pathExists(progressPath)) {
      progress = await fs.readJson(progressPath);
    }

    // Apply update
    if (update.feature) {
      const feature = progress.features.find(f => f.name === update.feature);
      if (feature) {
        Object.assign(feature, update.data);
      }
    } else {
      Object.assign(progress, update);
    }

    // Update timestamp
    progress.lastUpdate = new Date().toISOString();

    // Save
    await fs.ensureDir(path.dirname(progressPath));
    await fs.writeJson(progressPath, progress, { spaces: 2 });
  }

  /**
   * Initialize progress tracking for new conversion
   * @param {Object} project - Project information
   * @param {Array} features - Features to convert
   * @returns {Promise<void>}
   */
  async initializeProgress(project, features) {
    const progress = {
      version: '1.0.0',
      project: {
        name: project.name,
        sourcePath: project.sourcePath,
        outputPath: project.outputPath,
      },
      startedAt: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      features: features.map(f => ({
        name: f.name,
        path: f.path,
        components: f.components || [],
        status: 'pending',
        progress: 0,
        completedComponents: 0,
        logs: [],
      })),
      recommendations: [],
      errors: [],
    };

    const progressPath = path.join(this.config.outputPath, this.config.progressFile);
    await fs.ensureDir(path.dirname(progressPath));
    await fs.writeJson(progressPath, progress, { spaces: 2 });
  }

  /**
   * Mark conversion as complete
   * @param {Object} summary - Completion summary
   * @returns {Promise<void>}
   */
  async markComplete(summary) {
    const progressPath = path.join(this.config.outputPath, this.config.progressFile);
    const completedPath = path.join(this.config.outputPath, '.prprompts/completed.json');

    // Load final progress
    const progress = await fs.readJson(progressPath);

    // Create completion record
    const completed = {
      ...summary,
      project: progress.project,
      startedAt: progress.startedAt,
      completedAt: new Date().toISOString(),
      duration: Date.now() - new Date(progress.startedAt).getTime(),
      features: progress.features.filter(f => f.status === 'completed'),
      totalComponents: progress.metrics?.totalComponents || 0,
      nextSteps: [
        'Run "flutter pub get" to install dependencies',
        'Run "flutter analyze" to check for issues',
        'Run "flutter test" to run tests',
        'Run "flutter run" to start the app',
      ],
    };

    // Save completion record
    await fs.ensureDir(path.dirname(completedPath));
    await fs.writeJson(completedPath, completed, { spaces: 2 });

    // Archive progress file
    const archivePath = path.join(
      this.config.outputPath,
      '.prprompts/archive',
      `progress-${Date.now()}.json`
    );
    await fs.ensureDir(path.dirname(archivePath));
    await fs.move(progressPath, archivePath);
  }
}

module.exports = ProgressCommand;