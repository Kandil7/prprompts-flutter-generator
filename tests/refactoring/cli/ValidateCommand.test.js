/**
 * Tests for ValidateCommand
 */

const ValidateCommand = require('../../../lib/refactoring/cli/ValidateCommand');
const fs = require('fs').promises;

// Mock dependencies
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn()
  }
}));

jest.mock('../../../lib/refactoring/validation/ValidationOrchestrator');
jest.mock('../../../lib/refactoring/validation/ReportGenerator');

describe('ValidateCommand', () => {
  let command;
  let options;

  beforeEach(() => {
    options = {
      flutterPath: './test-flutter',
      config: 'standard',
      format: 'terminal',
      output: null,
      threshold: 0,
      fix: false,
      ci: false
    };

    command = new ValidateCommand(options);

    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      expect(command.options.flutterPath).toBe('./test-flutter');
      expect(command.options.config).toBe('standard');
      expect(command.options.format).toBe('terminal');
    });

    it('should have validation presets', () => {
      expect(command.validationPresets).toHaveProperty('strict');
      expect(command.validationPresets).toHaveProperty('standard');
      expect(command.validationPresets).toHaveProperty('lenient');
      expect(command.validationPresets).toHaveProperty('security');
      expect(command.validationPresets).toHaveProperty('performance');
    });
  });

  describe('validateInputs', () => {
    it('should validate Flutter project path exists', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      await expect(command.validateInputs()).resolves.not.toThrow();
      expect(fs.stat).toHaveBeenCalledWith('./test-flutter');
    });

    it('should check for pubspec.yaml', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      await command.validateInputs();

      expect(fs.access).toHaveBeenCalledWith(
        expect.stringContaining('pubspec.yaml')
      );
    });

    it('should throw error if path is not a directory', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => false });

      await expect(command.validateInputs()).rejects.toThrow('not a directory');
    });

    it('should validate config preset', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      command.options.config = 'invalid';

      await expect(command.validateInputs()).rejects.toThrow('Invalid config preset');
    });

    it('should validate format option', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      command.options.format = 'invalid';

      await expect(command.validateInputs()).rejects.toThrow('Invalid format');
    });

    it('should validate threshold range', async () => {
      fs.stat.mockResolvedValue({ isDirectory: () => true });
      fs.access.mockResolvedValue();

      command.options.threshold = -10;
      await expect(command.validateInputs()).rejects.toThrow('must be between');

      command.options.threshold = 150;
      await expect(command.validateInputs()).rejects.toThrow('must be between');
    });
  });

  describe('checkThreshold', () => {
    it('should return true if score meets threshold', () => {
      const results = {
        summary: { overallScore: 85 }
      };

      command.options.threshold = 70;

      expect(command.checkThreshold(results)).toBe(true);
    });

    it('should return false if score is below threshold', () => {
      const results = {
        summary: { overallScore: 65 }
      };

      command.options.threshold = 70;

      expect(command.checkThreshold(results)).toBe(false);
    });

    it('should handle threshold of 0', () => {
      const results = {
        summary: { overallScore: 0 }
      };

      command.options.threshold = 0;

      expect(command.checkThreshold(results)).toBe(true);
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

    it('should handle edge cases', () => {
      expect(command.getGrade(90)).toBe('A');
      expect(command.getGrade(80)).toBe('B');
      expect(command.getGrade(70)).toBe('C');
      expect(command.getGrade(60)).toBe('D');
      expect(command.getGrade(0)).toBe('F');
    });
  });

  describe('getScoreColor', () => {
    it('should return correct colors', () => {
      expect(command.getScoreColor(90)).toBe('green');
      expect(command.getScoreColor(75)).toBe('yellow');
      expect(command.getScoreColor(60)).toBe('red');
    });

    it('should handle edge cases', () => {
      expect(command.getScoreColor(85)).toBe('green');
      expect(command.getScoreColor(70)).toBe('yellow');
    });
  });

  describe('validation presets', () => {
    it('should have strict preset with high standards', () => {
      const preset = command.validationPresets.strict;

      expect(preset.minScore).toBe(85);
      expect(preset.failOnWarnings).toBe(true);
      expect(preset.checkAll).toBe(true);
    });

    it('should have standard preset with balanced standards', () => {
      const preset = command.validationPresets.standard;

      expect(preset.minScore).toBe(70);
      expect(preset.failOnWarnings).toBe(false);
      expect(preset.checkAll).toBe(true);
    });

    it('should have lenient preset with low standards', () => {
      const preset = command.validationPresets.lenient;

      expect(preset.minScore).toBe(50);
      expect(preset.failOnWarnings).toBe(false);
      expect(preset.checkAll).toBe(false);
    });

    it('should have security preset focused on security', () => {
      const preset = command.validationPresets.security;

      expect(preset.minScore).toBe(90);
      expect(preset.focusOn).toContain('security');
      expect(preset.failOnSecurityIssues).toBe(true);
    });

    it('should have performance preset focused on performance', () => {
      const preset = command.validationPresets.performance;

      expect(preset.minScore).toBe(75);
      expect(preset.focusOn).toContain('performance');
      expect(preset.warnOnSlowWidgets).toBe(true);
    });
  });
});
