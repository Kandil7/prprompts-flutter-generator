# 🔍 React Parser: Auto-Extract Components

I'll build a comprehensive React parser that analyzes React/TypeScript files and automatically extracts component metadata for Flutter refactoring.

---

## 📋 **Architecture Overview**

```
lib/
├── parsers/
│   ├── react_parser.dart           # Main parser orchestrator
│   ├── ast/
│   │   ├── ast_analyzer.dart       # AST analysis using analyzer package
│   │   ├── typescript_parser.dart  # TypeScript-specific parsing
│   │   └── jsx_parser.dart         # JSX/TSX parsing
│   ├── extractors/
│   │   ├── component_extractor.dart
│   │   ├── props_extractor.dart
│   │   ├── state_extractor.dart
│   │   ├── api_extractor.dart
│   │   ├── hooks_extractor.dart
│   │   └── redux_extractor.dart
│   ├── analyzers/
│   │   ├── complexity_analyzer.dart
│   │   ├── dependency_analyzer.dart
│   │   └── responsive_analyzer.dart
│   └── models/
│       └── parsed_react_code.dart
```

---

## 🔧 **Step 1: Core Parser Models**

```dart
// 📁 lib/parsers/models/parsed_react_code.dart

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../../models/react_component.dart';

part 'parsed_react_code.freezed.dart';
part 'parsed_react_code.g.dart';

/// Result of parsing a React file
@freezed
class ParsedReactCode with _$ParsedReactCode {
  const factory ParsedReactCode({
    /// Extracted React component(s)
    required List<ReactComponent> components,
    
    /// File imports
    @Default([]) List<ImportStatement> imports,
    
    /// Type definitions found
    @Default([]) List<TypeDefinition> types,
    
    /// Constants/enums
    @Default([]) List<ConstantDefinition> constants,
    
    /// Helper functions
    @Default([]) List<FunctionDefinition> helpers,
    
    /// Complexity metrics
    required ComplexityMetrics complexity,
    
    /// Dependencies (npm packages used)
    @Default([]) List<String> dependencies,
    
    /// Parse warnings/errors
    @Default([]) List<ParseWarning> warnings,
  }) = _ParsedReactCode;
  
  factory ParsedReactCode.fromJson(Map<String, dynamic> json) =>
      _$ParsedReactCodeFromJson(json);
}

@freezed
class ImportStatement with _$ImportStatement {
  const factory ImportStatement({
    required String source,
    required ImportType type,
    @Default([]) List<String> imports,
    String? defaultImport,
    String? namespaceImport,
  }) = _ImportStatement;
  
  factory ImportStatement.fromJson(Map<String, dynamic> json) =>
      _$ImportStatementFromJson(json);
}

enum ImportType {
  named,        // import { Component } from 'react'
  defaultImport, // import React from 'react'
  namespace,    // import * as React from 'react'
  sideEffect,   // import './styles.css'
}

@freezed
class TypeDefinition with _$TypeDefinition {
  const factory TypeDefinition({
    required String name,
    required TypeKind kind,
    required Map<String, String> properties,
    String? extendsType,
  }) = _TypeDefinition;
  
  factory TypeDefinition.fromJson(Map<String, dynamic> json) =>
      _$TypeDefinitionFromJson(json);
}

enum TypeKind {
  interface,
  type,
  enumType,
  classType,
}

@freezed
class ConstantDefinition with _$ConstantDefinition {
  const factory ConstantDefinition({
    required String name,
    required String type,
    String? value,
  }) = _ConstantDefinition;
  
  factory ConstantDefinition.fromJson(Map<String, dynamic> json) =>
      _$ConstantDefinitionFromJson(json);
}

@freezed
class FunctionDefinition with _$FunctionDefinition {
  const factory FunctionDefinition({
    required String name,
    required List<FunctionParameter> parameters,
    String? returnType,
    @Default(false) bool isAsync,
  }) = _FunctionDefinition;
  
  factory FunctionDefinition.fromJson(Map<String, dynamic> json) =>
      _$FunctionDefinitionFromJson(json);
}

@freezed
class FunctionParameter with _$FunctionParameter {
  const factory FunctionParameter({
    required String name,
    String? type,
    String? defaultValue,
    @Default(false) bool isOptional,
  }) = _FunctionParameter;
  
  factory FunctionParameter.fromJson(Map<String, dynamic> json) =>
      _$FunctionParameterFromJson(json);
}

@freezed
class ComplexityMetrics with _$ComplexityMetrics {
  const factory ComplexityMetrics({
    required int linesOfCode,
    required int cyclomaticComplexity,
    required int numberOfHooks,
    required int numberOfApiCalls,
    required int stateVariablesCount,
    required int propsCount,
    @Default(false) bool usesRedux,
    @Default(false) bool usesContext,
    @Default(false) bool hasAsyncOperations,
  }) = _ComplexityMetrics;
  
  factory ComplexityMetrics.fromJson(Map<String, dynamic> json) =>
      _$ComplexityMetricsFromJson(json);
}

@freezed
class ParseWarning with _$ParseWarning {
  const factory ParseWarning({
    required String message,
    required WarningSeverity severity,
    int? line,
    int? column,
  }) = _ParseWarning;
  
  factory ParseWarning.fromJson(Map<String, dynamic> json) =>
      _$ParseWarningFromJson(json);
}

enum WarningSeverity {
  info,
  warning,
  error,
}
```

---

## 🎯 **Step 2: Main React Parser**

