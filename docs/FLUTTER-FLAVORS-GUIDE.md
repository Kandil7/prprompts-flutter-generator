# Flutter Flavors Guide for PRPROMPTS Projects

> **Complete guide to using Flutter flavors with PRPROMPTS Flutter Generator**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Integration with PRPROMPTS Workflow](#integration-with-prprompts-workflow)
4. [PRD Configuration](#prd-configuration)
5. [Automated Setup](#automated-setup)
6. [Manual Configuration](#manual-configuration)
7. [Building & Running](#building--running)
8. [CI/CD Integration](#cicd-integration)
9. [Common Use Cases](#common-use-cases)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

Flutter flavors allow you to create multiple versions of your app (dev, staging, production) with different configurations, API endpoints, app names, and bundle IDs - all from a single codebase.

### Why Use Flavors with PRPROMPTS?

- ✅ **Separate environments** - Dev, staging, and production with different backends
- ✅ **Parallel testing** - Test production build while developing in dev
- ✅ **Safe deployments** - Never accidentally deploy dev code to production
- ✅ **Environment-specific features** - Enable/disable features per environment
- ✅ **Compliance ready** - Different security levels per environment

---

## Quick Start

### 1. Add Environments to PRD

Edit `docs/PRD.md` and add environments metadata:

```yaml
---
# ... existing metadata ...

environments:
  - dev
  - staging
  - production

environment_config:
  dev:
    api_url: "https://dev-api.myapp.com"
    enable_analytics: false
    enable_logging: true
  staging:
    api_url: "https://staging-api.myapp.com"
    enable_analytics: true
    enable_logging: true
  production:
    api_url: "https://api.myapp.com"
    enable_analytics: true
    enable_logging: false
---
```

### 2. Run Flutter Flavors Skill

```bash
@claude use skill development-workflow/flutter-flavors
```

This automatically:
- ✅ Creates `lib/main_dev.dart`, `lib/main_staging.dart`, `lib/main_production.dart`
- ✅ Creates `lib/main_common.dart` with shared logic
- ✅ Configures Android `build.gradle` with productFlavors
- ✅ Generates build scripts for each flavor
- ✅ Creates VS Code launch configurations

### 3. Run Your Flavor

```bash
# Development
flutter run --flavor dev -t lib/main_dev.dart

# Staging
flutter run --flavor staging -t lib/main_staging.dart

# Production
flutter run --flavor production -t lib/main_production.dart
```

---

## Integration with PRPROMPTS Workflow

### Standard Workflow (Without Flavors)

```
1. Create PRD          → @claude use skill prd-creator
2. Generate PRPROMPTS  → @claude use skill prprompts-generator
3. Bootstrap Project   → @claude use skill flutter-bootstrapper
4. Develop Features    → Manual coding or automation skills
```

### Enhanced Workflow (With Flavors)

```
1. Create PRD          → @claude use skill prd-creator
   ↓
   Add environments metadata to PRD
   ↓
2. Generate PRPROMPTS  → @claude use skill prprompts-generator
   ↓
3. Bootstrap Project   → @claude use skill flutter-bootstrapper
   ↓
   (Automatically sets up basic flavors if PRD has environments)
   ↓
4. Setup Flavors       → @claude use skill development-workflow/flutter-flavors
   ↓
   (Complete flavor setup with iOS, Android, build scripts)
   ↓
5. Develop Features    → Manual coding or automation skills
```

---

## PRD Configuration

### Minimal Configuration

```yaml
---
project_name: "My App"
environments:
  - dev
  - staging
  - production
---
```

### Full Configuration

```yaml
---
project_name: "ERP System"
project_description: "Enterprise resource planning system"

# Define environments
environments:
  - dev
  - staging
  - production

# Environment-specific configuration
environment_config:
  dev:
    api_url: "https://dev-api.erpsystem.com"
    enable_analytics: false
    enable_logging: true
    enable_crashlytics: false
    session_timeout_minutes: 1440  # 24 hours
    mock_data: true

  staging:
    api_url: "https://staging-api.erpsystem.com"
    enable_analytics: true
    enable_logging: true
    enable_crashlytics: true
    session_timeout_minutes: 60
    mock_data: false

  production:
    api_url: "https://api.erpsystem.com"
    enable_analytics: true
    enable_logging: false
    enable_crashlytics: true
    session_timeout_minutes: 15
    mock_data: false

# Compliance settings (apply to production only)
compliance:
  - soc2
  - iso27001
  - gdpr

# Platform configuration
platforms:
  - ios
  - android
  - web

# Authentication
auth_method: jwt

# State management
state_management: bloc
---
```

### Industry-Specific Examples

**Healthcare (HIPAA)**

```yaml
environment_config:
  dev:
    api_url: "https://dev-api.healthapp.com"
    encrypt_phi: false          # Faster dev, uses mock data
    audit_logging: false
    require_biometrics: false

  production:
    api_url: "https://api.healthapp.com"
    encrypt_phi: true           # AES-256-GCM for PHI
    audit_logging: true         # Log all PHI access
    require_biometrics: true
    session_timeout_minutes: 15 # HIPAA-compliant timeout
```

**FinTech (PCI-DSS)**

```yaml
environment_config:
  dev:
    api_url: "https://dev-api.fintech.com"
    use_stripe_sandbox: true    # Test mode
    kyc_required: false
    transaction_limit: 999999

  production:
    api_url: "https://api.fintech.com"
    use_stripe_sandbox: false   # Live mode
    kyc_required: true
    transaction_limit: 10000    # Daily limit
```

---

## Automated Setup

### Using flutter-bootstrapper (Recommended)

If your PRD includes `environments`, the `flutter-bootstrapper` skill automatically creates basic flavor configuration:

```bash
@claude use skill flutter-bootstrapper
```

**What it creates:**
- ✅ `lib/core/config/flavor_config.dart` - FlavorConfig class
- ✅ `lib/main_common.dart` - Shared entry point
- ✅ `lib/main_dev.dart`, `lib/main_staging.dart`, `lib/main_production.dart` - Flavor entry points
- ✅ Android `build.gradle` with productFlavors
- ✅ Build scripts (`scripts/build-dev.sh`, etc.)
- ✅ VS Code launch configurations

### Using flutter-flavors Skill (Complete Setup)

For complete flavor setup including iOS configuration:

```bash
@claude use skill development-workflow/flutter-flavors
```

**Additional features:**
- ✅ iOS Xcode scheme configuration
- ✅ Flavor-specific app icons setup
- ✅ Advanced build scripts (Windows + macOS)
- ✅ Environment-specific resource directories

---

## Manual Configuration

### 1. Create Flavor Config Class

**File:** `lib/core/config/flavor_config.dart`

```dart
enum Flavor {
  dev,
  staging,
  production,
}

class FlavorConfig {
  final Flavor flavor;
  final String apiBaseUrl;
  final bool enableAnalytics;
  final bool enableLogging;
  final String appName;

  const FlavorConfig({
    required this.flavor,
    required this.apiBaseUrl,
    required this.enableAnalytics,
    required this.enableLogging,
    required this.appName,
  });

  static FlavorConfig? _instance;

  static FlavorConfig get instance {
    assert(_instance != null, 'FlavorConfig not initialized');
    return _instance!;
  }

  static void initialize(FlavorConfig config) {
    _instance = config;
  }

  bool get isDev => flavor == Flavor.dev;
  bool get isStaging => flavor == Flavor.staging;
  bool get isProduction => flavor == Flavor.production;
}
```

### 2. Create Common Entry Point

**File:** `lib/main_common.dart`

```dart
import 'package:flutter/material.dart';
import 'core/config/flavor_config.dart';

void mainCommon(FlavorConfig config) {
  FlavorConfig.initialize(config);
  runApp(MyApp(config: config));
}

class MyApp extends StatelessWidget {
  final FlavorConfig config;

  const MyApp({Key? key, required this.config}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: config.appName,
      debugShowCheckedModeBanner: !config.isProduction,
      theme: ThemeData(
        primarySwatch: _getThemeColor(),
      ),
      home: HomePage(),
    );
  }

  MaterialColor _getThemeColor() {
    switch (config.flavor) {
      case Flavor.dev:
        return Colors.green;
      case Flavor.staging:
        return Colors.orange;
      case Flavor.production:
        return Colors.blue;
    }
  }
}
```

### 3. Create Flavor Entry Points

**File:** `lib/main_dev.dart`

```dart
import 'main_common.dart';
import 'core/config/flavor_config.dart';

void main() {
  const environment = FlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.myapp.com',
    enableAnalytics: false,
    enableLogging: true,
    appName: 'MyApp Dev',
  );

  mainCommon(environment);
}
```

Repeat for `main_staging.dart` and `main_production.dart` with appropriate values.

### 4. Configure Android

**File:** `android/app/build.gradle`

```gradle
android {
    // ... existing config ...

    flavorDimensions "environment"

    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            resValue "string", "app_name", "MyApp Dev"
        }

        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            resValue "string", "app_name", "MyApp Staging"
        }

        production {
            dimension "environment"
            resValue "string", "app_name", "MyApp"
        }
    }
}
```

**File:** `android/app/src/main/AndroidManifest.xml`

```xml
<application
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher">
```

### 5. Configure iOS

Open `ios/Runner.xcworkspace` in Xcode and follow the iOS configuration instructions in the flutter-flavors skill README.

---

## Building & Running

### Development

```bash
# Run on device/emulator
flutter run --flavor dev -t lib/main_dev.dart

# Build debug APK
flutter build apk --flavor dev -t lib/main_dev.dart --debug

# Build debug iOS
flutter build ios --flavor dev -t lib/main_dev.dart --debug --no-codesign
```

### Staging

```bash
# Run on device/emulator
flutter run --flavor staging -t lib/main_staging.dart

# Build release APK
flutter build apk --flavor staging -t lib/main_staging.dart --release

# Build release iOS
flutter build ios --flavor staging -t lib/main_staging.dart --release
```

### Production

```bash
# Build app bundle for Play Store
flutter build appbundle --flavor production -t lib/main_production.dart --release

# Build iOS for App Store
flutter build ios --flavor production -t lib/main_production.dart --release

# Build web
flutter build web --flavor production -t lib/main_production.dart --release
```

### Using Build Scripts

```bash
# Mac/Linux
sh scripts/build-dev.sh
sh scripts/build-staging.sh
sh scripts/build-production.sh

# Windows
scripts\build-dev.bat
scripts\build-staging.bat
scripts\build-production.bat
```

---

## CI/CD Integration

### GitHub Actions

**File:** `.github/workflows/multi-flavor-build.yml`

```yaml
name: Multi-Flavor Build

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  build-android:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        flavor: [dev, staging, production]

    steps:
      - uses: actions/checkout@v3

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'

      - name: Install dependencies
        run: flutter pub get

      - name: Build APK
        run: |
          flutter build apk \
            --flavor ${{ matrix.flavor }} \
            -t lib/main_${{ matrix.flavor }}.dart \
            --release

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-${{ matrix.flavor }}-release
          path: build/app/outputs/flutter-apk/app-${{ matrix.flavor }}-release.apk

  build-ios:
    runs-on: macos-latest
    strategy:
      matrix:
        flavor: [dev, staging, production]

    steps:
      - uses: actions/checkout@v3

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'

      - name: Install dependencies
        run: flutter pub get

      - name: Build iOS
        run: |
          flutter build ios \
            --flavor ${{ matrix.flavor }} \
            -t lib/main_${{ matrix.flavor }}.dart \
            --release \
            --no-codesign

      - name: Upload IPA
        uses: actions/upload-artifact@v3
        with:
          name: app-${{ matrix.flavor }}-ios
          path: build/ios/iphoneos/Runner.app
```

---

## Common Use Cases

### 1. Using Flavor Config in Code

**API Client:**

```dart
class ApiClient {
  final Dio _dio;

  ApiClient() : _dio = Dio() {
    _dio.options.baseUrl = FlavorConfig.instance.apiBaseUrl;

    if (FlavorConfig.instance.enableLogging) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
      ));
    }
  }
}
```

**Analytics Service:**

```dart
class AnalyticsService {
  void logEvent(String name, Map<String, dynamic> params) {
    if (!FlavorConfig.instance.enableAnalytics) {
      return; // Don't track in dev
    }

    FirebaseAnalytics.instance.logEvent(
      name: name,
      parameters: params,
    );
  }
}
```

**Feature Flags:**

```dart
class FeatureFlags {
  static bool get showBetaFeatures {
    return FlavorConfig.instance.isDev ||
           FlavorConfig.instance.isStaging;
  }

  static bool get enableMockData {
    return FlavorConfig.instance.isDev;
  }
}
```

### 2. Environment-Specific Dependency Injection

```dart
@module
abstract class AppModule {
  @singleton
  ApiClient provideApiClient() {
    if (FlavorConfig.instance.isDev) {
      return MockApiClient(); // Mock for offline dev
    } else {
      return ApiClient();
    }
  }

  @singleton
  AnalyticsService provideAnalytics() {
    if (FlavorConfig.instance.isProduction) {
      return FirebaseAnalytics();
    } else {
      return ConsoleAnalytics(); // Log to console
    }
  }
}
```

### 3. Flavor-Aware Error Handling

```dart
void handleError(Object error, StackTrace stackTrace) {
  // Always log in dev
  if (FlavorConfig.instance.isDev) {
    debugPrint('Error: $error');
    debugPrint('Stack trace: $stackTrace');
  }

  // Report to Crashlytics in staging/production
  if (!FlavorConfig.instance.isDev) {
    FirebaseCrashlytics.instance.recordError(error, stackTrace);
  }

  // Show detailed error in dev, generic in production
  if (FlavorConfig.instance.isDev) {
    showDetailedErrorDialog(error, stackTrace);
  } else {
    showGenericErrorDialog();
  }
}
```

---

## Troubleshooting

### Issue: "Error: No flavor named 'dev' found"

**Cause:** Android `build.gradle` doesn't have `dev` flavor defined.

**Fix:**
1. Open `android/app/build.gradle`
2. Verify `productFlavors` block exists
3. Verify `dev { }` is defined
4. Run `flutter clean && flutter pub get`

---

### Issue: "Error: No such file: 'lib/main_dev.dart'"

**Cause:** Entry point file doesn't exist.

**Fix:**
```bash
@claude use skill development-workflow/flutter-flavors
```

Or create manually following the [Manual Configuration](#manual-configuration) section.

---

### Issue: iOS build fails with "No such scheme"

**Cause:** Xcode scheme not configured.

**Fix:**
1. Open `ios/Runner.xcworkspace` in Xcode
2. Product → Scheme → Manage Schemes
3. Create schemes for `dev`, `staging`, `production`
4. Configure each scheme's build configuration

Or run automated setup:
```bash
sh ios/configure-xcode-flavors.sh
```

---

### Issue: Can't install dev and production together

**Cause:** Bundle IDs are the same.

**Fix:**
Verify `applicationIdSuffix` in `android/app/build.gradle`:

```gradle
dev {
    applicationIdSuffix ".dev"  // This makes it com.example.app.dev
}
```

For iOS, verify different bundle IDs in Xcode build settings.

---

### Issue: Wrong API URL being used

**Cause:** Flavor and entry point don't match.

**Fix:**
Always match flavor and entry point:

```bash
# ❌ Wrong - dev flavor with staging entry point
flutter run --flavor dev -t lib/main_staging.dart

# ✅ Right - dev flavor with dev entry point
flutter run --flavor dev -t lib/main_dev.dart
```

---

## Additional Resources

- **Flutter Flavors Skill Documentation:** `.claude/skills/development-workflow/flutter-flavors/README.md`
- **Flutter Flavors Examples:** `.claude/skills/development-workflow/flutter-flavors/examples.md`
- **Flutter Official Docs:** https://flutter.dev/docs/deployment/flavors
- **PRPROMPTS Documentation:** `docs/`

---

**Version:** 1.0.0
**Last Updated:** 2025-10-24
**License:** MIT
