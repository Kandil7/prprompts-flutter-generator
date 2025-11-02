# Hooks Conversion Examples

This document demonstrates React Hooks to Flutter pattern conversion.

## Overview

The hooks conversion system automatically converts:
- ✅ **useState** → StatefulWidget state fields
- ✅ **useEffect** → Lifecycle methods (initState, didUpdateWidget, dispose)
- ✅ **useContext** → Provider pattern
- ✅ **useReducer** → BLoC/Cubit pattern
- ✅ **useCallback** → Cached callbacks
- ✅ **useMemo** → Memoized values
- ✅ **useRef** → FocusNode/TextEditingController/ScrollController/GlobalKey
- ✅ **Custom hooks** → Mixins

---

## useState Conversion

### Simple State

**React:**
```jsx
const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};
```

**Flutter:**
```dart
class CounterWidget extends StatefulWidget {
  const CounterWidget({Key? key}) : super(key: key);

  @override
  State<CounterWidget> creates => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  num count = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Text('Count: $count'),
          ElevatedButton(
            onPressed: () {
              setState(() {
                count = count + 1;
              });
            },
            child: Text('Increment'),
          ),
        ],
      ),
    );
  }
}
```

### Multiple State Variables

**React:**
```jsx
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button disabled={loading}>
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};
```

**Flutter:**
```dart
class LoginFormWidget extends StatefulWidget {
  const LoginFormWidget({Key? key}) : super(key: key);

  @override
  State<LoginFormWidget> createState() => _LoginFormWidgetState();
}

class _LoginFormWidgetState extends State<LoginFormWidget> {
  String email = '';
  String password = '';
  bool loading = false;

  Future<void> _handleSubmit() async {
    setState(() {
      loading = true;
    });
    await login(email, password);
    setState(() {
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          onChanged: (value) {
            setState(() {
              email = value;
            });
          },
        ),
        TextField(
          obscureText: true,
          onChanged: (value) {
            setState(() {
              password = value;
            });
          },
        ),
        ElevatedButton(
          onPressed: loading ? null : _handleSubmit,
          child: Text(loading ? 'Loading...' : 'Submit'),
        ),
      ],
    );
  }
}
```

---

## useEffect Conversion

### Mount Only (Empty Dependency Array)

**React:**
```jsx
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // Empty deps = componentDidMount

  return <div>{user?.name}</div>;
};
```

**Flutter:**
```dart
class UserProfileWidget extends StatefulWidget {
  final String userId;

  const UserProfileWidget({Key? key, required this.userId}) : super(key: key);

  @override
  State<UserProfileWidget> createState() => _UserProfileWidgetState();
}

class _UserProfileWidgetState extends State<UserProfileWidget> {
  Map? user;

  @override
  void initState() {
    super.initState();
    fetchUser(widget.userId).then((value) {
      setState(() {
        user = value;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text(user?['name'] ?? ''),
    );
  }
}
```

### Dependency-Based Effects

**React:**
```jsx
const SearchResults = ({ query }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    search(query).then(setResults);
  }, [query]); // Re-run when query changes

  return <List data={results} />;
};
```

**Flutter:**
```dart
class SearchResultsWidget extends StatefulWidget {
  final String query;

  const SearchResultsWidget({Key? key, required this.query}) : super(key: key);

  @override
  State<SearchResultsWidget> createState() => _SearchResultsWidgetState();
}

class _SearchResultsWidgetState extends State<SearchResultsWidget> {
  List results = [];

  @override
  void initState() {
    super.initState();
    _performSearch();
  }

  @override
  void didUpdateWidget(covariant SearchResultsWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.query != widget.query) {
      _performSearch();
    }
  }

  void _performSearch() {
    search(widget.query).then((value) {
      setState(() {
        results = value;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: results.length,
      itemBuilder: (context, index) => ListTile(title: Text(results[index])),
    );
  }
}
```

### Cleanup Functions

**React:**
```jsx
const WebSocketComponent = () => {
  useEffect(() => {
    const ws = new WebSocket('ws://example.com');

    ws.onmessage = (event) => {
      console.log(event.data);
    };

    // Cleanup function
    return () => {
      ws.close();
    };
  }, []);

  return <div>WebSocket Active</div>;
};
```

**Flutter:**
```dart
class WebSocketWidget extends StatefulWidget {
  const WebSocketWidget({Key? key}) : super(key: key);

  @override
  State<WebSocketWidget> createState() => _WebSocketWidgetState();
}

class _WebSocketWidgetState extends State<WebSocketWidget> {
  late WebSocket _ws;

  @override
  void initState() {
    super.initState();
    _ws = WebSocket.connect('ws://example.com');
    _ws.listen((message) {
      print(message);
    });
  }

  @override
  void dispose() {
    _ws.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('WebSocket Active'),
    );
  }
}
```

---

## useContext Conversion

### Basic Context