```dart
// 📁 lib/parsers/react_parser.dart

import 'dart:io';
import 'package:path/path.dart' as path;
import 'models/parsed_react_code.dart';
import '../models/react_component.dart';
import 'extractors/component_extractor.dart';
import 'extractors/props_extractor.dart';
import 'extractors/state_extractor.dart';
import 'extractors/api_extractor.dart';
import 'extractors/hooks_extractor.dart';
import 'extractors/redux_extractor.dart';
import 'analyzers/complexity_analyzer.dart';
import 'analyzers/dependency_analyzer.dart';
import 'analyzers/responsive_analyzer.dart';

/// Main orchestrator for parsing React code
class ReactParser {
  final ComponentExtractor _componentExtractor;
  final PropsExtractor _propsExtractor;
  final StateExtractor _stateExtractor;
  final ApiExtractor _apiExtractor;
  final HooksExtractor _hooksExtractor;
  final ReduxExtractor _reduxExtractor;
  final ComplexityAnalyzer _complexityAnalyzer;
  final DependencyAnalyzer _dependencyAnalyzer;
  final ResponsiveAnalyzer _responsiveAnalyzer;
  
  ReactParser()
      : _componentExtractor = ComponentExtractor(),
        _propsExtractor = PropsExtractor(),
        _stateExtractor = StateExtractor(),
        _apiExtractor = ApiExtractor(),
        _hooksExtractor = HooksExtractor(),
        _reduxExtractor = ReduxExtractor(),
        _complexityAnalyzer = ComplexityAnalyzer(),
        _dependencyAnalyzer = DependencyAnalyzer(),
        _responsiveAnalyzer = ResponsiveAnalyzer();
  
  /// Parse a single React file
  Future<ParsedReactCode> parseFile(String filePath) async {
    print('🔍 Parsing: $filePath');
    
    // Read file content
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }
    
    final content = await file.readAsString();
    final fileName = path.basename(filePath);
    
    // Detect file type
    final fileType = _detectFileType(fileName);
    
    try {
      return await _parseContent(content, filePath, fileType);
    } catch (e, stackTrace) {
      print('❌ Error parsing $filePath: $e');
      print(stackTrace);
      
      // Return empty result with error
      return ParsedReactCode(
        components: [],
        complexity: ComplexityMetrics(
          linesOfCode: content.split('\n').length,
          cyclomaticComplexity: 0,
          numberOfHooks: 0,
          numberOfApiCalls: 0,
          stateVariablesCount: 0,
          propsCount: 0,
        ),
        warnings: [
          ParseWarning(
            message: 'Failed to parse file: $e',
            severity: WarningSeverity.error,
          ),
        ],
      );
    }
  }
  
  /// Parse multiple React files in a directory
  Future<List<ParsedReactCode>> parseDirectory(
    String directoryPath, {
    bool recursive = true,
    List<String> excludePaths = const [],
  }) async {
    print('📂 Scanning directory: $directoryPath');
    
    final results = <ParsedReactCode>[];
    final directory = Directory(directoryPath);
    
    if (!await directory.exists()) {
      throw Exception('Directory not found: $directoryPath');
    }
    
    await for (final entity in directory.list(recursive: recursive)) {
      if (entity is File) {
        final filePath = entity.path;
        
        // Skip excluded paths
        if (_shouldExclude(filePath, excludePaths)) {
          continue;
        }
        
        // Only parse React/TypeScript files
        if (_isReactFile(filePath)) {
          try {
            final result = await parseFile(filePath);
            if (result.components.isNotEmpty) {
              results.add(result);
            }
          } catch (e) {
            print('⚠️  Skipped $filePath: $e');
          }
        }
      }
    }
    
    print('✅ Parsed ${results.length} React files');
    return results;
  }
  
  /// Parse React content (from string)
  Future<ParsedReactCode> _parseContent(
    String content,
    String filePath,
    FileType fileType,
  ) async {
    final warnings = <ParseWarning>[];
    
    // Step 1: Extract imports
    final imports = await _extractImports(content);
    
    // Step 2: Extract type definitions
    final types = await _extractTypes(content);
    
    // Step 3: Extract constants
    final constants = await _extractConstants(content);
    
    // Step 4: Extract components
    final componentResults = await _componentExtractor.extract(
      content,
      filePath,
      fileType,
    );
    
    if (componentResults.isEmpty) {
      warnings.add(ParseWarning(
        message: 'No React components found in file',
        severity: WarningSeverity.warning,
      ));
    }
    
    // Step 5: Enrich each component with detailed analysis
    final enrichedComponents = <ReactComponent>[];
    
    for (final baseComponent in componentResults) {
      try {
        final enriched = await _enrichComponent(
          baseComponent,
          content,
          imports,
          types,
        );
        enrichedComponents.add(enriched);
      } catch (e) {
        warnings.add(ParseWarning(
          message: 'Failed to enrich component ${baseComponent.componentName}: $e',
          severity: WarningSeverity.warning,
        ));
        enrichedComponents.add(baseComponent);
      }
    }
    
    // Step 6: Extract helper functions
    final helpers = await _extractHelpers(content);
    
    // Step 7: Analyze complexity
    final complexity = await _complexityAnalyzer.analyze(
      content,
      enrichedComponents,
    );
    
    // Step 8: Analyze dependencies
    final dependencies = await _dependencyAnalyzer.analyze(imports);
    
    return ParsedReactCode(
      components: enrichedComponents,
      imports: imports,
      types: types,
      constants: constants,
      helpers: helpers,
      complexity: complexity,
      dependencies: dependencies,
      warnings: warnings,
    );
  }
  
  /// Enrich component with detailed analysis
  Future<ReactComponent> _enrichComponent(
    ReactComponent baseComponent,
    String content,
    List<ImportStatement> imports,
    List<TypeDefinition> types,
  ) async {
    // Extract props
    final props = await _propsExtractor.extract(
      baseComponent,
      content,
      types,
    );
    
    // Extract state variables
    final stateVariables = await _stateExtractor.extract(
      baseComponent,
      content,
    );
    
    // Extract API endpoints
    final apiEndpoints = await _apiExtractor.extract(
      baseComponent,
      content,
    );
    
    // Extract hooks usage
    final hooks = await _hooksExtractor.extract(
      baseComponent,
      content,
    );
    
    // Detect state management pattern
    final stateManagement = await _detectStateManagement(
      content,
      imports,
      hooks,
    );
    
    // Extract child components
    final childComponents = await _extractChildComponents(content);
    
    // Check if responsive
    final isResponsive = await _responsiveAnalyzer.isResponsive(content);
    
    // Generate description
    final description = await _generateDescription(
      baseComponent,
      stateVariables,
      apiEndpoints,
    );
    
    return baseComponent.copyWith(
      props: props,
      stateVariables: stateVariables,
      apiEndpoints: apiEndpoints,
      stateManagement: stateManagement,
      childComponents: childComponents,
      isResponsive: isResponsive,
      description: description,
    );
  }
  
  /// Extract import statements
  Future<List<ImportStatement>> _extractImports(String content) async {
    final imports = <ImportStatement>[];
    
    // Match: import { x, y } from 'module'
    final namedImportRegex = RegExp(
      r"import\s+\{([^}]+)\}\s+from\s+['\"]([^'\"]+)['\"]",
      multiLine: true,
    );
    
    // Match: import React from 'react'
    final defaultImportRegex = RegExp(
      r"import\s+(\w+)\s+from\s+['\"]([^'\"]+)['\"]",
      multiLine: true,
    );
    
    // Match: import * as React from 'react'
    final namespaceImportRegex = RegExp(
      r"import\s+\*\s+as\s+(\w+)\s+from\s+['\"]([^'\"]+)['\"]",
      multiLine: true,
    );
    
    // Match: import './styles.css'
    final sideEffectImportRegex = RegExp(
      r"import\s+['\"]([^'\"]+)['\"]",
      multiLine: true,
    );
    
    // Extract named imports
    for (final match in namedImportRegex.allMatches(content)) {
      final importList = match.group(1)!
          .split(',')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();
      final source = match.group(2)!;
      
      imports.add(ImportStatement(
        source: source,
        type: ImportType.named,
        imports: importList,
      ));
    }
    
    // Extract default imports
    for (final match in defaultImportRegex.allMatches(content)) {
      final name = match.group(1)!;
      final source = match.group(2)!;
      
      imports.add(ImportStatement(
        source: source,
        type: ImportType.defaultImport,
        defaultImport: name,
      ));
    }
    
    // Extract namespace imports
    for (final match in namespaceImportRegex.allMatches(content)) {
      final name = match.group(1)!;
      final source = match.group(2)!;
      
      imports.add(ImportStatement(
        source: source,
        type: ImportType.namespace,
        namespaceImport: name,
      ));
    }
    
    // Extract side-effect imports
    for (final match in sideEffectImportRegex.allMatches(content)) {
      final source = match.group(1)!;
      
      imports.add(ImportStatement(
        source: source,
        type: ImportType.sideEffect,
      ));
    }
    
    return imports;
  }
  
  /// Extract TypeScript type definitions
  Future<List<TypeDefinition>> _extractTypes(String content) async {
    final types = <TypeDefinition>[];
    
    // Match: interface Name { ... }
    final interfaceRegex = RegExp(
      r'interface\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{([^}]*)\}',
      multiLine: true,
      dotAll: true,
    );
    
    // Match: type Name = { ... }
    final typeRegex = RegExp(
      r'type\s+(\w+)\s*=\s*\{([^}]*)\}',
      multiLine: true,
      dotAll: true,
    );
    
    // Extract interfaces
    for (final match in interfaceRegex.allMatches(content)) {
      final name = match.group(1)!;
      final extendsType = match.group(2);
      final body = match.group(3)!;
      
      final properties = _parseTypeProperties(body);
      
      types.add(TypeDefinition(
        name: name,
        kind: TypeKind.interface,
        properties: properties,
        extendsType: extendsType,
      ));
    }
    
    // Extract type aliases
    for (final match in typeRegex.allMatches(content)) {
      final name = match.group(1)!;
      final body = match.group(2)!;
      
      final properties = _parseTypeProperties(body);
      
      types.add(TypeDefinition(
        name: name,
        kind: TypeKind.type,
        properties: properties,
      ));
    }
    
    return types;
  }
  
  /// Parse properties from type body
  Map<String, String> _parseTypeProperties(String body) {
    final properties = <String, String>{};
    
    // Match: propertyName: type or propertyName?: type
    final propertyRegex = RegExp(
      r'(\w+)\??:\s*([^;,\n]+)',
      multiLine: true,
    );
    
    for (final match in propertyRegex.allMatches(body)) {
      final name = match.group(1)!;
      final type = match.group(2)!.trim();
      properties[name] = type;
    }
    
    return properties;
  }
  
  /// Extract constants
  Future<List<ConstantDefinition>> _extractConstants(String content) async {
    final constants = <ConstantDefinition>[];
    
    // Match: const NAME = value
    final constRegex = RegExp(
      r'const\s+(\w+)(?::\s*([^=]+))?\s*=\s*([^;]+)',
      multiLine: true,
    );
    
    for (final match in constRegex.allMatches(content)) {
      final name = match.group(1)!;
      final type = match.group(2)?.trim();
      final value = match.group(3)?.trim();
      
      constants.add(ConstantDefinition(
        name: name,
        type: type ?? 'unknown',
        value: value,
      ));
    }
    
    return constants;
  }
  
  /// Extract helper functions
  Future<List<FunctionDefinition>> _extractHelpers(String content) async {
    final functions = <FunctionDefinition>[];
    
    // Match: function name(...) { ... }
    final functionRegex = RegExp(
      r'(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?::\s*([^{]+))?\s*\{',
      multiLine: true,
    );
    
    // Match: const name = (...) => { ... }
    final arrowFunctionRegex = RegExp(
      r'const\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)(?::\s*([^=]+))?\s*=>',
      multiLine: true,
    );
    
    // Extract regular functions
    for (final match in functionRegex.allMatches(content)) {
      final isAsync = content.substring(
        match.start,
        match.end,
      ).contains('async');
      
      functions.add(FunctionDefinition(
        name: match.group(1)!,
        parameters: _parseParameters(match.group(2) ?? ''),
        returnType: match.group(3)?.trim(),
        isAsync: isAsync,
      ));
    }
    
    // Extract arrow functions
    for (final match in arrowFunctionRegex.allMatches(content)) {
      final isAsync = content.substring(
        match.start,
        match.end,
      ).contains('async');
      
      functions.add(FunctionDefinition(
        name: match.group(1)!,
        parameters: _parseParameters(match.group(2) ?? ''),
        returnType: match.group(3)?.trim(),
        isAsync: isAsync,
      ));
    }
    
    return functions;
  }
  
  /// Parse function parameters
  List<FunctionParameter> _parseParameters(String params) {
    if (params.trim().isEmpty) return [];
    
    final parameters = <FunctionParameter>[];
    
    for (final param in params.split(',')) {
      final trimmed = param.trim();
      if (trimmed.isEmpty) continue;
      
      // Match: name: type = default or name?: type
      final paramRegex = RegExp(r'(\w+)(\?)?(?::\s*([^=]+))?(?:\s*=\s*(.+))?');
      final match = paramRegex.firstMatch(trimmed);
      
      if (match != null) {
        parameters.add(FunctionParameter(
          name: match.group(1)!,
          type: match.group(3)?.trim(),
          defaultValue: match.group(4)?.trim(),
          isOptional: match.group(2) == '?' || match.group(4) != null,
        ));
      }
    }
    
    return parameters;
  }
  
  /// Detect state management pattern
  Future<StateManagementPattern> _detectStateManagement(
    String content,
    List<ImportStatement> imports,
    List<String> hooks,
  ) async {
    // Check for Redux
    if (imports.any((i) => i.source.contains('redux') || 
                           i.source.contains('react-redux'))) {
      return StateManagementPattern.redux;
    }
    
    // Check for Zustand
    if (imports.any((i) => i.source.contains('zustand'))) {
      return StateManagementPattern.zustand;
    }
    
    // Check for MobX
    if (imports.any((i) => i.source.contains('mobx'))) {
      return StateManagementPattern.mobx;
    }
    
    // Check for Recoil
    if (imports.any((i) => i.source.contains('recoil'))) {
      return StateManagementPattern.recoil;
    }
    
    // Check for Context
    if (hooks.contains('useContext') || 
        content.contains('createContext')) {
      return StateManagementPattern.context;
    }
    
    // Default to useState
    return StateManagementPattern.useState;
  }
  
  /// Extract child components used
  Future<List<String>> _extractChildComponents(String content) async {
    final children = <String>[];
    
    // Match JSX components: <ComponentName ...>
    final componentRegex = RegExp(
      r'<([A-Z]\w+)',
      multiLine: true,
    );
    
    for (final match in componentRegex.allMatches(content)) {
      final componentName = match.group(1)!;
      if (!children.contains(componentName)) {
        children.add(componentName);
      }
    }
    
    return children;
  }
  
  /// Generate component description
  Future<String?> _generateDescription(
    ReactComponent component,
    List<StateVariable> stateVariables,
    List<ApiEndpoint> apiEndpoints,
  ) async {
    final parts = <String>[];
    
    // Add basic description
    parts.add('${component.type.name.capitalize()} component');
    
    // Add state info
    if (stateVariables.isNotEmpty) {
      parts.add('with ${stateVariables.length} state variable(s)');
    }
    
    // Add API info
    if (apiEndpoints.isNotEmpty) {
      parts.add('calling ${apiEndpoints.length} API endpoint(s)');
    }
    
    // Add state management info
    if (component.stateManagement != StateManagementPattern.useState) {
      parts.add('using ${component.stateManagement.name}');
    }
    
    return parts.join(', ');
  }
  
  // Helper methods
  
  FileType _detectFileType(String fileName) {
    if (fileName.endsWith('.tsx')) return FileType.tsx;
    if (fileName.endsWith('.ts')) return FileType.ts;
    if (fileName.endsWith('.jsx')) return FileType.jsx;
    if (fileName.endsWith('.js')) return FileType.js;
    return FileType.unknown;
  }
  
  bool _isReactFile(String filePath) {
    return filePath.endsWith('.tsx') ||
           filePath.endsWith('.jsx') ||
           filePath.endsWith('.ts') ||
           filePath.endsWith('.js');
  }
  
  bool _shouldExclude(String filePath, List<String> excludePaths) {
    // Always exclude node_modules and build directories
    if (filePath.contains('node_modules') ||
        filePath.contains('build/') ||
        filePath.contains('dist/') ||
        filePath.contains('.next/')) {
      return true;
    }
    
    // Check custom exclusions
    for (final exclude in excludePaths) {
      if (filePath.contains(exclude)) {
        return true;
      }
    }
    
    return false;
  }
}

enum FileType {
  tsx,
  ts,
  jsx,
  js,
  unknown,
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
```

