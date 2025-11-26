# Flutter Localization Feature

Complete one-command localization system for Flutter apps with Arabic-English (ar-en) support and RTL layout configuration.

## Features

- ✅ **Automatic String Extraction**: Scans all `.dart` files for hardcoded strings
- ✅ **ARB File Generation**: Creates `app_en.arb` (master) and `app_ar.arb` (translation)
- ✅ **ICU MessageFormat**: Handles placeholders and string interpolation
- ✅ **RTL Support**: Configures Right-to-Left layout for Arabic
- ✅ **AI Translation**: Optional AI-powered Arabic translations (Gemini, Claude, Qwen)
- ✅ **Validation**: Comprehensive validation of ARB files and configuration
- ✅ **Integration Guide**: Step-by-step instructions for implementation

## Quick Start

### Using Gemini CLI (Recommended)

```bash
cd your-flutter-project
gemini localize
```

### Using Traditional CLI

```bash
cd your-flutter-project
gemini-localize
```

### With AI Translation

```bash
gemini-localize --ai gemini
```

## Command Options

```
Usage: gemini-localize [options]

Options:
  -l, --languages <codes>    Comma-separated language codes (default: "en,ar")
  --ai <provider>            AI provider for translation (gemini|claude|qwen|none)
  --dry-run                  Preview changes without writing files
  --validate                 Run validation after generation (default: true)
  -v, --verbose              Verbose logging
  -o, --output-dir <path>    ARB files output directory (default: "lib/l10n")
  -h, --help                 Display help
  --version                  Display version

Examples:
  gemini-localize                        # en-ar localization
  gemini-localize --languages en,ar,fr   # Add French
  gemini-localize --ai gemini            # AI-powered translation
  gemini-localize --dry-run              # Preview only
```

## What It Does

### 1. Scans Flutter Project

Scans all `.dart` files in `lib/` for hardcoded strings in:
- `Text()` widgets
- `AppBar(title:)` 
- `TextField(hintText:)`
- `ElevatedButton(child:)`
- `AlertDialog()` messages
- `SnackBar()` content

### 2. Generates ARB Files

**English (Master Template)** - `lib/l10n/app_en.arb`:
```json
{
  "@@locale": "en",
  "welcomeMessage": "Welcome to App",
  "@welcomeMessage": {
    "description": "Displayed on home screen",
    "placeholders": {}
  }
}
```

**Arabic (Translation)** - `lib/l10n/app_ar.arb`:
```json
{
  "@@locale": "ar",
  "textDirection": "rtl",
  "welcomeMessage": "مرحباً بك في التطبيق"
}
```

### 3. Configures L10n

Creates/updates:
- `l10n.yaml` - Flutter localization configuration
- `pubspec.yaml` - Adds `flutter_localizations` and `intl` dependencies
- `lib/l10n/integration_guide.md` - Complete setup instructions

### 4. Validates Setup

Checks:
- ✅ ARB files are valid JSON
- ✅ All keys present in both languages
- ✅ ICU MessageFormat syntax correct
- ✅ Placeholders match across files
- ✅ Configuration files valid

## Generated Files

```
your-flutter-project/
├── lib/
│   └── l10n/
│       ├── app_en.arb              # English master template
│       ├── app_ar.arb              # Arabic translations
│       └── integration_guide.md   # Setup instructions
├── l10n.yaml                       # L10n configuration
└── pubspec.yaml                    # Updated with dependencies
```

## Next Steps After Generation

### 1. Generate Localization Code

```bash
flutter pub get
flutter gen-l10n
```

### 2. Update MaterialApp

```dart
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

MaterialApp(
  localizationsDelegates: [
    AppLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ],
  supportedLocales: [
    Locale('en'), // English
    Locale('ar'), // Arabic
  ],
  locale: Locale('en'), // Default locale
  // ... rest of config
)
```

### 3. Replace Hardcoded Strings

```dart
// Before:
Text('Welcome')

// After:
Text(AppLocalizations.of(context)!.welcomeMessage)
```

### 4. Test RTL Layout

```dart
// In MaterialApp:
locale: Locale('ar')  // Switch to Arabic
```

## AI Translation

When using `--ai` flag, the command:
- Automatically translates all English strings to Arabic
- Preserves placeholders: `{variable}`
- Maintains ICU MessageFormat structure
- Uses culturally appropriate translations

```bash
gemini-localize --ai gemini
```

## String Interpolation

Dart string interpolation is automatically converted to ICU MessageFormat:

```dart
// Dart code:
Text('Hello $userName')
Text('Total: ${cart.total}')

// Generated ARB:
"greeting": "Hello {userName}",
"totalAmount": "Total: {total}"
```

## ICU MessageFormat

Plural forms are supported:

```json
"itemCount": "{count, plural, =0{No items} =1{One item} other{{count} items}}"
```

Usage:
```dart
Text(AppLocalizations.of(context)!.itemCount(5))  // "5 items"
```

## RTL Layout Best Practices

### Use EdgeInsetsDirectional

```dart
// ❌ DON'T:
Padding(padding: EdgeInsets.only(left: 16))

// ✅ DO:
Padding(padding: EdgeInsetsDirectional.only(start: 16))
```

### Let Flutter Handle Direction

```dart
// ✅ DO:
Directionality.of(context)  // Adapts to locale

// ❌ DON'T:
TextDirection.ltr  // Hardcoded
```

## Troubleshooting

### "gen-l10n command not found"
Run `flutter pub get` first.

### ARB file syntax  errors
Use an online JSON validator to check syntax.

### Missing translations
Ensure all keys from `app_en.arb` exist in `app_ar.arb`.

### Arabic text showing as boxes
Add Arabic font support in `pubspec.yaml`:
```yaml
flutter:
  fonts:
    - family: NotoSansArabic
      fonts:
        - asset: fonts/NotoSansArabic-Regular.ttf
```

## Architecture

The localization system consists of:

1. **StringExtractor**: AST-based extraction of hardcoded strings
2. **ARBGenerator**: Creation of valid ARB files with metadata
3. **L10nConfigGenerator**: Configuration file generation
4. **LocalizationValidator**: Comprehensive validation
5. **TranslationService**: AI-powered translation (optional)
6. **LocalizeCommand**: Main orchestrator

## Testing

Run localization tests:

```bash
npm test -- --testPathPattern=localization
```

## Integration with PRPROMPTS

If you have PRPROMPTS generated, the localization command can also update:

```bash
gemini /localization/update-prprompts
```

This updates `PRPROMPTS/09-internationalization_i18n.md` with:
- ar-en specific examples
- RTL best practices
- Arabic typography guidance
- Validation gates

## Resources

- [Flutter Internationalization Guide](https://flutter.dev/docs/development/accessibility-and-localization/internationalization)
- [ARB File Format](https://github.com/google/app-resource-bundle)
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Arabic Typography Guide](https://www.w3.org/International/articles/arabic-type/)
- [RTL Layout Best Practices](https://material.io/design/usability/bidirectionality.html)

## Version History

### v5.2.0 (Current)
- ✅ Initial release of localization feature
- ✅ ar-en support with RTL layout
- ✅ AI-powered translation (Gemini, Claude, Qwen)
- ✅ Comprehensive validation
- ✅ Integration guide generation

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## Support

- Issues: https://github.com/Kandil7/prprompts-flutter-generator/issues
- Discussions: https://github.com/Kandil7/prprompts-flutter-generator/discussions

---

**Ready to localize your Flutter app! 🌍🚀**
