# Flutter Flavors Setup Skill - Documentation

> **Complete guide to Flutter flavors** - Multi-level documentation for junior, intermediate, and senior developers

---

## Table of Contents

- [For Juniors: Understanding Flutter Flavors](#for-juniors-understanding-flutter-flavors)
- [For Intermediates: Technical Implementation](#for-intermediates-technical-implementation)
- [For Seniors: Advanced Patterns & Best Practices](#for-seniors-advanced-patterns--best-practices)
- [Quick Reference](#quick-reference)

---

# For Juniors: Understanding Flutter Flavors

## What Are Flutter Flavors? (ELI5)

**Simple Analogy:**

Imagine you're running a restaurant 🍽️. You have three different versions of your menu:

1. **Kitchen Test Menu** (Dev) - You test new recipes here
2. **Staff Preview Menu** (Staging) - Your staff tries the dishes before customers
3. **Customer Menu** (Production) - The final menu customers see

Flutter flavors are like having **three copies of your app**:
- **Dev** - For testing while you code
- **Staging** - For final testing before release
- **Production** - The real app users download

---

## Why Do We Need Flavors?

### Problem Without Flavors:

You're building an app that talks to a server. You have:
- A **test server** at `https://test-api.example.com` (for development)
- A **real server** at `https://api.example.com` (for users)

**Without flavors**, you have to:
1. Change the API URL in your code manually
2. Build the app
3. Test it
4. Change the API URL back to production
5. Build again for release
6. **DANGER:** Accidentally release with test URL! 😱

**With flavors**:
1. Build **dev flavor** → automatically uses test API
2. Build **production flavor** → automatically uses real API
3. **Never mix them up!** ✅

---

## What Flavors Give You

### 1. Different API Endpoints

```dart
// Dev flavor automatically uses:
apiUrl = "https://dev-api.example.com"

// Production flavor automatically uses:
apiUrl = "https://api.example.com"
```

### 2. Different App Names

On your phone, you see:
- 📱 **"MyApp Dev"** - Development version
- 📱 **"MyApp Staging"** - Staging version
- 📱 **"MyApp"** - Production version

**You can have all 3 installed at once!** They don't overwrite each other.

### 3. Different App Icons (Optional)

- Dev: Green icon with "DEV" badge
- Staging: Orange icon with "STAGING" badge
- Production: Blue icon (final design)

### 4. Different Settings

```dart
// Dev flavor:
enableAnalytics = false  // Don't track test data
showDebugInfo = true     // Show extra debug info

// Production flavor:
enableAnalytics = true   // Track real user data
showDebugInfo = false    // Hide debug info
```

---

## How to Use Flavors (Step by Step)

### Step 1: Run a Specific Flavor

```bash
# Run development flavor
flutter run --flavor dev -t lib/main_dev.dart

# Run staging flavor
flutter run --flavor staging -t lib/main_staging.dart

# Run production flavor
flutter run --flavor production -t lib/main_production.dart
```

**What this does:**
- `--flavor dev` tells Flutter which flavor to build
- `-t lib/main_dev.dart` tells Flutter which entry point file to use

### Step 2: Build Release APK

```bash
# Build production release
flutter build apk --flavor production -t lib/main_production.dart --release
```

**Output:** `app-production-release.apk` (ready for Play Store)

---

## Understanding the Files

After setting up flavors, you'll see these files:

### Entry Point Files (lib/)

```
lib/
├── main_dev.dart         ← Dev flavor entry point
├── main_staging.dart     ← Staging flavor entry point
├── main_production.dart  ← Production flavor entry point
└── main_common.dart      ← Shared code for all flavors
```

**What they do:**

`main_dev.dart` says: "I'm the dev flavor, use dev API!"

```dart
void main() {
  final config = FlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.example.com',
  );
  mainCommon(config); // Run the app with dev config
}
```

### Build Scripts (scripts/)

```
scripts/
├── build-dev.sh         ← Build dev flavor (Mac/Linux)
├── build-staging.sh     ← Build staging flavor
├── build-production.sh  ← Build production flavor
├── build-dev.bat        ← Build dev flavor (Windows)
├── build-staging.bat    ← Build staging flavor (Windows)
└── build-production.bat ← Build production flavor (Windows)
```

**How to use:**

```bash
# On Mac/Linux
sh scripts/build-production.sh

# On Windows
scripts\build-production.bat
```

---

## Common Mistakes (And How to Avoid Them)

### ❌ Mistake 1: Forgetting the `-t` flag

```bash
# Wrong - doesn't specify entry point
flutter run --flavor dev

# Right - specifies entry point
flutter run --flavor dev -t lib/main_dev.dart
```

**What happens:** Flutter uses default `lib/main.dart`, which doesn't have flavor config.

---

### ❌ Mistake 2: Mismatched flavor and entry point

```bash
# Wrong - dev flavor with staging entry point
flutter run --flavor dev -t lib/main_staging.dart
```

**What happens:** App name says "Staging" but uses dev bundle ID. Confusing! 😵

**Right way:**
```bash
# Flavor and entry point match
flutter run --flavor dev -t lib/main_dev.dart
```

---

### ❌ Mistake 3: Editing generated files

**Don't edit:** `android/app/build.gradle` manually (after setup)

**Why:** Flavor config is auto-generated. Manual edits can break builds.

**If you need changes:** Update the skill inputs and regenerate.

---

## How to Check Which Flavor is Running

Add this debug code to your app:

```dart
import 'main_common.dart';

// In your widget
Text('Current Flavor: ${FlavorConfig.instance.flavor.name}')
```

**You'll see:**
- "Current Flavor: dev" in dev build
- "Current Flavor: staging" in staging build
- "Current Flavor: production" in production build

---

## Real-World Example: Building for Testing

**Scenario:** You want to test your app on a physical device with test API.

**Steps:**

1. **Build dev flavor APK:**
```bash
flutter build apk --flavor dev -t lib/main_dev.dart --debug
```

2. **Find the APK:**
```
build/app/outputs/flutter-apk/app-dev-debug.apk
```

3. **Install on device:**
- Copy APK to phone
- Install it
- App name will be "MyApp Dev" 📱

4. **Test with real API:**
```bash
flutter build apk --flavor production -t lib/main_production.dart --release
```

5. **Both can be installed together!**
- MyApp Dev (test version)
- MyApp (real version)

---

## Key Takeaways for Juniors

✅ **Flavors are like multiple copies of your app** - Each has different settings

✅ **Use dev flavor while developing** - Safe to test without affecting production data

✅ **Use production flavor for release** - Clean, final version for users

✅ **Always match flavor and entry point** - `--flavor dev` goes with `-t lib/main_dev.dart`

✅ **Use build scripts for consistency** - Less typing, fewer mistakes

---

# For Intermediates: Technical Implementation

## Architecture Overview

### Flavor System Components

```
┌─────────────────────────────────────────────┐
│         Flutter Flavor Architecture          │
├─────────────────────────────────────────────┤
│                                             │
│  Android Side          Flutter Side          │
│  ─────────────         ─────────────         │
│  build.gradle          main_dev.dart         │
│    ↓                     ↓                   │
│  productFlavors        FlavorConfig          │
│    ↓                     ↓                   │
│  Build Variants        mainCommon()          │
│    ↓                     ↓                   │
│  APK                   MyApp()               │
│                                             │
│  iOS Side                                    │
│  ─────────                                   │
│  Xcode Project                               │
│    ↓                                         │
│  Build Configurations                        │
│    ↓                                         │
│  Schemes                                     │
│    ↓                                         │
│  IPA                                         │
└─────────────────────────────────────────────┘
```

---

## Android Implementation Deep Dive

### Gradle Configuration Explained

**File:** `android/app/build.gradle`

```gradle
android {
    // Flavor dimension - groups related flavors
    flavorDimensions "environment"

    productFlavors {
        dev {
            // Dimension for grouping
            dimension "environment"

            // Bundle ID suffix (com.example.app → com.example.app.dev)
            applicationIdSuffix ".dev"

            // App name from string resource
            resValue "string", "app_name", "MyApp Dev"

            // Environment variables accessible in Dart
            buildConfigField "String", "API_BASE_URL", "\"https://dev-api.example.com\""
            buildConfigField "boolean", "ENABLE_ANALYTICS", "false"
            buildConfigField "boolean", "ENABLE_LOGGING", "true"
        }
    }
}
```

**What each line does:**

1. **`flavorDimensions "environment"`**
   - Groups flavors by category
   - You could have multiple dimensions: `["environment", "api_version"]`
   - Example: `devV1`, `devV2`, `prodV1`, `prodV2`

2. **`applicationIdSuffix ".dev"`**
   - Base ID: `com.example.app` (from `defaultConfig`)
   - With suffix: `com.example.app.dev`
   - **Why:** Allows dev and prod apps to coexist on same device

3. **`resValue "string", "app_name", "MyApp Dev"`**
   - Creates Android string resource dynamically
   - Referenced in `AndroidManifest.xml` as `@string/app_name`
   - Changes app name without modifying manifest

4. **`buildConfigField`**
   - Generates Java constants in `BuildConfig.java`
   - **NOT directly accessible in Dart** (Android-only)
   - Used if you have native Android code that needs these values

---

### Build Variants Generated

Gradle automatically creates build variants by combining flavors × build types:

| Flavor | Build Type | Variant Name | Output |
|--------|------------|--------------|--------|
| dev | debug | devDebug | app-dev-debug.apk |
| dev | release | devRelease | app-dev-release.apk |
| staging | debug | stagingDebug | app-staging-debug.apk |
| staging | release | stagingRelease | app-staging-release.apk |
| production | debug | productionDebug | app-production-debug.apk |
| production | release | productionRelease | app-production-release.apk |

**Total:** 3 flavors × 2 build types = **6 variants**

---

### AndroidManifest.xml Integration

**Before flavors:**
```xml
<application
    android:label="MyApp"
    android:icon="@mipmap/ic_launcher">
```

**After flavors:**
```xml
<application
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher">
```

**Why the change:**
- `@string/app_name` is defined per flavor in `build.gradle`
- Each flavor gets its own app name automatically

---

### Flavor-Specific Resources

**Directory structure for flavor-specific icons:**

```
android/app/src/
├── main/
│   └── res/
│       └── mipmap-*/ic_launcher.png  (default icons)
├── dev/
│   └── res/
│       └── mipmap-*/ic_launcher.png  (dev icons - green)
├── staging/
│   └── res/
│       └── mipmap-*/ic_launcher.png  (staging icons - orange)
└── production/
    └── res/
        └── mipmap-*/ic_launcher.png  (production icons - blue)
```

**How it works:**
- Android merges resources from `main/` and `{flavor}/`
- Flavor-specific resources **override** main resources
- If `dev/res/mipmap-hdpi/ic_launcher.png` exists, it overrides `main/res/mipmap-hdpi/ic_launcher.png`

---

## iOS Implementation Deep Dive

### Xcode Build Configurations

**Standard Xcode configs:**
- Debug
- Release

**After flavors:**
- Debug-dev
- Release-dev
- Debug-staging
- Release-staging
- Debug-production
- Release-production

**How they're created:**
1. Duplicate `Debug` config
2. Rename to `Debug-dev`, `Debug-staging`, `Debug-production`
3. Repeat for `Release`

---

### Xcode Schemes

**What is a scheme?**
- A scheme defines how to build, run, test, profile, analyze, and archive your app
- Each flavor needs its own scheme

**Scheme configuration:**

| Scheme | Build Configuration (Debug) | Build Configuration (Release) |
|--------|---------------------------|----------------------------|
| dev | Debug-dev | Release-dev |
| staging | Debug-staging | Release-staging |
| production | Debug-production | Release-production |

**Why separate schemes:**
- Allows Xcode to build different flavors
- Each scheme uses different bundle ID and display name
- Can select scheme in Xcode: Product → Scheme → dev

---

### Info.plist Configuration

**Before flavors:**
```xml
<key>CFBundleDisplayName</key>
<string>MyApp</string>
<key>CFBundleIdentifier</key>
<string>com.example.app</string>
```

**After flavors:**
```xml
<key>CFBundleDisplayName</key>
<string>$(DISPLAY_NAME)</string>
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
```

**What changed:**
- `$(DISPLAY_NAME)` reads from build settings
- `$(PRODUCT_BUNDLE_IDENTIFIER)` reads from build settings
- Each build configuration sets different values

---

### Build Settings per Configuration

**Build Settings → User-Defined:**

| Configuration | PRODUCT_BUNDLE_IDENTIFIER | DISPLAY_NAME |
|---------------|--------------------------|--------------|
| Debug-dev | com.example.app.dev | MyApp Dev |
| Release-dev | com.example.app.dev | MyApp Dev |
| Debug-staging | com.example.app.staging | MyApp Staging |
| Release-staging | com.example.app.staging | MyApp Staging |
| Debug-production | com.example.app | MyApp |
| Release-production | com.example.app | MyApp |

**How to set:**
1. Click on Runner project
2. Select Runner target
3. Build Settings tab
4. Click + → Add User-Defined Setting
5. Name: `PRODUCT_BUNDLE_IDENTIFIER`
6. Expand and set values for each configuration

---

## Flutter-Side Implementation

### Entry Point Pattern

**Traditional single entry point:**
```dart
// lib/main.dart
void main() {
  runApp(MyApp());
}
```

**Multi-flavor entry points:**
```dart
// lib/main_dev.dart
void main() {
  final config = FlavorConfig(/*dev config*/);
  mainCommon(config);
}

// lib/main_staging.dart
void main() {
  final config = FlavorConfig(/*staging config*/);
  mainCommon(config);
}

// lib/main_production.dart
void main() {
  final config = FlavorConfig(/*production config*/);
  mainCommon(config);
}

// lib/main_common.dart
void mainCommon(FlavorConfig config) {
  FlavorConfig.initialize(config);
  runApp(MyApp(config: config));
}
```

**Why this pattern:**
- ✅ **Single source of truth** - All shared logic in `main_common.dart`
- ✅ **Type-safe** - Config is Dart object, not strings
- ✅ **Testable** - Can mock `FlavorConfig` in tests
- ✅ **IDE-friendly** - Auto-complete works

---

### FlavorConfig Implementation

```dart
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

  // Singleton pattern for global access
  static FlavorConfig? _instance;

  static FlavorConfig get instance {
    assert(_instance != null, 'FlavorConfig not initialized');
    return _instance!;
  }

  static void initialize(FlavorConfig config) {
    _instance = config;
  }

  // Convenience methods
  bool get isDev => flavor == Flavor.dev;
  bool get isStaging => flavor == Flavor.staging;
  bool get isProduction => flavor == Flavor.production;
}
```

**Design decisions:**

1. **Why const constructor?**
   - Compile-time constant = faster
   - Flutter can optimize better

2. **Why singleton pattern?**
   - Global access without passing config everywhere
   - Alternative: Dependency injection with get_it

3. **Why assert in getter?**
   - Fail-fast during development
   - Catch initialization errors early

---

### Using FlavorConfig in Code

**In HTTP client:**
```dart
class ApiClient {
  final Dio _dio;

  ApiClient() : _dio = Dio() {
    _dio.options.baseUrl = FlavorConfig.instance.apiBaseUrl;

    if (FlavorConfig.instance.enableLogging) {
      _dio.interceptors.add(LogInterceptor());
    }
  }
}
```

**In analytics:**
```dart
class AnalyticsService {
  void logEvent(String name, Map<String, dynamic> params) {
    if (!FlavorConfig.instance.enableAnalytics) {
      return; // Don't track in dev
    }

    // Send to analytics
    FirebaseAnalytics.instance.logEvent(
      name: name,
      parameters: params,
    );
  }
}
```

**In feature flags:**
```dart
class FeatureFlags {
  static bool get showBetaFeatures {
    return FlavorConfig.instance.isDev ||
           FlavorConfig.instance.isStaging;
  }
}
```

---

## Build Process Explained

### Android Build Flow

```
flutter build apk --flavor dev -t lib/main_dev.dart
           ↓
    1. Flutter compiles lib/main_dev.dart → Dart bytecode
           ↓
    2. Flutter generates Android resources
           ↓
    3. Gradle reads build.gradle
           ↓
    4. Gradle selects 'dev' productFlavor
           ↓
    5. Gradle applies applicationIdSuffix → com.example.app.dev
           ↓
    6. Gradle merges resources (main/ + dev/)
           ↓
    7. Gradle compiles Java/Kotlin code
           ↓
    8. Gradle packages → app-dev-release.apk
```

---

### iOS Build Flow

```
flutter build ios --flavor dev -t lib/main_dev.dart
           ↓
    1. Flutter compiles lib/main_dev.dart → Dart bytecode
           ↓
    2. Flutter generates iOS framework
           ↓
    3. xcodebuild reads Xcode project
           ↓
    4. xcodebuild selects 'dev' scheme
           ↓
    5. xcodebuild reads Debug-dev configuration
           ↓
    6. xcodebuild applies PRODUCT_BUNDLE_IDENTIFIER (com.example.app.dev)
           ↓
    7. xcodebuild applies DISPLAY_NAME (MyApp Dev)
           ↓
    8. xcodebuild compiles Swift/Objective-C code
           ↓
    9. xcodebuild packages → Runner.app
```

---

## Testing Strategies

### Unit Testing with Flavors

```dart
// test/helpers/test_config.dart
FlavorConfig createTestConfig({
  Flavor flavor = Flavor.dev,
  String? apiBaseUrl,
  bool? enableAnalytics,
}) {
  return FlavorConfig(
    flavor: flavor,
    apiBaseUrl: apiBaseUrl ?? 'https://test-api.example.com',
    enableAnalytics: enableAnalytics ?? false,
    enableLogging: true,
    appName: 'Test App',
  );
}

// test/services/api_client_test.dart
void main() {
  setUp(() {
    FlavorConfig.initialize(createTestConfig());
  });

  test('uses correct API URL from config', () {
    final client = ApiClient();
    expect(client.baseUrl, 'https://test-api.example.com');
  });
}
```

---

### Integration Testing with Flavors

```dart
// integration_test/app_test.dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('dev flavor shows debug banner', (tester) async {
    final config = FlavorConfig(
      flavor: Flavor.dev,
      apiBaseUrl: 'https://dev-api.example.com',
      enableAnalytics: false,
      enableLogging: true,
      appName: 'MyApp Dev',
    );

    await tester.pumpWidget(MyApp(config: config));

    // Dev flavor shows debug banner
    expect(find.byType(CheckedModeBanner), findsOneWidget);
  });

  testWidgets('production flavor hides debug banner', (tester) async {
    final config = FlavorConfig(
      flavor: Flavor.production,
      apiBaseUrl: 'https://api.example.com',
      enableAnalytics: true,
      enableLogging: false,
      appName: 'MyApp',
    );

    await tester.pumpWidget(MyApp(config: config));

    // Production flavor hides debug banner
    expect(find.byType(CheckedModeBanner), findsNothing);
  });
}
```

---

## VS Code Integration

**`.vscode/launch.json` explained:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Dev Flavor",           // Name shown in Run dropdown
      "request": "launch",            // Start the app
      "type": "dart",                 // Dart/Flutter debugger
      "program": "lib/main_dev.dart", // Entry point
      "args": [
        "--flavor",                   // Pass flavor argument
        "dev"                         // Flavor name
      ]
    }
  ]
}
```

**How to use:**
1. Open Run and Debug panel (Ctrl+Shift+D)
2. Select "Dev Flavor" from dropdown
3. Click green play button ▶️
4. VS Code runs: `flutter run --flavor dev -t lib/main_dev.dart`

---

## Debugging Tips

### Issue: "Error: No flavor named 'dev' found"

**Cause:** Android `build.gradle` doesn't have `dev` flavor defined

**Fix:**
1. Open `android/app/build.gradle`
2. Check `productFlavors` block exists
3. Check `dev { }` is defined
4. Run `flutter clean`
5. Run `flutter pub get`

---

### Issue: "Error: No such file: 'lib/main_dev.dart'"

**Cause:** Entry point file doesn't exist

**Fix:**
```bash
# Create entry point
cat > lib/main_dev.dart << 'EOF'
import 'main_common.dart';

void main() {
  final config = FlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.example.com',
    enableAnalytics: false,
    enableLogging: true,
    appName: 'MyApp Dev',
  );
  mainCommon(config);
}
EOF
```

---

### Issue: iOS build fails with "No such module"

**Cause:** Xcode scheme not properly configured

**Fix:**
1. Open `ios/Runner.xcworkspace` in Xcode
2. Product → Scheme → Manage Schemes
3. Check that `dev`, `staging`, `production` schemes exist
4. Edit each scheme → Build Configuration
5. Ensure correct configuration selected (Debug-dev for dev scheme)

---

## Key Takeaways for Intermediates

✅ **Gradle productFlavors** generate build variants (flavor × buildType)

✅ **Xcode schemes** map to build configurations

✅ **FlavorConfig singleton** provides global access to flavor settings

✅ **Entry point pattern** (main_*.dart) enables type-safe configuration

✅ **Flavor-specific resources** override main resources

✅ **VS Code launch.json** simplifies running different flavors

---

# For Seniors: Advanced Patterns & Best Practices

## Enterprise Architecture Patterns

### 1. Multi-Dimensional Flavors

**Use Case:** Multiple API versions + multiple environments

```gradle
android {
    flavorDimensions "environment", "api"

    productFlavors {
        dev { dimension "environment" }
        staging { dimension "environment" }
        prod { dimension "environment" }

        v1 { dimension "api" }
        v2 { dimension "api" }
    }
}
```

**Generates 6 flavors:**
- devV1, devV2
- stagingV1, stagingV2
- prodV1, prodV2

**When to use:**
- API versioning during migration
- A/B testing different backends
- Legacy vs modern API support

---

### 2. Flavor-Based Feature Flags

```dart
class FeatureFlags {
  final FlavorConfig _config;

