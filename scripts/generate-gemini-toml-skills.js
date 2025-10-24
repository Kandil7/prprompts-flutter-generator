#!/usr/bin/env node

/**
 * Generate Gemini CLI TOML Slash Command Files from Claude Skills
 *
 * This script converts all PRPROMPTS skills to Gemini CLI TOML format
 * for use as slash commands in Gemini CLI.
 *
 * Gemini-specific features:
 * - Colon separator: /skills:automation:code-reviewer
 * - {{args}} support for inline arguments
 * - !{command} for shell execution
 * - 1M token context optimization
 * - Free tier optimization (60 req/min, 1K/day)
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

function generateGeminiEnhancements() {
  return `
## Gemini CLI Specific Features

**1. Inline Arguments Support:**
If user provides arguments inline, parse them:
  Example: /skills:automation:code-reviewer {{args}}
  If args = "security lib/features/auth":
    - review_type = "security"
    - target_path = "lib/features/auth"

**2. 1M Token Context Utilization:**
You have access to Gemini's 1M token context window:
- Load entire codebase for comprehensive analysis
- Process massive PRDs (up to 400 pages of requirements)
- Analyze all 32 PRPROMPTS files simultaneously
- Cross-reference patterns across the entire project
- No need to ask "should I read more files?" - just load everything

**3. Free Tier Optimization:**
Gemini offers industry-leading free tier:
- 60 requests/minute
- 1,000 requests/day
- No credit card required

Optimize usage by:
- Batching related operations in single requests
- Using full 1M context to avoid multiple round-trips
- Caching analysis results for reuse

**4. ReAct Loop Integration:**
Leverage Gemini's ReAct (Reason and Act) agent mode:
- Break complex tasks into reasoning steps
- Execute actions based on reasoning
- Iterate until task completion
- Especially useful for multi-file operations

`;
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

  // Generate description (keep it short for /help menu)
  const description = skillJson.description || `Execute ${skillName} skill`;

  // Generate prompt with smart defaults and Gemini enhancements
  const smartDefaults = generateSmartDefaultsSection(skillJson);
  const geminiEnhancements = generateGeminiEnhancements();
  const fullPrompt = `${smartDefaults}${geminiEnhancements}\n${skillMd}`;

  // Generate TOML content
  const tomlContent = `description = "${description}"

prompt = """
${escapeTomlString(fullPrompt)}
"""
`;

  return tomlContent;
}

function main() {
  console.log('🚀 Generating Gemini CLI TOML Slash Command Files...\n');

  let totalGenerated = 0;

  for (const [category, skills] of Object.entries(SKILLS)) {
    console.log(`📁 Category: ${category}`);

    for (const skillName of skills) {
      const tomlContent = generateTomlFile(category, skillName);

      if (!tomlContent) continue;

      // Write TOML file
      const outputPath = path.join(
        __dirname, '..', '.gemini', 'commands', 'skills', category, `${skillName}.toml`
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
  console.log('   bash scripts/install-gemini-skills.sh');
  console.log('');
  console.log('🎯 Usage in Gemini CLI:');
  console.log('   /skills:automation:flutter-bootstrapper');
  console.log('   /skills:automation:code-reviewer');
  console.log('   /skills:automation:qa-auditor');
  console.log('');
  console.log('💡 With inline arguments (Gemini feature):');
  console.log('   /skills:automation:code-reviewer security lib/features/auth');
}

main();
