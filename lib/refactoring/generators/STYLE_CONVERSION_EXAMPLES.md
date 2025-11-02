# Style Conversion Examples

This document demonstrates the React/React Native style to Flutter style conversion capabilities.

## Overview

The style conversion system automatically converts:
- ✅ **Inline style objects** - `style={{backgroundColor: 'red', padding: 10}}`
- ✅ **Color formats** - Named, hex, RGB, RGBA
- ✅ **Dimensions** - px, rem, em, %
- ✅ **BoxDecoration** - background, border, shadow, radius
- ✅ **EdgeInsets** - padding, margin (all variations)
- ✅ **TextStyle** - font properties, colors, decoration
- ✅ **Flexbox** - alignment, direction, spacing
- ⚠️ **Style references** - `styles.container` (requires manual review)
- ⚠️ **Style arrays** - `[styles.base, styles.active]` (requires manual review)

---

## Basic Styling Examples

### Background Color

**React:**
```jsx
<View style={{backgroundColor: 'blue'}}>
  <Text>Hello</Text>
</View>
```

**Flutter:**
```dart
Container(
  decoration: BoxDecoration(color: Colors.blue),
  child: Text('Hello'),
)
```

### Hex Colors

**React:**
```jsx
<View style={{backgroundColor: '#FF5733'}}>
  <Text>Hex Color</Text>
</View>
```

**Flutter:**
```dart
Container(
  decoration: BoxDecoration(color: Color(0xFFFF5733)),
  child: Text('Hex Color'),
)
```

### RGBA Colors

**React:**
```jsx
<View style={{backgroundColor: 'rgba(255, 0, 0, 0.5)'}}>
  <Text>Transparent</Text>
</View>
```

**Flutter:**
```dart
Container(
  decoration: BoxDecoration(color: Color.fromRGBO(255, 0, 0, 0.5)),
  child: Text('Transparent'),
)
```

---

## Padding & Margin

### All Sides Equal

**React:**
```jsx
<View style={{padding: 16, margin: 8}}>
  <Text>Content</Text>
</View>
```

**Flutter:**
```dart
Container(
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.all(8),
  child: Text('Content'),
)
```

### Individual Sides

**React:**
```jsx
<View style={{
  paddingTop: 10,
  paddingLeft: 20,
  paddingRight: 20,
  paddingBottom: 10
}}>
  <Text>Content</Text>
</View>
```

**Flutter:**
```dart
Container(
  padding: EdgeInsets.fromLTRB(20, 10, 20, 10),
  child: Text('Content'),
)
```

### Symmetric Padding

**React:**
```jsx
<View style={{padding: '10 20'}}>
  <Text>Content</Text>
</View>
```

**Flutter:**
```dart
Container(
  padding: EdgeInsets.symmetric(vertical: 10, horizontal: 20),
  child: Text('Content'),
)
```

---

## Dimensions

### Width & Height

**React:**
```jsx
<View style={{width: 300, height: 200}}>
  <Text>Fixed Size</Text>
</View>
```

**Flutter:**
```dart
Container(
  width: 300,
  height: 200,
  child: Text('Fixed Size'),
)
```

### Pixel Units

**React:**
```jsx
<View style={{width: '100px', height: '50px'}}>
  <Text>Pixels</Text>
</View>
```

**Flutter:**
```dart
Container(
  width: 100,
  height: 50,
  child: Text('Pixels'),
)
```

### Rem Units

**React:**
```jsx
<Text style={{fontSize: '2rem'}}>
  Large Text
</Text>
```

**Flutter:**
```dart
Text(
  'Large Text',
  style: TextStyle(fontSize: 32), // 2 * 16
)
```

### Constraints

**React:**
```jsx
<View style={{
  minWidth: 100,
  maxWidth: 300,
  minHeight: 50,
  maxHeight: 200
}}>
  <Text>Constrained</Text>
</View>
```

**Flutter:**
```dart
Container(
  constraints: BoxConstraints(
    minWidth: 100,
    maxWidth: 300,
    minHeight: 50,
    maxHeight: 200
  ),
  child: Text('Constrained'),
)
```

---

## Borders & Shadows

### Border Radius

**React:**
```jsx
<View style={{
  backgroundColor: 'white',
  borderRadius: 12
}}>
  <Text>Rounded</Text>
</View>
```

**Flutter:**
```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12)
  ),
  child: Text('Rounded'),
)
```

### Border with Color

**React:**
```jsx
<View style={{
  borderWidth: 2,
  borderColor: 'black',
  borderRadius: 8
}}>
  <Text>Bordered</Text>
</View>
```

