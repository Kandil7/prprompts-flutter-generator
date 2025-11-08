# React-to-Flutter Conversion Guide

## Quick Start (3 Steps)

### 1. Install
```bash
npm install -g prprompts-flutter-generator
```

### 2. Convert Your React App
```bash
prprompts refactor ./my-react-app ./my-flutter-app
```

### 3. Done! 🎉
Your Flutter app is ready in `./my-flutter-app` with:
- ✅ All components converted to Flutter widgets
- ✅ All styles converted (CSS → Flutter)
- ✅ All hooks converted (useState, useEffect, etc.)
- ✅ Clean Architecture structure
- ✅ BLoC state management
- ✅ Comprehensive validation report

---

## Complete Usage Guide

### Basic Command

```bash
prprompts refactor <react-source> <flutter-output> [options]
```

**Parameters:**
- `<react-source>` - Path to your React/React Native project
- `<flutter-output>` - Path where Flutter project will be created

**Example:**
```bash
prprompts refactor ./my-react-app ./my-flutter-app
```

---

## Command Options

### State Management

Choose your state management approach:

```bash
# BLoC pattern (recommended)
prprompts refactor ./react-app ./flutter-app --state-mgmt bloc

# Cubit pattern (simpler BLoC)
prprompts refactor ./react-app ./flutter-app --state-mgmt cubit

# Provider pattern
prprompts refactor ./react-app ./flutter-app --state-mgmt provider

# Riverpod pattern
prprompts refactor ./react-app ./flutter-app --state-mgmt riverpod
```

**Default:** BLoC (if not specified)

---

### AI Enhancement

Enable AI-powered code optimization:

```bash
# Using Claude AI (best accuracy)
prprompts refactor ./react-app ./flutter-app --ai claude

# Using Qwen AI (best context, large codebases)
prprompts refactor ./react-app ./flutter-app --ai qwen

# Using Gemini AI (best free tier)
prprompts refactor ./react-app ./flutter-app --ai gemini

# No AI enhancement (faster, no API key required)
prprompts refactor ./react-app ./flutter-app --no-ai
```

**Default:** No AI (unless specified)

---

### Architecture Options

```bash
# Clean Architecture (domain/data/presentation)
prprompts refactor ./react-app ./flutter-app --architecture clean

# Simple architecture (flat structure)
prprompts refactor ./react-app ./flutter-app --architecture simple

# Feature-first architecture
prprompts refactor ./react-app ./flutter-app --architecture feature
```

**Default:** Clean Architecture

---

### Validation

```bash
# Run all validations (recommended)
prprompts refactor ./react-app ./flutter-app --validate

# Skip validation (faster)
prprompts refactor ./react-app ./flutter-app --no-validate

# Specific validators only
prprompts refactor ./react-app ./flutter-app --validators code,security,performance
```

**Available Validators:**
- `code` - Dart syntax and coding conventions
- `architecture` - Clean Architecture compliance
- `security` - Security best practices
- `performance` - Performance optimizations
- `accessibility` - Accessibility compliance

**Default:** All validators enabled

---

## Complete Example Commands

### Example 1: Basic Conversion
```bash
# Simple conversion with defaults
prprompts refactor ./my-react-app ./my-flutter-app
```

**What you get:**
- BLoC state management
- Clean Architecture
- All validations
- No AI enhancement

---

### Example 2: Production-Ready with AI
```bash
# Full-featured conversion with Claude AI
prprompts refactor ./my-react-app ./my-flutter-app \
  --state-mgmt bloc \
  --ai claude \
  --architecture clean \
  --validate
```

**What you get:**
- BLoC state management
- Claude AI-enhanced code
- Clean Architecture
- Comprehensive validation report
- Optimized widgets
- Security checks

---

### Example 3: Quick Prototype
```bash
# Fast conversion without validation
prprompts refactor ./react-prototype ./flutter-prototype \
  --state-mgmt provider \
  --architecture simple \
  --no-validate \
  --no-ai
```

**What you get:**
- Provider state management
- Simple flat structure
- Fast conversion
- No validation overhead

---

### Example 4: Large Codebase
```bash
# Large project with Qwen (best context)
prprompts refactor ./large-react-app ./large-flutter-app \
  --state-mgmt bloc \
  --ai qwen \
  --architecture clean \
  --validators code,architecture
```

**What you get:**
- Handles 100+ components
- Qwen's 256K context window
- BLoC pattern throughout
- Code + architecture validation only

---

## What Gets Converted

