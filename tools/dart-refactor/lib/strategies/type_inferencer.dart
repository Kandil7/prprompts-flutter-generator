import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/element/type.dart';
import 'package:analyzer/dart/element/type_system.dart';
import '../utils/source_editor.dart';

/// Infers and adds missing type annotations to Dart code
class TypeInferencer {
  /// Infer types for variables, parameters, and return types
  List<SourceEdit> inferTypes(CompilationUnit unit, TypeSystem? typeSystem) {
    final edits = <SourceEdit>[];

    if (typeSystem == null) return edits;

    // Visit the AST and collect type inference opportunities
    final visitor = _TypeInferenceVisitor(edits, typeSystem);
    unit.accept(visitor);

    return edits;
  }
}

/// Visitor to find and infer missing types
class _TypeInferenceVisitor extends RecursiveAstVisitor<void> {
  final List<SourceEdit> edits;
  final TypeSystem typeSystem;

  _TypeInferenceVisitor(this.edits, this.typeSystem);

  @override
  void visitVariableDeclarationList(VariableDeclarationList node) {
    // Only process if type is not specified (var, final, const without type)
    if (node.type == null) {
      for (final variable in node.variables) {
        final initializer = variable.initializer;

        if (initializer != null) {
          final inferredType = _inferType(initializer);

          if (inferredType != null && inferredType != 'dynamic') {
            // Add type annotation
            if (node.keyword?.lexeme == 'var') {
              // Replace 'var' with the inferred type
              edits.add(SourceEdit(
                offset: node.keyword!.offset,
                length: 3, // length of 'var'
                replacement: inferredType,
              ));
            } else if (node.keyword?.lexeme == 'final' || node.keyword?.lexeme == 'const') {
              // Add type after final/const
              edits.add(SourceEdit(
                offset: node.keyword!.end,
                length: 0,
                replacement: ' $inferredType',
              ));
            }
          }
        }
      }
    }

    super.visitVariableDeclarationList(node);
  }

  @override
  void visitMethodDeclaration(MethodDeclaration node) {
    // Infer return type if not specified
    if (node.returnType == null && !node.isGetter && !node.isSetter) {
      final body = node.body;

      if (body is ExpressionFunctionBody) {
        final inferredType = _inferType(body.expression);

        if (inferredType != null && inferredType != 'void') {
          // Add return type before the method name
          final insertOffset = node.name.offset;

          edits.add(SourceEdit(
            offset: insertOffset,
            length: 0,
            replacement: '$inferredType ',
          ));
        }
      } else if (body is BlockFunctionBody) {
        // Analyze return statements to infer type
        final returnType = _inferReturnType(body);

        if (returnType != null && returnType != 'void') {
          final insertOffset = node.name.offset;

          edits.add(SourceEdit(
            offset: insertOffset,
            length: 0,
            replacement: '$returnType ',
          ));
        }
      }
    }

    super.visitMethodDeclaration(node);
  }

  @override
  void visitFunctionDeclaration(FunctionDeclaration node) {
    // Infer return type if not specified
    if (node.returnType == null) {
      final body = node.functionExpression.body;

      if (body is ExpressionFunctionBody) {
        final inferredType = _inferType(body.expression);

        if (inferredType != null && inferredType != 'void') {
          // Add return type before the function name
          final insertOffset = node.name.offset;

          edits.add(SourceEdit(
            offset: insertOffset,
            length: 0,
            replacement: '$inferredType ',
          ));
        }
      } else if (body is BlockFunctionBody) {
        final returnType = _inferReturnType(body);

        if (returnType != null && returnType != 'void') {
          final insertOffset = node.name.offset;

          edits.add(SourceEdit(
            offset: insertOffset,
            length: 0,
            replacement: '$returnType ',
          ));
        }
      }
    }

    super.visitFunctionDeclaration(node);
  }

  @override
  void visitSimpleFormalParameter(SimpleFormalParameter node) {
    // Infer parameter types from usage context
    if (node.type == null) {
      // This is complex and would require analyzing how the parameter is used
      // For now, we'll skip parameter type inference
    }

    super.visitSimpleFormalParameter(node);
  }