  FeatureFlags(this._config);

  // Feature available in all non-production environments
  bool get enableExperimentalFeatures {
    return !_config.isProduction;
  }

  // Feature available only in dev
  bool get enableMockData {
    return _config.isDev;
  }

  // Feature available in staging and production
  bool get enablePushNotifications {
    return _config.isStaging || _config.isProduction;
  }

  // Feature available only in production
  bool get enableCrashReporting {
    return _config.isProduction;
  }

  // Remote config override
  Future<bool> getFeature(String key) async {
    // Check flavor-based default
    final defaultValue = _getFlavorDefault(key);

    // Override with remote config in production
    if (_config.isProduction) {
      return await RemoteConfig.getBool(key, defaultValue);
    }

    return defaultValue;
  }
}
```

**Pattern Benefits:**
- Progressive rollout (dev → staging → prod)
- Safe testing of features
- Easy rollback (just disable in flavor)

---

### 3. Environment-Specific Dependency Injection

```dart
// lib/core/di/injection.dart
@module
abstract class AppModule {
  @singleton
  ApiClient provideApiClient(FlavorConfig config) {
    if (config.isDev) {
      // Mock API client for offline development
      return MockApiClient();
    } else if (config.isStaging) {
      // Real API with verbose logging
      return ApiClient(
        baseUrl: config.apiBaseUrl,
        interceptors: [LoggingInterceptor(verbose: true)],
      );
    } else {
      // Production API with minimal logging
      return ApiClient(
        baseUrl: config.apiBaseUrl,
        interceptors: [LoggingInterceptor(verbose: false)],
      );
    }
  }

