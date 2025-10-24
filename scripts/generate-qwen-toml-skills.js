#!/usr/bin/env node

/**
 * Generate Qwen Code TOML Slash Command Files from Claude Skills
 *
 * This script converts all PRPROMPTS skills to Qwen Code TOML format
 * for use as slash commands in Qwen Code CLI.
 */

const fs = require('fs');
const path = require('path');

// Skill categories and their skills
const SKILLS = {
  automation: [
    'flutter-bootstrapper',
    'feature-implementer',
    'automation-orchestrator',
    'code-reviewer',
    'qa-auditor'
  ],
  'prprompts-core': [
    'prd-creator',
    'prprompts-generator',
    'phase-generator',
    'single-file-generator'
  ],
  'development-workflow': [
    'flutter-flavors'
  ]
};

function escapeTomlString(str) {
  // Escape special characters for TOML multi-line string
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '\\"""');
}

function generateSmartDefaultsSection(skillJson) {
  if (!skillJson.inputs) return '';

  const { required = {}, optional = {} } = skillJson.inputs;
  let section = '\n## Smart Defaults (from skill.json)\n\n';

  // Required inputs
  if (Object.keys(required).length > 0) {
    section += '**Required Inputs:**\n';
    for (const [key, config] of Object.entries(required)) {
      const defaultVal = config.default !== undefined ? ` (default: "${config.default}")` : '';
      const enumVals = config.enum ? ` [options: ${config.enum.join(', ')}]` : '';
      section += `- ${key}: ${config.description}${defaultVal}${enumVals}\n`;
    }
    section += '\n';
  }

  // Optional inputs
  if (Object.keys(optional).length > 0) {
    section += '**Optional Inputs (use defaults if not specified):**\n';
    for (const [key, config] of Object.entries(optional)) {
      const defaultVal = config.default !== undefined ? ` (default: ${JSON.stringify(config.default)})` : '';
      const enumVals = config.enum ? ` [options: ${config.enum.join(', ')}]` : '';
      section += `- ${key}: ${config.description}${defaultVal}${enumVals}\n`;
    }
    section += '\n';
  }

  section += '**Interactive Prompt Strategy:**\n';
  section += 'Ask user for input ONLY if:\n';
  section += '1. Required input has no default value\n';
  section += '2. User explicitly wants to override a default\n\n';
  section += 'For each input, prompt with format:\n';
  section += '  "input_name? (press Enter for default_value)": \n\n';

  return section;
}

function generateTomlFile(category, skillName) {
  const skillDir = path.join(__dirname, '..', '.claude', 'skills', category, skillName);
  const skillJsonPath = path.join(skillDir, 'skill.json');
  const skillMdPath = path.join(skillDir, 'skill.md');

  if (!fs.existsSync(skillJsonPath) || !fs.existsSync(skillMdPath)) {
    console.warn(`⚠️  Skipping ${category}/${skillName} - missing files`);
    return null;
  }

  // Read skill metadata and prompt
  const skillJson = JSON.parse(fs.readFileSync(skillJsonPath, 'utf8'));
  const skillMd = fs.readFileSync(skillMdPath, 'utf8');

  // Generate description
  const description = skillJson.description || `Execute ${skillName} skill`;

  // Generate prompt with smart defaults
  const smartDefaults = generateSmartDefaultsSection(skillJson);
  const fullPrompt = `${smartDefaults}\n${skillMd}`;

  // Generate TOML content
  const tomlContent = `description = "${description}"

prompt = """
${escapeTomlString(fullPrompt)}
"""
`;

  return tomlContent;
}

function main() {
  console.log('🚀 Generating Qwen Code TOML Slash Command Files...\n');

  let totalGenerated = 0;

  for (const [category, skills] of Object.entries(SKILLS)) {
    console.log(`📁 Category: ${category}`);

    for (const skillName of skills) {
      const tomlContent = generateTomlFile(category, skillName);

      if (!tomlContent) continue;

      // Write TOML file
      const outputPath = path.join(
        __dirname, '..', '.qwen', 'commands', 'skills', category, `${skillName}.toml`
      );

      fs.writeFileSync(outputPath, tomlContent, 'utf8');
      console.log(`  ✅ ${skillName}.toml`);
      totalGenerated++;
    }
    console.log('');
  }

  console.log(`✨ Generated ${totalGenerated} TOML skill files!`);
  console.log('');
  console.log('📦 Installation:');
  console.log('   bash scripts/install-qwen-skills.sh');
  console.log('');
  console.log('🎯 Usage in Qwen Code:');
  console.log('   /skills/automation/flutter-bootstrapper');
  console.log('   /skills/automation/code-reviewer');
  console.log('   /skills/automation/qa-auditor');
}

main();
