#!/usr/bin/env node
/**
 * Post-install script for PRPROMPTS Flutter Generator
 * Automatically configures AI assistant commands after npm install
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function commandExists(command) {
  try {
    if (os.platform() === 'win32') {
      execSync(`where ${command}`, { stdio: 'ignore' });
    } else {
      execSync(`which ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect Windows shell environment (PowerShell, CMD, Git Bash, WSL)
 * @returns {string} 'powershell', 'cmd', 'bash', or 'wsl'
 */
function detectWindowsShell() {
  if (os.platform() !== 'win32') {
    return 'unix';
  }

  // Check if running in WSL
  try {
    const release = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    if (release.includes('microsoft') || release.includes('wsl')) {
      return 'wsl';
    }
  } catch {
    // Not WSL
  }

  // Check for Git Bash by looking at common env vars
  if (process.env.MSYSTEM || process.env.BASH) {
    return 'bash';
  }

  // Check if PowerShell is the parent process
  if (process.env.PSModulePath || process.env.WT_SESSION) {
    return 'powershell';
  }

  // Default to CMD
  return 'cmd';
}

function getConfigPath(ai) {
  const home = os.homedir();
  const platform = os.platform();

  if (platform === 'win32') {
    // Windows: %USERPROFILE%\.config\<ai>
    return path.join(home, '.config', ai);
  } else {
    // macOS/Linux: ~/.config/<ai>
    return path.join(home, '.config', ai);
  }
}

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyPrompts(ai, configPath) {
  const promptsDir = path.join(configPath, 'prompts');
  ensureDirectory(promptsDir);

  // Use the correct AI directory (`.claude`, `.qwen`, or `.gemini`)
  const sourceDir = path.join(__dirname, '..', `.${ai}`, 'prompts');

  if (!fs.existsSync(sourceDir)) {
    log(`  ⚠️  Warning: Source prompts directory not found at ${sourceDir}`, 'yellow');
    return false;
  }

  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const source = path.join(sourceDir, file);
    const dest = path.join(promptsDir, file);
    fs.copyFileSync(source, dest);
  });

  log(`  ✓ Copied ${files.length} prompt files`, 'green');
  return true;
}

function copyConfig(ai, configPath) {
  const configFile = path.join(configPath, 'config.yml');
  // Use the correct AI directory (`.claude`, `.qwen`, or `.gemini`)
  const sourceConfig = path.join(__dirname, '..', `.${ai}`, 'config.yml');

  if (!fs.existsSync(sourceConfig)) {
    log(`  ⚠️  Warning: Source config not found at ${sourceConfig}`, 'yellow');
    return false;
  }

  // Don't overwrite existing config
  if (fs.existsSync(configFile)) {
    log(`  ℹ️  Config already exists, skipping`, 'cyan');
    return true;
  }

  fs.copyFileSync(sourceConfig, configFile);
  log(`  ✓ Copied config file`, 'green');
  return true;
}

function copyCommands(ai, configPath) {
  const commandsDir = path.join(configPath, 'commands');
  ensureDirectory(commandsDir);

  // Use the correct AI directory (`.claude`, `.qwen`, or `.gemini`)
  const sourceDir = path.join(__dirname, '..', `.${ai}`, 'commands');

  if (!fs.existsSync(sourceDir)) {
    log(`  ⚠️  Warning: Source commands directory not found at ${sourceDir}`, 'yellow');
    return false;
  }

  // Copy all subdirectories (prd/, planning/, prprompts/, automation/, refactoring/)
  const subdirs = fs.readdirSync(sourceDir).filter(item => {
    const fullPath = path.join(sourceDir, item);
    return fs.statSync(fullPath).isDirectory();
  });

  let totalFiles = 0;
  subdirs.forEach(subdir => {
    const sourceSubdir = path.join(sourceDir, subdir);
    const destSubdir = path.join(commandsDir, subdir);
    ensureDirectory(destSubdir);

    // Copy both .md and .toml files (Qwen/Gemini need .toml for slash commands)
    const files = fs.readdirSync(sourceSubdir).filter(f => f.endsWith('.md') || f.endsWith('.toml'));
    files.forEach(file => {
      const source = path.join(sourceSubdir, file);
      const dest = path.join(destSubdir, file);
      fs.copyFileSync(source, dest);
      totalFiles++;
    });
  });

  log(`  ✓ Copied ${totalFiles} command files in ${subdirs.length} categories`, 'green');
  return true;
}

