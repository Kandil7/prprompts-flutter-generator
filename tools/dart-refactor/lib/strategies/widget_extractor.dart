import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/ast/visitor.dart';
import '../utils/source_editor.dart';

/// Extracts repeated widgets into separate widget classes
class WidgetExtractor {
  /// Extract repeated widget patterns into reusable widget classes
  List<SourceEdit> extractRepeatedWidgets(CompilationUnit unit) {
    final edits = <SourceEdit>[];

    // Find repeated widget patterns
    final widgetPatterns = _findRepeatedPatterns(unit);

    // Generate new widget classes for repeated patterns
    for (final pattern in widgetPatterns) {
      if (pattern.occurrences > 2) {
        // Only extract if pattern appears more than twice
        final widgetClass = _generateWidgetClass(pattern);
        final replacement = _generateWidgetCall(pattern);

        // Add the new widget class at the end of the file
        edits.add(SourceEdit(
          offset: unit.end,
          length: 0,
          replacement: '\n\n$widgetClass',
        ));

        // Replace occurrences with widget calls
        for (final occurrence in pattern.locations) {
          edits.add(SourceEdit(
            offset: occurrence.offset,
            length: occurrence.length,
            replacement: replacement,
          ));
        }
      }
    }

    return edits;
  }

  /// Find repeated widget build patterns in the code
  List<WidgetPattern> _findRepeatedPatterns(CompilationUnit unit) {
    final patterns = <WidgetPattern>[];
    final widgetCalls = <String, List<WidgetOccurrence>>{};

    // Visit all method invocations and instance creations
    unit.accept(_WidgetPatternCollector(widgetCalls));

    // Analyze collected patterns for repetition
    for (final entry in widgetCalls.entries) {
      if (entry.value.length > 2) {
        patterns.add(WidgetPattern(
          pattern: entry.key,
          occurrences: entry.value.length,
          locations: entry.value,
        ));
      }
    }

    return patterns;
  }

  /// Generate a new widget class for the extracted pattern
  String _generateWidgetClass(WidgetPattern pattern) {
    final className = _generateClassName(pattern);
    final parameters = _extractParameters(pattern);

    final buffer = StringBuffer();
    buffer.writeln('class $className extends StatelessWidget {');

    // Add fields for parameters
    for (final param in parameters) {
      buffer.writeln('  final ${param.type} ${param.name};');
    }

    // Add constructor
    if (parameters.isNotEmpty) {
      buffer.writeln();
      buffer.write('  const $className({');
      buffer.write('super.key');
      for (final param in parameters) {
        buffer.write(', ');
        if (param.required) {
          buffer.write('required ');
        }
        buffer.write('this.${param.name}');
      }
      buffer.writeln('});');
    } else {
      buffer.writeln('  const $className({super.key});');
    }

    // Add build method
    buffer.writeln();
    buffer.writeln('  @override');
    buffer.writeln('  Widget build(BuildContext context) {');
    buffer.writeln('    return ${pattern.pattern};');
    buffer.writeln('  }');
    buffer.writeln('}');

    return buffer.toString();
  }

  /// Generate a call to the extracted widget
  String _generateWidgetCall(WidgetPattern pattern) {
    final className = _generateClassName(pattern);
    final parameters = _extractParameters(pattern);

    if (parameters.isEmpty) {
      return 'const $className()';
    }

    final buffer = StringBuffer();
    buffer.write('$className(');

    for (var i = 0; i < parameters.length; i++) {
      if (i > 0) buffer.write(', ');
      buffer.write('${parameters[i].name}: ${parameters[i].defaultValue}');
    }

    buffer.write(')');
    return buffer.toString();
  }

  /// Generate a class name for the extracted widget
  String _generateClassName(WidgetPattern pattern) {
    // Extract the main widget type from the pattern
    final match = RegExp(r'(\w+)\(').firstMatch(pattern.pattern);
    final baseWidget = match?.group(1) ?? 'Custom';

    // Generate unique name
    return '_Extracted${baseWidget}Widget';
  }

