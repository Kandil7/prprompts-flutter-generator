/**
 * PRPROMPTS Generator - Package.json Validation Tests
 * Validates package.json structure, scripts, and metadata
 */

const fs = require('fs');
const path = require('path');

describe('Package.json Validation', () => {
  const rootDir = path.join(__dirname, '..');
  const packagePath = path.join(rootDir, 'package.json');
  let packageJson;

  beforeAll(() => {
    const content = fs.readFileSync(packagePath, 'utf8');
    packageJson = JSON.parse(content);
  });

  describe('Basic Metadata', () => {
    test('should have correct name', () => {
      expect(packageJson.name).toBe('prprompts-flutter-generator');
    });

    test('should have version 4.0.0 or higher', () => {
      expect(packageJson.version).toMatch(/^[4-9]\.\d+\.\d+$/);
    });

    test('should have description', () => {
      expect(packageJson.description).toBeDefined();
      expect(packageJson.description.length).toBeGreaterThan(50);
    });

    test('should have author', () => {
      expect(packageJson.author).toBeDefined();
    });

    test('should have MIT license', () => {
      expect(packageJson.license).toBe('MIT');
    });

    test('should have repository information', () => {
      expect(packageJson.repository).toBeDefined();
      expect(packageJson.repository.type).toBe('git');
      expect(packageJson.repository.url).toContain('github.com');
    });

    test('should have bugs URL', () => {
      expect(packageJson.bugs).toBeDefined();
      expect(packageJson.bugs.url).toContain('github.com');
    });

    test('should have homepage', () => {
      expect(packageJson.homepage).toBeDefined();
    });

    test('should be preferGlobal', () => {
      expect(packageJson.preferGlobal).toBe(true);
    });
  });

  describe('Keywords', () => {
    test('should have keywords array', () => {
      expect(Array.isArray(packageJson.keywords)).toBe(true);
      expect(packageJson.keywords.length).toBeGreaterThan(30);
    });

    const requiredKeywords = [
      'flutter',
      'ai',
      'claude-code',
      'qwen-code',
      'gemini-cli',
      'automation',
      'prprompts',
      'clean-architecture',
      'hipaa',
      'security',
    ];

    requiredKeywords.forEach((keyword) => {
      test(`should include "${keyword}" in keywords`, () => {
        expect(packageJson.keywords).toContain(keyword);
      });
    });
  });

  describe('Binary Configuration', () => {
    test('should have bin configuration', () => {
      expect(packageJson.bin).toBeDefined();
    });

    test('should have prprompts binary', () => {
      expect(packageJson.bin.prprompts).toBe('bin/prprompts');
    });

    test('prprompts binary should exist', () => {
      const binPath = path.join(rootDir, packageJson.bin.prprompts);
      expect(fs.existsSync(binPath)).toBe(true);
    });
  });

  describe('Files Configuration', () => {
    test('should have files array', () => {
      expect(Array.isArray(packageJson.files)).toBe(true);
    });

    const requiredFiles = [
      'bin/',
      'lib/',
      'scripts/',
      '.claude/',
      '.qwen/',
      '.gemini/',
      'templates/',
      'README.md',
      'LICENSE',
    ];

    requiredFiles.forEach((file) => {
      test(`should include ${file} in files array`, () => {
        expect(packageJson.files).toContain(file);
      });
    });

    test('should include extension files', () => {
      expect(packageJson.files).toContain('claude-extension.json');
      expect(packageJson.files).toContain('qwen-extension.json');
      expect(packageJson.files).toContain('gemini-extension.json');
    });
  });

  describe('Scripts', () => {
    test('should have scripts object', () => {
      expect(packageJson.scripts).toBeDefined();
      expect(typeof packageJson.scripts).toBe('object');
    });

    const requiredScripts = [
      'test',
      'lint',
      'validate',
      'postinstall',
      'doctor',
    ];

    requiredScripts.forEach((script) => {
      test(`should have "${script}" script`, () => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    describe('Test Scripts', () => {
      test('should have test script', () => {
        expect(packageJson.scripts.test).toBeDefined();
      });

      test('should have test:validation script', () => {
        expect(packageJson.scripts['test:validation']).toBeDefined();
      });

      test('should have test:commands script', () => {
        expect(packageJson.scripts['test:commands']).toBeDefined();
      });

      test('should have test:integration script', () => {
        expect(packageJson.scripts['test:integration']).toBeDefined();
      });

      test('should have test:all script', () => {
        expect(packageJson.scripts['test:all']).toBeDefined();
      });
    });

    describe('Linting Scripts', () => {
      test('should have lint script', () => {
        expect(packageJson.scripts.lint).toBeDefined();
      });

      test('should have lint:markdown script', () => {
        expect(packageJson.scripts['lint:markdown']).toBeDefined();
      });

      test('should have lint:shell script', () => {
        expect(packageJson.scripts['lint:shell']).toBeDefined();
      });

      test('should have lint:fix script', () => {
        expect(packageJson.scripts['lint:fix']).toBeDefined();
      });
    });

    describe('Installation Scripts', () => {
      test('should have install-claude script', () => {
        expect(packageJson.scripts['install-claude']).toBeDefined();
      });

      test('should have install-qwen script', () => {
        expect(packageJson.scripts['install-qwen']).toBeDefined();
      });

      test('should have install-gemini script', () => {
        expect(packageJson.scripts['install-gemini']).toBeDefined();
      });

      test('should have install-all script', () => {
        expect(packageJson.scripts['install-all']).toBeDefined();
      });
    });

    describe('Utility Scripts', () => {
      test('should have validate script', () => {
        expect(packageJson.scripts.validate).toBeDefined();
      });

      test('should have validate:package script', () => {
        expect(packageJson.scripts['validate:package']).toBeDefined();
      });

      test('should have validate:extensions script', () => {
        expect(packageJson.scripts['validate:extensions']).toBeDefined();
      });

      test('should have doctor script', () => {
        expect(packageJson.scripts.doctor).toBeDefined();
      });

      test('should have clean script', () => {
        expect(packageJson.scripts.clean).toBeDefined();
      });
    });
  });

  describe('Dependencies', () => {
    test('should have peerDependencies for Claude Code', () => {
      expect(packageJson.peerDependencies).toBeDefined();
      expect(packageJson.peerDependencies['@anthropic-ai/claude-code']).toBeDefined();
    });

    test('should have optionalDependencies for Qwen and Gemini', () => {
      expect(packageJson.optionalDependencies).toBeDefined();
    });
  });

  describe('Package Files Existence', () => {
    test('bin directory should exist', () => {
      const binDir = path.join(rootDir, 'bin');
      expect(fs.existsSync(binDir)).toBe(true);
    });

    test('lib directory should exist', () => {
      const libDir = path.join(rootDir, 'lib');
      expect(fs.existsSync(libDir)).toBe(true);
    });

    test('scripts directory should exist', () => {
      const scriptsDir = path.join(rootDir, 'scripts');
      expect(fs.existsSync(scriptsDir)).toBe(true);
    });

    test('.claude directory should exist', () => {
      const claudeDir = path.join(rootDir, '.claude');
      expect(fs.existsSync(claudeDir)).toBe(true);
    });

    test('.qwen directory should exist', () => {
      const qwenDir = path.join(rootDir, '.qwen');
      expect(fs.existsSync(qwenDir)).toBe(true);
    });

    test('.gemini directory should exist', () => {
      const geminiDir = path.join(rootDir, '.gemini');
      expect(fs.existsSync(geminiDir)).toBe(true);
    });

    test('templates directory should exist', () => {
      const templatesDir = path.join(rootDir, 'templates');
      expect(fs.existsSync(templatesDir)).toBe(true);
    });

    test('README.md should exist', () => {
      const readmePath = path.join(rootDir, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    test('LICENSE should exist', () => {
      const licensePath = path.join(rootDir, 'LICENSE');
      expect(fs.existsSync(licensePath)).toBe(true);
    });
  });

  describe('Extension Files', () => {
    const extensionFiles = [
      'claude-extension.json',
      'qwen-extension.json',
      'gemini-extension.json',
    ];

    extensionFiles.forEach((extensionFile) => {
      test(`${extensionFile} should exist`, () => {
        const extensionPath = path.join(rootDir, extensionFile);
        expect(fs.existsSync(extensionPath)).toBe(true);
      });

      test(`${extensionFile} should be valid JSON`, () => {
        const extensionPath = path.join(rootDir, extensionFile);
        const content = fs.readFileSync(extensionPath, 'utf8');
        let parsed;
        expect(() => {
          parsed = JSON.parse(content);
        }).not.toThrow();
        expect(parsed).toBeDefined();
      });

      test(`${extensionFile} should have required fields`, () => {
        const extensionPath = path.join(rootDir, extensionFile);
        const content = fs.readFileSync(extensionPath, 'utf8');
        const parsed = JSON.parse(content);
        expect(parsed.name).toBeDefined();
        expect(parsed.version).toBeDefined();
      });
    });
  });
});