### 1. **Components → Widgets**

**React:**
```jsx
function UserCard({ name, email }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}
```

**Flutter:**
```dart
class UserCard extends StatelessWidget {
  final String name;
  final String email;

  const UserCard({
    Key? key,
    required this.name,
    required this.email,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(...),
      child: Column(
        children: [
          Text(name, style: TextStyle(...)),
          Text(email, style: TextStyle(...)),
        ],
      ),
    );
  }
}
```

---

### 2. **Styles → Flutter Styling**

**React CSS:**
```jsx
const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};
```

**Flutter:**
```dart
Container(
  padding: EdgeInsets.all(16.0),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(8.0),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.1),
        offset: Offset(0, 2),
        blurRadius: 4.0,
      ),
    ],
  ),
)
```

---

### 3. **Hooks → Flutter Patterns**

#### useState → StatefulWidget

**React:**
```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Flutter:**
```dart
class Counter extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => setState(() => _count++),
      child: Text('Count: $_count'),
    );
  }
}
```

---

#### useEffect → Lifecycle Methods

**React:**
```jsx
useEffect(() => {
  fetchData();
  return () => cleanup();
}, [dependency]);
```

**Flutter:**
```dart
@override
void initState() {
  super.initState();
  fetchData();
}

@override
void dispose() {
  cleanup();
  super.dispose();
}

@override
void didUpdateWidget(OldWidget oldWidget) {
  super.didUpdateWidget(oldWidget);
  if (widget.dependency != oldWidget.dependency) {
    fetchData();
  }
}
```

---

#### useContext → Provider

**React:**
```jsx
const theme = useContext(ThemeContext);
```

**Flutter:**
```dart
final theme = Provider.of<ThemeData>(context);
// or
final theme = context.watch<ThemeData>();
```

---

#### useReducer → BLoC

**React:**
```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

**Flutter:**
```dart
// BLoC generated automatically
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(CounterInitial()) {
    on<IncrementEvent>((event, emit) {
      emit(CounterState(count: state.count + 1));
    });
  }
}

// Usage in widget
BlocBuilder<CounterBloc, CounterState>(
  builder: (context, state) {
    return Text('${state.count}');
  },
)
```

---

### 4. **JSX Patterns → Flutter Equivalents**

#### Higher-Order Components → Mixins

**React:**
```jsx
const withLogging = (Component) => {
  return (props) => {
    console.log('Rendering:', props);
    return <Component {...props} />;
  };
};
```

**Flutter:**
```dart
mixin LoggingMixin on StatelessWidget {
  @override
  Widget build(BuildContext context) {
    debugPrint('Rendering: $runtimeType');
    return buildContent(context);
  }

  Widget buildContent(BuildContext context);
}
```

---

#### React.memo → const Constructors

**React:**
```jsx
const MemoizedComponent = React.memo(({ title }) => (
  <h1>{title}</h1>
));
```

**Flutter:**
```dart
class MemoizedComponent extends StatelessWidget {
  final String title;

  const MemoizedComponent({
    Key? key,
    required this.title,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Text(title);
  }
}
```

---

#### Lists → ListView.builder

**React:**
```jsx
items.map(item => <Item key={item.id} data={item} />)
```

**Flutter:**
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return Item(
      key: ValueKey(item.id),
      data: item,
    );
  },
)
```

---

## Output Structure

After conversion, your Flutter project will have this structure:

```
my-flutter-app/
├── lib/
│   ├── main.dart
│   ├── domain/              # Business logic layer
│   │   ├── entities/        # Core business objects
│   │   ├── repositories/    # Repository interfaces
│   │   └── usecases/        # Business use cases
│   ├── data/                # Data layer
│   │   ├── models/          # Data models
│   │   ├── repositories/    # Repository implementations
│   │   └── datasources/     # API/local data sources
│   ├── presentation/        # UI layer
│   │   ├── screens/         # Screen widgets
│   │   ├── widgets/         # Reusable widgets
│   │   └── bloc/            # BLoC state management
│   └── core/                # Core utilities
│       ├── theme/           # Converted styles
│       ├── constants/       # App constants
│       └── utils/           # Helper functions
├── test/                    # Unit & widget tests
├── pubspec.yaml             # Dependencies
├── CONVERSION_REPORT.md     # Detailed conversion report
└── VALIDATION_REPORT.md     # Validation results
```

---

## Understanding the Reports

### CONVERSION_REPORT.md

Generated after conversion, contains:

```markdown
# React-to-Flutter Conversion Report