---

## 🎨 **Step 3: Component Extractor**

```dart
// 📁 lib/parsers/extractors/component_extractor.dart

import '../../models/react_component.dart';
import '../models/parsed_react_code.dart';
import '../react_parser.dart';

/// Extracts React components from source code
class ComponentExtractor {
  /// Extract all components from content
  Future<List<ReactComponent>> extract(
    String content,
    String filePath,
    FileType fileType,
  ) async {
    final components = <ReactComponent>[];
    
    // Extract function components
    components.addAll(await _extractFunctionComponents(content, filePath));
    
    // Extract class components
    components.addAll(await _extractClassComponents(content, filePath));
    
    // Extract HOCs (Higher-Order Components)
    components.addAll(await _extractHOCs(content, filePath));
    
    return components;
  }
  
  /// Extract function components
  Future<List<ReactComponent>> _extractFunctionComponents(
    String content,
    String filePath,
  ) async {
    final components = <ReactComponent>[];
    
    // Pattern 1: export default function ComponentName() { ... }
    // Pattern 2: export function ComponentName() { ... }
    // Pattern 3: const ComponentName = () => { ... }
    // Pattern 4: function ComponentName() { ... }
    
    final patterns = [
      // export default function ComponentName(props) { ... }
      RegExp(
        r'export\s+default\s+function\s+([A-Z]\w+)\s*\(([^)]*)\)',
        multiLine: true,
      ),
      // export function ComponentName(props) { ... }
      RegExp(
        r'export\s+function\s+([A-Z]\w+)\s*\(([^)]*)\)',
        multiLine: true,
      ),
      // const ComponentName = (props) => { ... }
      RegExp(
        r'(?:export\s+)?const\s+([A-Z]\w+)\s*=\s*\(([^)]*)\)\s*=>',
        multiLine: true,
      ),
      // function ComponentName(props) { ... }
      RegExp(
        r'function\s+([A-Z]\w+)\s*\(([^)]*)\)',
        multiLine: true,
      ),
    ];
    
    for (final pattern in patterns) {
      for (final match in pattern.allMatches(content)) {
        final componentName = match.group(1)!;
        final propsString = match.group(2) ?? '';
        
        // Verify it's actually a React component (returns JSX)
        if (await _isReactComponent(content, componentName)) {
          final feature = _extractFeatureName(filePath);
          final type = _determineComponentType(componentName, content);
          
          components.add(ReactComponent(
            filePath: filePath,
            componentName: componentName,
            feature: feature,
            type: type,
            stateManagement: StateManagementPattern.useState, // Default
          ));
        }
      }
    }
    
    return components;
  }
  
  /// Extract class components
  Future<List<ReactComponent>> _extractClassComponents(
    String content,
    String filePath,
  ) async {
    final components = <ReactComponent>[];
    
    // Match: class ComponentName extends React.Component { ... }
    final classComponentRegex = RegExp(
      r'class\s+([A-Z]\w+)\s+extends\s+(?:React\.)?(?:Component|PureComponent)',
      multiLine: true,
    );
    
    for (final match in classComponentRegex.allMatches(content)) {
      final componentName = match.group(1)!;
      final feature = _extractFeatureName(filePath);
      
      components.add(ReactComponent(
        filePath: filePath,
        componentName: componentName,
        feature: feature,
        type: ComponentType.page, // Class components usually pages
        stateManagement: StateManagementPattern.useState,
      ));
    }
    
    return components;
  }
  
  /// Extract Higher-Order Components
  Future<List<ReactComponent>> _extractHOCs(
    String content,
    String filePath,
  ) async {
    final components = <ReactComponent>[];
    
    // Match: const withSomething = (Component) => { ... }
    final hocRegex = RegExp(
      r'const\s+(with[A-Z]\w+)\s*=\s*\(([^)]+)\)\s*=>',
      multiLine: true,
    );
    
    for (final match in hocRegex.allMatches(content)) {
      final componentName = match.group(1)!;
      final feature = _extractFeatureName(filePath);
      
      components.add(ReactComponent(
        filePath: filePath,
        componentName: componentName,
        feature: feature,
        type: ComponentType.hoc,
        stateManagement: StateManagementPattern.useState,
      ));
    }
    
    return components;
  }
  
  /// Check if function is actually a React component
  Future<bool> _isReactComponent(String content, String componentName) async {
    // Find the component function body
    final componentRegex = RegExp(
      r'(?:function|const)\s+' +
      RegExp.escape(componentName) +
      r'[^{]*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}',
      multiLine: true,
      dotAll: true,
    );
    
    final match = componentRegex.firstMatch(content);
    if (match == null) return false;
    
    final body = match.group(1) ?? '';
    
    // Check for JSX return
    return body.contains('return') && 
           (body.contains('<') && body.contains('>'));
  }
  
  /// Extract feature name from file path
  String _extractFeatureName(String filePath) {
    // Example: src/features/auth/Login.tsx → auth
    // Example: src/components/user/Profile.tsx → user_profile
    
    final parts = filePath.split('/');
    
    // Look for 'features' directory
    final featuresIndex = parts.indexOf('features');
    if (featuresIndex != -1 && featuresIndex < parts.length - 1) {
      return parts[featuresIndex + 1];
    }
    
    // Look for 'components' directory
    final componentsIndex = parts.indexOf('components');
    if (componentsIndex != -1 && componentsIndex < parts.length - 1) {
      final category = parts[componentsIndex + 1];
      final fileName = parts.last.split('.').first;
      return '${category}_$fileName'.toLowerCase();
    }
    
    // Fallback to file name
    return parts.last.split('.').first.toLowerCase();
  }
  
  /// Determine component type
  ComponentType _determineComponentType(String name, String content) {
    // Check if it's a page (common suffixes)
    if (name.endsWith('Page') || 
        name.endsWith('Screen') || 
        name.endsWith('View')) {
      return ComponentType.page;
    }
    
    // Check if it's a hook (starts with 'use')
    if (name.startsWith('use')) {
      return ComponentType.hook;
    }
    
    // Check if it's a context provider
    if (name.contains('Provider') || name.contains('Context')) {
      return ComponentType.context;
    }
    
    // Check if it's an HOC (starts with 'with')
    if (name.startsWith('with')) {
      return ComponentType.hoc;
    }
    
    // Default to widget
    return ComponentType.widget;
  }
}
```

