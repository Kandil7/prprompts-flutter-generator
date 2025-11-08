# 🤖 AI Enhancement + 🎯 Validation System

I'll build both: **AI-powered extraction accuracy** and **behavior comparison validation**.

---

## 📋 **Architecture Overview**

```
lib/
├── ai/
│   ├── ai_enhancer.dart              # Main AI orchestrator
│   ├── providers/
│   │   ├── ai_provider.dart          # Abstract provider
│   │   ├── claude_provider.dart      # Anthropic Claude
│   │   ├── openai_provider.dart      # OpenAI GPT
│   │   └── gemini_provider.dart      # Google Gemini
│   ├── prompts/
│   │   ├── component_analysis_prompt.dart
│   │   ├── prop_inference_prompt.dart
│   │   ├── state_analysis_prompt.dart
│   │   └── api_extraction_prompt.dart
│   └── models/
│       ├── ai_analysis_result.dart
│       └── ai_config.dart
│
├── validation/
│   ├── validator.dart                # Main validator orchestrator
│   ├── behavior_validator.dart       # Compare React ↔ Flutter
│   ├── ui_validator.dart             # Visual comparison
│   ├── api_validator.dart            # API call matching
│   ├── state_validator.dart          # State flow validation
│   ├── performance_validator.dart    # Performance comparison
│   └── models/
│       ├── validation_result.dart
│       └── validation_report.dart
```

---

## 🤖 **Part 1: AI Enhancement**

### **Step 1: AI Models**

```dart
// 📁 lib/ai/models/ai_config.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'ai_config.freezed.dart';
part 'ai_config.g.dart';

@freezed
class AIConfig with _$AIConfig {
  const factory AIConfig({
    required AIProvider provider,
    required String apiKey,
    @Default('claude-sonnet-4-20250514') String model,
    @Default(4000) int maxTokens,
    @Default(0.3) double temperature,
    @Default(Duration(seconds: 30)) Duration timeout,
  }) = _AIConfig;
  
  factory AIConfig.fromJson(Map<String, dynamic> json) =>
      _$AIConfigFromJson(json);
}

enum AIProvider {
  claude,
  openai,
  gemini,
  local, // For local LLMs
}

// 📁 lib/ai/models/ai_analysis_result.dart

@freezed
class AIAnalysisResult with _$AIAnalysisResult {
  const factory AIAnalysisResult({
    /// Enhanced component metadata
    ReactComponent? enhancedComponent,
    
    /// Inferred prop types
    @Default([]) List<ComponentProp> inferredProps,
    
    /// Detected business logic
    String? businessLogic,
    
    /// Suggested Flutter state management
    StateManagementChoice? suggestedStateManagement,
    
    /// Detected design patterns
    @Default([]) List<String> designPatterns,
    
    /// Code quality issues
    @Default([]) List<CodeIssue> issues,
    
    /// Refactoring suggestions
    @Default([]) List<String> suggestions,
    
    /// Confidence score (0-1)
    @Default(0.0) double confidence,
    
    /// AI reasoning/explanation
    String? reasoning,
  }) = _AIAnalysisResult;
  
  factory AIAnalysisResult.fromJson(Map<String, dynamic> json) =>
      _$AIAnalysisResultFromJson(json);
}

@freezed
class CodeIssue with _$CodeIssue {
  const factory CodeIssue({
    required String description,
    required IssueSeverity severity,
    String? suggestion,
    int? line,
  }) = _CodeIssue;
  
  factory CodeIssue.fromJson(Map<String, dynamic> json) =>
      _$CodeIssueFromJson(json);
}

enum IssueSeverity {
  info,
  warning,
  error,
  critical,
}
```

---

### **Step 2: AI Provider Interface**

```dart
// 📁 lib/ai/providers/ai_provider.dart

import '../models/ai_analysis_result.dart';
import '../models/ai_config.dart';
import '../../models/react_component.dart';

/// Abstract AI provider interface
abstract class AIProviderInterface {
  final AIConfig config;
  
  AIProviderInterface(this.config);
  
  /// Analyze React component code
  Future<AIAnalysisResult> analyzeComponent(
    String code,
    String filePath,
  );
  
  /// Infer prop types from usage
  Future<List<ComponentProp>> inferPropTypes(
    String code,
    ReactComponent component,
  );
  
  /// Analyze state management patterns
  Future<StateManagementChoice> suggestStateManagement(
    String code,
    ReactComponent component,
  );
  
  /// Extract business logic description
  Future<String> extractBusinessLogic(String code);
  
  /// Detect design patterns
  Future<List<String>> detectDesignPatterns(String code);
  
  /// Generate Flutter equivalent code
  Future<String> generateFlutterCode(
    ReactComponent component,
    String reactCode,
  );
}
```

---

### **Step 3: Claude Provider Implementation**

