# Feature Implementation Automation - Complete Guide

> **Automatically implement Flutter features from specifications in 3-8 minutes**
>
> Transforms feature specifications into production-ready code following Clean Architecture patterns with comprehensive testing and security validation.

---

## Table of Contents

- [Quick Start](#quick-start)
- [For Junior Developers - ELI5](#for-junior-developers---eli5)
- [For Intermediate Developers](#for-intermediate-developers)
- [For Senior Developers](#for-senior-developers)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Quick Start

### Prerequisites

1. **Flutter Bootstrapper** completed:
   ```bash
   @claude use skill automation/flutter-bootstrapper
   ```

2. **IMPLEMENTATION_PLAN.md** exists:
   ```bash
   test -f docs/IMPLEMENTATION_PLAN.md
   ```

3. **PRPROMPTS files** generated:
   ```bash
   ls PRPROMPTS/*.md | wc -l  # Should show 32
   ```

### Basic Usage

```bash
# Implement a feature from IMPLEMENTATION_PLAN.md
@claude use skill automation/feature-implementer

# When prompted, provide:
# - Feature name: "authentication"
# - Test coverage target: 75 (default: 70%)
```

### What Gets Created

For a feature named "authentication", this skill creates:

```
lib/features/auth/
├── domain/
│   ├── entities/
│   │   ├── user.dart
│   │   └── auth_tokens.dart
│   ├── repositories/
│   │   └── auth_repository.dart
│   └── usecases/
│       ├── login_with_email.dart
│       ├── register_with_email.dart
│       ├── logout.dart
│       ├── get_current_user.dart
│       └── refresh_token.dart
├── data/
│   ├── models/
│   │   ├── user_model.dart
│   │   └── auth_tokens_model.dart
│   ├── datasources/
│   │   ├── auth_remote_data_source.dart
│   │   └── auth_local_data_source.dart
│   └── repositories/
│       └── auth_repository_impl.dart
└── presentation/
    ├── bloc/
    │   ├── auth_bloc.dart
    │   ├── auth_event.dart
    │   └── auth_state.dart
    ├── pages/
    │   ├── login_screen.dart
    │   ├── register_screen.dart
    │   └── forgot_password_screen.dart
    └── widgets/
        ├── custom_text_field.dart
        └── primary_button.dart

test/features/auth/
├── domain/usecases/
│   └── login_with_email_test.dart
├── data/
│   ├── models/user_model_test.dart
│   └── repositories/auth_repository_impl_test.dart
└── presentation/
    └── pages/login_screen_test.dart

integration_test/
└── auth_test.dart
```

**Total:** 20-30 files per feature

---

## For Junior Developers - ELI5

### What Does This Skill Do?

Think of this skill like a **robot construction worker** that builds your Flutter app feature by feature.

**Real-World Analogy:**

Imagine you're building a house (your Flutter app):

1. **IMPLEMENTATION_PLAN.md** = Blueprint
   - Shows what rooms you need (features)
   - Describes what goes in each room (requirements)
   - Lists materials needed (dependencies)

2. **feature-implementer skill** = Construction Crew
   - Reads the blueprint
   - Builds each room (feature) automatically
   - Follows building codes (Clean Architecture patterns)
   - Inspects the work (runs tests)
   - Ensures safety (validates security)

3. **Result** = Finished Room
   - All walls, floors, electrical, plumbing done (all code layers)
   - Passes inspection (tests pass, security validated)
   - Ready to use (production-ready code)

### How Long Does It Take?

**Manual Implementation:**
- Junior developer: 1-2 days per feature
- Writing tests: +4-6 hours
- **Total:** 2-3 days

**With feature-implementer:**
- Complete implementation: 3-8 minutes
- **Speedup:** 300-600x faster!

### What You Need to Know

#### 1. **IMPLEMENTATION_PLAN.md Structure**

Your feature specification should look like this:

```markdown
### Feature 1: User Profile

**Priority:** HIGH
**Estimated Time:** 4-6 hours

**Requirements:**
- View user profile with photo, name, bio
- Edit profile information
- Upload profile photo
- Change password

**User Stories:**
- As a user, I can view my profile
- As a user, I can edit my name and bio
- As a user, I can upload a profile photo
- As a user, I can change my password

**Data Models:**
```dart
class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? bio;
  final String? photoUrl;
}
```

**API Endpoints:**
- GET /api/users/me
- PUT /api/users/me
- POST /api/users/me/photo
- PUT /api/users/me/password

**UI Screens:**
- ProfileScreen (view)
- EditProfileScreen (edit)
- ChangePasswordScreen
```

#### 2. **Clean Architecture Explained (Simple)**

Clean Architecture is like organizing your code into **3 floors** of a building:

**Floor 1: Domain Layer (Top Floor - Business Logic)**
- **What it is:** The "brain" of your feature
- **Contains:**
  - **Entities:** Core data objects (like User, Product)
  - **Use Cases:** Actions users can do (Login, AddToCart)
  - **Repository Contracts:** Promises about how to get data
- **Rule:** This floor NEVER knows about UI or databases
- **Why:** Business rules stay the same even if UI changes

**Floor 2: Data Layer (Middle Floor - Data Management)**
- **What it is:** The "warehouse" that stores and fetches data
- **Contains:**
  - **Models:** Data from API (converts JSON to objects)
  - **Data Sources:** API calls, database queries
  - **Repository Implementations:** Actually gets the data
- **Rule:** Talks to APIs and databases, converts to domain objects
- **Why:** Switching from Firebase to custom backend? Just change this floor!

**Floor 3: Presentation Layer (Ground Floor - User Interface)**
- **What it is:** Everything users see and interact with
- **Contains:**
  - **BLoC:** Manages UI state (loading, success, error)
  - **Screens:** Full pages users navigate to
  - **Widgets:** Reusable UI components (buttons, cards)
- **Rule:** Only knows about UI, gets data from domain layer
- **Why:** Can redesign UI without touching business logic

**Example Flow: User Logs In**

1. **Presentation:** User taps "Log In" button
   - `LoginScreen` shows loading spinner
   - Calls `AuthBloc` with `LoginEvent`

2. **Domain:** BLoC processes the event
   - Calls `LoginWithEmail` use case
   - Use case validates email/password
   - Calls `AuthRepository` (interface)

3. **Data:** Repository fetches data
   - `AuthRepositoryImpl` calls `AuthRemoteDataSource`
   - Sends HTTP request to `/api/auth/login`
   - Converts JSON response to `User` entity
   - Stores JWT token in secure storage

4. **Back to Presentation:** Success!
   - BLoC emits `Authenticated` state
   - UI shows home screen

**Key Insight:** Each layer only talks to the one above it. This makes code:
- **Testable:** Mock each layer independently
- **Maintainable:** Change one layer without breaking others
- **Scalable:** Add features without spaghetti code

#### 3. **BLoC Pattern Explained (Simple)**

**BLoC** = Business Logic Component

Think of BLoC like a **traffic controller** for your UI:

- **Events:** Things that happen (user taps button, data loads)
- **States:** What the UI shows (loading, success, error)
- **BLoC:** Converts events into states

**Example: Login Screen**

```dart
// States (what UI shows)
AuthInitial      → Show login form
AuthLoading      → Show loading spinner
Authenticated    → Navigate to home
AuthError        → Show error message

// Events (what user does)
LoginEvent       → User taps "Log In"
LogoutEvent      → User taps "Log Out"

// BLoC (traffic controller)
- Receives LoginEvent
- Emits AuthLoading
- Calls LoginUseCase
- If success: emits Authenticated
- If failure: emits AuthError
```

**Why BLoC?**
- **Separation:** UI and logic are separate
- **Testability:** Test BLoC without building UI
- **Reusability:** Same BLoC for iOS/Android/Web

#### 4. **Testing Explained (Simple)**

This skill writes **3 types of tests** automatically:

**Unit Tests (Test individual pieces)**
- **Example:** Does `LoginUseCase` validate email correctly?
- **Speed:** Very fast (milliseconds)
- **Coverage:** Business logic, data conversion

**Widget Tests (Test UI components)**
- **Example:** Does login button show loading spinner?
- **Speed:** Fast (seconds)
- **Coverage:** Screens, widgets, user interactions

**Integration Tests (Test complete flows)**
- **Example:** Can user actually log in end-to-end?
- **Speed:** Slow (minutes)
- **Coverage:** Full feature workflows

**Why 70%+ Coverage?**
- Industry standard for production code
- Catches 90% of bugs before users see them
- Required for CI/CD pipelines

#### 5. **Security Validation**

This skill automatically checks that your code follows **security best practices**:

**What Gets Checked:**

- ✅ **JWT Tokens:** Stored in encrypted storage (FlutterSecureStorage)
- ✅ **Passwords:** NEVER stored locally, only sent over HTTPS
- ✅ **API Calls:** Always use HTTPS, not HTTP
- ✅ **Error Messages:** Don't reveal if email exists (prevents enumeration)
- ✅ **Input Validation:** Email format, password strength, no SQL injection

**Example: Bad vs Good**

```dart
// ❌ BAD - Storing password locally
SharedPreferences prefs = await SharedPreferences.getInstance();
prefs.setString('password', userPassword); // NEVER DO THIS!

// ✅ GOOD - Only storing JWT token (encrypted)
FlutterSecureStorage storage = FlutterSecureStorage();
await storage.write(key: 'access_token', value: jwtToken);
```

```dart
// ❌ BAD - Revealing if email exists
if (emailExists) {
  return 'Email already registered';
} else {
  return 'Invalid credentials';
}

// ✅ GOOD - Generic message
return 'Invalid email or password';
```

### How to Use (Step by Step)

**Step 1: Make sure IMPLEMENTATION_PLAN.md exists**

```bash
# Check if file exists
ls docs/IMPLEMENTATION_PLAN.md
```

If it doesn't exist, create it:

```bash
@claude use skill prprompts-core/prd-analyzer
# Then generate IMPLEMENTATION_PLAN.md from PRD
```

**Step 2: Run the skill**

```bash
@claude use skill automation/feature-implementer
```

**Step 3: Answer the questions**

Claude will ask:

```
1. Feature name?
   → Type: authentication

2. Test coverage target? (default: 70%)
   → Type: 75 (or press Enter for default)

3. Generate integration tests? (default: no)
   → Type: yes (or press Enter for no)
```

**Step 4: Wait for completion (3-8 minutes)**

Claude will:
1. Read your IMPLEMENTATION_PLAN.md
2. Generate all domain, data, presentation files
3. Write tests
4. Run `flutter analyze` and `flutter test`
5. Validate security patterns
6. Show you a summary

**Step 5: Review the code**

```bash
# See what was created
git status

# Review a file
cat lib/features/auth/domain/usecases/login_with_email.dart

# Run tests
flutter test

# Check coverage
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
```

**Step 6: Commit if happy with results**

```bash
git add lib/features/auth
git add test/features/auth
git commit -m "feat(auth): implement authentication feature

- Add login, register, logout use cases
- Add JWT token management
- Add tests with 78% coverage"
```

### Common Mistakes (Avoid These!)

#### 1. **Running skill before bootstrapper**

```bash
# ❌ WRONG - Running feature-implementer first
@claude use skill automation/feature-implementer
# ERROR: lib/core/ directory not found

# ✅ CORRECT - Run bootstrapper first
@claude use skill automation/flutter-bootstrapper
@claude use skill automation/feature-implementer
```

#### 2. **IMPLEMENTATION_PLAN.md missing required sections**

```markdown
# ❌ BAD - Incomplete specification
### Feature 1: Authentication
- Add login

# ✅ GOOD - Complete specification
### Feature 1: Authentication
**Requirements:**
- Email/password login
- JWT token management

**Data Models:**
class User { ... }

**API Endpoints:**
- POST /api/auth/login

**UI Screens:**
- LoginScreen
```

#### 3. **Not checking tests after generation**

```bash
# ❌ WRONG - Assuming all tests pass
@claude use skill automation/feature-implementer
git add .
git commit -m "add auth"
# Later: CI fails because 2 tests are broken

# ✅ CORRECT - Always run tests
@claude use skill automation/feature-implementer
flutter test
# Fix any failing tests
git add .
git commit -m "add auth"
```

### What to Do If Something Goes Wrong

#### Problem 1: Skill says "Feature not found"

**Error Message:**
```
❌ ERROR: Feature "authentication" not found in IMPLEMENTATION_PLAN.md
```

**Solution:**
1. Open `docs/IMPLEMENTATION_PLAN.md`
2. Check the feature name exactly matches
3. Feature names are case-sensitive!

```markdown
# If your plan says:
### Feature 1: Authentication System

# Then use:
Feature name: Authentication System
# NOT: authentication system (wrong case)
```

#### Problem 2: Tests failing after generation

**Error Message:**
```
Some tests failed:
  × login_with_email_test.dart: MockAuthRepository not found
```

**Solution:**
1. Install mockito:
```bash
flutter pub add mockito --dev
flutter pub add build_runner --dev
```

2. Generate mocks:
```bash
flutter pub run build_runner build
```

3. Re-run tests:
```bash
flutter test
```

#### Problem 3: Flutter analyze shows errors

**Error Message:**
```
error • Undefined name 'NoParams' • lib/features/auth/domain/usecases/logout.dart:15
```

**Solution:**
1. Add missing import:
```dart
import '../../../../core/usecases/usecase.dart';
```

2. Re-run analyze:
```bash
flutter analyze
```

---

## For Intermediate Developers

### Architecture Deep Dive

#### Clean Architecture in Flutter

This skill implements Clean Architecture following Uncle Bob's principles:

**Dependency Rule:** Source code dependencies only point inwards. Inner circles know nothing about outer circles.

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │  ← UI (Flutter Widgets, BLoC)
│  (BLoC, Screens, Widgets)              │
├─────────────────────────────────────────┤
│         Domain Layer                    │  ← Business Logic (Entities, Use Cases)
│  (Entities, Use Cases, Repositories)   │     NO dependencies on Flutter!
├─────────────────────────────────────────┤
│         Data Layer                      │  ← Data Access (APIs, Databases)
│  (Models, Data Sources, Repo Impls)    │
└─────────────────────────────────────────┘
```

**Key Principles:**

1. **Domain Independence:**
   - Pure Dart code (no Flutter imports)
   - Business rules stable even if framework changes
   - Testable without UI

2. **Dependency Inversion:**
   - Domain defines interfaces (Repository contracts)
   - Data implements interfaces
   - Inversion: Domain doesn't depend on Data, Data depends on Domain

3. **Single Responsibility:**
   - Each use case does ONE thing
   - Each repository manages ONE entity
   - Each BLoC manages ONE feature

#### File Generation Logic

**For each feature, this skill generates:**

**Domain Layer (Avg: 5-8 files)**

```dart
// Entities (pure business objects)
lib/features/{feature}/domain/entities/
  - {entity}.dart (Equatable, immutable)

// Use Cases (single-responsibility operations)
lib/features/{feature}/domain/usecases/
  - {action}.dart (implements UseCase<T, Params>)

// Repository Interface (data contract)
lib/features/{feature}/domain/repositories/
  - {feature}_repository.dart (abstract class)
```

**Data Layer (Avg: 5-8 files)**

```dart
// Models (JSON serialization)
lib/features/{feature}/data/models/
  - {entity}_model.dart (extends Entity, fromJson/toJson)

// Data Sources (external systems)
lib/features/{feature}/data/datasources/
  - {feature}_remote_data_source.dart (Dio/HTTP)
  - {feature}_local_data_source.dart (SharedPreferences/SQLite)

// Repository Implementation (orchestration)
lib/features/{feature}/data/repositories/
  - {feature}_repository_impl.dart (implements Repository)
```

**Presentation Layer (Avg: 8-12 files)**

```dart
// BLoC (state management)
lib/features/{feature}/presentation/bloc/
  - {feature}_bloc.dart (extends Bloc<Event, State>)
  - {feature}_event.dart (sealed classes or Equatable)
  - {feature}_state.dart (sealed classes or Equatable)

// Screens (top-level pages)
lib/features/{feature}/presentation/pages/
  - {screen}_screen.dart (StatefulWidget/StatelessWidget)

// Widgets (reusable components)
lib/features/{feature}/presentation/widgets/
  - {widget}.dart
```

**Tests (Avg: 8-15 files)**

```dart
// Unit tests (domain + data)
test/features/{feature}/domain/usecases/
  - {use_case}_test.dart

test/features/{feature}/data/
  - models/{model}_test.dart
  - repositories/{repository}_test.dart

// Widget tests (presentation)
test/features/{feature}/presentation/
  - pages/{screen}_test.dart
  - widgets/{widget}_test.dart

// Integration tests (full flows)
integration_test/
  - {feature}_test.dart
```

#### BLoC Pattern Implementation

**This skill generates BLoC following flutter_bloc best practices:**

**Event-Driven Architecture:**

```dart
// 1. Define Events (user actions)
abstract class AuthEvent extends Equatable {}

class LoginEvent extends AuthEvent {
  final String email;
  final String password;

  const LoginEvent({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

// 2. Define States (UI representations)
abstract class AuthState extends Equatable {}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class Authenticated extends AuthState {
  final User user;
  const Authenticated({required this.user});

  @override
  List<Object?> get props => [user];
}
class AuthError extends AuthState {
  final String message;
  const AuthError({required this.message});

  @override
  List<Object?> get props => [message];
}

// 3. Implement BLoC (event → state transformer)
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginWithEmail loginUseCase;

  AuthBloc({required this.loginUseCase}) : super(AuthInitial()) {
    on<LoginEvent>(_onLogin);
  }

  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());

    final result = await loginUseCase(LoginParams(
      email: event.email,
      password: event.password,
    ));

    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (user) => emit(Authenticated(user: user)),
    );
  }
}
```

**BLoC Best Practices (Automatically Applied):**

1. **Immutable States:**
   - All states extend Equatable
   - Props define equality
   - BlocBuilder rebuilds only when state changes

2. **Separate Events/States:**
   - Events represent user intentions
   - States represent UI snapshots
   - Never mix concerns

3. **Use Cases in BLoC:**
   - BLoC doesn't contain business logic
   - Delegates to use cases
   - Single responsibility

4. **Error Handling:**
   - All errors converted to states
   - UI shows appropriate messages
   - No thrown exceptions in BLoC

#### Data Source Patterns

**Remote Data Source (API Communication):**

```dart
abstract class AuthRemoteDataSource {
  /// Throws [ServerException], [NetworkException], [AuthException]
  Future<UserModel> loginWithEmail({
    required String email,
    required String password,
  });
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSourceImpl({required this.dio});

  @override
  Future<UserModel> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final response = await dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        return UserModel.fromJson(response.data);
      } else {
        throw ServerException(message: 'Unexpected status: ${response.statusCode}');
      }
    } on DioException catch (e) {
      _handleDioError(e);
      rethrow;
    }
  }

  void _handleDioError(DioException e) {
    if (e.response?.statusCode == 401) {
      throw AuthException(message: 'Invalid credentials');
    } else if (e.response?.statusCode == 400) {
      throw ValidationException(message: e.response?.data['message']);
    } else if (e.response?.statusCode != null && e.response!.statusCode! >= 500) {
      throw ServerException(message: 'Server error');
    } else {
      throw NetworkException(message: 'Network error: ${e.message}');
    }
  }
}
```

**Key Patterns:**

1. **Exception-Based Errors:**
   - Data sources throw exceptions
   - Repositories catch and convert to Failures
   - Clean separation of concerns

2. **HTTP Error Handling:**
   - 401/403: AuthException
   - 400: ValidationException
   - 500+: ServerException
   - Timeout: NetworkException

3. **Type Safety:**
   - Models for all API responses
   - Compile-time type checking
   - No dynamic typing

**Local Data Source (Storage):**

```dart
abstract class AuthLocalDataSource {
  /// Throws [CacheException] if not found
  Future<AuthTokensModel> getCachedTokens();

