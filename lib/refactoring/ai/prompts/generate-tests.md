# Test Generation Prompt Template

Generate comprehensive Flutter tests for this component.

## Component Information

- Name: {{component_name}}
- Type: {{component_type}}
- Feature: {{feature}}
- Props: {{props}}
- State Variables: {{state_variables}}
- Methods: {{methods}}
- API Calls: {{api_calls}}

## Flutter Code

```dart
{{flutter_code}}
```

## Test Requirements

### Widget Tests (flutter_test)

Generate `testWidgets` that verify:

1. **Rendering**: Widget renders without errors
2. **Props**: Different prop combinations work correctly
3. **User Interactions**: Button taps, form inputs, gestures
4. **State Changes**: Loading, success, error states
5. **Navigation**: Route changes, dialog displays
6. **Conditional Rendering**: Widgets appear/disappear based on state

Use:
- `tester.pumpWidget()` to render widgets
- `find.byType()`, `find.text()`, `find.byKey()` to locate widgets
- `expect()` for assertions
- `tester.tap()`, `tester.enterText()` for interactions
- `tester.pump()` to rebuild after state changes

### Unit Tests (bloc_test)

Generate tests for BLoC/Cubit:

1. **Initial State**: Verify initial state is correct
2. **Events/Methods**: Test all events/methods
3. **State Transitions**: Verify state changes correctly
4. **Error Handling**: Test error scenarios
5. **Side Effects**: Verify API calls, navigation

Use:
- `blocTest<MyBloc, MyState>()` for BLoC testing
- `setUp()` for test initialization
- `build:` to create BLoC instance
- `act:` to trigger events
- `expect:` for expected state sequence

### Integration Tests (integration_test)

Generate end-to-end tests:

1. **User Flows**: Complete workflows (login, checkout, etc.)
2. **API Integration**: Test with mock API responses
3. **Navigation Flows**: Multi-screen interactions
4. **Data Persistence**: Test data saving/loading

## Output Format

Return **only** valid Dart test code (no markdown, no explanations):

```dart
// Widget Tests
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mocktail/mocktail.dart';

// Import the component being tested
import 'package:{{package_name}}/features/{{feature}}/presentation/pages/{{page_file}}.dart';
import 'package:{{package_name}}/features/{{feature}}/presentation/bloc/{{bloc_file}}.dart';

// Mock classes
class MockUserBloc extends Mock implements UserBloc {}
class MockUserRepository extends Mock implements UserRepository {}

void main() {
  group('{{component_name}} Widget Tests', () {
    late MockUserBloc mockBloc;

    setUp(() {
      mockBloc = MockUserBloc();
    });

    testWidgets('should render without errors', (tester) async {
      when(() => mockBloc.state).thenReturn(const UserInitial());

      await tester.pumpWidget(
        MaterialApp(
          home: BlocProvider<UserBloc>(
            create: (_) => mockBloc,
            child: const {{component_name}}(),
          ),
        ),
      );

      expect(find.byType({{component_name}}), findsOneWidget);
    });

    // Add more widget tests...
  });

  group('{{component_name}}Bloc Unit Tests', () {
    late MockUserRepository mockRepository;
    late UserBloc bloc;

    setUp(() {
      mockRepository = MockUserRepository();
      bloc = UserBloc(mockRepository);
    });

    blocTest<UserBloc, UserState>(
      'should emit [UserLoading, UserLoaded] when fetchUser succeeds',
      build: () {
        when(() => mockRepository.getUser(any()))
            .thenAnswer((_) async => const User(id: '1', name: 'Test'));
        return bloc;
      },
      act: (bloc) => bloc.add(const FetchUser('1')),
      expect: () => [
        const UserLoading(),
        const UserLoaded(User(id: '1', name: 'Test')),
      ],
    );

    // Add more BLoC tests...
  });
}
```

## Test Coverage Goals

Aim for:
- **Widget Tests**: 80%+ coverage of UI interactions
- **Unit Tests**: 90%+ coverage of business logic
- **Integration Tests**: All critical user flows

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **One assertion per test**: Keep tests focused
3. **Descriptive names**: Use `should [expected behavior] when [condition]`
4. **Mock dependencies**: Use `mocktail` for mocking
5. **Test edge cases**: Empty states, errors, loading
6. **Use const**: `const UserInitial()` for performance

## Example Test Cases

### Widget Test: Button Tap
```dart
testWidgets('should call onPressed when button is tapped', (tester) async {
  var wasCalled = false;

  await tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: ElevatedButton(
          onPressed: () => wasCalled = true,
          child: const Text('Submit'),
        ),
      ),
    ),
  );

  await tester.tap(find.text('Submit'));
  await tester.pump();

  expect(wasCalled, true);
});
```

### Unit Test: State Transition
```dart
blocTest<LoginBloc, LoginState>(
  'should emit [LoginLoading, LoginSuccess] when credentials are valid',
  build: () {
    when(() => mockAuthRepo.login(any(), any()))
        .thenAnswer((_) async => const User(id: '1'));
    return LoginBloc(mockAuthRepo);
  },
  act: (bloc) => bloc.add(const LoginSubmitted('user', 'pass')),
  expect: () => [
    const LoginLoading(),
    isA<LoginSuccess>(),
  ],
);
```

### Widget Test: Form Validation
```dart
testWidgets('should show error when email is invalid', (tester) async {
  await tester.pumpWidget(
    MaterialApp(home: LoginPage()),
  );

  await tester.enterText(find.byKey(const Key('email-field')), 'invalid');
  await tester.tap(find.text('Submit'));
  await tester.pump();

  expect(find.text('Invalid email'), findsOneWidget);
});
```
