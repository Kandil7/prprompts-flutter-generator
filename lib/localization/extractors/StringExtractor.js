/**
 * StringExtractor - Extracts hardcoded strings from Dart files
 * Uses regex patterns to find user-facing strings in Flutter widgets
 */

const fs = require('fs').promises;
const path = require('path');
const { createModuleLogger } = require('../../utils/logger');
const logger = createModuleLogger('StringExtractor');

/**
 * Represents a found string occurrence
 */
class StringOccurrence {
    constructor(string, file, line, context, widgetType) {
        this.string = string;
        this.file = file;
        this.line = line;
        this.context = context;
        this.widgetType = widgetType;
        this.key = this.generateKey(string, context);
    }

    generateKey(string, context) {
        // Generate camelCase key from string
        // "Welcome to App" -> "welcomeToApp"
        // "Login Button" -> "loginButton"

        let cleaned = string
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
            .trim()
            .split(/\s+/)
            .map((word, index) => {
                if (index === 0) {
                    return word.toLowerCase();
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');

        // If context suggests specific purpose, prepend it
        if (context.includes('hint') || context.includes('placeholder')) {
            cleaned = 'hint' + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        } else if (context.includes('title') || context.includes('appBar')) {
            cleaned = 'title' + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        } else if (context.includes('button')) {
            cleaned = 'button' + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        } else if (context.includes('error')) {
            cleaned = 'error' + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }

        return cleaned || 'untitled';
    }
}

class StringExtractor {
    constructor(options = {}) {
        this.options = {
            excludePatterns: options.excludePatterns || [
                /\/\*[\s\S]*?\*\//g,  // Multi-line comments
                /\/\/.*/g,             // Single-line comments
                /debugPrint/,          // Debug statements
                /print\(/,             // Print statements
                /Logger\./,            // Logger calls
            ],
            ...options
        };

        this.patterns = {
            // Text widget: Text('Hello'), Text("World")
            text: /Text\s*\(\s*['"]([^'"]+)['"]/g,

            // AppBar title: AppBar(title: Text('Home'))
            appBarTitle: /AppBar\s*\([^)]*title:\s*Text\s*\(\s*['"]([^'"]+)['"]/g,

            // TextField hint: TextField(hintText: 'Enter email')
            textFieldHint: /TextField\s*\([^)]*(?:hintText|labelText):\s*['"]([^'"]+)['"]/g,

            // Button child: ElevatedButton(child: Text('Submit'))
            buttonChild: /(?:ElevatedButton|TextButton|OutlinedButton)\s*\([^)]*child:\s*Text\s*\(\s*['"]([^'"]+)['"]/g,

            // Dialog title/content: AlertDialog(title: Text('Error'))
            dialogText: /(?:AlertDialog|SimpleDialog)\s*\([^)]*(?:title|content):\s*Text\s*\(\s*['"]([^'"]+)['"]/g,

            // SnackBar content: SnackBar(content: Text('Saved'))
            snackBarContent: /SnackBar\s*\([^)]*content:\s*Text\s*\(\s*['"]([^'"]+)['"]/g,

            // String interpolation: 'Hello $name' or "Welcome ${user.name}"
            interpolation: /(\$\{[^}]+\}|\$\w+)/g,

            // Already localized: AppLocalizations.of(context)
            alreadyLocalized: /AppLocalizations\.of\(context\)[!?]?\./g,
        };
    }

    /**
     * Extract strings from entire Flutter project
     */
    async extractFromProject(projectPath) {
        const dartFiles = await this.findDartFiles(projectPath);
        const allOccurrences = new Map();

        for (const file of dartFiles) {
            const occurrences = await this.extractFromFile(file);

            for (const occurrence of occurrences) {
                const key = occurrence.key;
                if (!allOccurrences.has(key)) {
                    allOccurrences.set(key, []);
                }
                allOccurrences.get(key).push(occurrence);
            }
        }

        return allOccurrences;
    }

    /**
     * Extract strings from a single Dart file
     */
    async extractFromFile(filePath) {
        const content = await fs.readFile(filePath, 'utf8');
        const occurrences = [];

        // Skip if file already uses localization
        if (this.patterns.alreadyLocalized.test(content)) {
            logger.debug(`Skipping ${path.basename(filePath)} - already localized`);
            return occurrences;
        }

        // Remove comments
        let cleanedContent = content;
        for (const excludePattern of this.options.excludePatterns) {
            cleanedContent = cleanedContent.replace(excludePattern, '');
        }

        // Extract strings using different patterns
        const patternTypes = [
            { name: 'text', pattern: this.patterns.text, widget: 'Text' },
            { name: 'appBarTitle', pattern: this.patterns.appBarTitle, widget: 'AppBar' },
            { name: 'textFieldHint', pattern: this.patterns.textFieldHint, widget: 'TextField' },
            { name: 'buttonChild', pattern: this.patterns.buttonChild, widget: 'Button' },
            { name: 'dialogText', pattern: this.patterns.dialogText, widget: 'Dialog' },
            { name: 'snackBarContent', pattern: this.patterns.snackBarContent, widget: 'SnackBar' },
        ];

        for (const { name, pattern, widget } of patternTypes) {
            let match;
            const regex = new RegExp(pattern.source, pattern.flags);

            while ((match = regex.exec(cleanedContent)) !== null) {
                const string = match[1];

                // Skip empty strings
                if (!string || string.trim().length === 0) continue;

                // Skip strings that look like identifiers or code
                if (this.looksLikeCode(string)) continue;

                // Find line number
                const lineNumber = this.getLineNumber(content, match.index);

                const occurrence = new StringOccurrence(
                    string,
                    filePath,
                    lineNumber,
                    name,
                    widget
                );

                occurrences.push(occurrence);
            }
        }

        return occurrences;
    }

    /**
     * Find all Dart files in project
     */
    async findDartFiles(projectPath) {
        const files = [];
        const libPath = path.join(projectPath, 'lib');

        // Check if lib directory exists
        try {
            await fs.access(libPath);
        } catch {
            throw new Error(`Flutter project lib/ directory not found: ${libPath}`);
        }

        await this._findDartFilesRecursive(libPath, files);
        return files;
    }

    /**
     * Recursively find Dart files
     */
    async _findDartFilesRecursive(dir, files) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Skip generated and build directories
                if (!['generated', 'build', '.dart_tool', 'gen'].includes(entry.name)) {
                    await this._findDartFilesRecursive(fullPath, files);
                }
            } else if (entry.isFile() && entry.name.endsWith('.dart')) {
                // Skip generated files
                if (!entry.name.endsWith('.g.dart') && !entry.name.endsWith('.freezed.dart')) {
                    files.push(fullPath);
                }
            }
        }
    }

    /**
     * Check if string looks like code rather than user-facing text
     */
    looksLikeCode(string) {
        // Skip very short strings (likely IDs or codes)
        if (string.length < 2) return true;

        // Skip if all caps with underscores (likely constants)
        if (/^[A-Z_]+$/.test(string)) return true;

        // Skip if looks like file path
        if (string.includes('/') || string.includes('\\')) return true;

        // Skip if looks like URL
        if (string.startsWith('http://') || string.startsWith('https://')) return true;

        // Skip if looks like key or ID
        if (/^[a-z]+_[a-z_]+$/.test(string)) return true;

        return false;
    }

    /**
     * Get line number from content and index
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    /**
     * Convert string interpolation to ICU MessageFormat
     * "Hello $name" -> "Hello {name}"
     * "Total: ${cart.total}" -> "Total: {total}"
     */
    convertInterpolation(string) {
        return string.replace(this.patterns.interpolation, (match) => {
            // Extract variable name
            let varName = match.replace(/[\${}]/g, '');

            // If it has dot notation, take last part
            if (varName.includes('.')) {
                varName = varName.split('.').pop();
            }

            return `{${varName}}`;
        });
    }

    /**
     * Extract placeholder information from interpolated string
     */
    extractPlaceholders(string) {
        const placeholders = {};
        const matches = string.match(this.patterns.interpolation);

        if (!matches) return placeholders;

        for (const match of matches) {
            let varName = match.replace(/[\${}]/g, '');

            if (varName.includes('.')) {
                varName = varName.split('.').pop();
            }

            placeholders[varName] = {
                type: 'String', // Default to String, can be refined with AI
                example: varName === 'count' ? '5' : 'Example'
            };
        }

        return placeholders;
    }
}

module.exports = { StringExtractor, StringOccurrence };
