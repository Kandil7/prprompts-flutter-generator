# React-to-Flutter Refactoring System

Complete guide for the PRPROMPTS React-to-Flutter refactoring system with Clean Architecture and BLoC pattern support.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Configuration](#configuration)
- [Workflow](#workflow)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## Overview

The PRPROMPTS refactoring system converts React/React Native applications to Flutter using:

- **AST-based conversion** - Direct code transformation without LLM overhead
- **Clean Architecture** - Feature-first organization with domain/data/presentation layers
- **BLoC Pattern** - Business Logic Component state management
- **Incremental conversion** - Convert and apply features one at a time
- **Git integration** - Safe branch-based workflow with conflict resolution

### Key Features

✅ **Automated conversion** - React components → Flutter widgets
✅ **State management** - useState/useReducer/Redux → BLoC/Cubit
✅ **Asset optimization** - Multi-resolution images, SVG support
✅ **Type-safe code** - Full type inference and validation
✅ **Clean diffs** - Preview changes before applying
✅ **Progress tracking** - Real-time conversion status
✅ **Rollback support** - Undo changes with Git integration

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────┐
│         React-to-Flutter Refactoring System         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐      ┌──────────────┐            │
│  │ React Parser │──┬──>│ IR Storage   │            │
│  └──────────────┘  │   └──────────────┘            │
│                    │                                │
│                    ├──>┌──────────────┐            │
│                    │   │ Code         │            │
│                    │   │ Generator    │            │
│                    │   └──────────────┘            │
│                    │           │                    │
│                    │           v                    │
│                    │   ┌──────────────┐            │
│                    └──>│ Dart         │            │
│                        │ Refactor     │            │
│                        │ Engine       │            │
│                        └──────────────┘            │
│                                │                    │
│                                v                    │
│                        ┌──────────────┐            │
│                        │ Flutter App  │            │
│                        └──────────────┘            │
└─────────────────────────────────────────────────────┘
```

### Data Flow

1. **Parse** - React Parser extracts components, state, hooks
2. **Store** - IR Storage serializes components as JSON (cached)
3. **Generate** - Code Generator creates Flutter widgets with BLoC
4. **Refactor** - Dart Refactor Engine optimizes imports, infers types
5. **Preview** - Show unified diffs before applying
6. **Apply** - Write files to Flutter project with validation
7. **Track** - Artifact Manager saves run history

### Directory Structure

```
react-app/
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   ├── styles/           # CSS/SCSS
│   └── assets/           # Images, fonts

flutter-app/
├── lib/
│   ├── features/         # Feature modules
│   │   ├── authentication/
│   │   │   ├── domain/       # Business logic
│   │   │   ├── data/         # Data sources
│   │   │   └── presentation/ # UI + BLoC
│   │   └── products/
│   └── core/             # Shared utilities
└── assets/               # Optimized assets
    ├── images/
    │   ├── logo.png
    │   ├── 2.0x/logo.png
    │   └── 3.0x/logo.png
    └── fonts/

tmp/
└── ir/                   # Intermediate representation
    ├── authentication/
    │   ├── LoginForm.json
    │   └── SignupForm.json
    └── manifest.json

.prprompts/
├── runs/                 # Run history
│   ├── run-1234567890/
│   │   ├── meta.json
│   │   ├── diffs/
│   │   ├── files/
│   │   └── logs/
    └── progress.json     # Current conversion state
```

## Quick Start

### Prerequisites

- Node.js 14+
- Flutter SDK 3.0+
- Git (for version control features)
- Dart SDK 3.0+ (bundled with Flutter)

### Installation

```bash
npm install -g prprompts-flutter-generator
```

### Basic Workflow

```bash
# 1. Analyze React project
prprompts analyze-project ./react-app

# 2. Start conversion (interactive)
prprompts refactor-interactive

# OR: Direct conversion
prprompts refactor ./react-app ./flutter-app \
  --state-management bloc \
  --architecture clean \
  --validate

# 3. Monitor progress
prprompts refactor-progress --watch

# 4. Preview changes for specific feature
prprompts refactor-preview authentication

# 5. Apply changes
prprompts refactor-apply authentication --validate

# 6. Validate converted code
prprompts validate ./flutter-app

# 7. Test LLM provider (optional - for AI-enhanced features)
prprompts llm-test claude --health --models
```

## Commands

### Core Commands

#### `analyze-project`

Analyze React project structure and estimate conversion effort.

```bash
prprompts analyze-project <react-source> [options]

Options:
  --format <type>    Output format: json, markdown, html, terminal (default)
  --output <file>    Save analysis to file
  --detailed         Include component-level details
  --estimate         Include time/cost estimates
```

**Example output:**

```
Project Analysis
├── Total Components: 47
├── Features Detected: 6 (authentication, products, cart, checkout, profile, settings)
├── State Management: Redux (3 stores), useState (12 components)
├── Technology Stack:
│   ├── React Router v6
│   ├── Material-UI
│   ├── Axios
│   └── Formik
├── Complexity Score: 68/100 (Medium-High)
└── Estimated Time:
    ├── Manual conversion: 94-141 hours (12-18 days)
    └── Automated: 28-42 hours (4-6 days) - 70% faster
```

#### `refactor`

Convert React application to Flutter.

```bash
prprompts refactor <react-source> <flutter-target> [options]

Options:
  --ai <provider>           Use AI provider: claude, qwen, gemini, none (default)
  --validate                Run validation after conversion
  --state-management <type> State management: bloc, cubit, provider, auto (default)
  --architecture <type>     Architecture: clean, mvc, mvvm (default: clean)
  --config <file>           Custom config file
  --dry-run                 Preview without writing files
  --verbose                 Detailed logging
```

**Example:**

```bash
prprompts refactor ./my-react-app ./my-flutter-app \
  --state-management bloc \
  --architecture clean \
  --validate \
  --verbose
```

#### `refactor-interactive`

Interactive conversion wizard with step-by-step guidance.

```bash
prprompts refactor-interactive

Steps:
1. Select React source directory
2. Choose Flutter target directory
3. Select state management pattern
4. Choose architecture style
5. Configure asset handling
6. Select features to convert
7. Preview and confirm
8. Execute conversion
```

### Progress & Monitoring

#### `refactor-progress`

Show conversion progress with real-time updates.

```bash
prprompts refactor-progress [options]

Options:
  --watch       Watch mode (updates every 2 seconds)
  --detailed    Show component-level progress
  --json        JSON output for programmatic use
```

**Example output:**

```
Conversion Progress

Overall: [████████████████░░░░] 78% (7/9 features)

Features:
✅ authentication    [████████████████████] 100% (12/12 components)
✅ products         [████████████████████] 100% (8/8 components)
✅ cart             [████████████████████] 100% (5/5 components)
⏳ checkout         [████████████░░░░░░░░] 60% (3/5 components)
⏳ profile          [████████░░░░░░░░░░░░] 40% (2/5 components)
⬜ settings         [░░░░░░░░░░░░░░░░░░░░] 0% (0/4 components)

Statistics:
├── Total Components: 47 → 47
├── Total Files: 94 → 94
├── Lines of Code: 12,450 → 11,230 (9.8% reduction)
├── Elapsed Time: 2h 34m
└── Estimated Remaining: 48m
```

### Preview & Apply

#### `refactor-preview`

Preview changes for a specific feature before applying.

```bash
prprompts refactor-preview <feature> [options]

Options:
  --split         Show split view (side-by-side)
  --stats         Show statistics only
  --html <file>   Export preview to HTML
  --interactive   Interactive diff navigation
```

**Example:**

```bash
prprompts refactor-preview authentication --split
```

**Output:**

```diff
--- lib/features/authentication/presentation/pages/login_screen.dart
+++ lib/features/authentication/presentation/pages/login_screen.dart
@@ -1,10 +1,12 @@
+import 'package:flutter/material.dart';
+import 'package:flutter_bloc/flutter_bloc.dart';
+import '../bloc/auth_bloc.dart';
+
 class LoginScreen extends StatelessWidget {
   const LoginScreen({Key? key}) : super(key: key);

   @override
   Widget build(BuildContext context) {
-    return Container();
+    return BlocConsumer<AuthBloc, AuthState>(
+      listener: (context, state) {
```

#### `refactor-apply`

Apply converted code for a specific feature.

```bash
prprompts refactor-apply <feature> [options]

Options:
  --validate    Run validation before applying
  --backup      Create backup before applying
  --force       Force application even if conflicts exist
  --dry-run     Preview without applying
```

**Example:**

```bash
prprompts refactor-apply authentication --validate --backup
```

### Configuration

#### `refactor-config`

Manage refactoring configuration.

```bash
prprompts refactor-config [action] [options]

Actions:
  edit      Interactive configuration editor (default)
  show      Display current configuration
  save      Save configuration as profile
  load      Load configuration profile
  validate  Validate configuration
  reset     Reset to defaults

Options:
  --profile <name>  Profile name for save/load
  --file <path>     Import/export file path
  --interactive     Use interactive editor
```

**Example:**

```bash
# Interactive editing
prprompts refactor-config edit

# Save as profile
prprompts refactor-config save --profile my-project

# Load profile
prprompts refactor-config load --profile my-project
```

### Validation

#### `validate`

Validate Flutter code quality, security, and compliance.

```bash
prprompts validate <flutter-path> [options]

Options:
  --config <type>      Validation config: standard, strict, custom
  --format <type>      Output format: terminal, json, html
  --output <file>      Save report to file
  --threshold <score>  Minimum passing score (0-100)
  --fix                Auto-fix issues where possible
  --ci                 CI mode (exit code based on threshold)
```

**Validation Categories:**

- **Architecture** - Clean Architecture compliance
- **Code Quality** - Dart best practices, formatting
- **Security** - Hardcoded secrets, insecure patterns
- **Performance** - Widget rebuilds, memory leaks
- **Accessibility** - Semantic labels, contrast ratios
- **Testing** - Test coverage, test quality

### LLM Testing

#### `llm-test`

Test LLM provider health and capabilities (for AI-enhanced features).

```bash
prprompts llm-test [provider] [options]

Providers:
  all       Test all configured providers (default)
  claude    Test Claude API
  gemini    Test Gemini API
  qwen      Test Qwen API

Options:
  --health       Health check only
  --models       List available models
  --benchmark    Performance benchmark
  --iterations N Number of benchmark iterations (default: 3)
```

**Example:**

```bash
prprompts llm-test claude --health --models --benchmark
```

## Configuration

### Configuration File

Location: `.prprompts/refactoring-config.json`

```json
{
  "stateManagement": {
    "default": "bloc",
    "useState": "cubit",
    "useReducer": "bloc",
    "redux": "bloc",
    "contextAPI": "provider"
  },
  "architecture": {
    "style": "clean",
    "featureFirst": true,
    "layerSeparation": true,
    "domainDriven": true
  },
  "ui": {
    "componentMapping": "material",
    "themingApproach": "flutter_theme",
    "responsiveDesign": true,
    "darkModeSupport": true
  },
  "assets": {
    "imageOptimization": true,
    "svgHandling": "flutter_svg",
    "fontConversion": true,
    "multiResolution": true,
    "compression": {
      "jpeg": 85,
      "png": 90
    }
  },
  "llm": {
    "provider": "claude",
    "model": "claude-sonnet-3.5",
    "maxTokens": 4096,
    "temperature": 0.3,
    "fallbackProvider": "gemini"
  },
  "git": {
    "mode": "branch",
    "branchPrefix": "refactor/",
    "autoCommit": false,
    "requireCleanTree": true
  },
  "advanced": {
    "parallelProcessing": true,
    "maxConcurrency": 4,
    "cacheEnabled": true,
    "cacheExpiry": 3600000,
    "verboseLogging": false
  }
}
```

### State Management Mapping

| React Pattern | Flutter Equivalent | Notes |
|---------------|-------------------|-------|
| `useState` | Cubit | Simple state |
| `useReducer` | BLoC | Complex state with events |
| Redux | BLoC | Global state management |
| Context API | Provider | Dependency injection |
| MobX | GetX | Reactive state (alternative) |
| Zustand | Riverpod | Lightweight state (alternative) |

### UI Component Mapping

See `mappings/ui-mapping.json` for complete mapping:

| React Component | Flutter Widget | Package |
|-----------------|----------------|---------|
| `<div>` | Container/Row/Column | flutter/material |
| `<span>` | Text | flutter/material |
| `<button>` | ElevatedButton | flutter/material |
| `<input>` | TextField | flutter/material |
| `<img>` | Image | flutter/material |
| `<a>` | InkWell | flutter/material |
| React Router | GoRouter | go_router |
| Material-UI | Material Widgets | flutter/material |

## Workflow

### Complete Conversion Workflow

#### 1. Project Analysis

```bash
# Analyze structure and complexity
prprompts analyze-project ./my-react-app --detailed --estimate

# Review output, note features and complexity
# Output saved to: ./analysis-report.md
```

#### 2. Initial Setup

```bash
# Create Flutter project
flutter create my_flutter_app
cd my_flutter_app

# Configure refactoring
prprompts refactor-config edit
# Select: BLoC, Clean Architecture, Material UI
```

#### 3. Start Conversion

```bash
# Option A: Interactive (recommended for first-time users)
prprompts refactor-interactive

# Option B: Direct command
prprompts refactor ../my-react-app . \
  --state-management bloc \
  --architecture clean \
  --config .prprompts/refactoring-config.json
```

#### 4. Monitor Progress

```bash
# Watch mode (real-time updates)
prprompts refactor-progress --watch --detailed
```

#### 5. Feature-by-Feature Review

```bash
# Preview authentication feature
prprompts refactor-preview authentication --split

# Apply if satisfied
prprompts refactor-apply authentication --validate --backup

# Repeat for each feature
prprompts refactor-preview products --split
prprompts refactor-apply products --validate

# ... continue for all features
```

#### 6. Validation

```bash
# Run comprehensive validation
prprompts validate . --config strict --output validation-report.html

# Fix issues
prprompts validate . --fix

# CI validation (exit code 1 if below threshold)
prprompts validate . --threshold 80 --ci
```

#### 7. Testing

```bash
# Flutter tests
flutter test

# Integration tests
flutter drive --target=test_driver/app.dart
```

#### 8. Finalize

```bash
# Review changes
git diff

# Commit
git add .
git commit -m "refactor: Convert React app to Flutter with Clean Architecture"

# Build and deploy
flutter build apk
flutter build ios
```

## Advanced Features

### Git Integration

The system provides safe Git-based workflows:

#### Branch Mode (Default)

```bash
# Automatic branch creation
prprompts refactor ./react-app ./flutter-app
# Creates: refactor/authentication-20250108-143022

# Switch back to main
git checkout main

# Merge when ready
git merge refactor/authentication-20250108-143022
```

#### Patch Mode

```bash
# Generate patches without committing
prprompts refactor ./react-app ./flutter-app --dry-run

# Review diffs
prprompts refactor-preview authentication

# Apply manually
prprompts refactor-apply authentication
```

#### Conflict Resolution

```bash
# If conflicts occur during apply
prprompts refactor-apply authentication

# Output:
# ⚠️ Conflicts detected in 3 files:
#   - lib/features/authentication/data/repositories/auth_repository.dart
#   - lib/features/authentication/presentation/bloc/auth_bloc.dart
#   - lib/features/authentication/presentation/pages/login_screen.dart

# Interactive resolution
# [O]verwrite, [S]kip, [R]eview each, [A]bort?
# Choose: R (review each)

# For each conflict:
# Show 3-way merge view
# Choose: ours, theirs, manual edit
```

### Asset Conversion

#### Image Optimization

Automatic multi-resolution generation:

```
react-app/src/assets/logo.png (1000x1000)
↓
flutter-app/assets/images/
├── logo.png        (333x333 @ 1x)
├── 2.0x/logo.png   (667x667 @ 2x)
└── 3.0x/logo.png   (1000x1000 @ 3x)
```

Configuration:

```json
{
  "assets": {
    "imageOptimization": true,
    "compression": {
      "jpeg": 85,
      "png": 90
    },
    "resolutions": [1, 2, 3]
  }
}
```

#### SVG Handling

```bash
# SVGs converted to flutter_svg compatible format
# Optimized with SVGO
# Dimensions extracted for proper sizing
```

#### Font Conversion

```bash
# Automatic font family detection
# Weight and style extraction
# pubspec.yaml generation

fonts:
  - family: Roboto
    fonts:
      - asset: fonts/Roboto-Regular.ttf
        weight: 400
      - asset: fonts/Roboto-Bold.ttf
        weight: 700
```

### Dart Refactor Engine

Post-generation code polishing:

#### Features

1. **Import Optimization**
   - Remove duplicates
   - Remove unused imports
   - Sort and group (dart:, package:, relative)
   - Add missing imports

2. **Type Inference**
   - Infer var/final types
   - Infer method return types
   - Handle complex nested types
   - Preserve explicit types when appropriate

3. **Widget Extraction**
   - Detect repeated patterns
   - Extract to separate widgets
   - Generate constructors with parameters
   - Maintain BuildContext access

4. **Naming Resolution**
   - Fix naming conflicts
   - Apply Dart conventions
   - Prioritize class names over variables

#### Example

**Before:**

```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'dart:async'; // Duplicate

class LoginScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var controller = TextEditingController();
    var isLoading = false;

    return Container(
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(16),
            child: TextField(controller: controller),
          ),
          Container(
            padding: EdgeInsets.all(16),
            child: TextField(controller: controller),
          ),
        ],
      ),
    );
  }
}
```

**After:**

```dart
import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final TextEditingController controller = TextEditingController();
    final bool isLoading = false;

    return Container(
      child: Column(
        children: [
          _PaddedTextField(controller: controller),
          _PaddedTextField(controller: controller),
        ],
      ),
    );
  }
}

