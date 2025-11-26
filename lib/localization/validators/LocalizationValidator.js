/**
 * LocalizationValidator - Validates ARB files and localization setup
 */

const fs = require('fs').promises;
const path = require('path');
const { createModuleLogger } = require('../../utils/logger');
const logger = createModuleLogger('LocalizationValidator');

class LocalizationValidator {
    constructor(options = {}) {
        this.options = {
            rtlLanguages: options.rtlLanguages || ['ar', 'he', 'fa', 'ur'],
            ...options
        };

        this.issues = [];
    }

    /**
     * Validate complete localization setup
     */
    async validate(projectPath, languages) {
        this.issues = [];

        // Validate ARB files
        await this.validateARBFiles(projectPath, languages);

        // Validate l10n.yaml
        await this.validateL10nYaml(projectPath);

        // Validate pubspec.yaml
        await this.validatePubspecYaml(projectPath);

        return {
            valid: this.issues.filter(i => i.severity === 'error').length === 0,
            issues: this.issues,
            summary: this.generateSummary()
        };
    }

    /**
     * Validate ARB files exist and are valid
     */
    async validateARBFiles(projectPath, languages) {
        const arbDir = path.join(projectPath, 'lib', 'l10n');

        for (const language of languages) {
            const arbPath = path.join(arbDir, `app_${language}.arb`);

            try {
                const content = await fs.readFile(arbPath, 'utf8');
                const arb = JSON.parse(content);

                // Validate structure
                this.validateARBStructure(arb, language);

                // Store for cross-language validation
                if (language === languages[0]) {
                    this.masterARB = { language, arb, path: arbPath };
                }

            } catch (error) {
                if (error.code === 'ENOENT') {
                    this.addIssue('error', `ARB file missing: app_${language}.arb`, arbPath);
                } else if (error instanceof SyntaxError) {
                    this.addIssue('error', `Invalid JSON in app_${language}.arb: ${error.message}`, arbPath);
                } else {
                    this.addIssue('error', `Error reading app_${language}.arb: ${error.message}`, arbPath);
                }
            }
        }

        // Cross-language validation
        if (this.masterARB && languages.length > 1) {
            for (const language of languages.slice(1)) {
                const arbPath = path.join(arbDir, `app_${language}.arb`);
                try {
                    const content = await fs.readFile(arbPath, 'utf8');
                    const arb = JSON.parse(content);
                    this.validateKeysMatch(this.masterARB.arb, arb, this.masterARB.language, language);
                } catch {
                    // Already reported in previous loop
                }
            }
        }
    }

    /**
     * Validate ARB file structure
     */
    validateARBStructure(arb, language) {
        // Check for @@locale
        if (!arb['@@locale']) {
            this.addIssue('error', `Missing @@locale in app_${language}.arb`);
        } else if (arb['@@locale'] !== language) {
            this.addIssue('error', `@@locale mismatch: expected "${language}", got "${arb['@@locale']}"`);
        }

        // Check for metadata consistency
        const mainKeys = new Set();
        const metadataKeys = new Set();

        for (const key in arb) {
            if (key.startsWith('@')) {
                if (key !== '@@locale') {
                    metadataKeys.add(key.substring(1));
                }
            } else {
                mainKeys.add(key);
            }
        }

        // Check for orphaned metadata
        for (const metaKey of metadataKeys) {
            if (!mainKeys.has(metaKey)) {
                this.addIssue('warning', `Metadata @${metaKey} has no corresponding entry "${metaKey}"`);
            }
        }

        // Validate ICU MessageFormat syntax
        for (const key of mainKeys) {
            const value = arb[key];
            if (typeof value === 'string') {
                this.validateICUMessageFormat(key, value);
            }
        }

        // Check for RTL-specific entries
        if (this.options.rtlLanguages.includes(language)) {
            if (!arb.textDirection) {
                this.addIssue('info', `Consider adding "textDirection": "rtl" for ${language}`);
            }
        }
    }

    /**
     * Validate ICU MessageFormat syntax
     */
    validateICUMessageFormat(key, value) {
        // Check for balanced braces
        const openBraces = (value.match(/\{/g) || []).length;
        const closeBraces = (value.match(/\}/g) || []).length;

        if (openBraces !== closeBraces) {
            this.addIssue('error', `Unbalanced braces in "${key}": "${value}"`);
            return;
        }

        // Check for valid placeholder syntax
        const placeholderPattern = /\{([^}]+)\}/g;
        let match;

