#!/usr/bin/env node

/**
 * Interactive Mode for PRPROMPTS Flutter Generator
 * Provides a menu-driven interface for easier command selection
 * @version 4.1.0
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class InteractiveMode {
  constructor() {
    this.rl = null;
    this.currentMenu = 'main';
    this.history = [];
    this.config = this.loadConfig();

    // Menu structure
    this.menus = {
      main: {
        title: '🚀 PRPROMPTS Flutter Generator - Interactive Mode',
        options: [
          { key: '1', label: 'Create PRD (Product Requirements)', action: 'create_prd' },
          { key: '2', label: 'Generate PRPROMPTS', action: 'generate_prprompts' },
          { key: '3', label: 'Automation Pipeline', action: 'menu:automation' },
          { key: '4', label: 'AI Configuration', action: 'menu:ai_config' },
          { key: '5', label: 'Project Tools', action: 'menu:tools' },
          { key: '6', label: 'Settings', action: 'menu:settings' },
          { key: '7', label: 'Help & Documentation', action: 'menu:help' },
          { key: 'q', label: 'Exit', action: 'exit' }
        ]
      },
      automation: {
        title: '🤖 Automation Pipeline',
        options: [
          { key: '1', label: 'Bootstrap Project', action: 'auto_bootstrap' },
          { key: '2', label: 'Implement Features', action: 'auto_implement' },
          { key: '3', label: 'Run Full Cycle', action: 'auto_full_cycle' },
          { key: '4', label: 'Run Tests', action: 'auto_test' },
          { key: '5', label: 'Validate Code', action: 'auto_validate' },
          { key: '6', label: 'Check Status', action: 'auto_status' },
          { key: '7', label: 'Reset State', action: 'auto_reset' },
          { key: 'b', label: 'Back', action: 'menu:main' }
        ]
      },
      ai_config: {
        title: '🔧 AI Configuration',
        options: [
          { key: '1', label: 'Setup API Keys', action: 'setup_api_keys' },
          { key: '2', label: 'Validate API Keys', action: 'validate_api_keys' },
          { key: '3', label: 'Check Rate Limits', action: 'check_rate_limits' },
          { key: '4', label: 'Set AI Tier', action: 'set_ai_tier' },
          { key: '5', label: 'Select Default AI', action: 'select_default_ai' },
          { key: '6', label: 'Test AI Connection', action: 'test_ai_connection' },
          { key: 'b', label: 'Back', action: 'menu:main' }
        ]
      },
      tools: {
        title: '🛠️ Project Tools',
        options: [
          { key: '1', label: 'Analyze PRD', action: 'analyze_prd' },
          { key: '2', label: 'From Files (Convert existing docs)', action: 'from_files' },
          { key: '3', label: 'Update PRPROMPTS', action: 'update_prprompts' },
          { key: '4', label: 'Review Implementation', action: 'review_implementation' },
          { key: '5', label: 'QA Check', action: 'qa_check' },
          { key: '6', label: 'Export Project', action: 'export_project' },
          { key: 'b', label: 'Back', action: 'menu:main' }
        ]
      },
      settings: {
        title: '⚙️ Settings',
        options: [
          { key: '1', label: 'Configure Environment Variables', action: 'config_env' },
          { key: '2', label: 'Update Package', action: 'update_package' },
          { key: '3', label: 'View Configuration', action: 'view_config' },
          { key: '4', label: 'Clear Cache', action: 'clear_cache' },
          { key: '5', label: 'Run Diagnostics', action: 'run_diagnostics' },
          { key: 'b', label: 'Back', action: 'menu:main' }
        ]
      },
      help: {
        title: '❓ Help & Documentation',
        options: [
          { key: '1', label: 'Quick Start Guide', action: 'show_quickstart' },
          { key: '2', label: 'View README', action: 'show_readme' },
          { key: '3', label: 'Architecture Guide', action: 'show_architecture' },
          { key: '4', label: 'Troubleshooting', action: 'show_troubleshooting' },
          { key: '5', label: 'Command Reference', action: 'show_commands' },
          { key: '6', label: 'Examples', action: 'show_examples' },
          { key: 'b', label: 'Back', action: 'menu:main' }
        ]
      }
    };

    // Command mapping
    this.commands = {
      create_prd: 'prprompts create',
      generate_prprompts: 'prprompts generate',
      auto_bootstrap: 'prprompts auto-bootstrap',
      auto_implement: 'prprompts auto-implement',
      auto_full_cycle: this.getAICommand('full-cycle'),
      auto_test: 'prprompts auto-test',
      auto_validate: 'prprompts auto-validate',
      auto_status: 'prprompts auto-status',
      auto_reset: 'prprompts auto-reset',
      analyze_prd: 'prprompts analyze',
      from_files: 'prprompts from-files',
      update_prprompts: 'prprompts update',
      review_implementation: this.getAICommand('review-and-commit'),
      qa_check: this.getAICommand('qa-check'),
      run_diagnostics: 'prprompts doctor'
    };
  }

  /**
   * Load configuration
   */
  loadConfig() {
    const configPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.prprompts',
      'config.json'
    );

    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      // Use defaults
    }

    return {
      defaultAI: 'claude',
      verbose: false
    };
  }

  /**
   * Get AI-specific command
   */
  getAICommand(command) {
    const ai = this.config.defaultAI || 'claude';
    return `${ai} ${command}`;
  }

  /**
   * Start interactive mode
   */
  async start() {
    console.clear();
    this.displayWelcome();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await this.displayMenu();
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     PRPROMPTS Flutter Generator - Interactive Mode        ║
║                     Version 4.1.0                          ║
║                                                            ║
║  Generate production-ready Flutter apps 40-60x faster     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
  }

  /**
   * Display current menu
   */
  async displayMenu() {
    const menu = this.menus[this.currentMenu];

    if (!menu) {
      console.error('Invalid menu');
      this.currentMenu = 'main';
      return this.displayMenu();
    }

    console.log(`\n${menu.title}`);
    console.log('─'.repeat(60));

    for (const option of menu.options) {
      const label = option.key.length === 1
        ? `  ${option.key}.`
        : `${option.key}.`;
      console.log(`${label} ${option.label}`);
    }

    console.log('─'.repeat(60));
    this.prompt();
  }

  /**
   * Show prompt and handle input
   */
  prompt() {
    this.rl.question('\n> Select an option: ', async (input) => {
      await this.handleInput(input.trim().toLowerCase());
    });
  }

  /**
   * Handle user input
   */
  async handleInput(input) {
    const menu = this.menus[this.currentMenu];
    const option = menu.options.find(o => o.key === input);

    if (!option) {
      console.log('\n❌ Invalid option. Please try again.');
      await this.displayMenu();
      return;
    }

    this.history.push({ menu: this.currentMenu, option: option.label });

    // Handle action
    if (option.action === 'exit') {
      await this.exit();
    } else if (option.action.startsWith('menu:')) {
      this.currentMenu = option.action.replace('menu:', '');
      console.clear();
      await this.displayMenu();
    } else {
      await this.executeAction(option.action);
    }
  }

  /**
   * Execute an action
   */
  async executeAction(action) {
    console.log('');

    switch (action) {
      case 'setup_api_keys':
        await this.setupAPIKeys();
        break;

      case 'validate_api_keys':
        await this.validateAPIKeys();
        break;

      case 'check_rate_limits':
        await this.checkRateLimits();
        break;

      case 'set_ai_tier':
        await this.setAITier();
        break;

      case 'select_default_ai':
        await this.selectDefaultAI();
        break;

      case 'test_ai_connection':
        await this.testAIConnection();
        break;

      case 'config_env':
        await this.configureEnvironment();
        break;

      case 'update_package':
        await this.updatePackage();
        break;

      case 'view_config':
        await this.viewConfiguration();
        break;

      case 'clear_cache':
        await this.clearCache();
        break;

      case 'export_project':
        await this.exportProject();
        break;

      case 'show_quickstart':
        await this.showDocumentation('WINDOWS-QUICKSTART.md');
        break;

      case 'show_readme':
        await this.showDocumentation('README.md');
        break;

      case 'show_architecture':
        await this.showDocumentation('ARCHITECTURE.md');
        break;

      case 'show_troubleshooting':
        await this.showDocumentation('docs/TROUBLESHOOTING.md');
        break;

      case 'show_commands':
        await this.showCommands();
        break;

      case 'show_examples':
        await this.showExamples();
        break;

      case 'auto_implement':
        await this.autoImplementWithPrompt();
        break;

      default:
        // Execute command
        const command = this.commands[action];
        if (command) {
          await this.executeCommand(command);
        } else {
          console.log(`❌ Action '${action}' not implemented`);
        }
    }

    // Return to menu
    if (this.rl) {
      console.log('\nPress Enter to continue...');
      await new Promise(resolve => {
        this.rl.once('line', resolve);
      });
      console.clear();
      await this.displayMenu();
    }
  }

  /**
   * Execute a shell command
   */
  async executeCommand(command) {
    console.log(`\n🚀 Executing: ${command}\n`);

    try {
      execSync(command, { stdio: 'inherit' });
      console.log('\n✅ Command completed successfully');
    } catch (error) {
      console.error(`\n❌ Command failed: ${error.message}`);
    }
  }

  /**
   * Setup API keys interactively
   */
  async setupAPIKeys() {
    const APIKeyValidator = require('./api-key-validator');
    const validator = new APIKeyValidator();

    console.log('\n🔑 API Key Setup\n');

    const ais = ['claude', 'qwen', 'gemini'];
    for (const ai of ais) {
      const existing = validator.findAPIKey(ai);
      if (existing) {
        console.log(`✓ ${ai}: Already configured`);
      } else {
        const answer = await this.askQuestion(`Setup ${ai} API key? (y/n): `);
        if (answer.toLowerCase() === 'y') {
          await validator.setupAPIKey(ai);
        }
      }
    }
  }

  /**
   * Validate API keys
   */
  async validateAPIKeys() {
    console.log('\n🔍 Validating API Keys...\n');

    try {
      execSync('node lib/api-key-validator.js validate', { stdio: 'inherit' });
    } catch (error) {
      console.error('Validation failed:', error.message);
    }
  }

  /**
   * Check rate limits
   */
  async checkRateLimits() {
    console.log('\n📊 Rate Limit Status\n');

    try {
      execSync('node lib/rate-limiter.js status', { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to check rate limits:', error.message);
    }
  }

  /**
   * Set AI tier
   */
  async setAITier() {
    const ai = await this.askQuestion('AI (claude/qwen/gemini): ');
    const tier = await this.askQuestion('Tier (free/pro/starter): ');

    try {
      execSync(`node lib/rate-limiter.js tier ${ai} ${tier}`, { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to set tier:', error.message);
    }
  }

  /**
   * Select default AI
   */
  async selectDefaultAI() {
    console.log('\n🤖 Select Default AI\n');
    console.log('1. Claude');
    console.log('2. Qwen');
    console.log('3. Gemini');

    const choice = await this.askQuestion('\nSelect (1-3): ');
    const ais = ['claude', 'qwen', 'gemini'];
    const selected = ais[parseInt(choice) - 1];

    if (selected) {
      this.config.defaultAI = selected;
      this.saveConfig();
      console.log(`\n✅ Default AI set to ${selected}`);
    } else {
      console.log('\n❌ Invalid selection');
    }
  }

  /**
   * Test AI connection
   */
  async testAIConnection() {
    const ai = this.config.defaultAI || 'claude';
    console.log(`\n🔌 Testing ${ai} connection...\n`);

    try {
      execSync(`${ai} --version`, { stdio: 'inherit' });
      console.log(`\n✅ ${ai} is working correctly`);
    } catch (error) {
      console.error(`\n❌ ${ai} connection failed`);
    }
  }

  /**
   * Configure environment variables
   */
  async configureEnvironment() {
    console.log('\n⚙️ Environment Variables\n');

    const vars = [
      { name: 'PRPROMPTS_DEFAULT_AI', desc: 'Default AI', current: process.env.PRPROMPTS_DEFAULT_AI },
      { name: 'PRPROMPTS_VERBOSE', desc: 'Verbose output', current: process.env.PRPROMPTS_VERBOSE },
      { name: 'PRPROMPTS_TIMEOUT', desc: 'Command timeout', current: process.env.PRPROMPTS_TIMEOUT },
      { name: 'PRPROMPTS_RETRY_COUNT', desc: 'Retry count', current: process.env.PRPROMPTS_RETRY_COUNT }
    ];

    for (const v of vars) {
      console.log(`${v.name}:`);
      console.log(`  Description: ${v.desc}`);
      console.log(`  Current: ${v.current || '(not set)'}`);
      console.log('');
    }

    console.log('To set variables, use:');
    console.log('  Windows: set VARIABLE_NAME=value');
    console.log('  Linux/Mac: export VARIABLE_NAME=value');
  }

  /**
   * Update package
   */
  async updatePackage() {
    console.log('\n📦 Checking for updates...\n');

    try {
      execSync('npm update -g prprompts-flutter-generator', { stdio: 'inherit' });
    } catch (error) {
      console.error('Update failed:', error.message);
    }
  }

  /**
   * View configuration
   */
  async viewConfiguration() {
    console.log('\n📋 Current Configuration\n');
    console.log(JSON.stringify(this.config, null, 2));
  }

  /**
   * Clear cache
   */
  async clearCache() {
    const cacheDir = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.prprompts',
      'cache'
    );

    try {
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true });
        console.log('✅ Cache cleared');
      } else {
        console.log('No cache to clear');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error.message);
    }
  }

  /**
   * Export project
   */
  async exportProject() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFile = `prprompts-export-${timestamp}.tar.gz`;

    console.log(`\n📦 Exporting project to ${exportFile}...\n`);

    try {
      execSync(`tar -czf ${exportFile} docs/ PRPROMPTS/ .prprompts/`, { stdio: 'inherit' });
      console.log(`\n✅ Project exported to ${exportFile}`);
    } catch (error) {
      console.error('Export failed:', error.message);
    }
  }

  /**
   * Show documentation
   */
  async showDocumentation(file) {
    const docPath = path.join(__dirname, '..', file);

    try {
      const content = fs.readFileSync(docPath, 'utf8');
      const lines = content.split('\n').slice(0, 50);
      console.log(lines.join('\n'));
      console.log('\n... (truncated, view full file for complete documentation)');
    } catch (error) {
      console.error(`Failed to read ${file}:`, error.message);
    }
  }

  /**
   * Show commands
   */
  async showCommands() {
    console.log('\n📜 Command Reference\n');

    const commands = [
      ['prprompts create', 'Create a PRD interactively'],
      ['prprompts generate', 'Generate PRPROMPTS files'],
      ['prprompts auto-bootstrap', 'Bootstrap project structure'],
      ['prprompts auto-implement N', 'Implement N features'],
      ['prprompts auto-test', 'Run tests with coverage'],
      ['prprompts auto-validate', 'Validate code quality'],
      ['prprompts auto-status', 'Show automation progress'],
      ['prprompts doctor', 'Run diagnostics']
    ];

    for (const [cmd, desc] of commands) {
      console.log(`  ${cmd.padEnd(30)} ${desc}`);
    }
  }

  /**
   * Show examples
   */
  async showExamples() {
    console.log('\n📚 Examples\n');

    const examples = [
      'Healthcare App',
      'E-commerce Platform',
      'Fintech Solution',
      'Social Media App',
      'Educational Platform'
    ];

    console.log('Available example projects:\n');
    for (const example of examples) {
      console.log(`  • ${example}`);
    }

    console.log('\nView examples in: examples/ directory');
  }

  /**
   * Auto implement with prompt for number
   */
  async autoImplementWithPrompt() {
    const num = await this.askQuestion('Number of features to implement (1-10): ');
    const n = parseInt(num);

    if (n >= 1 && n <= 10) {
      await this.executeCommand(`prprompts auto-implement ${n}`);
    } else {
      console.log('❌ Please enter a number between 1 and 10');
    }
  }

  /**
   * Ask a question
   */
  async askQuestion(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }

  /**
   * Save configuration
   */
  saveConfig() {
    const configPath = path.join(
      process.env.HOME || process.env.USERPROFILE,
      '.prprompts',
      'config.json'
    );

    try {
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error.message);
    }
  }

  /**
   * Exit interactive mode
   */
  async exit() {
    console.log('\n👋 Thank you for using PRPROMPTS!\n');

    if (this.history.length > 0) {
      console.log('Session Summary:');
      this.history.slice(-5).forEach(h => {
        console.log(`  • ${h.option}`);
      });
    }

    this.rl.close();
    process.exit(0);
  }
}

// CLI Interface
if (require.main === module) {
  const interactive = new InteractiveMode();
  interactive.start().catch(console.error);
}

module.exports = InteractiveMode;