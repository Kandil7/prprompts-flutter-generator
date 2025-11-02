/**
 * widgetMapper.js
 * React to Flutter widget mappings
 *
 * Maps React/React Native components to their Flutter equivalents
 */

/**
 * React to Flutter widget mappings
 */
const WIDGET_MAPPINGS = {
  // Layout components
  View: 'Container',
  ScrollView: 'SingleChildScrollView',
  FlatList: 'ListView.builder',
  SectionList: 'ListView.builder',
  SafeAreaView: 'SafeArea',
  KeyboardAvoidingView: 'Scaffold',
  Fragment: null, // Fragments don't render, children are used directly

  // Flex layout
  Row: 'Row',
  Column: 'Column',
  Stack: 'Stack',
  Center: 'Center',
  Padding: 'Padding',

  // Text components
  Text: 'Text',
  TextInput: 'TextField',

  // Buttons
  TouchableOpacity: 'InkWell',
  TouchableHighlight: 'InkWell',
  TouchableWithoutFeedback: 'GestureDetector',
  Pressable: 'InkWell',
  Button: 'ElevatedButton',
  IconButton: 'IconButton',

  // Images
  Image: 'Image',
  ImageBackground: 'Container', // with DecorationImage
  Icon: 'Icon',

  // Other React Native components
  Modal: 'Dialog',
  ActivityIndicator: 'CircularProgressIndicator',
  Switch: 'Switch',
  Slider: 'Slider',
  Picker: 'DropdownButton',
  StatusBar: 'SystemChrome',
  RefreshControl: 'RefreshIndicator',
  VirtualizedList: 'ListView.builder',

  // HTML elements (for React web)
  div: 'Container',
  span: 'Text',
  p: 'Text',
  h1: 'Text',
  h2: 'Text',
  h3: 'Text',
  h4: 'Text',
  h5: 'Text',
  h6: 'Text',
  input: 'TextField',
  button: 'ElevatedButton',
  a: 'InkWell',
  img: 'Image',
  ul: 'Column',
  ol: 'Column',
  li: 'ListTile',
  form: 'Form',
  label: 'Text',
  select: 'DropdownButton',
  textarea: 'TextField',
  nav: 'Container',
  header: 'Container',
  footer: 'Container',
  section: 'Container',
  article: 'Container',
  aside: 'Container',
  main: 'Container',
};

/**
 * Special handling for widgets that need complex conversion
 */
const SPECIAL_WIDGETS = {
  FlatList: {
    targetWidget: 'ListView.builder',
    requiresBuilder: true,
    builderParam: 'itemBuilder',
    itemCountProp: 'itemCount',
  },
  SectionList: {
    targetWidget: 'ListView.builder',
    requiresBuilder: true,
    builderParam: 'itemBuilder',
    itemCountProp: 'itemCount',
  },
  map: {
    targetWidget: 'ListView.builder',
    requiresBuilder: true,
    isMethod: true,
  },
};

/**
 * Props that need special handling during conversion
 */
const PROP_MAPPINGS = {
  // Style props
  style: null, // Handled by StyleExtractor
  className: null, // Handled by StyleExtractor

  // Event handlers
  onClick: 'onTap',
  onPress: 'onTap',
  onPressIn: 'onTapDown',
  onPressOut: 'onTapUp',
  onLongPress: 'onLongPress',
  onChange: 'onChanged',
  onChangeText: 'onChanged',
  onSubmit: 'onSubmitted',
  onSubmitEditing: 'onSubmitted',
  onFocus: 'onFocusChange',
  onBlur: 'onFocusChange',
  onScroll: 'onNotification',
  onEndReached: 'onEndReached',
  onRefresh: 'onRefresh',

  // Layout props
  children: 'child', // or children for multi-child

  // Text props
  value: 'controller', // TextField uses TextEditingController
  placeholder: 'hintText',
  placeholderTextColor: 'hintStyle',
  defaultValue: 'initialValue',
  numberOfLines: 'maxLines',
  multiline: 'maxLines',
  editable: 'enabled',
  secureTextEntry: 'obscureText',
  keyboardType: 'keyboardType',
  autoFocus: 'autofocus',

  // Image props
  src: 'image',
  source: 'image',
  resizeMode: 'fit',
  alt: 'semanticLabel',

  // List props
  data: 'itemCount',
  renderItem: 'itemBuilder',
  keyExtractor: 'key',

  // Common props
  testID: 'key',
  accessibilityLabel: 'semanticLabel',
  accessible: 'excludeFromSemantics',
};