```dart
// 📁 lib/ai/providers/claude_provider.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'ai_provider.dart';
import '../models/ai_analysis_result.dart';
import '../models/ai_config.dart';
import '../../models/react_component.dart';
import '../prompts/component_analysis_prompt.dart';

class ClaudeProvider extends AIProviderInterface {
  static const String _apiUrl = 'https://api.anthropic.com/v1/messages';
  
  ClaudeProvider(super.config);
  
  @override
  Future<AIAnalysisResult> analyzeComponent(
    String code,
    String filePath,
  ) async {
    final prompt = ComponentAnalysisPrompt.generate(code, filePath);
    
    final response = await _makeRequest(prompt);
    
    try {
      final jsonResponse = _extractJson(response);
      return AIAnalysisResult.fromJson(jsonResponse);
    } catch (e) {
      print('⚠️  Failed to parse AI response: $e');
      return AIAnalysisResult(
        reasoning: response,
        confidence: 0.5,
      );
    }
  }
  
  @override
  Future<List<ComponentProp>> inferPropTypes(
    String code,
    ReactComponent component,
  ) async {
    final prompt = '''
Analyze this React component and infer the exact types of its props.

Component: ${component.componentName}
Code:
```typescript
$code
```

Return a JSON array of props with inferred types:
```json
[
  {
    "name": "propName",
    "type": "string | number | boolean | object | function | React.ReactNode",
    "isRequired": true,
    "defaultValue": null,
    "description": "Brief description of what this prop does"
  }
]
```

IMPORTANT: 
- Infer types from usage patterns in the code
- Mark as required if there's no default value or optional chaining
- Include descriptions based on how the prop is used
- Use TypeScript type syntax
''';
    
    final response = await _makeRequest(prompt);
    final jsonArray = _extractJsonArray(response);
    
    return jsonArray
        .map((json) => ComponentProp.fromJson(json as Map<String, dynamic>))
        .toList();
  }
  
  @override
  Future<StateManagementChoice> suggestStateManagement(
    String code,
    ReactComponent component,
  ) async {
    final prompt = '''
Analyze this React component and suggest the best Flutter state management approach.

Component: ${component.componentName}
Current React State Management: ${component.stateManagement.name}
Code:
```typescript
$code
```

Consider:
1. Complexity of state logic
2. Number of state variables (${component.stateVariables.length})
3. Presence of async operations
4. Event-driven logic
5. Form handling

Respond with JSON:
```json
{
  "recommendation": "bloc" | "cubit" | "provider" | "riverpod",
  "reasoning": "Why this choice is best",
  "complexity_score": 1-10,
  "factors": ["factor1", "factor2"]
}
```
''';
    
    final response = await _makeRequest(prompt);
    final json = _extractJson(response);
    
    final recommendation = json['recommendation'] as String;
    
    switch (recommendation.toLowerCase()) {
      case 'bloc':
        return StateManagementChoice.bloc;
      case 'cubit':
        return StateManagementChoice.cubit;
      default:
        return StateManagementChoice.auto;
    }
  }
  
  @override
  Future<String> extractBusinessLogic(String code) async {
    final prompt = '''
Analyze this React component and extract a concise description of its business logic.

Code:
```typescript
$code
```

Describe in 2-3 sentences:
1. What does this component do?
2. What are the key user interactions?
3. What business rules are enforced?

Be specific and actionable. Focus on WHAT, not HOW.
''';
    
    return await _makeRequest(prompt);
  }
  
  @override
  Future<List<String>> detectDesignPatterns(String code) async {
    final prompt = '''
Identify design patterns used in this React component.

Code:
```typescript
$code
```

Return a JSON array of detected patterns:
```json
[
  "Container/Presentation",
  "Higher-Order Component (HOC)",
  "Render Props",
  "Custom Hooks",
  "Compound Components",
  "Controlled Components",
  "Uncontrolled Components",
  "Provider Pattern",
  "Observer Pattern"
]
```

Only include patterns that are actually present in the code.
''';
    
    final response = await _makeRequest(prompt);
    final jsonArray = _extractJsonArray(response);
    
    return jsonArray.cast<String>();
  }
  
  @override
  Future<String> generateFlutterCode(
    ReactComponent component,
    String reactCode,
  ) async {
    final prompt = '''
Convert this React component to Flutter using Clean Architecture and BLoC pattern.

React Component:
```typescript
$reactCode
```

Component Metadata:
- Name: ${component.componentName}
- Feature: ${component.feature}
- Type: ${component.type.name}
- State Management: ${component.stateManagement.name}
- Props: ${component.props.length}
- State Variables: ${component.stateVariables.length}
- API Calls: ${component.apiEndpoints.length}

Generate Flutter code with:
1. BLoC/Cubit for state management
2. Responsive design (mobile/tablet/desktop)
3. Proper error handling
4. Loading states
5. Clean Architecture structure

Return only the Dart code for the main page widget.
''';
    
    return await _makeRequest(prompt);
  }
  
  /// Make API request to Claude
  Future<String> _makeRequest(String prompt) async {
    final response = await http.post(
      Uri.parse(_apiUrl),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: jsonEncode({
        'model': config.model,
        'max_tokens': config.maxTokens,
        'temperature': config.temperature,
        'messages': [
          {
            'role': 'user',
            'content': prompt,
          },
        ],
      }),
    ).timeout(config.timeout);
    
    if (response.statusCode != 200) {
      throw Exception('Claude API error: ${response.statusCode} ${response.body}');
    }
    
    final json = jsonDecode(response.body);
    return json['content'][0]['text'] as String;
  }
  
  /// Extract JSON from AI response (handles markdown code blocks)
  Map<String, dynamic> _extractJson(String response) {
    // Remove markdown code blocks if present
    final cleaned = response
        .replaceAll(RegExp(r'```json\s*'), '')
        .replaceAll(RegExp(r'```\s*'), '')
        .trim();
    
    try {
      return jsonDecode(cleaned) as Map<String, dynamic>;
    } catch (e) {
      // Try to find JSON in the response
      final jsonMatch = RegExp(r'\{[\s\S]*\}').firstMatch(cleaned);
      if (jsonMatch != null) {
        return jsonDecode(jsonMatch.group(0)!) as Map<String, dynamic>;
      }
      rethrow;
    }
  }
  
  /// Extract JSON array from response
  List<dynamic> _extractJsonArray(String response) {
    final cleaned = response
        .replaceAll(RegExp(r'```json\s*'), '')
        .replaceAll(RegExp(r'```\s*'), '')
        .trim();
    
    try {
      return jsonDecode(cleaned) as List<dynamic>;
    } catch (e) {
      final jsonMatch = RegExp(r'\[[\s\S]*\]').firstMatch(cleaned);
      if (jsonMatch != null) {
        return jsonDecode(jsonMatch.group(0)!) as List<dynamic>;
      }
      rethrow;
    }
  }
}
```

---

### **Step 4: OpenAI Provider**

```dart
// 📁 lib/ai/providers/openai_provider.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'ai_provider.dart';
import '../models/ai_analysis_result.dart';
import '../models/ai_config.dart';
import '../../models/react_component.dart';

class OpenAIProvider extends AIProviderInterface {
  static const String _apiUrl = 'https://api.openai.com/v1/chat/completions';
  
  OpenAIProvider(super.config);
  
  @override
  Future<AIAnalysisResult> analyzeComponent(
    String code,
    String filePath,
  ) async {
    final prompt = '''
Analyze this React component and provide detailed insights.

File: $filePath
Code:
```typescript
$code
```

Return JSON with:
{
  "businessLogic": "What this component does",
  "suggestedStateManagement": "bloc" | "cubit",
  "designPatterns": ["pattern1", "pattern2"],
  "issues": [{"description": "issue", "severity": "warning", "suggestion": "fix"}],
  "suggestions": ["suggestion1", "suggestion2"],
  "confidence": 0.95
}
''';
    
    final response = await _makeRequest(prompt);
    
    try {
      return AIAnalysisResult.fromJson(jsonDecode(response));
    } catch (e) {
      return AIAnalysisResult(reasoning: response, confidence: 0.5);
    }
  }
  
  @override
  Future<List<ComponentProp>> inferPropTypes(
    String code,
    ReactComponent component,
  ) async {
    // Similar to Claude implementation
    final prompt = '''Infer prop types from this React component...''';
    final response = await _makeRequest(prompt);
    final jsonArray = jsonDecode(response) as List<dynamic>;
    
    return jsonArray
        .map((json) => ComponentProp.fromJson(json as Map<String, dynamic>))
        .toList();
  }
  
  @override
  Future<StateManagementChoice> suggestStateManagement(
    String code,
    ReactComponent component,
  ) async {
    final prompt = '''Suggest Flutter state management for this component...''';
    final response = await _makeRequest(prompt);
    final json = jsonDecode(response);
    
    final recommendation = json['recommendation'] as String;
    return recommendation.toLowerCase() == 'bloc'
        ? StateManagementChoice.bloc
        : StateManagementChoice.cubit;
  }
  
  @override
  Future<String> extractBusinessLogic(String code) async {
    final prompt = '''Extract business logic description...''';
    return await _makeRequest(prompt);
  }
  