class _PaddedTextField extends StatelessWidget {
  const _PaddedTextField({
    Key? key,
    required this.controller,
  }) : super(key: key);

  final TextEditingController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: TextField(controller: controller),
    );
  }
}
```

### IR Storage & Caching

Intermediate Representation for faster re-conversion:

```bash
# First conversion: parses all React components
prprompts refactor ./react-app ./flutter-app

# Cached to: tmp/ir/<feature>/<component>.json
# Manifest: tmp/ir/manifest.json

# Second conversion: reads from cache (10x faster)
prprompts refactor ./react-app ./flutter-app --use-cache

# Clear cache
rm -rf tmp/ir
```

### Artifact Manager

Complete run history tracking:

```bash
# Run history stored in: .prprompts/runs/run-<timestamp>/

.prprompts/
└── runs/
    └── run-1704715200000/
        ├── meta.json          # Run metadata
        ├── diffs/             # All generated diffs
        │   ├── login_screen.dart.diff
        │   └── auth_bloc.dart.diff
        ├── files/             # All generated files
        │   └── lib/features/...
        ├── logs/              # Execution logs
        │   ├── info.log
        │   ├── warn.log
        │   └── error.log
        └── metadata/          # Additional metadata

# Export run
prprompts artifact export run-1704715200000 ./export-dir

