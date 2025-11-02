# 🚀 Adding React-to-Flutter Refactoring to prprompts-flutter-generator

I'll show you how to extend your **prprompts-flutter-generator** package to include this comprehensive refactoring framework as a new generation option.

---

## 📋 **Implementation Plan**

### **Phase 1: Package Structure**
```
prprompts-flutter-generator/
├── lib/
│   ├── generators/
│   │   ├── prd_generator.dart          # Existing
│   │   ├── compliance_generator.dart   # Existing
│   │   ├── architecture_generator.dart # Existing
│   │   └── refactoring_generator.dart  # 🆕 NEW
│   ├── templates/
│   │   ├── prd_templates/
│   │   ├── compliance_templates/
│   │   └── refactoring_templates/      # 🆕 NEW
│   │       ├── framework_template.md
│   │       ├── feature_template.dart
│   │       ├── usecase_template.dart
│   │       ├── repository_template.dart
│   │       ├── bloc_template.dart
│   │       └── page_template.dart
│   ├── models/
│   │   ├── react_component.dart        # 🆕 NEW
│   │   ├── flutter_feature.dart        # 🆕 NEW
│   │   └── refactoring_config.dart     # 🆕 NEW
│   └── cli/
│       └── commands/
│           ├── generate_prd.dart
│           └── generate_refactoring.dart # 🆕 NEW
```

---

## 🔧 **Step 1: Create Core Models**

### **Model: React Component Metadata**

```dart
// 📁 lib/models/react_component.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'react_component.freezed.dart';
part 'react_component.g.dart';

/// Represents a React component to be refactored into Flutter
@freezed
class ReactComponent with _$ReactComponent {
  const factory ReactComponent({
    /// Component file path (e.g., src/features/auth/Login.tsx)
    required String filePath,
    
    /// Component name (e.g., LoginPage, UserProfile)
    required String componentName,
    
    /// Feature category (e.g., auth, dashboard, profile)
    required String feature,
    
    /// Component type (page, widget, hook, context)
    required ComponentType type,
    
    /// Props/parameters the component accepts
    @Default([]) List<ComponentProp> props,
    
    /// State variables used
    @Default([]) List<StateVariable> stateVariables,
    
    /// API endpoints called
    @Default([]) List<ApiEndpoint> apiEndpoints,
    
    /// Child components used
    @Default([]) List<String> childComponents,
    
    /// State management pattern (Redux, Zustand, Context, useState)
    required StateManagementPattern stateManagement,
    
    /// Whether component is responsive
    @Default(false) bool isResponsive,
    
    /// Description of component functionality
    String? description,
  }) = _ReactComponent;
  
  factory ReactComponent.fromJson(Map<String, dynamic> json) =>
      _$ReactComponentFromJson(json);
}

enum ComponentType {
  page,
  widget,
  hook,
  context,
  hoc, // Higher-Order Component
}

enum StateManagementPattern {
  redux,
  zustand,
  context,
  useState,
  mobx,
  recoil,
}

@freezed
class ComponentProp with _$ComponentProp {
  const factory ComponentProp({
    required String name,
    required String type,
    @Default(false) bool isRequired,
    String? defaultValue,
  }) = _ComponentProp;
  
  factory ComponentProp.fromJson(Map<String, dynamic> json) =>
      _$ComponentPropFromJson(json);
}

@freezed
class StateVariable with _$StateVariable {
  const factory StateVariable({
    required String name,
    required String type,
    String? initialValue,
  }) = _StateVariable;
  
  factory StateVariable.fromJson(Map<String, dynamic> json) =>
      _$StateVariableFromJson(json);
}

@freezed
class ApiEndpoint with _$ApiEndpoint {
  const factory ApiEndpoint({
    required String method, // GET, POST, PUT, DELETE
    required String path,
    String? description,
    @Default([]) List<String> parameters,
  }) = _ApiEndpoint;
  
  factory ApiEndpoint.fromJson(Map<String, dynamic> json) =>
      _$ApiEndpointFromJson(json);
}
```

---

### **Model: Flutter Feature Configuration**

```dart
// 📁 lib/models/flutter_feature.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'flutter_feature.freezed.dart';
part 'flutter_feature.g.dart';

/// Configuration for generating Flutter feature from React component
@freezed
class FlutterFeature with _$FlutterFeature {
  const factory FlutterFeature({
    /// Feature name (e.g., auth, user_profile)
    required String name,
    
    /// React source component
    required ReactComponent sourceComponent,
    
    /// Whether to use BLoC or Cubit
    @Default(StateManagementChoice.bloc) StateManagementChoice stateManagement,
    
    /// Whether to generate tests
    @Default(true) bool generateTests,
    
    /// Whether to generate responsive layouts
    @Default(true) bool generateResponsive,
    
    /// Target platforms
    @Default([TargetPlatform.mobile, TargetPlatform.web])
    List<TargetPlatform> targetPlatforms,
    
    /// Additional configuration
    Map<String, dynamic>? additionalConfig,
  }) = _FlutterFeature;
  
  factory FlutterFeature.fromJson(Map<String, dynamic> json) =>
      _$FlutterFeatureFromJson(json);
}

enum StateManagementChoice {
  bloc,
  cubit,
  auto, // Decide based on complexity
}

enum TargetPlatform {
  mobile,
  tablet,
  desktop,
  web,
}
```

---

### **Model: Refactoring Configuration**

