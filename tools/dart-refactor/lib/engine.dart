import 'dart:io';
import 'package:analyzer/dart/analysis/analysis_context_collection.dart';
import 'package:analyzer/dart/analysis/results.dart';
import 'package:analyzer/dart/ast/ast.dart';
import 'package:analyzer/dart/ast/visitor.dart';
import 'package:analyzer/file_system/physical_file_system.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;

import 'strategies/import_optimizer.dart';
import 'strategies/type_inferencer.dart';
import 'strategies/widget_extractor.dart';
import 'strategies/naming_resolver.dart';
import 'utils/diff_generator.dart';
import 'utils/source_editor.dart';

/// Result of processing a single file
class RefactorResult {
  final String filePath;
  final String originalContent;
  final String newContent;
  final String unifiedDiff;
  final List<SourceEdit> edits;
  final List<String> messages;

  RefactorResult({
    required this.filePath,
    required this.originalContent,
    required this.newContent,
    required this.unifiedDiff,
    required this.edits,
    this.messages = const [],
  });

  Map<String, dynamic> toJson() => {
    'path': filePath,
    'diff': unifiedDiff,
    'newContent': newContent,
    'edits': edits.map((e) => e.toJson()).toList(),
    'messages': messages,
    'statistics': {
      'originalLength': originalContent.length,
      'newLength': newContent.length,
      'editsCount': edits.length,
    }
  };
}

/// Main refactoring engine for Dart/Flutter code
class RefactorEngine {
  final bool formatCode;
  final bool addImports;
  final bool optimizeImports;
  final bool extractWidgets;
  final bool inferTypes;
  final bool verbose;

  late final DartFormatter _formatter;
  late final AnalysisContextCollection _contextCollection;

  RefactorEngine({
    this.formatCode = true,
    this.addImports = true,
    this.optimizeImports = true,
    this.extractWidgets = false,
    this.inferTypes = true,
    this.verbose = false,
  }) {
    _formatter = DartFormatter();
  }

  /// Process a single Dart file and return refactored result
  Future<RefactorResult> processFile(String filePath) async {
    final file = File(filePath);

    if (!await file.exists()) {
      throw FileSystemException('File not found', filePath);
    }

    final originalContent = await file.readAsString();

    // Initialize analysis context for the file
    _contextCollection = AnalysisContextCollection(
      includedPaths: [path.dirname(path.absolute(filePath))],
      resourceProvider: PhysicalResourceProvider.INSTANCE,
    );

    final context = _contextCollection.contextFor(filePath);
    final result = await context.currentSession.getResolvedUnit(filePath) as ResolvedUnitResult;

    if (!result.exists) {
      throw Exception('Failed to parse file: $filePath');
    }

    final unit = result.unit;
    final sourceEditor = SourceEditor(originalContent);
    final messages = <String>[];

    // Apply refactoring strategies in order
    if (optimizeImports) {
      if (verbose) messages.add('Optimizing imports...');
      final optimizer = ImportOptimizer();
      final edits = optimizer.optimize(unit, result.libraryElement);
      sourceEditor.applyEdits(edits);
    }

    if (inferTypes) {
      if (verbose) messages.add('Inferring types...');
      final inferencer = TypeInferencer();
      final edits = inferencer.inferTypes(unit, result.typeSystem);
      sourceEditor.applyEdits(edits);
    }

    if (addImports) {
      if (verbose) messages.add('Adding missing imports...');
      final optimizer = ImportOptimizer();
      final edits = optimizer.addMissingImports(unit, result.libraryElement);
      sourceEditor.applyEdits(edits);
    }

    if (extractWidgets) {
      if (verbose) messages.add('Extracting repeated widgets...');
      final extractor = WidgetExtractor();
      final edits = extractor.extractRepeatedWidgets(unit);
      sourceEditor.applyEdits(edits);
    }

    // Resolve naming conflicts
    final resolver = NamingResolver();
    final namingEdits = resolver.resolveConflicts(unit);
    sourceEditor.applyEdits(namingEdits);

    // Get the modified content
    var newContent = sourceEditor.getContent();

    // Format the code if requested
    if (formatCode) {
      if (verbose) messages.add('Formatting code...');
      try {
        newContent = _formatter.format(newContent);
      } catch (e) {
        messages.add('Warning: Failed to format code: $e');
      }
    }

    // Generate unified diff
    final diffGenerator = DiffGenerator();
    final unifiedDiff = diffGenerator.generateUnifiedDiff(
      originalContent,
      newContent,
      filePath,
    );

    return RefactorResult(
      filePath: filePath,
      originalContent: originalContent,
      newContent: newContent,
      unifiedDiff: unifiedDiff,
      edits: sourceEditor.getAllEdits(),
      messages: messages,
    );
  }

  /// Process multiple files in batch
  Future<List<RefactorResult>> processFiles(List<String> filePaths) async {
    final results = <RefactorResult>[];

    for (final filePath in filePaths) {
      try {
        final result = await processFile(filePath);
        results.add(result);
      } catch (e) {
        // Continue processing other files even if one fails
        if (verbose) {
          print('Error processing $filePath: $e');
        }
      }
    }

    return results;
  }

  /// Validate Dart code without applying changes
  Future<bool> validateCode(String code) async {
    try {
      // Try to format the code - if it fails, the code is invalid
      _formatter.format(code);
      return true;
    } catch (e) {
      return false;
    }
  }
}