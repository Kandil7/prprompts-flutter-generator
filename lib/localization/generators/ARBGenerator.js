/**
 * ARBGenerator - Generates ARB (Application Resource Bundle) files
 * Creates master template and target language files with proper ICU MessageFormat
 */

const fs = require('fs').promises;
const path = require('path');
const { createModuleLogger } = require('../../utils/logger');
const logger = createModuleLogger('ARBGenerator');

class ARBGenerator {
    constructor(options = {}) {
        this.options = {
            includeMetadata: options.includeMetadata !== false,
            includeExamples: options.includeExamples !== false,
            rtlLanguages: options.rtlLanguages || ['ar', 'he', 'fa', 'ur'],
            ...options
        };
    }

    /**
     * Generate ARB file for a specific language
     */
    async generate(occurrences, language, options = {}) {
        const isMasterTemplate = options.isMasterTemplate || false;
        const translations = options.translations || {};

        const arb = {
            '@@locale': language
        };

        // Group occurrences by key
        const groupedByKey = new Map();
        for (const [key, occurrenceList] of occurrences.entries()) {
            groupedByKey.set(key, occurrenceList);
        }

        // Generate ARB entries
        for (const [key, occurrenceList] of groupedByKey.entries()) {
            const firstOccurrence = occurrenceList[0];
            const string = firstOccurrence.string;

            // Convert interpolation to ICU MessageFormat
            const convertedString = this.convertInterpolation(string);

            // Add the main entry
            if (isMasterTemplate) {
                arb[key] = convertedString;
            } else {
                // Use provided translation or placeholder
                arb[key] = translations[key] || convertedString;
            }

            // Add metadata (only in master template)
            if (isMasterTemplate && this.options.includeMetadata) {
                const metadata = this.generateMetadata(firstOccurrence, occurrenceList);
                arb[`@${key}`] = metadata;
            }
        }

        return arb;
    }

    /**
     * Generate metadata for ARB entry
     */
    generateMetadata(occurrence, allOccurrences) {
        const metadata = {
            description: this.generateDescription(occurrence, allOccurrences)
        };

        // Extract placeholders
        const placeholders = this.extractPlaceholders(occurrence.string);
        if (Object.keys(placeholders).length > 0) {
            metadata.placeholders = placeholders;
        }

        // Add context if multiple occurrences
        if (allOccurrences.length > 1) {
            metadata.context = `Used in ${allOccurrences.length} places`;
        }

        return metadata;
    }

    /**
     * Generate description for translators
     */
    generateDescription(occurrence, allOccurrences) {
        const { widgetType, context } = occurrence;
        const locations = allOccurrences.map(occ =>
            `${path.basename(occ.file)}:${occ.line}`
        ).slice(0, 3); // Limit to 3 locations

        let description = '';

        // Add widget type context
        switch (widgetType) {
            case 'Text':
                description = 'Text displayed';
                break;
            case 'AppBar':
                description = 'AppBar title';
                break;
            case 'TextField':
                description = context.includes('hint') ? 'TextField hint text' : 'TextField label';
                break;
            case 'Button':
                description = 'Button label';
                break;
            case 'Dialog':
                description = context.includes('title') ? 'Dialog title' : 'Dialog content';
                break;
            case 'SnackBar':
                description = 'SnackBar message';
                break;
            default:
                description = 'User-facing text';
        }

        // Add location
        if (locations.length === 1) {
            description += ` in ${locations[0]}`;
        } else if (locations.length > 1) {
            description += ` in ${locations.join(', ')}`;
        }

        return description;
    }

    /**
     * Convert string interpolation to ICU MessageFormat
     */
    convertInterpolation(string) {
        const interpolationPattern = /(\$\{[^}]+\}|\$\w+)/g;

