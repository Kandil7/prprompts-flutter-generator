/**
 * GitIntegration - Git integration utilities for safe refactoring
 *
 * Features:
 * - Working tree validation
 * - Automatic branch creation
 * - Patch generation and application
 * - Conflict detection and resolution
 * - 3-way merge support
 * - Commit creation with attribution
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class GitIntegration {
  constructor(config = {}) {
    this.config = {
      repoPath: config.repoPath || process.cwd(),
      verbose: config.verbose || false,
      autoCommit: config.autoCommit || false,
      branchPrefix: config.branchPrefix || 'prprompts/',
      requireCleanTree: config.requireCleanTree !== false,
    };
  }

  /**
   * Check if directory is a Git repository
   * @returns {boolean} Is Git repo
   */
  isGitRepo() {
    try {
      const gitDir = path.join(this.config.repoPath, '.git');
      return fs.existsSync(gitDir);
    } catch {
      return false;
    }
  }

  /**
   * Ensure Git repository exists
   */
  ensureGitRepo() {
    if (!this.isGitRepo()) {
      if (this.config.verbose) {
        console.log(chalk.yellow('Not a Git repository, initializing...'));
      }
      this.exec('git init');
    }
  }

  /**
   * Check if working tree is clean
   * @returns {boolean} Is clean
   */
  isWorkingTreeClean() {
    try {
      const status = this.exec('git status --porcelain', { silent: true });
      return status.trim() === '';
    } catch {
      return false;
    }
  }

  /**
   * Validate working tree before operations
   * @throws {Error} If tree is not clean and required
   */
  validateWorkingTree() {
    if (!this.isGitRepo()) {
      throw new Error('Not a Git repository');
    }

    if (this.config.requireCleanTree && !this.isWorkingTreeClean()) {
      throw new Error(
        'Working tree has uncommitted changes. ' +
        'Please commit or stash changes before proceeding.'
      );
    }
  }

  /**
   * Get current branch name
   * @returns {string} Branch name
   */
  getCurrentBranch() {
    try {
      return this.exec('git branch --show-current', { silent: true }).trim();
    } catch {
      return 'master';
    }
  }

  /**
   * Create a new branch
   * @param {string} name - Branch name (will be prefixed)
   * @param {string} baseBranch - Base branch to create from
   * @returns {string} Full branch name
   */
  createBranch(name, baseBranch = null) {
    const branchName = `${this.config.branchPrefix}${name}`;

    // Check if branch already exists
    const branchExists = this.branchExists(branchName);
    if (branchExists) {
      throw new Error(`Branch ${branchName} already exists`);
    }

    // Create branch
    if (baseBranch) {
      this.exec(`git checkout -b ${branchName} ${baseBranch}`);
    } else {
      this.exec(`git checkout -b ${branchName}`);
    }

    if (this.config.verbose) {
      console.log(chalk.green(`✓ Created branch: ${branchName}`));
    }

    return branchName;
  }

  /**
   * Check if branch exists
   * @param {string} branchName - Branch name
   * @returns {boolean} Exists
   */
  branchExists(branchName) {
    try {
      this.exec(`git rev-parse --verify ${branchName}`, { silent: true });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Switch to branch
   * @param {string} branchName - Branch name
   */
  checkoutBranch(branchName) {
    this.exec(`git checkout ${branchName}`);

    if (this.config.verbose) {
      console.log(chalk.green(`✓ Switched to branch: ${branchName}`));
    }
  }

  /**
   * Stage files for commit
   * @param {Array<string>} files - Files to stage (or '.' for all)
   */
  stageFiles(files = ['.']) {
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    this.exec(`git add ${fileList}`);

    if (this.config.verbose) {
      console.log(chalk.green(`✓ Staged files: ${fileList}`));
    }
  }

  /**
   * Create a commit
   * @param {string} message - Commit message
   * @param {Object} options - Commit options
   */
  createCommit(message, options = {}) {
    const {
      author = null,
      coAuthors = [],
      allowEmpty = false,
    } = options;

    // Build commit message
    let fullMessage = message;

    // Add co-authors
    if (coAuthors.length > 0) {
      fullMessage += '\n\n';
      for (const coAuthor of coAuthors) {
        fullMessage += `Co-Authored-By: ${coAuthor}\n`;
      }
    }

    // Prepare commit command
    let cmd = 'git commit -m';
    if (allowEmpty) {
      cmd += ' --allow-empty';
    }
    if (author) {
      cmd += ` --author="${author}"`;
    }

    // Execute commit
    const escapedMessage = fullMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    this.exec(`${cmd} "${escapedMessage}"`);

    if (this.config.verbose) {
      console.log(chalk.green('✓ Created commit'));
    }
  }

  /**
   * Generate patch file
   * @param {Array<string>} files - Files to include in patch
   * @param {string} outputPath - Output patch file path
   */
  generatePatch(files, outputPath) {
    const fileList = files.join(' ');
    const patch = this.exec(`git diff HEAD ${fileList}`, { silent: true });

    fs.writeFileSync(outputPath, patch, 'utf8');

    if (this.config.verbose) {
      console.log(chalk.green(`✓ Generated patch: ${outputPath}`));
    }

    return outputPath;
  }

  /**
   * Apply patch file
   * @param {string} patchPath - Patch file path
   * @param {Object} options - Apply options
   * @returns {Object} Apply result
   */
  applyPatch(patchPath, options = {}) {
    const {
      threeWay = false,
      check = false,
      reverse = false,
    } = options;

    if (!fs.existsSync(patchPath)) {
      throw new Error(`Patch file not found: ${patchPath}`);
    }

    let cmd = 'git apply';
    if (threeWay) cmd += ' --3way';
    if (check) cmd += ' --check';
    if (reverse) cmd += ' --reverse';
    cmd += ` ${patchPath}`;

    try {
      const output = this.exec(cmd, { silent: !this.config.verbose });

      return {
        success: true,
        conflicts: [],
        output,
      };
    } catch (error) {
      // Check for conflicts
      const conflicts = this.getConflictedFiles();

      return {
        success: false,
        conflicts,
        error: error.message,
      };
    }
  }

  /**
   * Get list of conflicted files
   * @returns {Array<string>} Conflicted files
   */
  getConflictedFiles() {
    try {
      const status = this.exec('git diff --name-only --diff-filter=U', { silent: true });
      return status.trim().split('\n').filter(f => f);
    } catch {
      return [];
    }
  }

  /**
   * Resolve conflicts by choosing a strategy
   * @param {string} file - File with conflict
   * @param {string} strategy - Resolution strategy (ours, theirs, merge)
   */
  resolveConflict(file, strategy = 'ours') {
    switch (strategy) {
      case 'ours':
        this.exec(`git checkout --ours ${file}`);
        break;

      case 'theirs':
        this.exec(`git checkout --theirs ${file}`);
        break;

      case 'merge':
        // Keep conflict markers for manual resolution
        break;

      default:
        throw new Error(`Unknown resolution strategy: ${strategy}`);
    }

    if (strategy !== 'merge') {
      this.exec(`git add ${file}`);
    }
  }

  /**
   * Create a stash
   * @param {string} message - Stash message
   * @returns {string} Stash reference
   */
  createStash(message = 'PRPROMPTS auto-stash') {
    const output = this.exec(`git stash push -m "${message}"`);

    if (this.config.verbose) {
      console.log(chalk.green('✓ Created stash'));
    }

    return output.trim();
  }

  /**
   * Pop most recent stash
   */
  popStash() {
    this.exec('git stash pop');

    if (this.config.verbose) {
      console.log(chalk.green('✓ Applied stash'));
    }
  }

  /**
   * Get diff between two commits/branches
   * @param {string} base - Base reference
   * @param {string} target - Target reference
   * @param {Object} options - Diff options
   * @returns {string} Diff output
   */
  getDiff(base, target = 'HEAD', options = {}) {
    const {
      nameOnly = false,
      stat = false,
      unified = 3,
    } = options;

    let cmd = 'git diff';
    if (nameOnly) cmd += ' --name-only';
    if (stat) cmd += ' --stat';
    cmd += ` --unified=${unified}`;
    cmd += ` ${base}..${target}`;

    return this.exec(cmd, { silent: true });
  }

  /**
   * Get commit history
   * @param {number} count - Number of commits
   * @param {string} format - Format string
   * @returns {Array<Object>} Commits
   */
  getCommitHistory(count = 10, format = '%H|%an|%ae|%at|%s') {
    const output = this.exec(`git log -n ${count} --format="${format}"`, { silent: true });
    const lines = output.trim().split('\n');

    return lines.map(line => {
      const [hash, authorName, authorEmail, timestamp, subject] = line.split('|');
      return {
        hash,
        authorName,
        authorEmail,
        timestamp: parseInt(timestamp) * 1000,
        subject,
      };
    });
  }

  /**
   * Get file blame information
   * @param {string} file - File path
   * @returns {Array<Object>} Blame lines
   */
  getBlame(file) {
    const output = this.exec(`git blame --line-porcelain ${file}`, { silent: true });
    const lines = output.split('\n');

    const blame = [];
    let current = {};

    for (const line of lines) {
      if (line.match(/^[a-f0-9]{40}/)) {
        if (Object.keys(current).length > 0) {
          blame.push(current);
        }
        current = { hash: line.split(' ')[0] };
      } else if (line.startsWith('author ')) {
        current.author = line.substring(7);
      } else if (line.startsWith('author-time ')) {
        current.timestamp = parseInt(line.substring(12)) * 1000;
      } else if (line.startsWith('\t')) {
        current.content = line.substring(1);
      }
    }

    if (Object.keys(current).length > 0) {
      blame.push(current);
    }

    return blame;
  }

  /**
   * Execute Git command
   * @param {string} cmd - Git command
   * @param {Object} options - Execution options
   * @returns {string} Command output
   */
  exec(cmd, options = {}) {
    const { silent = false } = options;

    try {
      const output = execSync(cmd, {
        cwd: this.config.repoPath,
        encoding: 'utf8',
        stdio: silent ? 'pipe' : 'inherit',
      });

      return output || '';
    } catch (error) {
      if (this.config.verbose && !silent) {
        console.error(chalk.red(`Git command failed: ${cmd}`));
        console.error(chalk.gray(error.message));
      }
      throw error;
    }
  }

  /**
   * Get repository information
   * @returns {Object} Repository info
   */
  getRepoInfo() {
    if (!this.isGitRepo()) {
      return null;
    }

    return {
      isGitRepo: true,
      currentBranch: this.getCurrentBranch(),
      isClean: this.isWorkingTreeClean(),
      remoteUrl: this.getRemoteUrl(),
      lastCommit: this.getCommitHistory(1)[0],
    };
  }

  /**
   * Get remote URL
   * @returns {string|null} Remote URL
   */
  getRemoteUrl() {
    try {
      return this.exec('git config --get remote.origin.url', { silent: true }).trim();
    } catch {
      return null;
    }
  }

  /**
   * Check if Git is installed
   * @returns {boolean} Git is available
   */
  static isGitAvailable() {
    try {
      execSync('git --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = GitIntegration;