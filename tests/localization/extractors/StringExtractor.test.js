/**
 * StringExtractor Tests
 */

const { StringExtractor, StringOccurrence } = require('../../../lib/localization/extractors/StringExtractor');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

describe('StringExtractor', () => {
    let extractor;
    let tempDir;

    beforeEach(async () => {
        extractor = new StringExtractor();
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'localization-test-'));
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    describe('extractFromFile', () => {
        test('should extract Text widget strings', async () => {
            const dartCode = `
        import 'package:flutter/material.dart';
        
        class HomePage extends StatelessWidget {
          @override
          Widget build(BuildContext context) {
            return Text('Welcome to App');
          }
        }
      `;

            const filePath = path.join(tempDir, 'home.dart');
            await fs.writeFile(filePath, dartCode);

            const occurrences = await extractor.extractFromFile(filePath);

            expect(occurrences).toHaveLength(1);
            expect(occurrences[0].string).toBe('Welcome to App');
            expect(occurrences[0].key).toBe('welcomeToApp');
        });

        test('should extract AppBar title strings', async () => {
            const dartCode = `
        AppBar(
          title: Text('Home Screen'),
        )
      `;

            const filePath = path.join(tempDir, 'app_bar.dart');
            await fs.writeFile(filePath, dartCode);

            const occurrences = await extractor.extractFromFile(filePath);

            expect(occurrences).toHaveLength(1);
            expect(occurrences[0].string).toBe('Home Screen');
            expect(occurrences[0].widgetType).toBe('AppBar');
            expect(occurrences[0].key).toMatch(/title/i);
        });

        test('should extract TextField hint text', async () => {
            const dartCode = `
        TextField(
          hintText: 'Enter your email',
        )
      `;

            const filePath = path.join(tempDir, 'text_field.dart');
            await fs.writeFile(filePath, dartCode);

            const occurrences = await extractor.extractFromFile(filePath);

            expect(occurrences).toHaveLength(1);
            expect(occurrences[0].string).toBe('Enter your email');
            expect(occurrences[0].key).toMatch(/hint/i);
        });

        test('should convert string interpolation to ICU format', async () => {
            const dartCode = `
        Text('Hello \$userName')
        Text('Total: \${cart.total}')
      `;

            const filePath = path.join(tempDir, 'interpolation.dart');
            await fs.writeFile(filePath, dartCode);

            const occurrences = await extractor.extractFromFile(filePath);

            expect(occurrences).toHaveLength(2);

            const converted1 = extractor.convertInterpolation(occurrences[0].string);
            expect(converted1).toBe('Hello {userName}');

            const converted2 = extractor.convertInterpolation(occurrences[1].string);
            expect(converted2).toBe('Total: {total}');
        });

        test('should skip already localized files', async () => {
            const dartCode = `
        import 'package:flutter_gen/gen_l10n/app_localizations.dart';
        
        Text(AppLocalizations.of(context)!.welcomeMessage)
      `;

            const filePath = path.join(tempDir, 'localized.dart');
            await fs.writeFile(filePath, dartCode);

            const occurrences = await extractor.extractFromFile(filePath);

            expect(occurrences).toHaveLength(0);
        });

        test('should skip comments', async () => {
            const dartCode = `
        // This is a comment with Text('Should be ignored')
        /* Multi-line comment
           Text('Also ignored')
        */
        Text('This should be extracted')
      `;

            const filePath = path.join(tempDir, 'comments.dart');
            await fs.writeFile(filePath, dartCode);

            const occurrences = await extractor.extractFromFile(filePath);

            expect(occurrences).toHaveLength(1);
            expect(occurrences[0].string).toBe('This should be extracted');
        });
    });

    describe('generateKey', () => {
        test('should generate camelCase keys', () => {
            const occurrence = new StringOccurrence('Welcome to App', 'test.dart', 1, 'text', 'Text');
            expect(occurrence.key).toBe('welcomeToApp');
        });

        test('should add context prefix for hints', () => {
            const occurrence = new StringOccurrence('Enter email', 'test.dart', 1, 'textFieldHint', 'TextField');
            expect(occurrence.key).toMatch(/hint/i);
        });

        test('should add context prefix for titles', () => {
            const occurrence = new StringOccurrence('Home', 'test.dart', 1, 'appBarTitle', 'AppBar');
            expect(occurrence.key).toMatch(/title/i);
        });
    });

    describe('extractPlaceholders', () => {
        test('should extract placeholder information', () => {
            const placeholders = extractor.extractPlaceholders('Hello $userName, total: ${cart.total}');

            expect(placeholders).toHaveProperty('userName');
            expect(placeholders).toHaveProperty('total');
            expect(placeholders.userName.type).toBe('String');
            expect(placeholders.total.type).toBe('String');
        });

        test('should infer int type for count variables', () => {
            const placeholders = extractor.extractPlaceholders('You have $count items');

            expect(placeholders.count.type).toBe('int');
            expect(placeholders.count.example).toBe('5');
        });
    });
});
