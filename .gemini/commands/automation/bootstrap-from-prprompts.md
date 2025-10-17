# Bootstrap Project from PRPROMPTS

Fully automated project setup using generated PRPROMPTS as guidance.

## Prerequisites Check
1. Verify PRPROMPTS exists: Check `PRPROMPTS/` directory (should have 32 .md files)
2. Verify PRD exists: Check `docs/PRD.md`
3. Verify Flutter project initialized: Check `pubspec.yaml`

If any missing, exit with error message.

## Execution Steps

### 1. Analyze Generated PRPROMPTS
Read and understand project context from:
- @docs/PRD.md - Core requirements, features, compliance
- @PRPROMPTS/01-feature_scaffold.md - Architecture patterns
- @PRPROMPTS/03-bloc_implementation.md - State management approach
- @PRPROMPTS/04-api_integration.md - API and auth patterns
- @PRPROMPTS/06-design_system.md - Theme and design standards
- @PRPROMPTS/16-security_and_compliance.md - Security requirements

### 2. Run /init
- Generate CLAUDE.md with full project context
- Include references to key PRPROMPTS files
- Add project metadata from PRD

### 3. Generate Architecture Document
Create `docs/ARCHITECTURE.md` based on @PRPROMPTS/01-feature_scaffold.md:

```markdown
# Architecture Document

Generated from: PRPROMPTS/01-feature_scaffold.md
Date: [Current Date]

## Folder Structure

lib/
├── core/
│   ├── constants/          # App-wide constants
│   │   ├── app_colors.dart
│   │   ├── app_typography.dart
│   │   └── api_constants.dart
│   ├── errors/             # Error handling
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/            # HTTP client, interceptors
│   │   ├── api_client.dart
│   │   └── auth_interceptor.dart
│   ├── security/           # Encryption, secure storage
│   │   ├── encryption_service.dart
│   │   └── secure_storage_service.dart
│   └── utils/              # Utilities
│       ├── logger.dart
│       └── validators.dart
├── features/
│   └── [feature_name]/
│       ├── data/
│       │   ├── models/          # Data models with JSON
│       │   ├── repositories/    # Repository implementations
│       │   └── datasources/     # Remote/Local data sources
│       ├── domain/
│       │   ├── entities/        # Business objects
│       │   ├── repositories/    # Repository interfaces
│       │   └── usecases/        # Business logic
│       └── presentation/
│           ├── bloc/            # BLoC files
│           ├── pages/           # Full screens
│           └── widgets/         # Reusable components
└── shared/
    ├── theme/              # App theme
    │   └── app_theme.dart
    └── widgets/            # Shared widgets
        └── loading_indicator.dart

## State Management
Pattern: BLoC (Business Logic Component)
Reference: @PRPROMPTS/03-bloc_implementation.md

## Security Implementation
Compliance: [Extract from PRD.md compliance field]
Patterns: @PRPROMPTS/16-security_and_compliance.md

## API Integration
Auth Method: [Extract from PRD.md auth_method field]
JWT Verification: RS256 with public key only (no signing!)
Reference: @PRPROMPTS/04-api_integration.md
```

### 4. Generate Implementation Plan
Create `docs/IMPLEMENTATION_PLAN.md` with all features from PRD:

```markdown
# Implementation Plan

Generated from: docs/PRD.md
Date: [Current Date]

## Phase 1: Foundation & Architecture [CURRENT]

### Task 1.1: Create Folder Structure [TODO]
**PRPROMPTS:** @PRPROMPTS/01-feature_scaffold.md
**Description:** Set up Clean Architecture folders
**Files to create:**
- lib/core/constants/
- lib/core/errors/
- lib/core/network/
- lib/core/security/
- lib/features/
- lib/shared/theme/
**Validation:**
- [ ] All folders exist
- [ ] Matches architecture diagram
**Estimated:** 15 min

### Task 1.2: Setup Dependencies [TODO]
**PRPROMPTS:** @PRPROMPTS/04-api_integration.md, @PRPROMPTS/03-bloc_implementation.md
**Description:** Add required packages to pubspec.yaml
**Dependencies needed:**
- flutter_bloc
- equatable
- dio (HTTP client)
- get_it (DI)
- [Add based on PRD requirements]
**Validation:**
- [ ] pubspec.yaml updated
- [ ] flutter pub get successful
**Estimated:** 10 min

### Task 1.3: Create Design System [TODO]
**PRPROMPTS:** @PRPROMPTS/06-design_system.md
**Description:** Setup theme, colors, typography
**Files to create:**
- lib/shared/theme/app_theme.dart
- lib/core/constants/app_colors.dart
- lib/core/constants/app_typography.dart
- lib/core/constants/app_spacing.dart
**Validation:**
- [ ] No hardcoded colors in code
- [ ] Dark mode configured
- [ ] Material 3 enabled
**Estimated:** 30 min

### Task 1.4: Setup Security Infrastructure [TODO]
**PRPROMPTS:** @PRPROMPTS/16-security_and_compliance.md
**Description:** Configure encryption and secure storage
**Files to create:**
- lib/core/security/encryption_service.dart
- lib/core/security/secure_storage_service.dart
- lib/core/security/jwt_service.dart (verification only!)
**Validation:**
- [ ] AES-256-GCM encryption configured
- [ ] JWT verification uses RS256 (public key)
- [ ] No private keys in Flutter code
**Estimated:** 45 min

### Task 1.5: Create Test Infrastructure [TODO]
**PRPROMPTS:** @PRPROMPTS/05-testing_strategy.md
**Description:** Setup test folders and utilities
**Files to create:**
- test/helpers/test_helper.dart
- test/fixtures/fixture_reader.dart
- test_driver/integration_test.dart
**Validation:**
- [ ] Test folder structure matches lib/
- [ ] Mock generators configured
**Estimated:** 20 min

## Phase 2: Feature Implementation [TODO]

[For each feature in PRD, create tasks following pattern above]

### Task 2.1: [Feature 1] - Domain Layer [TODO]
**PRPROMPTS:** @PRPROMPTS/01-feature_scaffold.md
**Description:** Create entities, repositories, usecases
...

### Task 2.2: [Feature 1] - Data Layer [TODO]
**PRPROMPTS:** @PRPROMPTS/04-api_integration.md
...

### Task 2.3: [Feature 1] - Presentation Layer [TODO]
**PRPROMPTS:** @PRPROMPTS/03-bloc_implementation.md
...

[Continue for all features...]

## Phase 3: Testing & Polish [TODO]

### Task 3.1: Unit Tests [TODO]
### Task 3.2: Widget Tests [TODO]
### Task 3.3: Integration Tests [TODO]
### Task 3.4: Security Audit [TODO]

---
Progress: 0/[Total Tasks] (0%)
Current Phase: Phase 1
```

