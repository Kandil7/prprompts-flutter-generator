# JSX to Flutter Widget Tree Conversion Examples

This document demonstrates the complete JSX to Flutter widget tree conversion implementation in `WidgetGenerator.js`.

## Basic Element Conversion

### View → Container
```jsx
// React Native
<View>
  <Text>Hello</Text>
</View>

// Flutter
Container(
  child: Text('Hello')
)
```

### Text with Content
```jsx
// React
<Text>Hello World</Text>

// Flutter
Text('Hello World')
```

## Interactive Elements

### TouchableOpacity → InkWell
```jsx
// React Native
<TouchableOpacity onPress={handlePress}>
  <Text>Click Me</Text>
</TouchableOpacity>

// Flutter
InkWell(
  onTap: handlePress,
  child: Text('Click Me')
)
```

### Button → ElevatedButton
```jsx
// React Native
<Button title="Submit" onPress={handleSubmit} />

// Flutter
ElevatedButton(
  onTap: handleSubmit,
  child: Text('Submit')
)
```

### TextInput → TextField
```jsx
// React Native
<TextInput
  placeholder="Enter text"
  onChangeText={handleChange}
  secureTextEntry={true}
/>

// Flutter
TextField(
  hintText: 'Enter text',
  onChanged: handleChange,
  obscureText: true
)
```

## List Rendering

### Array.map() → ListView.builder
```jsx
// React
{items.map(item => (
  <View key={item.id}>
    <Text>{item.name}</Text>
  </View>
))}

// Flutter
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return Container(
      child: Text(item.name)
    );
  }
)
```

### FlatList → ListView.builder
```jsx
// React Native
<FlatList
  data={users}
  renderItem={renderUser}
/>

// Flutter
ListView.builder(
  itemCount: users.length,
  itemBuilder: (context, index) {
    final item = users[index];
    return renderUser;
  }
)
```

## Conditional Rendering

### Ternary Operator
```jsx
// React
{isVisible ? <Text>Visible</Text> : <Text>Hidden</Text>}

// Flutter
Builder(
  builder: (context) => isVisible
    ? Text('Visible')
    : Text('Hidden')
)
```

### Logical AND
```jsx
// React
{showMessage && <Text>Message</Text>}

// Flutter
Builder(
  builder: (context) => showMessage
    ? Text('Message')
    : const SizedBox.shrink()
)
```

## Layout Components

### ScrollView → SingleChildScrollView
```jsx
// React Native
<ScrollView>
  <View>
    <Text>Content</Text>
  </View>
</ScrollView>

// Flutter
SingleChildScrollView(
  child: Container(
    child: Text('Content')
  )
)
```

### SafeAreaView → SafeArea
```jsx
// React Native
<SafeAreaView>
  <View>
    <Text>Content</Text>
  </View>
</SafeAreaView>

// Flutter
SafeArea(
  child: Container(
    child: Text('Content')
  )
)
```

## Fragments

```jsx
// React
<>
  <Text>First</Text>
  <Text>Second</Text>
</>

// Flutter (no wrapper, children used directly)
[
  Text('First'),
  Text('Second')
]
```

## Image Handling

### Network Image
```jsx
// React
<Image source={{uri: 'https://example.com/image.png'}} />

// Flutter
Image(
  image: NetworkImage('https://example.com/image.png')
)
```

### Asset Image
```jsx
// React
<Image source={require('./assets/logo.png')} />

// Flutter
Image(
  image: AssetImage('./assets/logo.png')
)
```

## Event Handler Mapping

| React Event | Flutter Event |
|-------------|---------------|
| `onClick` | `onTap` |
| `onPress` | `onTap` |
| `onPressIn` | `onTapDown` |
| `onPressOut` | `onTapUp` |
| `onLongPress` | `onLongPress` |
| `onChange` | `onChanged` |
| `onChangeText` | `onChanged` |
| `onSubmit` | `onSubmitted` |
| `onSubmitEditing` | `onSubmitted` |
| `onFocus` | `onFocusChange` |
| `onBlur` | `onFocusChange` |

## Property Mapping

| React Prop | Flutter Prop |
|------------|--------------|
| `placeholder` | `hintText` |
| `numberOfLines` | `maxLines` |
| `editable` | `enabled` |
| `secureTextEntry` | `obscureText` |
| `src` / `source` | `image` |
| `testID` | `key` |
| `accessibilityLabel` | `semanticLabel` |
| `autoFocus` | `autofocus` |

## Complex Example

### Complete Component Conversion

```jsx
// React Native
function UserList({ users, onUserSelect }) {
  return (
    <SafeAreaView>
      <View>
        <Text>Users</Text>
        {users.length > 0 ? (
          users.map(user => (
            <TouchableOpacity
              key={user.id}
              onPress={() => onUserSelect(user)}
            >
              <View>
                <Text>{user.name}</Text>
                <Text>{user.email}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text>No users found</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// Flutter
SafeArea(
  child: Container(
    children: [
      Text('Users'),
      Builder(
        builder: (context) => users.length > 0
          ? ListView.builder(
              itemCount: users.length,
              itemBuilder: (context, index) {
                final user = users[index];
                return InkWell(
                  onTap: () => onUserSelect(user),
                  child: Container(
                    children: [
                      Text(user.name),
                      Text(user.email)
                    ]
                  )
                );
              }
            )
          : Text('No users found')
      )
    ]
  )
)
```