function installForAI(ai, aiName) {
  log(`\nConfiguring ${aiName}...`, 'blue');

  const configPath = getConfigPath(ai);
  ensureDirectory(configPath);

  const promptsSuccess = copyPrompts(ai, configPath);
  const configSuccess = copyConfig(ai, configPath);
  const commandsSuccess = copyCommands(ai, configPath);

  if (promptsSuccess && configSuccess && commandsSuccess) {
    log(`✓ ${aiName} configured successfully!`, 'green');
    return true;
  }

  return false;
}

function installQwenSkills() {
  if (!commandExists('qwen')) {
    return false;
  }

  log('\nInstalling Qwen Code Skills...', 'blue');

  try {
    const bashScriptPath = path.join(__dirname, 'install-qwen-skills.sh');
    const psScriptPath = path.join(__dirname, 'install-qwen-skills.ps1');
    const batScriptPath = path.join(__dirname, 'install-qwen-skills.bat');

    // Run installation script based on platform and environment
    if (os.platform() === 'win32') {
      const shell = detectWindowsShell();

      if ((shell === 'bash' || shell === 'wsl') && fs.existsSync(bashScriptPath)) {
        // Git Bash or WSL - use bash script
        execSync(`bash "${bashScriptPath}"`, { stdio: 'inherit' });
      } else if (shell === 'powershell' && fs.existsSync(psScriptPath)) {
        // PowerShell - use .ps1 script
        execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit' });
      } else if (fs.existsSync(batScriptPath)) {
        // CMD - use .bat script
        execSync(`"${batScriptPath}"`, { stdio: 'inherit' });
      } else if (fs.existsSync(psScriptPath)) {
        // Fallback to PowerShell
        execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit' });
      } else {
        log('  ⚠️  No Windows installer found, skipping', 'yellow');
        return false;
      }
    } else {
      // macOS/Linux - use bash script
      if (!fs.existsSync(bashScriptPath)) {
        log('  ⚠️  Qwen skills installer not found, skipping', 'yellow');
        return false;
      }
      execSync(`bash "${bashScriptPath}"`, { stdio: 'inherit' });
    }

    log('\n✓ Qwen Code Skills installed successfully!', 'green');
    return true;
  } catch (error) {
    log(`  ⚠️  Failed to install Qwen skills: ${error.message}`, 'yellow');
    return false;
  }
}

