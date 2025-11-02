# Code Enhancement Prompt Template

You are a Flutter expert. Improve the following Dart code generated from React.

## Original React Component

```typescript
{{react_code}}
```

## Generated Flutter Code

```dart
{{flutter_code}}
```

## Context

- Component Name: {{component_name}}
- Feature: {{feature}}
- Type: {{component_type}}
- Has State: {{has_state}}
- API Calls: {{api_count}}

## Enhancement Goals

### 1. Naming Conventions
- **Variables**: camelCase (e.g., `userData`, `isLoading`)
- **Classes**: PascalCase (e.g., `LoginPage`, `UserBloc`)
- **Private members**: prefix with `_` (e.g., `_buildHeader()`)
- **Constants**: lowerCamelCase (e.g., `defaultPadding`)

### 2. Idiomatic Dart Code
- Use `??=` for null-aware assignment
- Use `=>` for single-line functions
- Use collection if: `if (condition) widget`
- Use spread operator: `...items`
- Prefer `final` over `var` where possible

### 3. Performance Optimizations
- Add `const` constructors where possible
- Extract complex widgets to separate methods/classes when `build()` > 100 lines
- Use `ListView.builder` instead of `ListView(children: [...])`
- Add `key` parameter to stateful widgets in lists

### 4. Error Handling
- Wrap async operations in try-catch
- Use proper exception types (`Exception`, `FormatException`, etc.)
- Handle API errors gracefully
- Provide user-friendly error messages

### 5. Documentation
- Add comments for complex business logic
- Document public APIs with `///` (dartdoc format)
- Explain workarounds or non-obvious code
- Add TODO comments for future improvements

## Output Format

Return **only** valid JSON (no markdown, no explanations):

```json
{
  "enhanced_code": "complete enhanced Dart code here (preserve all functionality)",
  "changes": [
    {
      "type": "naming | performance | error_handling | idiomatic | comments | security",
      "description": "Brief description of what was changed",
      "reason": "Why this improvement matters (user impact, performance gain, etc.)",
      "line": 42
    }
  ],
  "confidence": 0.95
}
```

## Quality Checklist

Before returning, verify:
- [ ] All original functionality is preserved
- [ ] Code follows Flutter style guide
- [ ] Null safety is maintained (`?`, `!`, `required`, `late`)
- [ ] No hardcoded secrets or API keys
- [ ] Performance optimizations don't break behavior
- [ ] Error handling is comprehensive

## Example Improvements

### Before
```dart
var userdata = null;
setState(() {
  userdata = data;
});
```

### After
```dart
UserData? userData; // Better naming, explicit type
setState(() {
  userData = data;
});
```

### Before
```dart
Widget build(BuildContext context) {
  return Text('Hello');
}
```

### After
```dart
Widget build(BuildContext context) {
  return const Text('Hello'); // const for performance
}
```

### Before
```dart
final result = await api.fetchData();
```

### After
```dart
try {
  final result = await api.fetchData();
  // Handle success
} on Exception catch (e) {
  // Handle error gracefully
  logger.error('Failed to fetch data: $e');
}
```