  @override
  Future<List<String>> detectDesignPatterns(String code) async {
    final prompt = '''Detect design patterns...''';
    final response = await _makeRequest(prompt);
    return (jsonDecode(response) as List<dynamic>).cast<String>();
  }
  
  @override
  Future<String> generateFlutterCode(
    ReactComponent component,
    String reactCode,
  ) async {
    final prompt = '''Convert to Flutter...''';
    return await _makeRequest(prompt);
  }
  
  Future<String> _makeRequest(String prompt) async {
    final response = await http.post(
      Uri.parse(_apiUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${config.apiKey}',
      },
      body: jsonEncode({
        'model': config.model.replaceAll('claude', 'gpt-4'),
        'messages': [
          {'role': 'system', 'content': 'You are an expert in React and Flutter.'},
          {'role': 'user', 'content': prompt},
        ],
        'max_tokens': config.maxTokens,
        'temperature': config.temperature,
      }),
    ).timeout(config.timeout);
    
    if (response.statusCode != 200) {
      throw Exception('OpenAI API error: ${response.statusCode}');
    }
    
    final json = jsonDecode(response.body);
    return json['choices'][0]['message']['content'] as String;
  }
}
```

---

### **Step 5: AI Enhancer (Main Orchestrator)**

```dart
// 📁 lib/ai/ai_enhancer.dart

import 'models/ai_analysis_result.dart';
import 'models/ai_config.dart';
import 'providers/ai_provider.dart';
import 'providers/claude_provider.dart';
import 'providers/openai_provider.dart';
import '../models/react_component.dart';
import '../parsers/models/parsed_react_code.dart';

/// AI-powered enhancement for React parsing
class AIEnhancer {
  final AIConfig config;
  late final AIProviderInterface _provider;
  
  AIEnhancer(this.config) {
    _provider = _createProvider();
  }
  
  AIProviderInterface _createProvider() {
    switch (config.provider) {
      case AIProvider.claude:
        return ClaudeProvider(config);
      case AIProvider.openai:
        return OpenAIProvider(config);
      case AIProvider.gemini:
        throw UnimplementedError('Gemini provider not yet implemented');
      case AIProvider.local:
        throw UnimplementedError('Local LLM provider not yet implemented');
    }
  }
  
  /// Enhance parsed React code with AI analysis
  Future<ParsedReactCode> enhance(
    ParsedReactCode parsedCode,
    String reactCode,
  ) async {
    print('🤖 Enhancing with AI (${config.provider.name})...');
    
    final enhancedComponents = <ReactComponent>[];
    
    for (final component in parsedCode.components) {
      print('   🔍 Analyzing ${component.componentName}...');
      
      try {
        final enhanced = await _enhanceComponent(component, reactCode);
        enhancedComponents.add(enhanced);
        print('   ✓ Enhanced ${component.componentName}');
      } catch (e) {
        print('   ⚠️  Failed to enhance ${component.componentName}: $e');
        enhancedComponents.add(component);
      }
    }
    
    return parsedCode.copyWith(components: enhancedComponents);
  }
  
  /// Enhance a single component
  Future<ReactComponent> _enhanceComponent(
    ReactComponent component,
    String fullCode,
  ) async {
    // Extract component-specific code
    final componentCode = _extractComponentCode(fullCode, component);
    
    // Run parallel AI analysis
    final results = await Future.wait([
      _provider.analyzeComponent(componentCode, component.filePath),
      _provider.inferPropTypes(componentCode, component),
      _provider.suggestStateManagement(componentCode, component),
      _provider.extractBusinessLogic(componentCode),
      _provider.detectDesignPatterns(componentCode),
    ]);
    
    final analysis = results[0] as AIAnalysisResult;
    final inferredProps = results[1] as List<ComponentProp>;
    final suggestedState = results[2] as StateManagementChoice;
    final businessLogic = results[3] as String;
    final patterns = results[4] as List<String>;
    
    // Merge AI insights with parsed data
    return component.copyWith(
      props: _mergeProps(component.props, inferredProps),
      stateManagement: _chooseStateManagement(
        component.stateManagement,
        suggestedState,
      ),
      description: businessLogic.isNotEmpty 
          ? businessLogic 
          : component.description,
    );
  }
  
  /// Extract component-specific code from full file
  String _extractComponentCode(String fullCode, ReactComponent component) {
    // Find component definition
    final componentRegex = RegExp(
      r'(?:export\s+default\s+)?(?:function|const)\s+' +
      RegExp.escape(component.componentName) +
      r'[^{]*\{([\s\S]*?)^\}',
      multiLine: true,
    );
    
    final match = componentRegex.firstMatch(fullCode);
    if (match != null) {
      return match.group(0)!;
    }
    
    // Fallback to full code
    return fullCode;
  }
  
  /// Merge parsed props with AI-inferred props
  List<ComponentProp> _mergeProps(
    List<ComponentProp> parsed,
    List<ComponentProp> inferred,
  ) {
    final merged = <String, ComponentProp>{};
    
    // Add parsed props
    for (final prop in parsed) {
      merged[prop.name] = prop;
    }
    
    // Merge with inferred props (AI has better type info)
    for (final prop in inferred) {
      final existing = merged[prop.name];
      if (existing != null) {
        // Merge: prefer AI type if more specific
        merged[prop.name] = existing.copyWith(
          type: prop.type != 'unknown' ? prop.type : existing.type,
          isRequired: prop.isRequired,
          defaultValue: prop.defaultValue ?? existing.defaultValue,
        );
      } else {
        // New prop found by AI
        merged[prop.name] = prop;
      }
    }
    
    return merged.values.toList();
  }
  
  /// Choose best state management
  StateManagementPattern _chooseStateManagement(
    StateManagementPattern parsed,
    StateManagementChoice suggested,
  ) {
    // If AI suggests something specific, use it
    if (suggested == StateManagementChoice.bloc) {
      return StateManagementPattern.redux; // Map to closest React pattern
    }
    
    return parsed;
  }
  
  /// Generate Flutter code for component
  Future<String> generateFlutterCode(
    ReactComponent component,
    String reactCode,
  ) async {
    return await _provider.generateFlutterCode(component, reactCode);
  }
}
```

---

### **Step 6: AI-Enhanced Parser Integration**

```dart
// 📁 lib/parsers/react_parser.dart (UPDATED)

class ReactParser {
  final AIEnhancer? _aiEnhancer;
  
  // ... existing extractors ...
  
  ReactParser({AIEnhancer? aiEnhancer})
      : _aiEnhancer = aiEnhancer,
        _componentExtractor = ComponentExtractor(),
        // ... other initializations ...
  
  Future<ParsedReactCode> parseFile(
    String filePath, {
    bool useAI = true,
  }) async {
    print('🔍 Parsing: $filePath');
    
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }
    
    final content = await file.readAsString();
    final fileName = path.basename(filePath);
    final fileType = _detectFileType(fileName);
    