  /// Infer the type of an expression
  String? _inferType(Expression expression) {
    if (expression is IntegerLiteral) {
      return 'int';
    } else if (expression is DoubleLiteral) {
      return 'double';
    } else if (expression is BooleanLiteral) {
      return 'bool';
    } else if (expression is StringLiteral) {
      return 'String';
    } else if (expression is ListLiteral) {
      if (expression.typeArguments != null) {
        return 'List${expression.typeArguments!.toSource()}';
      }
      // Try to infer element type
      final elementType = _inferListElementType(expression);
      return elementType != null ? 'List<$elementType>' : 'List<dynamic>';
    } else if (expression is SetOrMapLiteral) {
      if (expression.typeArguments != null) {
        return expression.isMap
            ? 'Map${expression.typeArguments!.toSource()}'
            : 'Set${expression.typeArguments!.toSource()}';
      }
      // Try to infer if it's a map or set based on elements
      if (expression.isMap) {
        final types = _inferMapTypes(expression);
        return types != null ? 'Map<${types.$1}, ${types.$2}>' : 'Map<dynamic, dynamic>';
      } else {
        final elementType = _inferSetElementType(expression);
        return elementType != null ? 'Set<$elementType>' : 'Set<dynamic>';
      }
    } else if (expression is InstanceCreationExpression) {
      final typeName = expression.constructorName.type.name;
      if (typeName is SimpleIdentifier) {
        return typeName.name;
      } else if (typeName is PrefixedIdentifier) {
        return typeName.identifier.name;
      }
    } else if (expression is MethodInvocation) {
      // Common Flutter/Dart method return types
      final methodName = expression.methodName.name;
      return _getKnownMethodReturnType(methodName);
    } else if (expression is SimpleIdentifier) {
      // Check if it's a known type constructor
      return _getKnownConstructorType(expression.name);
    }

    return null;
  }

  /// Infer the element type of a list literal
  String? _inferListElementType(ListLiteral list) {
    if (list.elements.isEmpty) return null;

    final types = <String>{};
    for (final element in list.elements) {
      if (element is Expression) {
        final type = _inferType(element);
        if (type != null) types.add(type);
      }
    }

    // If all elements have the same type, use it
    if (types.length == 1) {
      return types.first;
    }

    // If we have multiple types, try to find a common supertype
    // For simplicity, we'll use dynamic for now
    return types.isEmpty ? null : 'dynamic';
  }

  /// Infer the element type of a set literal
  String? _inferSetElementType(SetOrMapLiteral set) {
    if (set.elements.isEmpty) return null;

    final types = <String>{};
    for (final element in set.elements) {
      if (element is Expression) {
        final type = _inferType(element);
        if (type != null) types.add(type);
      }
    }

    if (types.length == 1) {
      return types.first;
    }

    return types.isEmpty ? null : 'dynamic';
  }

  /// Infer the key and value types of a map literal
  (String, String)? _inferMapTypes(SetOrMapLiteral map) {
    if (map.elements.isEmpty) return null;

    final keyTypes = <String>{};
    final valueTypes = <String>{};

    for (final element in map.elements) {
      if (element is MapLiteralEntry) {
        final keyType = _inferType(element.key);
        final valueType = _inferType(element.value);

        if (keyType != null) keyTypes.add(keyType);
        if (valueType != null) valueTypes.add(valueType);
      }
    }

    final keyType = keyTypes.length == 1 ? keyTypes.first : 'dynamic';
    final valueType = valueTypes.length == 1 ? valueTypes.first : 'dynamic';

    return (keyType, valueType);
  }

  /// Infer return type from a block function body
  String? _inferReturnType(BlockFunctionBody body) {
    final returnTypes = <String>{};

    body.block.accept(_ReturnTypeFinder(returnTypes, this));

    if (returnTypes.isEmpty) {
      return 'void';
    } else if (returnTypes.length == 1) {
      return returnTypes.first;
    }

    // Multiple different return types - use dynamic or try to find common type
    return 'dynamic';
  }

  /// Get known return types for common methods
  String? _getKnownMethodReturnType(String methodName) {
    const knownTypes = {
      'toString': 'String',
      'toList': 'List<dynamic>',
      'toSet': 'Set<dynamic>',
      'toMap': 'Map<dynamic, dynamic>',
      'length': 'int',
      'isEmpty': 'bool',
      'isNotEmpty': 'bool',
      'first': 'dynamic',
      'last': 'dynamic',
      'reversed': 'Iterable<dynamic>',
      'hashCode': 'int',
      'runtimeType': 'Type',
    };

    return knownTypes[methodName];
  }

  /// Get known constructor types
  String? _getKnownConstructorType(String name) {
    const knownTypes = {
      'Container': 'Container',
      'Text': 'Text',
      'Column': 'Column',
      'Row': 'Row',
      'Scaffold': 'Scaffold',
      'AppBar': 'AppBar',
      'Center': 'Center',
      'Padding': 'Padding',
      'EdgeInsets': 'EdgeInsets',
      'Colors': 'MaterialColor',
      'TextStyle': 'TextStyle',
      'ListView': 'ListView',
      'GridView': 'GridView',
      'Card': 'Card',
    };

    return knownTypes[name];
  }
}

/// Visitor to find return statements and their types
class _ReturnTypeFinder extends RecursiveAstVisitor<void> {
  final Set<String> returnTypes;
  final _TypeInferenceVisitor parent;

  _ReturnTypeFinder(this.returnTypes, this.parent);

  @override
  void visitReturnStatement(ReturnStatement node) {
    if (node.expression != null) {
      final type = parent._inferType(node.expression!);
      if (type != null) {
        returnTypes.add(type);
      }
    } else {
      returnTypes.add('void');
    }

    super.visitReturnStatement(node);
  }
}