---

## 🔍 **Step 4: Props Extractor**

```dart
// 📁 lib/parsers/extractors/props_extractor.dart

import '../../models/react_component.dart';
import '../models/parsed_react_code.dart';

/// Extracts component props/parameters
class PropsExtractor {
  /// Extract props from component
  Future<List<ComponentProp>> extract(
    ReactComponent component,
    String content,
    List<TypeDefinition> types,
  ) async {
    final props = <ComponentProp>[];
    
    // Strategy 1: Extract from TypeScript interface/type
    final propsType = await _findPropsType(component, content, types);
    if (propsType != null) {
      props.addAll(_extractFromType(propsType));
    }
    
    // Strategy 2: Extract from function parameters destructuring
    final destructuredProps = await _extractFromDestructuring(
      component,
      content,
    );
    props.addAll(destructuredProps);
    
    // Strategy 3: Extract from PropTypes (for JS files)
    final propTypesProps = await _extractFromPropTypes(component, content);
    props.addAll(propTypesProps);
    
    // Remove duplicates
    return _deduplicateProps(props);
  }
  
  /// Find props type definition
  Future<TypeDefinition?> _findPropsType(
    ReactComponent component,
    String content,
    List<TypeDefinition> types,
  ) async {
    // Look for: ComponentName<PropsType>
    final genericPropsRegex = RegExp(
      '${RegExp.escape(component.componentName)}<([^>]+)>',
    );
    
    final match = genericPropsRegex.firstMatch(content);
    if (match != null) {
      final typeName = match.group(1)!.trim();
      return types.firstWhere(
        (t) => t.name == typeName,
        orElse: () => throw StateError('Type not found'),
      );
    }
    
    // Look for: function ComponentName(props: PropsType)
    final propsTypeRegex = RegExp(
      r'function\s+' +
      RegExp.escape(component.componentName) +
      r'\s*\(\s*(?:\{[^}]+\}|props)\s*:\s*([^)]+)\)',
    );
    
    final propsMatch = propsTypeRegex.firstMatch(content);
    if (propsMatch != null) {
      final typeName = propsMatch.group(1)!.trim();
      return types.firstWhere(
        (t) => t.name == typeName,
        orElse: () => throw StateError('Type not found'),
      );
    }
    
    return null;
  }
  
  /// Extract props from type definition
  List<ComponentProp> _extractFromType(TypeDefinition type) {
    final props = <ComponentProp>[];
    
    for (final entry in type.properties.entries) {
      final name = entry.key;
      final typeString = entry.value;
      
      // Check if optional (ends with ?)
      final isRequired = !typeString.endsWith('?');
      final cleanType = typeString.replaceAll('?', '').trim();
      
      props.add(ComponentProp(
        name: name,
        type: cleanType,
        isRequired: isRequired,
      ));
    }
    
    return props;
  }
  
  /// Extract from parameter destructuring
  Future<List<ComponentProp>> _extractFromDestructuring(
    ReactComponent component,
    String content,
  ) async {
    final props = <ComponentProp>[];
    
    // Match: ({ prop1, prop2, prop3 = 'default' }) =>
    final destructureRegex = RegExp(
      r'(?:function\s+' +
      RegExp.escape(component.componentName) +
      r'|const\s+' +
      RegExp.escape(component.componentName) +
      r'\s*=\s*)' +
      r'\s*\(\s*\{([^}]+)\}\s*\)',
      multiLine: true,
    );
    
    final match = destructureRegex.firstMatch(content);
    if (match != null) {
      final propsString = match.group(1)!;
      
      // Split by comma and parse each prop
      for (final prop in propsString.split(',')) {
        final trimmed = prop.trim();
        if (trimmed.isEmpty) continue;
        
        // Match: propName = defaultValue or propName: alias
        final propRegex = RegExp(r'(\w+)(?:\s*:\s*(\w+))?(?:\s*=\s*(.+))?');
        final propMatch = propRegex.firstMatch(trimmed);
        
        if (propMatch != null) {
          final name = propMatch.group(1)!;
          final defaultValue = propMatch.group(3);
          
          props.add(ComponentProp(
            name: name,
            type: 'unknown', // Type inference would be needed
            isRequired: defaultValue == null,
            defaultValue: defaultValue,
          ));
        }
      }
    }
    
    return props;
  }
  
  /// Extract from PropTypes (for JavaScript)
  Future<List<ComponentProp>> _extractFromPropTypes(
    ReactComponent component,
    String content,
  ) async {
    final props = <ComponentProp>[];
    
    // Match: ComponentName.propTypes = { ... }
    final propTypesRegex = RegExp(
      RegExp.escape(component.componentName) +
      r'\.propTypes\s*=\s*\{([^}]+)\}',
      multiLine: true,
      dotAll: true,
    );
    
    final match = propTypesRegex.firstMatch(content);
    if (match != null) {
      final propTypesString = match.group(1)!;
      
      // Match: propName: PropTypes.type.isRequired
      final propRegex = RegExp(
        r'(\w+)\s*:\s*PropTypes\.(\w+)(\.isRequired)?',
        multiLine: true,
      );
      
      for (final propMatch in propRegex.allMatches(propTypesString)) {
        final name = propMatch.group(1)!;
        final type = propMatch.group(2)!;
        final isRequired = propMatch.group(3) != null;
        
        props.add(ComponentProp(
          name: name,
          type: _mapPropTypeToTypeScript(type),
          isRequired: isRequired,
        ));
      }
    }
    
    return props;
  }
  
  /// Map PropTypes to TypeScript types
  String _mapPropTypeToTypeScript(String propType) {
    const mapping = {
      'string': 'string',
      'number': 'number',
      'bool': 'boolean',
      'func': 'function',
      'array': 'any[]',
      'object': 'object',
      'node': 'React.ReactNode',
      'element': 'React.ReactElement',
      'any': 'any',
    };
    
    return mapping[propType] ?? 'unknown';
  }
  
  /// Remove duplicate props
  List<ComponentProp> _deduplicateProps(List<ComponentProp> props) {
    final seen = <String>{};
    final unique = <ComponentProp>[];
    
    for (final prop in props) {
      if (!seen.contains(prop.name)) {
        seen.add(prop.name);
        unique.add(prop);
      }
    }
    
    return unique;
  }
}
```