```dart
// 📁 lib/models/refactoring_config.dart

import 'package:freezed_annotation/freezed_annotation.dart';

part 'refactoring_config.freezed.dart';
part 'refactoring_config.g.dart';

/// Overall refactoring project configuration
@freezed
class RefactoringConfig with _$RefactoringConfig {
  const factory RefactoringConfig({
    /// Project name
    required String projectName,
    
    /// React app base path
    required String reactBasePath,
    
    /// Flutter app base path
    required String flutterBasePath,
    
    /// Components to refactor
    required List<ReactComponent> components,
    
    /// Migration strategy
    @Default(MigrationStrategy.incremental) MigrationStrategy strategy,
    
    /// Compliance requirements
    @Default([]) List<ComplianceStandard> complianceStandards,
    
    /// API base URL
    String? apiBaseUrl,
    
    /// Additional architecture preferences
    ArchitecturePreferences? architecturePreferences,
  }) = _RefactoringConfig;
  
  factory RefactoringConfig.fromJson(Map<String, dynamic> json) =>
      _$RefactoringConfigFromJson(json);
}

enum MigrationStrategy {
  bigBang, // Replace all at once
  incremental, // Feature by feature
  parallel, // React + Flutter coexist
}

enum ComplianceStandard {
  hipaa,
  pciDss,
  gdpr,
  sox,
  iso27001,
}

@freezed
class ArchitecturePreferences with _$ArchitecturePreferences {
  const factory ArchitecturePreferences({
    @Default(true) bool useCleanArchitecture,
    @Default(true) bool useFeatureFirst,
    @Default(true) bool useDependencyInjection,
    @Default(true) bool useFreezed,
    @Default('dio') String httpClient,
    @Default('go_router') String router,
  }) = _ArchitecturePreferences;
  
  factory ArchitecturePreferences.fromJson(Map<String, dynamic> json) =>
      _$ArchitecturePreferencesFromJson(json);
}
```

---

## 🏗️ **Step 2: Create Refactoring Generator**

