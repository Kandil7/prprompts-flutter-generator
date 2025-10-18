---
name: bootstrap-from-prprompts
description: "[prprompts] Complete project setup from PRPROMPTS (2 min)"
category: Automation
version: 4.0.0
tags: [prprompts, automation, bootstrap, setup, flutter]
badge: NEW
---

# /bootstrap-from-prprompts - Complete Project Setup

🚀 **v4.0 Automation** - Complete project setup from PRPROMPTS in ~2 minutes. Sets up Clean Architecture structure, security patterns, state management, dependency injection, and comprehensive test infrastructure.

## Usage

```bash
/bootstrap-from-prprompts
```

## What It Does

Reads `PRPROMPTS/` directory and auto-generates:

### 1. Project Structure (Clean Architecture)
```
lib/
├── core/
│   ├── di/           # Dependency injection
│   ├── error/        # Error handling
│   ├── network/      # API client
│   └── utils/        # Shared utilities
├── features/
│   └── auth/
│       ├── data/     # Repositories & data sources
│       ├── domain/   # Entities & use cases
│       └── presentation/  # BLoC & UI
└── main.dart
```

### 2. Core Infrastructure
- **Dependency Injection:** GetIt service locator
- **State Management:** BLoC with event/state classes
- **API Client:** Dio with interceptors (auth, logging, retry)
- **Error Handling:** Custom exceptions & error boundaries
- **Storage:** Hive for local data, secure_storage for tokens
- **Navigation:** GoRouter with deep linking
- **Logging:** Logger with multiple transports

### 3. Security Setup
- **Authentication:** JWT/OAuth2 token management
- **Encryption:** AES-256-GCM for sensitive data
- **Certificate Pinning:** TLS/SSL validation
- **Biometric Auth:** Local auth integration
- **Secure Storage:** Flutter secure storage for tokens/keys

### 4. Testing Infrastructure
- **Unit Tests:** Test structure for repositories, use cases
- **Widget Tests:** Test harness for BLoCs and screens
- **Integration Tests:** E2E test flows
- **Mocks:** Mock data sources and repositories
- **Coverage:** Configured for 85%+ coverage

### 5. Configuration
- **Environment:** Development, staging, production configs
- **Build Flavors:** Separate flavor configurations
- **CI/CD:** GitHub Actions workflow (optional)
- **Code Analysis:** Analysis_options.yaml with strict rules

## Example Session

```
/bootstrap-from-prprompts

🚀 Bootstrapping from PRPROMPTS...

Reading PRPROMPTS files...
✓ Found 32 PRPROMPTS files
✓ Detected: HIPAA compliance, JWT auth, offline-first

Phase 1: Project Structure
✓ Created lib/core/ (15 files)
✓ Created lib/features/auth/ (23 files)
✓ Created test/ structure (12 files)

Phase 2: Core Infrastructure
✓ Dependency injection (GetIt)
✓ API client (Dio + interceptors)
✓ Error handling (CustomException)
✓ Local storage (Hive + secure_storage)
✓ Navigation (GoRouter)
✓ Logging (logger + firebase_analytics)

Phase 3: Security Setup
✓ JWT RS256 authentication flows
✓ AES-256-GCM encryption helpers
✓ Certificate pinning configuration
✓ Biometric authentication
✓ Secure storage wrapper

Phase 4: Testing Infrastructure
✓ Unit test structure
✓ Widget test harness
✓ Integration test flows
✓ Mock implementations
✓ Coverage configuration (85%+)

Phase 5: Configuration
✓ Environment configs (dev, staging, prod)
✓ Build flavors setup
✓ GitHub Actions workflow
✓ Analysis options (strict)

📦 Bootstrap Complete! (1 min 47 sec)

Generated:
- 147 Dart files (12,843 lines)
- 52 test files (4,291 lines)
- 85%+ test coverage setup
- Security patterns: HIPAA compliant

Next Steps:
1. flutter pub get
2. flutter test (should pass)
3. /implement-next (to auto-implement first feature)

Ready to implement features? (y/n)
```

## Output

### Files Created (~147 files)

**Core Infrastructure:**
- `lib/core/di/injection.dart` - GetIt setup
- `lib/core/network/api_client.dart` - Dio client
- `lib/core/error/exceptions.dart` - Custom exceptions
- `lib/core/error/failures.dart` - Failure types
- `lib/core/utils/encryption_helper.dart` - AES encryption
- `lib/core/utils/logger.dart` - Logging setup

**Authentication Feature:**
- `lib/features/auth/data/repositories/auth_repository_impl.dart`
- `lib/features/auth/data/datasources/auth_remote_datasource.dart`
- `lib/features/auth/data/models/user_model.dart`
- `lib/features/auth/domain/entities/user.dart`
- `lib/features/auth/domain/usecases/login.dart`
- `lib/features/auth/presentation/bloc/auth_bloc.dart`
- `lib/features/auth/presentation/pages/login_page.dart`

**Tests:**
- `test/core/network/api_client_test.dart`
- `test/features/auth/data/repositories/auth_repository_impl_test.dart`
- `test/features/auth/presentation/bloc/auth_bloc_test.dart`

## Customization

Bootstrap adapts based on PRD configuration:

| PRD Setting | Bootstrap Behavior |
|-------------|-------------------|
| `compliance: [hipaa]` | PHI encryption, audit logging, access controls |
| `auth_method: oauth2` | OAuth2 flow instead of JWT |
| `offline_support: true` | Offline-first repository pattern |
| `real_time: true` | WebSocket setup in API client |
| `state_management: riverpod` | Riverpod instead of BLoC |
| `backend_type: graphql` | GraphQL client instead of REST |

## Requirements

- **PRPROMPTS:** Must have generated PRPROMPTS first (`/gen-prprompts`)
- **Flutter:** 3.0.0+
- **Dart:** 3.0.0+

## Next Steps

After bootstrapping:

1. **Install Dependencies:** `flutter pub get`
2. **Run Tests:** `flutter test` (should all pass)
3. **Implement Features:** `/implement-next` or `/full-cycle`
4. **QA Check:** `/qa-check` (generates compliance report)

## Related Commands

- `/gen-prprompts` - Generate PRPROMPTS first
- `/implement-next` - Auto-implement next feature (10 min)
- `/full-cycle` - Auto-implement 1-10 features (1-2 hours)
- `/review-and-commit` - Validate & commit changes
- `/qa-check` - Comprehensive compliance audit

## Time Savings

**Manual Setup:** 3-5 days for experienced developer
**Bootstrap:** ~2 minutes

**Speedup:** 40-60x faster

---

**Powered by PRPROMPTS v4.0** | **40-60x Faster Development** | [Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)
