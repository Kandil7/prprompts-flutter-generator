# Widget Optimization Prompt Template

Analyze this Flutter widget tree and suggest performance optimizations.

## Widget Tree Structure

```json
{{widget_tree}}
```

## Generated Code Snippet

```dart
{{code_snippet}}
```

## Optimization Analysis

Analyze for the following optimization opportunities:

### 1. Const Constructors
- Identify widgets that can use `const` constructors
- Look for widgets with no dynamic values
- Suggest `const` for Text, Icon, SizedBox, Padding, etc.

### 2. Widget Extraction
- Detect when `build()` method > 100 lines
- Suggest extracting complex sub-trees
- Recommend when to create separate widget classes

### 3. Unnecessary Rebuilds
- Check for `BlocBuilder` without `buildWhen`
- Detect `StatefulWidget` with excessive `setState` calls
- Suggest using `ValueListenableBuilder` for simple state

### 4. Performance Patterns
- `ListView.builder` vs `ListView(children: [...])`
- `GridView.builder` vs `GridView.count`
- Lazy loading for large lists
- Image caching strategies

### 5. Widget Keys
- Suggest keys for list items (ValueKey, ObjectKey)
- GlobalKey for accessing widget state
- UniqueKey for forcing rebuilds

## Output Format

Return **only** valid JSON:

```json
{
  "optimizations": [
    {
      "type": "const | extraction | rebuild | performance | keys",
      "widget": "widget name or path in tree",
      "suggestion": "specific optimization to apply",
      "impact": "high | medium | low",
      "code_snippet": "example code (optional)"
    }
  ],
  "overall_score": 0.85,
  "summary": "brief assessment of widget tree health"
}
```

## Impact Levels

- **High**: 30%+ performance improvement, affects user experience
- **Medium**: 10-30% improvement, noticeable on lower-end devices
- **Low**: < 10% improvement, good practice but minor impact

## Example Optimizations

### Type: const

```json
{
  "type": "const",
  "widget": "Text widget on line 42",
  "suggestion": "Add const constructor - text value is static",
  "impact": "medium",
  "code_snippet": "const Text('Welcome')"
}
```

### Type: extraction

```json
{
  "type": "extraction",
  "widget": "build method",
  "suggestion": "Extract header section (lines 50-80) to _buildHeader()",
  "impact": "high",
  "code_snippet": "Widget _buildHeader() {\n  return Container(...);\n}"
}
```

### Type: rebuild

```json
{
  "type": "rebuild",
  "widget": "BlocBuilder<UserBloc, UserState>",
  "suggestion": "Add buildWhen to prevent rebuilds when only loading state changes",
  "impact": "high",
  "code_snippet": "buildWhen: (prev, curr) => prev.user != curr.user"
}
```

### Type: performance

```json
{
  "type": "performance",
  "widget": "ListView",
  "suggestion": "Use ListView.builder for potentially large list (>20 items)",
  "impact": "high",
  "code_snippet": "ListView.builder(\n  itemCount: items.length,\n  itemBuilder: (context, index) => ...\n)"
}
```

### Type: keys

```json
{
  "type": "keys",
  "widget": "ListTile in ListView.builder",
  "suggestion": "Add ValueKey for better performance when list is reordered",
  "impact": "low",
  "code_snippet": "ListTile(\n  key: ValueKey(item.id),\n  ...\n)"
}
```

## Scoring Criteria

Calculate overall_score based on:
- Presence of const constructors: +0.2
- Reasonable build method size (< 150 lines): +0.2
- Proper use of builders for lists: +0.2
- BlocBuilder has buildWhen: +0.2
- Widgets have appropriate keys: +0.2

Maximum score: 1.0 (perfect optimization)
