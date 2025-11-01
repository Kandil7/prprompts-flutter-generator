/**
 * InteractiveCommand - Guided React-to-Flutter conversion wizard
 * Provides user-friendly prompts for all conversion options
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const RefactorCommand = require('./RefactorCommand');
const logger = require('../utils/logger');

class InteractiveCommand {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.answers = {};
  }

  /**
   * Start interactive mode
   */
  async execute() {
    try {
      logger.info('\n🎨 Interactive React-to-Flutter Conversion Wizard\n');
      logger.info('Answer the following questions to configure your conversion:\n');

      // Step 1: Source directory
      await this.askSourceDirectory();

      // Step 2: Target directory
      await this.askTargetDirectory();

      // Step 3: State management
      await this.askStateManagement();

      // Step 4: Architecture
      await this.askArchitecture();

      // Step 5: AI provider
      await this.askAIProvider();

      // Step 6: Validation
      await this.askValidation();

      // Step 7: Show preview
      await this.showPreview();

      // Step 8: Confirm
      const confirmed = await this.confirm();

      if (!confirmed) {
        logger.warn('\n❌ Conversion cancelled');
        this.close();
        return { success: false, cancelled: true };
      }

      // Step 9: Execute conversion
      this.close();
      const result = await this.executeConversion();

      return result;

    } catch (error) {
      logger.error(`\n❌ Interactive mode failed: ${error.message}`);
      this.close();
      return { success: false, error: error.message };
    }
  }

  /**
   * Ask for React source directory
   */
  async askSourceDirectory() {
    const answer = await this.question(
      '📁 React source directory (default: ./src): '
    );

    this.answers.reactSource = answer.trim() || './src';

    // Validate directory exists
    try {
      const stats = await fs.stat(this.answers.reactSource);
      if (!stats.isDirectory()) {
        throw new Error('Not a directory');
      }
      logger.success(`  ✅ Found: ${this.answers.reactSource}\n`);
    } catch {
      logger.error(`  ❌ Directory not found: ${this.answers.reactSource}`);
      logger.warn('  Please ensure the path is correct and try again.\n');
      return await this.askSourceDirectory();
    }
  }

  /**
   * Ask for Flutter target directory
   */
  async askTargetDirectory() {
    const answer = await this.question(
      '📁 Flutter target directory (default: ./flutter-app): '
    );

    this.answers.flutterTarget = answer.trim() || './flutter-app';

    // Check if exists
    try {
      await fs.access(this.answers.flutterTarget);
      const overwrite = await this.question(
        `  ⚠️  Directory exists. Overwrite? (y/N): `
      );

      if (overwrite.toLowerCase() !== 'y') {
        logger.warn('\n  Please choose a different directory.\n');
        return await this.askTargetDirectory();
      }
    } catch {
      // Directory doesn't exist - that's fine
    }

    logger.success(`  ✅ Target: ${this.answers.flutterTarget}\n`);
  }

  /**
   * Ask for state management preference
   */
  async askStateManagement() {
    logger.info('🔄 State Management:');
    logger.info('  1) Auto-detect (recommended)');
    logger.info('  2) BLoC (complex state, events)');
    logger.info('  3) Cubit (simple state)');
    logger.info('  4) Provider (simple state, legacy)');

    const answer = await this.question('\n  Choose (1-4, default: 1): ');

    const choice = answer.trim() || '1';

    const stateManagementMap = {
      '1': 'auto',
      '2': 'bloc',
      '3': 'cubit',
      '4': 'provider'
    };

    this.answers.stateManagement = stateManagementMap[choice] || 'auto';

    logger.success(`  ✅ Using: ${this.answers.stateManagement}\n`);
  }

  /**
   * Ask for architecture preference
   */
  async askArchitecture() {
    logger.info('🏛️  Architecture Pattern:');
    logger.info('  1) Clean Architecture (recommended)');
    logger.info('  2) MVC (Model-View-Controller)');
    logger.info('  3) MVVM (Model-View-ViewModel)');

    const answer = await this.question('\n  Choose (1-3, default: 1): ');

    const choice = answer.trim() || '1';

    const architectureMap = {
      '1': 'clean',
      '2': 'mvc',
      '3': 'mvvm'
    };

    this.answers.architecture = architectureMap[choice] || 'clean';

    logger.success(`  ✅ Using: ${this.answers.architecture}\n`);
  }

  /**
   * Ask for AI provider
   */
  async askAIProvider() {
    logger.info('🤖 AI Enhancement (optional):');
    logger.info('  1) None (faster, basic conversion)');
    logger.info('  2) Claude (best quality, slower)');
    logger.info('  3) Qwen (balanced)');
    logger.info('  4) Gemini (fast, good quality)');

    const answer = await this.question('\n  Choose (1-4, default: 1): ');

    const choice = answer.trim() || '1';

    const aiMap = {
      '1': 'none',
      '2': 'claude',
      '3': 'qwen',
      '4': 'gemini'
    };

    this.answers.ai = aiMap[choice] || 'none';

    if (this.answers.ai !== 'none') {
      logger.success(`  ✅ AI enhancement enabled: ${this.answers.ai}`);
      logger.warn(`  ⏱️  Note: AI enhancement will significantly increase conversion time\n`);
    } else {
      logger.success(`  ✅ AI enhancement disabled (faster conversion)\n`);
    }
  }

  /**
   * Ask for validation preference
   */
  async askValidation() {
    const answer = await this.question(
      '🔍 Run validation after conversion? (Y/n): '
    );

    this.answers.validate = answer.toLowerCase() !== 'n';

    if (this.answers.validate) {
      logger.info('\n  Validation strictness:');
      logger.info('    1) Standard (recommended)');
      logger.info('    2) Strict (high standards)');
      logger.info('    3) Lenient (permissive)');

      const strictness = await this.question('  Choose (1-3, default: 1): ');
      const strictnessChoice = strictness.trim() || '1';

      const strictnessMap = {
        '1': 'standard',
        '2': 'strict',
        '3': 'lenient'
      };

      this.answers.validationConfig = strictnessMap[strictnessChoice] || 'standard';
      logger.success(`  ✅ Validation: ${this.answers.validationConfig}\n`);
    } else {
      logger.success('  ✅ Validation disabled\n');
    }
  }

  /**
   * Show configuration preview
   */
  async showPreview() {
    logger.info('─'.repeat(60));
    logger.info('📋 Configuration Preview:');
    logger.info('─'.repeat(60));

    logger.info(`  Source:          ${this.answers.reactSource}`);
    logger.info(`  Target:          ${this.answers.flutterTarget}`);
    logger.info(`  State Mgmt:      ${this.answers.stateManagement}`);
    logger.info(`  Architecture:    ${this.answers.architecture}`);
    logger.info(`  AI Enhancement:  ${this.answers.ai}`);
    logger.info(`  Validation:      ${this.answers.validate ? this.answers.validationConfig : 'disabled'}`);

    logger.info('─'.repeat(60));
    logger.info('');
  }

  /**
   * Ask for confirmation
   */
  async confirm() {
    const answer = await this.question('✅ Proceed with conversion? (Y/n): ');
    return answer.toLowerCase() !== 'n';
  }

  /**
   * Execute conversion with collected answers
   */
  async executeConversion() {
    logger.info('\n🚀 Starting conversion...\n');

    const refactorCommand = new RefactorCommand({
      reactSource: this.answers.reactSource,
      flutterTarget: this.answers.flutterTarget,
      stateManagement: this.answers.stateManagement,
      architecture: this.answers.architecture,
      ai: this.answers.ai,
      validate: this.answers.validate,
      validationConfig: this.answers.validationConfig,
      verbose: true
    });

    const result = await refactorCommand.execute();

    if (result.success) {
      logger.success('\n🎉 Conversion successful!');
      logger.info('\n📊 Summary:');
      logger.info(`  • Components converted: ${result.stats.components}`);
      logger.info(`  • Files generated: ${result.stats.filesGenerated}`);
      logger.info(`  • Duration: ${(result.duration / 1000).toFixed(1)}s`);

      if (result.validationResults) {
        logger.info(`  • Validation score: ${result.validationResults.summary.overallScore}/100`);
      }

      logger.info('\n💡 Next steps:');
      logger.info(`  1. cd ${this.answers.flutterTarget}`);
      logger.info('  2. flutter pub get');
      logger.info('  3. flutter analyze');
      logger.info('  4. flutter run');
    } else {
      logger.error('\n❌ Conversion failed');
      if (result.error) {
        logger.error(`  Error: ${result.error}`);
      }
    }

    return result;
  }

  /**
   * Ask a question and return the answer
   */
  question(query) {
    return new Promise(resolve => {
      this.rl.question(query, answer => {
        resolve(answer);
      });
    });
  }

  /**
   * Close readline interface
   */
  close() {
    this.rl.close();
  }
}

module.exports = InteractiveCommand;
