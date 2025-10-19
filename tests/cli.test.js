/**
 * PRPROMPTS Generator - CLI Command Tests
 * Tests for the main CLI dispatcher functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock child_process to prevent actual command execution
jest.mock('child_process');
jest.mock('fs');
jest.mock('os');

describe('CLI Command Tests', () => {
  let cli;
  const mockConfigDir = '/home/test/.prprompts';
  const mockConfigFile = path.join(mockConfigDir, 'config.json');

  // Capture console output
  let consoleOutput = [];
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.resetModules();
    consoleOutput = [];

    // Mock console
    console.log = (...args) => consoleOutput.push(['log', ...args]);
    console.error = (...args) => consoleOutput.push(['error', ...args]);

    // Mock os.homedir
    os.homedir = jest.fn().mockReturnValue('/home/test');

    // Mock file system
    fs.existsSync = jest.fn().mockImplementation((path) => {
      if (path === mockConfigFile) return true;
      return false;
    });

    fs.readFileSync = jest.fn().mockImplementation((path) => {
      if (path === mockConfigFile) {
        return JSON.stringify({
          version: '4.0.0',
          default_ai: 'claude',
          ais: {
            claude: { enabled: true },
            qwen: { enabled: false },
            gemini: { enabled: false }
          },
          features: {
            auto_update: true,
            verbose: true
          }
        });
      }
      return '';
    });

    fs.writeFileSync = jest.fn();
    fs.mkdirSync = jest.fn();

    // Mock command existence check
    execSync.mockImplementation((cmd) => {
      if (cmd.startsWith('command -v') || cmd.startsWith('which')) {
        if (cmd.includes('claude')) return '/usr/bin/claude';
        if (cmd.includes('qwen')) throw new Error('Command not found');
        if (cmd.includes('gemini')) throw new Error('Command not found');
      }
      return '';
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Command Routing', () => {
    test('should route "create" to "create-prd"', () => {
      process.argv = ['node', 'prprompts', 'create'];

      // Mock successful execution
      execSync.mockImplementation((cmd) => {
        if (cmd === 'claude create-prd') return '';
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        throw new Error('Unexpected command');
      });

      require('../bin/prprompts');

      expect(execSync).toHaveBeenCalledWith(
        'claude create-prd',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    test('should route "generate" to "gen-prprompts"', () => {
      process.argv = ['node', 'prprompts', 'generate'];

      execSync.mockImplementation((cmd) => {
        if (cmd === 'claude gen-prprompts') return '';
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        throw new Error('Unexpected command');
      });

      require('../bin/prprompts');

      expect(execSync).toHaveBeenCalledWith(
        'claude gen-prprompts',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    test('should handle "gen" alias for generate', () => {
      process.argv = ['node', 'prprompts', 'gen'];

      execSync.mockImplementation((cmd) => {
        if (cmd === 'claude gen-prprompts') return '';
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        throw new Error('Unexpected command');
      });

      require('../bin/prprompts');

      expect(execSync).toHaveBeenCalledWith(
        'claude gen-prprompts',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    test('should pass through additional arguments', () => {
      process.argv = ['node', 'prprompts', 'gen-file', 'test-file', '--verbose'];

      execSync.mockImplementation((cmd) => {
        if (cmd === 'claude gen-file test-file --verbose') return '';
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        throw new Error('Unexpected command');
      });

      require('../bin/prprompts');

      expect(execSync).toHaveBeenCalledWith(
        'claude gen-file test-file --verbose',
        expect.objectContaining({ stdio: 'inherit' })
      );
    });
  });

  describe('AI Selection', () => {
    test('should use default AI from config', () => {
      process.argv = ['node', 'prprompts', 'create'];

      execSync.mockImplementation((cmd) => {
        if (cmd === 'claude create-prd') return '';
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        return '';
      });

      require('../bin/prprompts');

      expect(execSync).toHaveBeenCalledWith(
        'claude create-prd',
        expect.any(Object)
      );
    });

    test('should fallback to first available AI if default not available', () => {
      fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify({
        version: '4.0.0',
        default_ai: 'qwen',
        ais: {
          claude: { enabled: true },
          qwen: { enabled: false },
          gemini: { enabled: true }
        }
      }));

      execSync.mockImplementation((cmd) => {
        if (cmd.startsWith('command -v')) {
          if (cmd.includes('claude')) return '/usr/bin/claude';
          if (cmd.includes('gemini')) return '/usr/bin/gemini';
          throw new Error('Command not found');
        }
        if (cmd === 'claude create-prd') return '';
        return '';
      });

      process.argv = ['node', 'prprompts', 'create'];
      require('../bin/prprompts');

      expect(execSync).toHaveBeenCalledWith(
        'claude create-prd',
        expect.any(Object)
      );
    });

    test('should error if no AI is available', () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.startsWith('command -v') || cmd.startsWith('which')) {
          throw new Error('Command not found');
        }
        return '';
      });

      process.argv = ['node', 'prprompts', 'create'];

      // Mock process.exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exited');
      });

      try {
        require('../bin/prprompts');
      } catch (e) {
        // Expected
      }

      expect(mockExit).toHaveBeenCalledWith(1);
      mockExit.mockRestore();
    });
  });

  describe('Special Commands', () => {
    test('should handle "switch" command', () => {
      process.argv = ['node', 'prprompts', 'switch', 'gemini'];

      execSync.mockImplementation((cmd) => {
        if (cmd.includes('gemini')) return '/usr/bin/gemini';
        if (cmd.includes('claude')) return '/usr/bin/claude';
        throw new Error('Command not found');
      });

      require('../bin/prprompts');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        mockConfigFile,
        expect.stringContaining('"default_ai": "gemini"')
      );
    });

    test('should handle "doctor" command', () => {
      process.argv = ['node', 'prprompts', 'doctor'];

      execSync.mockImplementation((cmd) => {
        if (cmd === 'node --version') return 'v18.0.0';
        if (cmd === 'npm --version') return '9.0.0';
        if (cmd === 'git --version') return 'git version 2.40.0';
        if (cmd === 'claude --version') return 'Claude Code v1.0.0';
        if (cmd.includes('qwen') || cmd.includes('gemini')) {
          throw new Error('Command not found');
        }
        return '';
      });

      require('../bin/prprompts');

      // Check that diagnostic info was collected
      const output = consoleOutput.join(' ');
      expect(output).toContain('Node.js');
      expect(output).toContain('npm');
      expect(output).toContain('Git');
      expect(output).toContain('AI Assistants');
      expect(output).toContain('claude');
    });

    test('should handle "version" command', () => {
      process.argv = ['node', 'prprompts', 'version'];

      require('../bin/prprompts');

      const output = consoleOutput.join(' ');
      expect(output).toContain('4.0.0');
      expect(output).toContain('claude');
    });

    test('should handle "help" command', () => {
      process.argv = ['node', 'prprompts', 'help'];

      require('../bin/prprompts');

      const output = consoleOutput.join(' ');
      expect(output).toContain('USAGE:');
      expect(output).toContain('COMMANDS:');
      expect(output).toContain('create');
      expect(output).toContain('generate');
      expect(output).toContain('doctor');
    });

    test('should show help when no command provided', () => {
      process.argv = ['node', 'prprompts'];

      require('../bin/prprompts');

      const output = consoleOutput.join(' ');
      expect(output).toContain('USAGE:');
      expect(output).toContain('COMMANDS:');
    });

    test('should handle "init" command', () => {
      process.argv = ['node', 'prprompts', 'init'];

      fs.existsSync = jest.fn().mockImplementation((path) => {
        if (path === 'docs') return false;
        if (path === 'project_description.md') return false;
        if (path === 'docs/PRD.md') return false;
        return true;
      });

      require('../bin/prprompts');

      expect(fs.mkdirSync).toHaveBeenCalledWith('docs', { recursive: true });

      const output = consoleOutput.join(' ');
      expect(output).toContain('Initializing PRPROMPTS project');
      expect(output).toContain('Next steps:');
    });
  });

  describe('Error Handling', () => {
    test('should handle command timeout with retry', () => {
      process.argv = ['node', 'prprompts', 'create'];
      let attempts = 0;

      execSync.mockImplementation((cmd) => {
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        if (cmd === 'claude create-prd') {
          attempts++;
          if (attempts < 3) {
            const error = new Error('Timeout');
            error.signal = 'SIGTERM';
            throw error;
          }
          return ''; // Success on third attempt
        }
        return '';
      });

      require('../bin/prprompts');

      expect(attempts).toBe(3);
      expect(execSync).toHaveBeenCalledWith(
        'claude create-prd',
        expect.objectContaining({ timeout: 120000 })
      );
    });

    test('should handle API key errors', () => {
      process.argv = ['node', 'prprompts', 'create'];

      execSync.mockImplementation((cmd) => {
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        if (cmd === 'claude create-prd') {
          const error = new Error('API key not configured');
          error.message = 'API key not found';
          throw error;
        }
        return '';
      });

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exited');
      });

      try {
        require('../bin/prprompts');
      } catch (e) {
        // Expected
      }

      const output = consoleOutput.join(' ');
      expect(output).toContain('API key');
      expect(output).toContain('ANTHROPIC_API_KEY');
      mockExit.mockRestore();
    });
  });

  describe('Environment Variable Support', () => {
    test('should respect PRPROMPTS_DEFAULT_AI environment variable', () => {
      process.env.PRPROMPTS_DEFAULT_AI = 'gemini';
      process.argv = ['node', 'prprompts', 'create'];

      execSync.mockImplementation((cmd) => {
        if (cmd.includes('gemini')) return '/usr/bin/gemini';
        if (cmd === 'gemini create-prd') return '';
        return '';
      });

      // Reload module with new env var
      delete require.cache[require.resolve('../bin/prprompts')];
      require('../bin/prprompts');

      expect(execSync).toHaveBeenCalledWith(
        'gemini create-prd',
        expect.any(Object)
      );

      delete process.env.PRPROMPTS_DEFAULT_AI;
    });

    test('should respect PRPROMPTS_VERBOSE environment variable', () => {
      process.env.PRPROMPTS_VERBOSE = 'false';
      process.argv = ['node', 'prprompts', 'create'];

      execSync.mockImplementation((cmd) => {
        if (cmd.startsWith('command -v')) return '/usr/bin/claude';
        if (cmd === 'claude create-prd') return '';
        return '';
      });

      delete require.cache[require.resolve('../bin/prprompts')];
      require('../bin/prprompts');

      const output = consoleOutput.join(' ');
      expect(output).not.toContain('Using claude');

      delete process.env.PRPROMPTS_VERBOSE;
    });
  });
});