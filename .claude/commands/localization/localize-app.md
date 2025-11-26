# Flutter App Localization - One Command Setup

Automatically localize an existing Flutter app with Arabic-English (ar-en) support in one command.

## Overview

This command will:
1. ✅ Scan your Flutter project for hardcoded strings
2. ✅ Generate ARB files (app_en.arb master, app_ar.arb translation)
3. ✅ Create l10n.yaml configuration
4. ✅ Update pubspec.yaml with dependencies
5. ✅ Generate comprehensive integration guide
6. ✅ Validate the entire setup

## Step 1: Validate Flutter Project

Check that the current directory is a valid Flutter project:
- `pubspec.yaml` exists
- `lib/` directory exists
- Contains `.dart` files

If not valid, show error message:
```
❌ Error: Not a Flutter project
Current directory: {current_dir}

Please cd to your Flutter project root directory and try again.
```

## Step 2: Scan for Hardcoded Strings

Scan all `.dart` files in `lib/` for hardcoded strings in:
- **Text widgets**: `Text('Hello')`, `Text("Welcome")`
- **AppBar titles**: `AppBar(title: Text('Home'))`
- **TextField hints**: `TextField(hintText: 'Enter email')`
- **Button labels**: `ElevatedButton(child: Text('Submit'))`
- **Dialog messages**: `AlertDialog(title: Text('Error'))`
- **SnackBar messages**: `SnackBar(content: Text('Saved'))`

**Exclusions**:
- Skip files using `AppLocalizations.of(context)`
- Skip comments and debug statements
- Skip generated files (*.g.dart, *.freezed.dart)
- Skip build/, .dart_tool/, generated/ directories

**String Interpolation**:
Convert Dart string interpolation to ICU MessageFormat:
- `"Hello $name"` → `"Hello {name}"`
- `"Total: ${cart.total}"` → `"Total: {total}"`

Track:
- Total unique strings found
- Number of files scanned

## Step 3: Generate ARB Files

### Master Template (app_en.arb):

```json
{
  "@@locale": "en",
  
  "keyName": "Original English string",
  "@keyName": {
    "description": "Context for translators",
    "placeholders": {
      "variableName": {
        "type": "String",
        "example": "John"
      }
    }
  }
}
```

**Key Generation Rules**:
- Convert to camelCase: "Welcome to App" → "welcomeToApp"
- Add context prefix:
  - Hints: "hintEnterEmail"
  - Titles: "titleHome"
  - Buttons: "buttonSubmit"
  - Errors: "errorInvalidInput"

**ICU MessageFormat**:
```json
"itemCount": "{count, plural, =0{No items} =1{One item} other{{count} items}}"
```

### Arabic Translation (app_ar.arb):

```json
{
  "@@locale": "ar",
  "textDirection": "rtl",
  "@textDirection": {
    "description": "Text direction for Arabic (rtl)"
  },
  
  "welcomeToApp": "مرحباً بك في التطبيق",
  "itemCount": "{count, plural, =0{لا توجد عناصر} =1{عنصر واحد} other{{count} عناصر}}"
}
```

If AI translation available, use it for Arabic. Otherwise, provide English placeholders.

## Step 4: Configure L10n

### Create `l10n.yaml`:

```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
output-class: AppLocalizations
nullable-getter: false
preferred-supported-locales: ['en']
```

### Update `pubspec.yaml`:

Add dependencies if not present:
```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: any

flutter:
  generate: true
```

## Step 5: Generate Integration Guide

Create `lib/l10n/integration_guide.md` with:

1. **Generated Files** - List all files created
2. **Statistics** - Strings extracted, files scanned, languages
3. **Setup Instructions**:
   - Run `flutter pub get`
   - Run `flutter gen-l10n`
   - Update MaterialApp:
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
         Locale('en'),
         Locale('ar'),
       ],
     )
     ```
4. **Usage Examples** - Before/after code samples
5. **RTL Testing Checklist** - For Arabic layout
6. **Translation Tips** - Work with native speakers
7. **Best Practices** - Never hardcode strings
8. **Troubleshooting** - Common issues
9. **Resources** - Links to docs

## Step 6: Validation

Run validation checks:
1. ✅ ARB files are valid JSON
2. ✅ All keys match across languages
3. ✅ ICU MessageFormat syntax correct
4. ✅ Placeholders consistent
5. ✅ @@locale keys present
6. ✅ l10n.yaml valid YAML
7. ✅ pubspec.yaml has required dependencies
8. ✅ flutter.generate = true

Show summary:
- ✅ X checks passed
- ⚠️  Y warnings
- ❌ Z errors (with fix instructions)

## Step 7: Generate Report

```
✅ Localization Setup Complete!

📊 Statistics:
- Strings extracted: 47
- Files scanned: 12
- ARB files generated: 2 (en, ar)
- Configuration files: 3

📁 Generated Files:
  📝 lib/l10n/app_en.arb (master template)
  🌍 lib/l10n/app_ar.arb (Arabic translations)
  ⚙️  l10n.yaml
  📄 pubspec.yaml (updated)
  📖 lib/l10n/integration_guide.md

🌍 Languages:
  📝 English (en) - Master
  🌍 Arabic (ar) - RTL enabled

✅ Validation: All checks passed

📚 Next Steps:
  1. Review: lib/l10n/app_ar.arb
  2. Run: flutter pub get
  3. Run: flutter gen-l10n
  4. Update MaterialApp
  5. Replace hardcoded strings
  6. Test Arabic (RTL) layout

Ready for multi-language support! 🚀
```

## Error Handling

- Not a Flutter project → clear error message
- No strings found → info message
- Permission denied → suggest proper permissions
- Invalid language code → list supported languages

## Success Criteria

✅ All strings extracted
✅ Valid ARB files generated
✅ Configuration created
✅ Integration guide generated
✅ Validation passed
✅ Clear next steps provided
