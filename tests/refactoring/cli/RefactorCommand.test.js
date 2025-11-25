/**
 * Tests for RefactorCommand
 */

const RefactorCommand = require('../../../lib/refactoring/cli/RefactorCommand');
const fs = require('fs-extra');
const path = require('path');

// Mock dependencies
jest.mock('fs-extra', () => ({
  stat: jest.fn(),
  access: jest.fn(),
  ensureDir: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  pathExists: jest.fn(),
  readJson: jest.fn(),
  writeJson: jest.fn(),
}));

jest.mock('../../../lib/refactoring/parsers/ReactParser');
jest.mock('../../../lib/refactoring/generators/CodeGenerator');
jest.mock('../../../lib/refactoring/generators/CleanArchitectureGenerator');

describe('RefactorCommand', () => {
  let command;
  let options;

  beforeEach(() => {
    options = {
      reactSource: './test-src',
      flutterTarget: './test-flutter',
      ai: 'none',
      validate: false,
      stateManagement: 'auto',
      architecture: 'clean',
      dryRun: false,
      verbose: false
    };

    command = new RefactorCommand(options);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(command.options.reactSource).toBe('./test-src');
      expect(command.options.flutterTarget).toBe('./test-flutter');
      expect(command.options.ai).toBe('none');
      expect(command.options.validate).toBe(false);
    });

    it('should initialize stats object', () => {
      expect(command.stats).toEqual({
        filesProcessed: 0,
        filesGenerated: 0,
        components: 0,
        widgets: 0,
        linesOfCode: {
          react: 0,
          flutter: 0
        },
        stateManagement: {},
        errors: [],
        warnings: []
      });
    });
  });

  describe('validateInputs', () => {
    it('should validate React source directory exists', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockRejectedValue(new Error());

      await expect(command.validateInputs()).resolves.not.toThrow();
      expect(fs.stat).toHaveBeenCalledWith('./test-src');
    });

    it('should throw error if React source is not a directory', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => false });

      await expect(command.validateInputs()).rejects.toThrow('not a directory');
    });

    it('should throw error if React source does not exist', async () => {
      fs.stat.mockRejectedValue(new Error('ENOENT'));

      await expect(command.validateInputs()).rejects.toThrow('not found');
    });

    it('should create Flutter target directory if it does not exist', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockRejectedValue(new Error());
      fs.ensureDir.mockResolvedValue();

      await command.validateInputs();

      expect(fs.mkdir).toHaveBeenCalledWith('./test-flutter', { recursive: true });
    });

    it('should validate AI provider', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      command.options.ai = 'invalid-ai';

      await expect(command.validateInputs()).rejects.toThrow('Invalid AI provider');
    });

    it('should validate state management option', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      command.options.stateManagement = 'invalid';

      await expect(command.validateInputs()).rejects.toThrow('Invalid state management');
    });

    it('should validate architecture option', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      command.options.architecture = 'invalid';

      await expect(command.validateInputs()).rejects.toThrow('Invalid architecture');
    });
  });

  describe('findReactFiles', () => {
    it('should find React files recursively', async () => {
      fs.readdir.mockResolvedValue([
        { name: 'App.jsx', isDirectory: () => false, isFile: () => true },
        { name: 'Login.tsx', isDirectory: () => false, isFile: () => true },
        { name: 'components', isDirectory: () => true, isFile: () => false }
      ]);

      // Mock recursive call
      fs.readdir.mockResolvedValueOnce([
        { name: 'App.jsx', isDirectory: () => false, isFile: () => true },
        { name: 'Login.tsx', isDirectory: () => false, isFile: () => true },
        { name: 'components', isDirectory: () => true, isFile: () => false }
      ]).mockResolvedValueOnce([
        { name: 'Button.jsx', isDirectory: () => false, isFile: () => true }
      ]);

      const files = await command.findReactFiles('./test-src');

      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.includes('App.jsx'))).toBe(true);
      expect(files.some(f => f.includes('Login.tsx'))).toBe(true);
    });

    it('should skip node_modules directory', async () => {
      fs.readdir.mockResolvedValue([
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: 'App.jsx', isDirectory: () => false, isFile: () => true }
      ]);

      fs.readdir.mockResolvedValueOnce([
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: 'App.jsx', isDirectory: () => false, isFile: () => true }
      ]);

      const files = await command.findReactFiles('./test-src');

      expect(files).not.toContain(expect.stringContaining('node_modules'));
    });

    it('should only include .jsx, .tsx, .js, .ts files', async () => {
      fs.readdir.mockResolvedValue([
        { name: 'App.jsx', isDirectory: () => false, isFile: () => true },
        { name: 'styles.css', isDirectory: () => false, isFile: () => true },
        { name: 'README.md', isDirectory: () => false, isFile: () => true }
      ]);

      fs.readdir.mockResolvedValueOnce([
        { name: 'App.jsx', isDirectory: () => false, isFile: () => true },
        { name: 'styles.css', isDirectory: () => false, isFile: () => true },
        { name: 'README.md', isDirectory: () => false, isFile: () => true }
      ]);

      const files = await command.findReactFiles('./test-src');

      expect(files.every(f => /\.(jsx|tsx|js|ts)$/.test(f))).toBe(true);
    });
  });

  describe('getGrade', () => {
    it('should return correct grades', () => {
      expect(command.getGrade(95)).toBe('A');
      expect(command.getGrade(85)).toBe('B');
      expect(command.getGrade(75)).toBe('C');
      expect(command.getGrade(65)).toBe('D');
      expect(command.getGrade(55)).toBe('F');
    });
  });

  describe('colorize', () => {
    it('should return colorized text', () => {
      const result = command.colorize('test', 'green');
      expect(result).toContain('test');
      expect(result).toContain('\x1b[32m');
    });

    it('should handle unknown colors', () => {
      const result = command.colorize('test', 'unknown');
      expect(result).toBe('test');
    });
  });
});