# View run report
prprompts artifact report run-1704715200000

# Cleanup old runs (keeps last 50, deletes older than 30 days)
prprompts artifact cleanup
```

## Troubleshooting

### Common Issues

#### 1. Import errors after conversion

**Problem:** Missing package imports in generated Flutter code.

**Solution:**

```bash
# Run Dart refactor engine
cd flutter-app
prprompts validate . --fix

# Or manually add to pubspec.yaml:
dependencies:
  flutter_bloc: ^8.1.0
  equatable: ^2.0.5
  dio: ^5.0.0
```

#### 2. State management not working

**Problem:** BLoC events not triggering state changes.

**Solution:**

Check BLoC implementation:

```dart
// Ensure proper event handling
on<LoginEvent>((event, emit) async {
  emit(AuthLoading());
  try {
    final user = await _authRepository.login(event.email, event.password);
    emit(AuthSuccess(user));
  } catch (e) {
    emit(AuthFailure(e.toString()));
  }
});
```

#### 3. Asset not found errors

**Problem:** Images/fonts not loading in Flutter app.

**Solution:**

```bash
# Verify pubspec.yaml includes assets
flutter:
  assets:
    - assets/images/
  fonts:
    - family: Roboto
      fonts:
        - asset: fonts/Roboto-Regular.ttf

