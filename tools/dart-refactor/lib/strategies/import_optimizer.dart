import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/element/element.dart';
import '../utils/source_editor.dart';

/// Optimizes and manages imports in Dart files
class ImportOptimizer {
  /// Optimize existing imports (remove unused, sort, group)
  List<SourceEdit> optimize(CompilationUnit unit, LibraryElement? library) {
    final edits = <SourceEdit>[];
    final imports = unit.directives.whereType<ImportDirective>().toList();

    if (imports.isEmpty) return edits;

    // Collect all used elements
    final usedElements = _collectUsedElements(unit);

    // Group imports by type
    final dartImports = <ImportDirective>[];
    final packageImports = <ImportDirective>[];
    final relativeImports = <ImportDirective>[];

    for (final import in imports) {
      final uri = import.uri.stringValue ?? '';

      if (uri.startsWith('dart:')) {
        dartImports.add(import);
      } else if (uri.startsWith('package:')) {
        packageImports.add(import);
      } else {
        relativeImports.add(import);
      }

      // Check if import is used
      if (library != null && !_isImportUsed(import, usedElements, library)) {
        // Mark for removal
        edits.add(SourceEdit(
          offset: import.offset,
          length: import.length,
          replacement: '',
        ));
      }
    }

    // Sort each group
    dartImports.sort(_compareImports);
    packageImports.sort(_compareImports);
    relativeImports.sort(_compareImports);

    // Generate optimized import block
    final buffer = StringBuffer();

    if (dartImports.isNotEmpty) {
      for (final import in dartImports) {
        buffer.writeln(import.toSource());
      }
      buffer.writeln();
    }

    if (packageImports.isNotEmpty) {
      for (final import in packageImports) {
        buffer.writeln(import.toSource());
      }
      buffer.writeln();
    }

    if (relativeImports.isNotEmpty) {
      for (final import in relativeImports) {
        buffer.writeln(import.toSource());
      }
      buffer.writeln();
    }

    // Replace entire import block
    if (imports.isNotEmpty && edits.isNotEmpty) {
      final firstImport = imports.first;
      final lastImport = imports.last;

      edits.add(SourceEdit(
        offset: firstImport.offset,
        length: lastImport.end - firstImport.offset,
        replacement: buffer.toString().trimRight(),
      ));
    }

    return edits;
  }