  @singleton
  AnalyticsService provideAnalytics(FlavorConfig config) {
    if (config.isProduction) {
      return FirebaseAnalytics();
    } else {
      return ConsoleAnalytics(); // Log to console in dev/staging
    }
  }

  @singleton
  CacheService provideCache(FlavorConfig config) {
    if (config.isDev) {
      // Aggressive caching in dev (faster builds)
      return CacheService(ttl: Duration(hours: 24));
    } else {
      // Short caching in production (fresh data)
      return CacheService(ttl: Duration(minutes: 5));
    }
  }
}
```

**Pattern Benefits:**
- Environment-specific implementations
- Easy mocking in dev
- Production-grade services in prod

---

### 4. Flavor-Aware Error Handling

```dart
class ErrorHandler {
  final FlavorConfig _config;

  ErrorHandler(this._config);

  void handleError(Object error, StackTrace stackTrace) {
    // Always log to console in dev
    if (_config.isDev || _config.isStaging) {
      debugPrint('Error: $error');
      debugPrint('Stack trace: $stackTrace');
    }

    // Report to crash reporting in staging + production
    if (!_config.isDev) {
      _reportToCrashlytics(error, stackTrace);
    }

    // Show detailed error dialog in dev
    if (_config.isDev) {
      _showDetailedErrorDialog(error, stackTrace);
    } else {
      // Show user-friendly message in production
      _showGenericErrorDialog();
    }
  }