function installGeminiSkills() {
  if (!commandExists('gemini')) {
    return false;
  }

  log('\nInstalling Gemini CLI Skills...', 'blue');

  try {
    const bashScriptPath = path.join(__dirname, 'install-gemini-skills.sh');
    const psScriptPath = path.join(__dirname, 'install-gemini-skills.ps1');
    const batScriptPath = path.join(__dirname, 'install-gemini-skills.bat');

    // Run installation script based on platform and environment
    if (os.platform() === 'win32') {
      const shell = detectWindowsShell();

      if ((shell === 'bash' || shell === 'wsl') && fs.existsSync(bashScriptPath)) {
        // Git Bash or WSL - use bash script
        execSync(`bash "${bashScriptPath}"`, { stdio: 'inherit' });
      } else if (shell === 'powershell' && fs.existsSync(psScriptPath)) {
        // PowerShell - use .ps1 script
        execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit' });
      } else if (fs.existsSync(batScriptPath)) {
        // CMD - use .bat script
        execSync(`"${batScriptPath}"`, { stdio: 'inherit' });
      } else if (fs.existsSync(psScriptPath)) {
        // Fallback to PowerShell
        execSync(`powershell -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit' });
      } else {
        log('  ⚠️  No Windows installer found, skipping', 'yellow');
        return false;
      }
    } else {
      // macOS/Linux - use bash script
      if (!fs.existsSync(bashScriptPath)) {
        log('  ⚠️  Gemini skills installer not found, skipping', 'yellow');
        return false;
      }
      execSync(`bash "${bashScriptPath}"`, { stdio: 'inherit' });
    }

    log('\n✓ Gemini CLI Skills installed successfully!', 'green');
    return true;
  } catch (error) {
    log(`  ⚠️  Failed to install Gemini skills: ${error.message}`, 'yellow');
    return false;
  }
}

function generateTomlCommands() {
  log('\nGenerating TOML command files...', 'blue');

  try {
    // Generate Qwen TOML commands
    const qwenScript = path.join(__dirname, 'generate-qwen-command-toml.js');
    if (fs.existsSync(qwenScript)) {
      execSync(`node "${qwenScript}"`, { stdio: 'pipe' });
      log('  ✓ Qwen TOML commands generated', 'green');
    }

    // Generate Gemini TOML commands
    const geminiScript = path.join(__dirname, 'generate-gemini-command-toml.js');
    if (fs.existsSync(geminiScript)) {
      execSync(`node "${geminiScript}"`, { stdio: 'pipe' });
      log('  ✓ Gemini TOML commands generated', 'green');
    }

    return true;
  } catch (error) {
    log(`  ⚠️  Warning: Failed to generate TOML files: ${error.message}`, 'yellow');
    return false;
  }
}

function getPackageVersion() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch (error) {
    return '4.4.1'; // fallback
  }
}

function saveVersionInfo(installedAIs) {
  const home = os.homedir();
  const prpromptsDir = path.join(home, '.prprompts');
  const versionFile = path.join(prpromptsDir, 'version.json');
  const currentVersion = getPackageVersion();

  const versionInfo = {
    version: currentVersion,
    updated_at: new Date().toISOString(),
    installed_ais: installedAIs
  };

  // Save to central version file
  fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));

  // Save to each AI config directory
  installedAIs.forEach(ai => {
    const aiConfigPath = getConfigPath(ai);
    if (fs.existsSync(aiConfigPath)) {
      const aiVersionFile = path.join(aiConfigPath, '.prprompts-version.json');
      const aiVersionInfo = {
        prprompts_version: currentVersion,
        updated_at: new Date().toISOString(),
        ai: ai
      };

      try {
        fs.writeFileSync(aiVersionFile, JSON.stringify(aiVersionInfo, null, 2));
      } catch (error) {
        // Silently ignore version file write errors
      }
    }
  });

  log(`✓ Version info saved: v${currentVersion}`, 'green');
}

function createPRPROMPTSConfig() {
  const home = os.homedir();
  const prpromptsDir = path.join(home, '.prprompts');
  const configFile = path.join(prpromptsDir, 'config.json');

  ensureDirectory(prpromptsDir);

  const currentVersion = getPackageVersion();

  const config = {
    version: currentVersion,
    default_ai: 'claude',
    ais: {
      claude: { enabled: false, config_path: getConfigPath('claude') },
      qwen: { enabled: false, config_path: getConfigPath('qwen') },
      gemini: { enabled: false, config_path: getConfigPath('gemini') }
    },
    features: {
      auto_update: true,
      telemetry: false,
      verbose: true,
      qwen_skills: false,
      gemini_skills: false
    }
  };

  // Detect installed AIs
  if (commandExists('claude')) config.ais.claude.enabled = true;
  if (commandExists('qwen')) config.ais.qwen.enabled = true;
  if (commandExists('gemini')) config.ais.gemini.enabled = true;

  // Set default to first available AI
  if (config.ais.qwen.enabled) config.default_ai = 'qwen';
  if (config.ais.gemini.enabled) config.default_ai = 'gemini';
  if (config.ais.claude.enabled) config.default_ai = 'claude';

  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  log(`\n✓ Created unified config at ${configFile}`, 'green');
}

function main() {
  log('\n========================================================', 'cyan');
  log('  PRPROMPTS Flutter Generator - Post-Install Setup', 'cyan');
  log('========================================================\n', 'cyan');

  // Detect installed AI assistants
  const ais = [
    { command: 'claude', name: 'Claude Code', key: 'claude' },
    { command: 'qwen', name: 'Qwen Code', key: 'qwen' },
    { command: 'gemini', name: 'Gemini CLI', key: 'gemini' }
  ];

  const installedAIs = ais.filter(ai => commandExists(ai.command));

  if (installedAIs.length === 0) {
    log('⚠️  No AI assistants detected!', 'yellow');
    log('\nPlease install at least one of the following:', 'yellow');
    log('  • Claude Code: npm install -g @anthropic-ai/claude-code', 'cyan');
    log('  • Qwen Code: npm install -g @qwen/qwen-code', 'cyan');
    log('  • Gemini CLI: npm install -g @google/gemini-cli', 'cyan');
    log('\nThen run: npm run postinstall', 'cyan');
    return;
  }

  log('Detected AI assistants:', 'blue');
  installedAIs.forEach(ai => {
    try {
      const version = execSync(`${ai.command} --version`, { encoding: 'utf-8' }).trim();
      log(`  ✓ ${ai.name}: ${version}`, 'green');
    } catch {
      log(`  ✓ ${ai.name}`, 'green');
    }
  });

  // Generate TOML command files (required for Qwen and Gemini)
  generateTomlCommands();

  // Install for each detected AI
  let successCount = 0;
  installedAIs.forEach(ai => {
    if (installForAI(ai.key, ai.name)) {
      successCount++;
    }
  });

  // Install Qwen Code Skills (if Qwen is detected)
  const qwenSkillsInstalled = installQwenSkills();

  // Install Gemini CLI Skills (if Gemini is detected)
  const geminiSkillsInstalled = installGeminiSkills();

  // Create unified config
  createPRPROMPTSConfig();

  // Update config with skills status
  if (qwenSkillsInstalled || geminiSkillsInstalled) {
    const home = os.homedir();
    const configFile = path.join(home, '.prprompts', 'config.json');
    try {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (qwenSkillsInstalled) config.features.qwen_skills = true;
      if (geminiSkillsInstalled) config.features.gemini_skills = true;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      // Ignore config update errors
    }
  }

  // Save version information
  const installedAIsList = installedAIs.map(ai => ai.key);
  saveVersionInfo(installedAIsList);

  // Summary
  log('\n========================================================', 'cyan');
  log('  Installation Complete!', 'green');
  log('========================================================\n', 'cyan');

  log(`✓ Configured ${successCount} AI assistant(s)`, 'green');

  if (qwenSkillsInstalled) {
    log('✓ Installed Qwen Code Skills (8 slash commands)', 'green');
  }

  if (geminiSkillsInstalled) {
    log('✓ Installed Gemini CLI Skills (8 slash commands)', 'green');
  }

  log('\nAvailable commands:', 'blue');

  installedAIs.forEach(ai => {
    log(`  ${ai.command} create-prd       - Create PRD interactively`, 'cyan');
    log(`  ${ai.command} gen-prprompts    - Generate all 32 files`, 'cyan');
  });

  if (qwenSkillsInstalled) {
    log('\n Qwen Code Skills (slash commands):', 'blue');
    log('   /skills/automation/flutter-bootstrapper', 'cyan');
    log('   /skills/automation/code-reviewer', 'cyan');
    log('   /skills/automation/qa-auditor', 'cyan');
    log('   + 5 more automation skills...', 'cyan');
  }

  if (geminiSkillsInstalled) {
    log('\n Gemini CLI Skills (slash commands with colon separator):', 'blue');
    log('   /skills:automation:flutter-bootstrapper', 'cyan');
    log('   /skills:automation:code-reviewer', 'cyan');
    log('   /skills:automation:qa-auditor', 'cyan');
    log('   + 5 more automation skills...', 'cyan');
  }

  log('\nOr use the unified CLI:', 'blue');
  log('  prprompts create               - Create PRD', 'cyan');
  log('  prprompts generate             - Generate all 32 files', 'cyan');
  log('  prprompts doctor               - Check installation', 'cyan');

  log('\nQuick Start:', 'blue');
  log('  1. cd your-flutter-project', 'cyan');
  log('  2. prprompts create', 'cyan');
  log('  3. prprompts generate', 'cyan');
  log('  4. Start coding!', 'cyan');

  log('\nDocumentation:', 'blue');
  log('  https://github.com/Kandil7/prprompts-flutter-generator\n', 'cyan');
}

// Run installation
try {
  main();
} catch (error) {
  log('\n❌ Installation failed:', 'red');
  log(error.message, 'red');
  log('\nPlease report this issue:', 'yellow');
  log('  https://github.com/Kandil7/prprompts-flutter-generator/issues\n', 'cyan');
  process.exit(1);
}
