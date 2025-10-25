/**
 * PRPROMPTS Generator - Validation Tests
 * Cross-platform tests for file structure and content validation
 */

const fs = require('fs');
const path = require('path');

describe('PRPROMPTS File Structure Validation', () => {
  const rootDir = path.join(__dirname, '..');

  describe('Claude Prompts', () => {
    const claudePromptsDir = path.join(rootDir, '.claude', 'prompts');
    const expectedPrompts = [
      'prprompts-generator.md',
      'generate-prd.md',
      'auto-generate-prd.md',
      'generate-prd-from-files.md',
      'analyze-prd.md',
      'phase-1-core.md',
      'phase-2-quality.md',
      'phase-3-demo.md',
      'single-file-generator.md',
    ];

    test('should have .claude/prompts directory', () => {
      expect(fs.existsSync(claudePromptsDir)).toBe(true);
    });

    expectedPrompts.forEach((promptFile) => {
      test(`should have ${promptFile}`, () => {
        const promptPath = path.join(claudePromptsDir, promptFile);
        expect(fs.existsSync(promptPath)).toBe(true);
      });
    });

    test('should have exactly 9 prompt files', () => {
      const files = fs.readdirSync(claudePromptsDir).filter((f) => f.endsWith('.md'));
      expect(files.length).toBe(9);
    });

    test('main generator prompt should be comprehensive', () => {
      const mainPromptPath = path.join(claudePromptsDir, 'prprompts-generator.md');
      const content = fs.readFileSync(mainPromptPath, 'utf8');
      const lines = content.split('\n').length;
      expect(lines).toBeGreaterThan(500);
    });
  });

  describe('Qwen Prompts', () => {
    const qwenPromptsDir = path.join(rootDir, '.qwen', 'prompts');
    const expectedPrompts = [
      'prprompts-generator.md',
      'generate-prd.md',
      'auto-generate-prd.md',
      'generate-prd-from-files.md',
      'analyze-prd.md',
      'phase-1-core.md',
      'phase-2-quality.md',
      'phase-3-demo.md',
      'single-file-generator.md',
    ];

    test('should have .qwen/prompts directory', () => {
      expect(fs.existsSync(qwenPromptsDir)).toBe(true);
    });

    expectedPrompts.forEach((promptFile) => {
      test(`should have ${promptFile}`, () => {
        const promptPath = path.join(qwenPromptsDir, promptFile);
        expect(fs.existsSync(promptPath)).toBe(true);
      });
    });

    test('should have exactly 9 prompt files', () => {
      const files = fs.readdirSync(qwenPromptsDir).filter((f) => f.endsWith('.md'));
      expect(files.length).toBe(9);
    });
  });

  describe('Gemini Prompts', () => {
    const geminiPromptsDir = path.join(rootDir, '.gemini', 'prompts');
    const expectedPrompts = [
      'prprompts-generator.md',
      'generate-prd.md',
      'auto-generate-prd.md',
      'generate-prd-from-files.md',
      'analyze-prd.md',
      'phase-1-core.md',
      'phase-2-quality.md',
      'phase-3-demo.md',
      'single-file-generator.md',
    ];

    test('should have .gemini/prompts directory', () => {
      expect(fs.existsSync(geminiPromptsDir)).toBe(true);
    });

    expectedPrompts.forEach((promptFile) => {
      test(`should have ${promptFile}`, () => {
        const promptPath = path.join(geminiPromptsDir, promptFile);
        expect(fs.existsSync(promptPath)).toBe(true);
      });
    });

    test('should have exactly 9 prompt files', () => {
      const files = fs.readdirSync(geminiPromptsDir).filter((f) => f.endsWith('.md'));
      expect(files.length).toBe(9);
    });
  });

  describe('Configuration Files', () => {
    const configFiles = [
      '.claude/config.yml',
      '.qwen/config.yml',
      '.gemini/config.yml',
    ];

    configFiles.forEach((configFile) => {
      test(`should have ${configFile}`, () => {
        const configPath = path.join(rootDir, configFile);
        expect(fs.existsSync(configPath)).toBe(true);
      });
    });
  });

  describe('Template Files', () => {
    const templateFiles = [
      'templates/PRD-full-template.md',
      'templates/project_description.md',
    ];

    templateFiles.forEach((templateFile) => {
      test(`should have ${templateFile}`, () => {
        const templatePath = path.join(rootDir, templateFile);
        expect(fs.existsSync(templatePath)).toBe(true);
      });
    });
  });

  describe('Example Files', () => {
    test('should have examples directory', () => {
      const examplesDir = path.join(rootDir, 'examples');
      expect(fs.existsSync(examplesDir)).toBe(true);
    });

    test('should have at least 5 example files', () => {
      const examplesDir = path.join(rootDir, 'examples');
      const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith('.md'));
      expect(files.length).toBeGreaterThanOrEqual(5);
    });

    const expectedExamples = [
      'healthcare-app-example.md',
      'ecommerce-app-example.md',
      'education-app-example.md',
    ];

    expectedExamples.forEach((exampleFile) => {
      test(`should have ${exampleFile}`, () => {
        const examplePath = path.join(rootDir, 'examples', exampleFile);
        expect(fs.existsSync(examplePath)).toBe(true);
      });
    });
  });

  describe('Documentation Files', () => {
    const coreDocFiles = [
      'README.md',
      'CHANGELOG.md',
      'CONTRIBUTING.md',
      'LICENSE',
      'CODE_OF_CONDUCT.md',
      'SECURITY.md',
    ];

    const docsFiles = [
      'docs/PRPROMPTS-SPECIFICATION.md',
      'docs/PRD-GUIDE.md',
      'docs/AUTO-PRD-GUIDE.md',
      'docs/PRD-FROM-FILES-GUIDE.md',
      'docs/CLAUDE-COMMANDS.md',
      'docs/QWEN-COMMANDS.md',
      'docs/GEMINI-COMMANDS.md',
      'docs/AI-COMPARISON.md',
      'docs/USAGE.md',
      'docs/CUSTOMIZATION.md',
      'docs/TROUBLESHOOTING.md',
      'docs/API.md',
      'docs/BEST-PRACTICES.md',
      'docs/MIGRATION-GUIDE.md',
    ];

    coreDocFiles.forEach((docFile) => {
      test(`should have ${docFile}`, () => {
        const docPath = path.join(rootDir, docFile);
        expect(fs.existsSync(docPath)).toBe(true);
      });
    });

    docsFiles.forEach((docFile) => {
      test(`should have ${docFile}`, () => {
        const docPath = path.join(rootDir, docFile);
        expect(fs.existsSync(docPath)).toBe(true);
      });
    });
  });

  describe('Installation Scripts', () => {
    const installScripts = [
      'scripts/install-commands.sh',
      'scripts/install-commands.bat',
      'scripts/install-commands.ps1',
      'scripts/install-qwen-commands.sh',
      'scripts/install-qwen-commands.bat',
      'scripts/install-qwen-commands.ps1',
      'scripts/install-gemini-commands.sh',
      'scripts/install-gemini-commands.bat',
      'scripts/install-gemini-commands.ps1',
    ];

    installScripts.forEach((scriptFile) => {
      test(`should have ${scriptFile}`, () => {
        const scriptPath = path.join(rootDir, scriptFile);
        expect(fs.existsSync(scriptPath)).toBe(true);
      });
    });
  });

  describe('Extension Files', () => {
    const extensionFiles = [
      'claude-extension.json',
      'qwen-extension.json',
      'gemini-extension.json',
    ];

    extensionFiles.forEach((extensionFile) => {
      test(`should have ${extensionFile}`, () => {
        const extensionPath = path.join(rootDir, extensionFile);
        expect(fs.existsSync(extensionPath)).toBe(true);
      });

      test(`${extensionFile} should be valid JSON`, () => {
        const extensionPath = path.join(rootDir, extensionFile);
        const content = fs.readFileSync(extensionPath, 'utf8');
        expect(() => JSON.parse(content)).not.toThrow();
      });
    });
  });

  describe('GitHub Templates', () => {
    const githubTemplates = [
      '.github/ISSUE_TEMPLATE/bug_report.yml',
      '.github/ISSUE_TEMPLATE/feature_request.yml',
      '.github/ISSUE_TEMPLATE/documentation.yml',
      '.github/ISSUE_TEMPLATE/config.yml',
      '.github/PULL_REQUEST_TEMPLATE.md',
      '.github/FUNDING.yml',
    ];

    githubTemplates.forEach((templateFile) => {
      test(`should have ${templateFile}`, () => {
        const templatePath = path.join(rootDir, templateFile);
        expect(fs.existsSync(templatePath)).toBe(true);
      });
    });
  });

  describe('Code Quality Files', () => {
    const qualityFiles = [
      'jest.config.js',
      '.eslintrc.js',
      '.prettierrc.js',
      '.prettierignore',
      '.editorconfig',
      '.markdownlint.json',
      '.npmignore',
    ];

    qualityFiles.forEach((qualityFile) => {
      test(`should have ${qualityFile}`, () => {
        const qualityPath = path.join(rootDir, qualityFile);
        expect(fs.existsSync(qualityPath)).toBe(true);
      });
    });
  });
});