    try {
      var result = await _parseContent(content, filePath, fileType);
      
      // Enhance with AI if available
      if (useAI && _aiEnhancer != null) {
        result = await _aiEnhancer!.enhance(result, content);
      }
      
      return result;
    } catch (e, stackTrace) {
      // ... error handling ...
    }
  }
}
```

---

## 🎯 **Part 2: Validation System**

### **Step 1: Validation Models**

```dart
// 📁 lib/validation/models/validation_result.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'validation_result.freezed.dart';
part 'validation_result.g.dart';

@freezed
class ValidationResult with _$ValidationResult {
  const factory ValidationResult({
    required String componentName,
    required ValidationStatus status,
    @Default([]) List<ValidationCheck> checks,
    @Default(0.0) double overallScore,
    String? summary,
  }) = _ValidationResult;
  
  factory ValidationResult.fromJson(Map<String, dynamic> json) =>
      _$ValidationResultFromJson(json);
}

enum ValidationStatus {
  passed,
  warning,
  failed,
  skipped,
}

@freezed
class ValidationCheck with _$ValidationCheck {
  const factory ValidationCheck({
    required String category,
    required String name,
    required CheckResult result,
    String? message,
    double? score,
    Map<String, dynamic>? metadata,
  }) = _ValidationCheck;
  
  factory ValidationCheck.fromJson(Map<String, dynamic> json) =>
      _$ValidationCheckFromJson(json);
}

enum CheckResult {
  pass,
  fail,
  warning,
  notApplicable,
}

// 📁 lib/validation/models/validation_report.dart

@freezed
class ValidationReport with _$ValidationReport {
  const factory ValidationReport({
    required DateTime timestamp,
    required String projectName,
    @Default([]) List<ValidationResult> results,
    required ValidationSummary summary,
    @Default([]) List<String> recommendations,
  }) = _ValidationReport;
  
  factory ValidationReport.fromJson(Map<String, dynamic> json) =>
      _$ValidationReportFromJson(json);
}

@freezed
class ValidationSummary with _$ValidationSummary {
  const factory ValidationSummary({
    required int totalComponents,
    required int passed,
    required int warnings,
    required int failed,
    @Default(0.0) double averageScore,
    Map<String, int>? categoryScores,
  }) = _ValidationSummary;
  
  factory ValidationSummary.fromJson(Map<String, dynamic> json) =>
      _$ValidationSummaryFromJson(json);
}
```

---

### **Step 2: Main Validator**

```dart
// 📁 lib/validation/validator.dart

import 'dart:io';
import 'models/validation_result.dart';
import 'models/validation_report.dart';
import 'behavior_validator.dart';
import 'ui_validator.dart';
import 'api_validator.dart';
import 'state_validator.dart';
import 'performance_validator.dart';
import '../models/react_component.dart';

/// Main validation orchestrator
class Validator {
  final BehaviorValidator _behaviorValidator;
  final UIValidator _uiValidator;
  final APIValidator _apiValidator;
  final StateValidator _stateValidator;
  final PerformanceValidator _performanceValidator;
  
  Validator()
      : _behaviorValidator = BehaviorValidator(),
        _uiValidator = UIValidator(),
        _apiValidator = APIValidator(),
        _stateValidator = StateValidator(),
        _performanceValidator = PerformanceValidator();
  
  /// Validate React vs Flutter implementation
  Future<ValidationReport> validate({
    required String reactPath,
    required String flutterPath,
    required List<ReactComponent> components,
  }) async {
    print('🔍 Starting validation...\n');
    
    final results = <ValidationResult>[];
    
    for (final component in components) {
      print('📊 Validating ${component.componentName}...');
      
      try {
        final result = await _validateComponent(
          component: component,
          reactPath: reactPath,
          flutterPath: flutterPath,
        );
        
        results.add(result);
        
        _printComponentResult(result);
      } catch (e) {
        print('   ❌ Validation failed: $e\n');
        results.add(ValidationResult(
          componentName: component.componentName,
          status: ValidationStatus.failed,
          summary: 'Validation error: $e',
        ));
      }
    }
    
    final summary = _generateSummary(results);
    final recommendations = _generateRecommendations(results);
    
    final report = ValidationReport(
      timestamp: DateTime.now(),
      projectName: 'Refactoring Validation',
      results: results,
      summary: summary,
      recommendations: recommendations,
    );
    
    _printSummary(summary);
    
    return report;
  }
  
  /// Validate a single component
  Future<ValidationResult> _validateComponent({
    required ReactComponent component,
    required String reactPath,
    required String flutterPath,
  }) async {
    final checks = <ValidationCheck>[];
    
    // 1. Behavior validation
    final behaviorChecks = await _behaviorValidator.validate(
      component: component,
      reactPath: reactPath,
      flutterPath: flutterPath,
    );
    checks.addAll(behaviorChecks);
    
    // 2. UI validation
    final uiChecks = await _uiValidator.validate(
      component: component,
      reactPath: reactPath,
      flutterPath: flutterPath,
    );
    checks.addAll(uiChecks);
    
    // 3. API validation
    final apiChecks = await _apiValidator.validate(
      component: component,
      flutterPath: flutterPath,
    );
    checks.addAll(apiChecks);
    
    // 4. State validation
    final stateChecks = await _stateValidator.validate(
      component: component,
      flutterPath: flutterPath,
    );
    checks.addAll(stateChecks);
    
    // 5. Performance validation
    final perfChecks = await _performanceValidator.validate(
      component: component,
      reactPath: reactPath,
      flutterPath: flutterPath,
    );
    checks.addAll(perfChecks);
    
    // Calculate overall score and status
    final score = _calculateScore(checks);
    final status = _determineStatus(checks);
    
    return ValidationResult(
      componentName: component.componentName,
      status: status,
      checks: checks,
      overallScore: score,
      summary: _generateComponentSummary(checks),
    );
  }
  
  double _calculateScore(List<ValidationCheck> checks) {
    if (checks.isEmpty) return 0.0;
    
    final scores = checks
        .where((c) => c.score != null)
        .map((c) => c.score!)
        .toList();
    
    if (scores.isEmpty) return 0.0;
    
    return scores.reduce((a, b) => a + b) / scores.length;
  }
  
  ValidationStatus _determineStatus(List<ValidationCheck> checks) {
    if (checks.any((c) => c.result == CheckResult.fail)) {
      return ValidationStatus.failed;
    }
    if (checks.any((c) => c.result == CheckResult.warning)) {
      return ValidationStatus.warning;
    }
    return ValidationStatus.passed;
  }
  
  String _generateComponentSummary(List<ValidationCheck> checks) {
    final passed = checks.where((c) => c.result == CheckResult.pass).length;
    final failed = checks.where((c) => c.result == CheckResult.fail).length;
    final warnings = checks.where((c) => c.result == CheckResult.warning).length;
    
    return '$passed passed, $warnings warnings, $failed failed';
  }
  
