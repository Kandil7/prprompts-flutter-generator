/**
 * TranslationService - AI-powered translation for Flutter localization
 */

class TranslationService {
    constructor(aiClient, logger = console) {
        this.aiClient = aiClient;
        this.logger = logger;
    }

    /**
     * Translate a single string to target language
     * @param {string} text - Source text to translate
     * @param {string} targetLanguage - Target language code (e.g., 'ar', 'es')
     * @param {Object} context - Additional context for translation
     * @returns {Promise<string>} Translated text
     */
    async translate(text, targetLanguage, context = {}) {
        try {
            const prompt = this.buildTranslationPrompt(text, targetLanguage, context);
            const response = await this.aiClient.generateText(prompt);

            // Extract translation from response
            const translation = this.extractTranslation(response);

            this.logger.debug(`Translated "${text}" to ${targetLanguage}: "${translation}"`);

            return translation;

        } catch (error) {
            this.logger.warn(`Translation failed for "${text}": ${error.message}`);
            return null;
        }
    }

    /**
     * Translate multiple strings in batch
     * @param {Array<{key: string, text: string}>} strings - Array of strings to translate
     * @param {string} targetLanguage - Target language code
     * @returns {Promise<Object>} Map of key to translation
     */
    async batchTranslate(strings, targetLanguage) {
        const translations = {};

        // Process in batches of 10 to avoid rate limits
        const batchSize = 10;
        for (let i = 0; i < strings.length; i += batchSize) {
            const batch = strings.slice(i, i + batchSize);

            try {
                const prompt = this.buildBatchTranslationPrompt(batch, targetLanguage);
                const response = await this.aiClient.generateText(prompt);

                const batchTranslations = this.extractBatchTranslations(response);

                Object.assign(translations, batchTranslations);

            } catch (error) {
                this.logger.warn(`Batch translation failed: ${error.message}`);

                // Fallback to individual translation
                for (const { key, text } of batch) {
                    translations[key] = await this.translate(text, targetLanguage, { key });
                }
            }

            // Avoid rate limiting
            await this.sleep(1000);
        }

        return translations;
    }

    /**
     * Validate translation quality
     * @param {string} source - Source text
     * @param {string} translation - Translated text
     * @param {string} targetLanguage - Target language code
     * @returns {Promise<Object>} Validation result
     */
    async validateTranslation(source, translation, targetLanguage) {
        try {
            const prompt = this.buildValidationPrompt(source, translation, targetLanguage);
            const response = await this.aiClient.generateText(prompt);

            return this.extractValidationResult(response);

        } catch (error) {
            this.logger.warn(`Translation validation failed: ${error.message}`);
            return { valid: true, confidence: 0.5, issues: [] };
        }
    }

    /**
     * Build translation prompt
     */
    buildTranslationPrompt(text, targetLanguage, context) {
        const languageNames = this.getLanguageNames();
        const targetLangName = languageNames[targetLanguage] || targetLanguage;

        let prompt = `Translate the following text from English to ${targetLangName}.\n\n`;
        prompt += `Source text: "${text}"\n\n`;

        if (context.key) {
            prompt += `Context: This is a ${context.key} in a Flutter mobile app.\n`;
        }

        if (context.widgetType) {
            prompt += `Widget type: ${context.widgetType}\n`;
        }

        prompt += `\nRules:\n`;
        prompt += `1. Preserve any placeholders in curly braces: {variable}\n`;
        prompt += `2. Maintain the same level of formality\n`;
        prompt += `3. Use natural, native-sounding language\n`;
        prompt += `4. For mobile UI, use concise phrasing\n`;

        if (targetLanguage === 'ar') {
            prompt += `5. Use proper Arabic grammar and diacritics\n`;
            prompt += `6. Consider RTL layout context\n`;
        }

        prompt += `\nProvide ONLY the translation, nothing else.\n`;

        return prompt;
    }

    /**
     * Build batch translation prompt
     */
    buildBatchTranslationPrompt(strings, targetLanguage) {
        const languageNames = this.getLanguageNames();
        const targetLangName = languageNames[targetLanguage] || targetLanguage;

        let prompt = `Translate the following strings from English to ${targetLangName}.\n\n`;
        prompt += `Return the translations in JSON format: { "key": "translation" }\n\n`;

        for (const { key, text } of strings) {
            prompt += `${key}: "${text}"\n`;
        }

        prompt += `\nRules:\n`;
        prompt += `1. Preserve any placeholders in curly braces: {variable}\n`;
        prompt += `2. Use natural, native-sounding language for mobile UI\n`;
        prompt += `3. Return valid JSON only\n`;

        return prompt;
    }

    /**
     * Build validation prompt
     */
    buildValidationPrompt(source, translation, targetLanguage) {
        const languageNames = this.getLanguageNames();
        const targetLangName = languageNames[targetLanguage] || targetLanguage;

        let prompt = `Validate this translation from English to ${targetLangName}:\n\n`;
        prompt += `English: "${source}"\n`;
        prompt += `${targetLangName}: "${translation}"\n\n`;
        prompt += `Check for:\n`;
        prompt += `1. Accuracy - does it convey the same meaning?\n`;
        prompt += `2. Naturalness - is it natural in ${targetLangName}?\n`;
        prompt += `3. Placeholders - are all {placeholders} preserved?\n`;
        prompt += `4. Tone - is the formality level appropriate?\n\n`;
        prompt += `Respond in JSON: { "valid": true/false, "confidence": 0.0-1.0, "issues": [] }\n`;

        return prompt;
    }

    /**
     * Extract translation from AI response
     */
    extractTranslation(response) {
        // Remove quotes and trim
        let translation = response.trim();

        // If wrapped in quotes, remove them
        if ((translation.startsWith('"') && translation.endsWith('"')) ||
            (translation.startsWith("'") && translation.endsWith("'"))) {
            translation = translation.slice(1, -1);
        }

        // If AI added extra explanation, extract just the translation
        const lines = translation.split('\n');
        if (lines.length > 1) {
            // Take the first non-empty line that looks like a translation
            for (const line of lines) {
                const cleaned = line.trim();
                if (cleaned && !cleaned.startsWith('Translation:') && !cleaned.startsWith('Result:')) {
                    translation = cleaned;
                    break;
                }
            }
        }

        return translation;
    }

    /**
     * Extract batch translations from AI response
     */
    extractBatchTranslations(response) {
        try {
            // Try to parse as JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            this.logger.warn(`Failed to parse batch translations as JSON: ${error.message}`);
        }

        // Fallback: extract key-value pairs
        const translations = {};
        const lines = response.split('\n');

        for (const line of lines) {
            const match = line.match(/["']?(\w+)["']?\s*:\s*["'](.+)["']/);
            if (match) {
                translations[match[1]] = match[2];
            }
        }

        return translations;
    }

    /**
     * Extract validation result from AI response
     */
    extractValidationResult(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            this.logger.warn(`Failed to parse validation result: ${error.message}`);
        }

        // Default to valid if we can't parse
        return {
            valid: true,
            confidence: 0.5,
            issues: []
        };
    }

    /**
     * Get language names map
     */
    getLanguageNames() {
        return {
            en: 'English',
            ar: 'Arabic',
            es: 'Spanish',
            fr: 'French',
            de: 'German',
            it: 'Italian',
            pt: 'Portuguese',
            ru: 'Russian',
            zh: 'Chinese',
            ja: 'Japanese',
            ko: 'Korean',
            hi: 'Hindi',
            he: 'Hebrew',
            fa: 'Persian',
            ur: 'Urdu',
            tr: 'Turkish'
        };
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = TranslationService;