  /// Throws [CacheException] on failure
  Future<void> cacheTokens(AuthTokensModel tokens);

  Future<void> clearTokens();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final FlutterSecureStorage secureStorage;

  AuthLocalDataSourceImpl({required this.secureStorage});

  @override
  Future<AuthTokensModel> getCachedTokens() async {
    final accessToken = await secureStorage.read(key: 'access_token');
    final refreshToken = await secureStorage.read(key: 'refresh_token');

    if (accessToken == null || refreshToken == null) {
      throw CacheException(message: 'Tokens not found');
    }

    return AuthTokensModel(
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: DateTime.parse(await secureStorage.read(key: 'expires_at')!),
    );
  }

  @override
  Future<void> cacheTokens(AuthTokensModel tokens) async {
    await secureStorage.write(key: 'access_token', value: tokens.accessToken);
    await secureStorage.write(key: 'refresh_token', value: tokens.refreshToken);
    await secureStorage.write(key: 'expires_at', value: tokens.expiresAt.toIso8601String());
  }

  @override
  Future<void> clearTokens() async {
    await secureStorage.delete(key: 'access_token');
    await secureStorage.delete(key: 'refresh_token');
    await secureStorage.delete(key: 'expires_at');
  }
}
```

**Storage Strategies:**

1. **Sensitive Data:** FlutterSecureStorage (encrypted)
   - JWT tokens
   - Refresh tokens
   - API keys

2. **Non-Sensitive Data:** SharedPreferences (plain text)
   - User preferences
   - Theme settings
   - Language selection

3. **Structured Data:** SQLite (local database)
   - Cached API responses
   - Offline data
   - Complex queries

#### Repository Pattern Implementation

**Repository coordinates data sources and converts exceptions to Failures:**

```dart
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, User>> loginWithEmail({
    required String email,
    required String password,
  }) async {
    // 1. Check network connectivity
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure(message: 'No internet connection'));
    }

    try {
      // 2. Attempt remote operation
      final result = await remoteDataSource.loginWithEmail(
        email: email,
        password: password,
      );

      // 3. Cache result
      await localDataSource.cacheTokens(result['tokens']);
      await localDataSource.cacheUser(result['user']);

      // 4. Return success
      return Right(result['user']);
    } on AuthException catch (e) {
      // 5. Convert exceptions to failures
      return Left(AuthFailure(message: e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(message: e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message));
    } catch (e) {
      return Left(ServerFailure(message: 'Unexpected error: $e'));
    }
  }
}
```

**Key Responsibilities:**

1. **Network Check:** Verify connectivity before remote calls
2. **Exception Conversion:** Convert exceptions → Failures
3. **Caching:** Store results locally for offline access
4. **Orchestration:** Coordinate multiple data sources

#### Test Generation Strategy

**This skill generates tests targeting 70%+ coverage:**

**Unit Test Structure:**

```dart
void main() {
  late UseCase useCase;
  late MockRepository mockRepository;

  setUp(() {
    mockRepository = MockRepository();
    useCase = UseCase(mockRepository);
  });

  group('Success Cases', () {
    test('should return Entity when repository succeeds', () async {
      // arrange
      when(mockRepository.method(any)).thenAnswer((_) async => Right(entity));

      // act
      final result = await useCase(params);

      // assert
      expect(result, Right(entity));
      verify(mockRepository.method(params));
      verifyNoMoreInteractions(mockRepository);
    });
  });

  group('Failure Cases', () {
    test('should return Failure when repository fails', () async {
      // arrange
      when(mockRepository.method(any)).thenAnswer((_) async => Left(failure));

      // act
      final result = await useCase(params);

      // assert
      expect(result, Left(failure));
    });
  });

  group('Validation', () {
    test('should return ValidationFailure for invalid input', () async {
      // arrange
      final invalidParams = Params(invalidData);

      // act
      final result = await useCase(invalidParams);

      // assert
      expect(result.isLeft(), true);
      verifyZeroInteractions(mockRepository);
    });
  });
}
```

**Test Coverage Targets:**

- **Domain Layer:** 90%+ (critical business logic)
- **Data Layer:** 80%+ (data transformations, error handling)
- **Presentation Layer:** 60%+ (UI interactions, state transitions)
- **Overall:** 70%+ (production-ready)

**Integration Test Patterns:**

```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Feature Integration', () {
    testWidgets('complete user flow', (tester) async {
      // 1. Start app
      app.main();
      await tester.pumpAndSettle();

      // 2. Navigate to feature
      await tester.tap(find.text('Feature'));
      await tester.pumpAndSettle();

      // 3. Interact with UI
      await tester.enterText(find.byKey(Key('input')), 'test data');
      await tester.tap(find.text('Submit'));
      await tester.pumpAndSettle();

      // 4. Verify result
      expect(find.text('Success'), findsOneWidget);
    });
  });
}
```

### Security Validation Details

**This skill enforces PRPROMPTS security standards:**

#### JWT Token Security

```dart
// ✅ CORRECT: Verify JWT in Flutter (public key only)
class JwtVerifier {
  final RSAPublicKey publicKey;