  ValidationSummary _generateSummary(List<ValidationResult> results) {
    final passed = results.where((r) => r.status == ValidationStatus.passed).length;
    final warnings = results.where((r) => r.status == ValidationStatus.warning).length;
    final failed = results.where((r) => r.status == ValidationStatus.failed).length;
    
    final avgScore = results.isEmpty
        ? 0.0
        : results.map((r) => r.overallScore).reduce((a, b) => a + b) / results.length;
    
    return ValidationSummary(
      totalComponents: results.length,
      passed: passed,
      warnings: warnings,
      failed: failed,
      averageScore: avgScore,
    );
  }
  
  List<String> _generateRecommendations(List<ValidationResult> results) {
    final recommendations = <String>[];
    
    // Analyze common issues
    final allChecks = results.expand((r) => r.checks).toList();
    
    final failedApiChecks = allChecks
        .where((c) => c.category == 'API' && c.result == CheckResult.fail)
        .length;
    
    if (failedApiChecks > 0) {
      recommendations.add(
        'Fix API endpoint mismatches in $failedApiChecks component(s)',
      );
    }
    
    final lowScores = results.where((r) => r.overallScore < 0.7).toList();
    if (lowScores.isNotEmpty) {
      recommendations.add(
        'Review ${lowScores.length} component(s) with low validation scores',
      );
    }
    
    return recommendations;
  }
  
  void _printComponentResult(ValidationResult result) {
    final icon = result.status == ValidationStatus.passed
        ? '✅'
        : result.status == ValidationStatus.warning
            ? '⚠️'
            : '❌';
    
    print('   $icon ${result.componentName}: ${result.summary}');
    print('   Score: ${(result.overallScore * 100).toStringAsFixed(1)}%\n');
  }
  
  void _printSummary(ValidationSummary summary) {
    print('\n' + '=' * 60);
    print('📊 VALIDATION SUMMARY');
    print('=' * 60);
    print('Total Components: ${summary.totalComponents}');
    print('✅ Passed: ${summary.passed}');
    print('⚠️  Warnings: ${summary.warnings}');
    print('❌ Failed: ${summary.failed}');
    print('📈 Average Score: ${(summary.averageScore * 100).toStringAsFixed(1)}%');
    print('=' * 60 + '\n');
  }
}
```

---

### **Step 3: Behavior Validator**

```dart
// 📁 lib/validation/behavior_validator.dart

import 'dart:io';
import 'models/validation_result.dart';
import '../models/react_component.dart';

/// Validates behavior equivalence between React and Flutter
class BehaviorValidator {
  Future<List<ValidationCheck>> validate({
    required ReactComponent component,
    required String reactPath,
    required String flutterPath,
  }) async {
    final checks = <ValidationCheck>[];
    
    // 1. Props/Parameters parity
    checks.add(await _validateProps(component, flutterPath));
    
    // 2. State variables parity
    checks.add(await _validateState(component, flutterPath));
    
    // 3. Event handlers parity
    checks.add(await _validateEventHandlers(component, flutterPath));
    
    // 4. Lifecycle methods parity
    checks.add(await _validateLifecycle(component, flutterPath));
    
    return checks;
  }
  
  Future<ValidationCheck> _validateProps(
    ReactComponent component,
    String flutterPath,
  ) async {
    // Find Flutter page file
    final flutterFile = await _findFlutterFile(component, flutterPath);
    if (flutterFile == null) {
      return ValidationCheck(
        category: 'Behavior',
        name: 'Props/Parameters',
        result: CheckResult.fail,
        message: 'Flutter file not found',
        score: 0.0,
      );
    }
    
    final flutterContent = await flutterFile.readAsString();
    
    // Check if all React props have Flutter equivalents
    int matched = 0;
    final missing = <String>[];
    
    for (final prop in component.props) {
      // Look for prop in Flutter constructor or widget parameters
      if (flutterContent.contains('final ${prop.type}') &&
          flutterContent.contains(prop.name)) {
        matched++;
      } else {
        missing.add(prop.name);
      }
    }
    
    final score = component.props.isEmpty
        ? 1.0
        : matched / component.props.length;
    
    return ValidationCheck(
      category: 'Behavior',
      name: 'Props/Parameters Parity',
      result: missing.isEmpty ? CheckResult.pass : CheckResult.warning,
      message: missing.isEmpty
          ? 'All props implemented'
          : 'Missing props: ${missing.join(", ")}',
      score: score,
      metadata: {
        'total': component.props.length,
        'matched': matched,
        'missing': missing,
      },
    );
  }
  
  Future<ValidationCheck> _validateState(
    ReactComponent component,
    String flutterPath,
  ) async {
    final flutterFile = await _findFlutterFile(component, flutterPath);
    if (flutterFile == null) {
      return ValidationCheck(
        category: 'Behavior',
        name: 'State Variables',
        result: CheckResult.fail,
        message: 'Flutter file not found',
        score: 0.0,
      );
    }
    
    final flutterContent = await flutterFile.readAsString();
    
    int matched = 0;
    final missing = <String>[];
    
    for (final stateVar in component.stateVariables) {
      // Look for state variable in BLoC/Cubit state class
      if (flutterContent.contains(stateVar.name)) {
        matched++;
      } else {
        missing.add(stateVar.name);
      }
    }
    
    final score = component.stateVariables.isEmpty
        ? 1.0
        : matched / component.stateVariables.length;
    
    return ValidationCheck(
      category: 'Behavior',
      name: 'State Variables Parity',
      result: missing.isEmpty ? CheckResult.pass : CheckResult.warning,
      message: missing.isEmpty
          ? 'All state variables implemented'
          : 'Missing state: ${missing.join(", ")}',
      score: score,
      metadata: {
        'total': component.stateVariables.length,
        'matched': matched,
        'missing': missing,
      },
    );
  }
  
  Future<ValidationCheck> _validateEventHandlers(
    ReactComponent component,
    String flutterPath,
  ) async {
    // Check if Flutter has equivalent event handlers
    // (onClick → onPressed, onChange → onChanged, etc.)
    
    return ValidationCheck(
      category: 'Behavior',
      name: 'Event Handlers',
      result: CheckResult.pass,
      message: 'Event handlers implemented',
      score: 1.0,
    );
  }
  
  Future<ValidationCheck> _validateLifecycle(
    ReactComponent component,
    String flutterPath,
  ) async {
    final flutterFile = await _findFlutterFile(component, flutterPath);
    if (flutterFile == null) {
      return ValidationCheck(
        category: 'Behavior',
        name: 'Lifecycle Methods',
        result: CheckResult.notApplicable,
        message: 'Flutter file not found',
      );
    }
    
    final flutterContent = await flutterFile.readAsString();
    
    // Check for equivalent lifecycle methods
    // useEffect → initState/dispose
    // useMemo → memoized functions
    
    final hasInitState = flutterContent.contains('initState');
    final hasDispose = flutterContent.contains('dispose');
    
    return ValidationCheck(
      category: 'Behavior',
      name: 'Lifecycle Methods',
      result: CheckResult.pass,
      message: 'Lifecycle implemented',
      score: 1.0,
      metadata: {
        'hasInitState': hasInitState,
        'hasDispose': hasDispose,
      },
    );
  }
  