  void _reportToCrashlytics(Object error, StackTrace stackTrace) {
    FirebaseCrashlytics.instance.recordError(
      error,
      stackTrace,
      reason: 'Caught by ErrorHandler',
      information: [
        'flavor: ${_config.flavor.name}',
        'apiUrl: ${_config.apiBaseUrl}',
      ],
    );
  }
}
```

---

## CI/CD Integration Patterns

### 1. GitHub Actions Multi-Flavor Build

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

      - name: Archive IPA
        run: |
          cd build/ios/iphoneos
          mkdir Payload
          cp -R Runner.app Payload/
          zip -r app-${{ matrix.flavor }}-release.ipa Payload

      - name: Upload IPA
        uses: actions/upload-artifact@v3
        with:
          name: app-${{ matrix.flavor }}-ios
          path: build/ios/iphoneos/app-${{ matrix.flavor }}-release.ipa
```

**What this does:**
- Builds all 3 flavors in parallel
- Uploads artifacts for download
- Runs on every push to main/develop

---

### 2. Automated Distribution

```yaml
# .github/workflows/distribute-flavors.yml
name: Distribute Flavors

on:
  push:
    tags:
      - 'v*'

jobs:
  distribute-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2

      - name: Build dev APK
        run: flutter build apk --flavor dev -t lib/main_dev.dart --release

      - name: Upload to Firebase App Distribution (Dev)
        uses: wzieba/Firebase-Distribution-Github-Action@v1
        with:
          appId: ${{ secrets.FIREBASE_APP_ID_DEV }}
          serviceCredentialsFileContent: ${{ secrets.FIREBASE_CREDENTIALS }}
          groups: internal-testers
          file: build/app/outputs/flutter-apk/app-dev-release.apk

  distribute-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2

      - name: Build staging APK
        run: flutter build apk --flavor staging -t lib/main_staging.dart --release

      - name: Upload to Firebase App Distribution (Staging)
        uses: wzieba/Firebase-Distribution-Github-Action@v1
        with:
          appId: ${{ secrets.FIREBASE_APP_ID_STAGING }}
          serviceCredentialsFileContent: ${{ secrets.FIREBASE_CREDENTIALS }}
          groups: qa-testers, stakeholders
          file: build/app/outputs/flutter-apk/app-staging-release.apk

  publish-production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2

      - name: Build production app bundle
        run: flutter build appbundle --flavor production -t lib/main_production.dart --release

      - name: Upload to Play Store (Internal Testing)
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_CREDENTIALS }}
          packageName: com.example.app
          releaseFiles: build/app/outputs/bundle/productionRelease/app-production-release.aab
          track: internal
```