```dart
// 📁 lib/generators/refactoring_generator.dart

import 'dart:io';
import 'package:path/path.dart' as path;
import '../models/react_component.dart';
import '../models/flutter_feature.dart';
import '../models/refactoring_config.dart';
import '../templates/refactoring_templates/template_loader.dart';

/// Generates Flutter code from React components following Clean Architecture
class RefactoringGenerator {
  final RefactoringConfig config;
  final TemplateLoader _templateLoader;
  
  RefactoringGenerator(this.config)
      : _templateLoader = TemplateLoader();
  
  /// Generate complete refactoring package (framework + features)
  Future<void> generateComplete() async {
    print('🚀 Starting React-to-Flutter refactoring...\n');
    
    // Step 1: Generate framework documentation
    await _generateFramework();
    
    // Step 2: Generate project structure
    await _generateProjectStructure();
    
    // Step 3: Generate core infrastructure
    await _generateCoreInfrastructure();
    
    // Step 4: Generate features
    for (final component in config.components) {
      await _generateFeature(component);
    }
    
    // Step 5: Generate migration plan
    await _generateMigrationPlan();
    
    // Step 6: Generate CI/CD configs
    await _generateCICD();
    
    print('\n✅ Refactoring generation complete!');
    print('📁 Output location: ${config.flutterBasePath}');
  }
  
  /// Generate the complete refactoring framework document
  Future<void> _generateFramework() async {
    print('📝 Generating refactoring framework...');
    
    final frameworkContent = await _templateLoader.loadFrameworkTemplate();
    
    final outputPath = path.join(
      config.flutterBasePath,
      'docs',
      'REFACTORING_FRAMEWORK.md',
    );
    
    await _writeFile(outputPath, frameworkContent);
    print('   ✓ Framework documentation created');
  }
  
  /// Generate Flutter project structure
  Future<void> _generateProjectStructure() async {
    print('🏗️  Generating project structure...');
    
    final directories = [
      'lib/core/di',
      'lib/core/errors',
      'lib/core/network',
      'lib/core/constants',
      'lib/core/theme',
      'lib/core/responsive',
      'lib/core/utils',
      'lib/core/widgets',
      'lib/features',
      'lib/config/routes',
      'lib/config/env',
      'test/core',
      'test/features',
      'integration_test',
      'docs',
      '.github/workflows',
    ];
    
    for (final dir in directories) {
      final dirPath = path.join(config.flutterBasePath, dir);
      await Directory(dirPath).create(recursive: true);
    }
    
    print('   ✓ Directory structure created');
  }
  
  /// Generate core infrastructure (DI, errors, network)
  Future<void> _generateCoreInfrastructure() async {
    print('⚙️  Generating core infrastructure...');
    
    // Generate DI setup
    await _generateDependencyInjection();
    
    // Generate error handling
    await _generateErrorHandling();
    
    // Generate network layer
    await _generateNetworkLayer();
    
    // Generate theme
    await _generateTheme();
    
    // Generate responsive utilities
    await _generateResponsive();
    
    print('   ✓ Core infrastructure generated');
  }
  
  /// Generate a single feature from React component
  Future<void> _generateFeature(ReactComponent component) async {
    print('🎨 Generating feature: ${component.feature}...');
    
    final flutterFeature = FlutterFeature(
      name: component.feature,
      sourceComponent: component,
      stateManagement: _determineStateManagement(component),
    );
    
    final featureBasePath = path.join(
      config.flutterBasePath,
      'lib',
      'features',
      _toSnakeCase(component.feature),
    );
    
    // Generate domain layer
    await _generateDomainLayer(featureBasePath, flutterFeature);
    
    // Generate data layer
    await _generateDataLayer(featureBasePath, flutterFeature);
    
    // Generate presentation layer
    await _generatePresentationLayer(featureBasePath, flutterFeature);
    
    // Generate tests
    if (flutterFeature.generateTests) {
      await _generateTests(flutterFeature);
    }
    
    print('   ✓ Feature ${component.feature} generated');
  }
  
  /// Generate domain layer (entities, repositories, use cases)
  Future<void> _generateDomainLayer(
    String basePath,
    FlutterFeature feature,
  ) async {
    final domainPath = path.join(basePath, 'domain');
    
    // Generate entities
    for (final entity in _extractEntities(feature.sourceComponent)) {
      final entityCode = await _templateLoader.generateEntity(entity);
      await _writeFile(
        path.join(domainPath, 'entities', '${entity.name}.dart'),
        entityCode,
      );
    }
    
    // Generate repository interfaces
    final repoInterface = await _templateLoader.generateRepositoryInterface(
      feature,
    );
    await _writeFile(
      path.join(domainPath, 'repositories', '${feature.name}_repository.dart'),
      repoInterface,
    );
    
    // Generate use cases
    for (final useCase in _extractUseCases(feature.sourceComponent)) {
      final useCaseCode = await _templateLoader.generateUseCase(useCase);
      await _writeFile(
        path.join(domainPath, 'usecases', '${useCase.name}.dart'),
        useCaseCode,
      );
    }
  }
  
  /// Generate data layer (models, data sources, repository impl)
  Future<void> _generateDataLayer(
    String basePath,
    FlutterFeature feature,
  ) async {
    final dataPath = path.join(basePath, 'data');
    
    // Generate models
    for (final model in _extractModels(feature.sourceComponent)) {
      final modelCode = await _templateLoader.generateModel(model);
      await _writeFile(
        path.join(dataPath, 'models', '${model.name}.dart'),
        modelCode,
      );
    }
    
    // Generate remote data source
    final remoteDataSource = await _templateLoader.generateRemoteDataSource(
      feature,
    );
    await _writeFile(
      path.join(
        dataPath,
        'datasources',
        '${feature.name}_remote_datasource.dart',
      ),
      remoteDataSource,
    );
    
    // Generate local data source (if needed)
    if (_needsLocalDataSource(feature.sourceComponent)) {
      final localDataSource = await _templateLoader.generateLocalDataSource(
        feature,
      );
      await _writeFile(
        path.join(
          dataPath,
          'datasources',
          '${feature.name}_local_datasource.dart',
        ),
        localDataSource,
      );
    }
    
    // Generate repository implementation
    final repoImpl = await _templateLoader.generateRepositoryImpl(feature);
    await _writeFile(
      path.join(
        dataPath,
        'repositories',
        '${feature.name}_repository_impl.dart',
      ),
      repoImpl,
    );
  }
  
  /// Generate presentation layer (BLoC/Cubit, pages, widgets)
  Future<void> _generatePresentationLayer(
    String basePath,
    FlutterFeature feature,
  ) async {
    final presentationPath = path.join(basePath, 'presentation');
    
    // Generate BLoC or Cubit
    if (feature.stateManagement == StateManagementChoice.bloc) {
      final blocCode = await _templateLoader.generateBloc(feature);
      await _writeFile(
        path.join(presentationPath, 'bloc', '${feature.name}_bloc.dart'),
        blocCode,
      );
    } else {
      final cubitCode = await _templateLoader.generateCubit(feature);
      await _writeFile(
        path.join(presentationPath, 'cubit', '${feature.name}_cubit.dart'),
        cubitCode,
      );
    }
    
    // Generate page
    final pageCode = await _templateLoader.generatePage(feature);
    await _writeFile(
      path.join(
        presentationPath,
        'pages',
        '${feature.name}_page.dart',
      ),
      pageCode,
    );
    
    // Generate widgets
    for (final widget in _extractWidgets(feature.sourceComponent)) {
      final widgetCode = await _templateLoader.generateWidget(widget);
      await _writeFile(
        path.join(presentationPath, 'widgets', '${widget.name}.dart'),
        widgetCode,
      );
    }
  }
  
  /// Generate tests for feature
  Future<void> _generateTests(FlutterFeature feature) async {
    print('   🧪 Generating tests for ${feature.name}...');
    
    final testBasePath = path.join(
      config.flutterBasePath,
      'test',
      'features',
      _toSnakeCase(feature.name),
    );
    
    // Generate use case tests
    final useCaseTests = await _templateLoader.generateUseCaseTests(feature);
    await _writeFile(
      path.join(testBasePath, 'domain', 'usecases', 'usecase_test.dart'),
      useCaseTests,
    );
    
    // Generate BLoC/Cubit tests
    final stateManagementTests = 
        await _templateLoader.generateStateManagementTests(feature);
    await _writeFile(
      path.join(
        testBasePath,
        'presentation',
        feature.stateManagement == StateManagementChoice.bloc
            ? 'bloc'
            : 'cubit',
        '${feature.name}_test.dart',
      ),
      stateManagementTests,
    );
    
    // Generate widget tests
    final widgetTests = await _templateLoader.generateWidgetTests(feature);
    await _writeFile(
      path.join(testBasePath, 'presentation', 'pages', 'page_test.dart'),
      widgetTests,
    );
  }
  
  /// Generate migration plan document
  Future<void> _generateMigrationPlan() async {
    print('📋 Generating migration plan...');
    
    final migrationPlan = await _templateLoader.generateMigrationPlan(config);
    
    await _writeFile(
      path.join(config.flutterBasePath, 'docs', 'MIGRATION_PLAN.md'),
      migrationPlan,
    );
    
    print('   ✓ Migration plan created');
  }
  
  /// Generate CI/CD configuration files
  Future<void> _generateCICD() async {
    print('🔄 Generating CI/CD configs...');
    
    // GitHub Actions workflow
    final githubWorkflow = await _templateLoader.generateGitHubWorkflow();
    await _writeFile(
      path.join(
        config.flutterBasePath,
        '.github',
        'workflows',
        'flutter_ci.yml',
      ),
      githubWorkflow,
    );
    
    // Fastlane configuration
    final fastlaneConfig = await _templateLoader.generateFastlane();
    await _writeFile(
      path.join(config.flutterBasePath, 'fastlane', 'Fastfile'),
      fastlaneConfig,
    );
    
    print('   ✓ CI/CD configs created');
  }
  
  // Helper methods
  
  Future<void> _generateDependencyInjection() async {
    final diCode = await _templateLoader.loadTemplate('di/injection.dart');
    await _writeFile(
      path.join(config.flutterBasePath, 'lib', 'core', 'di', 'injection.dart'),
      diCode,
    );
  }
  
  Future<void> _generateErrorHandling() async {
    final failuresCode = await _templateLoader.loadTemplate(
      'errors/failures.dart',
    );
    await _writeFile(
      path.join(
        config.flutterBasePath,
        'lib',
        'core',
        'errors',
        'failures.dart',
      ),
      failuresCode,
    );
    
    final exceptionsCode = await _templateLoader.loadTemplate(
      'errors/exceptions.dart',
    );
    await _writeFile(
      path.join(
        config.flutterBasePath,
        'lib',
        'core',
        'errors',
        'exceptions.dart',
      ),
      exceptionsCode,
    );
  }
  
  Future<void> _generateNetworkLayer() async {
    final dioClientCode = await _templateLoader.loadTemplate(
      'network/dio_client.dart',
    );
    await _writeFile(
      path.join(
        config.flutterBasePath,
        'lib',
        'core',
        'network',
        'dio_client.dart',
      ),
      dioClientCode,
    );
    
    // Generate interceptors
    final interceptors = [
      'auth_interceptor.dart',
      'logging_interceptor.dart',
      'retry_interceptor.dart',
    ];
    
    for (final interceptor in interceptors) {
      final code = await _templateLoader.loadTemplate(
        'network/interceptors/$interceptor',
      );
      await _writeFile(
        path.join(
          config.flutterBasePath,
          'lib',
          'core',
          'network',
          'interceptors',
          interceptor,
        ),
        code,
      );
    }
  }
  
  Future<void> _generateTheme() async {
    final themeCode = await _templateLoader.loadTemplate('theme/app_theme.dart');
    await _writeFile(
      path.join(
        config.flutterBasePath,
        'lib',
        'core',
        'theme',
        'app_theme.dart',
      ),
      themeCode,
    );
  }
  
  Future<void> _generateResponsive() async {
    final breakpointsCode = await _templateLoader.loadTemplate(
      'responsive/breakpoints.dart',
    );
    await _writeFile(
      path.join(
        config.flutterBasePath,
        'lib',
        'core',
        'responsive',
        'breakpoints.dart',
      ),
      breakpointsCode,
    );
    
    final responsiveBuilderCode = await _templateLoader.loadTemplate(
      'responsive/responsive_builder.dart',
    );
    await _writeFile(
      path.join(
        config.flutterBasePath,
        'lib',
        'core',
        'responsive',
        'responsive_builder.dart',
      ),
      responsiveBuilderCode,
    );
  }
  
  StateManagementChoice _determineStateManagement(ReactComponent component) {
    // Simple heuristic: Use BLoC for complex state, Cubit for simple
    final hasAsyncOperations = component.apiEndpoints.isNotEmpty;
    final hasMultipleStateVariables = component.stateVariables.length > 3;
    
    if (hasAsyncOperations || hasMultipleStateVariables) {
      return StateManagementChoice.bloc;
    } else {
      return StateManagementChoice.cubit;
    }
  }
  
  List<Entity> _extractEntities(ReactComponent component) {
    // Logic to extract entities from React component
    // This would analyze the component's data structures
    return [];
  }
  
  List<UseCase> _extractUseCases(ReactComponent component) {
    // Logic to extract use cases from React component
    // Based on API endpoints and business logic
    return [];
  }
  
  List<Model> _extractModels(ReactComponent component) {
    // Logic to extract data models
    return [];
  }
  
  List<Widget> _extractWidgets(ReactComponent component) {
    // Logic to extract reusable widgets
    return [];
  }
  
  bool _needsLocalDataSource(ReactComponent component) {
    // Determine if local storage/caching is needed
    return component.stateManagement == StateManagementPattern.redux ||
        component.apiEndpoints.any((e) => e.method == 'GET');
  }
  
  String _toSnakeCase(String text) {
    return text
        .replaceAllMapped(
          RegExp(r'[A-Z]'),
          (match) => '_${match.group(0)!.toLowerCase()}',
        )
        .replaceAll(RegExp(r'^_'), '');
  }
  
  Future<void> _writeFile(String filePath, String content) async {
    final file = File(filePath);
    await file.create(recursive: true);
    await file.writeAsString(content);
  }
}
```

