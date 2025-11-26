# Flutter App Localization - Quick Start Example

This example demonstrates how to use the PRPROMPTS localization feature to add Arabic-English (ar-en) support to a Flutter app.

## Sample Flutter App

Let's say you have a simple Flutter app with hardcoded strings:

```dart
// lib/main.dart
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      home: HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Welcome to My App',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Login logic
              },
              child: Text('Login'),
            ),
            TextField(
              decoration: InputDecoration(
                hintText: 'Enter your email',
                labelText: 'Email',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Step 1: Run Localization Command

```bash
cd your-flutter-project
gemini-localize
```

## Step 2: What Gets Generated

### File 1: `lib/l10n/app_en.arb` (English Master Template)

```json
{
  "@@locale": "en",
  "appTitle": "My App",
  "@appTitle": {
    "description": "Application title"
  },
  "titleHome": "Home",
  "@titleHome": {
    "description": "Home screen title"
  },
  "welcomeToMyApp": "Welcome to My App",
  "@welcomeToMyApp": {
    "description": "Welcome message on home screen"
  },
  "buttonLogin": "Login",
  "@buttonLogin": {
    "description": "Login button text"
  },
  "hintEnterEmail": "Enter your email",
  "@hintEnterEmail": {
    "description": "Email input hint text"
  },
  "labelEmail": "Email",
  "@labelEmail": {
    "description": "Email input label"
  }
}
```

### File 2: `lib/l10n/app_ar.arb` (Arabic Translations)

```json
{
  "@@locale": "ar",
  "textDirection": "rtl",
  "@textDirection": {
    "description": "Text direction for Arabic"
  },
  "appTitle": "تطبيقي",
  "titleHome": "الرئيسية",
  "welcomeToMyApp": "مرحباً بك في تطبيقي",
  "buttonLogin": "تسجيل الدخول",
  "hintEnterEmail": "أدخل بريدك الإلكتروني",
  "labelEmail": "البريد الإلكتروني"
}
```

### File 3: `l10n.yaml`

```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
output-class: AppLocalizations
nullable-getter: false
preferred-supported-locales: ['en']
```

### File 4: `pubspec.yaml` (Updated)

```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: any

flutter:
  generate: true
```

## Step 3: Generate Localization Code

```bash
flutter pub get
flutter gen-l10n
```

This generates:
- `.dart_tool/flutter_gen/gen_l10n/app_localizations.dart`
- `.dart_tool/flutter_gen/gen_l10n/app_localizations_en.dart`
- `.dart_tool/flutter_gen/gen_l10n/app_localizations_ar.dart`

## Step 4: Update Your App

### Update `main.dart`:

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // Add localization delegates
      localizationsDelegates: [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      // Add supported locales
      supportedLocales: [
        Locale('en'), // English
        Locale('ar'), // Arabic
      ],
      // Set default locale
      locale: Locale('en'),
      title: 'My App',
      home: HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.titleHome),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              l10n.welcomeToMyApp,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Login logic
              },
              child: Text(l10n.buttonLogin),
            ),
            TextField(
              decoration: InputDecoration(
                hintText: l10n.hintEnterEmail,
                labelText: l10n.labelEmail,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Step 5: Test Different Locales

### English (Default):

```dart
MaterialApp(
  locale: Locale('en'),
  // ...
)
```

### Arabic (RTL):

```dart
MaterialApp(
  locale: Locale('ar'),
  // ...
)
```

## Step 6: Dynamic Locale Switching (Optional)

```dart
class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Locale _locale = Locale('en');

  void setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      locale: _locale,
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
      home: HomePage(onLocaleChange: setLocale),
    );
  }
}

class HomePage extends StatelessWidget {
  final Function(Locale) onLocaleChange;

  HomePage({required this.onLocaleChange});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.titleHome),
        actions: [
          IconButton(
            icon: Icon(Icons.language),
            onPressed: () {
              // Toggle between English and Arabic
              final newLocale = Localizations.localeOf(context).languageCode == 'en'
                  ? Locale('ar')
                  : Locale('en');
              onLocaleChange(newLocale);
            },
          ),
        ],
      ),
      // ... rest of UI
    );
  }
}
```

## Command Options

### With AI Translation
```bash
gemini-localize --ai gemini
```
This will automatically translate all strings to Arabic using Gemini AI.

### Multiple Languages
```bash
gemini-localize --languages en,ar,fr
```
Adds French support as well.

### Dry Run (Preview Only)
```bash
gemini-localize --dry-run
```
Shows what would be generated without writing files.

### Verbose Mode
```bash
gemini-localize --verbose
```
Shows detailed logging of the extraction and generation process.

## RTL Layout Best Practices

When supporting Arabic, follow these RTL best practices:

### ✅ DO:
```dart
// Use EdgeInsetsDirectional (adapts to RTL)
Padding(
  padding: EdgeInsetsDirectional.only(start: 16, end: 8),
  child: Text('Content'),
)

// Get direction from context
Directionality.of(context)
```

### ❌ DON'T:
```dart
// Don't use EdgeInsets.only (hardcoded LTR)
Padding(
  padding: EdgeInsets.only(left: 16, right: 8),
  child: Text('Content'),
)

// Don't hardcode text direction
TextDirection.ltr
```

## Output Summary

After running `gemini-localize`, you'll see:

```
🌍 Starting Flutter app localization...

✅ Flutter project validated

📖 Extracting strings from Dart files...
✅ Found 6 strings in 1 files

🏗️  Generating ARB files...
✅ Generated 2 ARB files

⚙️  Generating configuration files...
✅ Created 3 configuration files

🔍 Validating localization setup...
✅ Validation passed (0 warnings, 0 info)

💾 Writing files...
✅ Wrote 2 files

📊 Generating report...

✅ Localization Setup Complete!

📊 Statistics:
- Files scanned: 1
- Strings extracted: 6
- ARB files generated: 2 (en, ar)
- Configuration files: 3
- Languages: en, ar
- Duration: 1.2s

📁 Generated Files:
  📝 lib/l10n/app_en.arb (master template)
  🌍 lib/l10n/app_ar.arb (Arabic translations)
  ⚙️  l10n.yaml
  📄 pubspec.yaml (updated)
  📖 lib/l10n/integration_guide.md

🌍 Languages Configured:
  📝 English (en) - Master template
  🌍 Arabic (ar) - RTL support enabled

✅ Validation: All checks passed

📚 Next Steps:
  1. Review translations in lib/l10n/app_ar.arb
  2. Run: flutter pub get
  3. Run: flutter gen-l10n
  4. Update MaterialApp (see integration_guide.md)
  5. Replace hardcoded strings
  6. Test Arabic (RTL) layout

📖 Complete instructions: lib/l10n/integration_guide.md

Ready for multi-language support! 🚀
```

## Time Saved

- **Manual localization**: 2-3 hours
- **With gemini-localize**: < 2 minutes
- **Time saved**: 98%+ 🎉

## Next Steps

1. Review the generated ARB files for accuracy
2. Run `flutter pub get` and `flutter gen-l10n`
3. Update your MaterialApp as shown above
4. Replace hardcoded strings with `AppLocalizations.of(context)!.keyName`
5. Test with both English and Arabic locales
6. Get feedback from native Arabic speakers

## Resources

- [docs/LOCALIZATION.md](../docs/LOCALIZATION.md) - Complete documentation
- [Flutter Internationalization Guide](https://flutter.dev/docs/development/accessibility-and-localization/internationalization)
- [ARB File Format](https://github.com/google/app-resource-bundle)
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/)

---

**Ready to localize your Flutter app! 🌍🚀**
