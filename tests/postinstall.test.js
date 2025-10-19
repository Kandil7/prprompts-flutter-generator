/**
 * PRPROMPTS Generator - Postinstall Script Tests
 * Tests for the automatic setup after npm install
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// Mock all modules
jest.mock('fs');
jest.mock('child_process');
jest.mock('os');

describe('Postinstall Script Tests', () => {
  const mockHomeDir = '/home/test';
  const mockConfigDir = path.join(mockHomeDir, '.config');
  const mockPrpromptsDir = path.join(mockHomeDir, '.prprompts');

  // Capture console output
  let consoleOutput = [];
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    consoleOutput = [];

    // Mock console
    console.log = (...args) => consoleOutput.push(['log', ...args]);
    console.error = (...args) => consoleOutput.push(['error', ...args]);

    // Mock os.homedir and platform
    os.homedir = jest.fn().mockReturnValue(mockHomeDir);
    os.platform = jest.fn().mockReturnValue('linux');

    // Default file system mocks
    fs.existsSync = jest.fn().mockReturnValue(false);
    fs.mkdirSync = jest.fn();
    fs.readdirSync = jest.fn().mockReturnValue([]);
    fs.copyFileSync = jest.fn();
    fs.writeFileSync = jest.fn();
    fs.readFileSync = jest.fn();

    // Mock __dirname for the script
    global.__dirname = '/app/scripts';
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    delete process.env.CI;
    delete process.env.SKIP_POSTINSTALL;
  });

  describe('AI Detection', () => {
    test('should detect Claude when installed', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which claude') return '/usr/bin/claude';
        if (cmd === 'claude --version') return 'Claude Code v1.0.0';
        throw new Error('Command not found');
      });

      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Claude Code');
      expect(output).toContain('✓');
    });

    test('should detect Qwen when installed', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which qwen') return '/usr/bin/qwen';
        if (cmd === 'qwen --version') return 'Qwen Code v1.0.0';
        throw new Error('Command not found');
      });

      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Qwen Code');
      expect(output).toContain('✓');
    });

    test('should detect Gemini when installed', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which gemini') return '/usr/bin/gemini';
        if (cmd === 'gemini --version') return 'Gemini CLI v1.0.0';
        throw new Error('Command not found');
      });

      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Gemini CLI');
      expect(output).toContain('✓');
    });

    test('should handle no AI assistants detected', () => {
      execSync.mockImplementation(() => {
        throw new Error('Command not found');
      });

      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('No AI assistants detected');
      expect(output).toContain('Please install at least one');
      expect(output).toContain('@anthropic-ai/claude-code');
      expect(output).toContain('@qwen/qwen-code');
      expect(output).toContain('@google/gemini-cli');
    });

    test('should handle Windows platform detection', () => {
      os.platform = jest.fn().mockReturnValue('win32');

      execSync.mockImplementation((cmd) => {
        if (cmd === 'where claude') return 'C:\\Program Files\\claude.exe';
        if (cmd === 'claude --version') return 'Claude Code v1.0.0';
        throw new Error('Command not found');
      });

      const postinstall = require('../scripts/postinstall');

      expect(execSync).toHaveBeenCalledWith('where claude', { stdio: 'ignore' });
    });
  });

  describe('Prompt Installation', () => {
    beforeEach(() => {
      // Mock successful AI detection
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which claude') return '/usr/bin/claude';
        if (cmd === 'claude --version') return 'Claude Code v1.0.0';
        throw new Error('Command not found');
      });

      // Mock source directory exists with prompt files
      fs.existsSync = jest.fn().mockImplementation((path) => {
        if (path.includes('.claude/prompts')) return true;
        return false;
      });

      fs.readdirSync = jest.fn().mockReturnValue([
        'generate-prd.md',
        'auto-generate-prd.md',
        'prprompts-generator.md',
        'analyze-prd.md',
        'phase-1-core.md',
        'phase-2-quality.md',
        'phase-3-demo.md',
        'single-file-generator.md',
        'generate-prd-from-files.md'
      ]);
    });

    test('should copy prompts to Claude config directory', () => {
      const postinstall = require('../scripts/postinstall');

      const claudePromptsDir = path.join(mockHomeDir, '.config', 'claude', 'prompts');

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        claudePromptsDir,
        { recursive: true }
      );

      expect(fs.copyFileSync).toHaveBeenCalledTimes(9); // 9 prompt files

      const output = consoleOutput.join(' ');
      expect(output).toContain('Copied 9 prompt files');
    });

    test('should copy config.yml to Claude directory', () => {
      fs.existsSync = jest.fn().mockImplementation((path) => {
        if (path.includes('.claude/prompts')) return true;
        if (path.includes('.claude/config.yml')) return true;
        if (path.includes('.config/claude/config.yml')) return false;
        return false;
      });

      const postinstall = require('../scripts/postinstall');

      expect(fs.copyFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.claude/config.yml'),
        expect.stringContaining('.config/claude/config.yml')
      );
    });

    test('should skip config.yml if already exists', () => {
      fs.existsSync = jest.fn().mockImplementation((path) => {
        if (path.includes('.claude/prompts')) return true;
        if (path.includes('.claude/config.yml')) return true;
        if (path.includes('.config/claude/config.yml')) return true; // Already exists
        return false;
      });

      const postinstall = require('../scripts/postinstall');

      // Should not copy config.yml
      expect(fs.copyFileSync).not.toHaveBeenCalledWith(
        expect.stringContaining('config.yml'),
        expect.any(String)
      );

      const output = consoleOutput.join(' ');
      expect(output).toContain('Config already exists, skipping');
    });

    test('should handle missing source prompts directory', () => {
      fs.existsSync = jest.fn().mockReturnValue(false);

      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Warning: Source prompts directory not found');
    });
  });

  describe('Unified Config Creation', () => {
    beforeEach(() => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which claude') return '/usr/bin/claude';
        if (cmd === 'which gemini') return '/usr/bin/gemini';
        throw new Error('Command not found');
      });

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readdirSync = jest.fn().mockReturnValue(['test.md']);
    });

    test('should create unified config file', () => {
      const postinstall = require('../scripts/postinstall');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockPrpromptsDir, 'config.json'),
        expect.any(String)
      );

      const configCall = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('config.json')
      );

      const config = JSON.parse(configCall[1]);
      expect(config.version).toBe('4.0.0');
      expect(config.ais.claude.enabled).toBe(true);
      expect(config.ais.gemini.enabled).toBe(true);
      expect(config.ais.qwen.enabled).toBe(false);
    });

    test('should set default AI to Claude if available', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which claude') return '/usr/bin/claude';
        if (cmd === 'which qwen') return '/usr/bin/qwen';
        if (cmd === 'which gemini') return '/usr/bin/gemini';
        throw new Error('Command not found');
      });

      const postinstall = require('../scripts/postinstall');

      const configCall = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('config.json')
      );

      const config = JSON.parse(configCall[1]);
      expect(config.default_ai).toBe('claude');
    });

    test('should set default AI to first available if Claude not available', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which qwen') return '/usr/bin/qwen';
        if (cmd === 'which gemini') return '/usr/bin/gemini';
        throw new Error('Command not found');
      });

      const postinstall = require('../scripts/postinstall');

      const configCall = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('config.json')
      );

      const config = JSON.parse(configCall[1]);
      expect(config.default_ai).toBe('gemini'); // Gemini preferred over Qwen
    });

    test('should include config paths in unified config', () => {
      const postinstall = require('../scripts/postinstall');

      const configCall = fs.writeFileSync.mock.calls.find(
        call => call[0].includes('config.json')
      );

      const config = JSON.parse(configCall[1]);
      expect(config.ais.claude.config_path).toBe(
        path.join(mockHomeDir, '.config', 'claude')
      );
      expect(config.ais.qwen.config_path).toBe(
        path.join(mockHomeDir, '.config', 'qwen')
      );
      expect(config.ais.gemini.config_path).toBe(
        path.join(mockHomeDir, '.config', 'gemini')
      );
    });
  });

  describe('Summary Output', () => {
    beforeEach(() => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which claude') return '/usr/bin/claude';
        throw new Error('Command not found');
      });

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readdirSync = jest.fn().mockReturnValue(['test.md']);
    });

    test('should show installation summary', () => {
      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Installation Complete');
      expect(output).toContain('Configured 1 AI assistant(s)');
    });

    test('should show available commands', () => {
      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Available commands:');
      expect(output).toContain('claude create-prd');
      expect(output).toContain('claude gen-prprompts');
    });

    test('should show unified CLI commands', () => {
      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('unified CLI:');
      expect(output).toContain('prprompts create');
      expect(output).toContain('prprompts generate');
      expect(output).toContain('prprompts doctor');
    });

    test('should show quick start guide', () => {
      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Quick Start:');
      expect(output).toContain('cd your-flutter-project');
      expect(output).toContain('prprompts create');
      expect(output).toContain('prprompts generate');
      expect(output).toContain('Start coding!');
    });

    test('should show documentation link', () => {
      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Documentation:');
      expect(output).toContain('https://github.com/Kandil7/prprompts-flutter-generator');
    });
  });

  describe('Error Handling', () => {
    test('should handle installation errors gracefully', () => {
      execSync.mockImplementation(() => {
        throw new Error('Installation failed');
      });

      // Mock process.exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      try {
        require('../scripts/postinstall');
      } catch (e) {
        // Expected
      }

      const output = consoleOutput.join(' ');
      expect(output).toContain('Installation failed');
      expect(output).toContain('Please report this issue');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });

    test('should skip installation in CI environment', () => {
      process.env.CI = 'true';

      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('Running in CI environment, skipping postinstall');
    });

    test('should skip if SKIP_POSTINSTALL is set', () => {
      process.env.SKIP_POSTINSTALL = '1';

      const postinstall = require('../scripts/postinstall');

      const output = consoleOutput.join(' ');
      expect(output).toContain('SKIP_POSTINSTALL is set, skipping');
    });
  });

  describe('Multiple AI Installation', () => {
    test('should install for all detected AIs', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd === 'which claude') return '/usr/bin/claude';
        if (cmd === 'which qwen') return '/usr/bin/qwen';
        if (cmd === 'which gemini') return '/usr/bin/gemini';
        if (cmd.includes('--version')) return 'v1.0.0';
        throw new Error('Command not found');
      });

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readdirSync = jest.fn().mockReturnValue(['test.md']);

      const postinstall = require('../scripts/postinstall');

      // Should create directories for all 3 AIs
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.config/claude'),
        expect.any(Object)
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.config/qwen'),
        expect.any(Object)
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('.config/gemini'),
        expect.any(Object)
      );

      const output = consoleOutput.join(' ');
      expect(output).toContain('Configured 3 AI assistant(s)');
    });
  });
});