**Distribution Strategy:**
- **Dev** → Firebase App Distribution (internal testers)
- **Staging** → Firebase App Distribution (QA + stakeholders)
- **Production** → Google Play (internal testing track)

---

### 3. Automated Testing per Flavor

```yaml
# .github/workflows/test-flavors.yml
name: Test Flavors

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2

      - name: Run unit tests
        run: flutter test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        flavor: [dev, staging, production]

    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2

      - name: Run integration tests (${{ matrix.flavor }})
        run: |
          flutter test integration_test \
            --flavor ${{ matrix.flavor }} \
            -t lib/main_${{ matrix.flavor }}.dart
```

---

## Advanced Security Patterns

### 1. Flavor-Specific API Keys

**Problem:** Don't hardcode API keys in code

**Solution:** Environment variables + secrets

**Android:**

```gradle
// android/app/build.gradle
android {
    productFlavors {
        dev {
            // Read from environment variable
            def apiKey = System.getenv("DEV_API_KEY") ?: "dev-placeholder-key"
            buildConfigField "String", "API_KEY", "\"${apiKey}\""
        }
        production {
            def apiKey = System.getenv("PROD_API_KEY") ?: "prod-placeholder-key"
            buildConfigField "String", "API_KEY", "\"${apiKey}\""
        }
    }
}
```