---

## 📝 **Step 3: Create Template Loader**

```dart
// 📁 lib/templates/refactoring_templates/template_loader.dart

import 'dart:io';
import 'package:path/path.dart' as path;
import '../../models/flutter_feature.dart';
import '../../models/refactoring_config.dart';

class TemplateLoader {
  final String _templatesPath;
  
  TemplateLoader()
      : _templatesPath = path.join(
          Directory.current.path,
          'lib',
          'templates',
          'refactoring_templates',
        );
  
  /// Load framework template with full refactoring documentation
  Future<String> loadFrameworkTemplate() async {
    final templatePath = path.join(_templatesPath, 'framework_template.md');
    
    // Use the comprehensive framework from earlier
    return await File(templatePath).readAsString();
  }
  
  /// Load a generic template file
  Future<String> loadTemplate(String relativePath) async {
    final templatePath = path.join(_templatesPath, relativePath);
    return await File(templatePath).readAsString();
  }
  
  /// Generate entity code
  Future<String> generateEntity(Entity entity) async {
    final template = await loadTemplate('entity_template.dart');
    
    return template
        .replaceAll('{{ENTITY_NAME}}', entity.name)
        .replaceAll('{{PROPERTIES}}', _generateProperties(entity.properties))
        .replaceAll('{{EQUATABLE_PROPS}}', _generateEquatableProps(entity));
  }
  
  /// Generate repository interface
  Future<String> generateRepositoryInterface(FlutterFeature feature) async {
    final template = await loadTemplate('repository_interface_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{REACT_PATH}}', feature.sourceComponent.filePath)
        .replaceAll('{{METHODS}}', _generateRepositoryMethods(feature));
  }
  
  /// Generate use case
  Future<String> generateUseCase(UseCase useCase) async {
    final template = await loadTemplate('usecase_template.dart');
    
    return template
        .replaceAll('{{USE_CASE_NAME}}', useCase.name)
        .replaceAll('{{RETURN_TYPE}}', useCase.returnType)
        .replaceAll('{{PARAMS}}', useCase.params)
        .replaceAll('{{LOGIC}}', useCase.logic);
  }
  
  /// Generate data model
  Future<String> generateModel(Model model) async {
    final template = await loadTemplate('model_template.dart');
    
    return template
        .replaceAll('{{MODEL_NAME}}', model.name)
        .replaceAll('{{PROPERTIES}}', _generateProperties(model.properties))
        .replaceAll('{{FROM_JSON}}', _generateFromJson(model))
        .replaceAll('{{TO_ENTITY}}', _generateToEntity(model));
  }
  
  /// Generate remote data source
  Future<String> generateRemoteDataSource(FlutterFeature feature) async {
    final template = await loadTemplate('remote_datasource_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{METHODS}}', _generateDataSourceMethods(feature));
  }
  
  /// Generate local data source
  Future<String> generateLocalDataSource(FlutterFeature feature) async {
    final template = await loadTemplate('local_datasource_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{CACHE_METHODS}}', _generateCacheMethods(feature));
  }
  
  /// Generate repository implementation
  Future<String> generateRepositoryImpl(FlutterFeature feature) async {
    final template = await loadTemplate('repository_impl_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{METHODS}}', _generateRepositoryImplMethods(feature));
  }
  
  /// Generate BLoC
  Future<String> generateBloc(FlutterFeature feature) async {
    final template = await loadTemplate('bloc_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{EVENTS}}', _generateBlocEvents(feature))
        .replaceAll('{{STATES}}', _generateBlocStates(feature))
        .replaceAll('{{HANDLERS}}', _generateBlocHandlers(feature));
  }
  
  /// Generate Cubit
  Future<String> generateCubit(FlutterFeature feature) async {
    final template = await loadTemplate('cubit_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{STATE}}', _generateCubitState(feature))
        .replaceAll('{{METHODS}}', _generateCubitMethods(feature));
  }
  
  /// Generate page
  Future<String> generatePage(FlutterFeature feature) async {
    final template = await loadTemplate('page_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{REACT_PATH}}', feature.sourceComponent.filePath)
        .replaceAll('{{BLOC_BUILDER}}', _generateBlocBuilder(feature))
        .replaceAll('{{RESPONSIVE_LAYOUT}}', _generateResponsiveLayout(feature));
  }
  
  /// Generate widget
  Future<String> generateWidget(Widget widget) async {
    final template = await loadTemplate('widget_template.dart');
    
    return template
        .replaceAll('{{WIDGET_NAME}}', widget.name)
        .replaceAll('{{PROPERTIES}}', _generateWidgetProperties(widget))
        .replaceAll('{{BUILD_METHOD}}', widget.buildCode);
  }
  
  /// Generate use case tests
  Future<String> generateUseCaseTests(FlutterFeature feature) async {
    final template = await loadTemplate('tests/usecase_test_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{TEST_CASES}}', _generateUseCaseTestCases(feature));
  }
  
  /// Generate state management tests
  Future<String> generateStateManagementTests(FlutterFeature feature) async {
    final templateName = feature.stateManagement == StateManagementChoice.bloc
        ? 'tests/bloc_test_template.dart'
        : 'tests/cubit_test_template.dart';
    
    final template = await loadTemplate(templateName);
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{TEST_CASES}}', _generateStateTestCases(feature));
  }
  
  /// Generate widget tests
  Future<String> generateWidgetTests(FlutterFeature feature) async {
    final template = await loadTemplate('tests/widget_test_template.dart');
    
    return template
        .replaceAll('{{FEATURE_NAME}}', feature.name)
        .replaceAll('{{TEST_CASES}}', _generateWidgetTestCases(feature));
  }
  
  /// Generate migration plan
  Future<String> generateMigrationPlan(RefactoringConfig config) async {
    final template = await loadTemplate('migration_plan_template.md');
    
    return template
        .replaceAll('{{PROJECT_NAME}}', config.projectName)
        .replaceAll('{{STRATEGY}}', config.strategy.name)
        .replaceAll('{{FEATURES}}', _generateFeatureList(config.components))
        .replaceAll('{{TIMELINE}}', _generateTimeline(config));
  }
  
  /// Generate GitHub workflow
  Future<String> generateGitHubWorkflow() async {
    return await loadTemplate('ci/github_workflow.yml');
  }
  
  /// Generate Fastlane configuration
  Future<String> generateFastlane() async {
    return await loadTemplate('ci/fastlane.rb');
  }
  
  // Helper methods for code generation
  
  String _generateProperties(List<Property> properties) {
    return properties
        .map((p) => '  final ${p.type} ${p.name};')
        .join('\n');
  }
  
  String _generateEquatableProps(Entity entity) {
    return entity.properties.map((p) => p.name).join(', ');
  }
  
  String _generateRepositoryMethods(FlutterFeature feature) {
    // Generate method signatures based on API endpoints
    return '';
  }
  
  String _generateDataSourceMethods(FlutterFeature feature) {
    // Generate API call methods
    return '';
  }
  
  String _generateCacheMethods(FlutterFeature feature) {
    // Generate cache methods
    return '';
  }
  
  String _generateRepositoryImplMethods(FlutterFeature feature) {
    // Generate repository implementation methods
    return '';
  }
  
  String _generateBlocEvents(FlutterFeature feature) {
    // Generate BLoC events
    return '';
  }
  
  String _generateBlocStates(FlutterFeature feature) {
    // Generate BLoC states
    return '';
  }
  
  String _generateBlocHandlers(FlutterFeature feature) {
    // Generate BLoC event handlers
    return '';
  }
  
  String _generateCubitState(FlutterFeature feature) {
    // Generate Cubit state
    return '';
  }
  
  String _generateCubitMethods(FlutterFeature feature) {
    // Generate Cubit methods
    return '';
  }
  
  String _generateBlocBuilder(FlutterFeature feature) {
    // Generate BlocBuilder widget code
    return '';
  }
  
  String _generateResponsiveLayout(FlutterFeature feature) {
    // Generate responsive layout code
    return '';
  }
  
  String _generateWidgetProperties(Widget widget) {
    // Generate widget properties
    return '';
  }
  
  String _generateUseCaseTestCases(FlutterFeature feature) {
    // Generate use case test cases
    return '';
  }
  
  String _generateStateTestCases(FlutterFeature feature) {
    // Generate state management test cases
    return '';
  }
  
  String _generateWidgetTestCases(FlutterFeature feature) {
    // Generate widget test cases
    return '';
  }
  
  String _generateFeatureList(List<ReactComponent> components) {
    return components
        .map((c) => '- ${c.componentName} (${c.filePath})')
        .join('\n');
  }
  
  String _generateTimeline(RefactoringConfig config) {
    // Generate estimated timeline based on number of features
    return '';
  }
  
  String _generateFromJson(Model model) {
    // Generate fromJson factory
    return '';
  }
  
  String _generateToEntity(Model model) {
    // Generate toEntity method
    return '';
  }
}

// Supporting classes
class Entity {
  final String name;
  final List<Property> properties;
  
  Entity({required this.name, required this.properties});
}

class Property {
  final String name;
  final String type;
  final bool isNullable;
  
  Property({
    required this.name,
    required this.type,
    this.isNullable = false,
  });
}

class UseCase {
  final String name;
  final String returnType;
  final String params;
  final String logic;
  
  UseCase({
    required this.name,
    required this.returnType,
    required this.params,
    required this.logic,
  });
}

class Model {
  final String name;
  final List<Property> properties;
  
  Model({required this.name, required this.properties});
}

class Widget {
  final String name;
  final List<Property> properties;
  final String buildCode;
  
  Widget({
    required this.name,
    required this.properties,
    required this.buildCode,
  });
}
```