  bool verifyToken(String token) {
    try {
      final jwt = JWT.verify(token, publicKey);
      return !jwt.isExpired;
    } catch (e) {
      return false;
    }
  }
}

// ❌ WRONG: NEVER sign JWT in Flutter (exposes private key)
class JwtSigner {
  final RSAPrivateKey privateKey; // SECURITY VIOLATION!

  String signToken(Map<String, dynamic> payload) {
    return JWT.encode(payload, privateKey); // NEVER DO THIS!
  }
}
```

**JWT Best Practices Enforced:**

1. **Storage:** FlutterSecureStorage only (encrypted)
2. **Transmission:** HTTPS only
3. **Verification:** Public key only (RS256)
4. **Expiration:** Check before each API call
5. **Refresh:** Rotate tokens before expiration

#### Password Security

```dart
// ✅ CORRECT: Validate but never store
class PasswordValidator {
  static String? validate(String password) {
    if (password.length < 8) return 'Too short';
    if (!password.contains(RegExp(r'[A-Z]'))) return 'Need uppercase';
    if (!password.contains(RegExp(r'[a-z]'))) return 'Need lowercase';
    if (!password.contains(RegExp(r'[0-9]'))) return 'Need digit';
    if (!password.contains(RegExp(r'[!@#$%^&*]'))) return 'Need special char';
    return null; // Valid
  }
}