---

## 📊 **Step 5: State Extractor**

```dart
// 📁 lib/parsers/extractors/state_extractor.dart

import '../../models/react_component.dart';

/// Extracts state variables from components
class StateExtractor {
  /// Extract state variables
  Future<List<StateVariable>> extract(
    ReactComponent component,
    String content,
  ) async {
    final stateVariables = <StateVariable>[];
    
    // Extract from useState hooks
    stateVariables.addAll(await _extractUseState(content));
    
    // Extract from useReducer
    stateVariables.addAll(await _extractUseReducer(content));
    
    // Extract from class component state
    stateVariables.addAll(await _extractClassState(component, content));
    
    return stateVariables;
  }
  
  /// Extract useState declarations
  Future<List<StateVariable>> _extractUseState(String content) async {
    final variables = <StateVariable>[];
    
    // Match: const [state, setState] = useState(initialValue)
    final useStateRegex = RegExp(
      r'const\s*\[\s*(\w+)\s*,\s*\w+\s*\]\s*=\s*useState(?:<([^>]+)>)?\s*\(([^)]*)\)',
      multiLine: true,
    );
    
    for (final match in useStateRegex.allMatches(content)) {
      final name = match.group(1)!;
      final type = match.group(2)?.trim() ?? 'unknown';
      final initialValue = match.group(3)?.trim();
      
      variables.add(StateVariable(
        name: name,
        type: type,
        initialValue: initialValue,
      ));
    }
    
    return variables;
  }
  
  /// Extract useReducer state
  Future<List<StateVariable>> _extractUseReducer(String content) async {
    final variables = <StateVariable>[];
    
    // Match: const [state, dispatch] = useReducer(reducer, initialState)
    final useReducerRegex = RegExp(
      r'const\s*\[\s*(\w+)\s*,\s*\w+\s*\]\s*=\s*useReducer\s*\([^,]+,\s*([^)]+)\)',
      multiLine: true,
    );
    
    for (final match in useReducerRegex.allMatches(content)) {
      final name = match.group(1)!;
      final initialValue = match.group(2)?.trim();
      
      variables.add(StateVariable(
        name: name,
        type: 'ReducerState',
        initialValue: initialValue,
      ));
    }
    
    return variables;
  }
  
  /// Extract class component state
  Future<List<StateVariable>> _extractClassState(
    ReactComponent component,
    String content,
  ) async {
    final variables = <StateVariable>[];
    
    // Match: state = { ... } or this.state = { ... }
    final stateRegex = RegExp(
      r'(?:this\.)?state\s*=\s*\{([^}]+)\}',
      multiLine: true,
    );
    
    final match = stateRegex.firstMatch(content);
    if (match != null) {
      final stateBody = match.group(1)!;
      
      // Parse state properties
      final propertyRegex = RegExp(
        r'(\w+)\s*:\s*([^,\n]+)',
        multiLine: true,
      );
      
      for (final propMatch in propertyRegex.allMatches(stateBody)) {
        final name = propMatch.group(1)!;
        final initialValue = propMatch.group(2)!.trim();
        
        variables.add(StateVariable(
          name: name,
          type: _inferType(initialValue),
          initialValue: initialValue,
        ));
      }
    }
    
    return variables;
  }
  
  /// Infer type from initial value
  String _inferType(String value) {
    if (value == 'null' || value == 'undefined') return 'any';
    if (value == 'true' || value == 'false') return 'boolean';
    if (RegExp(r'^\d+$').hasMatch(value)) return 'number';
    if (value.startsWith('"') || value.startsWith("'")) return 'string';
    if (value.startsWith('[')) return 'array';
    if (value.startsWith('{')) return 'object';
    return 'unknown';
  }
}
```

---

## 🌐 **Step 6: API Extractor**

