/**
 * ARBGenerator Tests
 */

const { ARBGenerator } = require('../../../lib/localization/generators/ARBGenerator');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('ARBGenerator', () => {
    let generator;
    let tempDir;

    beforeEach(async () => {
        generator = new ARBGenerator();
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arb-test-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('generate', () => {
        test('should generate valid ARB structure', async () => {
            const occurrences = new Map();
            occurrences.set('welcomeMessage', [{
                string: 'Welcome to App',
                file: 'home.dart',
                line: 10,
                context: 'text',
                widgetType: 'Text',
                key: 'welcomeMessage'
            }]);

            const arb = await generator.generate(occurrences, 'en', { isMasterTemplate: true });

            expect(arb['@@locale']).toBe('en');
            expect(arb.welcomeMessage).toBe('Welcome to App');
            expect(arb['@welcomeMessage']).toBeDefined();
            expect(arb['@welcomeMessage'].description).toBeDefined();
        });

        test('should convert string interpolation to ICU format', async () => {
            const occurrences = new Map();
            occurrences.set('greeting', [{
                string: 'Hello $userName',
                file: 'home.dart',
                line: 10,
                context: 'text',
                widgetType: 'Text',
                key: 'greeting'
            }]);

            const arb = await generator.generate(occurrences, 'en', { isMasterTemplate: true });

            expect(arb.greeting).toBe('Hello {userName}');
            expect(arb['@greeting'].placeholders).toBeDefined();
            expect(arb['@greeting'].placeholders.userName).toBeDefined();
        });

        test('should add RTL entries for Arabic', async () => {
            const rtlEntries = generator.generateRTLEntries();

            expect(rtlEntries.textDirection).toBe('rtl');
            expect(rtlEntries['@textDirection']).toBeDefined();
        });
    });

    describe('validateARB', () => {
        test('should validate correct ARB structure', () => {
            const arb = {
                '@@locale': 'en',
                'welcome': 'Welcome',
                '@welcome': {
                    description: 'Welcome message'
                }
            };

            const result = generator.validateARB(arb);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should detect missing @@locale', () => {
            const arb = {
                'welcome': 'Welcome'
            };

            const result = generator.validateARB(arb);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Missing @@locale key');
        });

        test('should detect unbalanced braces', () => {
            const arb = {
                '@@locale': 'en',
                'greeting': 'Hello {userName'
            };

            const result = generator.validateARB(arb);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Unbalanced braces'))).toBe(true);
        });
    });

    describe('save', () => {
        test('should save ARB file as JSON', async () => {
            const arb = {
                '@@locale': 'en',
                'welcome': 'Welcome'
            };

            const outputPath = path.join(tempDir, 'app_en.arb');
            await generator.save(arb, outputPath);

            const content = await fs.readFile(outputPath, 'utf8');
            const parsed = JSON.parse(content);

            expect(parsed['@@locale']).toBe('en');
            expect(parsed.welcome).toBe('Welcome');
        });
    });
});
