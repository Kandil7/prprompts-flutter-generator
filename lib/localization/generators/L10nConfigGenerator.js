/**
 * L10nConfigGenerator - Generates l10n.yaml, updates pubspec.yaml, and MaterialApp config
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { createModuleLogger } = require('../../utils/logger');
const logger = createModuleLogger('L10nConfigGenerator');

class L10nConfigGenerator {
    constructor(options = {}) {
        this.options = {
            arbDir: options.arbDir || 'lib/l10n',
            templateArbFile: options.templateArbFile || 'app_en.arb',
            outputClass: options.outputClass || 'AppLocalizations',
            nullableGetter: options.nullableGetter !== undefined ? options.nullableGetter : false,
            ...options
        };
    }

    /**
     * Generate l10n.yaml configuration
     */
    generateL10nYaml(languages, options = {}) {
        const config = {
            'arb-dir': this.options.arbDir,
            'template-arb-file': this.options.templateArbFile,
            'output-localization-file': 'app_localizations.dart',
            'output-class': this.options.outputClass,
            'nullable-getter': this.options.nullableGetter,
            'preferred-supported-locales': [languages[0]] // First language is preferred
        };

        return yaml.dump(config);
    }

    /**
     * Save l10n.yaml to project root
     */
    async saveL10nYaml(projectPath, languages) {
        const yamlContent = this.generateL10nYaml(languages);
        const outputPath = path.join(projectPath, 'l10n.yaml');

        await fs.writeFile(outputPath, yamlContent, 'utf8');
        logger.info(`Created l10n.yaml at ${outputPath}`);

        return outputPath;
    }

    /**
     * Update pubspec.yaml with localization dependencies
     */
    async updatePubspecYaml(projectPath) {
        const pubspecPath = path.join(projectPath, 'pubspec.yaml');

        // Read existing pubspec.yaml
        const content = await fs.readFile(pubspecPath, 'utf8');
        const pubspec = yaml.load(content);

        // Add dependencies if not present
        if (!pubspec.dependencies) {
            pubspec.dependencies = {};
        }

        let modified = false;

        // Add flutter_localizations
        if (!pubspec.dependencies.flutter_localizations) {
            pubspec.dependencies.flutter_localizations = { sdk: 'flutter' };
            modified = true;
            logger.info('Added flutter_localizations dependency');
        }

        // Add intl
        if (!pubspec.dependencies.intl) {
            pubspec.dependencies.intl = 'any';
            modified = true;
            logger.info('Added intl dependency');
        }

        // Enable code generation
        if (!pubspec.flutter) {
            pubspec.flutter = {};
        }

        if (!pubspec.flutter.generate) {
            pubspec.flutter.generate = true;
            modified = true;
            logger.info('Enabled flutter code generation');
        }

        // Save updated pubspec.yaml
        if (modified) {
            const newContent = yaml.dump(pubspec, {
                lineWidth: -1, // Prevent line wrapping
                noRefs: true
            });

            await fs.writeFile(pubspecPath, newContent, 'utf8');
            logger.info('Updated pubspec.yaml');
        } else {
            logger.info('pubspec.yaml already configured');
        }

        return modified;
    }

    /**
     * Generate MaterialApp configuration code snippet
     */
    generateMaterialAppConfig(languages) {
        const languageCodes = languages.map(lang => `    Locale('${lang}'), // ${this.getLanguageName(lang)}`).join('\n');

        return `// Add these imports at the top of your main.dart file:
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

// Update your MaterialApp configuration:
MaterialApp(
  // Add localization delegates
  localizationsDelegates: [
    ${this.options.outputClass}.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ],
  
  // Add supported locales
  supportedLocales: [
${languageCodes}
  ],
  
  // Set default locale (optional)
  locale: Locale('${languages[0]}'),
  
  // Your existing configuration
  title: 'Your App',
  theme: ThemeData(
    // ...
  ),
  home: YourHomePage(),
);`;
    }

    /**
     * Generate integration guide
     */
    generateIntegrationGuide(languages, stats = {}) {
        const { stringsCount = 0, filesCount = 0 } = stats;

        return `# Flutter Localization Integration Guide

## Generated Files

This localization setup has been automatically generated for your Flutter app.

### ARB Files (lib/l10n/)
${languages.map(lang => `- \`app_${lang}.arb\` - ${this.getLanguageName(lang)} translations`).join('\n')}

