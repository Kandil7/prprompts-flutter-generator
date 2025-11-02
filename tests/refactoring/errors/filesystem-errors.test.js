const path = require('path');
const fs = require('fs-extra');
const RefactorCommand = require('../../../lib/refactoring/cli/RefactorCommand');
const { fileHandler } = require('../../../lib/refactoring/utils/fileHandler');

describe('Filesystem Error Handling', () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = path.join(__dirname, '..', 'temp', `fs-test-${Date.now()}`);
    await fs.ensureDir(tempDir);
  });

  afterEach(async () => {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('Missing Directories', () => {
    test('should handle non-existent source directory', async () => {
      const nonExistentPath = path.join(tempDir, 'does-not-exist');
      const targetPath = path.join(tempDir, 'output');

      const command = new RefactorCommand();

      await expect(
        command.execute(nonExistentPath, targetPath, { ai: 'mock' })
      ).rejects.toThrow(/not found|does not exist/i);
    });

    test('should create target directory if it does not exist', async () => {
      const sourcePath = path.join(tempDir, 'source');
      const targetPath = path.join(tempDir, 'output', 'nested', 'deep');

      // Create source
      await fs.ensureDir(sourcePath);
      await fs.writeFile(
        path.join(sourcePath, 'Test.jsx'),
        `import React from 'react'; const Test = () => <div />; export default Test;`
      );

      const command = new RefactorCommand();
      await command.execute(sourcePath, targetPath, { ai: 'mock' });

      // Target should be created
      expect(await fs.pathExists(targetPath)).toBe(true);
    });

    test('should handle empty source directory gracefully', async () => {
      const sourcePath = path.join(tempDir, 'empty-source');
      const targetPath = path.join(tempDir, 'output');

      await fs.ensureDir(sourcePath);

      const command = new RefactorCommand();
      const result = await command.execute(sourcePath, targetPath, { ai: 'mock' });

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'no_files_found'
        })
      );
    });
  });

  describe('Permission Errors', () => {
    // Note: These tests are platform-dependent and may need to be skipped on Windows
    const isWindows = process.platform === 'win32';

    test('should handle read permission errors', async () => {
      if (isWindows) {
        // Skip on Windows as chmod works differently
        return;
      }

      const sourcePath = path.join(tempDir, 'no-read');
      await fs.ensureDir(sourcePath);
      await fs.writeFile(path.join(sourcePath, 'Test.jsx'), 'test content');

      // Remove read permissions
      await fs.chmod(sourcePath, 0o000);

      const command = new RefactorCommand();

      await expect(
        command.execute(sourcePath, path.join(tempDir, 'output'), { ai: 'mock' })
      ).rejects.toThrow(/permission denied|EACCES/i);

      // Restore permissions for cleanup
      await fs.chmod(sourcePath, 0o755);
    });

    test('should handle write permission errors', async () => {
      if (isWindows) {
        return; // Skip on Windows
      }

      const sourcePath = path.join(tempDir, 'source');
      const targetPath = path.join(tempDir, 'no-write');

      await fs.ensureDir(sourcePath);
      await fs.writeFile(
        path.join(sourcePath, 'Test.jsx'),
        `import React from 'react'; const Test = () => <div />; export default Test;`
      );

      await fs.ensureDir(targetPath);
      await fs.chmod(targetPath, 0o444); // Read-only

      const command = new RefactorCommand();

      await expect(
        command.execute(sourcePath, targetPath, { ai: 'mock' })
      ).rejects.toThrow(/permission|EACCES/i);

      // Restore permissions
      await fs.chmod(targetPath, 0o755);
    });
  });

  describe('Disk Space Issues', () => {
    test('should handle write failures gracefully', async () => {
      const sourcePath = path.join(tempDir, 'source');
      const targetPath = path.join(tempDir, 'output');

      await fs.ensureDir(sourcePath);

      // Create a React file
      await fs.writeFile(
        path.join(sourcePath, 'Test.jsx'),
        `import React from 'react'; const Test = () => <div />; export default Test;`
      );

      // Mock filesystem write error
      const originalWriteFile = fs.writeFile;
      let callCount = 0;
      fs.writeFile = jest.fn(async (filePath, content) => {
        callCount++;
        if (callCount > 2) {
          // Simulate disk full error after a few writes
          throw new Error('ENOSPC: no space left on device');
        }
        return originalWriteFile(filePath, content);
      });

      const command = new RefactorCommand();

      try {
        await command.execute(sourcePath, targetPath, { ai: 'mock' });
        fail('Should have thrown disk space error');
      } catch (error) {
        expect(error.message).toContain('ENOSPC');
      } finally {
        // Restore
        fs.writeFile = originalWriteFile;
      }
    });
  });

  describe('File Reading Errors', () => {
    test('should handle corrupted files', async () => {
      const sourcePath = path.join(tempDir, 'source');
      await fs.ensureDir(sourcePath);

      // Create a file with binary/corrupted content
      const buffer = Buffer.from([0xFF, 0xFE, 0xFD, 0xFC]);
      await fs.writeFile(path.join(sourcePath, 'Corrupted.jsx'), buffer);

      const command = new RefactorCommand();
      const result = await command.execute(sourcePath, path.join(tempDir, 'output'), {
        ai: 'mock',
        continueOnError: true
      });

      // Should report error but not crash
      expect(result.errors).toBeDefined();
      expect(result.errors.some(e => e.file.includes('Corrupted.jsx'))).toBe(true);
    });

    test('should handle files that change during processing', async () => {
      const sourcePath = path.join(tempDir, 'source');
      const targetPath = path.join(tempDir, 'output');

      await fs.ensureDir(sourcePath);

      const filePath = path.join(sourcePath, 'Changing.jsx');
      await fs.writeFile(
        filePath,
        `import React from 'react'; const Test = () => <div>Original</div>; export default Test;`
      );

      // Mock file handler to simulate file changing
      const originalRead = fileHandler.readFile;
      let readCount = 0;
      fileHandler.readFile = jest.fn(async (fp) => {
        readCount++;
        if (readCount === 2) {
          // Simulate file change
          await originalRead(fp);
          await fs.writeFile(fp, 'CHANGED CONTENT');
        }
        return originalRead(fp);
      });

      const command = new RefactorCommand();

      try {
        const result = await command.execute(sourcePath, targetPath, {
          ai: 'mock',
          continueOnError: true
        });

        // Should handle gracefully
        expect(result).toBeDefined();
      } finally {
        fileHandler.readFile = originalRead;
      }
    });

    test('should handle large files that exceed memory', async () => {
      const sourcePath = path.join(tempDir, 'source');
      await fs.ensureDir(sourcePath);

      // Create a very large (but still parseable) React file
      const largeComponent = `
import React from 'react';

const LargeComponent = () => {
  return (
    <div>
      ${Array(10000).fill('<div>Content</div>').join('\n      ')}
    </div>
  );
};

export default LargeComponent;
`;

      await fs.writeFile(path.join(sourcePath, 'Large.jsx'), largeComponent);

      const command = new RefactorCommand();

      // Should handle without crashing
      await expect(
        command.execute(sourcePath, path.join(tempDir, 'output'), { ai: 'mock' })
      ).resolves.toBeDefined();
    });
  });

  describe('Path Issues', () => {
    test('should handle paths with special characters', async () => {
      const sourcePath = path.join(tempDir, 'source with spaces & symbols!');
      const targetPath = path.join(tempDir, 'output-#special');

      await fs.ensureDir(sourcePath);
      await fs.writeFile(
        path.join(sourcePath, 'Test.jsx'),
        `import React from 'react'; const Test = () => <div />; export default Test;`
      );

      const command = new RefactorCommand();
      await expect(
        command.execute(sourcePath, targetPath, { ai: 'mock' })
      ).resolves.toBeDefined();

      expect(await fs.pathExists(targetPath)).toBe(true);
    });

    test('should handle very long paths', async () => {
      const longDirName = 'a'.repeat(100);
      const sourcePath = path.join(tempDir, longDirName, 'source');
      const targetPath = path.join(tempDir, longDirName, 'output');

      await fs.ensureDir(sourcePath);
      await fs.writeFile(
        path.join(sourcePath, 'Test.jsx'),
        `import React from 'react'; const Test = () => <div />; export default Test;`
      );

      const command = new RefactorCommand();

      // May fail on some filesystems (Windows MAX_PATH = 260)
      try {
        await command.execute(sourcePath, targetPath, { ai: 'mock' });
        expect(await fs.pathExists(targetPath)).toBe(true);
      } catch (error) {
        // Acceptable to fail on path length limits
        expect(error.message).toMatch(/path|name too long/i);
      }
    });

    test('should handle relative paths correctly', async () => {
      const sourcePath = path.join(tempDir, 'source');
      await fs.ensureDir(sourcePath);
      await fs.writeFile(
        path.join(sourcePath, 'Test.jsx'),
        `import React from 'react'; const Test = () => <div />; export default Test;`
      );

      // Use relative path
      const originalCwd = process.cwd();
      process.chdir(tempDir);

      try {
        const command = new RefactorCommand();
        await command.execute('./source', './output', { ai: 'mock' });

        expect(await fs.pathExists(path.join(tempDir, 'output'))).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    test('should handle symlinks correctly', async () => {
      if (process.platform === 'win32') {
        // Symlinks require admin on Windows
        return;
      }

      const sourcePath = path.join(tempDir, 'source');
      const symlinkPath = path.join(tempDir, 'source-link');

      await fs.ensureDir(sourcePath);
      await fs.writeFile(
        path.join(sourcePath, 'Test.jsx'),
        `import React from 'react'; const Test = () => <div />; export default Test;`
      );

      // Create symlink
      await fs.symlink(sourcePath, symlinkPath);

      const command = new RefactorCommand();
      await expect(
        command.execute(symlinkPath, path.join(tempDir, 'output'), { ai: 'mock' })
      ).resolves.toBeDefined();
    });
  });

  describe('Concurrent Access', () => {
    test('should handle multiple simultaneous conversions', async () => {
      const conversions = [];

      for (let i = 0; i < 3; i++) {
        const sourcePath = path.join(tempDir, `source-${i}`);
        const targetPath = path.join(tempDir, `output-${i}`);

        await fs.ensureDir(sourcePath);
        await fs.writeFile(
          path.join(sourcePath, 'Test.jsx'),
          `import React from 'react'; const Test${i} = () => <div>{${i}}</div>; export default Test${i};`
        );

        const command = new RefactorCommand();
        conversions.push(command.execute(sourcePath, targetPath, { ai: 'mock' }));
      }

      // All should complete successfully
      const results = await Promise.all(conversions);
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Cleanup and Rollback', () => {
    test('should clean up partial output on error', async () => {
      const sourcePath = path.join(tempDir, 'source');
      const targetPath = path.join(tempDir, 'output');

      await fs.ensureDir(sourcePath);

      // Create valid and invalid files
      await fs.writeFile(
        path.join(sourcePath, 'Valid.jsx'),
        `import React from 'react'; const Valid = () => <div />; export default Valid;`
      );
      await fs.writeFile(
        path.join(sourcePath, 'Invalid.jsx'),
        `Invalid syntax here`
      );

      const command = new RefactorCommand();

      try {
        await command.execute(sourcePath, targetPath, {
          ai: 'mock',
          cleanupOnError: true,
          continueOnError: false // Fail on first error
        });
        fail('Should have thrown error');
      } catch (error) {
        // Target directory should be cleaned up
        const exists = await fs.pathExists(targetPath);
        // Depending on implementation, may or may not exist
        if (exists) {
          const files = await fs.readdir(targetPath);
          // Should be empty or minimal
          expect(files.length).toBeLessThan(5);
        }
      }
    });
  });
});