**React:**
```jsx
const ThemeContext = React.createContext();

const ThemedButton = () => {
  const theme = useContext(ThemeContext);

  return (
    <button style={{ background: theme.primary }}>
      Click me
    </button>
  );
};
```

**Flutter:**
```dart
class ThemeProvider extends ChangeNotifier {
  Color primary = Colors.blue;

  void updateTheme(Color color) {
    primary = color;
    notifyListeners();
  }
}

class ThemedButton extends StatelessWidget {
  const ThemedButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();

    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: theme.primary,
      ),
      onPressed: () {},
      child: Text('Click me'),
    );
  }
}

// Usage
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => ThemeProvider()),
  ],
  child: ThemedButton(),
)
```

### Multiple Contexts

**React:**
```jsx
const App = () => {
  const theme = useContext(ThemeContext);
  const auth = useContext(AuthContext);
  const lang = useContext(LanguageContext);

  return <div>...</div>;
};
```

**Flutter:**
```dart
class AppWidget extends StatelessWidget {
  const AppWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final auth = context.watch<AuthProvider>();
    final lang = context.watch<LanguageProvider>();

    return Container(
      // Use providers
    );
  }
}

// Setup
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => ThemeProvider()),
    ChangeNotifierProvider(create: (_) => AuthProvider()),
    ChangeNotifierProvider(create: (_) => LanguageProvider()),
  ],
  child: AppWidget(),
)
```

---

## useReducer Conversion (to Cubit)

**React:**
```jsx
const counterReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;
  }
};

const Counter = () => {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
    </div>
  );
};
```

**Flutter (using Cubit):**
```dart
// State
class CounterState {
  final int count;
  CounterState(this.count);
}

// Cubit
class CounterCubit extends Cubit<CounterState> {
  CounterCubit() : super(CounterState(0));

  void increment() => emit(CounterState(state.count + 1));
  void decrement() => emit(CounterState(state.count - 1));
}

// Widget
class CounterWidget extends StatelessWidget {
  const CounterWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CounterCubit, CounterState>(
      builder: (context, state) {
        return Column(
          children: [
            Text('Count: ${state.count}'),
            ElevatedButton(
              onPressed: () => context.read<CounterCubit>().increment(),
              child: Text('+'),
            ),
            ElevatedButton(
              onPressed: () => context.read<CounterCubit>().decrement(),
              child: Text('-'),
            ),
          ],
        );
      },
    );
  }
}

// Usage
BlocProvider(
  create: (_) => CounterCubit(),
  child: CounterWidget(),
)
```

---

## useRef Conversion

### Input Focus

**React:**
```jsx
const FocusInput = () => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
};
```

**Flutter:**
```dart
class FocusInputWidget extends StatefulWidget {
  const FocusInputWidget({Key? key}) : super(key: key);

  @override
  State<FocusInputWidget> createState() => _FocusInputWidgetState();
}

class _FocusInputWidgetState extends State<FocusInputWidget> {
  late FocusNode inputRef;

  @override
  void initState() {
    super.initState();
    inputRef = FocusNode();
    // Request focus after build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      inputRef.requestFocus();
    });
  }

  @override
  void dispose() {
    inputRef.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      focusNode: inputRef,
    );
  }
}
```

### Scroll Controller

**React:**
```jsx
const ScrollableList = () => {
  const scrollRef = useRef(null);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <button onClick={scrollToTop}>Scroll to Top</button>
      <div ref={scrollRef} style={{ overflow: 'auto' }}>
        {/* content */}
      </div>
    </div>
  );
};
```

**Flutter:**
```dart
class ScrollableListWidget extends StatefulWidget {
  const ScrollableListWidget({Key? key}) : super(key: key);

  @override
  State<ScrollableListWidget> createState() => _ScrollableListWidgetState();
}

class _ScrollableListWidgetState extends State<ScrollableListWidget> {
  late ScrollController scrollRef;

  @override
  void initState() {
    super.initState();
    scrollRef = ScrollController();
  }

  @override
  void dispose() {
    scrollRef.dispose();
    super.dispose();
  }

  void _scrollToTop() {
    scrollRef.animateTo(
      0,
      duration: Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(
          onPressed: _scrollToTop,
          child: Text('Scroll to Top'),
        ),
        Expanded(
          child: ListView(
            controller: scrollRef,
            children: [
              // content
            ],
          ),
        ),
      ],
    );
  }
}
```

---

## useCallback & useMemo

### useCallback

**React:**
```jsx
const List = ({ items }) => {
  const [filter, setFilter] = useState('');

  const handleItemClick = useCallback((item) => {
    console.log('Clicked', item);
  }, []); // Memoized callback

  return (
    <div>
      {items.map(item => (
        <Item key={item.id} onClick={() => handleItemClick(item)} />
      ))}
    </div>
  );
};
```

