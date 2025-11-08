#!/usr/bin/env dart

import 'dart:convert';
import 'dart:io';
import 'package:args/args.dart';
import '../lib/engine.dart';

/// Main entry point for the Dart Refactor Engine
/// Accepts JSON via stdin and returns unified diff via stdout
///
/// Input JSON format:
/// {
///   "files": ["path/to/file1.dart", "path/to/file2.dart"],
///   "options": {
///     "addImports": true,
///     "formatCode": true,
///     "extractWidgets": true,
///     "optimizeImports": true
///   }
/// }
///
/// Output JSON format:
/// {
///   "success": true,
///   "files": [
///     {
///       "path": "path/to/file1.dart",
///       "diff": "unified diff string",
///       "newContent": "formatted dart code",
///       "edits": [{"offset": 0, "length": 10, "replacement": "new text"}]
///     }
///   ],
///   "errors": []
/// }

void main(List<String> arguments) async {
  final parser = ArgParser()
    ..addFlag('help', abbr: 'h', help: 'Show usage information')
    ..addFlag('verbose', abbr: 'v', help: 'Enable verbose logging')
    ..addFlag('format', abbr: 'f', help: 'Format output code', defaultsTo: true)
    ..addFlag('add-imports', help: 'Add missing imports', defaultsTo: true)
    ..addFlag('optimize-imports', help: 'Optimize and sort imports', defaultsTo: true)
    ..addFlag('extract-widgets', help: 'Extract repeated widgets', defaultsTo: false)
    ..addFlag('infer-types', help: 'Infer and add missing types', defaultsTo: true);

  try {
    final results = parser.parse(arguments);

    if (results['help']) {
      print('Dart Refactor Engine - AST-based code refactoring for Flutter');
      print('\nUsage: dart refactor.dart [options]');
      print('\nOptions:');
      print(parser.usage);
      exit(0);
    }

    // Read JSON input from stdin
    final input = await stdin.transform(utf8.decoder).join();

    if (input.isEmpty) {
      throw Exception('No input provided. Expected JSON via stdin.');
    }

    final Map<String, dynamic> request = json.decode(input);

    // Validate input
    if (!request.containsKey('files') || request['files'] is! List) {
      throw Exception('Invalid input: "files" array is required');
    }

    // Create refactor engine with options
    final engine = RefactorEngine(
      formatCode: results['format'] ?? request['options']?['formatCode'] ?? true,
      addImports: results['add-imports'] ?? request['options']?['addImports'] ?? true,
      optimizeImports: results['optimize-imports'] ?? request['options']?['optimizeImports'] ?? true,
      extractWidgets: results['extract-widgets'] ?? request['options']?['extractWidgets'] ?? false,
      inferTypes: results['infer-types'] ?? request['options']?['inferTypes'] ?? true,
      verbose: results['verbose'] ?? false,
    );

    // Process files
    final List<String> files = List<String>.from(request['files']);
    final processedFiles = <Map<String, dynamic>>[];
    final errors = <String>[];

    for (final filePath in files) {
      try {
        if (results['verbose']) {
          stderr.writeln('Processing: $filePath');
        }

        final result = await engine.processFile(filePath);
        processedFiles.add(result.toJson());

        if (results['verbose']) {
          stderr.writeln('✓ Processed: $filePath');
        }
      } catch (e) {
        errors.add('Error processing $filePath: $e');
        if (results['verbose']) {
          stderr.writeln('✗ Failed: $filePath - $e');
        }
      }
    }

    // Output JSON response
    final response = {
      'success': errors.isEmpty,
      'files': processedFiles,
      'errors': errors,
      'metadata': {
        'totalFiles': files.length,
        'processedFiles': processedFiles.length,
        'failedFiles': errors.length,
        'timestamp': DateTime.now().toIso8601String(),
      }
    };

    stdout.write(json.encode(response));
    exit(errors.isEmpty ? 0 : 1);

  } catch (e, stackTrace) {
    final errorResponse = {
      'success': false,
      'error': e.toString(),
      'stackTrace': stackTrace.toString(),
    };

    stdout.write(json.encode(errorResponse));
    stderr.writeln('Fatal error: $e');
    exit(1);
  }
}