## Supported JSX Node Types

1. **JSXElement** - Standard JSX elements (`<View>`, `<Text>`, etc.)
2. **JSXFragment** - Fragments (`<>...</>`)
3. **JSXText** - Text nodes (string content)
4. **JSXExpressionContainer** - Expressions in JSX (`{variable}`, `{condition && <Widget>}`)
5. **ConditionalExpression** - Ternary operators (`condition ? A : B`)
6. **LogicalExpression** - Logical AND (`condition && Widget`)
7. **CallExpression** - Function calls (`.map()` for lists)

## Widget Mappings (60+ Components)

### React Native
- View, ScrollView, FlatList, SectionList, SafeAreaView
- Text, TextInput
- TouchableOpacity, TouchableHighlight, Pressable, Button
- Image, ImageBackground
- Modal, ActivityIndicator, Switch, Slider, Picker

### HTML Elements (React Web)
- div, span, p, h1-h6
- input, button, textarea, select
- ul, ol, li
- img, a
- nav, header, footer, section, article

### Flutter Widgets
- Container, SingleChildScrollView, ListView.builder, SafeArea
- Text, TextField
- InkWell, GestureDetector, ElevatedButton
- Image, Icon
- Dialog, CircularProgressIndicator, Switch, Slider, DropdownButton

## Limitations & Future Enhancements

### Current Limitations
1. **Style conversion** - Basic style prop handling (placeholder for StyleExtractor integration)
2. **Spread attributes** - Limited support for `{...props}` syntax
3. **Custom components** - Passed through without conversion
4. **Complex expressions** - Some advanced JavaScript expressions may need manual adjustment

### Future Enhancements
1. **Full style integration** - Complete StyleExtractor integration for CSS/inline styles
2. **Animation conversion** - React animations to Flutter animations
3. **Navigation conversion** - React Router to Flutter Navigator
4. **State management** - Redux/MobX to BLoC/Provider
5. **Custom component mapping** - User-defined component mappings

## Testing

All conversion features are covered by 43+ unit tests in:
- `tests/refactoring/generators/WidgetGenerator.test.js`

Run tests:
```bash
npm test -- tests/refactoring/generators/WidgetGenerator.test.js
```

## Implementation Details

### Key Methods

1. **`generateWidgetTree(jsxElement, context)`** - Main entry point for conversion
2. **`_handleJSXElement(jsxElement, context)`** - Convert JSX element to WidgetChild
3. **`_handleJSXExpression(expression, context)`** - Handle conditionals, lists, variables
4. **`_extractJSXProps(attributes, context)`** - Extract and convert props
5. **`_convertPropsToFlutter(props, widget, hasChildren)`** - Map React props to Flutter
6. **`_handleCallExpression(expression, context)`** - Convert `.map()` to ListView.builder
7. **`_handleConditionalExpression(expression, context)`** - Convert ternary operators
8. **`_handleLogicalExpression(expression, context)`** - Convert logical AND

### Data Structures

- **WidgetChild** - Represents a Flutter widget node
- **Properties** - Key-value pairs of widget properties
- **Children** - Array of nested WidgetChild nodes

### AST Traversal

Uses Babel's AST parser and types:
- `@babel/parser` - Parse JSX to AST
- `@babel/types` - AST node type checking
- `@babel/generator` - Convert AST back to code
- `@babel/traverse` - AST traversal utilities

## Example Usage in Code

```javascript
const { WidgetGenerator } = require('./WidgetGenerator');
const parser = require('@babel/parser');

// Parse JSX
const jsxCode = '<View><Text>Hello</Text></View>';
const ast = parser.parse(jsxCode, {
  sourceType: 'module',
  plugins: ['jsx'],
});

// Generate widget tree
const generator = new WidgetGenerator();
const widget = generator.generateWidgetTree(ast.program.body[0].expression);

console.log(widget);
// WidgetChild {
//   name: 'Container',
//   type: 'Container',
//   properties: {},
//   children: [
//     WidgetChild {
//       name: 'Text',
//       type: 'Text',
//       properties: { data: "'Hello'" },
//       children: []
//     }
//   ]
// }
```

## Integration with Refactoring Pipeline

The `generateWidgetTree()` method integrates with the complete refactoring pipeline:

1. **ReactParser** → Parses React component to ComponentModel
2. **WidgetGenerator** → Converts ComponentModel to WidgetModel
   - Uses `generateWidgetTree()` to convert JSX to widget tree
3. **CodeGenerator** → Generates Flutter Dart code from WidgetModel
4. **Validation** → Validates generated code

This creates a seamless React → Flutter conversion workflow.
