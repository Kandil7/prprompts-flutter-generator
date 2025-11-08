/**
 * ConfigCommand - Manage refactoring configuration
 *
 * Features:
 * - Interactive configuration editor
 * - Get/Set individual settings
 * - Configuration validation
 * - Multiple configuration profiles
 * - Import/Export configurations
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const os = require('os');

class ConfigCommand {
  constructor(config = {}) {
    this.config = {
      configPath: config.configPath || path.join(os.homedir(), '.prprompts/config.json'),
      verbose: config.verbose || false,
    };

    this.defaultConfig = {
      stateManagement: 'bloc',
      uiFidelity: 'high',
      concurrency: 4,
      features: [],
      allowLLM: false,
      llmProvider: 'claude',
      optimizeImages: true,
      generateMultipleResolutions: true,
      mode: 'safe',
      backup: true,
      validate: true,
      gitIntegration: true,
      formatCode: true,
      assetFolder: 'assets',
      mapping: {
        customMappings: {},
        overrides: {},
      },
      architecture: {
        cleanArchitecture: true,
        featureFirst: true,
        separateDataLayer: true,
      },
      output: {
        preserveStructure: false,
        flattenComponents: false,
        groupByFeature: true,
      },
      advanced: {
        inferTypes: true,
        optimizeImports: true,
        extractWidgets: false,
        addMissingImports: true,
      },
    };

    this.currentConfig = null;
  }

  /**
   * Execute config command
   * @param {string} action - Action (get, set, list, edit, reset)
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   * @returns {Promise<Object>} Command result
   */
  async execute(action = 'list', key = null, value = null) {
    try {
      // Load current configuration
      await this.loadConfig();

      switch (action) {
        case 'get':
          return await this.getConfig(key);

        case 'set':
          return await this.setConfig(key, value);

        case 'list':
          return await this.listConfig();

        case 'edit':
          return await this.editConfig();

        case 'reset':
          return await this.resetConfig();

        case 'export':
          return await this.exportConfig(key); // key is the export path

        case 'import':
          return await this.importConfig(key); // key is the import path

        case 'validate':
          return await this.validateConfig();

        case 'profiles':
          return await this.manageProfiles();

        default:
          console.log(chalk.yellow(`Unknown action: ${action}`));
          this.showHelp();
          return { status: 'error', message: 'Unknown action' };
      }

    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Load configuration from file
   */
  async loadConfig() {
    if (await fs.pathExists(this.config.configPath)) {
      this.currentConfig = await fs.readJson(this.config.configPath);
    } else {
      this.currentConfig = { ...this.defaultConfig };
      await this.saveConfig();
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig() {
    await fs.ensureDir(path.dirname(this.config.configPath));
    await fs.writeJson(this.config.configPath, this.currentConfig, { spaces: 2 });

    if (this.config.verbose) {
      console.log(chalk.gray(`Configuration saved to ${this.config.configPath}`));
    }
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key
   */
  async getConfig(key) {
    if (!key) {
      console.log(chalk.yellow('No key specified'));
      return { status: 'error', message: 'Key required' };
    }

    const value = this.getNestedValue(this.currentConfig, key);

    if (value === undefined) {
      console.log(chalk.yellow(`Configuration key "${key}" not found`));
      return { status: 'not_found' };
    }

    console.log(chalk.cyan(`${key}:`), JSON.stringify(value, null, 2));

    return {
      status: 'success',
      key,
      value,
    };
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   */
  async setConfig(key, value) {
    if (!key) {
      console.log(chalk.yellow('No key specified'));
      return { status: 'error', message: 'Key required' };
    }

    if (value === undefined) {
      console.log(chalk.yellow('No value specified'));
      return { status: 'error', message: 'Value required' };
    }

    // Parse value
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // Keep as string if not valid JSON
    }

    // Set value
    this.setNestedValue(this.currentConfig, key, parsedValue);

    // Validate
    const validation = this.validateSingleKey(key, parsedValue);
    if (!validation.valid) {
      console.log(chalk.red(`Invalid value: ${validation.error}`));
      return { status: 'invalid', error: validation.error };
    }

    // Save
    await this.saveConfig();

    console.log(chalk.green(`✓ Set ${key} = ${JSON.stringify(parsedValue)}`));

    return {
      status: 'success',
      key,
      value: parsedValue,
    };
  }

  /**
   * List all configuration
   */
  async listConfig() {
    console.log(chalk.bold.blue('\n📋 Current Configuration\n'));
    console.log(chalk.gray(`Path: ${this.config.configPath}\n`));

    this.printConfig(this.currentConfig);

    return {
      status: 'success',
      config: this.currentConfig,
    };
  }

  /**
   * Print configuration recursively
   * @param {Object} obj - Configuration object
   * @param {number} indent - Indentation level
   */
  printConfig(obj, indent = 0) {
    const prefix = '  '.repeat(indent);

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        console.log(chalk.cyan(`${prefix}${key}:`));
        this.printConfig(value, indent + 1);
      } else {
        const displayValue = Array.isArray(value)
          ? `[${value.join(', ')}]`
          : JSON.stringify(value);

        console.log(`${prefix}${chalk.yellow(key)}: ${chalk.white(displayValue)}`);
      }
    }
  }

  /**
   * Edit configuration interactively
   */
  async editConfig() {
    console.log(chalk.bold.blue('\n⚙️  Interactive Configuration Editor\n'));

    const sections = [
      { name: 'State Management', value: 'state' },
      { name: 'UI & Assets', value: 'ui' },
      { name: 'Architecture', value: 'architecture' },
      { name: 'Code Generation', value: 'code' },
      { name: 'AI/LLM Settings', value: 'llm' },
      { name: 'Advanced', value: 'advanced' },
      { name: 'Save & Exit', value: 'save' },
      { name: 'Cancel', value: 'cancel' },
    ];

    let editing = true;

    while (editing) {
      const { section } = await inquirer.prompt([
        {
          type: 'list',
          name: 'section',
          message: 'Select section to edit:',
          choices: sections,
        },
      ]);

      switch (section) {
        case 'state':
          await this.editStateManagement();
          break;

        case 'ui':
          await this.editUISettings();
          break;

        case 'architecture':
          await this.editArchitecture();
          break;

        case 'code':
          await this.editCodeGeneration();
          break;

        case 'llm':
          await this.editLLMSettings();
          break;

        case 'advanced':
          await this.editAdvancedSettings();
          break;

        case 'save':
          await this.saveConfig();
          console.log(chalk.green('\n✓ Configuration saved'));
          editing = false;
          break;

        case 'cancel':
          console.log(chalk.yellow('\nConfiguration not saved'));
          editing = false;
          break;
      }
    }

    return { status: 'success' };
  }

  /**
   * Edit state management settings
   */
  async editStateManagement() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'stateManagement',
        message: 'Default state management solution:',
        choices: ['bloc', 'cubit', 'provider', 'riverpod', 'getx'],
        default: this.currentConfig.stateManagement,
      },
    ]);

    this.currentConfig.stateManagement = answers.stateManagement;
  }

  /**
   * Edit UI settings
   */
  async editUISettings() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'uiFidelity',
        message: 'UI conversion fidelity:',
        choices: [
          { name: 'Low (basic widgets only)', value: 'low' },
          { name: 'Medium (preserve layout)', value: 'medium' },
          { name: 'High (preserve styling)', value: 'high' },
        ],
        default: this.currentConfig.uiFidelity,
      },
      {
        type: 'confirm',
        name: 'optimizeImages',
        message: 'Optimize images during conversion?',
        default: this.currentConfig.optimizeImages,
      },
      {
        type: 'confirm',
        name: 'generateMultipleResolutions',
        message: 'Generate multiple image resolutions (1x, 2x, 3x)?',
        default: this.currentConfig.generateMultipleResolutions,
      },
      {
        type: 'input',
        name: 'assetFolder',
        message: 'Asset folder name:',
        default: this.currentConfig.assetFolder,
      },
    ]);

    Object.assign(this.currentConfig, answers);
  }

  /**
   * Edit architecture settings
   */
  async editArchitecture() {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'cleanArchitecture',
        message: 'Use Clean Architecture pattern?',
        default: this.currentConfig.architecture.cleanArchitecture,
      },
      {
        type: 'confirm',
        name: 'featureFirst',
        message: 'Organize by feature (feature-first)?',
        default: this.currentConfig.architecture.featureFirst,
      },
      {
        type: 'confirm',
        name: 'separateDataLayer',
        message: 'Separate data layer (repositories, data sources)?',
        default: this.currentConfig.architecture.separateDataLayer,
      },
    ]);

    this.currentConfig.architecture = answers;
  }

  /**
   * Edit code generation settings
   */
  async editCodeGeneration() {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Default conversion mode:',
        choices: [
          { name: 'Safe (preview only)', value: 'safe' },
          { name: 'Apply (direct application)', value: 'apply' },
          { name: 'Merge (3-way merge)', value: 'merge' },
          { name: 'Dry run (test only)', value: 'dry' },
        ],
        default: this.currentConfig.mode,
      },
      {
        type: 'confirm',
        name: 'formatCode',
        message: 'Format generated Dart code?',
        default: this.currentConfig.formatCode,
      },
      {
        type: 'confirm',
        name: 'validate',
        message: 'Validate generated code before applying?',
        default: this.currentConfig.validate,
      },
      {
        type: 'confirm',
        name: 'backup',
        message: 'Create backup before applying changes?',
        default: this.currentConfig.backup,
      },
      {
        type: 'number',
        name: 'concurrency',
        message: 'Concurrent conversion tasks:',
        default: this.currentConfig.concurrency,
        validate: (input) => input > 0 && input <= 16 || 'Must be between 1 and 16',
      },
    ]);

    Object.assign(this.currentConfig, answers);
  }

  /**
   * Edit LLM settings
   */
  async editLLMSettings() {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'allowLLM',
        message: 'Enable AI/LLM assistance?',
        default: this.currentConfig.allowLLM,
      },
      {
        type: 'list',
        name: 'llmProvider',
        message: 'LLM provider:',
        choices: ['claude', 'gemini', 'qwen', 'mock'],
        default: this.currentConfig.llmProvider,
        when: (answers) => answers.allowLLM,
      },
    ]);

    Object.assign(this.currentConfig, answers);
  }

  /**
   * Edit advanced settings
   */
  async editAdvancedSettings() {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'inferTypes',
        message: 'Infer missing types in Dart?',
        default: this.currentConfig.advanced.inferTypes,
      },
      {
        type: 'confirm',
        name: 'optimizeImports',
        message: 'Optimize and sort imports?',
        default: this.currentConfig.advanced.optimizeImports,
      },
      {
        type: 'confirm',
        name: 'extractWidgets',
        message: 'Extract repeated widgets?',
        default: this.currentConfig.advanced.extractWidgets,
      },
      {
        type: 'confirm',
        name: 'addMissingImports',
        message: 'Add missing imports automatically?',
        default: this.currentConfig.advanced.addMissingImports,
      },
      {
        type: 'confirm',
        name: 'gitIntegration',
        message: 'Enable Git integration?',
        default: this.currentConfig.gitIntegration,
      },
    ]);

    this.currentConfig.advanced = {
      ...this.currentConfig.advanced,
      ...answers,
    };

    if (answers.gitIntegration !== undefined) {
      this.currentConfig.gitIntegration = answers.gitIntegration;
    }
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfig() {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Reset all configuration to defaults?',
        default: false,
      },
    ]);

    if (!answer.confirm) {
      console.log(chalk.yellow('Reset cancelled'));
      return { status: 'cancelled' };
    }

    this.currentConfig = { ...this.defaultConfig };
    await this.saveConfig();

    console.log(chalk.green('✓ Configuration reset to defaults'));

    return { status: 'success' };
  }

  /**
   * Export configuration
   * @param {string} exportPath - Export file path
   */
  async exportConfig(exportPath) {
    if (!exportPath) {
      exportPath = `prprompts-config-${Date.now()}.json`;
    }

    await fs.writeJson(exportPath, this.currentConfig, { spaces: 2 });

    console.log(chalk.green(`✓ Configuration exported to ${exportPath}`));

    return {
      status: 'success',
      path: exportPath,
    };
  }

  /**
   * Import configuration
   * @param {string} importPath - Import file path
   */
  async importConfig(importPath) {
    if (!importPath) {
      console.log(chalk.yellow('No import path specified'));
      return { status: 'error', message: 'Import path required' };
    }

    if (!await fs.pathExists(importPath)) {
      console.log(chalk.red(`File not found: ${importPath}`));
      return { status: 'error', message: 'File not found' };
    }

    const imported = await fs.readJson(importPath);

    // Validate imported configuration
    const validation = this.validateConfiguration(imported);
    if (!validation.valid) {
      console.log(chalk.red('Invalid configuration file'));
      console.log(chalk.gray(validation.errors.join('\n')));
      return { status: 'invalid', errors: validation.errors };
    }

    // Merge with defaults to ensure all keys exist
    this.currentConfig = {
      ...this.defaultConfig,
      ...imported,
    };

    await this.saveConfig();

    console.log(chalk.green(`✓ Configuration imported from ${importPath}`));

    return { status: 'success' };
  }

  /**
   * Validate current configuration
   */
  async validateConfig() {
    const validation = this.validateConfiguration(this.currentConfig);

    if (validation.valid) {
      console.log(chalk.green('✓ Configuration is valid'));
    } else {
      console.log(chalk.red('✗ Configuration has errors:'));
      for (const error of validation.errors) {
        console.log(chalk.red(`  • ${error}`));
      }
    }

    return validation;
  }

  /**
   * Validate configuration object
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfiguration(config) {
    const errors = [];

    // Validate state management
    const validStateMgmt = ['bloc', 'cubit', 'provider', 'riverpod', 'getx'];
    if (config.stateManagement && !validStateMgmt.includes(config.stateManagement)) {
      errors.push(`Invalid stateManagement: ${config.stateManagement}`);
    }

    // Validate UI fidelity
    const validFidelity = ['low', 'medium', 'high'];
    if (config.uiFidelity && !validFidelity.includes(config.uiFidelity)) {
      errors.push(`Invalid uiFidelity: ${config.uiFidelity}`);
    }

    // Validate concurrency
    if (config.concurrency && (config.concurrency < 1 || config.concurrency > 16)) {
      errors.push('concurrency must be between 1 and 16');
    }

    // Validate mode
    const validModes = ['safe', 'apply', 'merge', 'dry'];
    if (config.mode && !validModes.includes(config.mode)) {
      errors.push(`Invalid mode: ${config.mode}`);
    }

    // Validate LLM provider
    const validProviders = ['claude', 'gemini', 'qwen', 'mock'];
    if (config.llmProvider && !validProviders.includes(config.llmProvider)) {
      errors.push(`Invalid llmProvider: ${config.llmProvider}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate single configuration key
   * @param {string} key - Configuration key
   * @param {*} value - Value to validate
   * @returns {Object} Validation result
   */
  validateSingleKey(key, value) {
    const tempConfig = { ...this.defaultConfig };
    this.setNestedValue(tempConfig, key, value);

    return this.validateConfiguration(tempConfig);
  }

  /**
   * Manage configuration profiles
   */
  async manageProfiles() {
    const profilesPath = path.join(path.dirname(this.config.configPath), 'profiles');
    await fs.ensureDir(profilesPath);

    const profiles = await fs.readdir(profilesPath);

    const choices = [
      { name: '➕ Create new profile', value: 'create' },
      { name: '📋 Load profile', value: 'load' },
      { name: '💾 Save current as profile', value: 'save' },
      { name: '🗑️  Delete profile', value: 'delete' },
      { name: '⬅️  Back', value: 'back' },
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Profile management:',
        choices,
      },
    ]);

    switch (action) {
      case 'create':
        await this.createProfile(profilesPath);
        break;

      case 'load':
        await this.loadProfile(profilesPath, profiles);
        break;

      case 'save':
        await this.saveProfile(profilesPath);
        break;

      case 'delete':
        await this.deleteProfile(profilesPath, profiles);
        break;
    }

    return { status: 'success' };
  }

  /**
   * Create new profile
   * @param {string} profilesPath - Profiles directory path
   */
  async createProfile(profilesPath) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Profile name:',
        validate: (input) => input.trim().length > 0 || 'Name required',
      },
    ]);

    const profilePath = path.join(profilesPath, `${name}.json`);

    if (await fs.pathExists(profilePath)) {
      console.log(chalk.yellow('Profile already exists'));
      return;
    }

    await fs.writeJson(profilePath, { ...this.defaultConfig }, { spaces: 2 });
    console.log(chalk.green(`✓ Profile "${name}" created`));
  }

  /**
   * Load profile
   * @param {string} profilesPath - Profiles directory path
   * @param {Array} profiles - Available profiles
   */
  async loadProfile(profilesPath, profiles) {
    if (profiles.length === 0) {
      console.log(chalk.yellow('No profiles available'));
      return;
    }

    const { profile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'profile',
        message: 'Select profile to load:',
        choices: profiles.map(p => ({ name: p.replace('.json', ''), value: p })),
      },
    ]);

    const profilePath = path.join(profilesPath, profile);
    const profileConfig = await fs.readJson(profilePath);

    this.currentConfig = profileConfig;
    await this.saveConfig();

    console.log(chalk.green(`✓ Loaded profile "${profile.replace('.json', '')}"`));
  }

  /**
   * Save current configuration as profile
   * @param {string} profilesPath - Profiles directory path
   */
  async saveProfile(profilesPath) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Profile name:',
        validate: (input) => input.trim().length > 0 || 'Name required',
      },
    ]);

    const profilePath = path.join(profilesPath, `${name}.json`);
    await fs.writeJson(profilePath, this.currentConfig, { spaces: 2 });

    console.log(chalk.green(`✓ Saved as profile "${name}"`));
  }

  /**
   * Delete profile
   * @param {string} profilesPath - Profiles directory path
   * @param {Array} profiles - Available profiles
   */
  async deleteProfile(profilesPath, profiles) {
    if (profiles.length === 0) {
      console.log(chalk.yellow('No profiles available'));
      return;
    }

    const { profile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'profile',
        message: 'Select profile to delete:',
        choices: profiles.map(p => ({ name: p.replace('.json', ''), value: p })),
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Delete profile "${profile.replace('.json', '')}"?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Deletion cancelled'));
      return;
    }

    const profilePath = path.join(profilesPath, profile);
    await fs.remove(profilePath);

    console.log(chalk.green(`✓ Profile "${profile.replace('.json', '')}" deleted`));
  }

  /**
   * Get nested value from object
   * @param {Object} obj - Object to search
   * @param {string} key - Dot-separated key path
   * @returns {*} Value
   */
  getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => o?.[k], obj);
  }

  /**
   * Set nested value in object
   * @param {Object} obj - Object to modify
   * @param {string} key - Dot-separated key path
   * @param {*} value - Value to set
   */
  setNestedValue(obj, key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((o, k) => {
      if (!o[k]) o[k] = {};
      return o[k];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(chalk.bold.blue('\n📖 Config Command Help\n'));
    console.log('Usage:');
    console.log('  prprompts config <action> [key] [value]\n');
    console.log('Actions:');
    console.log('  list                  - List all configuration');
    console.log('  get <key>             - Get configuration value');
    console.log('  set <key> <value>     - Set configuration value');
    console.log('  edit                  - Interactive configuration editor');
    console.log('  reset                 - Reset to default configuration');
    console.log('  export [path]         - Export configuration to file');
    console.log('  import <path>         - Import configuration from file');
    console.log('  validate              - Validate current configuration');
    console.log('  profiles              - Manage configuration profiles');
    console.log('\nExamples:');
    console.log('  prprompts config list');
    console.log('  prprompts config get stateManagement');
    console.log('  prprompts config set stateManagement bloc');
    console.log('  prprompts config edit');
    console.log('  prprompts config export my-config.json');
  }
}

module.exports = ConfigCommand;