**Flutter:**
```dart
// In Flutter, methods are already memoized by the class instance
class ListWidget extends StatefulWidget {
  final List items;

  const ListWidget({Key? key, required this.items}) : super(key: key);

  @override
  State<ListWidget> createState() => _ListWidgetState();
}

class _ListWidgetState extends State<ListWidget> {
  String filter = '';

  void _handleItemClick(dynamic item) {
    print('Clicked $item');
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.items.length,
      itemBuilder: (context, index) {
        final item = widget.items[index];
        return ItemWidget(
          item: item,
          onTap: () => _handleItemClick(item),
        );
      },
    );
  }
}
```

### useMemo

**React:**
```jsx
const ExpensiveComponent = ({ a, b }) => {
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(a, b);
  }, [a, b]); // Only recompute if a or b changes

  return <div>{expensiveValue}</div>;
};
```

**Flutter:**
```dart
class ExpensiveWidget extends StatefulWidget {
  final num a;
  final num b;

  const ExpensiveWidget({Key? key, required this.a, required this.b}) : super(key: key);

  @override
  State<ExpensiveWidget> createState() => _ExpensiveWidgetState();
}

class _ExpensiveWidgetState extends State<ExpensiveWidget> {
  late num _cachedValue;
  late num _lastA;
  late num _lastB;

  @override
  void initState() {
    super.initState();
    _lastA = widget.a;
    _lastB = widget.b;
    _cachedValue = _computeExpensiveValue();
  }

  @override
  void didUpdateWidget(covariant ExpensiveWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.a != widget.a || oldWidget.b != widget.b) {
      _lastA = widget.a;
      _lastB = widget.b;
      _cachedValue = _computeExpensiveValue();
    }
  }

  num _computeExpensiveValue() {
    return computeExpensiveValue(widget.a, widget.b);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('$_cachedValue'),
    );
  }
}
```

---

## Custom Hooks to Mixins

**React:**
```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Usage
const MyComponent = () => {
  const { data, loading, error } = useFetch('/api/data');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  return <div>{data}</div>;
};
```

**Flutter (using Mixin):**
```dart
mixin FetchMixin<T extends StatefulWidget> on State<T> {
  dynamic data;
  bool loading = false;
  dynamic error;

  Future<void> fetch(String url) async {
    setState(() {
      loading = true;
    });

    try {
      final response = await http.get(Uri.parse(url));
      setState(() {
        data = jsonDecode(response.body);
        loading = false;
      });
    } catch (e) {
      setState(() {
        error = e;
        loading = false;
      });
    }
  }
}

// Usage
class MyWidget extends StatefulWidget {
  const MyWidget({Key? key}) : super(key: key);

  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> with FetchMixin {
  @override
  void initState() {
    super.initState();
    fetch('/api/data');
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return CircularProgressIndicator();
    if (error != null) return Text('Error!');
    return Text('$data');
  }
}
```

---

## Testing

The hooks conversion system includes comprehensive tests covering:
- ✅ 38 test cases
- ✅ useState with all types (number, string, bool, array, object)
- ✅ useEffect with different dependency patterns
- ✅ useContext with Provider pattern
- ✅ useReducer to Cubit conversion
- ✅ useCallback and useMemo
- ✅ useRef to Flutter controllers
- ✅ Custom hooks to mixins
- ✅ Code generation for lifecycle methods
- ✅ Edge cases and error handling

Run tests:
```bash
npm test -- tests/refactoring/generators/hooks-conversion.test.js
```

---

## API Usage

```javascript
const hooksConverter = require('./lib/refactoring/generators/HooksConverter');

const hooks = [
  {
    name: 'useState',
    variables: ['count', 'setCount'],
    initialValue: 0,
    type: 'number',
  },
  {
    name: 'useEffect',
    callback: 'fetchData()',
    dependencies: [],
    hasCleanup: false,
  },
];

const result = hooksConverter.convertHooks(hooks);
const code = hooksConverter.generateFlutterCode(result);

console.log(code.stateClass);
// "  num count = 0;"

console.log(code.initState);
// "@override\n  void initState() {\n    super.initState();\n    fetchData()\n  }"
```

---

## Limitations & Future Work

### Current Limitations

1. **useLayoutEffect**: Not directly supported (use useEffect with immediate DOM access patterns)
2. **useImperativeHandle**: Requires manual conversion
3. **Complex custom hooks**: May need manual review
4. **Hooks rules**: Conditional hooks not automatically detected

### Future Enhancements

- [ ] Automatic hooks rules validation
- [ ] Advanced custom hooks patterns
- [ ] Performance optimization hints
- [ ] React 18 concurrent features

---

## See Also

- **HooksConverter.js** - Main hooks conversion engine
- **WidgetGenerator.js** - Widget generation with hooks support
- **ReactParser.js** - React code parsing with hook extraction
- **hooks-conversion.test.js** - Comprehensive test suite
