#!/usr/bin/env node

/**
 * Gemini CLI - Flutter App Localization
 * One-command localization setup for Flutter apps with ar-en support
 */

const LocalizeCommand = require('../lib/localization/cli/LocalizeCommand');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('languages', {
        alias: 'l',
        describe: 'Comma-separated language codes (e.g., ar,en,fr)',
        type: 'string',
        default: 'en,ar'
    })
    .option('ai', {
        describe: 'AI provider for translation (gemini|claude|qwen|none)',
        type: 'string',
        default: 'none',
        choices: ['gemini', 'claude', 'qwen', 'none']
    })
    .option('dry-run', {
        describe: 'Preview changes without writing files',
        type: 'boolean',
        default: false
    })
    .option('validate', {
        describe: 'Run validation after generation',
        type: 'boolean',
        default: true
    })
    .option('verbose', {
        alias: 'v',
        describe: 'Verbose logging',
        type: 'boolean',
        default: false
    })
    .option('output-dir', {
        alias: 'o',
        describe: 'ARB files output directory',
        type: 'string',
        default: 'lib/l10n'
    })
    .example('$0', 'Localize app with en-ar (English-Arabic)')
    .example('$0 --languages en,ar,fr', 'Add French translation')
    .example('$0 --ai gemini', 'Use Gemini AI for Arabic translation')
    .example('$0 --dry-run', 'Preview changes without writing files')
    .help('h')
    .alias('h', 'help')
    .version()
    .argv;

// Parse languages
const languages = argv.languages.split(',').map(lang => lang.trim());

// Create and execute command
const command = new LocalizeCommand({
    projectPath: process.cwd(),
    languages,
    ai: argv.ai,
    dryRun: argv.dryRun,
    validate: argv.validate,
    verbose: argv.verbose,
    outputDir: argv.outputDir
});

command.execute()
    .then(result => {
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error.message);
        if (argv.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    });
