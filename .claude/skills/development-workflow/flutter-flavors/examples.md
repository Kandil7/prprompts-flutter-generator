# Flutter Flavors - Real-World Examples

> **Practical examples** showing how to use Flutter flavors in different scenarios

---

## Table of Contents

1. [Basic Setup Example](#example-1-basic-three-flavor-setup)
2. [E-Commerce App Example](#example-2-e-commerce-app-with-payment-testing)
3. [Healthcare App Example](#example-3-healthcare-app-with-hipaa-compliance)
4. [Multi-Region App Example](#example-4-multi-region-app-with-localization)
5. [Social Media App Example](#example-5-social-media-app-with-mock-data)
6. [Enterprise SaaS Example](#example-6-enterprise-saas-with-multi-tenant)
7. [FinTech App Example](#example-7-fintech-app-with-compliance-modes)
8. [Gaming App Example](#example-8-gaming-app-with-leaderboard-environments)

---

## Example 1: Basic Three-Flavor Setup

### Scenario
Simple app that needs dev, staging, and production environments with different API endpoints.

### Setup Command
```bash
@claude use skill development-workflow/flutter-flavors
```

### Generated Files

**lib/main_dev.dart**
```dart
import 'package:flutter/material.dart';
import 'main_common.dart';

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

**lib/main_staging.dart**
```dart
import 'package:flutter/material.dart';
import 'main_common.dart';

void main() {
  const environment = FlavorConfig(
    flavor: Flavor.staging,
    apiBaseUrl: 'https://staging-api.myapp.com',
    enableAnalytics: true,
    enableLogging: true,
    appName: 'MyApp Staging',
  );

  mainCommon(environment);
}
```

**lib/main_production.dart**
```dart
import 'package:flutter/material.dart';
import 'main_common.dart';

void main() {
  const environment = FlavorConfig(
    flavor: Flavor.production,
    apiBaseUrl: 'https://api.myapp.com',
    enableAnalytics: true,
    enableLogging: false,
    appName: 'MyApp',
  );

  mainCommon(environment);
}
```

### Usage

```bash
# Development - Fast iterations with debug logging
flutter run --flavor dev -t lib/main_dev.dart

# Staging - QA testing with analytics enabled
flutter run --flavor staging -t lib/main_staging.dart

# Production - Release build
flutter build apk --flavor production -t lib/main_production.dart --release
```

### Expected Outcome
- ✅ 3 separate apps can be installed simultaneously
- ✅ Dev uses test API, Staging uses staging API, Production uses live API
- ✅ Analytics disabled in dev, enabled in staging/production
- ✅ Different app names for easy identification

---

## Example 2: E-Commerce App with Payment Testing

### Scenario
E-commerce app needs to test Stripe payments without charging real credit cards.

### Custom Configuration

**lib/main_dev.dart**
```dart
import 'package:flutter/material.dart';
import 'main_common.dart';

void main() {
  const environment = ECommerceFlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.mystore.com',
    enableAnalytics: false,
    enableLogging: true,
    appName: 'MyStore Dev',

    // Payment provider settings
    stripePublishableKey: 'pk_test_51H...', // Test key
    stripeSecretKey: 'sk_test_51H...',      // Test key
    paymentMode: PaymentMode.test,

    // Inventory settings
    useRealInventory: false,
    mockInventoryCount: 1000,

    // Pricing
    applyRealPricing: false,
    testDiscount: 0.99, // 99% off for testing
  );

  mainCommon(environment);
}
```

**lib/main_production.dart**
```dart
import 'package:flutter/material.dart';
import 'main_common.dart';

void main() {
  const environment = ECommerceFlavorConfig(
    flavor: Flavor.production,
    apiBaseUrl: 'https://api.mystore.com',
    enableAnalytics: true,
    enableLogging: false,
    appName: 'MyStore',

    // Payment provider settings
    stripePublishableKey: 'pk_live_51H...', // Live key
    stripeSecretKey: 'sk_live_51H...',      // Live key (server-side only!)
    paymentMode: PaymentMode.live,

    // Inventory settings
    useRealInventory: true,
    mockInventoryCount: 0,

    // Pricing
    applyRealPricing: true,
    testDiscount: 0.0,
  );

  mainCommon(environment);
}
```

**lib/core/payment/payment_service.dart**
```dart
class PaymentService {
  final ECommerceFlavorConfig _config;

  PaymentService(this._config);

  Future<PaymentResult> processPayment(double amount) async {
    // Use test key in dev, live key in production
    Stripe.publishableKey = _config.stripePublishableKey;

    if (_config.paymentMode == PaymentMode.test) {
      // Mock successful payment in test mode
      return PaymentResult.success(
        transactionId: 'test_${DateTime.now().millisecondsSinceEpoch}',
        amount: amount * _config.testDiscount, // Apply test discount
      );
    }

    // Real Stripe payment in production
    return await _processRealPayment(amount);
  }
}
```

### Build Commands

```bash
# Dev - Test payments with Stripe test keys
flutter run --flavor dev -t lib/main_dev.dart

# Production - Real payments with Stripe live keys
flutter build appbundle --flavor production -t lib/main_production.dart --release
```

### Expected Outcome
- ✅ Dev uses Stripe test keys (no real charges)
- ✅ Dev applies 99% discount for easy testing
- ✅ Production uses Stripe live keys
- ✅ Can test full checkout flow without spending money

---

## Example 3: Healthcare App with HIPAA Compliance

### Scenario
Healthcare app handling PHI (Protected Health Information) needs different security levels per environment.

### Custom Configuration

**lib/main_dev.dart**
```dart
import 'package:flutter/material.dart';
import 'main_common.dart';

void main() {
  const environment = HealthcareFlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.healthapp.com',
    enableAnalytics: false,
    enableLogging: true,
    appName: 'HealthApp Dev',

    // HIPAA compliance settings
    encryptPHI: false,              // Faster dev, uses fake data anyway
    auditLogEnabled: false,         // No audit logging in dev
    requireBiometrics: false,       // No biometrics in dev
    sessionTimeout: Duration(hours: 24), // Long timeout for dev

    // Data settings
    useMockPatientData: true,       // Mock PHI data
    enableDebugPatientViewer: true, // Show debug patient list
  );

  mainCommon(environment);
}
```

**lib/main_production.dart**
```dart
import 'package:flutter/material.dart';
import 'main_common.dart';

void main() {
  const environment = HealthcareFlavorConfig(
    flavor: Flavor.production,
    apiBaseUrl: 'https://api.healthapp.com',
    enableAnalytics: true,
    enableLogging: false,
    appName: 'HealthApp',

    // HIPAA compliance settings
    encryptPHI: true,               // AES-256-GCM encryption
    auditLogEnabled: true,          // Log all PHI access
    requireBiometrics: true,        // Biometric authentication required
    sessionTimeout: Duration(minutes: 15), // HIPAA-compliant timeout

    // Data settings
    useMockPatientData: false,      // Real patient data
    enableDebugPatientViewer: false, // Hide debug tools
  );

  mainCommon(environment);
}
```

**lib/core/security/phi_handler.dart**
```dart
class PHIHandler {
  final HealthcareFlavorConfig _config;

  PHIHandler(this._config);

  Future<String> storePatientData(PatientData data) async {
    // Audit log in production only
    if (_config.auditLogEnabled) {
      await AuditLogger.log(
        action: 'PHI_WRITE',
        userId: AuthService.currentUserId,
        resourceId: data.patientId,
      );
    }

    // Encrypt PHI in production
    if (_config.encryptPHI) {
      final encrypted = await PHIEncryption.encrypt(data.toJson());
      return await SecureStorage.write('patient_${data.patientId}', encrypted);
    } else {
      // No encryption in dev (faster)
      return await SecureStorage.write('patient_${data.patientId}', data.toJson());
    }
  }

  Future<void> checkSessionTimeout() async {
    final lastActivity = await SessionManager.getLastActivity();
    final elapsed = DateTime.now().difference(lastActivity);

    if (elapsed > _config.sessionTimeout) {
      await _logout();
    }
  }
}
```

### Build Commands

```bash
# Dev - Fast development with mock data
flutter run --flavor dev -t lib/main_dev.dart

# Staging - Test HIPAA compliance
flutter run --flavor staging -t lib/main_staging.dart

# Production - Full HIPAA compliance enabled
flutter build ios --flavor production -t lib/main_production.dart --release
```

### Expected Outcome
- ✅ Dev uses mock patient data (no PHI exposure)
- ✅ Dev has relaxed security for faster development
- ✅ Production encrypts all PHI with AES-256-GCM
- ✅ Production requires biometrics and has 15-minute timeout
- ✅ Production logs all PHI access for HIPAA compliance

---

## Example 4: Multi-Region App with Localization

### Scenario
App serves multiple regions (US, EU, APAC) with different API endpoints and regulations.

### Custom Configuration

**lib/main_dev_us.dart**
```dart
void main() {
  const environment = RegionalFlavorConfig(
    flavor: Flavor.dev,
    region: Region.us,
    apiBaseUrl: 'https://us-dev-api.myapp.com',
    appName: 'MyApp Dev (US)',

    // Region-specific settings
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    measurementSystem: MeasurementSystem.imperial,

    // Compliance
    gdprRequired: false,
    ccpaRequired: true,

    // Features
    enabledFeatures: ['payments', 'shipping', 'localPickup'],
  );

  mainCommon(environment);
}
```

**lib/main_dev_eu.dart**
```dart
void main() {
  const environment = RegionalFlavorConfig(
    flavor: Flavor.dev,
    region: Region.eu,
    apiBaseUrl: 'https://eu-dev-api.myapp.com',
    appName: 'MyApp Dev (EU)',

    // Region-specific settings
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    measurementSystem: MeasurementSystem.metric,

    // Compliance
    gdprRequired: true,
    ccpaRequired: false,

    // Features
    enabledFeatures: ['payments', 'shipping'], // No local pickup in EU
  );

  mainCommon(environment);
}
```

**lib/core/compliance/compliance_manager.dart**
```dart
class ComplianceManager {
  final RegionalFlavorConfig _config;

  ComplianceManager(this._config);

  Future<void> initialize() async {
    // Show GDPR consent in EU
    if (_config.gdprRequired) {
      await _showGDPRConsent();
    }

    // Show CCPA opt-out in US (California)
    if (_config.ccpaRequired) {
      await _showCCPAOptOut();
    }
  }

  Future<void> _showGDPRConsent() async {
    // GDPR consent dialog
    final consent = await showDialog<bool>(
      context: navigatorKey.currentContext!,
      builder: (context) => GDPRConsentDialog(),
    );

    if (consent != true) {
      // Cannot use app without GDPR consent
      exit(0);
    }
  }
}
```

### Build Commands

```bash
# US region
flutter build apk --flavor dev_us -t lib/main_dev_us.dart --release

# EU region
flutter build apk --flavor dev_eu -t lib/main_dev_eu.dart --release
```

### Expected Outcome
- ✅ US build uses US API endpoint
- ✅ EU build uses EU API endpoint
- ✅ Currency, date format, and measurements adjust per region
- ✅ GDPR consent shown in EU, CCPA opt-out in US
- ✅ Region-specific features enabled/disabled

---

## Example 5: Social Media App with Mock Data

### Scenario
Social media app needs extensive fake data for UI testing without creating thousands of accounts.

### Custom Configuration

**lib/main_dev.dart**
```dart
void main() {
  const environment = SocialFlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.socialapp.com',
    appName: 'SocialApp Dev',

    // Mock data settings
    useMockData: true,
    mockUserCount: 100,
    mockPostCount: 1000,
    mockNotificationCount: 50,

    // Performance settings
    enableInfiniteScroll: true,
    postsPerPage: 20,

    // Features
    enableVideoUpload: false, // Disabled in dev (large files)
    maxImageSizeMB: 1,        // Small images in dev
  );

  mainCommon(environment);
}
```

**lib/core/mock/mock_data_generator.dart**
```dart
class MockDataGenerator {
  final SocialFlavorConfig _config;

  MockDataGenerator(this._config);

  Future<void> initialize() async {
    if (!_config.useMockData) return;

    // Generate mock users
    final users = List.generate(
      _config.mockUserCount,
      (i) => User(
        id: 'mock_user_$i',
        username: 'testuser$i',
        displayName: 'Test User $i',
        avatar: 'https://i.pravatar.cc/150?img=$i',
        followers: Random().nextInt(1000),
        following: Random().nextInt(500),
      ),
    );

    await MockDatabase.insertUsers(users);

    // Generate mock posts
    final posts = List.generate(
      _config.mockPostCount,
      (i) => Post(
        id: 'mock_post_$i',
        userId: users[Random().nextInt(users.length)].id,
        content: _generateMockContent(),
        likes: Random().nextInt(500),
        comments: Random().nextInt(50),
        timestamp: DateTime.now().subtract(Duration(minutes: i)),
      ),
    );

    await MockDatabase.insertPosts(posts);
  }

  String _generateMockContent() {
    final templates = [
      'Just finished a great workout! 💪',
      'Beautiful sunset today 🌅',
      'Coffee and code ☕️💻',
      'New blog post is live! Check it out',
      'Throwback to last summer 🏖️',
    ];

    return templates[Random().nextInt(templates.length)];
  }
}
```

### Build Commands

```bash
# Dev - With mock data
flutter run --flavor dev -t lib/main_dev.dart

# Production - Real data
flutter build appbundle --flavor production -t lib/main_production.dart --release
```

### Expected Outcome
- ✅ Dev generates 100 fake users and 1000 fake posts
- ✅ Can test feed scrolling without creating real accounts
- ✅ Realistic fake data (names, avatars, content)
- ✅ Production uses real API with real users

---

## Example 6: Enterprise SaaS with Multi-Tenant

### Scenario
Enterprise SaaS app with different tenants (companies) for testing and production.

### Custom Configuration

**lib/main_dev.dart**
```dart
void main() {
  const environment = SaaSFlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.saasapp.com',
    appName: 'SaaSApp Dev',

    // Multi-tenant settings
    tenantId: 'test-tenant-1',
    tenantName: 'Test Company',

    // Feature flags per tenant
    enabledFeatures: [
      'basic_features',
      'premium_features',
      'enterprise_features', // All features enabled in dev
    ],

    // Limits
    maxUsers: 999999,        // Unlimited in dev
    maxStorage: 999999,      // Unlimited in dev
    apiRateLimit: 999999,    // Unlimited in dev
  );

  mainCommon(environment);
}
```

**lib/main_production.dart**
```dart
void main() {
  // Read tenant ID from environment or login
  final tenantId = const String.fromEnvironment('TENANT_ID', defaultValue: 'default');

  final environment = SaaSFlavorConfig(
    flavor: Flavor.production,
    apiBaseUrl: 'https://api.saasapp.com',
    appName: 'SaaSApp',

    // Multi-tenant settings (from API)
    tenantId: tenantId,
    tenantName: '', // Fetched from API after login

    // Feature flags (from API based on subscription)
    enabledFeatures: [], // Loaded dynamically

    // Limits (from API based on plan)
    maxUsers: 0,      // Loaded from API
    maxStorage: 0,    // Loaded from API
    apiRateLimit: 0,  // Loaded from API
  );

  mainCommon(environment);
}
```

**lib/core/tenant/tenant_manager.dart**
```dart
class TenantManager {
  final SaaSFlavorConfig _config;

  TenantManager(this._config);

  Future<void> loadTenantConfig() async {
    if (_config.isDev) {
      // Use hardcoded dev tenant config
      return;
    }

    // Fetch real tenant config from API
    final response = await _apiClient.get('/tenant/${_config.tenantId}/config');

    // Update flavor config with real values
    _config.updateFromApi(response.data);
  }

  bool hasFeature(String feature) {
    return _config.enabledFeatures.contains(feature);
  }

  bool canAddUser() {
    final currentUsers = UserRepository.count();
    return currentUsers < _config.maxUsers;
  }
}
```

### Build Commands

```bash
# Dev - Test tenant with all features
flutter run --flavor dev -t lib/main_dev.dart

# Production - Real tenant (loaded from API)
flutter build apk --flavor production -t lib/main_production.dart --release
```

### Expected Outcome
- ✅ Dev uses test tenant with unlimited features
- ✅ Production loads tenant config from API
- ✅ Feature flags control access to premium features
- ✅ Limits enforced based on subscription plan

---

## Example 7: FinTech App with Compliance Modes

### Scenario
FinTech app needs different compliance modes for testing (relaxed) and production (strict).

### Custom Configuration

**lib/main_dev.dart**
```dart
void main() {
  const environment = FinTechFlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.fintechapp.com',
    appName: 'FinTech Dev',

    // Compliance settings
    kycRequired: false,           // Skip KYC in dev
    amlChecksEnabled: false,      // Skip AML checks in dev
    transactionLimit: 999999.0,   // No limit in dev

    // Payment settings
    usePlaidSandbox: true,        // Plaid sandbox for bank linking
    useStripeSandbox: true,       // Stripe test mode

    // Security
    require2FA: false,            // No 2FA in dev
    encryptTransactions: false,   // Faster dev builds
  );

  mainCommon(environment);
}
```

**lib/main_production.dart**
```dart
void main() {
  const environment = FinTechFlavorConfig(
    flavor: Flavor.production,
    apiBaseUrl: 'https://api.fintechapp.com',
    appName: 'FinTech',

    // Compliance settings
    kycRequired: true,            // Full KYC verification
    amlChecksEnabled: true,       // AML checks on transactions
    transactionLimit: 10000.0,    // $10k daily limit

    // Payment settings
    usePlaidSandbox: false,       // Real bank linking
    useStripeSandbox: false,      // Live Stripe

    // Security
    require2FA: true,             // 2FA required
    encryptTransactions: true,    // Encrypt all transactions
  );

  mainCommon(environment);
}
```

**lib/core/compliance/kyc_service.dart**
```dart
class KYCService {
  final FinTechFlavorConfig _config;

  KYCService(this._config);

  Future<bool> verifyUser(User user) async {
    if (!_config.kycRequired) {
      // Skip KYC in dev
      return true;
    }

    // Real KYC verification in production
    final result = await _kycProvider.verify(
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      ssn: user.ssn,
      address: user.address,
    );

    return result.verified;
  }

  Future<bool> checkTransaction(Transaction transaction) async {
    if (!_config.amlChecksEnabled) {
      // Skip AML checks in dev
      return true;
    }

    // AML check in production
    if (transaction.amount > _config.transactionLimit) {
      await _flagForReview(transaction);
      return false;
    }

    final amlResult = await _amlProvider.check(transaction);
    return amlResult.passed;
  }
}
```

### Build Commands

```bash
# Dev - Relaxed compliance for testing
flutter run --flavor dev -t lib/main_dev.dart

# Production - Full compliance enabled
flutter build ios --flavor production -t lib/main_production.dart --release
```

### Expected Outcome
- ✅ Dev skips KYC/AML checks (faster testing)
- ✅ Dev uses Plaid sandbox (no real bank accounts)
- ✅ Production enforces full KYC verification
- ✅ Production has transaction limits and AML checks
- ✅ Production requires 2FA

---

## Example 8: Gaming App with Leaderboard Environments

### Scenario
Gaming app needs separate leaderboards for dev/staging/production to avoid mixing test scores with real scores.

### Custom Configuration

**lib/main_dev.dart**
```dart
void main() {
  const environment = GamingFlavorConfig(
    flavor: Flavor.dev,
    apiBaseUrl: 'https://dev-api.gamingapp.com',
    appName: 'MyGame Dev',

    // Leaderboard settings
    leaderboardId: 'dev-leaderboard',
    allowTestScores: true,
    resetLeaderboardDaily: true,

    // Game settings
    enableCheatCodes: true,       // Cheat codes in dev
    unlockAllLevels: true,        // All levels unlocked
    unlimitedLives: true,         // Infinite lives in dev
    skipTutorial: true,           // Skip tutorial

    // Monetization
    showAds: false,               // No ads in dev
    enableInAppPurchases: false,  // No IAP in dev
  );

  mainCommon(environment);
}
```

**lib/main_production.dart**
```dart
void main() {
  const environment = GamingFlavorConfig(
    flavor: Flavor.production,
    apiBaseUrl: 'https://api.gamingapp.com',
    appName: 'MyGame',

    // Leaderboard settings
    leaderboardId: 'global-leaderboard',
    allowTestScores: false,
    resetLeaderboardDaily: false,

    // Game settings
    enableCheatCodes: false,      // No cheats in production
    unlockAllLevels: false,       // Progress required
    unlimitedLives: false,        // Limited lives
    skipTutorial: false,          // Show tutorial

    // Monetization
    showAds: true,                // Show ads
    enableInAppPurchases: true,   // Enable IAP
  );

  mainCommon(environment);
}
```

**lib/game/leaderboard_service.dart**
```dart
class LeaderboardService {
  final GamingFlavorConfig _config;

  LeaderboardService(this._config);

  Future<void> submitScore(int score) async {
    // Validate score in production
    if (!_config.allowTestScores && _isObviouslyFake(score)) {
      throw InvalidScoreException('Score validation failed');
    }

    await _apiClient.post(
      '/leaderboards/${_config.leaderboardId}/scores',
      data: {
        'player_id': AuthService.currentUserId,
        'score': score,
        'timestamp': DateTime.now().toIso8601String(),
        'environment': _config.flavor.name,
      },
    );
  }

  Future<List<LeaderboardEntry>> getTopScores() async {
    final response = await _apiClient.get(
      '/leaderboards/${_config.leaderboardId}/top',
    );

    return (response.data as List)
        .map((e) => LeaderboardEntry.fromJson(e))
        .toList();
  }

  bool _isObviouslyFake(int score) {
    // Simple validation (extend as needed)
    const maxRealisticScore = 1000000;
    return score > maxRealisticScore;
  }
}
```

### Build Commands

```bash
# Dev - Test leaderboard with cheats enabled
flutter run --flavor dev -t lib/main_dev.dart

# Production - Real leaderboard, no cheats
flutter build apk --flavor production -t lib/main_production.dart --release
```

### Expected Outcome
- ✅ Dev uses separate test leaderboard
- ✅ Dev enables cheat codes for testing
- ✅ Dev unlocks all levels (faster testing)
- ✅ Production uses global leaderboard
- ✅ Production validates scores to prevent cheating
- ✅ Production shows ads and enables IAP

---

## Common Patterns Summary

### Pattern 1: API Endpoint Switching
All examples show different API endpoints per flavor - this is the **most common use case**.

### Pattern 2: Feature Flags
Most examples enable/disable features per flavor (e.g., analytics, cheat codes, compliance checks).

### Pattern 3: Mock Data
Dev flavors often use mock data for faster testing (social media, healthcare, gaming).

### Pattern 4: Security Levels
Production has strict security (encryption, 2FA, timeouts), dev has relaxed security.

### Pattern 5: Compliance Modes
Regulated industries (healthcare, fintech) have different compliance levels per flavor.

### Pattern 6: Monetization
Gaming and commercial apps disable ads/IAP in dev, enable in production.

---

## Quick Command Reference

```bash
# Run any example in dev
flutter run --flavor dev -t lib/main_dev.dart

# Build release APK
flutter build apk --flavor production -t lib/main_production.dart --release

# Build iOS release
flutter build ios --flavor production -t lib/main_production.dart --release

# Build app bundle (Play Store)
flutter build appbundle --flavor production -t lib/main_production.dart --release
```

---

**Version:** 1.0.0
**Last Updated:** 2025-10-24
**Skill ID:** flutter-flavors
**Category:** development-workflow