## Summary
- Components converted: 25
- Widgets generated: 32
- Hooks converted: 18
- Styles converted: 45
- Tests generated: 25

## Components Breakdown
✅ UserCard → UserCard widget
✅ UserList → UserList widget
✅ LoginForm → LoginForm widget
...

## Hooks Conversion
✅ useState (12 instances) → StatefulWidget
✅ useEffect (8 instances) → Lifecycle methods
✅ useContext (5 instances) → Provider
...

## Style Conversion
✅ 45 style objects converted
✅ 120 CSS properties mapped
✅ 8 theme variables extracted
...
```

---

### VALIDATION_REPORT.md

Generated if `--validate` is used:

```markdown
# Flutter Code Validation Report

## Overall Score: 92/100 ✅

### Code Quality (95/100)
✅ All Dart files valid syntax
✅ Follows Flutter conventions
⚠️  3 minor linting suggestions

### Architecture (90/100)
✅ Clean Architecture structure
✅ Proper layer separation
✅ Dependency injection implemented

### Security (95/100)
✅ No hardcoded secrets
✅ Secure API calls
✅ Proper error handling

### Performance (88/100)
✅ Efficient widget builds
⚠️  Consider ListView.builder for UserList (100+ items)
✅ Proper const constructors

### Accessibility (92/100)
✅ Semantic labels present
✅ Contrast ratios acceptable
⚠️  Add Semantics to 2 custom widgets
```

---

## Validation & Testing

After conversion, validate the output:

```bash
# Navigate to Flutter project
cd my-flutter-app

# Get dependencies
flutter pub get

# Run analysis
flutter analyze

# Run tests
flutter test

# Run the app
flutter run
```

---

## Interactive Validation Command

Use the CLI validation command:

```bash
# Validate generated Flutter code
prprompts validate ./my-flutter-app

# Validate with specific validators
prprompts validate ./my-flutter-app --validators security,performance

# Generate detailed report
prprompts validate ./my-flutter-app --report detailed
```

---

## Troubleshooting

### Issue: "React source directory not found"

**Solution:**
```bash
# Ensure path is correct (use absolute path if needed)
prprompts refactor /absolute/path/to/react-app ./flutter-app
```

---

### Issue: "No React components found"

**Cause:** Your React project structure isn't recognized.

**Solution:**
```bash
# Ensure your React project has src/ directory with .js/.jsx files
react-app/
  └── src/
      ├── App.jsx
      └── components/