**Flutter:**

```dart
// lib/core/config/secrets.dart
class Secrets {
  static const String apiKey = String.fromEnvironment(
    'API_KEY',
    defaultValue: 'placeholder-key',
  );
}

// Usage
final apiClient = ApiClient(apiKey: Secrets.apiKey);
```

**Build with secrets:**

```bash
# Dev
export DEV_API_KEY="sk-dev-12345"
flutter build apk --flavor dev -t lib/main_dev.dart --dart-define=API_KEY=$DEV_API_KEY

# Production
export PROD_API_KEY="sk-prod-67890"
flutter build apk --flavor production -t lib/main_production.dart --dart-define=API_KEY=$PROD_API_KEY
```

**CI/CD with secrets:**

```yaml
# .github/workflows/build.yml
- name: Build production
  env:
    API_KEY: ${{ secrets.PROD_API_KEY }}
  run: |
    flutter build apk \
      --flavor production \
      -t lib/main_production.dart \
      --dart-define=API_KEY=$API_KEY \
      --release
```

---

### 2. Certificate Pinning per Flavor

```dart
class ApiClient {
  final FlavorConfig _config;
  late final Dio _dio;

  ApiClient(this._config) {
    _dio = Dio();

    // Setup certificate pinning for production only
    if (_config.isProduction) {
      (_dio.httpClientAdapter as DefaultHttpClientAdapter).onHttpClientCreate =
          (client) {
        client.badCertificateCallback =
            (X509Certificate cert, String host, int port) {
          // Pin production certificate SHA-256
          const productionCertSHA256 = 'ABCD1234...';
          final certSHA256 = sha256.convert(cert.der).toString();
          return certSHA256 == productionCertSHA256;
        };
        return client;
      };
    }
  }
}
```

**Why flavor-specific:**
- Dev/staging may use self-signed certificates
- Production requires strict certificate validation
- Prevents MITM attacks in production

---

## Performance Optimization Patterns

### 1. Flavor-Specific Build Optimization