// Send over HTTPS to backend
await dio.post('/auth/login', data: {
  'email': email,
  'password': password, // Only in request, never stored
});

// ❌ WRONG: Storing password locally
SharedPreferences prefs = await SharedPreferences.getInstance();
prefs.setString('password', password); // SECURITY VIOLATION!
```

#### API Security

```dart
// ✅ CORRECT: HTTPS enforced, Authorization header
class SecureApiClient {
  final Dio dio;

  SecureApiClient() : dio = Dio(BaseOptions(
    baseUrl: 'https://api.example.com', // HTTPS required
    headers: {'Content-Type': 'application/json'},
  )) {
    // Add JWT token to all requests
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await secureStorage.read(key: 'access_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }
}

// ❌ WRONG: HTTP (not HTTPS)
final dio = Dio(BaseOptions(
  baseUrl: 'http://api.example.com', // SECURITY VIOLATION!
));
```

#### Input Validation

```dart
// ✅ CORRECT: Validate all user inputs
class InputValidator {
  static String? validateEmail(String email) {
    final regex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!regex.hasMatch(email)) {
      return 'Invalid email format';
    }
    return null;
  }

  static String? validatePhoneNumber(String phone) {
    final regex = RegExp(r'^\+?[1-9]\d{1,14}$'); // E.164 format
    if (!regex.hasMatch(phone)) {
      return 'Invalid phone number';
    }
    return null;
  }

  // Prevent SQL injection (though using ORM, good practice)
  static String sanitizeSql(String input) {
    return input.replaceAll(RegExp(r"[;'\"\\]"), '');
  }
}

// ❌ WRONG: No validation
await dio.post('/api/users', data: {
  'email': emailController.text, // Could be malicious input
});
```

### Advanced Customization

#### Extending Generated Code

**Generated code is fully customizable:**

1. **Add Custom Validations:**

```dart
// Generated use case
class LoginWithEmail implements UseCase<User, LoginParams> {
  @override
  Future<Either<Failure, User>> call(LoginParams params) async {
    final validation = params.validate();
    if (validation != null) {
      return Left(ValidationFailure(validation));
    }
    return await repository.loginWithEmail(...);
  }
}

// Your customization: Add brute-force protection
class LoginWithEmail implements UseCase<User, LoginParams> {
  final RateLimiter rateLimiter; // ADD THIS

  @override
  Future<Either<Failure, User>> call(LoginParams params) async {
    // ADD: Check rate limit
    if (await rateLimiter.isRateLimited(params.email)) {
      return Left(AuthFailure('Too many attempts. Try again in 15 minutes.'));
    }

    final validation = params.validate();
    if (validation != null) {
      return Left(ValidationFailure(validation));
    }

    final result = await repository.loginWithEmail(...);

    // ADD: Record failed attempt
    result.fold(
      (failure) => rateLimiter.recordFailedAttempt(params.email),
      (_) => rateLimiter.clearAttempts(params.email),
    );

    return result;
  }
}
```

2. **Add Caching Logic:**

```dart
// Generated repository
class UserRepositoryImpl implements UserRepository {
  @override
  Future<Either<Failure, User>> getUser(String id) async {
    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure('No connection'));
    }
    return await remoteDataSource.getUser(id);
  }
}

// Your customization: Add cache layer
class UserRepositoryImpl implements UserRepository {
  final UserCache cache; // ADD THIS

  @override
  Future<Either<Failure, User>> getUser(String id) async {
    // ADD: Try cache first
    try {
      final cachedUser = await cache.getUser(id);
      if (!cachedUser.isExpired) {
        return Right(cachedUser);
      }
    } on CacheException {
      // Cache miss, continue to remote
    }

    if (!await networkInfo.isConnected) {
      return Left(NetworkFailure('No connection'));
    }

    final result = await remoteDataSource.getUser(id);

    // ADD: Cache successful result
    result.fold(
      (_) => null,
      (user) => cache.cacheUser(user),
    );

    return result;
  }
}
```

3. **Add Analytics Tracking:**

```dart
// Generated BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await loginUseCase(LoginParams(...));
    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (user) => emit(Authenticated(user: user)),
    );
  }
}

