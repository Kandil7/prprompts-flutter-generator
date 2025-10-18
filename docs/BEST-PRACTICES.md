# PRPROMPTS Best Practices Guide

This guide provides recommendations for getting the most out of PRPROMPTS v4.0.

---

## Table of Contents

- [PRD Creation](#prd-creation)
- [PRPROMPTS Generation](#prprompts-generation)
- [Automation Workflow](#automation-workflow)
- [Code Quality](#code-quality)
- [Security](#security)
- [Testing](#testing)
- [Performance](#performance)
- [Team Collaboration](#team-collaboration)
- [Common Pitfalls](#common-pitfalls)
- [Advanced Patterns](#advanced-patterns)

---

## PRD Creation

### Be Specific and Detailed

**❌ Bad:**
```markdown
# My App

Build a healthcare app.
```

**✅ Good:**
```markdown
# HealthTrack Pro - Patient Management System

## Project Overview
HIPAA-compliant patient management system for small to medium medical practices.

## Target Users
- Doctors and nurses (primary users)
- Administrative staff
- Patients (limited portal access)

## Core Features
1. Patient Records Management
   - Demographics, medical history, allergies
   - PHI encryption at rest and in transit
   - Role-based access control

2. Appointment Scheduling
   - Calendar integration
   - Automated SMS/email reminders
   - Waitlist management

## Compliance Requirements
- HIPAA (mandatory)
- SOC2 Type II (desired)

## Technical Constraints
- Offline-first architecture required
- Must work on devices 3+ years old
- Maximum app size: 50MB
```

### Use the Right Creation Method

**Interactive (`prprompts create`)**: Best for new projects when you want guidance
```bash
# Use when:
# - Starting from scratch
# - Unsure about structure
# - Want step-by-step prompts
prprompts create
```

**Auto (`prprompts auto`)**: Best when you have a clear description
```bash
# Use when:
# - You have detailed requirements doc
# - Want AI to structure the PRD
# - Familiar with PRD format
prprompts auto
```

**From Files (`prprompts from-files`)**: Best for existing documentation
```bash
# Use when:
# - Migrating from other tools
# - Have multiple requirement docs
# - Aggregating team inputs
prprompts from-files --dir ./requirements/
```

**Manual (`prprompts manual`)**: Best when you know exactly what you need
```bash
# Use when:
# - Expert user
# - Have specific PRD template
# - Need full control
prprompts manual
```

### Include All Critical Sections

**Essential Sections:**
1. **Project Overview** - What, why, and for whom
2. **Features** - Detailed feature list with priorities
3. **Technical Requirements** - Platforms, frameworks, constraints
4. **Compliance** - HIPAA, PCI-DSS, GDPR, etc.
5. **User Personas** - Who will use this and how
6. **Success Metrics** - How to measure success
7. **Timeline** - Key milestones (optional but helpful)
8. **Assumptions** - What you're assuming is true

### Prioritize Features

```markdown
## Features

### Must Have (MVP)
- User authentication
- Basic CRUD for main entity
- Data persistence

### Should Have (Phase 2)
- Advanced search and filtering
- Analytics dashboard
- Export functionality

### Nice to Have (Future)
- AI-powered recommendations
- Multi-language support
- Dark mode
```

---

## PRPROMPTS Generation

### Always Validate After Generation

```bash
# Generate PRPROMPTS
prprompts generate

# Verify all files created
ls -la .claude/prompts/prprompts/core/
ls -la .claude/prompts/prprompts/automation/

# Validate structure
prprompts validate

# Expected output:
# ✓ 32 core PRPROMPTS found
# ✓ 5 automation PRPROMPTS found
# ✓ All files valid
```

### Review Generated Content

**Don't blindly trust AI** - Review key prompts:

```bash
# Review critical prompts
cat .claude/prompts/prprompts/core/05-architecture-setup-clean-bloc.md
cat .claude/prompts/prprompts/core/15-security-hipaa-compliance.md
cat .claude/prompts/prprompts/core/22-testing-unit-widget-integration.md
```

**Look for:**
- ✅ Project-specific examples (not generic)
- ✅ Compliance requirements mentioned
- ✅ Technical constraints reflected
- ❌ Generic placeholders like "YourApp"
- ❌ Wrong compliance framework mentioned
- ❌ Missing critical features

### Regenerate if Needed

```bash
# If PRPROMPTS are too generic
rm -rf .claude/prompts/prprompts/

# Improve PRD with more details
nano docs/PRD.md

# Regenerate
prprompts generate
```

---

## Automation Workflow

### Recommended Workflow

**1. Start with Bootstrap**
```
/prp-bootstrap-from-prprompts
```
- Creates complete project structure
- Sets up architecture
- Configures dependencies
- **Time:** 5-10 minutes
- **Run:** Once per project

**2. Implement Features Incrementally**
```
/prp-full-cycle Create user authentication with OAuth
```
- Complete feature implementation
- Includes tests
- Production-ready
- **Time:** 30-60 minutes per feature
- **Run:** Once per major feature

**3. Add Smaller Features**
```
/prp-implement-next Add password reset functionality
```
- Integrates with existing code
- Follows established patterns
- **Time:** 15-30 minutes
- **Run:** Multiple times

**4. Review Before Committing**
```
/prp-review-and-commit
```
- Automated code review
- Security checks
- Git commit with proper message
- **Time:** 2-5 minutes
- **Run:** After each feature or set of changes

**5. QA Check**
```
/prp-qa-check
```
- Comprehensive quality analysis
- Performance checks
- Compliance validation
- **Time:** 3-7 minutes
- **Run:** Before releases or major merges

### Be Specific in Commands

**❌ Vague:**
```
/prp-full-cycle Add payments
```

**✅ Specific:**
```
/prp-full-cycle Create PCI-DSS compliant payment processing with:
- Stripe integration
- Card tokenization (no storage)
- 3D Secure authentication
- Payment history tracking
- Refund handling
- Unit, widget, and integration tests
- Error handling for network failures
- Retry logic for failed payments
```

### Break Down Complex Features

**❌ Too Large:**
```
/prp-full-cycle Build complete e-commerce platform
```

**✅ Manageable:**
```
# Day 1
/prp-full-cycle Create product catalog with search and filters

# Day 2
/prp-full-cycle Create shopping cart with real-time sync

# Day 3
/prp-full-cycle Create secure checkout with Stripe

# Day 4
/prp-full-cycle Create order management system
```

### Use the Right Command for the Task

| Command | Best For | Time | Complexity |
|---------|----------|------|------------|
| `/prp-bootstrap-from-prprompts` | Initial project setup | 5-10 min | Full project |
| `/prp-full-cycle` | Complete new feature | 30-60 min | Major feature |
| `/prp-implement-next` | Next item from PRD | 20-40 min | Medium feature |
| `/prp-review-and-commit` | Code review + commit | 2-5 min | Current changes |
| `/prp-qa-check` | Quality analysis | 3-7 min | Entire codebase |

---

## Code Quality

### Follow Clean Architecture

**Always maintain layer separation:**

```dart
// ✅ Good: Clear layer separation
lib/
├── core/
├── features/
│   └── patients/
│       ├── data/        // Data sources, models, repo implementations
│       ├── domain/      // Entities, repo interfaces, use cases
│       └── presentation/ // BLoC, pages, widgets

// ❌ Bad: Mixed concerns
lib/
├── models/  // Where do these belong?
├── screens/
└── utils/   // Too generic
```

### Use Dependency Injection

```dart
// ✅ Good: Injectable
@module
abstract class PatientModule {
  @lazySingleton
  PatientRepository provideRepository(
    PatientRemoteDataSource remoteDataSource,
    AuditLogger auditLogger,
  ) => PatientRepositoryImpl(
    remoteDataSource: remoteDataSource,
    auditLogger: auditLogger,
  );
}

// ❌ Bad: Direct instantiation
class PatientBloc {
  final repository = PatientRepositoryImpl(
    PatientRemoteDataSource(),
    AuditLogger(),
  ); // Hard to test, tightly coupled
}
```

### Write Testable Code

```dart
// ✅ Good: Easy to test
class GetPatient extends UseCase<Patient, String> {
  final PatientRepository repository;

  GetPatient(this.repository);

  @override
  Future<Either<Failure, Patient>> call(String id) {
    return repository.getPatient(id);
  }
}

// ❌ Bad: Hard to test
class PatientService {
  Future<Patient> getPatient(String id) async {
    final response = await http.get('https://api.com/patients/$id');
    return Patient.fromJson(json.decode(response.body));
    // Directly depends on http, hard to mock
  }
}
```

### Use Immutable Models

```dart
// ✅ Good: Freezed for immutability
@freezed
class Patient with _$Patient {
  const factory Patient({
    required String id,
    required String name,
    required DateTime dateOfBirth,
  }) = _Patient;
}

// ❌ Bad: Mutable
class Patient {
  String id;
  String name;
  DateTime dateOfBirth;

  Patient({this.id, this.name, this.dateOfBirth});
  // Can be modified after creation
}
```

---

## Security

### Never Store Sensitive Data Locally (Unencrypted)

```dart
// ❌ Bad: Plain text storage
final prefs = await SharedPreferences.getInstance();
await prefs.setString('ssn', patient.ssn);
await prefs.setString('credit_card', card.number);

// ✅ Good: Encrypted storage
final secureStorage = FlutterSecureStorage();
await secureStorage.write(
  key: 'patient_${patient.id}_ssn',
  value: EncryptionService.encrypt(patient.ssn),
);

// ✅ Better: Don't store at all (use tokens)
await secureStorage.write(
  key: 'patient_token',
  value: patient.token, // Token, not actual SSN
);
```

### Always Use HTTPS

```dart
// ✅ Good: Enforce HTTPS
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com', // HTTPS
  connectTimeout: Duration(seconds: 10),
  validateStatus: (status) => status! < 500,
));

// ❌ Bad: HTTP
final response = await http.get('http://api.example.com/patients');
```

### Implement Proper Authentication

```dart
// ✅ Good: JWT with refresh tokens
class AuthService {
  Future<void> refreshToken() async {
    final refreshToken = await _secureStorage.read(key: 'refresh_token');
    final response = await _api.post('/auth/refresh', {
      'refresh_token': refreshToken,
    });

    await _secureStorage.write(
      key: 'access_token',
      value: response.data['access_token'],
    );
  }

  Future<void> logout() async {
    await _secureStorage.deleteAll();
    await _api.post('/auth/logout');
  }
}

// ❌ Bad: Long-lived tokens
final token = await prefs.getString('token'); // Never expires
```

### Audit Logging for Compliance

```dart
// ✅ Good: HIPAA audit logging
class PatientRepository {
  Future<Patient> getPatient(String id) async {
    // Log WHO accessed WHAT, WHEN, and WHY
    await _auditLogger.log(
      action: AuditAction.patientView,
      userId: _currentUser.id,
      resourceId: id,
      resourceType: 'Patient',
      timestamp: DateTime.now(),
      ipAddress: await _getIpAddress(),
      reason: 'Patient record viewed',
    );

    return await _remoteDataSource.getPatient(id);
  }
}

// ❌ Bad: No audit trail
Future<Patient> getPatient(String id) async {
  return await _api.get('/patients/$id');
  // No record of who accessed what
}
```

---

## Testing

### Write Tests for All Layers

**Repository Tests:**
```dart
test('should log patient access for HIPAA compliance', () async {
  // Arrange
  when(mockRemoteDataSource.getPatient(any))
      .thenAnswer((_) async => tPatientModel);

  // Act
  await repository.getPatient(tPatientId);

  // Assert
  verify(mockAuditLogger.log(
    action: AuditAction.patientView,
    resourceId: tPatientId,
    resourceType: 'Patient',
  ));
});
```

**BLoC Tests:**
```dart
blocTest<PatientBloc, PatientState>(
  'should emit [Loading, Loaded] when GetPatient succeeds',
  build: () {
    when(mockGetPatient(any))
        .thenAnswer((_) async => Right(tPatient));
    return patientBloc;
  },
  act: (bloc) => bloc.add(GetPatientEvent(tPatientId)),
  expect: () => [
    PatientLoading(),
    PatientLoaded(patient: tPatient),
  ],
);
```

**Widget Tests:**
```dart
testWidgets('should display patient name when loaded', (tester) async {
  // Arrange
  await tester.pumpWidget(
    MaterialApp(
      home: BlocProvider(
        create: (_) => mockPatientBloc,
        child: PatientDetailPage(),
      ),
    ),
  );

  when(() => mockPatientBloc.state)
      .thenReturn(PatientLoaded(patient: tPatient));

  // Act
  await tester.pump();

  // Assert
  expect(find.text(tPatient.name), findsOneWidget);
});
```

### Aim for High Coverage

**Targets:**
- Repositories: 90%+
- Use Cases: 95%+
- BLoC: 85%+
- Widgets: 70%+
- Overall: 80%+

```bash
# Run tests with coverage
flutter test --coverage

# Generate HTML report
genhtml coverage/lcov.info -o coverage/html

# Open in browser
open coverage/html/index.html
```

### Test Edge Cases

```dart
// ✅ Good: Test edge cases
group('PatientRepository', () {
  test('should handle network timeout', () async {
    when(mockRemoteDataSource.getPatient(any))
        .thenThrow(TimeoutException('Connection timeout'));

    final result = await repository.getPatient(tPatientId);

    expect(result, Left(NetworkFailure()));
  });

  test('should handle unauthorized access', () async {
    when(mockRemoteDataSource.getPatient(any))
        .thenThrow(UnauthorizedException());

    final result = await repository.getPatient(tPatientId);

    expect(result, Left(UnauthorizedFailure()));
  });

  test('should handle malformed data', () async {
    when(mockRemoteDataSource.getPatient(any))
        .thenThrow(FormatException('Invalid JSON'));

    final result = await repository.getPatient(tPatientId);

    expect(result, Left(ServerFailure()));
  });
});
```

---

## Performance

### Use Lazy Loading

```dart
// ✅ Good: Paginated loading
class PatientListBloc {
  Future<void> loadMorePatients() async {
    if (state.hasReachedMax) return;

    final result = await getPatients(Params(
      offset: state.patients.length,
      limit: 20,
    ));

    result.fold(
      (failure) => emit(state.copyWith(hasError: true)),
      (patients) => emit(state.copyWith(
        patients: state.patients + patients,
        hasReachedMax: patients.length < 20,
      )),
    );
  }
}

// ❌ Bad: Load everything at once
Future<List<Patient>> getAllPatients() async {
  return await repository.getPatients(); // Could be thousands
}
```

### Cache Appropriately

```dart
// ✅ Good: Cache with TTL
class PatientLocalDataSource {
  Future<Patient?> getCachedPatient(String id) async {
    final cached = await _database.getPatient(id);

    if (cached == null) return null;

    // Cache expires after 5 minutes
    if (DateTime.now().difference(cached.cachedAt) > Duration(minutes: 5)) {
      await _database.deletePatient(id);
      return null;
    }

    return cached;
  }
}

// ❌ Bad: Cache forever
Future<Patient?> getCachedPatient(String id) async {
  return await _database.getPatient(id); // Never refreshes
}
```

### Optimize Images

```dart
// ✅ Good: Cached and sized images
CachedNetworkImage(
  imageUrl: patient.photoUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  fit: BoxFit.cover,
  width: 100,
  height: 100,
  memCacheWidth: 100,
  memCacheHeight: 100,
)

// ❌ Bad: Load full resolution
Image.network(
  patient.photoUrl,
  // Loads full 4K image even if displaying at 100x100
)
```

### Use const Widgets

```dart
// ✅ Good: Const widgets
class PatientCard extends StatelessWidget {
  final Patient patient;

  const PatientCard({Key? key, required this.patient}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(patient.name),
        subtitle: const Text('Tap to view details'), // const
        trailing: const Icon(Icons.arrow_forward), // const
      ),
    );
  }
}

// ❌ Bad: Recreated on every build
Widget build(BuildContext context) {
  return Card(
    child: ListTile(
      title: Text(patient.name),
      subtitle: Text('Tap to view details'), // Recreated
      trailing: Icon(Icons.arrow_forward), // Recreated
    ),
  );
}
```

---

## Team Collaboration

### Use Consistent Naming Conventions

```dart
// Files: snake_case
patient_repository.dart
get_patient.dart

// Classes: PascalCase
class PatientRepository {}
class GetPatient {}

// Variables/functions: camelCase
final patientRepository = ...;
void getPatient() {}

// Constants: lowerCamelCase
const maxRetries = 3;

// Enums: PascalCase
enum PatientStatus { active, inactive }
```

### Document Complex Logic

```dart
// ✅ Good: Documented
/// Calculates the patient's age based on date of birth.
///
/// Uses the current date to determine age. Returns null if
/// the date of birth is in the future (data error).
///
/// Example:
/// ```dart
/// final age = calculateAge(DateTime(1990, 1, 1));
/// print(age); // 34 (as of 2024)
/// ```
int? calculateAge(DateTime dateOfBirth) {
  final now = DateTime.now();
  if (dateOfBirth.isAfter(now)) return null;

  int age = now.year - dateOfBirth.year;
  if (now.month < dateOfBirth.month ||
      (now.month == dateOfBirth.month && now.day < dateOfBirth.day)) {
    age--;
  }
  return age;
}

// ❌ Bad: No documentation
int? calculateAge(DateTime dob) {
  final n = DateTime.now();
  if (dob.isAfter(n)) return null;
  int a = n.year - dob.year;
  if (n.month < dob.month || (n.month == dob.month && n.day < dob.day)) a--;
  return a;
}
```

### Use Version Control Properly

```bash
# ✅ Good: Descriptive commit messages
git commit -m "feat: add HIPAA audit logging to patient repository

- Log all patient record access
- Include user ID, timestamp, IP address
- Store logs in separate audit table
- Complies with HIPAA access tracking requirements

Fixes #123"

# ❌ Bad: Vague messages
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "updates"
```

### Code Review Checklist

**Before requesting review:**
- [ ] All tests pass
- [ ] No console.log or print statements
- [ ] No commented-out code
- [ ] Formatted with `flutter format .`
- [ ] No linting errors
- [ ] Updated documentation if needed
- [ ] Added tests for new code
- [ ] Checked for security issues
- [ ] Verified performance is acceptable

---

## Common Pitfalls

### Pitfall 1: Skipping PRD

**❌ Problem:**
```bash
# Skipping PRD creation
prprompts generate  # Error: No PRD found
```

**✅ Solution:**
Always create a PRD first, even if simple:
```bash
prprompts create
prprompts generate
```

### Pitfall 2: Generic PRD

**❌ Problem:**
```markdown
# My App
Build an app.
```

**✅ Solution:**
Be specific about features, compliance, and constraints.

### Pitfall 3: Not Reviewing Generated Code

**❌ Problem:**
```
/prp-bootstrap-from-prprompts
# Blindly accept all generated code
git add .
git commit -m "initial commit"
```

**✅ Solution:**
Review critical files:
```bash
# Review architecture
cat lib/main.dart
cat lib/core/config/app_config.dart

# Review security
cat lib/core/security/encryption_service.dart

# Run tests
flutter test

# Then commit
git add .
git commit -m "feat: initial project setup with Clean Architecture"
```

### Pitfall 4: Overloading Single Command

**❌ Problem:**
```
/prp-full-cycle Build complete app with all features
```

**✅ Solution:**
Break into manageable chunks:
```
/prp-full-cycle Create authentication
/prp-full-cycle Create patient records
/prp-full-cycle Create appointments
```

### Pitfall 5: Ignoring Test Failures

**❌ Problem:**
```bash
flutter test
# 15 tests failed
# Ignore and continue
```

**✅ Solution:**
Fix tests immediately:
```bash
flutter test
# If failures, investigate:
flutter test --reporter expanded
# Fix issues before proceeding
```

---

## Advanced Patterns

### Pattern 1: Feature Flags

```dart
// Implement feature flags for gradual rollout
class FeatureFlags {
  static const bool enableNewDashboard = bool.fromEnvironment(
    'ENABLE_NEW_DASHBOARD',
    defaultValue: false,
  );

  static const bool enableAIRecommendations = bool.fromEnvironment(
    'ENABLE_AI_RECOMMENDATIONS',
    defaultValue: false,
  );
}

// Usage
Widget build(BuildContext context) {
  if (FeatureFlags.enableNewDashboard) {
    return NewDashboard();
  }
  return OldDashboard();
}
```

### Pattern 2: Offline-First with Sync

```dart
// Repository handles online/offline seamlessly
class PatientRepositoryImpl implements PatientRepository {
  @override
  Future<Either<Failure, Patient>> getPatient(String id) async {
    // Try cache first
    final cached = await localDataSource.getCachedPatient(id);

    if (await networkInfo.isConnected) {
      try {
        // Fetch from network
        final patient = await remoteDataSource.getPatient(id);

        // Update cache
        await localDataSource.cachePatient(patient);

        return Right(patient);
      } catch (e) {
        // Network failed, use cache if available
        if (cached != null) {
          return Right(cached);
        }
        return Left(ServerFailure());
      }
    } else {
      // Offline, use cache
      if (cached != null) {
        return Right(cached);
      }
      return Left(NetworkFailure());
    }
  }
}
```

### Pattern 3: Multi-Tenancy

```dart
// Support multiple organizations/tenants
class TenantService {
  String getCurrentTenantId() {
    return _secureStorage.read('tenant_id');
  }

  Future<void> switchTenant(String tenantId) async {
    await _secureStorage.write('tenant_id', tenantId);
    // Clear local cache
    await _database.clearAll();
    // Reload data for new tenant
    await _loadTenantData();
  }
}

// All API calls include tenant context
class ApiClient {
  Future<Response> get(String path) async {
    final tenantId = _tenantService.getCurrentTenantId();
    return await _dio.get(
      path,
      headers: {'X-Tenant-ID': tenantId},
    );
  }
}
```

### Pattern 4: Event Sourcing

```dart
// Store events instead of current state
class PatientEventStore {
  Future<void> addEvent(PatientEvent event) async {
    await _database.insert('events', event.toJson());
    await _processEvent(event);
  }

  Future<Patient> rebuildState(String patientId) async {
    final events = await _database.query(
      'events',
      where: 'patient_id = ?',
      whereArgs: [patientId],
      orderBy: 'timestamp ASC',
    );

    // Rebuild state from events
    Patient patient;
    for (final event in events) {
      patient = _applyEvent(patient, PatientEvent.fromJson(event));
    }
    return patient;
  }
}
```

### Pattern 5: CQRS (Command Query Responsibility Segregation)

```dart
// Separate read and write models
abstract class PatientCommands {
  Future<void> createPatient(CreatePatientCommand command);
  Future<void> updatePatient(UpdatePatientCommand command);
  Future<void> deletePatient(DeletePatientCommand command);
}

abstract class PatientQueries {
  Future<PatientDetailDto> getPatientById(String id);
  Future<List<PatientListItemDto>> searchPatients(SearchParams params);
  Future<PatientStatisticsDto> getStatistics();
}

// Different models optimized for their purpose
class PatientDetailDto {
  // All fields for detail view
}

class PatientListItemDto {
  // Only fields needed for list
  final String id;
  final String name;
  final int age;
}
```

---

## Summary

### Quick Wins

1. **Always create a detailed PRD** - Saves time later
2. **Review generated PRPROMPTS** - Ensure quality
3. **Start with bootstrap** - Get architecture right
4. **Break down features** - Easier to manage
5. **Test as you go** - Don't accumulate debt
6. **Use automation commands** - Save 40-60x time
7. **Follow security best practices** - Compliance from day one
8. **Document complex logic** - Help future you
9. **Review before committing** - Use `/prp-review-and-commit`
10. **Run QA checks** - Use `/prp-qa-check` before releases

### Continuous Improvement

- **Learn from each project** - Note what works
- **Refine PRD templates** - Reuse successful patterns
- **Build internal libraries** - Share common code
- **Measure and optimize** - Track time savings
- **Share knowledge** - Help team members

---

**Remember:** PRPROMPTS is a tool to accelerate development, not replace thoughtful design. The best results come from combining PRPROMPTS automation with your expertise and judgment.

---

**Last Updated:** 2025-01-18
**PRPROMPTS Version:** 4.0.0