```gradle
// android/app/build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        }
    }

    productFlavors {
        dev {
            // Faster builds in dev (no optimization)
            minifyEnabled false
            shrinkResources false
        }
        production {
            // Full optimization in production
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

**Build time comparison:**
- Dev: ~30 seconds (no minification)
- Production: ~2 minutes (full optimization)

---

### 2. Conditional Plugin Loading

```dart
// lib/core/plugins/plugins.dart
class Plugins {
  static Future<void> initialize(FlavorConfig config) async {
    // Always initialize core plugins
    await Firebase.initializeApp();

    // Analytics only in staging + production
    if (!config.isDev) {
      await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(true);
    }

    // Crashlytics only in production
    if (config.isProduction) {
      FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterError;
    }

    // Mock services in dev
    if (config.isDev) {
      await MockService.initialize();
    }
  }
}
```

**Benefits:**
- Faster app launch in dev (fewer plugins)
- Reduced memory usage
- No accidental test data in analytics

---

## Monorepo Strategies

### 1. Shared Flavors Across Multiple Apps

**Directory structure:**

```
my_company/
├── shared/
│   └── flavors/
│       ├── flavor_config.dart
│       └── main_common.dart
├── app1/
│   ├── lib/
│   │   ├── main_dev.dart
│   │   ├── main_staging.dart
│   │   └── main_production.dart
│   └── pubspec.yaml
└── app2/
    ├── lib/
    │   ├── main_dev.dart
    │   ├── main_staging.dart
    │   └── main_production.dart
    └── pubspec.yaml
```

**Shared flavor config:**

```yaml
# shared/flavors/pubspec.yaml
name: company_flavors
version: 1.0.0

dependencies:
  flutter:
    sdk: flutter
```

**App pubspec:**

```yaml
# app1/pubspec.yaml
dependencies:
  company_flavors:
    path: ../shared/flavors
```

**Benefits:**
- Consistent flavor logic across all apps
- Update once, applies everywhere
- Centralized environment configuration

---

### 2. Flavor Inheritance Pattern

```dart
// shared/flavors/base_flavor_config.dart
abstract class BaseFlavorConfig {
  Flavor get flavor;
  String get apiBaseUrl;
  bool get enableAnalytics;
  bool get enableLogging;

  // Common methods all apps need
  bool get isDev => flavor == Flavor.dev;
  bool get isStaging => flavor == Flavor.staging;
  bool get isProduction => flavor == Flavor.production;

  Map<String, dynamic> toJson();
}

// app1/lib/config/app1_flavor_config.dart
class App1FlavorConfig extends BaseFlavorConfig {
  final String app1SpecificKey;

  @override
  final Flavor flavor;

  @override
  final String apiBaseUrl;

  // ... implement other base properties

  const App1FlavorConfig({
    required this.flavor,
    required this.apiBaseUrl,
    required this.app1SpecificKey,
    // ...
  });
}
```

---

## Debugging & Monitoring

### 1. Flavor-Aware Logging

```dart
// lib/core/logging/logger.dart
class AppLogger {
  final FlavorConfig _config;
  final Logger _logger;

  AppLogger(this._config)
      : _logger = Logger(
          level: _config.isDev ? Level.verbose : Level.warning,
          printer: _config.isDev
              ? PrettyPrinter()
              : SimplePrinter(), // Less verbose in production
        );

  void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    if (_config.isDev || _config.isStaging) {
      _logger.d(message, error, stackTrace);
    }
  }

  void info(String message) {
    _logger.i('[${_config.flavor.name}] $message');
  }

  void warning(String message) {
    _logger.w('[${_config.flavor.name}] $message');

    // Send to monitoring service in production
    if (_config.isProduction) {
      _sendToMonitoringService(message, 'WARNING');
    }
  }

  void error(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e('[${_config.flavor.name}] $message', error, stackTrace);

    // Always send errors to monitoring
    if (!_config.isDev) {
      _sendToMonitoringService(message, 'ERROR', error, stackTrace);
    }
  }
}
```

---

### 2. Visual Flavor Indicator

```dart
// lib/core/widgets/flavor_banner.dart
class FlavorBanner extends StatelessWidget {
  final Widget child;
  final FlavorConfig config;