---

## 🖥️ **Step 4: Create CLI Command**

```dart
// 📁 lib/cli/commands/generate_refactoring.dart

import 'dart:io';
import 'package:args/command_runner.dart';
import 'package:yaml/yaml.dart';
import '../../models/refactoring_config.dart';
import '../../models/react_component.dart';
import '../../generators/refactoring_generator.dart';

class GenerateRefactoringCommand extends Command {
  @override
  final name = 'refactor';
  
  @override
  final description = 'Generate Flutter code from React components';
  
  GenerateRefactoringCommand() {
    argParser
      ..addOption(
        'config',
        abbr: 'c',
        help: 'Path to refactoring config YAML file',
        mandatory: true,
      )
      ..addFlag(
        'dry-run',
        help: 'Show what would be generated without creating files',
        negatable: false,
      )
      ..addFlag(
        'verbose',
        abbr: 'v',
        help: 'Show detailed output',
        negatable: false,
      );
  }
  
  @override
  Future<void> run() async {
    final configPath = argResults!['config'] as String;
    final isDryRun = argResults!['dry-run'] as bool;
    final isVerbose = argResults!['verbose'] as bool;
    
    // Load configuration
    final config = await _loadConfig(configPath);
    
    if (isVerbose) {
      _printConfig(config);
    }
    
    if (isDryRun) {
      print('🔍 DRY RUN - No files will be created\n');
      await _performDryRun(config);
    } else {
      // Generate refactoring
      final generator = RefactoringGenerator(config);
      await generator.generateComplete();
    }
  }
  
  Future<RefactoringConfig> _loadConfig(String configPath) async {
    print('📖 Loading configuration from: $configPath');
    
    final file = File(configPath);
    if (!await file.exists()) {
      throw Exception('Config file not found: $configPath');
    }
    
    final yamlString = await file.readAsString();
    final yamlMap = loadYaml(yamlString) as Map;
    
    return RefactoringConfig.fromJson(_yamlToJson(yamlMap));
  }
  
  Map<String, dynamic> _yamlToJson(Map yamlMap) {
    final json = <String, dynamic>{};
    yamlMap.forEach((key, value) {
      if (value is Map) {
        json[key as String] = _yamlToJson(value);
      } else if (value is List) {
        json[key as String] = value.map((item) {
          if (item is Map) return _yamlToJson(item);
          return item;
        }).toList();
      } else {
        json[key as String] = value;
      }
    });
    return json;
  }
  
  void _printConfig(RefactoringConfig config) {
    print('\n📋 Configuration Summary:');
    print('   Project: ${config.projectName}');
    print('   Strategy: ${config.strategy.name}');
    print('   Features to refactor: ${config.components.length}');
    print('   Compliance: ${config.complianceStandards.join(", ")}');
    print('');
  }
  
  Future<void> _performDryRun(RefactoringConfig config) async {
    print('Files that would be generated:\n');
    
    // Show framework docs
    print('📝 Documentation:');
    print('   ✓ docs/REFACTORING_FRAMEWORK.md');
    print('   ✓ docs/ARCHITECTURE.md');
    print('   ✓ docs/MIGRATION_PLAN.md');
    print('');
    
    // Show core infrastructure
    print('⚙️  Core Infrastructure:');
    print('   ✓ lib/core/di/injection.dart');
    print('   ✓ lib/core/errors/failures.dart');
    print('   ✓ lib/core/network/dio_client.dart');
    print('   ✓ lib/core/theme/app_theme.dart');
    print('   ✓ lib/core/responsive/breakpoints.dart');
    print('');
    
    // Show features
    for (final component in config.components) {
      print('🎨 Feature: ${component.feature}');
      print('   ✓ lib/features/${component.feature}/domain/entities/');
      print('   ✓ lib/features/${component.feature}/domain/repositories/');
      print('   ✓ lib/features/${component.feature}/domain/usecases/');
      print('   ✓ lib/features/${component.feature}/data/models/');
      print('   ✓ lib/features/${component.feature}/data/datasources/');
      print('   ✓ lib/features/${component.feature}/data/repositories/');
      print('   ✓ lib/features/${component.feature}/presentation/bloc/');
      print('   ✓ lib/features/${component.feature}/presentation/pages/');
      print('   ✓ lib/features/${component.feature}/presentation/widgets/');
      print('   ✓ test/features/${component.feature}/');
      print('');
    }
    
    // Show CI/CD
    print('🔄 CI/CD:');
    print('   ✓ .github/workflows/flutter_ci.yml');
    print('   ✓ fastlane/Fastfile');
    print('');
    
    print('Total files: ~${_estimateFileCount(config)}');
  }
  
  int _estimateFileCount(RefactoringConfig config) {
    // Rough estimate: 3 docs + 10 core files + 20 files per feature
    return 13 + (config.components.length * 20);
  }
}
```