```dart
// 📁 lib/parsers/extractors/api_extractor.dart

import '../../models/react_component.dart';

/// Extracts API calls from components
class ApiExtractor {
  /// Extract API endpoints
  Future<List<ApiEndpoint>> extract(
    ReactComponent component,
    String content,
  ) async {
    final endpoints = <ApiEndpoint>[];
    
    // Extract from fetch calls
    endpoints.addAll(await _extractFetch(content));
    
    // Extract from axios calls
    endpoints.addAll(await _extractAxios(content));
    
    // Extract from custom API client
    endpoints.addAll(await _extractCustomClient(content));
    
    return _deduplicateEndpoints(endpoints);
  }
  
  /// Extract fetch() calls
  Future<List<ApiEndpoint>> _extractFetch(String content) async {
    final endpoints = <ApiEndpoint>[];
    
    // Match: fetch('/api/endpoint', { method: 'POST', ... })
    // Match: fetch(`/api/${id}`, ...)
    final fetchRegex = RegExp(
      r'fetch\s*\(\s*[`\'"]([^`\'"]+)[`\'"](?:\s*,\s*\{[^}]*method\s*:\s*[\'"](\w+)[\'"][^}]*\})?',
      multiLine: true,
    );
    
    for (final match in fetchRegex.allMatches(content)) {
      final path = match.group(1)!;
      final method = match.group(2) ?? 'GET';
      
      endpoints.add(ApiEndpoint(
        method: method.toUpperCase(),
        path: _normalizePath(path),
      ));
    }
    
    return endpoints;
  }
  
  /// Extract axios calls
  Future<List<ApiEndpoint>> _extractAxios(String content) async {
    final endpoints = <ApiEndpoint>[];
    
    // Match various axios patterns:
    // axios.get('/api/endpoint')
    // axios.post('/api/endpoint', data)
    // axios({ method: 'GET', url: '/api/endpoint' })
    
    // Pattern 1: axios.method()
    final methodRegex = RegExp(
      r'axios\.(get|post|put|patch|delete)\s*\(\s*[`\'"]([^`\'"]+)[`\'"]',
      multiLine: true,
    );
    
    for (final match in methodRegex.allMatches(content)) {
      final method = match.group(1)!.toUpperCase();
      final path = match.group(2)!;
      
      endpoints.add(ApiEndpoint(
        method: method,
        path: _normalizePath(path),
      ));
    }
    
    // Pattern 2: axios(config)
    final configRegex = RegExp(
      r'axios\s*\(\s*\{[^}]*method\s*:\s*[\'"](\w+)[\'"][^}]*url\s*:\s*[`\'"]([^`\'"]+)[`\'"]',
      multiLine: true,
      dotAll: true,
    );
    
    for (final match in configRegex.allMatches(content)) {
      final method = match.group(1)!.toUpperCase();
      final path = match.group(2)!;
      
      endpoints.add(ApiEndpoint(
        method: method,
        path: _normalizePath(path),
      ));
    }
    
    return endpoints;
  }
  
  /// Extract custom API client calls
  Future<List<ApiEndpoint>> _extractCustomClient(String content) async {
    final endpoints = <ApiEndpoint>[];
    
    // Match: api.users.getById(id) or apiClient.get('/users/:id')
    final customRegex = RegExp(
      r'(?:api|apiClient|client)\.(get|post|put|patch|delete)\s*\(\s*[`\'"]([^`\'"]+)[`\'"]',
      multiLine: true,
    );
    
    for (final match in customRegex.allMatches(content)) {
      final method = match.group(1)!.toUpperCase();
      final path = match.group(2)!;
      
      endpoints.add(ApiEndpoint(
        method: method,
        path: _normalizePath(path),
      ));
    }
    
    return endpoints;
  }
  
  /// Normalize API path (convert template literals to params)
  String _normalizePath(String path) {
    // Convert ${variable} to :variable
    return path.replaceAllMapped(
      RegExp(r'\$\{(\w+)\}'),
      (match) => ':${match.group(1)}',
    );
  }
  
  /// Remove duplicate endpoints
  List<ApiEndpoint> _deduplicateEndpoints(List<ApiEndpoint> endpoints) {
    final seen = <String>{};
    final unique = <ApiEndpoint>[];
    
    for (final endpoint in endpoints) {
      final key = '${endpoint.method}:${endpoint.path}';
      if (!seen.contains(key)) {
        seen.add(key);
        unique.add(endpoint);
      }
    }
    
    return unique;
  }
}
```

---

## 🪝 **Step 7: Hooks Extractor**

```dart
// 📁 lib/parsers/extractors/hooks_extractor.dart

import '../../models/react_component.dart';

/// Extracts React hooks usage
class HooksExtractor {
  /// Extract hooks used in component
  Future<List<String>> extract(
    ReactComponent component,
    String content,
  ) async {
    final hooks = <String>{};
    
    // Common React hooks
    final reactHooks = [
      'useState',
      'useEffect',
      'useContext',
      'useReducer',
      'useCallback',
      'useMemo',
      'useRef',
      'useImperativeHandle',
      'useLayoutEffect',
      'useDebugValue',
      'useDeferredValue',
      'useTransition',
      'useId',
    ];
    
    for (final hook in reactHooks) {
      if (content.contains(RegExp('\\b$hook\\s*\\('))) {
        hooks.add(hook);
      }
    }
    
    // Custom hooks (start with 'use')
    final customHookRegex = RegExp(
      r'\b(use[A-Z]\w+)\s*\(',
      multiLine: true,
    );
    
    for (final match in customHookRegex.allMatches(content)) {
      final hookName = match.group(1)!;
      if (!reactHooks.contains(hookName)) {
        hooks.add(hookName);
      }
    }
    
    return hooks.toList();
  }
}
```

---

## 🔴 **Step 8: Redux Extractor**

```dart
// 📁 lib/parsers/extractors/redux_extractor.dart

/// Extracts Redux usage patterns
class ReduxExtractor {
  /// Extract Redux selectors
  Future<List<String>> extractSelectors(String content) async {
    final selectors = <String>[];
    
    // Match: useSelector(selectSomething)
    // Match: useSelector(state => state.feature.property)
    final useSelectorRegex = RegExp(
      r'useSelector\s*\(\s*(\w+|state\s*=>\s*[^\)]+)\s*\)',
      multiLine: true,
    );
    
    for (final match in useSelectorRegex.allMatches(content)) {
      selectors.add(match.group(1)!);
    }
    
    return selectors;
  }
  
  /// Extract Redux actions
  Future<List<String>> extractActions(String content) async {
    final actions = <String>[];
    
    // Match: dispatch(actionName(...))
    final dispatchRegex = RegExp(
      r'dispatch\s*\(\s*(\w+)\s*\(',
      multiLine: true,
    );
    
    for (final match in dispatchRegex.allMatches(content)) {
      actions.add(match.group(1)!);
    }
    
    return actions;
  }
}
```

---

## 📊 **Step 9: Complexity Analyzer**

```dart
// 📁 lib/parsers/analyzers/complexity_analyzer.dart

import '../../models/react_component.dart';
import '../models/parsed_react_code.dart';

/// Analyzes code complexity
class ComplexityAnalyzer {
  /// Analyze complexity metrics
  Future<ComplexityMetrics> analyze(
    String content,
    List<ReactComponent> components,
  ) async {
    return ComplexityMetrics(
      linesOfCode: _countLines(content),
      cyclomaticComplexity: _calculateCyclomaticComplexity(content),
      numberOfHooks: _countHooks(content),
      numberOfApiCalls: _countApiCalls(content),
      stateVariablesCount: _countStateVariables(content),
      propsCount: components.isEmpty ? 0 : components.first.props.length,
      usesRedux: content.contains('useSelector') || 
                 content.contains('useDispatch'),
      usesContext: content.contains('useContext'),
      hasAsyncOperations: content.contains('async') || 
                          content.contains('await'),
    );
  }
  
  int _countLines(String content) {
    return content.split('\n').where((line) => line.trim().isNotEmpty).length;
  }
  
  int _calculateCyclomaticComplexity(String content) {
    // Simplified cyclomatic complexity
    // Count decision points: if, for, while, case, &&, ||, ?
    int complexity = 1; // Base complexity
    
    complexity += 'if '.allMatches(content).length;
    complexity += 'for '.allMatches(content).length;
    complexity += 'while '.allMatches(content).length;
    complexity += RegExp(r'case\s+').allMatches(content).length;
    complexity += '&&'.allMatches(content).length;
    complexity += '||'.allMatches(content).length;
    complexity += '?'.allMatches(content).length;
    
    return complexity;
  }
  