### 5. Create Project Structure
Execute folder creation:
```bash
mkdir -p lib/core/{constants,errors,network,security,utils}
mkdir -p lib/features
mkdir -p lib/shared/{theme,widgets}
mkdir -p test/{unit,widget,integration,helpers,fixtures}
```

### 6. Initialize Dependencies
Based on PRD requirements, add to pubspec.yaml:
```yaml
dependencies:
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  dio: ^5.3.3
  get_it: ^7.6.4
  flutter_secure_storage: ^9.0.0
  encrypt: ^5.0.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  bloc_test: ^9.1.5
  mocktail: ^1.0.0
  integration_test:
    sdk: flutter
```

Run: `flutter pub get`

### 7. Setup Design System
Create minimal theme files:

**lib/shared/theme/app_theme.dart:**
```dart
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
    ),
  );

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
    ),
  );
}
```

**lib/core/constants/app_colors.dart:**
```dart
import 'package:flutter/material.dart';

class AppColors {
  // Extract from PRD or use defaults
  static const Color primary = Color(0xFF6200EE);
  static const Color secondary = Color(0xFF03DAC6);
  static const Color error = Color(0xFFB00020);

  // Prevent instantiation
  AppColors._();
}
```

### 8. Create Security Infrastructure
**lib/core/security/jwt_service.dart:**
```dart
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

/// JWT Verification Service
///
/// IMPORTANT: Flutter should NEVER sign JWT tokens!
/// Only verify tokens using the public key.
/// Signing happens on the backend with private key.
///
/// Reference: @PRPROMPTS/16-security_and_compliance.md
class JwtService {
  final String publicKey;

  JwtService({required this.publicKey});

  /// Verify JWT token using RS256 algorithm
  ///
  /// Returns decoded payload if valid, throws exception if invalid
  Future<Map<String, dynamic>> verifyToken(String token) async {
    try {
      final jwt = JWT.verify(
        token,
        RSAPublicKey(publicKey),
        checkExpiresIn: true,
        checkNotBefore: true,
      );

      return jwt.payload as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Token verification failed: $e');
    }
  }
}
```

### 9. Create Test Infrastructure
**test/helpers/test_helper.dart:**
```dart
// Test utilities based on @PRPROMPTS/05-testing_strategy.md
// Add mock generators, test data, etc.
```

### 10. Update main.dart
```dart
import 'package:flutter/material.dart';
import 'shared/theme/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '[Extract from PRD]',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const Scaffold(
        body: Center(
          child: Text('Bootstrap Complete! Start implementing features.'),
        ),
      ),
    );
  }
}
```

### 11. Initial Commit
```bash
git add .
git commit -m "chore: bootstrap project from PRPROMPTS

- Created Clean Architecture folder structure
- Setup design system and theme (Material 3)
- Configured security infrastructure (JWT verification, encryption)
- Added test infrastructure
- Generated ARCHITECTURE.md and IMPLEMENTATION_PLAN.md

Reference: PRPROMPTS 01-feature_scaffold, 06-design_system, 16-security_and_compliance"
```

Create marker file:
```bash
touch .claude/BOOTSTRAP_COMPLETE
```

### 12. Status Report
Print comprehensive summary:
```
╔════════════════════════════════════════════════════════════╗
║          PROJECT BOOTSTRAP COMPLETE                        ║
╚════════════════════════════════════════════════════════════╝

✅ Architecture: Clean Architecture + BLoC
✅ PRPROMPTS: 32 guides integrated as development standards
✅ Security: [HIPAA/PCI-DSS/GDPR] patterns configured
✅ Theme: Material 3 with dark mode support
✅ Tests: Infrastructure ready

📁 Project Structure:
   lib/
   ├── core/          ✓ Created
   ├── features/      ✓ Ready for features
   └── shared/        ✓ Theme configured

📋 Documentation:
   ├── docs/PRD.md                      ✓ Exists
   ├── docs/ARCHITECTURE.md             ✓ Generated
   └── docs/IMPLEMENTATION_PLAN.md      ✓ Generated

🔐 Security Configured:
   ├── JWT Verification (RS256)         ✓ Ready
   ├── AES-256-GCM Encryption           ✓ Ready
   └── Secure Storage                   ✓ Ready

📊 Implementation Plan:
   Total Tasks: [X]
   Current: Task 1.1
   Progress: 0%

🚀 Next Steps:
   1. Review generated files
   2. Run: /implement-next to start building features
   3. Or run: /full-cycle to auto-implement multiple tasks

Ready to start implementation!
```
