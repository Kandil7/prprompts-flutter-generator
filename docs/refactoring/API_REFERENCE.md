# React-to-Flutter Refactoring API Reference

**Version 5.0.0** | Developer API documentation for programmatic usage

---

## Table of Contents

1. [Core Classes](#core-classes)
2. [Parsers](#parsers)
3. [Generators](#generators)
4. [AI Enhancement](#ai-enhancement)
5. [Validation](#validation)
6. [CLI Commands](#cli-commands)
7. [Utilities](#utilities)

---

## Core Classes

### Component Model

**File:** `lib/refactoring/models/ComponentModel.js`

Represents a parsed React component.

```javascript
class ComponentModel {
  constructor(options)

  // Properties
  name: string              // Component name
  type: string              // 'functional' | 'class'
  filePath: string          // Source file path
  props: PropDefinition[]   // Component props
  state: StateDefinition[]  // State variables
  hasState: boolean         // Whether component uses state
  lifecycle: LifecycleMethod[]  // Lifecycle methods
  apiCalls: ApiCall[]       // API integrations
  imports: Import[]         // Import statements
  exports: Export          // Export statement
  jsx: JSXElement          // JSX tree
}
```

**Usage:**

```javascript
const { ComponentModel } = require('prprompts-flutter-generator/lib/refactoring');

const component = new ComponentModel({
  name: 'LoginPage',
  type: 'functional',
  props: [{ name: 'onSuccess', type: 'function', required: false }],
  hasState: true
});
```

### Widget Model

**File:** `lib/refactoring/models/WidgetModel.js`

Represents a generated Flutter widget.

```javascript
class WidgetModel {
  constructor(options)

  // Properties
  name: string              // Widget name
  type: string              // 'stateless' | 'stateful'
  dartCode: string          // Generated Dart code
  imports: string[]         // Required imports
  dependencies: string[]    // Package dependencies
  warnings: string[]        // Conversion warnings
}
```

---

## Parsers

### ReactParser

**File:** `lib/refactoring/parsers/ReactParser.js`

Main parser for React components.

```javascript
class ReactParser {
  /**
   * Parse React component from source code
   * @param {string} code - React component code
   * @param {string} filePath - File path for error reporting
   * @returns {ComponentModel}
   */
  parse(code, filePath)

  /**
   * Parse multiple files
   * @param {string[]} filePaths
   * @returns {ComponentModel[]}
   */
  parseMultiple(filePaths)
}
```

**Example:**

```javascript
const { ReactParser } = require('prprompts-flutter-generator/lib/refactoring');

const parser = new ReactParser();
const component = parser.parse(reactCode, 'LoginPage.jsx');

console.log(`Parsed: ${component.name}`);
console.log(`Props: ${component.props.length}`);
console.log(`Has state: ${component.hasState}`);
```

### TypeExtractor

**File:** `lib/refactoring/parsers/TypeExtractor.js`

Extracts TypeScript types and PropTypes.

```javascript
class TypeExtractor {
  /**
   * Extract prop types from component
   * @param {ASTNode} node - Component AST node
   * @returns {PropDefinition[]}
   */
  extractPropTypes(node)

  /**
   * Map TypeScript type to Dart type
   * @param {string} tsType - TypeScript type
   * @returns {string} - Dart type
   */
  mapType(tsType)
}
```

### StateManagementDetector

**File:** `lib/refactoring/parsers/StateManagementDetector.js`

Detects state management patterns.

```javascript
class StateManagementDetector {
  /**
   * Detect state management pattern
   * @param {ComponentModel} component
   * @returns {'useState' | 'redux' | 'context' | 'none'}
   */
  detect(component)

  /**
   * Extract state variables
   * @param {ASTNode} node
   * @returns {StateDefinition[]}
   */
  extractStateVariables(node)
}
```

---

## Generators

### WidgetGenerator

**File:** `lib/refactoring/generators/WidgetGenerator.js`

Generates Flutter widgets from React components.

```javascript
class WidgetGenerator {
  /**
   * Generate Flutter widget
   * @param {ComponentModel} component
   * @returns {WidgetModel}
   */
  generate(component)

  /**
   * Generate StatelessWidget
   * @param {ComponentModel} component
   * @returns {string} - Dart code
   */
  generateStatelessWidget(component)

  /**
   * Generate StatefulWidget
   * @param {ComponentModel} component
   * @returns {string} - Dart code
   */
  generateStatefulWidget(component)
}
```

**Example:**

```javascript
const { WidgetGenerator } = require('prprompts-flutter-generator/lib/refactoring');

const generator = new WidgetGenerator();
const widget = generator.generate(componentModel);

console.log(widget.dartCode);
```

### BlocGenerator

**File:** `lib/refactoring/generators/BlocGenerator.js`

Generates BLoC/Cubit state management.

```javascript
class BlocGenerator {
  /**
   * Generate BLoC from component
   * @param {ComponentModel} component
   * @returns {Object} - { bloc, events, states }
   */
  generateBloc(component)

  /**
   * Generate Cubit (simpler state)
   * @param {ComponentModel} component
   * @returns {Object} - { cubit, state }
   */
  generateCubit(component)
}
```

### CleanArchitectureGenerator

**File:** `lib/refactoring/generators/CleanArchitectureGenerator.js`

Generates complete Clean Architecture structure.

```javascript
class CleanArchitectureGenerator {
  /**
   * Generate full feature structure
   * @param {ComponentModel} component
   * @param {string} outputPath
   * @returns {Promise<void>}
   */
  async generate(component, outputPath)

  /**
   * Generate domain layer
   */
  async generateDomain(component, basePath)

  /**
   * Generate data layer
   */
  async generateData(component, basePath)

  /**
   * Generate presentation layer
   */
  async generatePresentation(component, basePath)
}
```

---

## AI Enhancement

### CodeEnhancer

**File:** `lib/refactoring/ai/CodeEnhancer.js`

AI-powered code enhancement.

```javascript
class CodeEnhancer {
  constructor(aiClient)

  /**
   * Enhance generated code
   * @param {string} code - Dart code
   * @param {Object} options
   * @returns {Promise<string>} - Enhanced code
   */
  async enhance(code, options = {})
}
```

**Options:**

```javascript
{
  addValidation: boolean,      // Add form validation
  improveAccessibility: boolean, // Add semantic widgets
  optimizePerformance: boolean, // Performance optimizations
  addDocumentation: boolean,   // DartDoc comments
  addNullSafety: boolean,      // Null safety improvements
  addConstConstructors: boolean // Const constructors
}
```

**Example:**

```javascript
const { CodeEnhancer } = require('prprompts-flutter-generator/lib/refactoring');
const { ClaudeClient } = require('prprompts-flutter-generator/lib/refactoring/ai');

const aiClient = new ClaudeClient(process.env.ANTHROPIC_API_KEY);
const enhancer = new CodeEnhancer(aiClient);

const enhanced = await enhancer.enhance(dartCode, {
  addValidation: true,
  improveAccessibility: true
});
```

### TestGenerator

**File:** `lib/refactoring/ai/TestGenerator.js`

Generate comprehensive tests.

```javascript
class TestGenerator {
  constructor(aiClient)

  /**
   * Generate tests for widget
   * @param {string} widgetCode
   * @returns {Promise<string>} - Test code
   */
  async generateWidgetTests(widgetCode)

  /**
   * Generate integration tests
   * @param {ComponentModel[]} components
   * @returns {Promise<string>}
   */
  async generateIntegrationTests(components)
}
```

---

## Validation

### ValidationOrchestrator

**File:** `lib/refactoring/validation/ValidationOrchestrator.js`

Orchestrates all validators.

```javascript
class ValidationOrchestrator {
  /**
   * Validate generated code
   * @param {Object} context
   * @returns {Promise<ValidationResult>}
   */
  async validate(context)
}
```

**Validation Result:**

```javascript
{
  passed: boolean,
  score: number,  // 0-100
  issues: Issue[],
  report: {
    summary: {
      totalChecks: number,
      passed: number,
      failed: number,
      warnings: number
    },
    details: ValidationDetail[]
  }
}
```

### Individual Validators

```javascript
// Code quality
const { CodeValidator } = require('.../validation/CodeValidator');

// Architecture patterns
const { ArchitectureValidator } = require('.../validation/ArchitectureValidator');

// Security checks
const { SecurityValidator } = require('.../validation/SecurityValidator');

// Performance checks
const { PerformanceValidator } = require('.../validation/PerformanceValidator');

// Accessibility
const { AccessibilityValidator } = require('.../validation/AccessibilityValidator');
```

---

## CLI Commands

### RefactorCommand

**File:** `lib/refactoring/cli/RefactorCommand.js`

Main refactoring command.

```javascript
class RefactorCommand {
  /**
   * Execute refactoring
   * @param {string} source - React source path
   * @param {string} target - Flutter output path
   * @param {Object} options
   * @returns {Promise<RefactorResult>}
   */
  async execute(source, target, options)
}
```

**Options:**

```javascript
{
  ai: 'claude' | 'qwen' | 'gemini' | 'mock' | 'none',
  stateManagement: 'bloc' | 'cubit',
  validate: boolean,
  enhance: boolean,
  generateTests: boolean,
  interactive: boolean,
  continueOnError: boolean,
  clean: boolean
}
```

**Programmatic Usage:**

```javascript
const { RefactorCommand } = require('prprompts-flutter-generator/lib/refactoring/cli');

const command = new RefactorCommand();

const result = await command.execute('./react-app', './flutter-app', {
  ai: 'claude',
  stateManagement: 'bloc',
  validate: true,
  enhance: true,
  generateTests: true
});

if (result.success) {
  console.log(`Converted ${result.filesProcessed} files`);
  console.log(`Validation score: ${result.validation.score}`);
} else {
  console.error('Errors:', result.errors);
}
```

---

## Utilities

### FileHandler

**File:** `lib/refactoring/utils/fileHandler.js`

File system utilities.

```javascript
const fileHandler = {
  /**
   * Read file with encoding detection
   */
  async readFile(filePath),

  /**
   * Write file with proper formatting
   */
  async writeFile(filePath, content),

  /**
   * Find all React files
   */
  async findReactFiles(basePath),

  /**
   * Create directory structure
   */
  async createStructure(basePath, structure)
}
```

### Logger

**File:** `lib/refactoring/utils/logger.js`

Logging utilities.

```javascript
const logger = {
  info(message),
  warn(message),
  error(message),
  debug(message),
  success(message)
}
```

---

## Complete Example

Here's a complete example of programmatic refactoring:

```javascript
const {
  ReactParser,
  WidgetGenerator,
  BlocGenerator,
  CleanArchitectureGenerator,
  CodeEnhancer,
  ValidationOrchestrator
} = require('prprompts-flutter-generator/lib/refactoring');

const { ClaudeClient } = require('prprompts-flutter-generator/lib/refactoring/ai');

async function refactorComponent(reactCode, outputPath) {
  // 1. Parse React
  const parser = new ReactParser();
  const component = parser.parse(reactCode, 'Component.jsx');

  // 2. Generate Flutter widget
  const widgetGen = new WidgetGenerator();
  const widget = widgetGen.generate(component);

  // 3. Generate BLoC (if stateful)
  if (component.hasState) {
    const blocGen = new BlocGenerator();
    const { bloc, events, states } = blocGen.generateBloc(component);
    // ... save files
  }

  // 4. Generate Clean Architecture
  const archGen = new CleanArchitectureGenerator();
  await archGen.generate(component, outputPath);

  // 5. Enhance with AI
  const aiClient = new ClaudeClient(process.env.ANTHROPIC_API_KEY);
  const enhancer = new CodeEnhancer(aiClient);
  const enhanced = await enhancer.enhance(widget.dartCode, {
    addValidation: true,
    improveAccessibility: true
  });

  // 6. Validate
  const validator = new ValidationOrchestrator();
  const validation = await validator.validate({ code: enhanced });

  console.log(`Validation score: ${validation.score}`);

  return {
    component,
    widget,
    enhanced,
    validation
  };
}

// Usage
refactorComponent(reactCode, './flutter-app')
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

---

## Type Definitions

For TypeScript users, type definitions are available:

```typescript
import {
  ComponentModel,
  WidgetModel,
  ReactParser,
  WidgetGenerator,
  RefactorCommand
} from 'prprompts-flutter-generator/lib/refactoring';

const parser: ReactParser = new ReactParser();
const component: ComponentModel = parser.parse(code, 'file.jsx');
```

---

**Version:** 5.0.0
**Last Updated:** 2024
**License:** MIT
