/**
 * LocalizeCommand - Main orchestrator for Flutter app localization
 * Integrates string extraction, ARB generation, configuration, and validation
 */

const fs = require('fs').promises;
const path = require('path');
const { StringExtractor } = require('../extractors/StringExtractor');
const { ARBGenerator } = require('../generators/ARBGenerator');
const { L10nConfigGenerator } = require('../generators/L10nConfigGenerator');
const { LocalizationValidator } = require('../validators/LocalizationValidator');
const ProgressBar = require('../../refactoring/cli/ProgressBar');
const Reporter = require('../../refactoring/cli/Reporter');
const { createModuleLogger } = require('../../utils/logger');
const logger = createModuleLogger('LocalizeCommand');

class LocalizeCommand {
    constructor(options = {}) {
        this.options = {
            projectPath: options.projectPath || process.cwd(),
            languages: options.languages || ['en', 'ar'],
            outputDir: options.outputDir || 'lib/l10n',
            ai: options.ai || 'none',
            validate: options.validate !== false,
            dryRun: options.dryRun || false,
            includeExamples: options.includeExamples !== false,
            verbose: options.verbose || false,
            translations: options.translations || {}
        };

        this.stats = {
            filesScanned: 0,
            stringsFound: 0,
            arbFilesGenerated: 0,
            configFilesCreated: 0,
            errors: [],
            warnings: []
        };
    }

    /**
     * Main execution workflow
     */
    async execute() {
        try {
            const startTime = Date.now();

            logger.info('🌍 Starting Flutter app localization...\n');

            // Step 1: Validate Flutter project
            await this.validateFlutterProject();

            // Step 2: Extract strings from Dart files
            const occurrences = await this.extractStrings();

            // Step 3: Generate ARB files
            const arbFiles = await this.generateARBFiles(occurrences);

            // Step 4: Generate configuration files
            await this.generateConfiguration();

            // Step 5: Enhance with AI (if enabled)
            if (this.options.ai !== 'none') {
                await this.enhanceWithAI(arbFiles);
            }

            // Step 6: Validate setup (if enabled)
            let validationResults = null;
            if (this.options.validate) {
                validationResults = await this.validateSetup();
            }

            // Step 7: Write files (unless dry run)
            if (!this.options.dryRun) {
                await this.writeFiles(arbFiles);
            }

            // Step 8: Generate report
            const duration = Date.now() - startTime;
            await this.generateReport(validationResults, duration);

            logger.success('\n✅ Localization setup complete!');

            return {
                success: true,
                stats: this.stats,
                duration,
                validationResults
            };

        } catch (error) {
            logger.error(`\n❌ Localization failed: ${error.message}`);
            if (this.options.verbose) {
                logger.error(error.stack);
            }

            return {
                success: false,
                error: error.message,
                stats: this.stats
            };
        }
    }

    /**
     * Validate Flutter project structure
     */
    async validateFlutterProject() {
        logger.info('🔍 Validating Flutter project...');

        const projectPath = this.options.projectPath;

        // Check pubspec.yaml
        const pubspecPath = path.join(projectPath, 'pubspec.yaml');
        try {
            await fs.access(pubspecPath);
        } catch {
            throw new Error(`Not a Flutter project: pubspec.yaml not found in ${projectPath}`);
        }

        // Check lib/ directory
        const libPath = path.join(projectPath, 'lib');
        try {
            const stats = await fs.stat(libPath);
            if (!stats.isDirectory()) {
                throw new Error(`lib/ is not a directory in ${projectPath}`);
            }
        } catch {
            throw new Error(`lib/ directory not found in ${projectPath}`);
        }

        // Check for at least one .dart file
        const dartFiles = await this.findDartFiles(libPath);
        if (dartFiles.length === 0) {
            throw new Error(`No Dart files found in ${libPath}`);
        }

        logger.success('✅ Flutter project validated\n');
    }

    /**
     * Extract strings from Dart files
     */
    async extractStrings() {
        logger.info('📖 Extracting strings from Dart files...');

        const extractor = new StringExtractor();
        const occurrences = await extractor.extractFromProject(this.options.projectPath);

        this.stats.stringsFound = occurrences.size;

        // Count files scanned
        let totalFiles = 0;
        for (const occurrenceList of occurrences.values()) {
            const fileSet = new Set(occurrenceList.map(occ => occ.file));
            totalFiles = Math.max(totalFiles, fileSet.size);
        }
        this.stats.filesScanned = totalFiles;

        if (this.stats.stringsFound === 0) {
            logger.warn('⚠️  No hardcoded strings found. Your app may already be localized.');
        } else {
            logger.success(`✅ Found ${this.stats.stringsFound} strings in ${this.stats.filesScanned} files\n`);
        }

        return occurrences;
    }