# Run
flutter pub get
flutter clean
flutter run
```

#### 4. Conversion fails with parse errors

**Problem:** React Parser cannot parse component.

**Solution:**

```bash
# Check for unsupported patterns
# - Higher-order components (HOCs)
# - Render props
# - Complex TypeScript generics

# Use --verbose for detailed error messages
prprompts refactor ./react-app ./flutter-app --verbose

# Skip problematic components, convert manually later
```

#### 5. Git conflicts during apply

**Problem:** Merge conflicts when applying feature.

**Solution:**

```bash
# Use interactive conflict resolution
prprompts refactor-apply authentication
# Choose: [R]eview each

# Or apply without Git integration
prprompts refactor-apply authentication --no-git

# Manually resolve in IDE
```

### Debug Mode

Enable verbose logging:

```bash
# Environment variable
export PRPROMPTS_VERBOSE=true

# Or command flag
prprompts refactor ./react-app ./flutter-app --verbose

# Logs written to: .prprompts/runs/<run-id>/logs/
```

### Performance Issues

If conversion is slow:

```bash
# Enable parallel processing
{
  "advanced": {
    "parallelProcessing": true,
    "maxConcurrency": 8  // Increase for more CPU cores
  }
}

# Enable caching
{
  "advanced": {
    "cacheEnabled": true,
    "cacheExpiry": 7200000  // 2 hours
  }
}

