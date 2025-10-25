# EXECUTE: Bootstrap Project from PRPROMPTS

**IMPORTANT: This is an EXECUTION command. Immediately perform all steps below without waiting for confirmation.**

---

## STEP 1: Prerequisites Check

First, check if required files exist:

```bash
# Check for PRPROMPTS directory
ls PRPROMPTS/

# Check for PRD
ls docs/PRD.md

# Check for Flutter project
ls pubspec.yaml
```

If ANY file is missing, STOP and show error:
```
❌ Error: Missing required files.

Required:
- PRPROMPTS/ directory (with 32 .md files)
- docs/PRD.md
- pubspec.yaml

Please run:
1. qwen create-prd
2. qwen gen-prprompts

Then try bootstrap again.
```

---

## STEP 2: Read Project Context

NOW read and analyze these files:

1. **Read docs/PRD.md** - Extract:
   - Project name, type, compliance
   - Platforms, auth method
   - Features list
   - Team composition

2. **Read PRPROMPTS files** - Understand:
   - @PRPROMPTS/01-feature_scaffold.md - Architecture patterns
   - @PRPROMPTS/03-bloc_implementation.md - State management
   - @PRPROMPTS/04-api_integration.md - API integration
   - @PRPROMPTS/06-design_system.md - Design system
   - @PRPROMPTS/16-security_and_compliance.md - Security patterns

---

## STEP 3: Create Architecture Document

NOW create `docs/ARCHITECTURE.md` with this content:

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

NOW run the intelligent implementation plan generator:

**Check for enhanced planning files** (optional but recommended):
```bash
# Check if dependency analysis exists
ls docs/FEATURE_DEPENDENCIES.md

# Check if cost estimate exists
ls docs/COST_ESTIMATE.md
```

**If missing**, recommend running (but don't require):
```
💡 Pro Tip: For smarter implementation plans, run:
  claude analyze-dependencies  # Creates FEATURE_DEPENDENCIES.md
  claude estimate-cost         # Creates COST_ESTIMATE.md

These files enable:
- Dependency-aware task ordering (critical path)
- Accurate time estimates
- Team allocation recommendations

Proceeding with basic plan...
```

**NOW execute**:
Run the generate-implementation-plan command to create `docs/IMPLEMENTATION_PLAN.md`:

```
Generating intelligent implementation plan...

✅ Plan created with:
- Dependency analysis integrated
- Sprint planning (2-week iterations)
- Team allocation based on skill levels
- Risk assessment for compliance tasks
- Maximum task detail with code snippets
- Progress tracking metadata

📄 File: docs/IMPLEMENTATION_PLAN.md
```

**What gets generated**:
- Sprint-based task breakdown (Phase 1, 2, 3...)
- Each task includes:
  - Owner assignment (based on PRD team_composition)
  - Story points and time estimates
  - Dependencies and blockers
  - PRPROMPTS references
  - Code snippets and test scenarios
  - Validation checklists
  - Security checklists (for HIPAA/PCI-DSS tasks)
- Critical path visualization
- Velocity tracking setup
- Risk register

**Note**: The generated plan is much more detailed than the basic template above. It includes maximum intelligence from PRD, FEATURE_DEPENDENCIES, and COST_ESTIMATE.

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