**Flutter:**
```dart
Container(
  decoration: BoxDecoration(
    border: Border.all(width: 2, color: Colors.black),
    borderRadius: BorderRadius.circular(8)
  ),
  child: Text('Bordered'),
)
```

### Box Shadow

**React:**
```jsx
<View style={{
  backgroundColor: 'white',
  boxShadow: '0 2px 4px 0 rgba(0,0,0,0.1)'
}}>
  <Text>Shadow</Text>
</View>
```

**Flutter:**
```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    boxShadow: [
      BoxShadow(
        offset: Offset(0, 2),
        blurRadius: 4,
        color: Color.fromRGBO(0, 0, 0, 0.1)
      )
    ]
  ),
  child: Text('Shadow'),
)
```

---

## Text Styling

### Font Properties

**React:**
```jsx
<Text style={{
  fontSize: 18,
  fontWeight: 'bold',
  color: 'blue',
  fontFamily: 'Roboto'
}}>
  Styled Text
</Text>
```

**Flutter:**
```dart
Text(
  'Styled Text',
  style: TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
    fontFamily: 'Roboto'
  ),
)
```

### Text Alignment

**React:**
```jsx
<Text style={{textAlign: 'center'}}>
  Centered Text
</Text>
```

**Flutter:**
```dart
Text(
  'Centered Text',
  textAlign: TextAlign.center,
)
```

### Line Height & Letter Spacing

**React:**
```jsx
<Text style={{
  lineHeight: 1.5,
  letterSpacing: 2
}}>
  Spaced Text
</Text>
```

**Flutter:**
```dart
Text(
  'Spaced Text',
  style: TextStyle(
    height: 1.5,
    letterSpacing: 2
  ),
)
```

### Text Decoration

**React:**
```jsx
<Text style={{textDecoration: 'underline'}}>
  Underlined
</Text>
```

**Flutter:**
```dart
Text(
  'Underlined',
  style: TextStyle(decoration: TextDecoration.underline),
)
```

---

## Flexbox Layout

### Flex Container

**React:**
```jsx
<View style={{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center'
}}>
  <Text>Centered</Text>
</View>
```

**Flutter:**
```dart
Expanded(
  flex: 1,
  child: Column(
    mainAxisAlignment: MainAxisAlignment.center,
    crossAxisAlignment: CrossAxisAlignment.center,
    children: [
      Text('Centered')
    ],
  ),
)
```

### Space Between

**React:**
```jsx
<View style={{
  flexDirection: 'row',
  justifyContent: 'space-between'
}}>
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

**Flutter:**
```dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  children: [
    Text('Left'),
    Text('Right'),
  ],
)
```

### Align Items

**React:**
```jsx
<View style={{
  flexDirection: 'column',
  alignItems: 'flex-start'
}}>
  <Text>Top Left</Text>
</View>
```

**Flutter:**
```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Top Left')
  ],
)
```

---

## Complex Styling

### Card Component

**React:**
```jsx
<View style={{
  backgroundColor: '#ffffff',
  padding: 16,
  margin: 8,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
  width: 300,
  height: 200
}}>
  <Text style={{
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333'
  }}>
    Card Title
  </Text>
  <Text style={{
    fontSize: 14,
    color: '#666666',
    marginTop: 8
  }}>
    Card content goes here
  </Text>
</View>
```

**Flutter:**
```dart
Container(
  width: 300,
  height: 200,
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.all(8),
  decoration: BoxDecoration(
    color: Color(0xFFFFFFFF),
    border: Border.all(width: 1, color: Color(0xFFE0E0E0)),
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(
        offset: Offset(0, 2),
        blurRadius: 8,
        color: Color.fromRGBO(0, 0, 0, 0.1)
      )
    ]
  ),
  child: Column(
    children: [
      Text(
        'Card Title',
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF333333)
        ),
      ),
      Container(
        margin: EdgeInsets.only(top: 8),
        child: Text(
          'Card content goes here',
          style: TextStyle(
            fontSize: 14,
            color: Color(0xFF666666)
          ),
        ),
      ),
    ],
  ),
)
```

---

## Advanced Features

### Transform (Scale)

**React:**
```jsx
<View style={{transform: 'scale(1.2)'}}>
  <Text>Scaled</Text>
</View>
```

**Flutter:**
```dart
Container(
  transform: Matrix4.diagonal3Values(1.2, 1.2, 1),
  child: Text('Scaled'),
)
```

### Opacity

**React:**
```jsx
<View style={{opacity: 0.5}}>
  <Text>Semi-transparent</Text>