# Use non-AI mode (faster)
prprompts refactor ./react-app ./flutter-app --ai none
```

## Best Practices

### 1. Incremental Conversion

Convert feature by feature, not all at once:

```bash
# Convert authentication first
prprompts refactor-apply authentication --validate
flutter test test/features/authentication

# Then products
prprompts refactor-apply products --validate
flutter test test/features/products

# Iterate until all features converted
```

### 2. Code Review

Always review diffs before applying:

```bash
prprompts refactor-preview <feature> --split
# Carefully review changes
# Check for edge cases
# Verify state management logic
```

### 3. Testing

Write tests as you convert:

```bash
# Unit tests for BLoCs
test/features/authentication/presentation/bloc/auth_bloc_test.dart

# Widget tests for screens
test/features/authentication/presentation/pages/login_screen_test.dart

# Integration tests
integration_test/authentication_test.dart
```

### 4. Configuration Management

Use profiles for different projects:

```bash
# Save project-specific config
prprompts refactor-config save --profile ecommerce-app

# Load for similar projects
prprompts refactor-config load --profile ecommerce-app
```

### 5. Git Workflow

Use feature branches:

```bash
git checkout -b refactor/authentication
prprompts refactor-apply authentication
git add .
git commit -m "refactor: Convert authentication to Flutter"
git push origin refactor/authentication

# Create PR, review, merge
```

## Additional Resources

- **Main README**: `../README.md`
- **Architecture Guide**: `../ARCHITECTURE.md`
- **API Documentation**: `./API.md`
- **PRPROMPTS Specification**: `./PRPROMPTS-SPECIFICATION.md`
- **UI Mapping**: `../mappings/ui-mapping.json`

## Support

- **Issues**: https://github.com/Kandil7/prprompts-flutter-generator/issues
- **Discussions**: https://github.com/Kandil7/prprompts-flutter-generator/discussions
- **Email**: support@prprompts.com

---

**Version**: 5.0.0
**Last Updated**: January 2025
**License**: MIT