// Your customization: Add analytics
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final Analytics analytics; // ADD THIS

  Future<void> _onLogin(LoginEvent event, Emitter<AuthState> emit) async {
    emit(AuthLoading());

    // ADD: Track login attempt
    analytics.logEvent('login_attempt', parameters: {
      'method': 'email',
    });

    final result = await loginUseCase(LoginParams(...));

    result.fold(
      (failure) {
        // ADD: Track login failure
        analytics.logEvent('login_failed', parameters: {
          'error': failure.message,
        });
        emit(AuthError(message: failure.message));
      },
      (user) {
        // ADD: Track login success
        analytics.logEvent('login_success', parameters: {
          'user_id': user.id,
        });
        emit(Authenticated(user: user));
      },
    );
  }
}
```

### Performance Optimization

**Generated code is optimized for performance, but you can improve further:**

#### 1. **Lazy Loading BLoCs**

```dart
// Instead of creating all BLoCs at app startup
final authBloc = AuthBloc(...);
final profileBloc = ProfileBloc(...);
final settingsBloc = SettingsBloc(...);

// Use BlocProvider.value only when needed
BlocProvider(
  create: (_) => AuthBloc(...), // Created lazily
  child: LoginScreen(),
);
```

#### 2. **Caching API Responses**

```dart
// Add cache interceptor to Dio
dio.interceptors.add(DioCacheInterceptor(options: CacheOptions(
  store: MemCacheStore(), // Or HiveCacheStore for persistence
  policy: CachePolicy.request, // Default policy
  maxStale: Duration(days: 7), // Optional
)));
```

#### 3. **Debouncing User Input**

```dart
// Debounce search queries
final searchController = TextEditingController();
Timer? _debounce;

searchController.addListener(() {
  if (_debounce?.isActive ?? false) _debounce!.cancel();
  _debounce = Timer(Duration(milliseconds: 500), () {
    // Perform search after 500ms of no typing
    context.read<SearchBloc>().add(SearchEvent(searchController.text));
  });
});
```

---

## For Senior Developers

### Architecture Decisions

#### Why Clean Architecture Over Other Patterns?

**Comparison with alternatives:**

| Pattern | Pros | Cons | Best For |
|---------|------|------|----------|
| **Clean Architecture** | Testable, scalable, maintainable, framework-independent | More files, learning curve | Large apps, teams, long-term projects |
| **MVC** | Simple, familiar, fast to build | Tight coupling, hard to test, messy controllers | Small apps, prototypes |
| **MVVM** | Good separation, testable ViewModels | Can become bloated, two-way binding issues | Medium apps, reactive UIs |
| **Feature-First** | Organized by feature, fast navigation | Can duplicate code across features | Medium apps, clear feature boundaries |

**Why Clean Architecture for PRPROMPTS:**

1. **Enterprise-Ready:** Healthcare, fintech apps need separation for compliance audits
2. **Testing:** 70%+ coverage required, domain layer 100% testable
3. **Scalability:** 50+ features in large apps, architecture doesn't break down
4. **Team Collaboration:** Clear boundaries, juniors work on presentation, seniors on domain
5. **Framework Agnostic:** If Flutter dies, domain layer reusable in other frameworks

#### Dependency Injection Strategy

**This skill assumes get_it for DI:**

```dart
// lib/core/di/injection_container.dart
final sl = GetIt.instance;

Future<void> init() async {
  // BLoCs (registered as factories - new instance per call)
  sl.registerFactory(() => AuthBloc(
    loginWithEmail: sl(),
    registerWithEmail: sl(),
    logout: sl(),
  ));

  // Use Cases (registered as lazy singletons - created when first used)
  sl.registerLazySingleton(() => LoginWithEmail(sl()));
  sl.registerLazySingleton(() => RegisterWithEmail(sl()));
  sl.registerLazySingleton(() => Logout(sl()));

  // Repositories (registered as lazy singletons)
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Data Sources (registered as lazy singletons)
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(dio: sl()),
  );
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(
      secureStorage: sl(),
      sharedPreferences: sl(),
    ),
  );

  // External (registered as singletons - created immediately)
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerSingleton<SharedPreferences>(sharedPreferences);
  sl.registerSingleton<FlutterSecureStorage>(FlutterSecureStorage());
  sl.registerSingleton<Dio>(_createDio());
}

Dio _createDio() {
  final dio = Dio(BaseOptions(
    baseUrl: 'https://api.example.com',
    connectTimeout: Duration(seconds: 30),
    receiveTimeout: Duration(seconds: 30),
  ));

  // Add interceptors
  dio.interceptors.add(LogInterceptor(responseBody: true));
  dio.interceptors.add(AuthInterceptor()); // Custom JWT interceptor

  return dio;
}
```

**DI Best Practices:**

1. **Factory vs Singleton:**
   - Factory: BLoCs (need fresh state per screen)
   - Lazy Singleton: Use cases, repositories (stateless, expensive to create)
   - Singleton: External dependencies (SharedPreferences, Dio)

2. **Interface Registration:**
   ```dart
   // Register interface type, not implementation
   sl.registerLazySingleton<AuthRepository>( // Interface
     () => AuthRepositoryImpl(...), // Implementation
   );
   ```

3. **Testing:**
   ```dart
   // Easy to mock in tests
   setUp(() {
     sl.registerLazySingleton<AuthRepository>(
       () => MockAuthRepository(),
     );
   });
   ```

#### Error Handling Architecture

**Comprehensive error handling with Either<Failure, T>:**

```dart
// Core failures
abstract class Failure extends Equatable {
  final String message;
  const Failure({required this.message});

  @override
  List<Object?> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure({required super.message});
}

class NetworkFailure extends Failure {
  const NetworkFailure({required super.message});
}

class CacheFailure extends Failure {
  const CacheFailure({required super.message});
}

class ValidationFailure extends Failure {
  const ValidationFailure({required super.message});
}

class AuthFailure extends Failure {
  const AuthFailure({required super.message});
}

// Usage in BLoC
result.fold(
  (failure) {
    if (failure is NetworkFailure) {
      emit(AuthError(message: 'No internet connection'));
    } else if (failure is AuthFailure) {
      emit(AuthError(message: failure.message));
    } else if (failure is ValidationFailure) {
      emit(AuthError(message: failure.message));
    } else {
      emit(AuthError(message: 'An unexpected error occurred'));
    }
  },
  (user) => emit(Authenticated(user: user)),
);
```

**Why Either over try/catch:**

1. **Explicit Error Handling:** Compiler forces you to handle both success and failure
2. **Type Safety:** Know exactly what failures can occur
3. **Composability:** Chain operations with flatMap, map
4. **Testability:** Easy to test both paths

**Alternative: Result type (if preferred):**

```dart
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Error<T> extends Result<T> {
  final Failure failure;
  const Error(this.failure);
}

// Pattern matching (Dart 3.0+)
switch (result) {
  case Success(data: final user):
    emit(Authenticated(user: user));
  case Error(failure: final failure):
    emit(AuthError(message: failure.message));
}
```

#### State Management Alternatives

**While this skill generates BLoC, you can adapt to other patterns:**

**Riverpod:**

```dart
// Domain layer stays the same
// Replace BLoC with StateNotifier

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() => const AuthInitial();

  Future<void> login(String email, String password) async {
    state = const AuthLoading();

    final result = await ref.read(loginUseCaseProvider)(LoginParams(
      email: email,
      password: password,
    ));

    state = result.fold(
      (failure) => AuthError(message: failure.message),
      (user) => Authenticated(user: user),
    );
  }
}

// In UI
ref.listen<AuthState>(authNotifierProvider, (previous, next) {
  if (next is AuthError) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(next.message)),
    );
  }
});

final authState = ref.watch(authNotifierProvider);
```

**MobX:**

```dart
// Replace BLoC with Store

part 'auth_store.g.dart';

class AuthStore = _AuthStore with _$AuthStore;

abstract class _AuthStore with Store {
  final LoginWithEmail loginUseCase;

