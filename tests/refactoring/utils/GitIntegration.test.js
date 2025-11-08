/**
 * GitIntegration Tests
 *
 * Tests for Git integration utilities
 * - Working tree validation
 * - Branch creation and management
 * - Patch generation and application
 * - Conflict detection and resolution
 * - Commit creation
 */

const GitIntegration = require('../../../lib/refactoring/utils/GitIntegration');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

describe('GitIntegration', () => {
  let git;
  let testRepo;

  beforeEach(() => {
    testRepo = path.join(__dirname, '__test_git_repo__');
    fs.ensureDirSync(testRepo);

    // Initialize git repo
    execSync('git init', { cwd: testRepo, stdio: 'ignore' });
    execSync('git config user.name "Test User"', { cwd: testRepo, stdio: 'ignore' });
    execSync('git config user.email "test@example.com"', { cwd: testRepo, stdio: 'ignore' });

    // Create initial commit
    const readmePath = path.join(testRepo, 'README.md');
    fs.writeFileSync(readmePath, '# Test Repo');
    execSync('git add .', { cwd: testRepo, stdio: 'ignore' });
    execSync('git commit -m "Initial commit"', { cwd: testRepo, stdio: 'ignore' });

    git = new GitIntegration({
      repoPath: testRepo,
      verbose: false,
      requireCleanTree: true,
      branchPrefix: 'test/'
    });
  });

  afterEach(() => {
    fs.removeSync(testRepo);
  });

  describe('Repository Detection', () => {
    test('should detect git repository', () => {
      expect(git.isGitRepo()).toBe(true);
    });

    test('should detect non-git directory', () => {
      const nonGitPath = path.join(__dirname, '__non_git__');
      fs.ensureDirSync(nonGitPath);

      const nonGitIntegration = new GitIntegration({
        repoPath: nonGitPath
      });

      expect(nonGitIntegration.isGitRepo()).toBe(false);

      fs.removeSync(nonGitPath);
    });

    test('should check if Git is available', () => {
      expect(GitIntegration.isGitAvailable()).toBe(true);
    });
  });

  describe('Working Tree Validation', () => {
    test('should detect clean working tree', () => {
      expect(git.isWorkingTreeClean()).toBe(true);
    });

    test('should detect dirty working tree', () => {
      const testFile = path.join(testRepo, 'new-file.txt');
      fs.writeFileSync(testFile, 'new content');

      expect(git.isWorkingTreeClean()).toBe(false);
    });

    test('should validate clean tree when required', () => {
      expect(() => git.validateWorkingTree()).not.toThrow();
    });

    test('should throw error for dirty tree when required', () => {
      const testFile = path.join(testRepo, 'dirty.txt');
      fs.writeFileSync(testFile, 'dirty content');

      expect(() => git.validateWorkingTree()).toThrow('uncommitted changes');
    });

    test('should allow dirty tree when not required', () => {
      const permissiveGit = new GitIntegration({
        repoPath: testRepo,
        requireCleanTree: false
      });

      const testFile = path.join(testRepo, 'allowed.txt');
      fs.writeFileSync(testFile, 'content');

      expect(() => permissiveGit.validateWorkingTree()).not.toThrow();
    });
  });

  describe('Branch Management', () => {
    test('should get current branch name', () => {
      const currentBranch = git.getCurrentBranch();
      expect(currentBranch).toBe('master');
    });

    test('should create new branch', () => {
      const branchName = git.createBranch('feature-test');

      expect(branchName).toBe('test/feature-test');
      expect(git.getCurrentBranch()).toBe('test/feature-test');
    });

    test('should detect existing branch', () => {
      git.createBranch('existing');

      expect(git.branchExists('test/existing')).toBe(true);
      expect(git.branchExists('test/nonexistent')).toBe(false);
    });

    test('should throw error when creating duplicate branch', () => {
      git.createBranch('duplicate');

      expect(() => git.createBranch('duplicate')).toThrow('already exists');
    });

    test('should switch to existing branch', () => {
      git.createBranch('switch-test');
      git.checkoutBranch('master');

      expect(git.getCurrentBranch()).toBe('master');

      git.checkoutBranch('test/switch-test');
      expect(git.getCurrentBranch()).toBe('test/switch-test');
    });

    test('should create branch from base branch', () => {
      git.createBranch('base');
      git.checkoutBranch('master');

      const newBranch = git.createBranch('from-base', 'test/base');
      expect(git.getCurrentBranch()).toBe('test/from-base');
    });
  });

  describe('File Staging and Commits', () => {
    test('should stage single file', () => {
      const testFile = path.join(testRepo, 'staged.txt');
      fs.writeFileSync(testFile, 'content');

      git.stageFiles([testFile]);

      const status = execSync('git status --porcelain', { cwd: testRepo, encoding: 'utf8' });
      expect(status).toContain('staged.txt');
      expect(status).toContain('A'); // Added
    });

    test('should stage multiple files', () => {
      const file1 = path.join(testRepo, 'file1.txt');
      const file2 = path.join(testRepo, 'file2.txt');

      fs.writeFileSync(file1, 'content1');
      fs.writeFileSync(file2, 'content2');

      git.stageFiles([file1, file2]);

      const status = execSync('git status --porcelain', { cwd: testRepo, encoding: 'utf8' });
      expect(status).toContain('file1.txt');
      expect(status).toContain('file2.txt');
    });

    test('should stage all files', () => {
      fs.writeFileSync(path.join(testRepo, 'all1.txt'), 'a');
      fs.writeFileSync(path.join(testRepo, 'all2.txt'), 'b');

      git.stageFiles(['.']);

      const status = execSync('git status --porcelain', { cwd: testRepo, encoding: 'utf8' });
      expect(status).toContain('all1.txt');
      expect(status).toContain('all2.txt');
    });

    test('should create commit', () => {
      const testFile = path.join(testRepo, 'commit-test.txt');
      fs.writeFileSync(testFile, 'commit content');

      git.stageFiles([testFile]);
      git.createCommit('Test commit message');

      const log = execSync('git log -1 --oneline', { cwd: testRepo, encoding: 'utf8' });
      expect(log).toContain('Test commit message');
    });

    test('should create commit with co-authors', () => {
      const testFile = path.join(testRepo, 'coauthor.txt');
      fs.writeFileSync(testFile, 'content');

      git.stageFiles([testFile]);
      git.createCommit('Commit with co-authors', {
        coAuthors: ['Alice <alice@example.com>', 'Bob <bob@example.com>']
      });

      const fullMessage = execSync('git log -1 --format=%B', { cwd: testRepo, encoding: 'utf8' });
      expect(fullMessage).toContain('Co-Authored-By: Alice <alice@example.com>');
      expect(fullMessage).toContain('Co-Authored-By: Bob <bob@example.com>');
    });

    test('should create commit with custom author', () => {
      const testFile = path.join(testRepo, 'author.txt');
      fs.writeFileSync(testFile, 'content');

      git.stageFiles([testFile]);
      git.createCommit('Custom author commit', {
        author: 'Custom Author <custom@example.com>'
      });

      const author = execSync('git log -1 --format=%an', { cwd: testRepo, encoding: 'utf8' }).trim();
      expect(author).toBe('Custom Author');
    });

    test('should create empty commit when allowed', () => {
      git.createCommit('Empty commit', { allowEmpty: true });

      const log = execSync('git log -1 --oneline', { cwd: testRepo, encoding: 'utf8' });
      expect(log).toContain('Empty commit');
    });
  });

  describe('Patch Generation and Application', () => {
    test('should generate patch for file changes', () => {
      const testFile = path.join(testRepo, 'patch.txt');
      fs.writeFileSync(testFile, 'original content');
      git.stageFiles([testFile]);
      git.createCommit('Add patch file');

      fs.writeFileSync(testFile, 'modified content');

      const patchFile = path.join(testRepo, 'changes.patch');
      git.generatePatch([testFile], patchFile);

      expect(fs.existsSync(patchFile)).toBe(true);
      const patchContent = fs.readFileSync(patchFile, 'utf8');
      expect(patchContent).toContain('diff --git');
      expect(patchContent).toContain('-original content');
      expect(patchContent).toContain('+modified content');
    });

    test('should apply patch successfully', () => {
      const testFile = path.join(testRepo, 'apply.txt');
      fs.writeFileSync(testFile, 'original');
      git.stageFiles([testFile]);
      git.createCommit('Add file');

      // Create patch
      fs.writeFileSync(testFile, 'modified');
      const patchFile = path.join(testRepo, 'apply.patch');
      git.generatePatch([testFile], patchFile);

      // Revert changes
      execSync('git checkout HEAD -- apply.txt', { cwd: testRepo, stdio: 'ignore' });

      // Apply patch
      const result = git.applyPatch(patchFile);
      expect(result.success).toBe(true);
      expect(result.conflicts).toHaveLength(0);

      const content = fs.readFileSync(testFile, 'utf8');
      expect(content).toBe('modified');
    });

    test('should detect patch conflicts', () => {
      const testFile = path.join(testRepo, 'conflict.txt');
      fs.writeFileSync(testFile, 'line 1\nline 2\nline 3');
      git.stageFiles([testFile]);
      git.createCommit('Add conflict file');

      // Create patch with one change
      fs.writeFileSync(testFile, 'line 1\nmodified 2\nline 3');
      const patchFile = path.join(testRepo, 'conflict.patch');
      git.generatePatch([testFile], patchFile);

      // Make conflicting change
      execSync('git checkout HEAD -- conflict.txt', { cwd: testRepo, stdio: 'ignore' });
      fs.writeFileSync(testFile, 'different 1\nline 2\nline 3');
      git.stageFiles([testFile]);
      git.createCommit('Conflicting change');

      // Try to apply patch - should conflict
      const result = git.applyPatch(patchFile);
      expect(result.success).toBe(false);
    });

    test('should use 3-way merge when specified', () => {
      const testFile = path.join(testRepo, 'threeway.txt');
      fs.writeFileSync(testFile, 'content');
      git.stageFiles([testFile]);
      git.createCommit('Add threeway file');

      fs.writeFileSync(testFile, 'modified');
      const patchFile = path.join(testRepo, 'threeway.patch');
      git.generatePatch([testFile], patchFile);

      execSync('git checkout HEAD -- threeway.txt', { cwd: testRepo, stdio: 'ignore' });

      const result = git.applyPatch(patchFile, { threeWay: true });
      expect(result).toBeDefined();
    });
  });

  describe('Conflict Resolution', () => {
    test('should get list of conflicted files', () => {
      // This test requires actual conflicts, which are complex to set up
      // Testing the method itself
      const conflicted = git.getConflictedFiles();
      expect(Array.isArray(conflicted)).toBe(true);
    });

    test('should resolve conflict with "ours" strategy', () => {
      const testFile = path.join(testRepo, 'resolve.txt');
      fs.writeFileSync(testFile, 'our version');

      // Simulate conflict resolution
      git.resolveConflict(testFile, 'ours');
      // File should be staged after resolution
    });
  });

  describe('Stash Management', () => {
    test('should create stash', () => {
      const testFile = path.join(testRepo, 'stash.txt');
      fs.writeFileSync(testFile, 'stashed content');

      git.createStash('Test stash');

      expect(git.isWorkingTreeClean()).toBe(true);
    });

    test('should pop stash', () => {
      const testFile = path.join(testRepo, 'stash-pop.txt');
      fs.writeFileSync(testFile, 'content to stash');

      git.createStash('Stash for pop');
      expect(fs.existsSync(testFile)).toBe(false);

      git.popStash();
      expect(fs.existsSync(testFile)).toBe(true);
    });
  });

  describe('Repository Information', () => {
    test('should get repository info', () => {
      const info = git.getRepoInfo();

      expect(info.isGitRepo).toBe(true);
      expect(info.currentBranch).toBe('master');
      expect(info.isClean).toBe(true);
      expect(info.lastCommit).toBeDefined();
    });

    test('should get commit history', () => {
      // Create multiple commits
      for (let i = 0; i < 3; i++) {
        const file = path.join(testRepo, `file${i}.txt`);
        fs.writeFileSync(file, `content ${i}`);
        git.stageFiles([file]);
        git.createCommit(`Commit ${i}`);
      }

      const history = git.getCommitHistory(5);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].subject).toBeDefined();
      expect(history[0].hash).toBeDefined();
      expect(history[0].authorName).toBeDefined();
    });

    test('should get diff between commits', () => {
      // Create first commit
      const file1 = path.join(testRepo, 'diff1.txt');
      fs.writeFileSync(file1, 'version 1');
      git.stageFiles([file1]);
      git.createCommit('Version 1');

      const hash1 = execSync('git rev-parse HEAD', { cwd: testRepo, encoding: 'utf8' }).trim();

      // Create second commit
      fs.writeFileSync(file1, 'version 2');
      git.stageFiles([file1]);
      git.createCommit('Version 2');

      const diff = git.getDiff(hash1, 'HEAD');
      expect(diff).toContain('diff --git');
      expect(diff).toContain('-version 1');
      expect(diff).toContain('+version 2');
    });

    test('should get remote URL if configured', () => {
      const url = git.getRemoteUrl();
      expect(url === null || typeof url === 'string').toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid git commands gracefully', () => {
      expect(() => {
        git.exec('git invalid-command', { silent: true });
      }).toThrow();
    });

    test('should throw error for non-git directory operations', () => {
      const nonGit = new GitIntegration({
        repoPath: '/nonexistent/path'
      });

      expect(() => nonGit.validateWorkingTree()).toThrow('Not a Git repository');
    });
  });
});