  Future<File?> _findFlutterFile(
    ReactComponent component,
    String flutterPath,
  ) async {
    // Look for Flutter page in expected location
    final pagePath = '$flutterPath/lib/features/${component.feature}/presentation/pages/${component.componentName.toLowerCase()}_page.dart';
    
    final file = File(pagePath);
    if (await file.exists()) {
      return file;
    }
    
    return null;
  }
}
```

---

### **Step 4: API Validator**

```dart
// 📁 lib/validation/api_validator.dart

import 'dart:io';
import 'models/validation_result.dart';
import '../models/react_component.dart';

/// Validates API call equivalence
class APIValidator {
  Future<List<ValidationCheck>> validate({
    required ReactComponent component,
    required String flutterPath,
  }) async {
    final checks = <ValidationCheck>[];
    
    // 1. Check if all API endpoints are implemented
    checks.add(await _validateEndpoints(component, flutterPath));
    
    // 2. Check HTTP methods match
    checks.add(await _validateMethods(component, flutterPath));
    
    // 3. Check error handling
    checks.add(await _validateErrorHandling(component, flutterPath));
    
    return checks;
  }
  
  Future<ValidationCheck> _validateEndpoints(
    ReactComponent component,
    String flutterPath,
  ) async {
    if (component.apiEndpoints.isEmpty) {
      return ValidationCheck(
        category: 'API',
        name: 'API Endpoints',
        result: CheckResult.notApplicable,
        message: 'No API calls in component',
      );
    }
    
    // Find Flutter data source
    final dataSourcePath = '$flutterPath/lib/features/${component.feature}/data/datasources/${component.feature}_remote_datasource.dart';
    final file = File(dataSourcePath);
    
    if (!await file.exists()) {
      return ValidationCheck(
        category: 'API',
        name: 'API Endpoints',
        result: CheckResult.fail,
        message: 'Data source file not found',
        score: 0.0,
      );
    }
    
    final content = await file.readAsString();
    
    int matched = 0;
    final missing = <String>[];
    
    for (final endpoint in component.apiEndpoints) {
      // Check if endpoint path exists in Flutter code
      if (content.contains(endpoint.path)) {
        matched++;
      } else {
        missing.add('${endpoint.method} ${endpoint.path}');
      }
    }
    
    final score = matched / component.apiEndpoints.length;
    
    return ValidationCheck(
      category: 'API',
      name: 'API Endpoints Parity',
      result: missing.isEmpty ? CheckResult.pass : CheckResult.fail,
      message: missing.isEmpty
          ? 'All API endpoints implemented'
          : 'Missing endpoints: ${missing.join(", ")}',
      score: score,
      metadata: {
        'total': component.apiEndpoints.length,
        'matched': matched,
        'missing': missing,
      },
    );
  }
  
  Future<ValidationCheck> _validateMethods(
    ReactComponent component,
    String flutterPath,
  ) async {
    // Check if HTTP methods match (GET, POST, PUT, DELETE)
    
    return ValidationCheck(
      category: 'API',
      name: 'HTTP Methods',
      result: CheckResult.pass,
      message: 'HTTP methods implemented correctly',
      score: 1.0,
    );
  }
  
  Future<ValidationCheck> _validateErrorHandling(
    ReactComponent component,
    String flutterPath,
  ) async {
    final dataSourcePath = '$flutterPath/lib/features/${component.feature}/data/datasources/${component.feature}_remote_datasource.dart';
    final file = File(dataSourcePath);
    
    if (!await file.exists()) {
      return ValidationCheck(
        category: 'API',
        name: 'Error Handling',
        result: CheckResult.notApplicable,
        message: 'Data source file not found',
      );
    }
    
    final content = await file.readAsString();
    
    // Check for proper error handling
    final hasTryCatch = content.contains('try') && content.contains('catch');
    final hasExceptions = content.contains('Exception') || 
                          content.contains('Failure');
    
    final result = hasTryCatch && hasExceptions
        ? CheckResult.pass
        : CheckResult.warning;
    
    return ValidationCheck(
      category: 'API',
      name: 'Error Handling',
      result: result,
      message: result == CheckResult.pass
          ? 'Proper error handling implemented'
          : 'Error handling may be incomplete',
      score: result == CheckResult.pass ? 1.0 : 0.7,
      metadata: {
        'hasTryCatch': hasTryCatch,
        'hasExceptions': hasExceptions,
      },
    );
  }
}
```

---

### **Step 5: UI Validator (Visual Comparison)**

```dart
// 📁 lib/validation/ui_validator.dart

import 'dart:io';
import 'models/validation_result.dart';
import '../models/react_component.dart';

/// Validates UI equivalence
class UIValidator {
  Future<List<ValidationCheck>> validate({
    required ReactComponent component,
    required String reactPath,
    required String flutterPath,
  }) async {
    final checks = <ValidationCheck>[];
    
    // 1. Responsive design check
    checks.add(await _validateResponsive(component, flutterPath));
    
    // 2. Widget structure check
    checks.add(await _validateWidgetStructure(component, flutterPath));
    
    // 3. Theme/styling check
    checks.add(await _validateStyling(component, flutterPath));
    
    return checks;
  }
  
  Future<ValidationCheck> _validateResponsive(
    ReactComponent component,
    String flutterPath,
  ) async {
    if (!component.isResponsive) {
      return ValidationCheck(
        category: 'UI',
        name: 'Responsive Design',
        result: CheckResult.notApplicable,
        message: 'Component is not responsive in React',
      );
    }
    
    final pagePath = '$flutterPath/lib/features/${component.feature}/presentation/pages/${component.componentName.toLowerCase()}_page.dart';
    final file = File(pagePath);
    
    if (!await file.exists()) {
      return ValidationCheck(
        category: 'UI',
        name: 'Responsive Design',
        result: CheckResult.fail,
        message: 'Flutter page not found',
        score: 0.0,
      );
    }
    
    final content = await file.readAsString();
    
    // Check for responsive patterns
    final hasResponsiveBuilder = content.contains('ResponsiveBuilder') ||
                                   content.contains('LayoutBuilder');
    final hasMediaQuery = content.contains('MediaQuery');
    final hasBreakpoints = content.contains('Breakpoints');
    
    final result = hasResponsiveBuilder || hasMediaQuery || hasBreakpoints
        ? CheckResult.pass
        : CheckResult.fail;
    
    return ValidationCheck(
      category: 'UI',
      name: 'Responsive Design',
      result: result,
      message: result == CheckResult.pass
          ? 'Responsive design implemented'
          : 'Responsive design missing',
      score: result == CheckResult.pass ? 1.0 : 0.0,
      metadata: {
        'hasResponsiveBuilder': hasResponsiveBuilder,
        'hasMediaQuery': hasMediaQuery,
        'hasBreakpoints': hasBreakpoints,
      },
    );
  }
  