  int _countHooks(String content) {
    return RegExp(r'\buse[A-Z]\w*\s*\(').allMatches(content).length;
  }
  
  int _countApiCalls(String content) {
    int count = 0;
    count += 'fetch('.allMatches(content).length;
    count += RegExp(r'axios\.(?:get|post|put|delete)').allMatches(content).length;
    return count;
  }
  
  int _countStateVariables(String content) {
    return 'useState('.allMatches(content).length +
           'useReducer('.allMatches(content).length;
  }
}
```

---

## 📦 **Step 10: Dependency Analyzer**

```dart
// 📁 lib/parsers/analyzers/dependency_analyzer.dart

import '../models/parsed_react_code.dart';

/// Analyzes npm dependencies
class DependencyAnalyzer {
  /// Extract npm packages from imports
  Future<List<String>> analyze(List<ImportStatement> imports) async {
    final dependencies = <String>{};
    
    for (final import in imports) {
      final source = import.source;
      
      // Skip relative imports
      if (source.startsWith('.') || source.startsWith('/')) {
        continue;
      }
      
      // Extract package name
      // Examples: 'react', '@mui/material', 'lodash/debounce'
      final parts = source.split('/');
      
      if (source.startsWith('@')) {
        // Scoped package: @scope/package
        if (parts.length >= 2) {
          dependencies.add('${parts[0]}/${parts[1]}');
        }
      } else {
        // Regular package
        dependencies.add(parts[0]);
      }
    }
    
    return dependencies.toList()..sort();
  }
}
```

---

## 📱 **Step 11: Responsive Analyzer**

```dart
// 📁 lib/parsers/analyzers/responsive_analyzer.dart

/// Analyzes responsive design patterns
class ResponsiveAnalyzer {
  /// Check if component uses responsive design
  Future<bool> isResponsive(String content) async {
    // Check for media queries
    if (content.contains('@media')) return true;
    
    // Check for responsive hooks/libraries
    final responsivePatterns = [
      'useMediaQuery',
      'useBreakpoint',
      'useWindowSize',
      'useViewport',
      'matchMedia',
      'window.innerWidth',
      'window.innerHeight',
      'breakpoint',
    ];
    
    for (final pattern in responsivePatterns) {
      if (content.contains(pattern)) return true;
    }
    
    // Check for responsive UI libraries
    final responsiveLibraries = [
      '@mui/material/useMediaQuery',
      'react-responsive',
      'react-breakpoints',
    ];
    
    for (final lib in responsiveLibraries) {
      if (content.contains(lib)) return true;
    }
    
    return false;
  }
}
```

---

## 🎯 **Step 12: CLI Command**

```dart
// 📁 lib/cli/commands/parse_react.dart

import 'dart:io';
import 'dart:convert';
import 'package:args/command_runner.dart';
import '../../parsers/react_parser.dart';
import '../../models/react_component.dart';

class ParseReactCommand extends Command {
  @override
  final name = 'parse';
  
  @override
  final description = 'Parse React code to extract components';
  
  ParseReactCommand() {
    argParser
      ..addOption(
        'input',
        abbr: 'i',
        help: 'Input file or directory',
        mandatory: true,
      )
      ..addOption(
        'output',
        abbr: 'o',
        help: 'Output JSON file',
      )
      ..addFlag(
        'recursive',
        abbr: 'r',
        help: 'Parse directory recursively',
        defaultsTo: true,
      )
      ..addMultiOption(
        'exclude',
        abbr: 'e',
        help: 'Paths to exclude',
        defaultsTo: ['node_modules', 'build', 'dist'],
      )
      ..addFlag(
        'verbose',
        abbr: 'v',
        help: 'Verbose output',
      );
  }
  
  @override
  Future<void> run() async {
    final inputPath = argResults!['input'] as String;
    final outputPath = argResults!['output'] as String?;
    final recursive = argResults!['recursive'] as bool;
    final excludePaths = argResults!['exclude'] as List<String>;
    final verbose = argResults!['verbose'] as bool;
    
    final parser = ReactParser();
    
    // Check if input is file or directory
    final inputEntity = FileSystemEntity.typeSync(inputPath);
    
    if (inputEntity == FileSystemEntityType.file) {
      // Parse single file
      final result = await parser.parseFile(inputPath);
      _printResults([result], verbose);
      
      if (outputPath != null) {
        await _saveToFile(outputPath, [result]);
      }
    } else if (inputEntity == FileSystemEntityType.directory) {
      // Parse directory
      final results = await parser.parseDirectory(
        inputPath,
        recursive: recursive,
        excludePaths: excludePaths,
      );
      
      _printResults(results, verbose);
      
      if (outputPath != null) {
        await _saveToFile(outputPath, results);
      }
    } else {
      print('❌ Input not found: $inputPath');
      exit(1);
    }
  }
  
  void _printResults(List<dynamic> results, bool verbose) {
    print('\n📊 Parse Results:\n');
    
    int totalComponents = 0;
    int totalApis = 0;
    int totalHooks = 0;
    
    for (final result in results) {
      totalComponents += result.components.length;
      
      for (final component in result.components) {
        print('📦 ${component.componentName}');
        print('   📁 ${component.filePath}');
        print('   🏷️  Feature: ${component.feature}');
        print('   🎨 Type: ${component.type.name}');
        print('   📊 Props: ${component.props.length}');
        print('   📌 State: ${component.stateVariables.length}');
        print('   🌐 APIs: ${component.apiEndpoints.length}');
        print('   🔧 State Management: ${component.stateManagement.name}');
        
        totalApis += component.apiEndpoints.length;
        totalHooks += result.complexity.numberOfHooks;
        
        if (verbose) {
          // Show detailed info
          if (component.props.isNotEmpty) {
            print('   Props:');
            for (final prop in component.props) {
              print('      - ${prop.name}: ${prop.type}${prop.isRequired ? " (required)" : ""}');
            }
          }
          
          if (component.apiEndpoints.isNotEmpty) {
            print('   API Endpoints:');
            for (final api in component.apiEndpoints) {
              print('      - ${api.method} ${api.path}');
            }
          }
        }
        
        print('');
      }
      
      if (result.warnings.isNotEmpty) {
        print('⚠️  Warnings:');
        for (final warning in result.warnings) {
          print('   ${warning.severity.name}: ${warning.message}');
        }
        print('');
      }
    }
    
    print('📈 Summary:');
    print('   Total Components: $totalComponents');
    print('   Total API Calls: $totalApis');
    print('   Total Hooks: $totalHooks');
  }
  
  Future<void> _saveToFile(
    String outputPath,
    List<dynamic> results,
  ) async {
    final json = jsonEncode({
      'components': results.expand((r) => r.components).map((c) {
        return {
          'componentName': c.componentName,
          'filePath': c.filePath,
          'feature': c.feature,
          'type': c.type.name,
          'stateManagement': c.stateManagement.name,
          'props': c.props.map((p) => {
            'name': p.name,
            'type': p.type,
            'isRequired': p.isRequired,
            'defaultValue': p.defaultValue,
          }).toList(),
          'stateVariables': c.stateVariables.map((s) => {
            'name': s.name,
            'type': s.type,
            'initialValue': s.initialValue,
          }).toList(),
          'apiEndpoints': c.apiEndpoints.map((a) => {
            'method': a.method,
            'path': a.path,
            'description': a.description,
          }).toList(),
          'isResponsive': c.isResponsive,
          'description': c.description,
        };
      }).toList(),
    });
    
    final file = File(outputPath);
    await file.writeAsString(json);
    
    print('💾 Saved to: $outputPath');
  }
}
```

---

## 🚀 **Step 13: Integration with Refactoring Generator**

```dart
// 📁 lib/cli/commands/auto_refactor.dart