</View>
```

**Flutter:**
```dart
Opacity(
  opacity: 0.5,
  child: Container(
    child: Text('Semi-transparent'),
  ),
)
```

### Position Absolute

**React:**
```jsx
<View style={{
  position: 'absolute',
  top: 10,
  left: 20
}}>
  <Text>Positioned</Text>
</View>
```

**Flutter:**
```dart
Positioned(
  top: 10,
  left: 20,
  child: Container(
    child: Text('Positioned'),
  ),
)
```

---

## Style References (Requires Manual Review)

### StyleSheet Reference

**React:**
```jsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16
  }
});

<View style={styles.container}>
  <Text>Hello</Text>
</View>
```

**Generated Code (with TODO):**
```dart
// TODO: Convert style reference: styles.container
Container(
  child: Text('Hello'),
)
```

**Manual Conversion Needed:**
```dart
// Define styles as constants or theme
class AppStyles {
  static const containerDecoration = BoxDecoration(
    color: Colors.white,
  );
  static const containerPadding = EdgeInsets.all(16);
}

// Use in widget
Container(
  decoration: AppStyles.containerDecoration,
  padding: AppStyles.containerPadding,
  child: Text('Hello'),
)
```

### Style Arrays

**React:**
```jsx
<View style={[styles.base, styles.highlighted]}>
  <Text>Merged Styles</Text>
</View>
```

**Generated Code (with TODO):**
```dart
// TODO: Convert style array: [styles.base, styles.highlighted]
Container(
  child: Text('Merged Styles'),
)
```

**Manual Conversion Needed:**
```dart
// Merge styles manually in Flutter
Container(
  decoration: BoxDecoration(
    color: Colors.white,      // from base
    border: Border.all(       // from highlighted
      color: Colors.blue,
      width: 2
    ),
  ),
  child: Text('Merged Styles'),
)
```

---

## Responsive Styles

### Media Queries

**React:**
```jsx
<View style={{
  width: windowWidth > 600 ? '50%' : '100%'
}}>
  <Text>Responsive</Text>
</View>
```

**Manual Conversion:**
```dart
Container(
  width: MediaQuery.of(context).size.width > 600
    ? MediaQuery.of(context).size.width * 0.5
    : MediaQuery.of(context).size.width,
  child: Text('Responsive'),
)
```

---

## Testing

The style conversion system includes comprehensive tests covering:
- ✅ 50 test cases
- ✅ Color conversions (named, hex, RGB, RGBA)
- ✅ Dimension conversions (px, rem, em, %)
- ✅ Padding/margin variations (all, symmetric, LTRB)
- ✅ Border and shadow effects
- ✅ Text styling
- ✅ Flexbox properties
- ✅ Complex nested styles
- ✅ Edge cases and error handling

Run tests:
```bash
npm test -- tests/refactoring/generators/style-integration.test.js
```

---

## API Usage

```javascript
const { WidgetGenerator } = require('./lib/refactoring/generators/WidgetGenerator');

const generator = new WidgetGenerator();

// Convert inline style
const styleValue = "{backgroundColor: 'red', padding: 10}";
const flutterProps = generator._convertStyleProp(styleValue, 'Container');

console.log(flutterProps);
// {
//   decoration: "BoxDecoration(color: Colors.red)",
//   padding: "EdgeInsets.all(10)"
// }
```

---

## Limitations & Future Work

### Current Limitations

1. **Style References**: Variable references like `styles.container` cannot be statically converted
2. **Style Arrays**: Array merging like `[styles.base, styles.active]` requires manual review
3. **Dynamic Styles**: Computed styles with expressions need manual conversion
4. **Platform-Specific**: Platform.select() styles are not automatically converted
5. **HSL Colors**: Limited support for HSL/HSLA color format

### Future Enhancements

- [ ] StyleSheet extraction and conversion
- [ ] CSS class name to Flutter theme mapping
- [ ] Responsive breakpoint conversion
- [ ] Animation style conversion
- [ ] Advanced shadow effects (multiple shadows)
- [ ] Gradient support
- [ ] CSS Grid to Flutter layout conversion

---

## Contributing

To add new style conversions:

1. Add property handler in `styleConverter.js` → `_applyStyleProperty()`
2. Add conversion method (e.g., `_convertNewProperty()`)
3. Add to `_buildFlutterProperties()` output
4. Add test cases in `style-integration.test.js`
5. Document in this file with before/after examples

---

## See Also

- **WidgetGenerator.js** - Main widget conversion logic
- **styleConverter.js** - Style conversion engine
- **widgetMapper.js** - Widget and prop mapping rules
- **style-integration.test.js** - Comprehensive test suite