  /// Add missing imports for unresolved references
  List<SourceEdit> addMissingImports(CompilationUnit unit, LibraryElement? library) {
    final edits = <SourceEdit>[];
    final missingImports = <String>{};

    // Visit all nodes to find unresolved references
    unit.accept(_UnresolvedReferenceFinder(missingImports));

    // Common Flutter/Dart imports mapping
    final importMapping = {
      'Widget': "import 'package:flutter/material.dart';",
      'StatelessWidget': "import 'package:flutter/material.dart';",
      'StatefulWidget': "import 'package:flutter/material.dart';",
      'BuildContext': "import 'package:flutter/material.dart';",
      'State': "import 'package:flutter/material.dart';",
      'Container': "import 'package:flutter/material.dart';",
      'Text': "import 'package:flutter/material.dart';",
      'Column': "import 'package:flutter/material.dart';",
      'Row': "import 'package:flutter/material.dart';",
      'Scaffold': "import 'package:flutter/material.dart';",
      'AppBar': "import 'package:flutter/material.dart';",
      'Center': "import 'package:flutter/material.dart';",
      'Padding': "import 'package:flutter/material.dart';",
      'EdgeInsets': "import 'package:flutter/material.dart';",
      'Colors': "import 'package:flutter/material.dart';",
      'TextStyle': "import 'package:flutter/material.dart';",
      'Navigator': "import 'package:flutter/material.dart';",
      'MaterialApp': "import 'package:flutter/material.dart';",
      'Theme': "import 'package:flutter/material.dart';",
      'IconButton': "import 'package:flutter/material.dart';",
      'Icon': "import 'package:flutter/material.dart';",
      'Icons': "import 'package:flutter/material.dart';",
      'ListView': "import 'package:flutter/material.dart';",
      'GridView': "import 'package:flutter/material.dart';",
      'Card': "import 'package:flutter/material.dart';",
      'Cupertino': "import 'package:flutter/cupertino.dart';",
      'CupertinoApp': "import 'package:flutter/cupertino.dart';",
      'http': "import 'package:http/http.dart' as http;",
      'dio': "import 'package:dio/dio.dart';",
      'Dio': "import 'package:dio/dio.dart';",
      'BlocProvider': "import 'package:flutter_bloc/flutter_bloc.dart';",
      'BlocBuilder': "import 'package:flutter_bloc/flutter_bloc.dart';",
      'Bloc': "import 'package:flutter_bloc/flutter_bloc.dart';",
      'Cubit': "import 'package:flutter_bloc/flutter_bloc.dart';",
      'Provider': "import 'package:provider/provider.dart';",
      'ChangeNotifier': "import 'package:flutter/foundation.dart';",
      'Consumer': "import 'package:provider/provider.dart';",
      'GetIt': "import 'package:get_it/get_it.dart';",
      'GoRouter': "import 'package:go_router/go_router.dart';",
      'SharedPreferences': "import 'package:shared_preferences/shared_preferences.dart';",
      'File': "import 'dart:io';",
      'Directory': "import 'dart:io';",
      'Future': "import 'dart:async';",
      'Stream': "import 'dart:async';",
      'StreamController': "import 'dart:async';",
      'json': "import 'dart:convert';",
      'jsonDecode': "import 'dart:convert';",
      'jsonEncode': "import 'dart:convert';",
      'math': "import 'dart:math' as math;",
      'Random': "import 'dart:math';",
    };

    // Determine which imports to add
    final importsToAdd = <String>{};
    for (final reference in missingImports) {
      if (importMapping.containsKey(reference)) {
        importsToAdd.add(importMapping[reference]!);
      }
    }

    // Find the position to insert imports
    if (importsToAdd.isNotEmpty) {
      final existingImports = unit.directives.whereType<ImportDirective>();
      final insertOffset = existingImports.isNotEmpty
          ? existingImports.last.end
          : 0;

      final importBlock = importsToAdd.join('\n') + '\n';

      edits.add(SourceEdit(
        offset: insertOffset,
        length: 0,
        replacement: '\n$importBlock',
      ));
    }

    return edits;
  }

  Set<String> _collectUsedElements(CompilationUnit unit) {
    final used = <String>{};
    unit.accept(_UsedElementCollector(used));
    return used;
  }

  bool _isImportUsed(ImportDirective import, Set<String> usedElements, LibraryElement library) {
    // Always keep dart:core
    if (import.uri.stringValue == 'dart:core') return true;

    // Check if any element from this import is used
    // This is a simplified check - a full implementation would
    // resolve the imported library and check its exports
    return true; // Conservative: keep all imports for now
  }

  int _compareImports(ImportDirective a, ImportDirective b) {
    final aUri = a.uri.stringValue ?? '';
    final bUri = b.uri.stringValue ?? '';
    return aUri.compareTo(bUri);
  }
}

/// Visitor to collect used elements in the code
class _UsedElementCollector extends RecursiveAstVisitor<void> {
  final Set<String> usedElements;

  _UsedElementCollector(this.usedElements);

  @override
  void visitSimpleIdentifier(SimpleIdentifier node) {
    usedElements.add(node.name);
    super.visitSimpleIdentifier(node);
  }
}

/// Visitor to find unresolved references
class _UnresolvedReferenceFinder extends RecursiveAstVisitor<void> {
  final Set<String> unresolvedReferences;

  _UnresolvedReferenceFinder(this.unresolvedReferences);

  @override
  void visitSimpleIdentifier(SimpleIdentifier node) {
    // Check if the identifier is unresolved
    if (node.staticElement == null && !_isBuiltIn(node.name)) {
      unresolvedReferences.add(node.name);
    }
    super.visitSimpleIdentifier(node);
  }

  bool _isBuiltIn(String name) {
    // Common Dart built-in types and keywords
    return const {
      'void', 'dynamic', 'var', 'final', 'const',
      'int', 'double', 'num', 'bool', 'String',
      'List', 'Map', 'Set', 'Iterable',
      'Object', 'Function', 'Type',
      'true', 'false', 'null',
      'this', 'super',
    }.contains(name);
  }
}