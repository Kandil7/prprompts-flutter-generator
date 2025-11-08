/**
 * ArtifactManager Tests
 *
 * Tests for artifact management and run history tracking
 * - Run lifecycle management
 * - Artifact storage and organization
 * - Diff preservation
 * - Log aggregation
 * - Cleanup and archival
 * - Storage statistics
 */

const ArtifactManager = require('../../../lib/refactoring/utils/ArtifactManager');
const fs = require('fs-extra');
const path = require('path');

describe('ArtifactManager', () => {
  let manager;
  let testDir;

  beforeEach(() => {
    testDir = path.join(__dirname, '__test_artifacts__');
    fs.ensureDirSync(testDir);

    manager = new ArtifactManager({
      basePath: testDir,
      compress: false,
      maxRuns: 10,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      verbose: false
    });
  });

  afterEach(() => {
    fs.removeSync(testDir);
  });

  describe('Initialization', () => {
    test('should create directory structure', async () => {
      await manager.initialize(testDir);

      expect(fs.existsSync(path.join(testDir, 'runs'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'artifacts'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'backups'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'logs'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'archive'))).toBe(true);
    });

    test('should set project path', async () => {
      await manager.initialize(testDir);
      expect(manager.projectPath).toBe(testDir);
    });
  });

  describe('Run Lifecycle', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
    });

    test('should start new run', async () => {
      const run = await manager.startRun({
        projectName: 'test-project',
        source: 'react-app'
      });

      expect(run.id).toBeDefined();
      expect(run.id).toMatch(/^run-\d+$/);
      expect(run.status).toBe('in_progress');
      expect(run.metadata.projectName).toBe('test-project');
      expect(run.startedAt).toBeDefined();
    });

    test('should create run directory structure', async () => {
      const run = await manager.startRun();
      const runPath = path.join(testDir, 'runs', run.id);

      expect(fs.existsSync(runPath)).toBe(true);
      expect(fs.existsSync(path.join(runPath, 'diffs'))).toBe(true);
      expect(fs.existsSync(path.join(runPath, 'files'))).toBe(true);
      expect(fs.existsSync(path.join(runPath, 'logs'))).toBe(true);
      expect(fs.existsSync(path.join(runPath, 'metadata'))).toBe(true);
    });

    test('should save run metadata', async () => {
      const run = await manager.startRun({ test: 'data' });
      const metadataPath = path.join(testDir, 'runs', run.id, 'meta.json');

      expect(fs.existsSync(metadataPath)).toBe(true);

      const metadata = fs.readJsonSync(metadataPath);
      expect(metadata.id).toBe(run.id);
      expect(metadata.metadata.test).toBe('data');
    });

    test('should set current run', async () => {
      const run = await manager.startRun();
      expect(manager.currentRun).toEqual(run);
    });

    test('should end run with status', async () => {
      await manager.startRun();
      await manager.endRun('success');

      expect(manager.currentRun).toBeNull();
    });

    test('should save completion data on end', async () => {
      const run = await manager.startRun();
      await manager.endRun('success');

      const metadata = await manager.loadRunMetadata(run.id);
      expect(metadata.status).toBe('success');
      expect(metadata.completedAt).toBeDefined();
      expect(metadata.duration).toBeGreaterThan(0);
    });

    test('should throw error when ending without active run', async () => {
      await expect(manager.endRun('success')).rejects.toThrow('No active run');
    });
  });

  describe('Artifact Storage', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
      await manager.startRun();
    });

    afterEach(async () => {
      if (manager.currentRun) {
        await manager.endRun('success');
      }
    });

    test('should save feature artifacts', async () => {
      const artifacts = {
        metadata: {
          featureType: 'authentication',
          complexity: 'medium'
        },
        files: [
          {
            relativePath: 'login_screen.dart',
            content: 'class LoginScreen {}'
          }
        ],
        diffs: [
          {
            name: 'login_screen',
            content: 'diff content here'
          }
        ]
      };

      await manager.saveFeatureArtifacts('login', artifacts);

      const featurePath = path.join(testDir, 'artifacts', 'features', 'login');
      expect(fs.existsSync(featurePath)).toBe(true);
      expect(fs.existsSync(path.join(featurePath, 'meta.json'))).toBe(true);
    });

    test('should save feature files', async () => {
      const artifacts = {
        metadata: {},
        files: [
          {
            relativePath: 'widgets/button.dart',
            content: 'class CustomButton {}'
          }
        ],
        diffs: []
      };

      await manager.saveFeatureArtifacts('widgets', artifacts);

      const filePath = path.join(testDir, 'artifacts', 'features', 'widgets', 'files', 'widgets', 'button.dart');
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe('class CustomButton {}');
    });

    test('should save feature diffs', async () => {
      const artifacts = {
        metadata: {},
        files: [],
        diffs: [
          {
            name: 'changes',
            content: 'diff --git a/file.dart b/file.dart\n+new line'
          }
        ]
      };

      await manager.saveFeatureArtifacts('changes', artifacts);

      const diffPath = path.join(testDir, 'artifacts', 'features', 'changes', 'diffs', 'changes.diff');
      expect(fs.existsSync(diffPath)).toBe(true);
      expect(fs.readFileSync(diffPath, 'utf8')).toContain('diff --git');
    });

    test('should update run metadata with feature info', async () => {
      const artifacts = {
        metadata: {},
        files: [{ relativePath: 'a.dart', content: 'a' }],
        diffs: [{ name: 'd', content: 'diff' }]
      };

      await manager.saveFeatureArtifacts('test-feature', artifacts);

      expect(manager.currentRun.features).toHaveLength(1);
      expect(manager.currentRun.features[0].name).toBe('test-feature');
      expect(manager.currentRun.features[0].files).toBe(1);
      expect(manager.currentRun.features[0].diffs).toBe(1);
    });
  });

  describe('Diff Management', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
      await manager.startRun();
    });

    afterEach(async () => {
      if (manager.currentRun) {
        await manager.endRun('success');
      }
    });

    test('should save diff for file', async () => {
      const diff = 'diff --git a/test.dart b/test.dart\n-old\n+new';
      await manager.saveDiff('test.dart', diff);

      const diffPath = path.join(testDir, 'runs', manager.currentRun.id, 'diffs', 'test.dart.diff');
      expect(fs.existsSync(diffPath)).toBe(true);
      expect(fs.readFileSync(diffPath, 'utf8')).toBe(diff);
    });

    test('should create parent directories for nested paths', async () => {
      await manager.saveDiff('lib/widgets/button.dart', 'diff content');

      const diffPath = path.join(
        testDir,
        'runs',
        manager.currentRun.id,
        'diffs',
        'lib/widgets/button.dart.diff'
      );
      expect(fs.existsSync(diffPath)).toBe(true);
    });
  });

  describe('Generated Files', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
      await manager.startRun();
    });

    afterEach(async () => {
      if (manager.currentRun) {
        await manager.endRun('success');
      }
    });

    test('should save generated file', async () => {
      const content = 'class GeneratedWidget {}';
      await manager.saveGeneratedFile('lib/generated.dart', content);

      const filePath = path.join(
        testDir,
        'runs',
        manager.currentRun.id,
        'files',
        'lib/generated.dart'
      );
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
    });

    test('should compress files when enabled', async () => {
      const compressedManager = new ArtifactManager({
        basePath: testDir,
        compress: true,
        verbose: false
      });

      await compressedManager.initialize(testDir);
      await compressedManager.startRun();

      await compressedManager.saveGeneratedFile('test.dart', 'content');

      const gzPath = path.join(
        testDir,
        'runs',
        compressedManager.currentRun.id,
        'files',
        'test.dart.gz'
      );
      expect(fs.existsSync(gzPath)).toBe(true);

      await compressedManager.endRun('success');
    });
  });

  describe('Logging', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
      await manager.startRun();
    });

    afterEach(async () => {
      if (manager.currentRun) {
        await manager.endRun('success');
      }
    });

    test('should log messages', async () => {
      await manager.log('info', 'Test message', { extra: 'data' });

      expect(manager.currentRun.logs).toHaveLength(1);
      expect(manager.currentRun.logs[0].level).toBe('info');
      expect(manager.currentRun.logs[0].message).toBe('Test message');
      expect(manager.currentRun.logs[0].data.extra).toBe('data');
    });

    test('should write logs to file', async () => {
      await manager.log('info', 'File log test');

      const logPath = path.join(
        testDir,
        'runs',
        manager.currentRun.id,
        'logs',
        'info.log'
      );
      expect(fs.existsSync(logPath)).toBe(true);

      const content = fs.readFileSync(logPath, 'utf8');
      expect(content).toContain('File log test');
    });

    test('should log errors with stack trace', async () => {
      const error = new Error('Test error');
      await manager.logError(error, { context: 'test' });

      expect(manager.currentRun.errors).toHaveLength(1);
      expect(manager.currentRun.errors[0].message).toBe('Test error');
      expect(manager.currentRun.errors[0].stack).toBeDefined();
      expect(manager.currentRun.errors[0].context.context).toBe('test');
    });

    test('should skip logging when no active run', async () => {
      await manager.endRun('success');
      await manager.log('info', 'Should be skipped');
      // Should not throw
    });
  });

  describe('Run History', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
    });

    test('should get all runs', async () => {
      // Create multiple runs
      for (let i = 0; i < 3; i++) {
        await manager.startRun({ iteration: i });
        await manager.endRun('success');
      }

      const allRuns = await manager.getAllRuns();
      expect(allRuns).toHaveLength(3);
      expect(allRuns[0].timestamp).toBeGreaterThan(allRuns[1].timestamp); // Newest first
    });

    test('should get recent runs', async () => {
      for (let i = 0; i < 5; i++) {
        await manager.startRun();
        await manager.endRun('success');
      }

      const recentRuns = await manager.getRecentRuns(3);
      expect(recentRuns).toHaveLength(3);
    });

    test('should load run metadata', async () => {
      const run = await manager.startRun({ test: 'value' });
      await manager.endRun('success');

      const loaded = await manager.loadRunMetadata(run.id);
      expect(loaded.id).toBe(run.id);
      expect(loaded.metadata.test).toBe('value');
      expect(loaded.status).toBe('success');
    });

    test('should throw error for missing run', async () => {
      await expect(manager.loadRunMetadata('nonexistent-run')).rejects.toThrow('Run not found');
    });
  });

  describe('Run Archival', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
    });

    test('should archive run', async () => {
      const run = await manager.startRun();
      await manager.endRun('success');

      await manager.archiveRun(run.id);

      const runPath = path.join(testDir, 'runs', run.id);
      expect(fs.existsSync(runPath)).toBe(false);
    });

    test('should delete run', async () => {
      const run = await manager.startRun();
      await manager.endRun('success');

      await manager.deleteRun(run.id);

      const runPath = path.join(testDir, 'runs', run.id);
      expect(fs.existsSync(runPath)).toBe(false);
    });
  });

  describe('Cleanup', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
    });

    test('should delete runs beyond maxRuns limit', async () => {
      const limitedManager = new ArtifactManager({
        basePath: testDir,
        maxRuns: 3,
        verbose: false
      });

      await limitedManager.initialize(testDir);

      // Create 5 runs
      for (let i = 0; i < 5; i++) {
        await limitedManager.startRun();
        await limitedManager.endRun('success');
        await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different timestamps
      }

      const statsBefore = await limitedManager.cleanup();
      expect(statsBefore.deleted).toBe(2); // 5 - 3 = 2 deleted

      const allRuns = await limitedManager.getAllRuns();
      expect(allRuns).toHaveLength(3);
    });

    test('should archive old runs', async () => {
      const ageManager = new ArtifactManager({
        basePath: testDir,
        maxAge: 100, // 100ms
        verbose: false
      });

      await ageManager.initialize(testDir);

      await ageManager.startRun();
      await ageManager.endRun('success');

      // Wait for run to age
      await new Promise(resolve => setTimeout(resolve, 150));

      const stats = await ageManager.cleanup();
      expect(stats.archived).toBeGreaterThan(0);
    });
  });

  describe('Storage Statistics', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
    });

    test('should calculate storage statistics', async () => {
      await manager.startRun();
      await manager.saveGeneratedFile('test.dart', 'content');
      await manager.endRun('success');

      const stats = await manager.getStorageStats();
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.runs).toBeGreaterThan(0);
    });

    test('should format bytes correctly', () => {
      expect(manager.formatBytes(0)).toBe('0 B');
      expect(manager.formatBytes(1024)).toBe('1.00 KB');
      expect(manager.formatBytes(1048576)).toBe('1.00 MB');
      expect(manager.formatBytes(1073741824)).toBe('1.00 GB');
    });
  });

  describe('Run Reports', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
    });

    test('should generate run report', async () => {
      await manager.startRun();
      await manager.saveFeatureArtifacts('feature1', {
        metadata: {},
        files: [{ relativePath: 'a.dart', content: 'a' }],
        diffs: [{ name: 'd', content: 'diff' }]
      });
      await manager.endRun('success');

      const report = await manager.generateRunReport(manager.currentRun.id);
      expect(report.status).toBe('success');
      expect(report.features).toBe(1);
      expect(report.summary.totalFiles).toBe(1);
      expect(report.summary.totalDiffs).toBe(1);
    });
  });

  describe('Export Functionality', () => {
    beforeEach(async () => {
      await manager.initialize(testDir);
    });

    test('should export run to directory', async () => {
      const run = await manager.startRun();
      await manager.saveGeneratedFile('export.dart', 'export content');
      await manager.endRun('success');

      const exportPath = path.join(testDir, 'exported');
      await manager.exportRun(run.id, exportPath);

      expect(fs.existsSync(exportPath)).toBe(true);
      expect(fs.existsSync(path.join(exportPath, 'meta.json'))).toBe(true);
    });
  });

  describe('Hash Utilities', () => {
    test('should generate consistent hash for same content', () => {
      const hash1 = manager.getHash('test content');
      const hash2 = manager.getHash('test content');

      expect(hash1).toBe(hash2);
    });

    test('should generate different hash for different content', () => {
      const hash1 = manager.getHash('content 1');
      const hash2 = manager.getHash('content 2');

      expect(hash1).not.toBe(hash2);
    });
  });
});
