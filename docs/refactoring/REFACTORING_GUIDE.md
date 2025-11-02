# React-to-Flutter Refactoring Guide

**Version 5.0.0** | Complete guide to migrating React applications to Flutter

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Installation and Setup](#installation-and-setup)
4. [Quick Start](#quick-start)
5. [CLI Command Reference](#cli-command-reference)
6. [Configuration Options](#configuration-options)
7. [AI Provider Setup](#ai-provider-setup)
8. [Validation Presets](#validation-presets)
9. [Migration Workflow](#migration-workflow)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

---

## Overview

The PRPROMPTS React-to-Flutter Refactoring System is a comprehensive toolkit that automates the conversion of React applications to Flutter using Clean Architecture principles, BLoC state management, and industry best practices.

### Key Features

- **Automatic Conversion**: Parse React components and generate Flutter widgets
- **Clean Architecture**: Organizes code into domain, data, and presentation layers
- **BLoC State Management**: Converts React state (useState, Redux, Context) to BLoC/Cubit
- **AI Enhancement**: Optional AI-powered code optimization and testing
- **Comprehensive Validation**: 5-stage validation ensuring code quality
- **Repository Pattern**: Automatic API integration with proper error handling
- **Responsive Design**: Generates responsive Flutter layouts
- **Test Generation**: Creates unit, widget, and integration tests

### What Gets Converted

- **Components** → StatelessWidget / StatefulWidget
- **useState/setState** → StatefulWidget state
- **Redux/Context** → BLoC pattern
- **API Calls** → Repository + Remote DataSource
- **Props** → Constructor parameters
- **Lifecycle** → initState, dispose, didUpdateWidget
- **Styles** → Flutter theming
- **Forms** → Flutter Form widgets with validation

---

## System Architecture

The refactoring system consists of 6 integrated phases:

```
┌─────────────────────────────────────────────────────┐
│  Phase 1: Models                                     │
│  - ComponentModel, WidgetModel, ConversionContext   │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Phase 2: React Parsers                             │
│  - ReactParser, TypeExtractor, StateDetector        │
│  - ApiExtractor, StyleExtractor                     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Phase 3: Flutter Generators                         │
│  - WidgetGenerator, CodeGenerator                   │
│  - BlocGenerator, RepositoryGenerator               │
│  - CleanArchitectureGenerator                       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Phase 4: AI Enhancement (Optional)                 │
│  - CodeEnhancer, WidgetOptimizer                    │
│  - TestGenerator, AccessibilityChecker              │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Phase 5: Validation                                │
│  - CodeValidator, ArchitectureValidator             │
│  - SecurityValidator, PerformanceValidator          │
│  - AccessibilityValidator                           │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│  Phase 6: CLI Integration                           │
│  - RefactorCommand, ValidateCommand                 │
│  - InteractiveCommand, ProgressReporting            │
└─────────────────────────────────────────────────────┘
```

### Generated Flutter Structure

```
flutter-app/
├── lib/
│   ├── core/                      # Shared infrastructure
│   │   ├── di/                    # Dependency injection
│   │   ├── errors/                # Failure & exception classes
│   │   ├── network/               # HTTP client (Dio)
│   │   ├── theme/                 # Design system
│   │   └── widgets/               # Reusable components
│   │
│   ├── features/                  # Feature modules
│   │   └── [feature_name]/
│   │       ├── domain/            # Business logic
│   │       │   ├── entities/      # Core models
│   │       │   ├── repositories/  # Abstract interfaces
│   │       │   └── usecases/      # Business operations
│   │       ├── data/              # Data layer
│   │       │   ├── models/        # JSON serializable
│   │       │   ├── datasources/   # API & local storage
│   │       │   └── repositories/  # Repository implementations
│   │       └── presentation/      # UI layer
│   │           ├── bloc/          # State management
│   │           ├── pages/         # Full screens
│   │           └── widgets/       # Feature-specific widgets
│   │
│   └── config/
│       ├── routes/                # Navigation (go_router)
│       └── env/                   # Environment config
│
└── test/                          # Tests mirror lib/ structure
```

---

## Installation and Setup

### Prerequisites

- **Node.js** 16+ and npm
- **Flutter** 3.0+ (for generated code)
- **Git** (recommended)

### Global Installation

```bash
# Install prprompts-flutter-generator
npm install -g prprompts-flutter-generator

# Verify installation
prprompts --version
```

### AI CLI Installation (Optional)

For AI-enhanced refactoring, install one of:

```bash
# Claude Code CLI
npm install -g @anthropic-ai/claude-cli

# Qwen Code CLI
npm install -g qwen-code-cli

# Gemini CLI
npm install -g @google/generative-ai-cli
```

### Project Setup

```bash
# Create a new Flutter project
flutter create my_app
cd my_app

# Initialize refactoring
prprompts init
```

---

## Quick Start

### Basic Conversion (No AI)

```bash
# Convert React app to Flutter
prprompts refactor \
  --source ./react-app \
  --target ./flutter-app \
  --state-management bloc

# Validate generated code
prprompts validate --path ./flutter-app
```

### AI-Enhanced Conversion

```bash
# With Claude Code
prprompts refactor \
  --source ./react-app \
  --target ./flutter-app \
  --ai claude \
  --enhance \
  --generate-tests

# Interactive mode (recommended for first-time users)
prprompts interactive
```

### Step-by-Step Example

**1. Analyze React codebase:**

```bash
prprompts analyze ./react-app
```

**Output:**
```
Analyzing React project...
Found 15 components:
  - 8 functional (4 with hooks)
  - 7 class-based
State management: Redux
API endpoints: 12
Estimated conversion time: 15-20 minutes
```

**2. Convert with validation:**

```bash
prprompts refactor \
  --source ./react-app \
  --target ./flutter-app \
  --validate \
  --report
```

**3. Review generated code:**

```bash
cd flutter-app
flutter pub get
flutter analyze
flutter test
```

---

## CLI Command Reference

### `prprompts refactor`

Convert React app to Flutter.

**Syntax:**
```bash
prprompts refactor [options]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--source <path>` | `-s` | React project path | `./` |
| `--target <path>` | `-t` | Flutter output path | `./flutter_app` |
| `--state-management <type>` | `-m` | BLoC or Cubit | `bloc` |
| `--ai <provider>` | `-a` | AI provider (claude/qwen/gemini/mock/none) | `none` |
| `--enhance` | `-e` | Enable AI enhancement | `false` |
| `--generate-tests` | `-g` | Generate tests | `false` |
| `--validate` | `-v` | Run validation | `false` |
| `--interactive` | `-i` | Interactive mode | `false` |
| `--report` | `-r` | Generate HTML report | `false` |
| `--continue-on-error` | | Continue if errors occur | `false` |
| `--clean` | | Clean target before conversion | `false` |

**Examples:**

```bash
# Basic conversion
prprompts refactor -s ./react-app -t ./flutter-app

# With AI enhancement
prprompts refactor -s ./react-app -t ./flutter-app --ai claude --enhance

# Full pipeline
prprompts refactor \
  -s ./react-app \
  -t ./flutter-app \
  --ai claude \
  --enhance \
  --generate-tests \
  --validate \
  --report
```

### `prprompts validate`

Validate generated Flutter code.

**Syntax:**
```bash
prprompts validate [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--path <path>` | Flutter project path | `./` |
| `--preset <name>` | Validation preset | `standard` |
| `--report` | Generate HTML report | `false` |
| `--fail-on-warnings` | Fail if warnings exist | `false` |

**Presets:**
- `minimal`: Basic syntax checks
- `standard`: Code quality + architecture
- `strict`: All checks including performance
- `security`: Security-focused validation

**Example:**

```bash
prprompts validate --path ./flutter-app --preset strict --report
```

### `prprompts interactive`

Interactive guided conversion.

**Syntax:**
```bash
prprompts interactive
```

**Features:**
- Step-by-step guidance
- Real-time preview
- Validation at each step
- Rollback capability

### `prprompts analyze`

Analyze React codebase without converting.

**Syntax:**
```bash
prprompts analyze <path>
```

**Output:**
- Component count and types
- State management patterns
- API endpoints
- Complexity metrics
- Estimated conversion time

### `prprompts test`

Run tests on generated code.

**Syntax:**
```bash
prprompts test --path ./flutter-app [--coverage]
```

---

## Configuration Options

### Configuration File

Create `.prprompts.json` in your project root:

```json
{
  "refactoring": {
    "stateManagement": "bloc",
    "architecture": "clean",
    "validation": {
      "preset": "standard",
      "failOnWarnings": false
    },
    "ai": {
      "provider": "claude",
      "enhance": true,
      "generateTests": true,
      "model": "claude-3-opus-20240229"
    },
    "output": {
      "generateReports": true,
      "verboseLogging": true
    },
    "features": {
      "responsiveDesign": true,
      "accessibility": true,
      "internationalization": false
    }
  }
}
```

### Environment Variables

```bash
# AI API Keys
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
export GOOGLE_AI_API_KEY=...

# Refactoring Options
export PRPROMPTS_STATE_MANAGEMENT=bloc
export PRPROMPTS_VALIDATION_PRESET=strict
```

---

## AI Provider Setup

### Claude Code

**1. Install Claude CLI:**
```bash
npm install -g @anthropic-ai/claude-cli
```

**2. Configure API key:**
```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**3. Use with refactoring:**
```bash
prprompts refactor --ai claude --enhance
```

**Benefits:**
- Best code quality
- Excellent documentation generation
- Superior test generation
- Context-aware refactoring

### Qwen Code

**1. Install:**
```bash
npm install -g qwen-code-cli
```

**2. Configure:**
```bash
export QWEN_API_KEY=your-key
```

**3. Use:**
```bash
prprompts refactor --ai qwen --enhance
```

**Benefits:**
- Fast processing
- Good cost-effectiveness
- Multilingual support

### Gemini CLI

**1. Install:**
```bash
npm install -g @google/generative-ai-cli
```

**2. Configure:**
```bash
export GOOGLE_AI_API_KEY=your-key
```

**3. Use:**
```bash
prprompts refactor --ai gemini --enhance
```

**Benefits:**
- Large context window
- Free tier available
- Good at complex patterns

### Mock AI (Testing)

No setup required. Use for testing the pipeline without AI costs:

```bash
prprompts refactor --ai mock
```

---

## Validation Presets

### Minimal

Basic syntax and structure checks.

**Includes:**
- Dart syntax validation
- Import statement checks
- Basic file structure

**Use when:** Quick validation during development

### Standard (Default)

Comprehensive quality checks.

**Includes:**
- All minimal checks
- Architecture validation (Clean Architecture)
- Code quality (linting, formatting)
- Basic security checks

**Use when:** Regular development workflow

### Strict

All checks with strict thresholds.

**Includes:**
- All standard checks
- Performance validation
- Accessibility checks
- Test coverage requirements (>70%)
- Documentation requirements

**Use when:** Pre-production, critical applications

### Security

Security-focused validation.

**Includes:**
- Sensitive data exposure checks
- API key detection
- SQL injection patterns
- XSS vulnerability patterns
- Insecure network calls

**Use when:** Applications handling sensitive data

---

## Migration Workflow

### Recommended Workflow

**Phase 1: Preparation (1 day)**

1. **Analyze React app:**
   ```bash
   prprompts analyze ./react-app > analysis.txt
   ```

2. **Review analysis** and identify:
   - Complex components (convert last)
   - Shared utilities (convert first)
   - External dependencies

3. **Setup Flutter project:**
   ```bash
   flutter create my_app
   cd my_app
   ```

**Phase 2: Initial Conversion (1-3 days)**

4. **Convert a simple feature** (test the pipeline):
   ```bash
   prprompts refactor \
     --source ./react-app/src/features/simple \
     --target ./my_app \
     --validate
   ```

5. **Review generated code:**
   - Check architecture
   - Verify business logic
   - Test manually

6. **Iterate on configuration** until satisfied

**Phase 3: Full Conversion (3-7 days)**

7. **Convert all features:**
   ```bash
   prprompts refactor \
     --source ./react-app \
     --target ./my_app \
     --ai claude \
     --enhance \
     --generate-tests \
     --validate \
     --report
   ```

8. **Fix validation issues:**
   ```bash
   prprompts validate --path ./my_app --preset strict --report
   ```

9. **Manual cleanup:**
   - Fix edge cases
   - Optimize performance
   - Add missing tests

**Phase 4: Testing (2-3 days)**

10. **Run all tests:**
    ```bash
    cd my_app
    flutter test --coverage
    flutter test integration_test
    ```

11. **Manual QA:**
    - Test on real devices
    - Verify all features work
    - Check responsive design

**Phase 5: Deployment**

12. **Build and deploy:**
    ```bash
    flutter build apk --release
    flutter build ios --release
    ```

---

## Troubleshooting

### Common Issues

#### 1. "React component not recognized"

**Cause:** Parser doesn't recognize component pattern

**Solution:**
- Ensure component has proper export (`export default ComponentName`)
- Check JSX syntax is valid
- Use `--verbose` flag to see parsing details

#### 2. "State management conversion failed"

**Cause:** Complex Redux/Context pattern

**Solution:**
- Simplify state before conversion
- Use `--state-management cubit` for simpler state
- Manual conversion may be needed for very complex stores

#### 3. "Validation fails with architecture errors"

**Cause:** Generated code doesn't follow Clean Architecture

**Solution:**
- Use `--preset minimal` temporarily
- Check `.prprompts.json` configuration
- Re-run with `--clean` flag

#### 4. "AI enhancement timeout"

**Cause:** Large file or slow AI response

**Solution:**
- Increase timeout in config
- Use `--no-enhance` and enhance manually later
- Split large components before conversion

#### 5. "Generated code has TypeScript errors"

**Cause:** Type inference failed

**Solution:**
- Add type annotations in React code
- Use `--verbose` to see type mapping
- Update type mappings in config

### Debug Mode

Enable detailed logging:

```bash
prprompts refactor --source ./react-app --target ./flutter-app --verbose --debug
```

### Getting Help

1. Check logs: `~/.prprompts/logs/`
2. View report: Open generated `refactoring-report.html`
3. File issue: https://github.com/Kandil7/prprompts-flutter-generator/issues

---

## Best Practices

### Before Conversion

1. **Clean up React code:**
   - Remove unused components
   - Simplify complex state logic
   - Add TypeScript/PropTypes for better type inference

2. **Document business logic:**
   - Add comments to complex functions
   - Document API contracts
   - Note any workarounds

3. **Test React app:**
   - Ensure all features work
   - Fix any bugs
   - Document expected behavior

### During Conversion

1. **Start small:**
   - Convert one feature at a time
   - Test thoroughly before moving on

2. **Use version control:**
   - Commit after each successful conversion
   - Use branches for experiments

3. **Review generated code:**
   - Don't blindly trust automation
   - Verify business logic correctness
   - Check error handling

### After Conversion

1. **Refactor generated code:**
   - Extract common patterns
   - Optimize performance bottlenecks
   - Improve naming

2. **Add missing tests:**
   - Integration tests
   - Edge cases
   - Error scenarios

3. **Performance profiling:**
   - Use Flutter DevTools
   - Check memory usage
   - Optimize slow operations

### Code Quality

1. **Follow Flutter conventions:**
   - Use `const` constructors
   - Prefer composition over inheritance
   - Use `final` for immutable fields

2. **Maintain architecture:**
   - Keep layers separate
   - Don't bypass repository pattern
   - Use dependency injection

3. **Document API:**
   - Add DartDoc comments
   - Document complex logic
   - Explain architectural decisions

---

## Advanced Topics

### Custom Parsers

Extend React parser for custom patterns:

```javascript
const { ReactParser } = require('prprompts-flutter-generator/lib/refactoring');

class CustomParser extends ReactParser {
  parseCustomHook(node) {
    // Your custom logic
  }
}
```

### Custom Validators

Add project-specific validation:

```javascript
const { ValidationOrchestrator } = require('prprompts-flutter-generator/lib/refactoring');

class CustomValidator {
  async validate(code) {
    // Your validation logic
    return {
      passed: true,
      issues: []
    };
  }
}
```

### Plugin System

Create refactoring plugins:

```javascript
// .prprompts-plugin.js
module.exports = {
  name: 'my-plugin',
  hooks: {
    beforeParse: async (code) => {
      // Modify code before parsing
      return code;
    },
    afterGenerate: async (dartCode) => {
      // Modify generated code
      return dartCode;
    }
  }
};
```

---

## Next Steps

1. **Read the [API Reference](./API_REFERENCE.md)** for programmatic usage
2. **See [Examples](./EXAMPLES.md)** for real-world conversions
3. **Check [GitHub](https://github.com/Kandil7/prprompts-flutter-generator)** for latest updates
4. **Join community:** Share your migration stories and get help

---

## FAQ

**Q: Can I convert only part of my React app?**

A: Yes, specify individual components or features with `--source` path.

**Q: What if I use Next.js/Gatsby?**

A: The tool focuses on React components. Server-side logic needs manual migration.

**Q: Does it support TypeScript?**

A: Yes, TypeScript React components are fully supported.

**Q: What about CSS/SCSS?**

A: Styles are converted to Flutter theming. Complex CSS may need manual adjustment.

**Q: Can I customize the generated architecture?**

A: Yes, via `.prprompts.json` or custom generators.

**Q: Is AI required?**

A: No, AI is optional for enhancement. Basic conversion works without AI.

**Q: What's the typical conversion success rate?**

A: 85-95% for standard React apps. Complex apps may need more manual work.

**Q: How long does conversion take?**

A: Small app (10-20 components): 1-2 hours
Medium app (50-100 components): 1-2 days
Large app (200+ components): 3-7 days

---

**Version:** 5.0.0
**Last Updated:** 2024
**License:** MIT
