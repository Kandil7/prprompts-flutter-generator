import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/ast/visitor.dart';
import '../utils/source_editor.dart';

/// Resolves naming conflicts and ensures consistent naming conventions
class NamingResolver {
  /// Resolve naming conflicts in the compilation unit
  List<SourceEdit> resolveConflicts(CompilationUnit unit) {
    final edits = <SourceEdit>[];

    // Collect all identifiers and their scopes
    final identifiers = _collectIdentifiers(unit);

    // Check for conflicts and resolve them
    final conflicts = _findConflicts(identifiers);

    for (final conflict in conflicts) {
      final resolution = _resolveConflict(conflict);
      edits.addAll(resolution);
    }

    // Apply naming conventions
    final conventionEdits = _applyNamingConventions(unit);
    edits.addAll(conventionEdits);

    return edits;
  }

  /// Collect all identifiers and their scopes
  Map<String, List<IdentifierInfo>> _collectIdentifiers(CompilationUnit unit) {
    final identifiers = <String, List<IdentifierInfo>>{};
    final collector = _IdentifierCollector(identifiers);
    unit.accept(collector);
    return identifiers;
  }

  /// Find naming conflicts
  List<NamingConflict> _findConflicts(Map<String, List<IdentifierInfo>> identifiers) {
    final conflicts = <NamingConflict>[];

    for (final entry in identifiers.entries) {
      final name = entry.key;
      final occurrences = entry.value;

      if (occurrences.length > 1) {
        // Check if any occurrences are in the same scope
        final scopeMap = <String, List<IdentifierInfo>>{};

        for (final occurrence in occurrences) {
          scopeMap.putIfAbsent(occurrence.scope, () => []).add(occurrence);
        }

        for (final scopedOccurrences in scopeMap.values) {
          if (scopedOccurrences.length > 1) {
            // Check if they're different types (e.g., variable vs class)
            final types = scopedOccurrences.map((o) => o.type).toSet();

            if (types.length > 1) {
              conflicts.add(NamingConflict(
                name: name,
                occurrences: scopedOccurrences,
              ));
            }
          }
        }
      }
    }

    return conflicts;
  }

  /// Resolve a naming conflict
  List<SourceEdit> _resolveConflict(NamingConflict conflict) {
    final edits = <SourceEdit>[];

    // Sort occurrences by priority (classes > methods > variables)
    final sorted = List<IdentifierInfo>.from(conflict.occurrences)
      ..sort((a, b) => _getTypePriority(a.type).compareTo(_getTypePriority(b.type)));

    // Keep the highest priority identifier, rename others
    for (var i = 1; i < sorted.length; i++) {
      final occurrence = sorted[i];
      final newName = _generateNewName(conflict.name, occurrence.type, i);

      edits.add(SourceEdit(
        offset: occurrence.offset,
        length: occurrence.length,
        replacement: newName,
      ));
    }

    return edits;
  }

  /// Apply Dart naming conventions
  List<SourceEdit> _applyNamingConventions(CompilationUnit unit) {
    final edits = <SourceEdit>[];
    final visitor = _NamingConventionVisitor(edits);
    unit.accept(visitor);
    return edits;
  }

  /// Get priority for identifier type (lower is higher priority)
  int _getTypePriority(IdentifierType type) {
    switch (type) {
      case IdentifierType.className:
        return 1;
      case IdentifierType.methodName:
        return 2;
      case IdentifierType.variableName:
        return 3;
      case IdentifierType.parameterName:
        return 4;
      default:
        return 5;
    }
  }

  /// Generate a new name for a conflicting identifier
  String _generateNewName(String originalName, IdentifierType type, int index) {
    switch (type) {
      case IdentifierType.variableName:
        return '${originalName}_$index';
      case IdentifierType.parameterName:
        return '${originalName}Param';
      case IdentifierType.methodName:
        return '${originalName}Method';
      default:
        return '${originalName}_$index';
    }
  }
}

/// Information about an identifier
class IdentifierInfo {
  final String name;
  final IdentifierType type;
  final String scope;
  final int offset;
  final int length;

  IdentifierInfo({
    required this.name,
    required this.type,
    required this.scope,
    required this.offset,
    required this.length,
  });
}

/// Types of identifiers
enum IdentifierType {
  className,
  methodName,
  variableName,
  parameterName,
  fieldName,
}

/// Represents a naming conflict
class NamingConflict {
  final String name;
  final List<IdentifierInfo> occurrences;

  NamingConflict({
    required this.name,
    required this.occurrences,
  });
}

/// Visitor to collect identifiers
class _IdentifierCollector extends RecursiveAstVisitor<void> {
  final Map<String, List<IdentifierInfo>> identifiers;
  final List<String> scopeStack = [];

  _IdentifierCollector(this.identifiers);

  String get currentScope => scopeStack.join('.');

  @override
  void visitClassDeclaration(ClassDeclaration node) {
    final name = node.name.lexeme;
    _addIdentifier(name, IdentifierType.className, node.name.offset, name.length);

    scopeStack.add(name);
    super.visitClassDeclaration(node);
    scopeStack.removeLast();
  }