  const FlavorBanner({
    Key? key,
    required this.child,
    required this.config,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Show banner only in non-production flavors
    if (config.isProduction) {
      return child;
    }

    return Banner(
      message: config.flavor.name.toUpperCase(),
      location: BannerLocation.topEnd,
      color: _getBannerColor(),
      child: child,
    );
  }

  Color _getBannerColor() {
    switch (config.flavor) {
      case Flavor.dev:
        return Colors.green;
      case Flavor.staging:
        return Colors.orange;
      case Flavor.production:
        return Colors.transparent;
    }
  }
}

// Usage in main_common.dart
runApp(
  FlavorBanner(
    config: config,
    child: MyApp(config: config),
  ),
);
```

---

## Migration Strategies

### 1. Migrating Existing App to Flavors

**Step-by-step migration:**

**Phase 1: Create flavor structure (no breaking changes)**

1. Create `lib/main_common.dart` from existing `lib/main.dart`
2. Create `lib/main_production.dart` that calls `mainCommon()`
3. Update build commands to use `-t lib/main_production.dart`
4. **No functional changes yet** - app works exactly the same

**Phase 2: Add dev flavor**

1. Create `lib/main_dev.dart`
2. Update `android/app/build.gradle` with dev flavor
3. Configure iOS dev scheme
4. Test: `flutter run --flavor dev -t lib/main_dev.dart`

**Phase 3: Add staging flavor**

1. Create `lib/main_staging.dart`
2. Update `android/app/build.gradle` with staging flavor
3. Configure iOS staging scheme
4. Test: `flutter run --flavor staging -t lib/main_staging.dart`

**Phase 4: Move configuration to FlavorConfig**

1. Extract hardcoded values (API URLs, keys) to FlavorConfig
2. Update code to use `FlavorConfig.instance`
3. Test all 3 flavors thoroughly

---

### 2. Zero-Downtime Flavor Rollout

**Strategy for live apps:**

1. **Keep existing build working**
   - Don't remove `lib/main.dart` immediately
   - Add flavors alongside existing setup

2. **Gradual transition**
   - Release production flavor first (identical to current)
   - Internal testing with dev/staging flavors
   - Once stable, deprecate old build process

3. **Rollback plan**
   - Keep old build scripts for 1-2 releases
   - Document rollback procedure
   - Have old build process in separate branch

---

## Best Practices Summary

### DO ✅

1. **Use consistent naming** - dev, staging, production (not test, prod, live)
2. **Match flavor and entry point** - `--flavor dev` with `-t lib/main_dev.dart`
3. **Version control flavor configs** - Commit all flavor files
4. **Document flavor differences** - Update README with flavor details
5. **Test all flavors in CI** - Don't just test default flavor
6. **Use environment variables for secrets** - Never hardcode API keys
7. **Visual indicators in non-prod** - Banners, different colors
8. **Automate builds** - Scripts for each flavor

### DON'T ❌

1. **Don't hardcode environment values** - Use FlavorConfig
2. **Don't mix flavor logic with business logic** - Separate concerns
3. **Don't forget iOS configuration** - Android is easier, iOS needs manual setup
4. **Don't test only in dev** - Production may have unique issues
5. **Don't use flavors for feature flags** - Use remote config instead
6. **Don't create too many flavors** - 3-4 is ideal, more is chaos
7. **Don't modify generated files** - Update source and regenerate
8. **Don't skip documentation** - Future you will thank present you

---

## Performance Metrics

**Build time comparison (average):**

| Flavor | Debug Build | Release Build | App Size |
|--------|------------|---------------|----------|
| Dev | 30s | 2m | 25 MB |
| Staging | 35s | 2.5m | 22 MB |
| Production | 40s | 3m | 18 MB |

**Why differences:**
- Dev: No minification, includes debug symbols
- Production: Full optimization, shrunk resources

---

## Key Takeaways for Seniors

✅ **Multi-dimensional flavors** for complex scenarios (environment × API version)

✅ **Flavor-based feature flags** for progressive rollout

✅ **Environment-specific DI** for optimal implementations

✅ **CI/CD matrix builds** for parallel flavor builds

✅ **Flavor-aware monitoring** for environment-specific logging

✅ **Migration strategies** for zero-downtime transitions

✅ **Monorepo patterns** for shared flavor logic

✅ **Security patterns** for flavor-specific API keys and certificate pinning

---

# Quick Reference

## Common Commands

```bash
# Run flavors
flutter run --flavor dev -t lib/main_dev.dart
flutter run --flavor staging -t lib/main_staging.dart
flutter run --flavor production -t lib/main_production.dart

# Build debug APK
flutter build apk --flavor dev -t lib/main_dev.dart --debug

# Build release APK
flutter build apk --flavor production -t lib/main_production.dart --release

# Build app bundle (Play Store)
flutter build appbundle --flavor production -t lib/main_production.dart --release

# Build iOS
flutter build ios --flavor production -t lib/main_production.dart --release

# Clean build
flutter clean && flutter pub get
```

---

## File Locations

| File | Purpose |
|------|---------|
| `android/app/build.gradle` | Android flavor configuration |
| `ios/Runner.xcodeproj` | iOS flavor configuration (Xcode) |
| `lib/main_dev.dart` | Dev flavor entry point |
| `lib/main_staging.dart` | Staging flavor entry point |
| `lib/main_production.dart` | Production flavor entry point |
| `lib/main_common.dart` | Shared flavor logic |
| `lib/core/config/environment.dart` | Environment configuration class |
| `.vscode/launch.json` | VS Code debug configurations |
| `scripts/build-*.sh` | Build scripts (Mac/Linux) |
| `scripts/build-*.bat` | Build scripts (Windows) |

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| "No flavor named 'dev'" | Add flavor to `build.gradle`, run `flutter clean` |
| "No such file: main_dev.dart" | Create entry point file |
| iOS build fails | Configure Xcode schemes manually |
| Wrong API URL | Check FlavorConfig in entry point |
| Can't install dev + prod together | Verify different bundle IDs |

---

## Additional Resources

- **Flutter Flavors Documentation:** https://flutter.dev/docs/deployment/flavors
- **Android Product Flavors:** https://developer.android.com/studio/build/build-variants
- **Xcode Schemes:** https://developer.apple.com/documentation/xcode/customizing-the-build-schemes-for-a-project

---

**Version:** 1.0.0
**Last Updated:** 2025-10-24
**Skill ID:** flutter-flavors
**Category:** development-workflow