import 'dart:io';
import 'dart:convert';
import 'package:args/command_runner.dart';
import '../../parsers/react_parser.dart';
import '../../generators/refactoring_generator.dart';
import '../../models/refactoring_config.dart';

/// Automated refactoring: parse React → generate Flutter
class AutoRefactorCommand extends Command {
  @override
  final name = 'auto-refactor';
  
  @override
  final description = 'Automatically parse React and generate Flutter code';
  
  AutoRefactorCommand() {
    argParser
      ..addOption(
        'react-path',
        help: 'Path to React source code',
        mandatory: true,
      )
      ..addOption(
        'flutter-path',
        help: 'Path to Flutter output',
        mandatory: true,
      )
      ..addOption(
        'project-name',
        help: 'Project name',
        mandatory: true,
      )
      ..addOption(
        'api-base-url',
        help: 'API base URL',
      )
      ..addMultiOption(
        'compliance',
        help: 'Compliance standards (hipaa, gdpr, pci-dss)',
        defaultsTo: [],
      );
  }
  
  @override
  Future<void> run() async {
    final reactPath = argResults!['react-path'] as String;
    final flutterPath = argResults!['flutter-path'] as String;
    final projectName = argResults!['project-name'] as String;
    final apiBaseUrl = argResults!['api-base-url'] as String?;
    final compliance = (argResults!['compliance'] as List<String>)
        .map((c) => _parseCompliance(c))
        .whereType<ComplianceStandard>()
        .toList();
    
    print('🚀 Starting automated React-to-Flutter refactoring...\n');
    
    // Step 1: Parse React code
    print('📖 Step 1: Parsing React code...');
    final parser = ReactParser();
    final results = await parser.parseDirectory(reactPath);
    
    final components = results
        .expand((r) => r.components)
        .toList();
    
    print('   ✓ Found ${components.length} components\n');
    
    // Step 2: Create refactoring config
    print('⚙️  Step 2: Creating configuration...');
    final config = RefactoringConfig(
      projectName: projectName,
      reactBasePath: reactPath,
      flutterBasePath: flutterPath,
      components: components,
      strategy: MigrationStrategy.incremental,
      complianceStandards: compliance,
      apiBaseUrl: apiBaseUrl,
    );
    
    // Save config for reference
    final configFile = File('$flutterPath/refactoring_config.json');
    await configFile.create(recursive: true);
    await configFile.writeAsString(
      JsonEncoder.withIndent('  ').convert(config.toJson()),
    );
    print('   ✓ Configuration saved\n');
    
    // Step 3: Generate Flutter code
    print('🏗️  Step 3: Generating Flutter code...');
    final generator = RefactoringGenerator(config);
    await generator.generateComplete();
    
    print('\n✅ Automated refactoring complete!');
    print('📁 Output: $flutterPath');
    print('\n📝 Next steps:');
    print('   1. cd $flutterPath');
    print('   2. flutter pub get');
    print('   3. dart run build_runner build --delete-conflicting-outputs');
    print('   4. flutter test');
    print('   5. Review docs/MIGRATION_PLAN.md');
  }
  
  ComplianceStandard? _parseCompliance(String value) {
    switch (value.toLowerCase()) {
      case 'hipaa':
        return ComplianceStandard.hipaa;
      case 'gdpr':
        return ComplianceStandard.gdpr;
      case 'pci-dss':
      case 'pcidss':
        return ComplianceStandard.pciDss;
      case 'sox':
        return ComplianceStandard.sox;
      case 'iso27001':
        return ComplianceStandard.iso27001;
      default:
        print('⚠️  Unknown compliance standard: $value');
        return null;
    }
  }
}
```

---

## 🎯 **Step 14: Update CLI Runner**

```dart
// 📁 bin/prprompts.dart

import 'package:args/command_runner.dart';
import 'package:prprompts_flutter_generator/cli/commands/generate_prd.dart';
import 'package:prprompts_flutter_generator/cli/commands/generate_refactoring.dart';
import 'package:prprompts_flutter_generator/cli/commands/parse_react.dart';
import 'package:prprompts_flutter_generator/cli/commands/auto_refactor.dart';

void main(List<String> arguments) async {
  final runner = CommandRunner(
    'prprompts',
    'Generate customized PRPROMPTS for Flutter projects',
  )
    ..addCommand(GeneratePRDCommand())
    ..addCommand(GenerateRefactoringCommand())
    ..addCommand(ParseReactCommand())      // 🆕 NEW
    ..addCommand(AutoRefactorCommand());   // 🆕 NEW
  
  try {
    await runner.run(arguments);
  } catch (e) {
    print('Error: $e');
  }
}
```

---

## 📖 **Usage Examples**

### **Example 1: Parse Single React File**

```bash
prprompts parse -i src/features/auth/Login.tsx -v
```

**Output:**
```
📦 LoginPage
   📁 src/features/auth/Login.tsx
   🏷️  Feature: auth
   🎨 Type: page
   📊 Props: 2
   📌 State: 3
   🌐 APIs: 2
   🔧 State Management: redux
   Props:
      - onSuccess: function
      - redirectTo: string
   API Endpoints:
      - POST /auth/login
      - GET /auth/me
```

---

### **Example 2: Parse Entire React App**

```bash
prprompts parse -i ./react-app/src -o components.json
```

**Output: components.json**
```json
{
  "components": [
    {
      "componentName": "LoginPage",
      "filePath": "src/features/auth/Login.tsx",
      "feature": "auth",
      "type": "page",
      "stateManagement": "redux",
      "props": [...],
      "apiEndpoints": [...]
    },
    ...
  ]
}
```

---

### **Example 3: Automated Refactoring**

```bash
prprompts auto-refactor \
  --react-path ./react-app/src \
  --flutter-path ./flutter-app \
  --project-name "My Flutter App" \
  --api-base-url "https://api.example.com" \
  --compliance hipaa gdpr
```

**Result:**
- Parses all React components
- Generates complete Flutter app
- Creates migration plan
- Sets up CI/CD

---

## 🧪 **Testing the Parser**

```dart
// 📁 test/parsers/react_parser_test.dart

import 'package:test/test.dart';
import 'package:prprompts_flutter_generator/parsers/react_parser.dart';

void main() {
  group('ReactParser', () {
    late ReactParser parser;
    
    setUp(() {
      parser = ReactParser();
    });
    
    test('should parse function component', () async {
      final content = '''
        import React, { useState } from 'react';
        
        export default function LoginPage() {
          const [email, setEmail] = useState('');
          const [password, setPassword] = useState('');
          
          const handleLogin = async () => {
            await fetch('/api/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email, password }),
            });
          };
          
          return (
            <div>
              <input value={email} onChange={e => setEmail(e.target.value)} />
              <input value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={handleLogin}>Login</button>
            </div>
          );
        }
      ''';
      
      final result = await parser._parseContent(
        content,
        'Login.tsx',
        FileType.tsx,
      );
      
      expect(result.components.length, equals(1));
      expect(result.components.first.componentName, equals('LoginPage'));
      expect(result.components.first.stateVariables.length, equals(2));
      expect(result.components.first.apiEndpoints.length, equals(1));
    });
  });
}
```

---

## ✅ **Final Implementation Checklist**

- [x] Core models (ParsedReactCode, etc.)
- [x] Main ReactParser orchestrator
- [x] Component extractor (function, class, HOC)
- [x] Props extractor (TypeScript, destructuring, PropTypes)
- [x] State extractor (useState, useReducer, class state)
- [x] API extractor (fetch, axios, custom clients)
- [x] Hooks extractor
- [x] Redux extractor
- [x] Complexity analyzer
- [x] Dependency analyzer
- [x] Responsive analyzer
- [x] CLI commands (parse, auto-refactor)
- [x] Integration with refactoring generator
- [x] Tests
- [x] Documentation