  _AuthStore({required this.loginUseCase});

  @observable
  AuthState state = const AuthInitial();

  @action
  Future<void> login(String email, String password) async {
    state = const AuthLoading();

    final result = await loginUseCase(LoginParams(
      email: email,
      password: password,
    ));

    state = result.fold(
      (failure) => AuthError(message: failure.message),
      (user) => Authenticated(user: user),
    );
  }
}

// In UI
Observer(
  builder: (_) {
    final authState = authStore.state;
    if (authState is AuthLoading) {
      return CircularProgressIndicator();
    } else if (authState is Authenticated) {
      return HomeScreen();
    } else {
      return LoginForm();
    }
  },
);
```

**Redux:**

```dart
// Domain layer stays the same
// Replace BLoC with Redux actions/reducers

// Actions
class LoginAction {
  final String email;
  final String password;
  const LoginAction({required this.email, required this.password});
}

class LoginSuccessAction {
  final User user;
  const LoginSuccessAction(this.user);
}

class LoginFailureAction {
  final String error;
  const LoginFailureAction(this.error);
}

// Reducer
AuthState authReducer(AuthState state, dynamic action) {
  if (action is LoginAction) {
    return const AuthLoading();
  } else if (action is LoginSuccessAction) {
    return Authenticated(user: action.user);
  } else if (action is LoginFailureAction) {
    return AuthError(message: action.error);
  }
  return state;
}

// Middleware
void authMiddleware(Store<AppState> store, dynamic action, NextDispatcher next) {
  if (action is LoginAction) {
    loginUseCase(LoginParams(email: action.email, password: action.password))
        .then((result) {
      result.fold(
        (failure) => store.dispatch(LoginFailureAction(failure.message)),
        (user) => store.dispatch(LoginSuccessAction(user)),
      );
    });
  }
  next(action);
}
```

**Key Insight:** Clean Architecture allows swapping state management without touching domain/data layers.

#### Advanced Testing Strategies

**Golden Tests for UI Consistency:**

```dart
testWidgets('login screen golden test', (tester) async {
  await tester.pumpWidget(createWidgetUnderTest());

  await expectLater(
    find.byType(LoginScreen),
    matchesGoldenFile('goldens/login_screen.png'),
  );
});
```

**Parameterized Tests:**

```dart
void main() {
  group('Email Validation', () {
    final testCases = [
      ('valid@example.com', true),
      ('invalid-email', false),
      ('missing@domain', false),
      ('with spaces@example.com', false),
      ('válid@example.com', true), // Unicode
    ];

    for (final (email, expected) in testCases) {
      test('validates "$email" as ${expected ? "valid" : "invalid"}', () {
        final result = EmailValidator.validate(email);
        expect(result == null, expected);
      });
    }
  });
}
```

**Mocking HTTP Responses:**

```dart
class MockDioAdapter extends HttpClientAdapter {
  final Map<String, dynamic> mockResponses;

  MockDioAdapter(this.mockResponses);

  @override
  Future<ResponseBody> fetch(RequestOptions options, ...) async {
    final response = mockResponses[options.path];
    return ResponseBody.fromString(
      jsonEncode(response),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }
}

// In test
setUp(() {
  final dio = Dio();
  dio.httpClientAdapter = MockDioAdapter({
    '/auth/login': {
      'user': {...},
      'tokens': {...},
    },
  });
});
```

**Test Coverage Analysis:**

```bash
# Generate coverage
flutter test --coverage

# Generate HTML report
genhtml coverage/lcov.info -o coverage/html

# Extract coverage percentage
lcov --summary coverage/lcov.info | grep 'lines' | awk '{print $2}'

# Fail CI if coverage < 70%
COVERAGE=$(lcov --summary coverage/lcov.info | grep 'lines' | awk '{print $2}' | tr -d '%')
if (( $(echo "$COVERAGE < 70" | bc -l) )); then
  echo "Coverage $COVERAGE% is below 70%"
  exit 1
fi
```

### Compliance and Security

#### HIPAA Compliance Patterns

**If PRD specifies HIPAA, generated code includes:**

1. **PHI Encryption at Rest:**

```dart
class SecureStorage {
  final FlutterSecureStorage storage;
  final Encryptor encryptor;

  Future<void> storePHI(String key, String phi) async {
    final encrypted = await encryptor.encrypt(phi);
    await storage.write(key: key, value: encrypted);

    // Audit log
    await auditLogger.log(AuditEvent(
      action: 'PHI_WRITE',
      resource: key,
      userId: currentUserId,
      timestamp: DateTime.now(),
    ));
  }

  Future<String?> retrievePHI(String key) async {
    final encrypted = await storage.read(key: key);
    if (encrypted == null) return null;

    // Audit log
    await auditLogger.log(AuditEvent(
      action: 'PHI_READ',
      resource: key,
      userId: currentUserId,
      timestamp: DateTime.now(),
    ));

    return await encryptor.decrypt(encrypted);
  }
}
```

2. **Session Timeouts:**

```dart
class SessionManager {
  Timer? _timeout;
  final Duration inactivityLimit = Duration(minutes: 15);

  void resetTimeout() {
    _timeout?.cancel();
    _timeout = Timer(inactivityLimit, () {
      // Log out user
      authBloc.add(LogoutEvent());

      // Show session expired dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => AlertDialog(
          title: Text('Session Expired'),
          content: Text('For security, you have been logged out due to inactivity.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pushReplacementNamed('/login'),
              child: Text('Log In Again'),
            ),
          ],
        ),
      );
    });
  }
}
```

3. **Audit Logging:**

```dart
class AuditLogger {
  final AuditRepository repository;

  Future<void> log(AuditEvent event) async {
    await repository.saveEvent(AuditEventModel(
      id: Uuid().v4(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      timestamp: event.timestamp,
      ipAddress: await NetworkInfo.getIpAddress(),
      deviceId: await DeviceInfo.getDeviceId(),
    ));
  }
}

// Usage in use cases
class ViewPatientRecord implements UseCase<Patient, ViewPatientParams> {
  @override
  Future<Either<Failure, Patient>> call(ViewPatientParams params) async {
    final result = await repository.getPatient(params.patientId);

    result.fold(
      (_) => null,
      (patient) async {
        // Log PHI access
        await auditLogger.log(AuditEvent(
          action: 'VIEW_PATIENT_RECORD',
          resource: 'patients/${patient.id}',
          userId: params.currentUserId,
          timestamp: DateTime.now(),
        ));
      },
    );

    return result;
  }
}
```

#### PCI-DSS Compliance Patterns

**If PRD specifies PCI-DSS, generated code includes:**

1. **Payment Tokenization:**

```dart
// NEVER store credit card numbers
// Use tokenization (Stripe, PayPal, Braintree)

class PaymentService {
  final StripeService stripe;

