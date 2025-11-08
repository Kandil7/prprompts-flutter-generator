/**
 * ArtifactManager - Manages conversion artifacts and run history
 *
 * Features:
 * - Artifact storage and organization
 * - Run history tracking
 * - Diff preservation
 * - Backup management
 * - Log aggregation
 * - Metadata tracking
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

class ArtifactManager {
  constructor(config = {}) {
    this.config = {
      basePath: config.basePath || '.prprompts',
      compress: config.compress || false,
      maxRuns: config.maxRuns || 50, // Maximum number of runs to keep
      maxAge: config.maxAge || 30 * 24 * 60 * 60 * 1000, // 30 days
      verbose: config.verbose || false,
    };

    this.currentRun = null;
  }

  /**
   * Initialize artifact storage
   * @param {string} projectPath - Project root path
   * @returns {Promise<void>}
   */
  async initialize(projectPath) {
    this.projectPath = projectPath;
    this.artifactsPath = path.join(projectPath, this.config.basePath);

    // Create directory structure
    await fs.ensureDir(this.artifactsPath);
    await fs.ensureDir(path.join(this.artifactsPath, 'runs'));
    await fs.ensureDir(path.join(this.artifactsPath, 'artifacts'));
    await fs.ensureDir(path.join(this.artifactsPath, 'backups'));
    await fs.ensureDir(path.join(this.artifactsPath, 'logs'));
    await fs.ensureDir(path.join(this.artifactsPath, 'archive'));

    // Clean old artifacts
    await this.cleanup();
  }

  /**
   * Start a new conversion run
   * @param {Object} metadata - Run metadata
   * @returns {Promise<Object>} Run information
   */
  async startRun(metadata = {}) {
    const timestamp = Date.now();
    const runId = `run-${timestamp}`;

    const run = {
      id: runId,
      timestamp,
      startedAt: new Date().toISOString(),
      metadata: {
        ...metadata,
        cwd: process.cwd(),
        node: process.version,
        platform: process.platform,
      },
      status: 'in_progress',
      features: [],
      errors: [],
      logs: [],
    };

    // Create run directory
    const runPath = path.join(this.artifactsPath, 'runs', runId);
    await fs.ensureDir(runPath);
    await fs.ensureDir(path.join(runPath, 'diffs'));
    await fs.ensureDir(path.join(runPath, 'files'));
    await fs.ensureDir(path.join(runPath, 'logs'));
    await fs.ensureDir(path.join(runPath, 'metadata'));

    // Save run metadata
    await this.saveRunMetadata(runId, run);

    this.currentRun = run;

    if (this.config.verbose) {
      console.log(`Started run: ${runId}`);
    }

    return run;
  }

  /**
   * End current run
   * @param {string} status - Final status (success, failed, cancelled)
   * @returns {Promise<void>}
   */
  async endRun(status = 'success') {
    if (!this.currentRun) {
      throw new Error('No active run');
    }

    this.currentRun.status = status;
    this.currentRun.completedAt = new Date().toISOString();
    this.currentRun.duration = Date.now() - this.currentRun.timestamp;

    await this.saveRunMetadata(this.currentRun.id, this.currentRun);

    if (this.config.verbose) {
      console.log(`Ended run: ${this.currentRun.id} (${status})`);
    }

    this.currentRun = null;
  }

  /**
   * Save feature artifacts
   * @param {string} featureName - Feature name
   * @param {Object} artifacts - Feature artifacts
   * @returns {Promise<void>}
   */
  async saveFeatureArtifacts(featureName, artifacts) {
    if (!this.currentRun) {
      throw new Error('No active run');
    }

    const featurePath = path.join(
      this.artifactsPath,
      'artifacts',
      'features',
      featureName
    );

    await fs.ensureDir(featurePath);
    await fs.ensureDir(path.join(featurePath, 'files'));
    await fs.ensureDir(path.join(featurePath, 'diffs'));

    // Save feature metadata
    await fs.writeJson(
      path.join(featurePath, 'meta.json'),
      {
        name: featureName,
        runId: this.currentRun.id,
        timestamp: Date.now(),
        ...artifacts.metadata,
      },
      { spaces: 2 }
    );

    // Save generated files
    if (artifacts.files) {
      for (const file of artifacts.files) {
        const filePath = path.join(featurePath, 'files', file.relativePath);
        await fs.ensureDir(path.dirname(filePath));

        if (this.config.compress) {
          const compressed = zlib.gzipSync(file.content);
          await fs.writeFile(filePath + '.gz', compressed);
        } else {
          await fs.writeFile(filePath, file.content, 'utf8');
        }
      }
    }

    // Save diffs
    if (artifacts.diffs) {
      for (const diff of artifacts.diffs) {
        const diffPath = path.join(
          featurePath,
          'diffs',
          `${diff.name}.diff`
        );
        await fs.writeFile(diffPath, diff.content, 'utf8');
      }
    }

    // Update run metadata
    this.currentRun.features.push({
      name: featureName,
      timestamp: Date.now(),
      files: artifacts.files?.length || 0,
      diffs: artifacts.diffs?.length || 0,
    });

    await this.saveRunMetadata(this.currentRun.id, this.currentRun);

    if (this.config.verbose) {
      console.log(`Saved artifacts for feature: ${featureName}`);
    }
  }

  /**
   * Save diff for a file
   * @param {string} fileName - File name
   * @param {string} diff - Diff content
   * @returns {Promise<void>}
   */
  async saveDiff(fileName, diff) {
    if (!this.currentRun) {
      throw new Error('No active run');
    }

    const runPath = path.join(this.artifactsPath, 'runs', this.currentRun.id);
    const diffPath = path.join(runPath, 'diffs', `${fileName}.diff`);

    await fs.ensureDir(path.dirname(diffPath));
    await fs.writeFile(diffPath, diff, 'utf8');

    if (this.config.verbose) {
      console.log(`Saved diff: ${fileName}`);
    }
  }

  /**
   * Save generated file
   * @param {string} relativePath - Relative file path
   * @param {string} content - File content
   * @returns {Promise<void>}
   */
  async saveGeneratedFile(relativePath, content) {
    if (!this.currentRun) {
      throw new Error('No active run');
    }

    const runPath = path.join(this.artifactsPath, 'runs', this.currentRun.id);
    const filePath = path.join(runPath, 'files', relativePath);

    await fs.ensureDir(path.dirname(filePath));

    if (this.config.compress) {
      const compressed = zlib.gzipSync(content);
      await fs.writeFile(filePath + '.gz', compressed);
    } else {
      await fs.writeFile(filePath, content, 'utf8');
    }

    if (this.config.verbose) {
      console.log(`Saved file: ${relativePath}`);
    }
  }

  /**
   * Log message to run
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {Promise<void>}
   */
  async log(level, message, data = {}) {
    if (!this.currentRun) {
      return;
    }

    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    this.currentRun.logs.push(logEntry);

    // Also write to log file
    const runPath = path.join(this.artifactsPath, 'runs', this.currentRun.id);
    const logPath = path.join(runPath, 'logs', `${level}.log`);

    const logLine = `[${logEntry.timestamp}] ${message}\n`;
    await fs.appendFile(logPath, logLine, 'utf8');
  }

  /**
   * Log error to run
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {Promise<void>}
   */
  async logError(error, context = {}) {
    if (!this.currentRun) {
      return;
    }

    const errorEntry = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
    };

    this.currentRun.errors.push(errorEntry);

    await this.log('error', error.message, {
      stack: error.stack,
      ...context,
    });
  }

  /**
   * Save run metadata
   * @param {string} runId - Run ID
   * @param {Object} metadata - Run metadata
   * @returns {Promise<void>}
   */
  async saveRunMetadata(runId, metadata) {
    const runPath = path.join(this.artifactsPath, 'runs', runId);
    const metaPath = path.join(runPath, 'meta.json');

    await fs.writeJson(metaPath, metadata, { spaces: 2 });
  }

  /**
   * Load run metadata
   * @param {string} runId - Run ID
   * @returns {Promise<Object>} Run metadata
   */
  async loadRunMetadata(runId) {
    const runPath = path.join(this.artifactsPath, 'runs', runId);
    const metaPath = path.join(runPath, 'meta.json');

    if (!await fs.pathExists(metaPath)) {
      throw new Error(`Run not found: ${runId}`);
    }

    return await fs.readJson(metaPath);
  }

  /**
   * Get all runs
   * @returns {Promise<Array>} List of runs
   */
  async getAllRuns() {
    const runsPath = path.join(this.artifactsPath, 'runs');

    if (!await fs.pathExists(runsPath)) {
      return [];
    }

    const runDirs = await fs.readdir(runsPath);
    const runs = [];

    for (const dir of runDirs) {
      try {
        const metadata = await this.loadRunMetadata(dir);
        runs.push(metadata);
      } catch (error) {
        // Skip invalid run directories
      }
    }

    // Sort by timestamp (newest first)
    runs.sort((a, b) => b.timestamp - a.timestamp);

    return runs;
  }

  /**
   * Get recent runs
   * @param {number} count - Number of runs to retrieve
   * @returns {Promise<Array>} Recent runs
   */
  async getRecentRuns(count = 10) {
    const allRuns = await this.getAllRuns();
    return allRuns.slice(0, count);
  }

  /**
   * Archive old run
   * @param {string} runId - Run ID
   * @returns {Promise<void>}
   */
  async archiveRun(runId) {
    const runPath = path.join(this.artifactsPath, 'runs', runId);
    const archivePath = path.join(this.artifactsPath, 'archive', `${runId}.tar.gz`);

    if (!await fs.pathExists(runPath)) {
      throw new Error(`Run not found: ${runId}`);
    }

    // Create tarball (simplified - using copy for now)
    await fs.ensureDir(path.dirname(archivePath));
    await fs.copy(runPath, archivePath.replace('.tar.gz', ''));

    // Remove original
    await fs.remove(runPath);

    if (this.config.verbose) {
      console.log(`Archived run: ${runId}`);
    }
  }

  /**
   * Delete run
   * @param {string} runId - Run ID
   * @returns {Promise<void>}
   */
  async deleteRun(runId) {
    const runPath = path.join(this.artifactsPath, 'runs', runId);

    if (!await fs.pathExists(runPath)) {
      throw new Error(`Run not found: ${runId}`);
    }

    await fs.remove(runPath);

    if (this.config.verbose) {
      console.log(`Deleted run: ${runId}`);
    }
  }

  /**
   * Cleanup old artifacts
   * @returns {Promise<Object>} Cleanup statistics
   */
  async cleanup() {
    const stats = {
      deleted: 0,
      archived: 0,
      kept: 0,
    };

    const runs = await this.getAllRuns();

    // Delete runs beyond maxRuns
    if (runs.length > this.config.maxRuns) {
      const toDelete = runs.slice(this.config.maxRuns);

      for (const run of toDelete) {
        await this.deleteRun(run.id);
        stats.deleted++;
      }
    }

    // Archive runs older than maxAge
    const now = Date.now();
    const remainingRuns = runs.slice(0, this.config.maxRuns);

    for (const run of remainingRuns) {
      const age = now - run.timestamp;

      if (age > this.config.maxAge) {
        await this.archiveRun(run.id);
        stats.archived++;
      } else {
        stats.kept++;
      }
    }

    if (this.config.verbose && (stats.deleted > 0 || stats.archived > 0)) {
      console.log(`Cleanup: deleted ${stats.deleted}, archived ${stats.archived}, kept ${stats.kept}`);
    }

    return stats;
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  async getStorageStats() {
    const stats = {
      totalSize: 0,
      runs: 0,
      artifacts: 0,
      backups: 0,
      logs: 0,
      archived: 0,
    };

    // Calculate directory sizes
    const paths = {
      runs: path.join(this.artifactsPath, 'runs'),
      artifacts: path.join(this.artifactsPath, 'artifacts'),
      backups: path.join(this.artifactsPath, 'backups'),
      logs: path.join(this.artifactsPath, 'logs'),
      archived: path.join(this.artifactsPath, 'archive'),
    };

    for (const [key, dirPath] of Object.entries(paths)) {
      if (await fs.pathExists(dirPath)) {
        stats[key] = await this.getDirectorySize(dirPath);
      }
    }

    stats.totalSize = Object.values(stats).reduce((sum, size) => sum + (typeof size === 'number' ? size : 0), 0);

    return stats;
  }

  /**
   * Get directory size recursively
   * @param {string} dirPath - Directory path
   * @returns {Promise<number>} Size in bytes
   */
  async getDirectorySize(dirPath) {
    let size = 0;

    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        size += await this.getDirectorySize(fullPath);
      } else if (item.isFile()) {
        const stat = await fs.stat(fullPath);
        size += stat.size;
      }
    }

    return size;
  }

  /**
   * Export run artifacts
   * @param {string} runId - Run ID
   * @param {string} exportPath - Export directory path
   * @returns {Promise<void>}
   */
  async exportRun(runId, exportPath) {
    const runPath = path.join(this.artifactsPath, 'runs', runId);

    if (!await fs.pathExists(runPath)) {
      throw new Error(`Run not found: ${runId}`);
    }

    await fs.copy(runPath, exportPath);

    if (this.config.verbose) {
      console.log(`Exported run ${runId} to ${exportPath}`);
    }
  }

  /**
   * Generate run report
   * @param {string} runId - Run ID
   * @returns {Promise<Object>} Run report
   */
  async generateRunReport(runId) {
    const metadata = await this.loadRunMetadata(runId);

    const report = {
      id: runId,
      status: metadata.status,
      startedAt: metadata.startedAt,
      completedAt: metadata.completedAt,
      duration: metadata.duration,
      features: metadata.features.length,
      errors: metadata.errors.length,
      logs: metadata.logs.length,
      summary: {
        totalFiles: metadata.features.reduce((sum, f) => sum + f.files, 0),
        totalDiffs: metadata.features.reduce((sum, f) => sum + f.diffs, 0),
      },
    };

    return report;
  }

  /**
   * Get hash for content
   * @param {string} content - Content to hash
   * @returns {string} Hash
   */
  getHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Format bytes to human-readable size
   * @param {number} bytes - Bytes
   * @returns {string} Formatted size
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}

module.exports = ArtifactManager;