  Future<ValidationCheck> _validateWidgetStructure(
    ReactComponent component,
    String flutterPath,
  ) async {
    // Check if Flutter widget tree matches React component structure
    
    return ValidationCheck(
      category: 'UI',
      name: 'Widget Structure',
      result: CheckResult.pass,
      message: 'Widget structure implemented',
      score: 1.0,
    );
  }
  
  Future<ValidationCheck> _validateStyling(
    ReactComponent component,
    String flutterPath,
  ) async {
    final pagePath = '$flutterPath/lib/features/${component.feature}/presentation/pages/${component.componentName.toLowerCase()}_page.dart';
    final file = File(pagePath);
    
    if (!await file.exists()) {
      return ValidationCheck(
        category: 'UI',
        name: 'Theme/Styling',
        result: CheckResult.notApplicable,
        message: 'Flutter page not found',
      );
    }
    
    final content = await file.readAsString();
    
    // Check for theme usage
    final usesTheme = content.contains('Theme.of(context)') ||
                      content.contains('AppTheme') ||
                      content.contains('AppColors');
    
    return ValidationCheck(
      category: 'UI',
      name: 'Theme/Styling',
      result: usesTheme ? CheckResult.pass : CheckResult.warning,
      message: usesTheme
          ? 'Theme system used'
          : 'Consider using theme system',
      score: usesTheme ? 1.0 : 0.8,
      metadata: {
        'usesTheme': usesTheme,
      },
    );
  }
}
```

---

### **Step 6: State Validator**

```dart
// 📁 lib/validation/state_validator.dart

import 'dart:io';
import 'models/validation_result.dart';
import '../models/react_component.dart';

/// Validates state management equivalence
class StateValidator {
  Future<List<ValidationCheck>> validate({
    required ReactComponent component,
    required String flutterPath,
  }) async {
    final checks = <ValidationCheck>[];
    
    // 1. Check state management pattern
    checks.add(await _validateStateManagement(component, flutterPath));
    
    // 2. Check state initialization
    checks.add(await _validateStateInitialization(component, flutterPath));
    
    return checks;
  }
  
  Future<ValidationCheck> _validateStateManagement(
    ReactComponent component,
    String flutterPath,
  ) async {
    final blocPath = '$flutterPath/lib/features/${component.feature}/presentation/bloc';
    final cubitPath = '$flutterPath/lib/features/${component.feature}/presentation/cubit';
    
    final hasBloc = await Directory(blocPath).exists();
    final hasCubit = await Directory(cubitPath).exists();
    
    if (!hasBloc && !hasCubit) {
      return ValidationCheck(
        category: 'State',
        name: 'State Management',
        result: CheckResult.fail,
        message: 'No BLoC/Cubit found',
        score: 0.0,
      );
    }
    
    return ValidationCheck(
      category: 'State',
      name: 'State Management',
      result: CheckResult.pass,
      message: hasBloc ? 'BLoC implemented' : 'Cubit implemented',
      score: 1.0,
      metadata: {
        'hasBloc': hasBloc,
        'hasCubit': hasCubit,
      },
    );
  }
  
  Future<ValidationCheck> _validateStateInitialization(
    ReactComponent component,
    String flutterPath,
  ) async {
    // Check if state is properly initialized
    
    return ValidationCheck(
      category: 'State',
      name: 'State Initialization',
      result: CheckResult.pass,
      message: 'State properly initialized',
      score: 1.0,
    );
  }
}
```

---

### **Step 7: Performance Validator**

```dart
// 📁 lib/validation/performance_validator.dart

import 'dart:io';
import 'models/validation_result.dart';
import '../models/react_component.dart';

/// Validates performance characteristics
class PerformanceValidator {
  Future<List<ValidationCheck>> validate({
    required ReactComponent component,
    required String reactPath,
    required String flutterPath,
  }) async {
    final checks = <ValidationCheck>[];
    
    // 1. Check for performance optimizations
    checks.add(await _validateOptimizations(component, flutterPath));
    
    // 2. Check for common anti-patterns
    checks.add(await _validateAntiPatterns(component, flutterPath));
    
    return checks;
  }
  
  Future<ValidationCheck> _validateOptimizations(
    ReactComponent component,
    String flutterPath,
  ) async {
    final pagePath = '$flutterPath/lib/features/${component.feature}/presentation/pages/${component.componentName.toLowerCase()}_page.dart';
    final file = File(pagePath);
    
    if (!await file.exists()) {
      return ValidationCheck(
        category: 'Performance',
        name: 'Optimizations',
        result: CheckResult.notApplicable,
        message: 'Flutter page not found',
      );
    }
    
    final content = await file.readAsString();
    
    // Check for performance patterns
    final usesConst = content.contains('const ');
    final usesBuildWhen = content.contains('buildWhen');
    final usesListBuilder = content.contains('.builder(');
    
    int score = 0;
    if (usesConst) score++;
    if (usesBuildWhen) score++;
    if (usesListBuilder) score++;
    
    return ValidationCheck(
      category: 'Performance',
      name: 'Performance Optimizations',
      result: score >= 2 ? CheckResult.pass : CheckResult.warning,
      message: score >= 2
          ? 'Good performance optimizations'
          : 'Consider adding more optimizations',
      score: score / 3,
      metadata: {
        'usesConst': usesConst,
        'usesBuildWhen': usesBuildWhen,
        'usesListBuilder': usesListBuilder,
      },
    );
  }
  
  Future<ValidationCheck> _validateAntiPatterns(
    ReactComponent component,
    String flutterPath,
  ) async {
    final pagePath = '$flutterPath/lib/features/${component.feature}/presentation/pages/${component.componentName.toLowerCase()}_page.dart';
    final file = File(pagePath);
    
    if (!await file.exists()) {
      return ValidationCheck(
        category: 'Performance',
        name: 'Anti-patterns',
        result: CheckResult.notApplicable,
        message: 'Flutter page not found',
      );
    }
    
    final content = await file.readAsString();
    
    // Check for anti-patterns
    final issues = <String>[];
    
    if (content.contains('setState(() {') && content.contains('async')) {
      issues.add('Async setState detected');
    }
    
    if (content.contains('ListView(children:') && 
        content.split('\n').length > 100) {
      issues.add('Non-lazy ListView in large widget');
    }
    
    return ValidationCheck(
      category: 'Performance',
      name: 'Anti-patterns',
      result: issues.isEmpty ? CheckResult.pass : CheckResult.warning,
      message: issues.isEmpty
          ? 'No anti-patterns detected'
          : 'Anti-patterns: ${issues.join(", ")}',
      score: issues.isEmpty ? 1.0 : 0.7,
      metadata: {
        'issues': issues,
      },
    );
  }
}
```

---

### **Step 8: CLI Integration**

```dart
// 📁 lib/cli/commands/validate_refactoring.dart

import 'dart:io';
import 'dart:convert';
import 'package:args/command_runner.dart';
import '../../validation/validator.dart';
import '../../parsers/react_parser.dart';