  /// Extract parameters from the pattern that vary between occurrences
  List<WidgetParameter> _extractParameters(WidgetPattern pattern) {
    // This is simplified - a full implementation would analyze
    // the differences between occurrences to identify parameters
    return [];
  }
}

/// Represents a repeated widget pattern
class WidgetPattern {
  final String pattern;
  final int occurrences;
  final List<WidgetOccurrence> locations;

  WidgetPattern({
    required this.pattern,
    required this.occurrences,
    required this.locations,
  });
}

/// Represents an occurrence of a widget pattern
class WidgetOccurrence {
  final int offset;
  final int length;
  final Map<String, dynamic> parameters;

  WidgetOccurrence({
    required this.offset,
    required this.length,
    this.parameters = const {},
  });
}

/// Represents a parameter for an extracted widget
class WidgetParameter {
  final String name;
  final String type;
  final bool required;
  final String? defaultValue;

  WidgetParameter({
    required this.name,
    required this.type,
    this.required = false,
    this.defaultValue,
  });
}

/// Visitor to collect widget patterns
class _WidgetPatternCollector extends RecursiveAstVisitor<void> {
  final Map<String, List<WidgetOccurrence>> widgetCalls;

  _WidgetPatternCollector(this.widgetCalls);

  @override
  void visitInstanceCreationExpression(InstanceCreationExpression node) {
    // Check if this is a Flutter widget constructor
    final typeName = node.constructorName.type.name;

    if (typeName is SimpleIdentifier && _isWidgetType(typeName.name)) {
      final pattern = _extractPattern(node);
      final occurrence = WidgetOccurrence(
        offset: node.offset,
        length: node.length,
      );

      widgetCalls.putIfAbsent(pattern, () => []).add(occurrence);
    }

    super.visitInstanceCreationExpression(node);
  }

  @override
  void visitMethodInvocation(MethodInvocation node) {
    // Check for builder methods that return widgets
    final methodName = node.methodName.name;

    if (_isBuilderMethod(methodName)) {
      final pattern = _extractPattern(node);
      final occurrence = WidgetOccurrence(
        offset: node.offset,
        length: node.length,
      );

      widgetCalls.putIfAbsent(pattern, () => []).add(occurrence);
    }

    super.visitMethodInvocation(node);
  }

  /// Check if a type name is a Flutter widget
  bool _isWidgetType(String typeName) {
    const widgetTypes = {
      'Container', 'Text', 'Column', 'Row', 'Stack',
      'Padding', 'Center', 'Align', 'SizedBox', 'Expanded',
      'Card', 'ListTile', 'ListView', 'GridView',
      'Scaffold', 'AppBar', 'Drawer', 'BottomNavigationBar',
      'IconButton', 'ElevatedButton', 'TextButton', 'OutlinedButton',
      'TextField', 'TextFormField', 'Form',
      'Image', 'Icon', 'CircleAvatar',
      'Dialog', 'AlertDialog', 'SnackBar',
      'TabBar', 'TabBarView', 'PageView',
      'AnimatedContainer', 'AnimatedOpacity', 'AnimatedBuilder',
      'FutureBuilder', 'StreamBuilder',
      'GestureDetector', 'InkWell',
      'Hero', 'Material', 'Ink',
      'Wrap', 'Chip', 'Tooltip',
    };

    return widgetTypes.contains(typeName);
  }

  /// Check if a method is a builder method
  bool _isBuilderMethod(String methodName) {
    return methodName == 'builder' ||
           methodName == 'separated' ||
           methodName == 'custom' ||
           methodName == 'generate';
  }

  /// Extract a normalized pattern string from a node
  String _extractPattern(AstNode node) {
    // Create a normalized representation of the widget structure
    // This is simplified - a full implementation would normalize
    // variable names and extract the structure
    final source = node.toSource();

    // Remove specific values to create a pattern
    return source
        .replaceAll(RegExp(r'"[^"]*"'), '"..."')  // Replace string literals
        .replaceAll(RegExp(r'\d+\.?\d*'), '0')     // Replace numbers
        .replaceAll(RegExp(r'0x[0-9a-fA-F]+'), '0x0');  // Replace hex colors
  }
}