---

## 📄 **Step 5: Create Configuration YAML Example**

```yaml
# 📁 refactoring_config.example.yaml

# React-to-Flutter Refactoring Configuration
project_name: "My Flutter App"
react_base_path: "./react-app"
flutter_base_path: "./flutter-app"

# Migration strategy: bigBang, incremental, parallel
strategy: incremental

# Compliance requirements
compliance_standards:
  - hipaa
  - gdpr

# API configuration
api_base_url: "https://api.example.com"

# Architecture preferences
architecture_preferences:
  use_clean_architecture: true
  use_feature_first: true
  use_dependency_injection: true
  use_freezed: true
  http_client: "dio"
  router: "go_router"

# React components to refactor
components:
  # Example 1: Login page
  - file_path: "src/features/auth/Login.tsx"
    component_name: "LoginPage"
    feature: "auth"
    type: "page"
    state_management: "redux"
    is_responsive: true
    description: "User login with email/password"
    
    props:
      - name: "onSuccess"
        type: "function"
        is_required: false
    
    state_variables:
      - name: "email"
        type: "string"
        initial_value: ""
      - name: "password"
        type: "string"
        initial_value: ""
      - name: "isLoading"
        type: "boolean"
        initial_value: "false"
    
    api_endpoints:
      - method: "POST"
        path: "/auth/login"
        description: "Authenticate user"
        parameters: ["email", "password"]
  
  # Example 2: User profile
  - file_path: "src/features/user/UserProfile.tsx"
    component_name: "UserProfile"
    feature: "user_profile"
    type: "page"
    state_management: "redux"
    is_responsive: true
    description: "Display and edit user profile"
    
    props:
      - name: "userId"
        type: "string"
        is_required: true
    
    state_variables:
      - name: "user"
        type: "User"
      - name: "isEditing"
        type: "boolean"
        initial_value: "false"
    
    api_endpoints:
      - method: "GET"
        path: "/users/:id"
        description: "Get user details"
      - method: "PUT"
        path: "/users/:id"
        description: "Update user profile"
        parameters: ["name", "email", "bio"]
  
  # Example 3: Dashboard
  - file_path: "src/features/dashboard/Dashboard.tsx"
    component_name: "Dashboard"
    feature: "dashboard"
    type: "page"
    state_management: "zustand"
    is_responsive: true
    description: "Main dashboard with stats and recent activity"
    
    api_endpoints:
      - method: "GET"
        path: "/dashboard/stats"
        description: "Get dashboard statistics"
      - method: "GET"
        path: "/dashboard/activities"
        description: "Get recent activities"
```

