# Code Improvement Suggestions Prompt Template

Review this Flutter code and provide actionable improvement suggestions.

## Flutter Code

```dart
{{code}}
```

## Context

```json
{{context}}
```

## Review Areas

### 1. Code Organization

Check:
- File structure follows feature-first organization
- Proper separation of concerns (UI, business logic, data)
- Widget tree depth and complexity
- Method/function length and cohesion
- Consistent naming conventions

Suggest:
- Extracting widgets to separate files
- Creating utility functions
- Reorganizing code for better readability

### 2. State Management

Evaluate:
- Appropriate use of BLoC/Cubit/Provider
- State immutability
- Event/method naming clarity
- State class organization
- Side effects handling

Suggest:
- Better state management patterns
- Reducing setState usage in StatefulWidget
- Using buildWhen to prevent unnecessary rebuilds

### 3. Error Handling

Review:
- Try-catch coverage for async operations
- User-friendly error messages
- Error state management
- Logging strategy
- Recovery mechanisms

Suggest:
- More comprehensive error handling
- Better error messages
- Graceful degradation

### 4. Performance

Analyze:
- Build method complexity
- Const constructor usage
- List rendering patterns
- Image loading strategies
- Unnecessary rebuilds

Suggest:
- Performance optimizations
- Lazy loading
- Caching strategies

### 5. Accessibility

Check:
- Semantic labels
- Color contrast
- Touch target sizes
- Screen reader support
- Text scaling support

Suggest:
- Accessibility improvements
- WCAG compliance

### 6. Testing

Assess:
- Test coverage potential
- Testability of code
- Mock-friendly design
- Widget key usage

Suggest:
- Areas that need tests
- How to improve testability

### 7. Security

Review:
- Hardcoded secrets
- Input validation
- SQL injection risks
- XSS vulnerabilities
- Secure storage usage

Suggest:
- Security improvements
- Best practices

### 8. Maintainability

Evaluate:
- Code comments
- Documentation
- Magic numbers/strings
- Code duplication
- Cyclomatic complexity

Suggest:
- Better documentation
- Constants extraction
- DRY improvements

## Output Format

Return **only** valid JSON:

```json
{
  "suggestions": [
    {
      "category": "organization | state | errors | performance | accessibility | testing | security | maintainability",
      "priority": "high | medium | low",
      "title": "Short descriptive title",
      "description": "Detailed explanation of the issue and why it matters",
      "current_code": "Current problematic code snippet",
      "improved_code": "Suggested improved code",
      "impact": "User/developer benefit of making this change",
      "effort": "Estimated effort (hours or story points)"
    }
  ],
  "quality_score": 0.85,
  "strengths": ["What the code does well"],
  "critical_issues": ["Must-fix issues"],
  "quick_wins": ["Easy improvements with high impact"]
}
```

## Priority Levels

- **high**: Impacts users, security risks, performance bottlenecks
- **medium**: Code quality, maintainability, testing gaps
- **low**: Nice-to-have, minor improvements, style preferences

## Example Suggestions

### High Priority: Error Handling
```json
{
  "category": "errors",
  "priority": "high",
  "title": "Add error handling to API call",
  "description": "The fetchUser call can fail but errors are not handled, causing app crashes",
  "current_code": "final user = await repository.fetchUser(id);",
  "improved_code": "try {\n  final user = await repository.fetchUser(id);\n  emit(UserLoaded(user));\n} on NetworkException {\n  emit(const UserError('No internet connection'));\n} on Exception catch (e) {\n  emit(UserError('Failed to load user: $e'));\n}",
  "impact": "Prevents app crashes, provides better UX",
  "effort": "0.5 hours"
}
```

### Medium Priority: State Management
```json
{
  "category": "state",
  "priority": "medium",
  "title": "Replace setState with BLoC",
  "description": "Component uses StatefulWidget with 8 setState calls, making it hard to test and maintain",
  "current_code": "setState(() { _isLoading = true; });",
  "improved_code": "// Use UserBloc\ncontext.read<UserBloc>().add(LoadUser());",
  "impact": "Easier to test, better separation of concerns",
  "effort": "2 hours"
}
```

### Low Priority: Code Organization
```json
{
  "category": "organization",
  "priority": "low",
  "title": "Extract header widget",
  "description": "Build method is 180 lines, header section could be extracted",
  "current_code": "Container(child: Row(...)) // 40 lines",
  "improved_code": "Widget _buildHeader() {\n  return Container(child: Row(...));\n}",
  "impact": "Improved readability and reusability",
  "effort": "0.5 hours"
}
```

## Quality Score Calculation

Score 0.0 - 1.0 based on:
- Code organization: 20%
- Error handling: 20%
- Performance: 15%
- State management: 15%
- Testing readiness: 10%
- Accessibility: 10%
- Security: 5%
- Maintainability: 5%

## Output Guidelines

1. **Be specific**: Reference exact line numbers and code snippets
2. **Be actionable**: Provide concrete code examples
3. **Explain why**: Don't just say what's wrong, explain the impact
4. **Prioritize**: Focus on high-impact changes first
5. **Be encouraging**: Acknowledge what's done well

## Example Output

```json
{
  "suggestions": [
    {
      "category": "performance",
      "priority": "high",
      "title": "Use ListView.builder for large lists",
      "description": "Current implementation loads all 1000 items at once, causing memory issues",
      "current_code": "ListView(children: items.map((i) => ListTile(...)).toList())",
      "improved_code": "ListView.builder(\n  itemCount: items.length,\n  itemBuilder: (context, index) => ListTile(...)\n)",
      "impact": "Reduces memory usage by 90%, smoother scrolling",
      "effort": "0.25 hours"
    }
  ],
  "quality_score": 0.78,
  "strengths": [
    "Well-structured BLoC implementation",
    "Comprehensive error states",
    "Good use of const constructors"
  ],
  "critical_issues": [
    "Missing error handling on network calls",
    "Potential memory leak in subscription"
  ],
  "quick_wins": [
    "Add const to static Text widgets (10 occurrences)",
    "Extract _buildHeader method (20 lines)",
    "Add semantic labels to 3 IconButtons"
  ]
}
```