        return string.replace(interpolationPattern, (match) => {
            let varName = match.replace(/[\${}]/g, '');

            if (varName.includes('.')) {
                varName = varName.split('.').pop();
            }

            return `{${varName}}`;
        });
    }

    /**
     * Extract placeholder information
     */
    extractPlaceholders(string) {
        const placeholders = {};
        const interpolationPattern = /(\$\{[^}]+\}|\$\w+)/g;
        const matches = string.match(interpolationPattern);

        if (!matches) return placeholders;

        for (const match of matches) {
            let varName = match.replace(/[\${}]/g, '');

            if (varName.includes('.')) {
                varName = varName.split('.').pop();
            }

            // Infer type from variable name
            let type = 'String';
            let example = 'Example';

            if (/count|num|quantity|total/i.test(varName)) {
                type = 'int';
                example = '5';
            } else if (/price|amount|cost/i.test(varName)) {
                type = 'double';
                example = '19.99';
            } else if (/date/i.test(varName)) {
                type = 'DateTime';
                example = '2024-01-01';
            } else if (/name|title|label/i.test(varName)) {
                type = 'String';
                example = varName === 'userName' ? 'Ahmed' : 'Example';
            }

            placeholders[varName] = {
                type,
                example
            };
        }

        return placeholders;
    }

    /**
     * Generate ICU plural format if applicable
     */
    generatePluralFormat(key, string) {
        // Detect if string needs plural format
        if (!/\{count\}|\{num\}|\$count|\$num/i.test(string)) {
            return null;
        }

        // Generate ICU plural format
        return {
            zero: `No ${this.getPluralNoun(string)}`,
            one: `One ${this.getPluralNoun(string)}`,
            other: `{count} ${this.getPluralNoun(string)}`
        };
    }

    /**
     * Extract noun from string for plural format
     */
    getPluralNoun(string) {
        // Simple extraction - can be enhanced
        const words = string.split(/\s+/);
        const lastWord = words[words.length - 1];
        return lastWord.toLowerCase();
    }

    /**
     * Save ARB file to disk
     */
    async save(arb, outputPath) {
        const jsonContent = JSON.stringify(arb, null, 2);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, jsonContent, 'utf8');
        logger.info(`Saved ARB file: ${outputPath}`);
    }

    /**
     * Generate RTL-specific entries for Arabic
     */
    generateRTLEntries() {
        return {
            textDirection: 'rtl',
            '@textDirection': {
                description: 'Text direction for this locale (ltr or rtl)'
            }
        };
    }

    /**
     * Validate ARB file structure
     */
    validateARB(arb) {
        const errors = [];

        // Check for @@locale
        if (!arb['@@locale']) {
            errors.push('Missing @@locale key');
        }

        // Check for metadata consistency
        for (const key in arb) {
            if (key.startsWith('@') && key !== '@@locale') {
                const mainKey = key.substring(1);
                if (!arb[mainKey]) {
                    errors.push(`Metadata ${key} has no corresponding main entry ${mainKey}`);
                }
            }
        }

        // Check for ICU MessageFormat syntax
        for (const key in arb) {
            if (!key.startsWith('@') && typeof arb[key] === 'string') {
                const value = arb[key];

                // Check for balanced braces
                const openBraces = (value.match(/\{/g) || []).length;
                const closeBraces = (value.match(/\}/g) || []).length;

                if (openBraces !== closeBraces) {
                    errors.push(`Unbalanced braces in ${key}: "${value}"`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate complete ARB files for a project
     */
    async generateAll(occurrences, languages, outputDir, options = {}) {
        const files = {};

        for (const language of languages) {
            const isMasterTemplate = language === languages[0]; // First language is master
            const arb = await this.generate(occurrences, language, {
                isMasterTemplate,
                translations: options.translations?.[language] || {}
            });

            // Add RTL entries for RTL languages
            if (this.options.rtlLanguages.includes(language)) {
                Object.assign(arb, this.generateRTLEntries());
            }

            const fileName = `app_${language}.arb`;
            const filePath = path.join(outputDir, fileName);

            files[fileName] = {
                path: filePath,
                content: arb,
                isMasterTemplate
            };
        }

        return files;
    }
}

module.exports = { ARBGenerator };