### Configuration Files
- \`l10n.yaml\` - Flutter localization configuration
- \`pubspec.yaml\` - Updated with dependencies

## Statistics

- **Strings extracted**: ${stringsCount}
- **Files scanned**: ${filesCount}
- **Languages configured**: ${languages.join(', ')}

---

## Step 1: Generate Localization Code

Run the following commands in your terminal:

\`\`\`bash
# Install dependencies
flutter pub get

# Generate localization code
flutter gen-l10n
\`\`\`

This will generate:
- \`.dart_tool/flutter_gen/gen_l10n/app_localizations.dart\`
- Language-specific files for each locale

---

## Step 2: Update MaterialApp

Add the following configuration to your \`main.dart\` file:

\`\`\`dart
${this.generateMaterialAppConfig(languages)}
\`\`\`

---

## Step 3: Use Localized Strings

Replace hardcoded strings in your widgets with localized versions:

### Before:
\`\`\`dart
Text('Welcome')
AppBar(title: Text('Home'))
TextField(hintText: 'Enter email')
\`\`\`

### After:
\`\`\`dart
Text(${this.options.outputClass}.of(context)!.welcomeMessage)
AppBar(title: Text(${this.options.outputClass}.of(context)!.titleHome))
TextField(hintText: ${this.options.outputClass}.of(context)!.hintEnterEmail)
\`\`\`

### With String Interpolation:
\`\`\`dart
// ARB file: "welcomeUser": "Welcome, {userName}!"
Text(${this.options.outputClass}.of(context)!.welcomeUser(userName: user.name))
\`\`\`

---

## Step 4: Test Localization

### Test Default Language (${languages[0]}):
Your app should work as before with English strings.

### Test ${languages.length > 1 ? 'Arabic (ar)' : 'Other Languages'}:
${languages.includes('ar') ? `
Change the locale to Arabic to test RTL (Right-to-Left) layout:

\`\`\`dart
MaterialApp(
  locale: Locale('ar'), // Switch to Arabic
  // ...
)
\`\`\`

**RTL Testing Checklist**:
- ✅ Text flows right-to-left
- ✅ Icons and buttons mirror correctly
- ✅ Navigation drawer opens from right
- ✅ App bar actions are on the left
` : `
Test each language by changing the \`locale\` parameter in MaterialApp.
`}

---

## Step 5: Update Translations

### English (Master Template):
Edit \`lib/l10n/app_en.arb\` to update strings or add new ones.

${languages.includes('ar') ? `### Arabic:
Edit \`lib/l10n/app_ar.arb\` to provide Arabic translations.

**Translation Tips**:
- Work with a native Arabic speaker for quality translations
- Consider regional variations (Egyptian, Gulf, Levantine)
- Test with actual Arabic users for cultural appropriateness
- Use proper Arabic typography and diacritics
` : ''}

After updating ARB files, run:
\`\`\`bash
flutter gen-l10n
\`\`\`

---

## Best Practices

### 1. Always Use Localized Strings
Never hardcode user-facing strings in Dart code. Always add them to ARB files.

### 2. Provide Context in Metadata
Update \`@keyName\` descriptions in \`app_en.arb\` to help translators understand context.

### 3. Handle Plurals Correctly
Use ICU MessageFormat for plurals:
\`\`\`json
"itemCount": "{count, plural, =0{No items} =1{One item} other{{count} items}}"
\`\`\`

### 4. Test All Locales
Create tests for each locale to ensure translations work correctly.

${languages.includes('ar') ? `### 5. RTL Layout Testing
Always test Arabic layout on real devices or emulators to catch layout issues.

### 6. Font Support
Ensure your app includes fonts that support Arabic characters:
\`\`\`yaml
# pubspec.yaml
flutter:
  fonts:
    - family: NotoSansArabic
      fonts:
        - asset: fonts/NotoSansArabic-Regular.ttf
        - asset: fonts/NotoSansArabic-Bold.ttf
          weight: 700
\`\`\`
` : ''}

---

## Troubleshooting

### Issue: "gen-l10n command not found"
**Solution**: Run \`flutter pub get\` first.

### Issue: ARB file syntax errors
**Solution**: Validate JSON syntax using an online JSON validator.

### Issue: Missing translations
**Solution**: Ensure all keys in \`app_en.arb\` exist in all other ARB files.

${languages.includes('ar') ? `### Issue: Arabic text displaying as boxes
**Solution**: Add Arabic font support to your \`pubspec.yaml\`.

### Issue: RTL layout not working
**Solution**: Verify \`MaterialApp\` has proper localization delegates configured.
` : ''}

---

## Resources

- [Flutter Internationalization Guide](https://flutter.dev/docs/development/accessibility-and-localization/internationalization)
- [ARB File Format](https://github.com/google/app-resource-bundle)
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
${languages.includes('ar') ? '- [Arabic Typography Guide](https://www.w3.org/International/articles/arabic-type/)\n- [RTL Layout Best Practices](https://material.io/design/usability/bidirectionality.html)' : ''}

---

## Next Steps

1. ✅ Run \`flutter pub get\`
2. ✅ Run \`flutter gen-l10n\`
3. ✅ Update MaterialApp configuration
4. ✅ Replace hardcoded strings with ${this.options.outputClass}.of(context)
5. ✅ Test all locales
6. ✅ Review and refine translations

Happy localizing! 🌍
`;
    }

    /**
     * Get full language name from code
     */
    getLanguageName(code) {
        const languageNames = {
            en: 'English',
            ar: 'Arabic (العربية)',
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

        return languageNames[code] || code.toUpperCase();
    }

    /**
     * Save integration guide to project
     */
    async saveIntegrationGuide(projectPath, languages, stats) {
        const guideContent = this.generateIntegrationGuide(languages, stats);
        const outputPath = path.join(projectPath, this.options.arbDir, 'integration_guide.md');

        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, guideContent, 'utf8');
        logger.info(`Created integration guide at ${outputPath}`);

        return outputPath;
    }
}

module.exports = { L10nConfigGenerator };
