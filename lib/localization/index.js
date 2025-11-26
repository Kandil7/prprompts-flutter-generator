/**
 * Localization Module - Main Exports
 * Complete Flutter app localization system with ar-en support
 */

// CLI
const LocalizeCommand = require('./cli/LocalizeCommand');

// Extractors
const { StringExtractor, StringOccurrence } = require('./extractors/StringExtractor');

// Generators
const { ARBGenerator } = require('./generators/ARBGenerator');
const { L10nConfigGenerator } = require('./generators/L10nConfigGenerator');

// Validators
const { LocalizationValidator } = require('./validators/LocalizationValidator');

module.exports = {
    // CLI
    LocalizeCommand,

    // Extractors
    StringExtractor,
    StringOccurrence,

    // Generators
    ARBGenerator,
    L10nConfigGenerator,

    // Validators
    LocalizationValidator
};