        while ((match = placeholderPattern.exec(value)) !== null) {
            const placeholder = match[1].trim();

            // Check for ICU plural format
            if (placeholder.includes('plural')) {
                if (!this.validatePluralFormat(placeholder)) {
                    this.addIssue('error', `Invalid plural format in "${key}": {${placeholder}}`);
                }
            }

            // Check for ICU select format
            else if (placeholder.includes('select')) {
                if (!this.validateSelectFormat(placeholder)) {
                    this.addIssue('error', `Invalid select format in "${key}": {${placeholder}}`);
                }
            }

            // Simple placeholder - validate name
            else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(placeholder)) {
                this.addIssue('warning', `Placeholder name "${placeholder}" in "${key}" should use camelCase`);
            }
        }
    }

    /**
     * Validate ICU plural format
     */
    validatePluralFormat(placeholder) {
        // Basic validation: should have "plural" keyword and at least "other" case
        if (!placeholder.includes('plural')) return false;
        if (!placeholder.includes('other')) return false;

        // Check for proper structure: {count, plural, =0{...} =1{...} other{...}}
        const pluralPattern = /^\s*\w+\s*,\s*plural\s*,\s*.+/;
        return pluralPattern.test(placeholder);
    }

    /**
     * Validate ICU select format
     */
    validateSelectFormat(placeholder) {
        // Basic validation: should have "select" keyword and at least "other" case
        if (!placeholder.includes('select')) return false;
        if (!placeholder.includes('other')) return false;

        // Check for proper structure: {gender, select, male{...} female{...} other{...}}
        const selectPattern = /^\s*\w+\s*,\s*select\s*,\s*.+/;
        return selectPattern.test(placeholder);
    }

    /**
     * Validate keys match across languages
     */
    validateKeysMatch(masterARB, targetARB, masterLang, targetLang) {
        const masterKeys = new Set();
        const targetKeys = new Set();

        // Collect main keys (not metadata)
        for (const key in masterARB) {
            if (!key.startsWith('@')) {
                masterKeys.add(key);
            }
        }

        for (const key in targetARB) {
            if (!key.startsWith('@')) {
                targetKeys.add(key);
            }
        }

        // Check for missing keys in target
        for (const key of masterKeys) {
            if (!targetKeys.has(key)) {
                this.addIssue('warning', `Missing translation for "${key}" in ${targetLang} (exists in ${masterLang})`);
            }
        }

        // Check for extra keys in target
        for (const key of targetKeys) {
            if (!masterKeys.has(key)) {
                this.addIssue('warning', `Extra key "${key}" in ${targetLang} (not in ${masterLang})`);
            }
        }

        // Validate placeholder consistency
        for (const key of masterKeys) {
            if (targetKeys.has(key)) {
                this.validatePlaceholderConsistency(
                    key,
                    masterARB[key],
                    targetARB[key],
                    masterLang,
                    targetLang
                );
            }
        }
    }

    /**
     * Validate placeholder consistency across languages
     */
    validatePlaceholderConsistency(key, masterValue, targetValue, masterLang, targetLang) {
        const masterPlaceholders = this.extractPlaceholders(masterValue);
        const targetPlaceholders = this.extractPlaceholders(targetValue);

        // Check for matching placeholders
        for (const placeholder of masterPlaceholders) {
            if (!targetPlaceholders.includes(placeholder)) {
                this.addIssue(
                    'error',
                    `Placeholder {${placeholder}} missing in ${targetLang} translation of "${key}"`
                );
            }
        }

        for (const placeholder of targetPlaceholders) {
            if (!masterPlaceholders.includes(placeholder)) {
                this.addIssue(
                    'warning',
                    `Extra placeholder {${placeholder}} in ${targetLang} translation of "${key}"`
                );
            }
        }
    }

    /**
     * Extract placeholder names from ICU MessageFormat string
     */
    extractPlaceholders(value) {
        if (typeof value !== 'string') return [];

        const placeholders = [];
        const placeholderPattern = /\{([^,}]+)(?:,\s*(?:plural|select))?\}/g;
        let match;

        while ((match = placeholderPattern.exec(value)) !== null) {
            placeholders.push(match[1].trim());
        }

        return placeholders;
    }

    /**
     * Validate l10n.yaml exists and is valid
     */
    async validateL10nYaml(projectPath) {
        const l10nPath = path.join(projectPath, 'l10n.yaml');

        try {
            const content = await fs.readFile(l10nPath, 'utf8');
            const yaml = require('js-yaml');
            const config = yaml.load(content);

            // Check required fields
            if (!config['arb-dir']) {
                this.addIssue('error', 'Missing arb-dir in l10n.yaml');
            }

            if (!config['template-arb-file']) {
                this.addIssue('error', 'Missing template-arb-file in l10n.yaml');
            }

            if (!config['output-class']) {
                this.addIssue('warning', 'Missing output-class in l10n.yaml (will use default)');
            }

        } catch (error) {
            if (error.code === 'ENOENT') {
                this.addIssue('error', 'l10n.yaml not found');
            } else {
                this.addIssue('error', `Invalid l10n.yaml: ${error.message}`);
            }
        }
    }

    /**
     * Validate pubspec.yaml has required dependencies
     */
    async validatePubspecYaml(projectPath) {
        const pubspecPath = path.join(projectPath, 'pubspec.yaml');

        try {
            const content = await fs.readFile(pubspecPath, 'utf8');
            const yaml = require('js-yaml');
            const pubspec = yaml.load(content);

            // Check for flutter_localizations
            if (!pubspec.dependencies?.flutter_localizations) {
                this.addIssue('error', 'Missing flutter_localizations dependency in pubspec.yaml');
            }

            // Check for intl
            if (!pubspec.dependencies?.intl) {
                this.addIssue('warning', 'Missing intl dependency in pubspec.yaml');
            }

            // Check for generate: true
            if (!pubspec.flutter?.generate) {
                this.addIssue('error', 'Missing flutter.generate: true in pubspec.yaml');
            }

        } catch (error) {
            this.addIssue('error', `Error reading pubspec.yaml: ${error.message}`);
        }
    }

    /**
     * Add issue to list
     */
    addIssue(severity, message, file = null) {
        this.issues.push({
            severity,
            message,
            file: file ? path.basename(file) : null
        });

        const logMethod = severity === 'error' ? 'error' : severity === 'warning' ? 'warn' : 'info';
        logger[logMethod](message);
    }

    /**
     * Generate summary
     */
    generateSummary() {
        const errors = this.issues.filter(i => i.severity === 'error');
        const warnings = this.issues.filter(i => i.severity === 'warning');
        const infos = this.issues.filter(i => i.severity === 'info');

        return {
            totalIssues: this.issues.length,
            errors: errors.length,
            warnings: warnings.length,
            infos: infos.length,
            valid: errors.length === 0
        };
    }
}

module.exports = { LocalizationValidator };