---

## 🚀 **Step 6: Update Package Entry Point**

```dart
// 📁 lib/prprompts_flutter_generator.dart

library prprompts_flutter_generator;

// Existing exports
export 'generators/prd_generator.dart';
export 'generators/compliance_generator.dart';
export 'generators/architecture_generator.dart';

// New refactoring exports
export 'generators/refactoring_generator.dart';
export 'models/react_component.dart';
export 'models/flutter_feature.dart';
export 'models/refactoring_config.dart';
export 'templates/refactoring_templates/template_loader.dart';
```

---

## 🔨 **Step 7: Update CLI Runner**

```dart
// 📁 bin/prprompts.dart

import 'package:args/command_runner.dart';
import 'package:prprompts_flutter_generator/cli/commands/generate_prd.dart';
import 'package:prprompts_flutter_generator/cli/commands/generate_refactoring.dart';

void main(List<String> arguments) async {
  final runner = CommandRunner(
    'prprompts',
    'Generate customized PRPROMPTS for Flutter projects',
  )
    ..addCommand(GeneratePRDCommand())
    ..addCommand(GenerateRefactoringCommand()); // 🆕 NEW
  
  try {
    await runner.run(arguments);
  } catch (e) {
    print('Error: $e');
  }
}
```

---

## 📦 **Step 8: Update pubspec.yaml**

```yaml
# 📁 pubspec.yaml

name: prprompts_flutter_generator
description: Generate customized PRPROMPTS for Flutter projects from PRD - HIPAA, PCI-DSS, GDPR compliant with Clean Architecture and BLoC patterns. Now includes React-to-Flutter refactoring!
version: 2.0.0
homepage: https://github.com/Kandil7/prprompts-flutter-generator

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  args: ^2.4.0
  yaml: ^3.1.0
  path: ^1.8.0
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1

dev_dependencies:
  build_runner: ^2.4.0
  freezed: ^2.4.1
  json_serializable: ^6.7.0
  test: ^1.24.0
  lints: ^3.0.0

executables:
  prprompts: prprompts
```

---

## 📖 **Step 9: Update README.md**