  Future<Either<Failure, PaymentIntent>> processPayment({
    required int amount,
    required String currency,
  }) async {
    try {
      // Create payment intent (server-side)
      final paymentIntent = await stripe.createPaymentIntent(
        amount: amount,
        currency: currency,
      );

      // Client confirms with card details
      // Card details go directly to Stripe, NEVER to your backend
      final confirmedIntent = await Stripe.instance.confirmPayment(
        paymentIntentClientSecret: paymentIntent.clientSecret,
        data: PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );

      return Right(confirmedIntent);
    } catch (e) {
      return Left(PaymentFailure(message: e.toString()));
    }
  }
}
```

2. **Secure Display of Card Info:**

```dart
// Only show last 4 digits
class PaymentMethodWidget extends StatelessWidget {
  final PaymentMethod paymentMethod;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(_getCardIcon(paymentMethod.brand)),
      title: Text('•••• •••• •••• ${paymentMethod.last4}'),
      subtitle: Text('Expires ${paymentMethod.expiryMonth}/${paymentMethod.expiryYear}'),
    );
  }
}
```

#### GDPR Compliance Patterns

**If PRD specifies GDPR, generated code includes:**

1. **Data Export (Right to Data Portability):**

```dart
class ExportUserData implements UseCase<File, ExportParams> {
  @override
  Future<Either<Failure, File>> call(ExportParams params) async {
    final userData = await repository.getUserData(params.userId);

    final jsonData = {
      'user_profile': userData.profile.toJson(),
      'orders': userData.orders.map((o) => o.toJson()).toList(),
      'preferences': userData.preferences.toJson(),
      'activity_log': userData.activities.map((a) => a.toJson()).toList(),
    };

    final file = File('${params.outputPath}/user_data_${params.userId}.json');
    await file.writeAsString(jsonEncode(jsonData));

    return Right(file);
  }
}
```

2. **Data Deletion (Right to be Forgotten):**

```dart
class DeleteUserData implements UseCase<void, DeleteParams> {
  @override
  Future<Either<Failure, void>> call(DeleteParams params) async {
    // 1. Delete personal data
    await repository.deleteUserProfile(params.userId);

    // 2. Anonymize activity logs (keep for analytics)
    await repository.anonymizeUserActivities(params.userId);

    // 3. Delete authentication data
    await authRepository.deleteUserAuth(params.userId);

    // 4. Remove from third-party services
    await analyticsService.deleteUser(params.userId);

    // 5. Audit log
    await auditLogger.log(AuditEvent(
      action: 'USER_DATA_DELETED',
      resource: 'users/${params.userId}',
      timestamp: DateTime.now(),
    ));

    return const Right(null);
  }
}
```

3. **Consent Management:**

```dart
class ConsentManager {
  final ConsentRepository repository;

  Future<bool> hasConsent(String userId, ConsentType type) async {
    final consent = await repository.getConsent(userId, type);
    return consent?.granted ?? false;
  }

  Future<void> grantConsent(String userId, ConsentType type) async {
    await repository.saveConsent(Consent(
      userId: userId,
      type: type,
      granted: true,
      grantedAt: DateTime.now(),
    ));
  }

  Future<void> revokeConsent(String userId, ConsentType type) async {
    await repository.saveConsent(Consent(
      userId: userId,
      type: type,
      granted: false,
      revokedAt: DateTime.now(),
    ));
  }
}

enum ConsentType {
  essential, // Required for app to function
  analytics, // Usage analytics
  marketing, // Marketing emails
  thirdParty, // Sharing with third parties
}
```

### CI/CD Integration

**Generated code is CI/CD-ready:**

**GitHub Actions Workflow:**

```yaml
name: Flutter CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'

      - name: Install dependencies
        run: flutter pub get

      - name: Run code generation
        run: flutter pub run build_runner build --delete-conflicting-outputs

      - name: Analyze code
        run: flutter analyze

      - name: Run tests
        run: flutter test --coverage

      - name: Check coverage
        run: |
          COVERAGE=$(lcov --summary coverage/lcov.info | grep 'lines' | awk '{print $2}' | tr -d '%')
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 70%"
            exit 1
          fi

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build-android:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3

      - uses: subosito/flutter-action@v2

      - name: Build APK
        run: flutter build apk --release

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: build/app/outputs/flutter-apk/app-release.apk

  build-ios:
    runs-on: macos-latest
    needs: test
    steps:
      - uses: actions/checkout@v3

      - uses: subosito/flutter-action@v2

      - name: Build IPA
        run: flutter build ios --release --no-codesign

      - name: Upload IPA
        uses: actions/upload-artifact@v3
        with:
          name: Runner.app
          path: build/ios/iphoneos/Runner.app
```

**Pre-commit Hooks:**

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running pre-commit checks..."

# Format code
echo "Formatting code..."
dart format lib/ test/

# Analyze code
echo "Analyzing code..."
flutter analyze
if [ $? -ne 0 ]; then
  echo "❌ Flutter analyze found issues. Please fix them before committing."
  exit 1
fi

# Run tests
echo "Running tests..."
flutter test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix them before committing."
  exit 1
fi

echo "✅ All checks passed. Proceeding with commit."
```

---

## Usage Examples

### Example 1: Implement Authentication Feature

**IMPLEMENTATION_PLAN.md:**

```markdown
### Feature 1: Authentication
**Priority:** HIGH
**Estimated Time:** 6-8 hours

**Requirements:**
- Email/password login and registration
- JWT token management with refresh
- Session persistence
- Biometric authentication (optional)

**API Endpoints:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout

**Data Models:**
```dart
class User {
  final String id;
  final String email;
  final String? displayName;
  final bool emailVerified;
}

class AuthTokens {
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
}
```

**UI Screens:**
- LoginScreen
- RegisterScreen
- ForgotPasswordScreen
```

**Run the skill:**

```bash
@claude use skill automation/feature-implementer

# Input:
# Feature name: Authentication
# Test coverage target: 80
# Generate integration tests: yes
```

**Output:**

```
✅ Feature "Authentication" implemented successfully!

📊 Summary:
- Files Created: 24
  - Domain: 7 files
  - Data: 8 files
  - Presentation: 9 files
- Test Coverage: 82.4%
- Security Validated: Yes
- Architecture Compliant: Yes

📁 Files Created:
Domain Layer:
  - lib/features/auth/domain/entities/user.dart
  - lib/features/auth/domain/entities/auth_tokens.dart
  - lib/features/auth/domain/usecases/login_with_email.dart
  - lib/features/auth/domain/usecases/register_with_email.dart
  - lib/features/auth/domain/usecases/logout.dart
  - lib/features/auth/domain/usecases/get_current_user.dart
  - lib/features/auth/domain/repositories/auth_repository.dart

Data Layer:
  - lib/features/auth/data/models/user_model.dart
  - lib/features/auth/data/models/auth_tokens_model.dart
  - lib/features/auth/data/datasources/auth_remote_data_source.dart
  - lib/features/auth/data/datasources/auth_local_data_source.dart
  - lib/features/auth/data/repositories/auth_repository_impl.dart

Presentation Layer:
  - lib/features/auth/presentation/bloc/auth_bloc.dart
  - lib/features/auth/presentation/bloc/auth_event.dart
  - lib/features/auth/presentation/bloc/auth_state.dart
  - lib/features/auth/presentation/pages/login_screen.dart
  - lib/features/auth/presentation/pages/register_screen.dart
  - lib/features/auth/presentation/pages/forgot_password_screen.dart
  - lib/features/auth/presentation/widgets/custom_text_field.dart
  - lib/features/auth/presentation/widgets/primary_button.dart

Tests:
  - test/features/auth/domain/usecases/login_with_email_test.dart
  - test/features/auth/data/models/user_model_test.dart
  - test/features/auth/data/repositories/auth_repository_impl_test.dart
  - test/features/auth/presentation/pages/login_screen_test.dart
  - integration_test/auth_test.dart

🎉 Ready for code review and integration!
```

### Example 2: Implement User Profile Feature

**IMPLEMENTATION_PLAN.md:**

```markdown
### Feature 2: User Profile
**Priority:** MEDIUM
**Dependencies:** Authentication
**Estimated Time:** 4-6 hours

**Requirements:**
- View user profile (name, email, photo, bio)
- Edit profile information
- Upload profile photo
- Change password

**API Endpoints:**
- GET /api/users/me
- PUT /api/users/me
- POST /api/users/me/photo
- PUT /api/users/me/password

**Data Models:**
```dart
class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? bio;
  final String? photoUrl;
  final DateTime updatedAt;
}
```

**UI Screens:**
- ProfileScreen (view)
- EditProfileScreen (edit)
- ChangePasswordScreen
```