    /**
     * Generate ARB files
     */
    async generateARBFiles(occurrences) {
        logger.info('🏗️  Generating ARB files...');

        const generator = new ARBGenerator({
            includeMetadata: true,
            includeExamples: this.options.includeExamples
        });

        const arbFiles = await generator.generateAll(
            occurrences,
            this.options.languages,
            path.join(this.options.projectPath, this.options.outputDir),
            {
                translations: this.options.translations
            }
        );

        this.stats.arbFilesGenerated = Object.keys(arbFiles).length;

        logger.success(`✅ Generated ${this.stats.arbFilesGenerated} ARB files\n`);

        return arbFiles;
    }

    /**
     * Generate configuration files
     */
    async generateConfiguration() {
        logger.info('⚙️  Generating configuration files...');

        const configGenerator = new L10nConfigGenerator({
            arbDir: this.options.outputDir
        });

        // Generate l10n.yaml
        if (!this.options.dryRun) {
            await configGenerator.saveL10nYaml(this.options.projectPath, this.options.languages);
            this.stats.configFilesCreated++;

            // Update pubspec.yaml
            const modified = await configGenerator.updatePubspecYaml(this.options.projectPath);
            if (modified) {
                this.stats.configFilesCreated++;
            }

            // Generate integration guide
            await configGenerator.saveIntegrationGuide(
                this.options.projectPath,
                this.options.languages,
                {
                    stringsCount: this.stats.stringsFound,
                    filesCount: this.stats.filesScanned
                }
            );
            this.stats.configFilesCreated++;
        }

        logger.success(`✅ Created ${this.stats.configFilesCreated} configuration files\n`);
    }

    /**
     * Enhance with AI translation
     */
    async enhanceWithAI(arbFiles) {
        logger.info(`🤖 Enhancing with ${this.options.ai.toUpperCase()} translation...`);

        try {
            const { createAIClient, createAIServices } = require('../../ai');
            const aiClient = createAIClient(this.options.ai);
            const { translationService } = createAIServices(aiClient, logger);

            if (!translationService) {
                logger.warn('⚠️  Translation service not available, skipping AI enhancement');
                return;
            }

            const progressBar = new ProgressBar({
                total: this.options.languages.length - 1, // Exclude master language
                format: 'AI Translation... {bar} {percentage}% ({value}/{total} languages) [ETA: {eta}s]'
            });

            // Translate non-master languages
            for (let i = 1; i < this.options.languages.length; i++) {
                const targetLang = this.options.languages[i];
                const fileName = `app_${targetLang}.arb`;

                if (arbFiles[fileName]) {
                    const masterARB = arbFiles[`app_${this.options.languages[0]}.arb`].content;
                    const targetARB = arbFiles[fileName].content;

                    // Translate each key
                    for (const key in masterARB) {
                        if (!key.startsWith('@') && !targetARB[key]) {
                            const translation = await translationService.translate(
                                masterARB[key],
                                targetLang,
                                { context: key }
                            );

                            if (translation) {
                                targetARB[key] = translation;
                            }
                        }
                    }
                }

                progressBar.increment();
            }

            progressBar.stop();
            logger.success('✅ AI translation complete\n');

        } catch (error) {
            logger.warn(`⚠️  AI enhancement failed: ${error.message}`);
            this.stats.warnings.push({
                type: 'ai_enhancement',
                message: error.message
            });
        }
    }

    /**
     * Validate localization setup
     */
    async validateSetup() {
        logger.info('🔍 Validating localization setup...');

        const validator = new LocalizationValidator();
        const results = await validator.validate(this.options.projectPath, this.options.languages);

        const { errors, warnings, infos } = results.summary;

        if (results.valid) {
            logger.success(`✅ Validation passed (${warnings} warnings, ${infos} info)\n`);
        } else {
            logger.error(`❌ Validation failed: ${errors} errors, ${warnings} warnings\n`);
        }

        return results;
    }

