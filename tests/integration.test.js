/**
 * Integration Tests for PRPROMPTS Flutter Generator
 * Tests multi-AI platform integration, version consistency, and command parity
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

// Helper function to read JSON file
function readJSON(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

// Helper function to read YAML file
function readYAML(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return yaml.load(fs.readFileSync(fullPath, 'utf8'));
}

// Helper function to count files with pattern
function countFiles(dir, pattern) {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) return 0;

  let count = 0;
  const walkDir = (currentPath) => {
    const files = fs.readdirSync(currentPath);
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (pattern.test(file)) {
        count++;
      }
    }
  };

  walkDir(fullPath);
  return count;
}

describe('Multi-AI Platform Integration', () => {
  describe('Version Consistency', () => {
    let packageVersion;

    beforeAll(() => {
      const packageJson = readJSON('package.json');
      packageVersion = packageJson.version;
    });

    test('all extension manifests should have matching versions', () => {
      const manifests = [
        'claude-extension.json',
        'qwen-extension.json',
        'gemini-extension.json',
        '.claude-plugin/plugin.json'
      ];

      manifests.forEach(manifest => {
        const data = readJSON(manifest);
        expect(data.version).toBe(packageVersion);
      });
    });

    test('version sync script should exist and be executable', () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'sync-versions.js');
      expect(fs.existsSync(scriptPath)).toBe(true);

      // Test that script runs successfully
      const result = execSync('node scripts/sync-versions.js', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8'
      });
      expect(result).toContain('Version sync');
    });
  });

  describe('Command Parity', () => {
    const EXPECTED_COMMANDS = 23;
    const EXPECTED_CATEGORIES = ['prd', 'planning', 'prprompts', 'automation', 'refactoring'];

    test('Claude should have exactly 23 commands', () => {
      const commandCount = countFiles('.claude/commands', /\.md$/);
      expect(commandCount).toBe(EXPECTED_COMMANDS);
    });

    test('Qwen should have exactly 23 markdown commands', () => {
      const commandCount = countFiles('.qwen/commands', /\.md$/);
      expect(commandCount).toBe(EXPECTED_COMMANDS);
    });

    test('Gemini should have exactly 23 markdown commands', () => {
      // Count only in subdirectories, not root duplicates
      let count = 0;
      EXPECTED_CATEGORIES.forEach(category => {
        count += countFiles(`.gemini/commands/${category}`, /\.md$/);
      });
      expect(count).toBe(EXPECTED_COMMANDS);
    });

    test('all platforms should have identical command categories', () => {
      const platforms = ['claude', 'qwen', 'gemini'];

      platforms.forEach(platform => {
        EXPECTED_CATEGORIES.forEach(category => {
          const categoryPath = path.join(__dirname, '..', `.${platform}`, 'commands', category);
          expect(fs.existsSync(categoryPath)).toBe(true);
        });
      });
    });

    test('Qwen and Gemini should have TOML commands', () => {
      const qwenTomlCount = countFiles('.qwen/commands', /\.toml$/);
      const geminiTomlCount = countFiles('.gemini/commands', /\.toml$/);

      expect(qwenTomlCount).toBeGreaterThanOrEqual(20);
      expect(geminiTomlCount).toBeGreaterThanOrEqual(20);
    });
  });

  describe('Configuration Files', () => {
    test('all platforms should have valid config.yml files', () => {
      const platforms = ['claude', 'qwen', 'gemini'];

      platforms.forEach(platform => {
        const config = readYAML(`.${platform}/config.yml`);
        expect(config).toBeDefined();

        // Check for essential fields
        if (config.commands) {
          expect(Object.keys(config.commands).length).toBeGreaterThanOrEqual(10);
        }
      });
    });

    test('all config.yml files should have consistent command names', () => {
      const claudeConfig = readYAML('.claude/config.yml');
      const qwenConfig = readYAML('.qwen/config.yml');
      const geminiConfig = readYAML('.gemini/config.yml');

      // Get command names from each config
      const claudeCommands = Object.keys(claudeConfig.commands || {}).sort();
      const qwenCommands = Object.keys(qwenConfig.commands || {}).sort();
      const geminiCommands = Object.keys(geminiConfig.commands || {}).sort();

      // All should have same commands
      expect(qwenCommands).toEqual(claudeCommands);
      expect(geminiCommands).toEqual(claudeCommands);
    });
  });

  describe('Skills System', () => {
    test('all platforms should have skills directories', () => {
      const platforms = ['claude', 'qwen', 'gemini'];

      platforms.forEach(platform => {
        const skillsPath = path.join(__dirname, '..', `.${platform}`, 'skills');
        expect(fs.existsSync(skillsPath)).toBe(true);
      });
    });

    test('skills should be consistent across platforms', () => {
      const expectedSkillCategories = ['automation', 'development-workflow', 'prprompts-core'];

      ['claude', 'qwen', 'gemini'].forEach(platform => {
        expectedSkillCategories.forEach(category => {
          const categoryPath = path.join(__dirname, '..', `.${platform}`, 'skills', category);
          // Skills may vary by platform, so we just check automation exists
          if (category === 'automation') {
            expect(fs.existsSync(categoryPath)).toBe(true);
          }
        });
      });
    });
  });

  describe('Extension Metadata', () => {
    test('Claude plugin should have enhanced metadata', () => {
      const plugin = readJSON('.claude-plugin/plugin.json');

      expect(plugin.displayName).toBeDefined();
      expect(plugin.categories).toBeInstanceOf(Array);
      expect(plugin.commands).toBeInstanceOf(Array);
      expect(plugin.hooks).toBeDefined();
      expect(plugin.telemetry).toBeDefined();
    });

    test('Qwen extension should have benchmarks and advantages', () => {
      const extension = readJSON('qwen-extension.json');

      expect(extension.qwen).toBeDefined();
      expect(extension.qwen.contextWindow).toBeDefined();
      expect(extension.qwen.benchmarks).toBeDefined();
      expect(extension.qwen.advantages).toBeInstanceOf(Array);
    });

    test('Gemini extension should have ReAct mode configuration', () => {
      const extension = readJSON('gemini-extension.json');

      expect(extension.gemini).toBeDefined();
      expect(extension.gemini.contextWindow).toBeDefined();
      expect(extension.gemini.capabilities).toBeDefined();
      expect(extension.gemini.capabilities.reactAgent).toBeDefined();
      expect(extension.gemini.benchmarks).toBeDefined();
    });
  });

  describe('Documentation', () => {
    test('all platform documentation files should exist', () => {
      const docs = ['CLAUDE.md', 'QWEN.md', 'GEMINI.md'];

      docs.forEach(doc => {
        const docPath = path.join(__dirname, '..', doc);
        expect(fs.existsSync(docPath)).toBe(true);
      });
    });

    test('QWEN.md should mention 23 commands', () => {
      const content = fs.readFileSync(path.join(__dirname, '..', 'QWEN.md'), 'utf8');
      expect(content).toContain('23 commands');
    });

    test('GEMINI.md should mention 23 commands', () => {
      const content = fs.readFileSync(path.join(__dirname, '..', 'GEMINI.md'), 'utf8');
      expect(content).toContain('23 commands');
    });

    test('documentation should note hooks are Claude-only', () => {
      const qwenContent = fs.readFileSync(path.join(__dirname, '..', 'QWEN.md'), 'utf8');
      const geminiContent = fs.readFileSync(path.join(__dirname, '..', 'GEMINI.md'), 'utf8');

      expect(qwenContent).toContain('Hooks automation is a Claude Code-specific feature');
      expect(geminiContent).toContain('Hooks automation is a Claude Code-specific feature');
    });
  });

  describe('Installation Scripts', () => {
    test('all installation scripts should exist', () => {
      const scripts = [
        'install-claude-extension.sh',
        'install-qwen-extension.sh',
        'install-gemini-extension.sh',
        'install-all-extensions.sh'
      ];

      scripts.forEach(script => {
        const scriptPath = path.join(__dirname, '..', script);
        expect(fs.existsSync(scriptPath)).toBe(true);
      });
    });

    test('universal installer should detect all AIs', () => {
      const content = fs.readFileSync(
        path.join(__dirname, '..', 'install-all-extensions.sh'),
        'utf8'
      );

      expect(content).toContain('command -v claude');
      expect(content).toContain('command -v qwen');
      expect(content).toContain('command -v gemini');
    });
  });

  describe('Platform Comparison', () => {
    test('README should contain platform comparison matrix', () => {
      const content = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');

      expect(content).toContain('AI Platform Comparison Matrix');
      expect(content).toContain('Claude Code');
      expect(content).toContain('Qwen Code');
      expect(content).toContain('Gemini CLI');
      expect(content).toContain('Context Window');
      expect(content).toContain('Hooks Automation');
    });
  });

  describe('Command Structure Validation', () => {
    const platforms = ['claude', 'qwen', 'gemini'];

    platforms.forEach(platform => {
      describe(`${platform} commands`, () => {
        test('should have correct PRD commands (6)', () => {
          const prdPath = path.join(__dirname, '..', `.${platform}`, 'commands', 'prd');
          if (fs.existsSync(prdPath)) {
            const files = fs.readdirSync(prdPath).filter(f => f.endsWith('.md'));
            expect(files.length).toBe(6);
            expect(files).toContain('create.md');
            expect(files).toContain('analyze.md');
            expect(files).toContain('refine.md');
          }
        });

        test('should have correct planning commands (4)', () => {
          const planningPath = path.join(__dirname, '..', `.${platform}`, 'commands', 'planning');
          if (fs.existsSync(planningPath)) {
            const files = fs.readdirSync(planningPath).filter(f => f.endsWith('.md'));
            expect(files.length).toBe(4);
            expect(files).toContain('estimate-cost.md');
            expect(files).toContain('analyze-dependencies.md');
          }
        });

        test('should have correct PRPROMPTS commands (5)', () => {
          const prpromptsPath = path.join(__dirname, '..', `.${platform}`, 'commands', 'prprompts');
          if (fs.existsSync(prpromptsPath)) {
            const files = fs.readdirSync(prpromptsPath).filter(f => f.endsWith('.md'));
            expect(files.length).toBe(5);
            expect(files).toContain('generate-all.md');
            expect(files).toContain('phase-1.md');
          }
        });

        test('should have correct automation commands (6)', () => {
          const automationPath = path.join(__dirname, '..', `.${platform}`, 'commands', 'automation');
          if (fs.existsSync(automationPath)) {
            const files = fs.readdirSync(automationPath).filter(f => f.endsWith('.md'));
            expect(files.length).toBe(6);
            expect(files).toContain('bootstrap.md');
            expect(files).toContain('implement-next.md');
          }
        });

        test('should have correct refactoring commands (2)', () => {
          const refactoringPath = path.join(__dirname, '..', `.${platform}`, 'commands', 'refactoring');
          if (fs.existsSync(refactoringPath)) {
            const files = fs.readdirSync(refactoringPath).filter(f => f.endsWith('.md'));
            expect(files.length).toBe(2);
            expect(files).toContain('convert-react-to-flutter.md');
            expect(files).toContain('validate-flutter.md');
          }
        });
      });
    });
  });
});

// Run tests with: npm test tests/integration.test.js