# Or specify custom source directory
prprompts refactor ./react-app/client ./flutter-app
```

---

### Issue: Conversion is slow

**Solutions:**

1. **Disable AI enhancement:**
```bash
prprompts refactor ./react-app ./flutter-app --no-ai
```

2. **Skip validation:**
```bash
prprompts refactor ./react-app ./flutter-app --no-validate
```

3. **Use simple architecture:**
```bash
prprompts refactor ./react-app ./flutter-app --architecture simple
```

---

### Issue: Some styles not converting properly

**Check CONVERSION_REPORT.md** for details on what couldn't be converted.

**Manual fixes:**
- Complex CSS animations → Use Flutter Animation API
- CSS Grid → Use Flutter GridView
- Advanced CSS selectors → Flutter doesn't have CSS selectors

---

## Advanced Usage

### Custom Configuration File

Create `.prprompts-refactor.json`:

```json
{
  "stateMgmt": "bloc",
  "architecture": "clean",
  "ai": "claude",
  "validate": true,
  "validators": ["code", "architecture", "security"],
  "generateTests": true,
  "preserveComments": true,
  "outputFormat": "detailed"
}
```

**Use config file:**
```bash
prprompts refactor ./react-app ./flutter-app --config .prprompts-refactor.json
```

---

### Programmatic Usage (Node.js)

```javascript
const { RefactorCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/RefactorCommand');

const refactor = new RefactorCommand();

await refactor.execute({
  source: './my-react-app',
  output: './my-flutter-app',
  stateMgmt: 'bloc',
  ai: 'claude',
  architecture: 'clean',
  validate: true
});
```

---

## Real-World Examples

### Example 1: E-commerce App

**React App:** Shopping cart with Redux
```bash
prprompts refactor ./react-ecommerce ./flutter-ecommerce \
  --state-mgmt bloc \
  --ai claude \
  --architecture clean \
  --validate
```

**Converts:**
- Redux → BLoC
- React Router → Flutter Navigator
- Axios API calls → Dio/http
- Material-UI → Flutter Material
- Payment forms → Flutter Forms + validation

---

### Example 2: Social Media Feed

**React Native App:** Instagram-like feed
```bash
prprompts refactor ./react-native-social ./flutter-social \
  --state-mgmt bloc \
  --ai qwen \
  --architecture feature \
  --validate
```

**Converts:**
- FlatList → ListView.builder
- Image picker → image_picker package
- Camera → camera package
- AsyncStorage → shared_preferences
- Push notifications → firebase_messaging

---

### Example 3: Dashboard Admin Panel

**React App:** Analytics dashboard
```bash
prprompts refactor ./react-dashboard ./flutter-dashboard \
  --state-mgmt riverpod \
  --ai gemini \
  --architecture clean \
  --validators code,performance
```

**Converts:**
- Chart.js → fl_chart package
- Complex tables → DataTable widgets
- Date pickers → Flutter date pickers
- File uploads → file_picker package

---

## Performance Optimization

The converter automatically optimizes:

1. **Widget Trees** - Minimizes rebuilds
2. **const Constructors** - Where possible
3. **ListView.builder** - For lists >10 items
4. **Keys** - Proper key usage for lists
5. **Async Operations** - FutureBuilder/StreamBuilder

---

## Migration Strategy

### Phase 1: Convert & Validate (Day 1)
```bash
# Convert your app
prprompts refactor ./react-app ./flutter-app --ai claude --validate

# Review reports
cat flutter-app/CONVERSION_REPORT.md
cat flutter-app/VALIDATION_REPORT.md
```

### Phase 2: Manual Review (Days 2-3)
- Review generated code
- Test critical user flows
- Fix any validation warnings
- Add missing custom logic

### Phase 3: Testing (Days 4-5)
- Run unit tests
- Run widget tests
- Manual QA testing
- Performance testing

### Phase 4: Production (Day 6+)
- Staging deployment
- Beta testing
- Production deployment
- Monitor performance

---

## Best Practices

### ✅ DO:
- Start with a small component/feature
- Review CONVERSION_REPORT.md carefully
- Run validation after conversion
- Test converted code thoroughly
- Use AI enhancement for production apps
- Keep React code as backup

### ❌ DON'T:
- Convert your entire app without testing
- Skip validation reports
- Assume 100% perfect conversion
- Delete React code immediately
- Ignore validation warnings

---

## Getting Help

**Documentation:**
- React-to-Flutter Guide (this file)
- [CONVERSION_EXAMPLES.md](lib/refactoring/generators/HOOKS_CONVERSION_EXAMPLES.md)
- [JSX_PATTERNS_EXAMPLES.md](lib/refactoring/generators/JSX_PATTERNS_EXAMPLES.md)
- [STYLE_CONVERSION_EXAMPLES.md](lib/refactoring/generators/STYLE_CONVERSION_EXAMPLES.md)

**Support:**
- GitHub Issues: https://github.com/Kandil7/prprompts-flutter-generator/issues
- Check validation reports for specific issues
- Run `prprompts doctor` to diagnose setup issues

---

## FAQ

**Q: Will it convert 100% of my React code?**
A: 90-95% automatic conversion. Complex animations, native modules, and some advanced patterns may need manual adjustment.

**Q: What React versions are supported?**
A: React 16.8+ (hooks) and React Native 0.60+

**Q: Does it handle TypeScript?**
A: Yes! TypeScript React code is fully supported. Types are converted to Dart types.

**Q: Can I convert back to React?**
A: No, this is one-way conversion. Keep your React code as backup.

**Q: Does it work with Next.js/Gatsby/CRA?**
A: Yes, all React frameworks supported. Only client-side code is converted (no SSR).

**Q: How long does conversion take?**
A: Small app (10 components): 30 seconds
   Medium app (50 components): 2-3 minutes
   Large app (200+ components): 5-10 minutes

**Q: Do I need an AI API key?**
A: No, AI enhancement is optional. Works without API keys (just skip `--ai` flag).

---

## Next Steps

1. ✅ Install: `npm install -g prprompts-flutter-generator`
2. ✅ Convert: `prprompts refactor ./my-react-app ./my-flutter-app`
3. ✅ Review: Check CONVERSION_REPORT.md
4. ✅ Validate: Review VALIDATION_REPORT.md
5. ✅ Test: `cd my-flutter-app && flutter test`
6. ✅ Run: `flutter run`

**Welcome to Flutter! 🚀**