/**
 * Map React widget to Flutter widget
 * @param {string} reactWidget - React widget name
 * @returns {string} Flutter widget name
 */
function mapWidget(reactWidget) {
  return WIDGET_MAPPINGS[reactWidget] || reactWidget;
}

/**
 * Check if widget requires special handling
 * @param {string} reactWidget
 * @returns {Object|null}
 */
function getSpecialHandling(reactWidget) {
  return SPECIAL_WIDGETS[reactWidget] || null;
}

/**
 * Map React prop to Flutter property
 * @param {string} propName
 * @returns {string|null}
 */
function mapProp(propName) {
  if (propName in PROP_MAPPINGS) {
    return PROP_MAPPINGS[propName];
  }
  return propName;
}

/**
 * Check if prop is a style/className prop
 * @param {string} propName
 * @returns {boolean}
 */
function isStyleProp(propName) {
  return propName === 'style' || propName === 'className';
}

/**
 * Check if prop is an event handler
 * @param {string} propName
 * @returns {boolean}
 */
function isEventHandler(propName) {
  return propName.startsWith('on');
}

/**
 * Convert camelCase to snake_case
 * @param {string} str
 * @returns {string}
 */
function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Convert snake_case to camelCase
 * @param {string} str
 * @returns {string}
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert string to PascalCase
 * @param {string} str
 * @returns {string}
 */
function toPascalCase(str) {
  return str
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[a-z]/, letter => letter.toUpperCase());
}

/**
 * Get Flutter import for widget
 * @param {string} flutterWidget
 * @returns {string|null}
 */
function getImportForWidget(flutterWidget) {
  // Most Flutter widgets come from material.dart
  const materialWidgets = [
    'Container', 'Column', 'Row', 'Text', 'TextField', 'ElevatedButton',
    'TextButton', 'OutlinedButton', 'InkWell', 'GestureDetector',
    'Scaffold', 'AppBar', 'FloatingActionButton', 'Drawer', 'ListView',
    'CircularProgressIndicator', 'Switch', 'Slider', 'DropdownButton',
    'Dialog', 'AlertDialog', 'BottomSheet', 'SnackBar', 'Card',
  ];

  if (materialWidgets.includes(flutterWidget)) {
    return 'package:flutter/material.dart';
  }

  // SafeArea, Image, etc. also in material.dart
  return 'package:flutter/material.dart';
}

/**
 * Determine if widget should have single child or multiple children
 * @param {string} flutterWidget
 * @returns {string} 'child' or 'children'
 */
function getChildProperty(flutterWidget) {
  const multiChildWidgets = ['Column', 'Row', 'Stack', 'Wrap', 'ListView'];
  return multiChildWidgets.includes(flutterWidget) ? 'children' : 'child';
}

/**
 * Get default props for Flutter widget
 * @param {string} flutterWidget
 * @returns {Object}
 */
function getDefaultProps(flutterWidget) {
  const defaults = {
    Container: {
      padding: null,
      margin: null,
      decoration: null,
    },
    Text: {
      style: null,
      textAlign: null,
      overflow: null,
    },
    TextField: {
      controller: null,
      decoration: 'const InputDecoration()',
      keyboardType: null,
    },
    ElevatedButton: {
      onPressed: null,
      style: null,
    },
  };

  return defaults[flutterWidget] || {};
}

module.exports = {
  WIDGET_MAPPINGS,
  SPECIAL_WIDGETS,
  PROP_MAPPINGS,
  mapWidget,
  getSpecialHandling,
  mapProp,
  isStyleProp,
  isEventHandler,
  toSnakeCase,
  toCamelCase,
  toPascalCase,
  getImportForWidget,
  getChildProperty,
  getDefaultProps,
};