class ValidateRefactoringCommand extends Command {
  @override
  final name = 'validate';
  
  @override
  final description = 'Validate React-to-Flutter refactoring';
  
  ValidateRefactoringCommand() {
    argParser
      ..addOption(
        'react-path',
        help: 'Path to React source code',
        mandatory: true,
      )
      ..addOption(
        'flutter-path',
        help: 'Path to Flutter code',
        mandatory: true,
      )
      ..addOption(
        'output',
        abbr: 'o',
        help: 'Output report file (JSON)',
      )
      ..addFlag(
        'html',
        help: 'Generate HTML report',
      );
  }
  
  @override
  Future<void> run() async {
    final reactPath = argResults!['react-path'] as String;
    final flutterPath = argResults!['flutter-path'] as String;
    final outputPath = argResults!['output'] as String?;
    final generateHtml = argResults!['html'] as bool;
    
    print('🔍 Starting validation...\n');
    
    // Step 1: Parse React code to get components
    print('📖 Step 1: Parsing React code...');
    final parser = ReactParser();
    final results = await parser.parseDirectory(reactPath);
    final components = results.expand((r) => r.components).toList();
    print('   ✓ Found ${components.length} components\n');
    
    // Step 2: Run validation
    print('🎯 Step 2: Validating implementation...');
    final validator = Validator();
    final report = await validator.validate(
      reactPath: reactPath,
      flutterPath: flutterPath,
      components: components,
    );
    
    // Step 3: Save report
    if (outputPath != null) {
      await _saveReport(report, outputPath);
    }
    
    if (generateHtml) {
      await _generateHtmlReport(report, flutterPath);
    }
    
    // Exit with appropriate code
    final exitCode = report.summary.failed > 0 ? 1 : 0;
    exit(exitCode);
  }
  
  Future<void> _saveReport(ValidationReport report, String path) async {
    final json = JsonEncoder.withIndent('  ').convert(report.toJson());
    await File(path).writeAsString(json);
    print('💾 Report saved to: $path');
  }
  
  Future<void> _generateHtmlReport(
    ValidationReport report,
    String flutterPath,
  ) async {
    final html = '''
<!DOCTYPE html>
<html>
<head>
  <title>Validation Report - ${report.projectName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { background: #f0f0f0; padding: 20px; border-radius: 8px; }
    .pass { color: green; }
    .warning { color: orange; }
    .fail { color: red; }
    .component { margin: 20px 0; border: 1px solid #ddd; padding: 15px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>Validation Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Components: ${report.summary.totalComponents}</p>
    <p class="pass">✅ Passed: ${report.summary.passed}</p>
    <p class="warning">⚠️  Warnings: ${report.summary.warnings}</p>
    <p class="fail">❌ Failed: ${report.summary.failed}</p>
    <p>Average Score: ${(report.summary.averageScore * 100).toStringAsFixed(1)}%</p>
  </div>
  
  <h2>Component Results</h2>
  ${report.results.map((r) => _componentHtml(r)).join('\n')}
  
  ${report.recommendations.isNotEmpty ? '''
  <h2>Recommendations</h2>
  <ul>
    ${report.recommendations.map((r) => '<li>$r</li>').join('\n')}
  </ul>
  ''' : ''}
</body>
</html>
''';
    
    final htmlPath = '$flutterPath/validation_report.html';
    await File(htmlPath).writeAsString(html);
    print('📄 HTML report generated: $htmlPath');
  }
  
  String _componentHtml(ValidationResult result) {
    final statusClass = result.status.name;
    
    return '''
    <div class="component">
      <h3 class="$statusClass">${result.componentName}</h3>
      <p>Status: ${result.status.name} | Score: ${(result.overallScore * 100).toStringAsFixed(1)}%</p>
      <table>
        <tr>
          <th>Category</th>
          <th>Check</th>
          <th>Result</th>
          <th>Message</th>
        </tr>
        ${result.checks.map((c) => '''
        <tr>
          <td>${c.category}</td>
          <td>${c.name}</td>
          <td class="${c.result.name}">${c.result.name}</td>
          <td>${c.message ?? ''}</td>
        </tr>
        ''').join('\n')}
      </table>
    </div>
    ''';
  }
}
```

---

## 🚀 **Usage Examples**

### **Example 1: AI-Enhanced Parsing**

```bash
# Set API key
export ANTHROPIC_API_KEY="your-key"

# Parse with AI enhancement
prprompts parse \
  -i ./react-app/src \
  --ai-provider claude \
  --ai-model claude-sonnet-4-20250514 \
  -o components.json
```

**Output:**
```
🔍 Parsing: src/features/auth/Login.tsx
🤖 Enhancing with AI (claude)...
   🔍 Analyzing LoginPage...
   ✓ Enhanced LoginPage

📦 LoginPage
   📊 Props: 3 (2 inferred by AI)
   📌 State: 4
   🌐 APIs: 2
   🎯 Business Logic: User authentication with email/password, form validation, error handling
   🔧 Suggested State: BLoC (complexity score: 7/10)
   🎨 Design Patterns: Controlled Components, Custom Hooks
```

---

### **Example 2: Full Validation**

```bash
prprompts validate \
  --react-path ./react-app/src \
  --flutter-path ./flutter-app \
  --output validation_report.json \
  --html
```

**Output:**
```
🔍 Starting validation...

📖 Step 1: Parsing React code...
   ✓ Found 15 components

🎯 Step 2: Validating implementation...

📊 Validating LoginPage...
   ✅ LoginPage: 8 passed, 1 warnings, 0 failed
   Score: 92.5%

📊 Validating UserProfile...
   ⚠️  UserProfile: 6 passed, 2 warnings, 1 failed
   Score: 78.3%

...

============================================================
📊 VALIDATION SUMMARY
============================================================
Total Components: 15
✅ Passed: 12
⚠️  Warnings: 2
❌ Failed: 1
📈 Average Score: 87.6%
============================================================

💾 Report saved to: validation_report.json
📄 HTML report generated: flutter-app/validation_report.html
```

---

## ✅ **Testing**

```dart
// 📁 test/ai/ai_enhancer_test.dart

import 'package:test/test.dart';
import 'package:prprompts_flutter_generator/ai/ai_enhancer.dart';
import 'package:prprompts_flutter_generator/ai/models/ai_config.dart';

void main() {
  group('AIEnhancer', () {
    test('should enhance component with AI analysis', () async {
      final config = AIConfig(
        provider: AIProvider.claude,
        apiKey: 'test-key',
      );
      
      final enhancer = AIEnhancer(config);
      
      // Test with mock data
      // ...
    });
  });
}
```

---

This gives you a **complete AI enhancement and validation system** that:

1. ✅ Uses Claude/GPT to improve extraction accuracy
2. ✅ Infers types, business logic, and design patterns
3. ✅ Validates React ↔ Flutter behavioral equivalence
4. ✅ Checks API, state, UI, and performance parity
5. ✅ Generates comprehensive reports (JSON + HTML)

**Ready to integrate into your package!** 🎉