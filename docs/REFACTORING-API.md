# Refactoring System API Documentation

Programmatic API for the PRPROMPTS React-to-Flutter refactoring system.

## Table of Contents

- [Node.js API](#nodejs-api)
- [Dart API](#dart-api)
- [CLI Integration](#cli-integration)
- [Configuration Schema](#configuration-schema)
- [Events & Hooks](#events--hooks)

## Node.js API

### RefactorCommand

Main command for converting React to Flutter.

```javascript
const { RefactorCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/RefactorCommand');

const command = new RefactorCommand({
  reactSource: './my-react-app/src',
  flutterTarget: './my-flutter-app/lib',
  ai: 'claude',              // 'claude' | 'qwen' | 'gemini' | 'none'
  validate: true,
  stateManagement: 'bloc',   // 'bloc' | 'cubit' | 'provider' | 'auto'
  architecture: 'clean',     // 'clean' | 'mvc' | 'mvvm'
  dryRun: false,
  verbose: true
});

const result = await command.execute();

if (result.success) {
  console.log('Conversion successful!');
  console.log(`Features converted: ${result.featuresConverted}`);
  console.log(`Files generated: ${result.filesGenerated}`);
} else {
  console.error('Conversion failed:', result.errors);
}
```

**Return Type:**

```typescript
interface RefactorResult {
  success: boolean;
  featuresConverted: number;
  filesGenerated: number;
  linesOfCode: number;
  duration: number;        // milliseconds
  errors: Error[];
  warnings: string[];
  artifacts: {
    diffs: string[];
    files: string[];
    logs: string[];
  };
}
```

### AnalyzeCommand

Analyze React project structure and complexity.

```javascript
const { AnalyzeCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/AnalyzeCommand');

const command = new AnalyzeCommand({
  reactSource: './my-react-app/src',
  format: 'json',           // 'json' | 'markdown' | 'html' | 'terminal'
  output: './analysis.json',
  detailed: true,
  estimate: true
});

const result = await command.execute();

console.log('Analysis:', result.analysis);
```

**Return Type:**

```typescript
interface AnalysisResult {
  success: boolean;
  analysis: {
    project: {
      name: string;
      path: string;
      size: number;        // bytes
      filesCount: number;
      linesOfCode: number;
    };
    features: Feature[];
    components: ComponentInfo[];
    stateManagement: StateManagementInfo;
    techStack: TechnologyInfo[];
    complexity: {
      score: number;       // 0-100
      level: 'low' | 'medium' | 'high' | 'very-high';
      factors: ComplexityFactor[];
    };
    estimate: {
      manual: {
        hours: number;
        range: [number, number];
        breakdown: Record<string, number>;
      };
      automated: {
        hours: number;
        range: [number, number];
        efficiency: number;  // percentage
      };
    };
  };
}
```

### ProgressCommand

Monitor conversion progress.

```javascript
const { ProgressCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/ProgressCommand');

const command = new ProgressCommand({
  watch: true,             // Enable watch mode
  detailed: true,
  json: false
});

// Subscribe to progress updates
command.on('progress', (data) => {
  console.log(`Overall: ${data.overallProgress}%`);
  console.log(`Features: ${data.completedFeatures}/${data.totalFeatures}`);
});

await command.execute();
```

**Events:**

```typescript
interface ProgressData {
  overallProgress: number;          // 0-100
  totalFeatures: number;
  completedFeatures: number;
  inProgressFeatures: number;
  pendingFeatures: number;
  totalComponents: number;
  completedComponents: number;
  elapsedTime: number;              // milliseconds
  estimatedTimeRemaining: number;   // milliseconds
  averageTimePerFeature: number;    // milliseconds
}
```

### PreviewCommand

Preview changes before applying.

```javascript
const { PreviewCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/PreviewCommand');

const command = new PreviewCommand({
  feature: 'authentication',
  split: true,             // Side-by-side view
  stats: false,
  html: './preview.html',
  interactive: false
});

const result = await command.execute();

console.log('Diff:', result.diff);
console.log('Statistics:', result.statistics);
```

**Return Type:**

```typescript
interface PreviewResult {
  success: boolean;
  feature: string;
  diff: string;            // Unified diff format
  statistics: {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  };
  files: {
    path: string;
    status: 'added' | 'modified' | 'deleted';
    diff: string;
  }[];
}
```

### ApplyCommand

Apply converted code for a feature.

```javascript
const { ApplyCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/ApplyCommand');

const command = new ApplyCommand({
  feature: 'authentication',
  validate: true,
  backup: true,
  force: false,
  dryRun: false
});

const result = await command.execute();

if (result.success) {
  console.log('Applied successfully!');
  console.log(`Files written: ${result.filesWritten}`);
} else if (result.conflicts.length > 0) {
  console.error('Conflicts detected:', result.conflicts);
}
```

**Return Type:**

```typescript
interface ApplyResult {
  success: boolean;
  feature: string;
  filesWritten: number;
  backupPath?: string;
  conflicts: {
    file: string;
    type: 'merge' | 'overwrite' | 'content';
    resolution?: 'ours' | 'theirs' | 'manual';
  }[];
  validationErrors: string[];
}
```

### ConfigCommand

Manage refactoring configuration.

```javascript
const { ConfigCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/ConfigCommand');

// Load configuration
const loadCmd = new ConfigCommand({
  action: 'show'
});
const config = await loadCmd.execute();

// Edit configuration
const editCmd = new ConfigCommand({
  action: 'edit',
  interactive: true
});
await editCmd.execute();

// Save as profile
const saveCmd = new ConfigCommand({
  action: 'save',
  profile: 'my-project'
});
await saveCmd.execute();
```

### ValidateCommand

Validate Flutter code quality.

```javascript
const { ValidateCommand } = require('prprompts-flutter-generator/lib/refactoring/cli/ValidateCommand');

const command = new ValidateCommand({
  flutterPath: './my-flutter-app',
  config: 'strict',        // 'standard' | 'strict' | 'custom'
  format: 'terminal',      // 'terminal' | 'json' | 'html'
  output: './validation-report.html',
  threshold: 80,
  fix: false,
  ci: false
});

const result = await command.execute();

console.log(`Score: ${result.score}/100`);
console.log(`Issues: ${result.issues.length}`);
```

**Return Type:**

```typescript
interface ValidationResult {
  success: boolean;
  score: number;           // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: {
    architecture: CategoryResult;
    codeQuality: CategoryResult;
    security: CategoryResult;
    performance: CategoryResult;
    accessibility: CategoryResult;
    testing: CategoryResult;
  };
  issues: Issue[];
  fixed: string[];
}

interface CategoryResult {
  score: number;
  weight: number;
  passed: number;
  failed: number;
  issues: Issue[];
}

interface Issue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  rule: string;
  message: string;
  file: string;
  line: number;
  column: number;
  fixable: boolean;
  fixed: boolean;
}
```

## Dart API

### RefactorEngine

Dart code refactoring engine.

```dart
import 'package:dart_refactor/engine.dart';

final engine = RefactorEngine(
  rootPath: '/path/to/flutter/project',
  formatCode: true,
  optimizeImports: true,
  inferTypes: true,
  extractWidgets: true,
  resolveNaming: true,
);

final result = await engine.processFile('lib/features/auth/login.dart');

if (result.success) {
  print('Refactored successfully!');
  print('Changes: ${result.hasChanges}');
  print('Diff:\n${result.diff}');

  // Write refactored content
  File(result.filePath).writeAsStringSync(result.newContent);
} else {
  print('Errors: ${result.errors}');
}
```

**Return Type:**

```dart
class RefactorResult {
  final bool success;
  final String filePath;
  final String originalContent;
  final String newContent;
  final bool hasChanges;
  final String diff;
  final List<String> errors;
  final List<String> warnings;
  final Map<String, dynamic> metadata;
}
```

### ImportOptimizer

Optimize imports in Dart files.

```dart
import 'package:dart_refactor/strategies/import_optimizer.dart';

final optimizer = ImportOptimizer();

final edits = optimizer.optimize(compilationUnit, libraryElement);

for (final edit in edits) {
  print('${edit.type}: ${edit.offset} - ${edit.length}');
}
```

### TypeInferencer

Infer types for var/final declarations.

```dart
import 'package:dart_refactor/strategies/type_inferencer.dart';

final inferencer = TypeInferencer();

final edits = inferencer.infer(compilationUnit);

// Edits contain type annotations to be added
```

### DiffGenerator

Generate unified diffs.

```dart
import 'package:dart_refactor/utils/diff_generator.dart';

final diff = DiffGenerator.generateUnifiedDiff(
  originalContent,
  modifiedContent,
  'lib/my_file.dart',
);

print(diff);
```

## CLI Integration

### Stdin/Stdout Protocol

The Dart refactor engine communicates via JSON over stdin/stdout:

**Request:**

```json
{
  "files": [
    "/path/to/file1.dart",
    "/path/to/file2.dart"
  ],
  "options": {
    "formatCode": true,
    "optimizeImports": true,
    "inferTypes": true,
    "extractWidgets": false,
    "resolveNaming": true
  }
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "filePath": "/path/to/file1.dart",
      "success": true,
      "hasChanges": true,
      "diff": "--- original\n+++ modified\n...",
      "edits": [
        {
          "offset": 10,
          "length": 5,
          "replacement": "String"
        }
      ],
      "metadata": {
        "importsRemoved": 2,
        "typesInferred": 5,
        "widgetsExtracted": 0
      }
    }
  ],
  "errors": []
}
```

### Node.js → Dart Communication

```javascript
const { spawn } = require('child_process');

function callDartRefactor(files, options) {
  return new Promise((resolve, reject) => {
    const dart = spawn('dart', ['run', 'bin/refactor.dart'], {
      cwd: './tools/dart-refactor'
    });

    const request = JSON.stringify({ files, options });
    dart.stdin.write(request);
    dart.stdin.end();

    let output = '';
    dart.stdout.on('data', (data) => {
      output += data.toString();
    });

    dart.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error(`Dart process exited with code ${code}`));
      }
    });
  });
}

// Usage
const result = await callDartRefactor(
  ['lib/features/auth/login.dart'],
  { formatCode: true, optimizeImports: true }
);
```

## Configuration Schema

### Full Configuration Schema

```typescript
interface RefactoringConfig {
  stateManagement: StateManagementConfig;
  architecture: ArchitectureConfig;
  ui: UIConfig;
  assets: AssetsConfig;
  llm: LLMConfig;
  git: GitConfig;
  advanced: AdvancedConfig;
}

interface StateManagementConfig {
  default: 'bloc' | 'cubit' | 'provider' | 'riverpod' | 'getx';
  useState: 'bloc' | 'cubit' | 'provider';
  useReducer: 'bloc' | 'cubit';
  redux: 'bloc' | 'riverpod';
  contextAPI: 'provider' | 'riverpod';
}

interface ArchitectureConfig {
  style: 'clean' | 'mvc' | 'mvvm';
  featureFirst: boolean;
  layerSeparation: boolean;
  domainDriven: boolean;
}

interface UIConfig {
  componentMapping: 'material' | 'cupertino' | 'custom';
  themingApproach: 'flutter_theme' | 'styled_components' | 'custom';
  responsiveDesign: boolean;
  darkModeSupport: boolean;
}

interface AssetsConfig {
  imageOptimization: boolean;
  svgHandling: 'flutter_svg' | 'vector_graphics' | 'skip';
  fontConversion: boolean;
  multiResolution: boolean;
  compression: {
    jpeg: number;          // 0-100
    png: number;           // 0-100
  };
}

interface LLMConfig {
  provider: 'claude' | 'gemini' | 'qwen' | 'none';
  model: string;
  maxTokens: number;
  temperature: number;     // 0-1
  fallbackProvider?: string;
}

interface GitConfig {
  mode: 'branch' | 'patch' | 'none';
  branchPrefix: string;
  autoCommit: boolean;
  requireCleanTree: boolean;
}

interface AdvancedConfig {
  parallelProcessing: boolean;
  maxConcurrency: number;
  cacheEnabled: boolean;
  cacheExpiry: number;     // milliseconds
  verboseLogging: boolean;
}
```

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Refactoring Configuration",
  "type": "object",
  "properties": {
    "stateManagement": {
      "type": "object",
      "properties": {
        "default": {
          "enum": ["bloc", "cubit", "provider", "riverpod", "getx"]
        }
      }
    },
    "architecture": {
      "type": "object",
      "properties": {
        "style": {
          "enum": ["clean", "mvc", "mvvm"]
        },
        "featureFirst": { "type": "boolean" }
      }
    }
  }
}
```

## Events & Hooks

### Event Emitters

All command classes extend EventEmitter:

```javascript
const { RefactorCommand } = require('...');

const command = new RefactorCommand(options);

// Progress events
command.on('feature:start', (feature) => {
  console.log(`Starting feature: ${feature.name}`);
});

command.on('feature:complete', (feature, result) => {
  console.log(`Completed: ${feature.name} (${result.filesGenerated} files)`);
});

command.on('feature:error', (feature, error) => {
  console.error(`Error in ${feature.name}:`, error);
});

// Component events
command.on('component:parse', (component) => {
  console.log(`Parsing: ${component.name}`);
});

command.on('component:generate', (component, code) => {
  console.log(`Generated: ${component.name} (${code.length} chars)`);
});

// File events
command.on('file:write', (filePath) => {
  console.log(`Written: ${filePath}`);
});

command.on('file:skip', (filePath, reason) => {
  console.log(`Skipped: ${filePath} (${reason})`);
});

// Validation events
command.on('validation:start', () => {
  console.log('Starting validation...');
});

command.on('validation:complete', (result) => {
  console.log(`Validation score: ${result.score}/100`);
});

await command.execute();
```

### Lifecycle Hooks

Define custom hooks in configuration:

```javascript
const config = {
  hooks: {
    beforeConversion: async (context) => {
      console.log('Running pre-conversion checks...');
      // Custom validation, backups, etc.
    },

    afterFeature: async (feature, result) => {
      console.log(`Feature ${feature.name} completed`);
      // Custom post-processing, notifications, etc.
    },

    beforeFileWrite: async (filePath, content) => {
      console.log(`About to write: ${filePath}`);
      // Custom validation, formatting, etc.
      return content; // Return modified content or original
    },

    afterConversion: async (result) => {
      console.log('Conversion complete!');
      // Custom reporting, deployment, etc.
    },

    onError: async (error, context) => {
      console.error('Error occurred:', error);
      // Custom error handling, rollback, etc.
    }
  }
};

const command = new RefactorCommand({ ...options, hooks: config.hooks });
```

## Testing API

### Mock Refactoring

For testing purposes:

```javascript
const { MockRefactorCommand } = require('prprompts-flutter-generator/lib/refactoring/test-utils');

const mock = new MockRefactorCommand({
  reactSource: './fixtures/react-app',
  flutterTarget: './fixtures/flutter-app',
  dryRun: true
});

const result = await mock.execute();

expect(result.success).toBe(true);
expect(result.featuresConverted).toBe(5);
```

### Test Utilities

```javascript
const {
  createMockComponent,
  createMockFeature,
  createMockConfig
} = require('prprompts-flutter-generator/lib/refactoring/test-utils');

const component = createMockComponent({
  name: 'LoginForm',
  type: 'functional',
  props: ['onSubmit', 'loading'],
  state: ['email', 'password']
});

const feature = createMockFeature({
  name: 'authentication',
  components: [component]
});

const config = createMockConfig({
  stateManagement: { default: 'bloc' },
  architecture: { style: 'clean' }
});
```

---

**Version**: 5.0.0
**Last Updated**: January 2025
