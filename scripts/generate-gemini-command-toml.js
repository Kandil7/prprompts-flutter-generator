#!/usr/bin/env node

/**
 * Generate Gemini CLI TOML Command Files from Markdown Commands
 *
 * This script converts all PRPROMPTS command .md files to Gemini CLI .toml format
 * for use as slash commands in Gemini CLI.
 */

const fs = require('fs');
const path = require('path');

// Command categories and their files (without .md extension)
const COMMANDS = {
  prd: [
    'create',
    'auto-generate',
    'from-files',
    'auto-from-project',
    'analyze',
    'refine'
  ],
  planning: [
    'estimate-cost',
    'analyze-dependencies',
    'stakeholder-review',
    'implementation-plan'
  ],
  prprompts: [
    'generate-all',
    'phase-1',
    'phase-2',
    'phase-3',
    'single-file'
  ],
  automation: [
    'bootstrap',
    'implement-next',
    'update-plan',
    'full-cycle',
    'review-commit',
    'qa-check'
  ]
};

// Command descriptions
const DESCRIPTIONS = {
  // PRD commands
  'prd/create': 'Interactive PRD wizard with template selection',
  'prd/auto-generate': 'Auto-generate PRD from description file',
  'prd/from-files': 'Generate PRD from existing markdown docs',
  'prd/auto-from-project': 'Auto-discover and consolidate all project markdown files into PRD',
  'prd/analyze': 'Validate PRD with quality scoring (A-F grades) and AI confidence levels',
  'prd/refine': 'Interactive PRD quality improvement loop',

  // Planning commands
  'planning/estimate-cost': 'Generate comprehensive cost breakdown (labor, infrastructure, compliance)',
  'planning/analyze-dependencies': 'Map feature dependencies and calculate critical path',
  'planning/stakeholder-review': 'Create role-specific PRD review checklists',
  'planning/implementation-plan': 'Generate intelligent implementation plan with sprint planning',

  // PRPROMPTS generation commands
  'prprompts/generate-all': 'Generate all 32 PRPROMPTS files from PRD',
  'prprompts/phase-1': 'Generate Phase 1: Core Architecture (10 files)',
  'prprompts/phase-2': 'Generate Phase 2: Quality & Security (12 files)',
  'prprompts/phase-3': 'Generate Phase 3: Demo & Learning (10 files)',
  'prprompts/single-file': 'Generate single PRPROMPTS file by name',

  // Automation commands
  'automation/bootstrap': 'Complete Flutter project setup with Clean Architecture (2 min)',
  'automation/implement-next': 'Auto-implement next feature from IMPLEMENTATION_PLAN.md (10 min)',
  'automation/update-plan': 'Re-plan based on actual velocity and progress (30 sec)',
  'automation/full-cycle': 'Auto-implement 1-10 features with dependency management (1-2 hours)',
  'automation/review-commit': 'Validate code against PRPROMPTS patterns and commit',
  'automation/qa-check': 'Comprehensive compliance audit (architecture, security, testing)'
};

function escapeTomlString(str) {
  // Escape special characters for TOML multi-line string
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '\\"""');
}

function generateTomlFile(category, commandName) {
  const mdPath = path.join(__dirname, '..', '.gemini', 'commands', category, `${commandName}.md`);

  if (!fs.existsSync(mdPath)) {
    console.warn(`⚠️  Skipping ${category}/${commandName} - missing .md file`);
    return null;
  }

  // Read markdown prompt
  const promptContent = fs.readFileSync(mdPath, 'utf8');

  // Get description
  const commandKey = `${category}/${commandName}`;
  const description = DESCRIPTIONS[commandKey] || `Execute ${commandName} command`;

  // Generate TOML content
  const tomlContent = `description = "${description}"

prompt = """
${escapeTomlString(promptContent)}
"""
`;

  return tomlContent;
}

function main() {
  console.log('🚀 Generating Gemini CLI TOML Command Files...\n');

  let totalGenerated = 0;

  for (const [category, commands] of Object.entries(COMMANDS)) {
    console.log(`📁 Category: ${category}`);

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', '.gemini', 'commands', category);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const commandName of commands) {
      const tomlContent = generateTomlFile(category, commandName);

      if (!tomlContent) continue;

      // Write TOML file
      const outputPath = path.join(outputDir, `${commandName}.toml`);

      fs.writeFileSync(outputPath, tomlContent, 'utf8');
      console.log(`  ✅ ${commandName}.toml`);
      totalGenerated++;
    }
    console.log('');
  }

  console.log(`✨ Generated ${totalGenerated} TOML command files!`);
  console.log('');
  console.log('📦 Files created in:');
  console.log('   .gemini/commands/prd/*.toml (6 files)');
  console.log('   .gemini/commands/planning/*.toml (4 files)');
  console.log('   .gemini/commands/prprompts/*.toml (5 files)');
  console.log('   .gemini/commands/automation/*.toml (6 files)');
  console.log('');
  console.log('🎯 Usage in Gemini CLI:');
  console.log('   /prd:create');
  console.log('   /planning:estimate-cost');
  console.log('   /prprompts:generate-all');
  console.log('   /automation:bootstrap');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Copy to user config: cp -r .gemini/commands/* ~/.gemini/commands/');
  console.log('   2. Restart Gemini CLI');
  console.log('   3. Verify with: /help');
}

main();
