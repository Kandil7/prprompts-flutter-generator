/**
 * PRPROMPTS Generator - Prompts Content Validation Tests
 * Validates PRPROMPTS content, structure, and completeness
 */

const fs = require('fs');
const path = require('path');

describe('PRPROMPTS Content Validation', () => {
  const rootDir = path.join(__dirname, '..');

  describe('Claude PRPROMPTS', () => {
    const claudePromptsDir = path.join(rootDir, '.claude', 'prompts');

    test('prprompts-generator.md should be comprehensive', () => {
      const promptPath = path.join(claudePromptsDir, 'prprompts-generator.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      // Should be at least 500 lines
      expect(content.split('\n').length).toBeGreaterThan(500);

      // Should contain key sections
      expect(content).toContain('Project Requirements Document (PRD)');
      expect(content).toContain('Generate comprehensive');
    });

    test('generate-prd.md should have PRD wizard instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'generate-prd.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('PRD');
      expect(content.length).toBeGreaterThan(100);
    });

    test('auto-generate-prd.md should have auto-generation instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'auto-generate-prd.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('Auto');
      expect(content.length).toBeGreaterThan(100);
    });

    test('generate-prd-from-files.md should have file analysis instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'generate-prd-from-files.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('file');
      expect(content.length).toBeGreaterThan(100);
    });

    test('analyze-prd.md should have PRD analysis instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'analyze-prd.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('analyze');
      expect(content.length).toBeGreaterThan(100);
    });

    test('phase-1-core.md should have Phase 1 generation instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'phase-1-core.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('Phase 1');
      expect(content.length).toBeGreaterThan(100);
    });

    test('phase-2-quality.md should have Phase 2 generation instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'phase-2-quality.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('Phase 2');
      expect(content.length).toBeGreaterThan(100);
    });

    test('phase-3-demo.md should have Phase 3 generation instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'phase-3-demo.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('Phase 3');
      expect(content.length).toBeGreaterThan(100);
    });

    test('single-file-generator.md should have file generation instructions', () => {
      const promptPath = path.join(claudePromptsDir, 'single-file-generator.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      expect(content).toContain('file');
      expect(content.length).toBeGreaterThan(100);
    });
  });

  describe('Qwen PRPROMPTS', () => {
    const qwenPromptsDir = path.join(rootDir, '.qwen', 'prompts');

    test('prprompts-generator.md should be comprehensive', () => {
      const promptPath = path.join(qwenPromptsDir, 'prprompts-generator.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      // Should be at least 500 lines
      expect(content.split('\n').length).toBeGreaterThan(500);
    });

    test('all prompts should exist and have content', () => {
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

      expectedPrompts.forEach((promptFile) => {
        const promptPath = path.join(qwenPromptsDir, promptFile);
        const content = fs.readFileSync(promptPath, 'utf8');
        expect(content.length).toBeGreaterThan(50);
      });
    });
  });

  describe('Gemini PRPROMPTS', () => {
    const geminiPromptsDir = path.join(rootDir, '.gemini', 'prompts');

    test('prprompts-generator.md should be comprehensive', () => {
      const promptPath = path.join(geminiPromptsDir, 'prprompts-generator.md');
      const content = fs.readFileSync(promptPath, 'utf8');

      // Should be at least 500 lines
      expect(content.split('\n').length).toBeGreaterThan(500);
    });

    test('all prompts should exist and have content', () => {
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

      expectedPrompts.forEach((promptFile) => {
        const promptPath = path.join(geminiPromptsDir, promptFile);
        const content = fs.readFileSync(promptPath, 'utf8');
        expect(content.length).toBeGreaterThan(50);
      });
    });
  });

  describe('PRPROMPTS Consistency', () => {
    test('all three AI platforms should have the same number of prompts', () => {
      const claudePromptsDir = path.join(rootDir, '.claude', 'prompts');
      const qwenPromptsDir = path.join(rootDir, '.qwen', 'prompts');
      const geminiPromptsDir = path.join(rootDir, '.gemini', 'prompts');

      const claudePrompts = fs.readdirSync(claudePromptsDir).filter((f) => f.endsWith('.md'));
      const qwenPrompts = fs.readdirSync(qwenPromptsDir).filter((f) => f.endsWith('.md'));
      const geminiPrompts = fs.readdirSync(geminiPromptsDir).filter((f) => f.endsWith('.md'));

      expect(claudePrompts.length).toBe(qwenPrompts.length);
      expect(qwenPrompts.length).toBe(geminiPrompts.length);
    });

    test('all three AI platforms should have the same prompt files', () => {
      const claudePromptsDir = path.join(rootDir, '.claude', 'prompts');
      const qwenPromptsDir = path.join(rootDir, '.qwen', 'prompts');
      const geminiPromptsDir = path.join(rootDir, '.gemini', 'prompts');

      const claudePrompts = fs.readdirSync(claudePromptsDir).filter((f) => f.endsWith('.md')).sort();
      const qwenPrompts = fs.readdirSync(qwenPromptsDir).filter((f) => f.endsWith('.md')).sort();
      const geminiPrompts = fs.readdirSync(geminiPromptsDir).filter((f) => f.endsWith('.md')).sort();

      expect(claudePrompts).toEqual(qwenPrompts);
      expect(qwenPrompts).toEqual(geminiPrompts);
    });
  });

  describe('Template Files', () => {
    const templatesDir = path.join(rootDir, 'templates');

    test('PRD-full-template.md should be comprehensive', () => {
      const templatePath = path.join(templatesDir, 'PRD-full-template.md');
      const content = fs.readFileSync(templatePath, 'utf8');

      // Should be at least 200 lines
      expect(content.split('\n').length).toBeGreaterThan(200);

      // Should contain key sections
      expect(content).toContain('Executive Summary');
      expect(content).toContain('Technical Architecture');
    });

    test('project_description.md should have description template', () => {
      const templatePath = path.join(templatesDir, 'project_description.md');
      const content = fs.readFileSync(templatePath, 'utf8');

      expect(content.length).toBeGreaterThan(50);
    });
  });

  describe('Example Files', () => {
    const examplesDir = path.join(rootDir, 'examples');

    test('healthcare-app-example.md should be comprehensive', () => {
      const examplePath = path.join(examplesDir, 'healthcare-app-example.md');
      const content = fs.readFileSync(examplePath, 'utf8');

      // Should be substantial (800+ lines)
      expect(content.split('\n').length).toBeGreaterThan(800);

      // Should contain key sections
      expect(content).toContain('HIPAA');
      expect(content).toContain('Healthcare');
    });

    test('ecommerce-app-example.md should be comprehensive', () => {
      const examplePath = path.join(examplesDir, 'ecommerce-app-example.md');
      const content = fs.readFileSync(examplePath, 'utf8');

      // Should be substantial (800+ lines)
      expect(content.split('\n').length).toBeGreaterThan(800);

      // Should contain key sections
      expect(content).toContain('E-Commerce');
      expect(content).toContain('Payment');
    });

    test('education-app-example.md should be comprehensive', () => {
      const examplePath = path.join(examplesDir, 'education-app-example.md');
      const content = fs.readFileSync(examplePath, 'utf8');

      // Should be substantial (800+ lines)
      expect(content.split('\n').length).toBeGreaterThan(800);

      // Should contain key sections
      expect(content).toContain('FERPA');
      expect(content).toContain('Education');
    });
  });

  describe('Configuration Files', () => {
    test('.claude/config.yml should have valid YAML structure', () => {
      const configPath = path.join(rootDir, '.claude', 'config.yml');
      const content = fs.readFileSync(configPath, 'utf8');

      // Basic YAML validation - should have key:value pairs
      expect(content).toMatch(/\w+:/);
      expect(content.length).toBeGreaterThan(20);
    });

    test('.qwen/config.yml should have valid YAML structure', () => {
      const configPath = path.join(rootDir, '.qwen', 'config.yml');
      const content = fs.readFileSync(configPath, 'utf8');

      expect(content).toMatch(/\w+:/);
      expect(content.length).toBeGreaterThan(20);
    });

    test('.gemini/config.yml should have valid YAML structure', () => {
      const configPath = path.join(rootDir, '.gemini', 'config.yml');
      const content = fs.readFileSync(configPath, 'utf8');

      expect(content).toMatch(/\w+:/);
      expect(content.length).toBeGreaterThan(20);
    });
  });
});
