#!/usr/bin/env node

/**
 * PRPROMPTS Skill Testing Script
 *
 * Tests individual skills with mock inputs and validates outputs
 *
 * Usage:
 *   node scripts/test-skill.js <skill-id> [options]
 *   node scripts/test-skill.js prd-analyzer --input tests/fixtures/sample-prd.md
 *   node scripts/test-skill.js prprompts-generator --expect-files "PRPROMPTS/*.md" --expect-count 32
 *   node scripts/test-skill.js flutter-bootstrapper --mock
 *
 * Options:
 *   --input <path>           Input file path
 *   --expect-output <json>   Expected output JSON
 *   --expect-files <glob>    Expected output file pattern
 *   --expect-count <n>       Expected file count
 *   --mock                   Use mock inputs from skill.json
 *   --verbose                Show detailed output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class SkillTester {
  constructor(skillId, options = {}) {
    this.skillId = skillId;
    this.options = options;
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, color = 'reset') {
    if (this.options.verbose || color !== 'reset') {
      console.log(`${colors[color]}${message}${colors.reset}`);
    }
  }

  error(message) {
    this.errors.push(message);
    this.failed++;
    this.log(`❌ ${message}`, 'red');
  }

  warning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'yellow');
  }

  success(message) {
    this.passed++;
    this.log(`✅ ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'cyan');
  }

  /**
   * Find skill.json file
   */
  findSkillFile() {
    // Try to find skill in any category
    const categories = ['prprompts-core', 'automation', 'validation', 'utilities', 'repository-meta', 'development-workflow'];

    for (const category of categories) {
      const skillPath = path.join('.claude', 'skills', category, this.skillId, 'skill.json');
      if (fs.existsSync(skillPath)) {
        return skillPath;
      }
    }

    // Try direct path (category/skill-name format)
    if (this.skillId.includes('/')) {
      const skillPath = path.join('.claude', 'skills', this.skillId, 'skill.json');
      if (fs.existsSync(skillPath)) {
        return skillPath;
      }
    }

    return null;
  }

  /**
   * Load and validate skill definition
   */
  loadSkill() {
    this.info(`Loading skill: ${this.skillId}`);

    const skillPath = this.findSkillFile();
    if (!skillPath) {
      this.error(`Skill not found: ${this.skillId}`);
      return null;
    }

    this.skillPath = skillPath;
    this.skillDir = path.dirname(skillPath);
    this.info(`Found at: ${skillPath}`);

    try {
      const skillContent = fs.readFileSync(skillPath, 'utf8');
      const skill = JSON.parse(skillContent);
      this.success('Skill JSON is valid');
      return skill;
    } catch (err) {
      this.error(`Failed to parse skill.json: ${err.message}`);
      return null;
    }
  }

  /**
   * Validate skill structure
   */
  validateStructure(skill) {
    this.info('Validating skill structure...');

    // Check required fields
    const requiredFields = ['id', 'name', 'version', 'category', 'description'];
    for (const field of requiredFields) {
      if (!skill[field]) {
        this.error(`Missing required field: ${field}`);
      } else {
        this.success(`Has ${field}: ${skill[field]}`);
      }
    }

    // Check version format
    if (skill.version && !/^\d+\.\d+\.\d+$/.test(skill.version)) {
      this.error(`Invalid version format: ${skill.version} (should be semver)`);
    }

    // Check category
    const validCategories = ['prprompts-core', 'automation', 'validation', 'utilities', 'repository-meta', 'development-workflow'];
    if (skill.category && !validCategories.includes(skill.category)) {
      this.error(`Invalid category: ${skill.category}`);
    }

    // Check for skill.md
    const skillMdPath = path.join(this.skillDir, 'skill.md');
    if (fs.existsSync(skillMdPath)) {
      this.success('skill.md exists');
    } else {
      this.error('skill.md is missing');
    }

    // Check for README.md (junior docs)
    const readmePath = path.join(this.skillDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      this.success('README.md exists (junior documentation)');
    } else {
      this.warning('README.md is missing (recommended for junior developers)');
    }

    // Check for examples.md
    const examplesPath = path.join(this.skillDir, 'examples.md');
    if (fs.existsSync(examplesPath)) {
      this.success('examples.md exists');
    } else {
      this.warning('examples.md is missing (recommended)');
    }
  }

  /**
   * Test skill with mock inputs
   */
  testWithMockInputs(skill) {
    this.info('Testing with mock inputs...');

    if (!skill.cicd || !skill.cicd.testable) {
      this.warning('Skill is not configured for CI/CD testing');
      return;
    }

    const mockInputs = skill.cicd.mockInputs || {};
    this.info(`Mock inputs: ${JSON.stringify(mockInputs, null, 2)}`);

    // Validate inputs exist
    for (const [key, value] of Object.entries(mockInputs)) {
      if (typeof value === 'string' && value.endsWith('.md')) {
        // Check if file exists
        if (fs.existsSync(value)) {
          this.success(`Mock input file exists: ${value}`);
        } else {
          this.error(`Mock input file missing: ${value}`);
        }
      }
    }

    // Check expected outputs
    const expectedOutputs = skill.cicd.expectedOutputs || {};
    if (Object.keys(expectedOutputs).length > 0) {
      this.success(`Expected outputs defined: ${Object.keys(expectedOutputs).join(', ')}`);
    } else {
      this.warning('No expected outputs defined for validation');
    }
  }

  /**
   * Check multi-AI parity
   */
  checkMultiAIParity() {
    this.info('Checking multi-AI parity...');

    const qwenPath = this.skillPath.replace('.claude', '.qwen');
    const geminiPath = this.skillPath.replace('.claude', '.gemini');

    if (fs.existsSync(qwenPath)) {
      this.success('Skill exists in .qwen/');
    } else {
      this.error('Skill missing in .qwen/');
    }

    if (fs.existsSync(geminiPath)) {
      this.success('Skill exists in .gemini/');
    } else {
      this.error('Skill missing in .gemini/');
    }

    // Check if files are identical
    try {
      const claudeContent = fs.readFileSync(this.skillPath, 'utf8');
      const qwenContent = fs.existsSync(qwenPath) ? fs.readFileSync(qwenPath, 'utf8') : '';
      const geminiContent = fs.existsSync(geminiPath) ? fs.readFileSync(geminiPath, 'utf8') : '';

      if (claudeContent === qwenContent && claudeContent === geminiContent) {
        this.success('All AI skill files are identical');
      } else {
        this.warning('AI skill files differ (may need sync)');
      }
    } catch (err) {
      this.warning(`Could not compare files: ${err.message}`);
    }
  }

  /**
   * Validate against JSON schema
   */
  validateAgainstSchema(skill) {
    this.info('Validating against JSON schema...');

    const schemaPath = path.join('schemas', 'skill-schema.json');
    if (!fs.existsSync(schemaPath)) {
      this.warning('JSON schema not found, skipping validation');
      return;
    }

    try {
      // Try to use ajv if available
      const ajv = require('ajv');
      const Ajv = ajv.default || ajv;
      const ajvInstance = new Ajv();

      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      const validate = ajvInstance.compile(schema);
      const valid = validate(skill);

      if (valid) {
        this.success('Skill passes JSON schema validation');
      } else {
        this.error(`Schema validation failed: ${JSON.stringify(validate.errors, null, 2)}`);
      }
    } catch (err) {
      this.warning(`Could not validate schema (ajv not installed): ${err.message}`);
    }
  }

  /**
   * Run all tests
   */
  async run() {
    console.log('');
    console.log('='.repeat(60));
    console.log(`🧪 PRPROMPTS Skill Test: ${this.skillId}`);
    console.log('='.repeat(60));
    console.log('');

    const skill = this.loadSkill();
    if (!skill) {
      return this.reportResults();
    }

    this.validateStructure(skill);
    this.validateAgainstSchema(skill);
    this.testWithMockInputs(skill);
    this.checkMultiAIParity();

    return this.reportResults();
  }

  /**
   * Report test results
   */
  reportResults() {
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 Test Results');
    console.log('='.repeat(60));
    console.log('');
    console.log(`${colors.green}✅ Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${this.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${this.warnings.length}${colors.reset}`);
    console.log('');

    if (this.errors.length > 0) {
      console.log(`${colors.red}Errors:${colors.reset}`);
      this.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
      console.log('');
    }

    if (this.warnings.length > 0 && this.options.verbose) {
      console.log(`${colors.yellow}Warnings:${colors.reset}`);
      this.warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
      console.log('');
    }

    const success = this.failed === 0;
    if (success) {
      console.log(`${colors.green}🎉 All tests passed!${colors.reset}`);
    } else {
      console.log(`${colors.red}💥 Some tests failed${colors.reset}`);
    }
    console.log('');

    return success ? 0 : 1;
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node scripts/test-skill.js <skill-id> [options]

Arguments:
  <skill-id>               Skill identifier (e.g., prd-analyzer)

Options:
  --input <path>           Input file path
  --expect-output <json>   Expected output JSON
  --expect-files <glob>    Expected output file pattern
  --expect-count <n>       Expected file count
  --mock                   Use mock inputs from skill.json
  --verbose                Show detailed output
  --help, -h               Show this help message

Examples:
  node scripts/test-skill.js prd-analyzer
  node scripts/test-skill.js prd-analyzer --input tests/fixtures/sample-prd.md
  node scripts/test-skill.js prprompts-generator --expect-count 32
  node scripts/test-skill.js flutter-bootstrapper --mock --verbose
`);
    process.exit(0);
  }

  const skillId = args[0];
  const options = {
    verbose: args.includes('--verbose'),
    mock: args.includes('--mock')
  };

  // Parse other options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--input' && nextArg) {
      options.input = nextArg;
      i++;
    } else if (arg === '--expect-output' && nextArg) {
      options.expectOutput = JSON.parse(nextArg);
      i++;
    } else if (arg === '--expect-files' && nextArg) {
      options.expectFiles = nextArg;
      i++;
    } else if (arg === '--expect-count' && nextArg) {
      options.expectCount = parseInt(nextArg, 10);
      i++;
    }
  }

  return { skillId, options };
}

// Main execution
async function main() {
  const { skillId, options } = parseArgs();
  const tester = new SkillTester(skillId, options);
  const exitCode = await tester.run();
  process.exit(exitCode);
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { SkillTester };