**Run the skill:**

```bash
@claude use skill automation/feature-implementer

# Input:
# Feature name: User Profile
# Test coverage target: 75
# Generate integration tests: no
```

**Result:**

```
✅ Feature "User Profile" implemented successfully!

📊 Summary:
- Files Created: 20
- Test Coverage: 77.1%
- Implementation Time: 6 minutes
```

### Example 3: Implement Payment Processing (PCI-DSS)

**IMPLEMENTATION_PLAN.md:**

```markdown
### Feature 5: Payment Processing
**Priority:** HIGH
**Compliance:** PCI-DSS
**Estimated Time:** 8-10 hours

**Requirements:**
- Process credit card payments via Stripe
- Store payment methods securely (tokenized)
- View payment history
- Refund payments

**Security Requirements:**
- NEVER store full credit card numbers
- Use Stripe tokenization
- HTTPS only
- PCI-DSS Level 1 compliance

**API Endpoints:**
- POST /api/payments/intents
- POST /api/payments/confirm
- GET /api/payments/history
- POST /api/payments/{id}/refund

**Data Models:**
```dart
class Payment {
  final String id;
  final int amount;
  final String currency;
  final PaymentStatus status;
  final DateTime createdAt;
}

class PaymentMethod {
  final String id;
  final String brand; // visa, mastercard, etc.
  final String last4;
  final int expiryMonth;
  final int expiryYear;
}
```

**UI Screens:**
- PaymentScreen (enter card)
- PaymentMethodsScreen (saved cards)
- PaymentHistoryScreen
```

**Run the skill:**

```bash
@claude use skill automation/feature-implementer

# Input:
# Feature name: Payment Processing
# Test coverage target: 90
# Generate integration tests: yes
```

**Security Validation Output:**

```
🔒 Security Validation:

✅ PCI-DSS Compliance:
  - Stripe tokenization implemented
  - No credit card storage
  - Only last 4 digits displayed
  - HTTPS enforced
  - Payment details sent directly to Stripe

✅ Payment Security:
  - 3D Secure support added
  - Payment intent confirmation on server
  - Idempotency keys for duplicate prevention
  - Webhook signature verification

✅ Data Protection:
  - Payment history encrypted at rest
  - Audit logging for all payment operations
  - PII handling compliant with GDPR
```

---

## Troubleshooting

### Common Issues

#### 1. "Feature not found in IMPLEMENTATION_PLAN.md"

**Problem:** Skill can't locate the feature in your plan.

**Solution:**
- Ensure feature name matches exactly (case-sensitive)
- Check IMPLEMENTATION_PLAN.md exists at `docs/IMPLEMENTATION_PLAN.md`
- Verify feature has all required sections

#### 2. "flutter analyze shows errors"

**Problem:** Generated code has linting issues.

**Solution:**
```bash
# Fix formatting
dart format lib/ test/

# Check specific errors
flutter analyze --verbose

# Common fixes:
# - Add missing imports
# - Fix typos in file paths
# - Update pubspec.yaml dependencies
```

#### 3. "Tests failing after generation"

**Problem:** Some tests don't pass initially.

**Solution:**
```bash
# Generate mocks
flutter pub run build_runner build --delete-conflicting-outputs

# Update golden files
flutter test --update-goldens

# Check specific test
flutter test test/features/auth/domain/usecases/login_test.dart
```

#### 4. "Coverage below target"

**Problem:** Test coverage is 65%, target is 70%.

**Solution:**
- Identify uncovered lines:
```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html  # View in browser
```

- Add tests for red (uncovered) lines:
```dart
// Example: Cover edge case
test('should return ValidationFailure for null email', () {
  final result = usecase(LoginParams(email: null, password: 'pass'));
  expect(result.isLeft(), true);
});
```

#### 5. "API calls failing in tests"

**Problem:** Tests try to make real HTTP requests.

**Solution:**
- Mock Dio:
```dart
class MockDio extends Mock implements Dio {}

setUp(() {
  mockDio = MockDio();
  remoteDataSource = AuthRemoteDataSourceImpl(dio: mockDio);
});

test('...', () {
  when(mockDio.post(any, data: anyNamed('data')))
      .thenAnswer((_) async => Response(
            data: {'user': {...}},
            statusCode: 200,
            requestOptions: RequestOptions(path: ''),
          ));
});
```

---

## FAQ

**Q: Can I use this skill on an existing project?**

A: Yes, but:
1. Run `flutter-bootstrapper` first if Clean Architecture structure doesn't exist
2. Ensure no file conflicts (skill won't overwrite existing files)
3. May need to adjust imports if your project structure differs

**Q: Does this work with Firebase Auth instead of custom backend?**

A: Yes! Modify `IMPLEMENTATION_PLAN.md`:
```markdown
**API Endpoints:**
- Use Firebase Auth SDK (no custom endpoints)

**Technical Details:**
- firebase_auth: ^4.15.0
- FirebaseAuth.instance.signInWithEmailAndPassword()
```

The skill will generate code adapted for Firebase.

**Q: Can I customize the generated BLoC to use Cubit instead?**

A: Not automatically, but easy to refactor:
- Skill generates full BLoC (events + states + bloc)
- Convert to Cubit by:
  1. Extend Cubit instead of Bloc
  2. Remove events, use methods directly
  3. Call `emit()` in methods

**Q: How do I handle pagination in generated code?**

A: Add to IMPLEMENTATION_PLAN.md:
```markdown
**Requirements:**
- Paginated list of posts (20 per page)
- Infinite scroll support

**Data Models:**
```dart
class PaginatedResponse<T> {
  final List<T> items;
  final int page;
  final int totalPages;
  final bool hasMore;
}
```

**API Endpoints:**
- GET /api/posts?page=1&limit=20
```

Skill will generate pagination handling in repository and BLoC.

**Q: Does this support offline-first apps?**

A: Yes! The generated repository pattern includes:
- Local caching (SQLite or Hive)
- Network connectivity checks
- Fallback to cached data when offline
- Sync queue for pending operations

**Q: Can I generate multiple features at once?**

A: Not directly (to maintain quality), but you can:
1. Run skill for feature A
2. Immediately run again for feature B
3. Use `automation-orchestrator` skill for batch processing

**Q: How do I add custom error types?**

A: Extend `Failure` base class:
```dart
// In lib/core/error/failures.dart
class PaymentFailure extends Failure {
  const PaymentFailure({required super.message});
}

// Use in repository
catch (StripeException e) {
  return Left(PaymentFailure(message: e.message));
}
```

**Q: Does this work for web and desktop?**

A: Yes! Generated code is platform-agnostic. Just note:
- FlutterSecureStorage: Use encrypted_shared_preferences on web
- Biometrics: Not available on web
- File uploads: Use different packages per platform

**Q: Can I use this with GraphQL instead of REST?**

A: Yes! Update data source implementation:
```dart
// Replace Dio with graphql_flutter
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final GraphQLClient client;

  @override
  Future<UserModel> loginWithEmail({...}) async {
    final result = await client.mutate(MutationOptions(
      document: gql(loginMutation),
      variables: {'email': email, 'password': password},
    ));

    if (result.hasException) {
      throw ServerException(message: result.exception.toString());
    }

    return UserModel.fromJson(result.data!['login']);
  }
}
```

---

## Additional Resources

- **PRPROMPTS Methodology:** See `docs/PRPROMPTS-SPECIFICATION.md`
- **Clean Architecture Guide:** See `docs/ARCHITECTURE.md`
- **Security Best Practices:** See `PRPROMPTS/16-security_and_compliance.md`
- **Testing Strategies:** See `docs/TESTING-GUIDE.md`
- **CI/CD Setup:** See `.github/workflows/` examples

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
**Skill Status:** ✅ Implemented