    /**
     * Write ARB files to disk
     */
    async writeFiles(arbFiles) {
        logger.info('💾 Writing files...');

        const progressBar = new ProgressBar({
            total: Object.keys(arbFiles).length,
            format: 'Writing files... {bar} {percentage}% ({value}/{total} files)'
        });

        for (const [fileName, fileData] of Object.entries(arbFiles)) {
            try {
                const jsonContent = JSON.stringify(fileData.content, null, 2);
                await fs.mkdir(path.dirname(fileData.path), { recursive: true });
                await fs.writeFile(fileData.path, jsonContent, 'utf8');
                progressBar.increment();
            } catch (error) {
                this.stats.errors.push({
                    file: fileName,
                    error: `Write failed: ${error.message}`
                });
                progressBar.increment();
            }
        }

        progressBar.stop();
        logger.success(`✅ Wrote ${Object.keys(arbFiles).length} files\n`);
    }

    /**
     * Generate report
     */
    async generateReport(validationResults, duration) {
        logger.info('📊 Generating report...\n');

        const reporter = new Reporter();

        // Summary section
        reporter.section('Localization Summary');
        reporter.table([
            ['Files scanned', this.stats.filesScanned],
            ['Strings extracted', this.stats.stringsFound],
            ['ARB files generated', this.stats.arbFilesGenerated],
            ['Configuration files', this.stats.configFilesCreated],
            ['Languages', this.options.languages.join(', ')],
            ['Duration', `${(duration / 1000).toFixed(1)}s`]
        ]);

        // Generated files section
        reporter.section('Generated Files');
        logger.info(`  📁 ${this.options.outputDir}/`);
        for (const lang of this.options.languages) {
            const isMaster = lang === this.options.languages[0];
            logger.info(`    ${isMaster ? '📝' : '🌍'} app_${lang}.arb ${isMaster ? '(master template)' : ''}`);
        }
        logger.info(`  ⚙️  l10n.yaml`);
        logger.info(`  📄 pubspec.yaml (updated)`);
        logger.info(`  📖 ${this.options.outputDir}/integration_guide.md\n`);

        // Languages section
        reporter.section('Configured Languages');
        const configGen = new L10nConfigGenerator();
        for (const lang of this.options.languages) {
            const langName = configGen.getLanguageName(lang);
            const isMaster = lang === this.options.languages[0];
            const isRTL = ['ar', 'he', 'fa', 'ur'].includes(lang);

            let status = isMaster ? '(Master template)' : '';
            if (isRTL) status += ' [RTL]';

            logger.info(`  ${isMaster ? '📝' : '🌍'} ${langName} (${lang}) ${status}`);
        }

        // Validation results
        if (validationResults) {
            console.log('');
            reporter.section('Validation Results');
            const { errors, warnings, infos } = validationResults.summary;

            if (errors === 0) {
                logger.success(`  ✅ No errors found`);
            } else {
                logger.error(`  ❌ ${errors} error(s)`);
            }

            if (warnings > 0) {
                logger.warn(`  ⚠️  ${warnings} warning(s)`);
            }

            if (infos > 0) {
                logger.info(`  ℹ️  ${infos} info message(s)`);
            }
        }

        // Next steps
        reporter.section('Next Steps');
        logger.info('  1. Review ARB files:', this.options.outputDir);
        logger.info('  2. Run: flutter pub get');
        logger.info('  3. Run: flutter gen-l10n');
        logger.info('  4. Update MaterialApp (see integration_guide.md)');
        logger.info('  5. Replace hardcoded strings with AppLocalizations.of(context)');
        if (this.options.languages.includes('ar')) {
            logger.info('  6. Test Arabic (RTL) layout');
        }

        // Resources
        console.log('');
        reporter.section('Resources');
        logger.info(`  📖 Integration Guide: ${this.options.outputDir}/integration_guide.md`);
        logger.info('  📚 Flutter i18n Docs: https://flutter.dev/docs/development/accessibility-and-localization/internationalization');
        logger.info('  🌐 ARB Format: https://github.com/google/app-resource-bundle');

        console.log('');
    }

    /**
     * Find Dart files in directory
     */
    async findDartFiles(dir) {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (!['generated', 'build', '.dart_tool', 'gen'].includes(entry.name)) {
                    files.push(...await this.findDartFiles(fullPath));
                }
            } else if (entry.isFile() && entry.name.endsWith('.dart')) {
                if (!entry.name.endsWith('.g.dart') && !entry.name.endsWith('.freezed.dart')) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }
}

module.exports = LocalizeCommand;
