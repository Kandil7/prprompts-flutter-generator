# Accessibility Check Prompt Template

Validate this Flutter code for accessibility compliance.

## Flutter Code

```dart
{{code}}
```

## Accessibility Guidelines

Check compliance with:
- WCAG 2.1 Level AA
- Material Design Accessibility
- Flutter Accessibility Best Practices

## Required Checks

### 1. Semantics Widgets

Verify:
- All images have semantic labels
- Interactive elements have labels
- Decorative elements are excluded from semantics
- Proper semantic roles (button, link, heading)

Example:
```dart
Semantics(
  label: 'Submit form',
  button: true,
  child: IconButton(icon: Icon(Icons.send)),
)
```

### 2. Screen Reader Support

Check:
- `semanticLabel` on IconButton, FloatingActionButton
- `Semantics` widgets for custom interactions
- ExcludeSemantics for decorative elements
- Reading order is logical

Example:
```dart
IconButton(
  icon: Icon(Icons.settings),
  semanticLabel: 'Open settings',
  onPressed: () {},
)
```

### 3. Color Contrast (WCAG AA)

Verify:
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18pt+): 3:1 contrast ratio minimum
- UI components: 3:1 contrast ratio
- No reliance on color alone for information

Common violations:
- Grey text on white background
- Light colored links
- Disabled button text

### 4. Touch Target Size

Check:
- Minimum 48x48 pixels for tap targets
- Sufficient spacing between clickable elements
- Use `Material` or `InkWell` for proper touch feedback

Example:
```dart
SizedBox(
  width: 48,
  height: 48,
  child: IconButton(...),
)
```

### 5. Form Accessibility

Verify:
- All TextField/TextFormField have labels
- Error messages are readable by screen readers
- Required fields are marked
- Autocomplete hints provided

Example:
```dart
TextFormField(
  decoration: InputDecoration(
    labelText: 'Email address',
    hintText: 'user@example.com',
    errorText: hasError ? 'Invalid email' : null,
  ),
)
```

### 6. Focus Management

Check:
- Logical focus order
- Focus indicators visible
- Skip links for navigation
- Keyboard navigation works

### 7. Text Scaling

Verify:
- Text respects system font size settings
- No hardcoded font sizes that break scaling
- Layout adapts to large text
- Use MediaQuery.textScaleFactorOf(context)

### 8. Motion and Animation

Check:
- Respect `MediaQuery.disableAnimations`
- Provide alternatives to motion-based interactions
- No autoplaying videos without controls

## Output Format

Return **only** valid JSON:

```json
{
  "valid": true,
  "issues": [
    {
      "severity": "error | warning | info",
      "category": "semantics | screen_reader | contrast | touch_targets | forms | focus | text_scaling | motion",
      "description": "Clear description of the issue",
      "line": 42,
      "suggestion": "How to fix the issue"
    }
  ],
  "score": 0.92,
  "summary": "Overall accessibility assessment"
}
```

## Severity Levels

- **error**: WCAG violation, blocks some users completely
- **warning**: Best practice violation, impacts user experience
- **info**: Suggestion for improvement, optional

## Example Issues

### Error: Missing Semantic Label
```json
{
  "severity": "error",
  "category": "screen_reader",
  "description": "IconButton has no semantic label - screen readers can't identify it",
  "line": 42,
  "suggestion": "Add semanticLabel: 'Open menu' to IconButton"
}
```

### Warning: Low Contrast
```json
{
  "severity": "warning",
  "category": "contrast",
  "description": "Text color Colors.grey[400] on white background has insufficient contrast (2.8:1, needs 4.5:1)",
  "line": 56,
  "suggestion": "Use darker text color like Colors.grey[700] or Colors.black87"
}
```

### Info: Missing Form Label
```json
{
  "severity": "info",
  "category": "forms",
  "description": "TextField missing labelText in decoration",
  "line": 78,
  "suggestion": "Add labelText to InputDecoration for better accessibility"
}
```

## Scoring Formula

Calculate score (0.0 - 1.0) based on:
- No errors: 1.0
- Each error: -0.15
- Each warning: -0.08
- Each info: -0.03

Minimum score: 0.0

## Common Patterns to Check

### Good: Accessible Image
```dart
Semantics(
  label: 'User profile picture',
  image: true,
  child: Image.network(avatarUrl),
)
```

### Bad: No Semantic Label
```dart
Image.network(avatarUrl) // ❌ No label for screen readers
```

### Good: Accessible Button
```dart
ElevatedButton(
  onPressed: _submit,
  child: const Text('Submit Form'), // ✅ Text is readable
)
```

### Bad: Icon-Only Button
```dart
IconButton(
  icon: Icon(Icons.delete),
  onPressed: _delete,
) // ❌ No semantic label
```

### Good: High Contrast
```dart
Text(
  'Important message',
  style: TextStyle(
    color: Colors.black87, // ✅ Good contrast on white
  ),
)
```

### Bad: Low Contrast
```dart
Text(
  'Important message',
  style: TextStyle(
    color: Colors.grey[300], // ❌ Poor contrast on white
  ),
)
```

## Resources

- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- Flutter Accessibility: https://docs.flutter.dev/development/accessibility-and-localization/accessibility
- Material Design: https://material.io/design/usability/accessibility.html