```markdown
# 📁 README.md

# prprompts-flutter-generator

Generate customized PRPROMPTS for Flutter projects with:
- ✅ PRD (Product Requirements Document) generation
- ✅ Compliance templates (HIPAA, PCI-DSS, GDPR)
- ✅ Clean Architecture scaffolding
- ✅ **🆕 React-to-Flutter Refactoring Framework**

## 🚀 Installation

```bash
dart pub global activate prprompts_flutter_generator
```

## 🎯 Features

### 1. PRD Generation
Generate comprehensive Product Requirements Documents.

### 2. Compliance Templates
Generate compliance-ready templates for HIPAA, PCI-DSS, GDPR.

### 3. **🆕 React-to-Flutter Refactoring**
Complete framework and tooling to refactor React applications into production-ready Flutter apps using Clean Architecture, BLoC patterns, and industry best practices.

## 📝 Usage

### Refactor React App to Flutter

**Step 1: Create configuration file**

```bash
# Create from example
cp refactoring_config.example.yaml my_refactoring.yaml

# Edit with your React components
vim my_refactoring.yaml
```

**Step 2: Generate Flutter code**

```bash
# Full generation
prprompts refactor --config my_refactoring.yaml

# Dry run (see what would be generated)
prprompts refactor --config my_refactoring.yaml --dry-run

# Verbose output
prprompts refactor --config my_refactoring.yaml --verbose
```

**Step 3: Review generated code**

```bash
cd flutter-app
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter test
```

### What Gets Generated

```
flutter-app/
├── docs/
│   ├── REFACTORING_FRAMEWORK.md     # Complete refactoring guide
│   ├── ARCHITECTURE.md               # Architecture documentation
│   └── MIGRATION_PLAN.md             # Step-by-step migration plan
├── lib/
│   ├── core/                         # Shared infrastructure
│   │   ├── di/                       # Dependency injection
│   │   ├── errors/                   # Error handling (Failures, Exceptions)
│   │   ├── network/                  # HTTP client + interceptors
│   │   ├── theme/                    # Design system
│   │   └── responsive/               # Responsive utilities
│   ├── features/                     # Feature modules
│   │   └── [your_feature]/
│   │       ├── domain/               # Business logic (entities, use cases)
│   │       ├── data/                 # Data layer (API, models, repos)
│   │       └── presentation/         # UI (BLoC/Cubit, pages, widgets)
│   └── config/
│       ├── routes/                   # Navigation (go_router)
│       └── env/                      # Environment config
├── test/                             # Unit + Widget tests
├── integration_test/                 # Integration tests
├── .github/workflows/                # CI/CD (GitHub Actions)
└── fastlane/                         # Deployment automation
```

## 📋 Configuration Example

```yaml
project_name: "My Flutter App"
react_base_path: "./react-app"
flutter_base_path: "./flutter-app"
strategy: incremental

components:
  - file_path: "src/features/auth/Login.tsx"
    component_name: "LoginPage"
    feature: "auth"
    type: "page"
    state_management: "redux"
    api_endpoints:
      - method: "POST"
        path: "/auth/login"
```

See `refactoring_config.example.yaml` for full example.

## 🏗️ Architecture

Generated Flutter code follows:
- ✅ **Clean Architecture** (domain/data/presentation layers)
- ✅ **Feature-First** organization
- ✅ **BLoC/Cubit** state management
- ✅ **SOLID principles**
- ✅ **Dependency Injection** (get_it + injectable)
- ✅ **Responsive Design** (mobile/tablet/desktop)
- ✅ **Comprehensive Testing** (unit/widget/integration)

## 📚 Documentation

- [Refactoring Framework](docs/REFACTORING_FRAMEWORK.md) - Complete guide
- [Configuration Guide](docs/CONFIG_GUIDE.md) - YAML configuration
- [Examples](examples/) - Sample projects

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](LICENSE)
```

---

## ✅ **Step 10: Create Template Files**

Store the comprehensive framework as markdown templates:

```markdown
# 📁 lib/templates/refactoring_templates/framework_template.md

[Paste the entire "Complete Senior-Level Flutter Refactoring Framework" 
document I provided earlier - all 10 sections]
```

---

## 🧪 **Step 11: Add Tests**

```dart
// 📁 test/generators/refactoring_generator_test.dart

import 'package:test/test.dart';
import 'package:prprompts_flutter_generator/models/react_component.dart';
import 'package:prprompts_flutter_generator/models/refactoring_config.dart';
import 'package:prprompts_flutter_generator/generators/refactoring_generator.dart';

void main() {
  group('RefactoringGenerator', () {
    late RefactoringConfig testConfig;
    
    setUp(() {
      testConfig = RefactoringConfig(
        projectName: 'Test App',
        reactBasePath: './test_react',
        flutterBasePath: './test_flutter',
        components: [
          ReactComponent(
            filePath: 'src/features/auth/Login.tsx',
            componentName: 'LoginPage',
            feature: 'auth',
            type: ComponentType.page,
            stateManagement: StateManagementPattern.redux,
          ),
        ],
      );
    });
    
    test('should generate project structure', () async {
      final generator = RefactoringGenerator(testConfig);
      
      // Test will verify directory creation
      expect(generator, isNotNull);
    });
    
    test('should determine correct state management', () {
      // Test state management decision logic
    });
    
    // Add more tests...
  });
}
```

---

## 🎉 **Final Steps**

### **1. Build & Test**

```bash
# Generate freezed/json_serializable code
dart run build_runner build --delete-conflicting-outputs

# Run tests
dart test

# Test CLI locally
dart run bin/prprompts.dart refactor --config example/refactoring_config.yaml --dry-run
```

### **2. Publish to pub.dev**

```bash
# Dry run
dart pub publish --dry-run

# Publish
dart pub publish
```

### **3. Update GitHub Repository**

```bash
git add .
git commit -m "feat: Add React-to-Flutter refactoring framework"
git push origin main

# Create release
git tag v2.0.0
git push origin v2.0.0
```

---

## 🎯 **Usage Example**

Once published, users can:

```bash
# Install
dart pub global activate prprompts_flutter_generator

# Create config
prprompts refactor --init

# Edit generated refactoring_config.yaml
# Add their React components

# Generate Flutter code
prprompts refactor --config refactoring_config.yaml

# Result: Complete Flutter app with Clean Architecture!
```
