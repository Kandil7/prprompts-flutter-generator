---
name: implement-next
description: "[prprompts] Auto-implement next feature from IMPLEMENTATION_PLAN.md (10 min)"
category: Automation
version: 4.0.0
tags: [prprompts, automation, implementation, flutter]
badge: NEW
---

# /implement-next - Auto-Implement Next Feature

✨ **v4.0 Automation** - Automatically implement the next feature from your `IMPLEMENTATION_PLAN.md` in ~10 minutes. Includes data layer, domain logic, BLoC state management, UI screens, and comprehensive tests.

## Usage

```bash
/implement-next
```

## What It Does

1. **Reads Implementation Plan:** Parses `IMPLEMENTATION_PLAN.md` to find next pending feature
2. **Consults PRPROMPTS:** References relevant PRPROMPTS guides (architecture, security, testing)
3. **Generates Code:** Creates all necessary files with Clean Architecture pattern
4. **Writes Tests:** Unit, widget, and integration tests (85%+ coverage)
5. **Validates:** Runs tests, linting, security checks
6. **Updates Plan:** Marks feature as complete in `IMPLEMENTATION_PLAN.md`

## Example Session

```
/implement-next

📋 Reading IMPLEMENTATION_PLAN.md...
✓ Found 7 features, 3 completed, 4 pending

Next Feature: "Appointment Scheduling"
Complexity: HIGH
Dependencies: [Authentication, Patient Profile]
Estimated Time: 45 minutes

🔍 Consulting PRPROMPTS...
✓ 02-state_management.md (BLoC patterns)
✓ 03-data_layer.md (Repository pattern)
✓ 11-testing_strategy.md (Test structure)
✓ 14-security_patterns.md (Authorization)
✓ 19-offline_sync.md (Offline-first)

🚀 Implementing Appointment Scheduling...

Phase 1: Data Layer (2 min)
✓ AppointmentModel (DTO with JSON serialization)
✓ Appointment entity (domain model)
✓ AppointmentRemoteDataSource (API calls)
✓ AppointmentLocalDataSource (Hive storage)
✓ AppointmentRepository (offline-first sync)

Phase 2: Domain Layer (1 min)
✓ GetAppointments use case
✓ BookAppointment use case
✓ CancelAppointment use case
✓ RescheduleAppointment use case

Phase 3: Presentation Layer (4 min)
✓ AppointmentBloc (state management)
✓ AppointmentEvent classes (4 events)
✓ AppointmentState classes (loading, loaded, error)
✓ AppointmentListPage (UI)
✓ BookAppointmentPage (form UI)
✓ AppointmentDetailsPage (details)

Phase 4: Testing (3 min)
✓ Repository unit tests (12 test cases)
✓ Use case unit tests (16 test cases)
✓ BLoC unit tests (23 test cases)
✓ Widget tests for all 3 screens (18 test cases)
✓ Integration test flow (book → view → cancel)

Phase 5: Validation
✓ flutter analyze (0 issues)
✓ flutter test (69 tests passed)
✓ Security scan (0 vulnerabilities)
✓ Coverage: 87.3% (target: 85%)

✅ Implementation Complete! (9 min 23 sec)

Generated:
- 23 Dart files (2,847 lines)
- 12 test files (1,923 lines)
- 69 test cases (87.3% coverage)

Updated IMPLEMENTATION_PLAN.md:
✓ Feature #4 marked complete
✓ Next: Feature #5 "Secure Messaging"

Commit suggestion:
  feat: implement appointment scheduling feature

  - Add appointment booking, viewing, canceling
  - Offline-first sync with Hive
  - 87.3% test coverage (69 tests)
  - HIPAA compliant (PHI encryption)

Run /review-and-commit? (y/n)
```

## Output Files

For each feature, generates:

### Data Layer
- `lib/features/{feature}/data/models/{feature}_model.dart`
- `lib/features/{feature}/data/datasources/{feature}_remote_datasource.dart`
- `lib/features/{feature}/data/datasources/{feature}_local_datasource.dart`
- `lib/features/{feature}/data/repositories/{feature}_repository_impl.dart`

### Domain Layer
- `lib/features/{feature}/domain/entities/{feature}.dart`
- `lib/features/{feature}/domain/repositories/{feature}_repository.dart`
- `lib/features/{feature}/domain/usecases/get_{feature}s.dart`
- `lib/features/{feature}/domain/usecases/create_{feature}.dart`

### Presentation Layer
- `lib/features/{feature}/presentation/bloc/{feature}_bloc.dart`
- `lib/features/{feature}/presentation/bloc/{feature}_event.dart`
- `lib/features/{feature}/presentation/bloc/{feature}_state.dart`
- `lib/features/{feature}/presentation/pages/{feature}_list_page.dart`
- `lib/features/{feature}/presentation/pages/{feature}_details_page.dart`
- `lib/features/{feature}/presentation/widgets/{feature}_card.dart`

### Tests
- `test/features/{feature}/data/repositories/{feature}_repository_impl_test.dart`
- `test/features/{feature}/domain/usecases/get_{feature}s_test.dart`
- `test/features/{feature}/presentation/bloc/{feature}_bloc_test.dart`
- `test/features/{feature}/presentation/pages/{feature}_list_page_test.dart`

## Complexity Handling

| Complexity | Estimated Time | Files Generated | Tests Generated |
|------------|---------------|----------------|-----------------|
| LOW | 5-8 min | 12-15 files | 30-40 tests |
| MEDIUM | 8-12 min | 18-25 files | 50-70 tests |
| HIGH | 12-18 min | 25-35 files | 70-100 tests |
| CRITICAL | 18-25 min | 35-50 files | 100-150 tests |

## Automatic Patterns

- **Authentication:** Auto-adds JWT token to requests
- **Authorization:** Role-based access control (RBAC)
- **Encryption:** PHI/PII encrypted at rest (AES-256-GCM)
- **Offline-First:** Hive caching with sync on reconnect
- **Error Handling:** Try-catch with custom exceptions
- **Logging:** Debug, info, error logs with context
- **Validation:** Input validation for forms
- **Accessibility:** Semantic labels, screen reader support

## Requirements

- **Bootstrap:** Must run `/bootstrap-from-prprompts` first
- **IMPLEMENTATION_PLAN.md:** Generated by bootstrap or manual
- **Dependencies:** `flutter pub get` completed

## Next Steps

After implementation:

1. **Review Code:** Check generated files
2. **Run App:** `flutter run` to test manually
3. **Commit:** `/review-and-commit` (validates & commits)
4. **Continue:** `/implement-next` for next feature, or `/full-cycle` for batch

## Related Commands

- `/bootstrap-from-prprompts` - Initial setup
- `/full-cycle` - Auto-implement 1-10 features in batch
- `/review-and-commit` - Validate & commit changes
- `/qa-check` - Comprehensive compliance audit

## Time Savings

**Manual Implementation:** 4-8 hours per feature (with tests)
**Auto-implementation:** 10-15 minutes per feature

**Speedup:** 20-30x faster per feature

---

**Powered by PRPROMPTS v4.0** | **40-60x Faster Development** | [Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)
