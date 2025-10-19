/**
 * PRPROMPTS Generator - Updater Module Tests
 * Tests for the auto-update functionality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mock modules
jest.mock('fs');
jest.mock('child_process');
jest.mock('https');

describe('Updater Module Tests', () => {
  let updater;
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.resetModules();

    // Reset environment
    delete process.env.PRPROMPTS_AUTO_UPDATE;
    delete process.env.PRPROMPTS_UPDATE_CHANNEL;

    // Mock fs operations
    fs.existsSync = jest.fn().mockReturnValue(true);
    fs.readFileSync = jest.fn();
    fs.writeFileSync = jest.fn();
    fs.mkdirSync = jest.fn();
    fs.copyFileSync = jest.fn();
    fs.readdirSync = jest.fn().mockReturnValue([]);

    // Load updater after mocks are set
    updater = require('../lib/updater');
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('checkForUpdates', () => {
    test('should check GitHub for latest release', async () => {
      const mockResponse = {
        tag_name: 'v4.1.0',
        name: 'Release 4.1.0',
        published_at: '2024-01-01T00:00:00Z',
        body: 'New features and bug fixes',
        assets: [{
          name: 'prprompts-flutter-generator-4.1.0.tgz',
          browser_download_url: 'https://github.com/releases/download/v4.1.0/package.tgz'
        }]
      };

      // Mock GitHub API response
      const https = require('https');
      https.get = jest.fn((url, callback) => {
        const response = {
          statusCode: 200,
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              handler(JSON.stringify(mockResponse));
            } else if (event === 'end') {
              handler();
            }
          })
        };
        callback(response);
        return { on: jest.fn() };
      });

      const result = await updater.checkForUpdates('4.0.0');

      expect(result).toBeDefined();
      expect(result.hasUpdate).toBe(true);
      expect(result.latestVersion).toBe('4.1.0');
      expect(result.currentVersion).toBe('4.0.0');
    });

    test('should return no update when current version is latest', async () => {
      const mockResponse = {
        tag_name: 'v4.0.0',
        name: 'Release 4.0.0'
      };

      const https = require('https');
      https.get = jest.fn((url, callback) => {
        const response = {
          statusCode: 200,
          on: jest.fn((event, handler) => {
            if (event === 'data') {
              handler(JSON.stringify(mockResponse));
            } else if (event === 'end') {
              handler();
            }
          })
        };
        callback(response);
        return { on: jest.fn() };
      });

      const result = await updater.checkForUpdates('4.0.0');

      expect(result.hasUpdate).toBe(false);
      expect(result.latestVersion).toBe('4.0.0');
    });

    test('should handle network errors gracefully', async () => {
      const https = require('https');
      https.get = jest.fn(() => {
        const req = { on: jest.fn() };
        setTimeout(() => {
          const errorHandler = req.on.mock.calls.find(call => call[0] === 'error')[1];
          errorHandler(new Error('Network error'));
        }, 0);
        return req;
      });

      const result = await updater.checkForUpdates('4.0.0');

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Network error');
    });
  });

  describe('compareVersions', () => {
    test('should correctly compare semantic versions', () => {
      expect(updater.compareVersions('4.0.0', '4.0.0')).toBe(0);
      expect(updater.compareVersions('4.0.0', '4.1.0')).toBe(-1);
      expect(updater.compareVersions('4.1.0', '4.0.0')).toBe(1);
      expect(updater.compareVersions('4.0.0', '5.0.0')).toBe(-1);
      expect(updater.compareVersions('4.0.1', '4.0.0')).toBe(1);
      expect(updater.compareVersions('4.0.0-beta', '4.0.0')).toBe(-1);
    });

    test('should handle version strings with v prefix', () => {
      expect(updater.compareVersions('v4.0.0', 'v4.0.0')).toBe(0);
      expect(updater.compareVersions('v4.0.0', '4.0.0')).toBe(0);
      expect(updater.compareVersions('4.0.0', 'v4.1.0')).toBe(-1);
    });
  });

  describe('performUpdate', () => {
    test('should backup current installation before update', async () => {
      fs.existsSync = jest.fn().mockReturnValue(true);
      execSync.mockImplementation(() => '');

      await updater.performUpdate('4.1.0');

      // Check backup was created
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('backups'),
        expect.any(Object)
      );
      expect(fs.copyFileSync).toHaveBeenCalled();
    });

    test('should install new version via npm', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('npm install')) {
          return 'Package installed successfully';
        }
        return '';
      });

      const result = await updater.performUpdate('4.1.0');

      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('npm install -g prprompts-flutter-generator@4.1.0'),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });

    test('should rollback on update failure', async () => {
      let callCount = 0;
      execSync.mockImplementation((cmd) => {
        callCount++;
        if (cmd.includes('npm install') && callCount === 1) {
          throw new Error('Installation failed');
        }
        return '';
      });

      const result = await updater.performUpdate('4.1.0');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Installation failed');
      // Should attempt rollback
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('backup'),
        expect.any(Object)
      );
    });
  });

  describe('backupInstallation', () => {
    test('should create timestamped backup directory', () => {
      const backupPath = updater.backupInstallation();

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('backup-'),
        { recursive: true }
      );
      expect(backupPath).toContain('backup-');
    });

    test('should copy all critical files to backup', () => {
      fs.readdirSync = jest.fn()
        .mockReturnValueOnce(['package.json', 'bin', 'lib'])
        .mockReturnValueOnce(['prprompts'])
        .mockReturnValueOnce(['updater.js']);

      fs.statSync = jest.fn().mockReturnValue({
        isDirectory: jest.fn().mockReturnValue(false)
      });

      updater.backupInstallation();

      expect(fs.copyFileSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('rollbackToPrevious', () => {
    test('should restore from most recent backup', () => {
      fs.readdirSync = jest.fn().mockReturnValue([
        'backup-20240101-120000',
        'backup-20240102-120000',
        'backup-20240103-120000'
      ]);

      fs.statSync = jest.fn().mockReturnValue({
        isDirectory: jest.fn().mockReturnValue(true)
      });

      const result = updater.rollbackToPrevious();

      expect(result.success).toBe(true);
      expect(result.restoredFrom).toContain('backup-20240103-120000');
    });

    test('should handle no backups available', () => {
      fs.readdirSync = jest.fn().mockReturnValue([]);

      const result = updater.rollbackToPrevious();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No backups available');
    });
  });

  describe('getUpdateChannel', () => {
    test('should respect environment variable', () => {
      process.env.PRPROMPTS_UPDATE_CHANNEL = 'beta';
      expect(updater.getUpdateChannel()).toBe('beta');

      process.env.PRPROMPTS_UPDATE_CHANNEL = 'stable';
      expect(updater.getUpdateChannel()).toBe('stable');
    });

    test('should default to stable channel', () => {
      delete process.env.PRPROMPTS_UPDATE_CHANNEL;
      expect(updater.getUpdateChannel()).toBe('stable');
    });
  });

  describe('isAutoUpdateEnabled', () => {
    test('should check environment and config', () => {
      // Environment variable takes precedence
      process.env.PRPROMPTS_AUTO_UPDATE = 'false';
      expect(updater.isAutoUpdateEnabled()).toBe(false);

      process.env.PRPROMPTS_AUTO_UPDATE = 'true';
      expect(updater.isAutoUpdateEnabled()).toBe(true);

      // Config file fallback
      delete process.env.PRPROMPTS_AUTO_UPDATE;
      fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify({
        features: { auto_update: false }
      }));
      expect(updater.isAutoUpdateEnabled()).toBe(false);
    });

    test('should default to true if not configured', () => {
      delete process.env.PRPROMPTS_AUTO_UPDATE;
      fs.existsSync = jest.fn().mockReturnValue(false);
      expect(updater.isAutoUpdateEnabled()).toBe(true);
    });
  });

  describe('cleanOldBackups', () => {
    test('should remove backups older than retention period', () => {
      const now = Date.now();
      const oldDate = new Date(now - 31 * 24 * 60 * 60 * 1000); // 31 days old
      const recentDate = new Date(now - 5 * 24 * 60 * 60 * 1000); // 5 days old

      fs.readdirSync = jest.fn().mockReturnValue([
        'backup-old',
        'backup-recent'
      ]);

      fs.statSync = jest.fn()
        .mockReturnValueOnce({
          isDirectory: () => true,
          mtime: oldDate
        })
        .mockReturnValueOnce({
          isDirectory: () => true,
          mtime: recentDate
        });

      fs.rmSync = jest.fn();

      updater.cleanOldBackups(30); // 30 days retention

      expect(fs.rmSync).toHaveBeenCalledTimes(1);
      expect(fs.rmSync).toHaveBeenCalledWith(
        expect.stringContaining('backup-old'),
        { recursive: true, force: true }
      );
    });
  });
});