  @override
  void visitMethodDeclaration(MethodDeclaration node) {
    final name = node.name.lexeme;
    _addIdentifier(name, IdentifierType.methodName, node.name.offset, name.length);

    scopeStack.add(name);
    super.visitMethodDeclaration(node);
    scopeStack.removeLast();
  }

  @override
  void visitFunctionDeclaration(FunctionDeclaration node) {
    final name = node.name.lexeme;
    _addIdentifier(name, IdentifierType.methodName, node.name.offset, name.length);

    scopeStack.add(name);
    super.visitFunctionDeclaration(node);
    scopeStack.removeLast();
  }

  @override
  void visitVariableDeclaration(VariableDeclaration node) {
    final name = node.name.lexeme;
    _addIdentifier(name, IdentifierType.variableName, node.name.offset, name.length);
    super.visitVariableDeclaration(node);
  }

  @override
  void visitSimpleFormalParameter(SimpleFormalParameter node) {
    if (node.name != null) {
      final name = node.name!.lexeme;
      _addIdentifier(name, IdentifierType.parameterName, node.name!.offset, name.length);
    }
    super.visitSimpleFormalParameter(node);
  }

  @override
  void visitFieldDeclaration(FieldDeclaration node) {
    for (final variable in node.fields.variables) {
      final name = variable.name.lexeme;
      _addIdentifier(name, IdentifierType.fieldName, variable.name.offset, name.length);
    }
    super.visitFieldDeclaration(node);
  }

  void _addIdentifier(String name, IdentifierType type, int offset, int length) {
    final info = IdentifierInfo(
      name: name,
      type: type,
      scope: currentScope,
      offset: offset,
      length: length,
    );

    identifiers.putIfAbsent(name, () => []).add(info);
  }
}

/// Visitor to apply naming conventions
class _NamingConventionVisitor extends RecursiveAstVisitor<void> {
  final List<SourceEdit> edits;

  _NamingConventionVisitor(this.edits);

  @override
  void visitClassDeclaration(ClassDeclaration node) {
    // Class names should be UpperCamelCase
    final name = node.name.lexeme;
    final corrected = _toUpperCamelCase(name);

    if (name != corrected) {
      edits.add(SourceEdit(
        offset: node.name.offset,
        length: name.length,
        replacement: corrected,
      ));
    }

    super.visitClassDeclaration(node);
  }

  @override
  void visitMethodDeclaration(MethodDeclaration node) {
    // Method names should be lowerCamelCase
    final name = node.name.lexeme;
    final corrected = _toLowerCamelCase(name);

    if (name != corrected && !_isOperator(name)) {
      edits.add(SourceEdit(
        offset: node.name.offset,
        length: name.length,
        replacement: corrected,
      ));
    }

    super.visitMethodDeclaration(node);
  }

  @override
  void visitVariableDeclaration(VariableDeclaration node) {
    // Variable names should be lowerCamelCase
    final name = node.name.lexeme;

    // Check if it's a constant (should be lowerCamelCase in Dart, not UPPER_SNAKE)
    final parent = node.parent;
    if (parent is VariableDeclarationList && parent.isConst) {
      // Constants that are not class-level should still be lowerCamelCase
      final corrected = _toLowerCamelCase(name);

      if (name != corrected) {
        edits.add(SourceEdit(
          offset: node.name.offset,
          length: name.length,
          replacement: corrected,
        ));
      }
    } else {
      final corrected = _toLowerCamelCase(name);

      if (name != corrected) {
        edits.add(SourceEdit(
          offset: node.name.offset,
          length: name.length,
          replacement: corrected,
        ));
      }
    }

    super.visitVariableDeclaration(node);
  }

  /// Convert string to UpperCamelCase
  String _toUpperCamelCase(String input) {
    if (input.isEmpty) return input;

    // Handle snake_case
    if (input.contains('_')) {
      return input
          .split('_')
          .map((word) => word.isEmpty ? '' : word[0].toUpperCase() + word.substring(1).toLowerCase())
          .join();
    }

    // Ensure first letter is uppercase
    if (input[0] != input[0].toUpperCase()) {
      return input[0].toUpperCase() + input.substring(1);
    }

    return input;
  }

  /// Convert string to lowerCamelCase
  String _toLowerCamelCase(String input) {
    if (input.isEmpty) return input;

    // Handle snake_case
    if (input.contains('_')) {
      final parts = input.split('_');
      if (parts.isEmpty) return input;

      return parts[0].toLowerCase() +
          parts
              .skip(1)
              .map((word) => word.isEmpty ? '' : word[0].toUpperCase() + word.substring(1).toLowerCase())
              .join();
    }

    // Handle UPPER_CASE constants
    if (input == input.toUpperCase() && input.length > 1) {
      return input.toLowerCase();
    }

    // Ensure first letter is lowercase
    if (input[0] != input[0].toLowerCase()) {
      return input[0].toLowerCase() + input.substring(1);
    }

    return input;
  }

  /// Check if a method name is an operator
  bool _isOperator(String name) {
    const operators = {
      '[]', '[]=', '~', '==', '+', '-', '*', '/', '%', '~/',
      '&', '|', '^', '<', '>', '<=', '>=', '<<', '>>', '>>>',
      'unary-', '~'
    };

    return operators.contains(name);
  }
}