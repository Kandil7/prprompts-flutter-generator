# JSX Pattern Conversion Examples

Complete guide for converting complex React/JSX patterns to Flutter equivalents.

**Version:** 5.0.0
**Last Updated:** November 2, 2025
**Module:** JSXPatternConverter.js

---

## Table of Contents

1. [Higher-Order Components (HOCs)](#higher-order-components-hocs)
2. [React.memo](#reactmemo)
3. [React.forwardRef](#reactforwardref)
4. [Render Props](#render-props)
5. [React.Fragment](#reactfragment)
6. [Conditional Rendering](#conditional-rendering)
7. [List Rendering](#list-rendering)
8. [Complex Scenarios](#complex-scenarios)

---

## Higher-Order Components (HOCs)

HOCs are functions that take a component and return a new component with enhanced functionality.

### Pattern: withAuth HOC

**React (Before):**
```jsx
// HOC definition
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }

    return <Component {...props} />;
  };
}

// Usage
const ProtectedPage = withAuth(ProfilePage);
```

**Flutter (After):**
```dart
// Mixin converted from HOC: withAuth
mixin AuthMixin<T extends StatefulWidget> on State<T> {
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuthentication();
  }

  void _checkAuthentication() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    _isAuthenticated = auth.isAuthenticated;

    if (!_isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed('/login');
      });
    }
  }
}

// Usage
class ProfilePageState extends State<ProfilePage> with AuthMixin {
  @override
  Widget build(BuildContext context) {
    if (!_isAuthenticated) {
      return Container(); // Or loading indicator
    }

    return Scaffold(
      appBar: AppBar(title: Text('Profile')),
      body: ProfileContent(),
    );
  }
}
```

### Pattern: Multiple HOCs (Composition)

**React (Before):**
```jsx
const Enhanced = withAuth(withRouter(withTheme(MyComponent)));

// Or with compose
const Enhanced = compose(
  withAuth,
  withRouter,
  withTheme
)(MyComponent);
```

**Flutter (After):**
```dart
// Multiple mixins
class MyComponentState extends State<MyComponent>
    with AuthMixin, RouterMixin, ThemeMixin {

  @override
  Widget build(BuildContext context) {
    // All mixin functionality available
    final currentRoute = this.currentRoute; // From RouterMixin
    final theme = this.theme;                // From ThemeMixin

    if (!_isAuthenticated) {                 // From AuthMixin
      return Container();
    }

    return Container(
      color: theme.backgroundColor,
      child: Text('Current route: $currentRoute'),
    );
  }
}
```

---

## React.memo

React.memo prevents unnecessary re-renders by memoizing the component.

### Pattern: Basic Memoization

**React (Before):**
```jsx
const ExpensiveComponent = React.memo(({ data }) => {
  return (
    <div>
      <ComplexCalculation data={data} />
    </div>
  );
});
```

**Flutter (After):**
```dart
// Use const constructor for automatic optimization
class ExpensiveComponent extends StatelessWidget {
  // const constructor = automatic memoization
  const ExpensiveComponent({Key? key, required this.data}) : super(key: key);

  final Data data;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: ComplexCalculation(data: data),
    );
  }
}

// Usage with const constructor
const ExpensiveComponent(data: myData)
```

### Pattern: Memo with Custom Comparison

**React (Before):**
```jsx
const UserCard = React.memo(
  ({ user }) => {
    return (
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if user.id changes
    return prevProps.user.id === nextProps.user.id;
  }
);
```

**Flutter (After):**
```dart
class UserCard extends StatelessWidget {
  const UserCard({Key? key, required this.user}) : super(key: key);

  final User user;

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Text(user.name, style: Theme.of(context).textTheme.headline6),
          Text(user.email),
        ],
      ),
    );
  }

  // Flutter's build system automatically compares props
  // Only rebuilds if 'user' reference changes
}

// For custom equality, use Equatable package
class User extends Equatable {
  final int id;
  final String name;
  final String email;

  const User({required this.id, required this.name, required this.email});

  @override
  List<Object?> get props => [id]; // Only compare by id
}
```

### Pattern: Inline Memo

**React (Before):**
```jsx
const MemoizedComponent = React.memo(() => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
});
```

**Flutter (After):**
```dart
class MemoizedComponent extends StatefulWidget {
  const MemoizedComponent({Key? key}) : super(key: key);

  @override
  State<MemoizedComponent> createState() => _MemoizedComponentState();
}

class _MemoizedComponentState extends State<MemoizedComponent> {
  int count = 0;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        setState(() {
          count++;
        });
      },
      child: Text('Count: $count'),
    );
  }
}
```

---

## React.forwardRef

ForwardRef allows parent components to access child component refs.

### Pattern: Basic ForwardRef

**React (Before):**
```jsx
const FancyInput = React.forwardRef((props, ref) => {
  return <input ref={ref} className="fancy-input" {...props} />;
});

// Parent usage
function Parent() {
  const inputRef = useRef();

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}
```

**Flutter (After):**
```dart
// Child widget with GlobalKey support
class FancyInput extends StatefulWidget {
  const FancyInput({Key? key}) : super(key: key);

  @override
  State<FancyInput> createState() => FancyInputState();
}

class FancyInputState extends State<FancyInput> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  // Public method accessible from parent via GlobalKey
  void focusInput() {
    _focusNode.requestFocus();
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      focusNode: _focusNode,
      decoration: InputDecoration(
        border: OutlineInputBorder(),
      ),
    );
  }
}

// Parent widget
class Parent extends StatelessWidget {
  // GlobalKey to access child state
  final GlobalKey<FancyInputState> _inputKey = GlobalKey<FancyInputState>();

  Parent({Key? key}) : super(key: key);

  void _focusInput() {
    _inputKey.currentState?.focusInput();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        FancyInput(key: _inputKey),
        ElevatedButton(
          onPressed: _focusInput,
          child: Text('Focus Input'),
        ),
      ],
    );
  }
}
```

### Pattern: ForwardRef with Multiple Methods

**React (Before):**
```jsx
const VideoPlayer = React.forwardRef((props, ref) => {
  const videoRef = useRef();

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current.play(),
    pause: () => videoRef.current.pause(),
    seek: (time) => videoRef.current.currentTime = time,
  }));

  return <video ref={videoRef} {...props} />;
});
```

**Flutter (After):**
```dart
class VideoPlayer extends StatefulWidget {
  const VideoPlayer({Key? key}) : super(key: key);

  @override
  State<VideoPlayer> createState() => VideoPlayerState();
}

class VideoPlayerState extends State<VideoPlayer> {
  late VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.network('video_url');
  }

  // Public methods accessible via GlobalKey
  void play() {
    _controller.play();
  }

  void pause() {
    _controller.pause();
  }

  void seek(Duration position) {
    _controller.seekTo(position);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: _controller.value.aspectRatio,
      child: VideoPlayer(_controller),
    );
  }
}

// Parent usage
class Parent extends StatelessWidget {
  final GlobalKey<VideoPlayerState> _playerKey = GlobalKey<VideoPlayerState>();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        VideoPlayer(key: _playerKey),
        Row(
          children: [
            IconButton(
              icon: Icon(Icons.play_arrow),
              onPressed: () => _playerKey.currentState?.play(),
            ),
            IconButton(
              icon: Icon(Icons.pause),
              onPressed: () => _playerKey.currentState?.pause(),
            ),
          ],
        ),
      ],
    );
  }
}
```

---

## Render Props

Render props pattern passes a function as a prop to share code.

### Pattern: Basic Render Prop

**React (Before):**
```jsx
<DataProvider render={(data) => (
  <div>
    <h1>{data.title}</h1>
    <p>{data.description}</p>
  </div>
)} />
```

**Flutter (After):**
```dart
class DataProvider extends StatelessWidget {
  const DataProvider({
    Key? key,
    required this.builder,
  }) : super(key: key);

  final Widget Function(BuildContext, Data) builder;

  @override
  Widget build(BuildContext context) {
    final data = _fetchData(); // Get data somehow

    return Builder(
      builder: (context) {
        return builder(context, data);
      },
    );
  }

  Data _fetchData() {
    // Fetch data logic
    return Data(title: 'Title', description: 'Description');
  }
}

// Usage
DataProvider(
  builder: (context, data) {
    return Column(
      children: [
        Text(data.title, style: Theme.of(context).textTheme.headline5),
        Text(data.description),
      ],
    );
  },
)
```

### Pattern: Children as Function

**React (Before):**
```jsx
<MouseTracker>
  {(position) => (
    <div>
      Mouse position: x={position.x}, y={position.y}
    </div>
  )}
</MouseTracker>
```

**Flutter (After):**
```dart
class MouseTracker extends StatefulWidget {
  const MouseTracker({
    Key? key,
    required this.builder,
  }) : super(key: key);

  final Widget Function(BuildContext, Offset) builder;

  @override
  State<MouseTracker> createState() => _MouseTrackerState();
}

class _MouseTrackerState extends State<MouseTracker> {
  Offset _position = Offset.zero;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanUpdate: (details) {
        setState(() {
          _position = details.globalPosition;
        });
      },
      child: widget.builder(context, _position),
    );
  }
}

// Usage
MouseTracker(
  builder: (context, position) {
    return Text(
      'Mouse position: x=${position.dx.toStringAsFixed(0)}, '
      'y=${position.dy.toStringAsFixed(0)}',
    );
  },
)
```

### Pattern: Multiple Render Props

**React (Before):**
```jsx
<ListComponent
  renderHeader={() => <h1>My List</h1>}
  renderItem={(item) => <ListItem data={item} />}
  renderFooter={() => <p>End of list</p>}
/>
```

**Flutter (After):**
```dart
class ListComponent extends StatelessWidget {
  const ListComponent({
    Key? key,
    required this.items,
    this.headerBuilder,
    required this.itemBuilder,
    this.footerBuilder,
  }) : super(key: key);

  final List<Item> items;
  final Widget Function(BuildContext)? headerBuilder;
  final Widget Function(BuildContext, Item) itemBuilder;
  final Widget Function(BuildContext)? footerBuilder;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (headerBuilder != null) headerBuilder!(context),
        ...items.map((item) => itemBuilder(context, item)),
        if (footerBuilder != null) footerBuilder!(context),
      ],
    );
  }
}

// Usage
ListComponent(
  items: myItems,
  headerBuilder: (context) {
    return Text('My List', style: Theme.of(context).textTheme.headline5);
  },
  itemBuilder: (context, item) {
    return ListTile(title: Text(item.name));
  },
  footerBuilder: (context) {
    return Padding(
      padding: EdgeInsets.all(8.0),
      child: Text('End of list'),
    );
  },
)
```

---

## React.Fragment

Fragments let you group children without adding extra DOM nodes.

### Pattern: Basic Fragment

**React (Before):**
```jsx
<>
  <div>First</div>
  <div>Second</div>
  <div>Third</div>
</>
```

**Flutter (After):**
```dart
// Option 1: Return multiple widgets directly (in Column, Row, etc.)
Column(
  children: [
    Container(child: Text('First')),
    Container(child: Text('Second')),
    Container(child: Text('Third')),
  ],
)

// Option 2: Return list of widgets
Widget buildContent() {
  return Column(
    children: _buildChildren(),
  );
}

List<Widget> _buildChildren() {
  return [
    Container(child: Text('First')),
    Container(child: Text('Second')),
    Container(child: Text('Third')),
  ];
}
```

### Pattern: Conditional Fragment

**React (Before):**
```jsx
{showContent && (
  <>
    <Header />
    <Content />
    <Footer />
  </>
)}
```

**Flutter (After):**
```dart
// Option 1: Using spread operator
Column(
  children: [
    ...showContent ? [
      Header(),
      Content(),
      Footer(),
    ] : [],
  ],
)

// Option 2: Using conditional expression
Column(
  children: [
    if (showContent) ...[
      Header(),
      Content(),
      Footer(),
    ],
  ],
)
```

---

## Conditional Rendering

### Pattern: Ternary Operator

**React (Before):**
```jsx
<div>
  {isLoggedIn ? <Dashboard /> : <Login />}
</div>
```

**Flutter (After):**
```dart
Container(
  child: isLoggedIn ? Dashboard() : Login(),
)
```

### Pattern: Logical AND

**React (Before):**
```jsx
<div>
  {showMessage && <Alert message="Important!" />}
</div>
```

**Flutter (After):**
```dart
Column(
  children: [
    if (showMessage) Alert(message: 'Important!'),
  ],
)

// Or for single child:
Container(
  child: showMessage ? Alert(message: 'Important!') : null,
)
```

### Pattern: Complex Conditionals

**React (Before):**
```jsx
<div>
  {loading ? (
    <Spinner />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <DataDisplay data={data} />
  )}
</div>
```

**Flutter (After):**
```dart
Container(
  child: loading
    ? Spinner()
    : error != null
      ? ErrorMessage(error: error)
      : DataDisplay(data: data),
)

// Or using helper method for readability
Widget _buildContent() {
  if (loading) {
    return Spinner();
  } else if (error != null) {
    return ErrorMessage(error: error);
  } else {
    return DataDisplay(data: data);
  }
}
```

---

## List Rendering

### Pattern: Basic List with map()

**React (Before):**
```jsx
<ul>
  {items.map(item => (
    <li key={item.id}>
      {item.name}
    </li>
  ))}
</ul>
```

**Flutter (After):**
```dart
// For small lists
ListView(
  children: items.map((item) {
    return ListTile(
      key: ValueKey(item.id),
      title: Text(item.name),
    );
  }).toList(),
)

// For large/dynamic lists (more efficient)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return ListTile(
      key: ValueKey(item.id),
      title: Text(item.name),
    );
  },
)
```

### Pattern: List with Index

**React (Before):**
```jsx
<ul>
  {users.map((user, index) => (
    <li key={user.id}>
      #{index + 1}: {user.name}
    </li>
  ))}
</ul>
```

**Flutter (After):**
```dart
ListView.builder(
  itemCount: users.length,
  itemBuilder: (context, index) {
    final user = users[index];
    return ListTile(
      key: ValueKey(user.id),
      title: Text('#${index + 1}: ${user.name}'),
    );
  },
)
```

### Pattern: Filtered List

**React (Before):**
```jsx
<ul>
  {items
    .filter(item => item.active)
    .map(item => (
      <li key={item.id}>{item.name}</li>
    ))
  }
</ul>
```

**Flutter (After):**
```dart
// Option 1: Filter first
final activeItems = items.where((item) => item.active).toList();

ListView.builder(
  itemCount: activeItems.length,
  itemBuilder: (context, index) {
    final item = activeItems[index];
    return ListTile(
      key: ValueKey(item.id),
      title: Text(item.name),
    );
  },
)

// Option 2: Filter in builder (less efficient)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    if (!item.active) {
      return SizedBox.shrink(); // Return empty widget
    }
    return ListTile(
      key: ValueKey(item.id),
      title: Text(item.name),
    );
  },
)
```

### Pattern: Nested Lists

**React (Before):**
```jsx
<div>
  {categories.map(category => (
    <div key={category.id}>
      <h2>{category.name}</h2>
      <ul>
        {category.items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  ))}
</div>
```

**Flutter (After):**
```dart
ListView.builder(
  itemCount: categories.length,
  itemBuilder: (context, categoryIndex) {
    final category = categories[categoryIndex];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.all(16.0),
          child: Text(
            category.name,
            style: Theme.of(context).textTheme.headline6,
          ),
        ),
        ...category.items.map((item) {
          return ListTile(
            key: ValueKey(item.id),
            title: Text(item.name),
          );
        }),
      ],
    );
  },
)
```

---

## Complex Scenarios

### Pattern: Multiple Patterns Combined

**React (Before):**
```jsx
const EnhancedComponent = withAuth(React.memo((props) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div>
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}));
```

**Flutter (After):**
```dart
class EnhancedComponent extends StatefulWidget {
  const EnhancedComponent({Key? key, required this.items}) : super(key: key);

  final List<Item> items;

  @override
  State<EnhancedComponent> createState() => _EnhancedComponentState();
}

class _EnhancedComponentState extends State<EnhancedComponent>
    with AuthMixin { // HOC → Mixin

  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    await Future.delayed(Duration(seconds: 2));
    setState(() {
      loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    // React.memo → const constructor when possible
    // Fragment → Column/ListView
    // Conditional → ternary
    // List → ListView.builder

    return loading
      ? Spinner()
      : ListView.builder(
          itemCount: widget.items.length,
          itemBuilder: (context, index) {
            final item = widget.items[index];
            return ItemCard(
              key: ValueKey(item.id),
              item: item,
            );
          },
        );
  }
}
```

---

## Best Practices

### 1. Higher-Order Components → Mixins

**✅ DO:**
- Use mixins for reusable stateful logic
- Keep mixin responsibilities focused
- Document mixin dependencies clearly

**❌ DON'T:**
- Create deep mixin hierarchies
- Mix concerns in a single mixin
- Use mixins for simple prop passing (use composition instead)

### 2. React.memo → const Constructors

**✅ DO:**
- Use `const` constructors for immutable widgets
- Make all fields `final` in StatelessWidget
- Use `Equatable` for custom equality checks

**❌ DON'T:**
- Over-optimize with const everywhere
- Use const with mutable state
- Forget to propagate const through the tree

### 3. forwardRef → GlobalKey

**✅ DO:**
- Use GlobalKey sparingly (performance cost)
- Provide clear public API methods
- Document which methods are accessible from parent

**❌ DON'T:**
- Use GlobalKey for simple prop passing
- Expose internal state directly
- Create circular dependencies with keys

### 4. Render Props → Builder Pattern

**✅ DO:**
- Use builder callbacks for flexible UI
- Name builders clearly (headerBuilder, itemBuilder)
- Make optional builders nullable

**❌ DON'T:**
- Overuse builders (prefer composition)
- Create deeply nested builder callbacks
- Forget to handle null builders

### 5. Lists → ListView.builder

**✅ DO:**
- Use ListView.builder for long lists
- Provide unique keys for list items
- Filter data before building list

**❌ DON'T:**
- Use map().toList() for large lists
- Perform expensive operations in itemBuilder
- Forget to handle empty lists

---

## Summary

| React Pattern | Flutter Equivalent | When to Use |
|--------------|-------------------|-------------|
| Higher-Order Component | Mixin | Reusable stateful behavior |
| React.memo | const constructor | Immutable widgets |
| React.forwardRef | GlobalKey | Parent needs child methods |
| Render Props | Builder callback | Flexible UI composition |
| Fragment | Column/Row children | Multiple children |
| Ternary conditional | condition ? A : B | Simple conditionals |
| List.map() | ListView.builder | Dynamic lists |

---

## Testing Patterns

```dart
// Test HOC → Mixin conversion
testWidgets('AuthMixin redirects when not authenticated', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: TestWidget(),
    ),
  );

  expect(find.text('Login'), findsOneWidget);
});

// Test memoization
testWidgets('const widget rebuilds only when props change', (tester) async {
  var buildCount = 0;

  await tester.pumpWidget(
    StatefulBuilder(
      builder: (context, setState) {
        buildCount++;
        return const MyWidget(data: 'test');
      },
    ),
  );

  expect(buildCount, equals(1));
});
```

---

## Related Documentation

- **HooksConverter.js** - React Hooks conversion
- **StyleConverter.js** - CSS to Flutter styles
- **WidgetGenerator.js** - Component generation
- **ReactParser.js** - JSX parsing

---

**Last Updated:** November 2, 2025
**Next Phase:** Redux → BLoC conversion
