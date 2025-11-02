# React-to-Flutter Refactoring System

**Phase 1: Core Infrastructure and Models** - COMPLETED

## Overview

This directory contains the core infrastructure for converting React/React Native applications to Flutter using AI-enhanced parsing and code generation. The system is designed to be modular, extensible, and maintainable.

## Architecture

```
lib/refactoring/
├── models/                 # Core data models
│   ├── ComponentModel.js      # React component representation
│   ├── WidgetModel.js         # Flutter widget representation
│   ├── ConversionContext.js   # Conversion state management
│   └── ValidationResult.js    # Validation results
├── parsers/               # React code parsers (Phase 2)
├── generators/            # Flutter code generators (Phase 2)
├── ai/                    # AI integration (Phase 3)
├── validation/            # Validators (Phase 2)
└── utils/                 # Utilities
    ├── logger.js             # Logging utility
    ├── fileHandler.js        # File operations
    └── config.js             # Configuration management
```

## Core Models

### ComponentModel

Represents a parsed React component with all its properties and metadata.

**Features:**
- Props and state tracking
- Hook detection
- API endpoint mapping
- Complexity analysis
- State management pattern detection
- Automatic Flutter state management recommendation

**Usage:**
```javascript
const { ComponentModel, ComponentType } = require('./models/ComponentModel');

const component = new ComponentModel({
  filePath: 'src/components/LoginPage.tsx',
  name: 'LoginPage',
  type: ComponentType.PAGE,
  props: [
    { name: 'onSuccess', type: 'function', isRequired: false }
  ],
  state: [
    { name: 'email', type: 'string', initialValue: '""' },
    { name: 'password', type: 'string', initialValue: '""' }
  ],
  apiEndpoints: [
    { method: 'POST', path: '/auth/login' }
  ]
});

// Get complexity score
const score = component.getComplexityScore(); // 0-10

// Get recommended Flutter state management
const stateManagement = component.recommendedFlutterStateManagement(); // 'bloc' or 'cubit'
```

### WidgetModel

Represents a Flutter widget with all its properties and metadata.

**Features:**
- Property management with Dart type support
- Import statement generation
- Child widget hierarchy
- Code skeleton generation
- Naming convention support

**Usage:**
```javascript
const { WidgetModel, WidgetType } = require('./models/WidgetModel');

const widget = new WidgetModel({
  name: 'LoginPage',
  type: WidgetType.STATEFUL,
  properties: [
    { name: 'title', type: 'String', isRequired: true }
  ],
  imports: [
    { package: 'flutter/material.dart' }
  ]
});

// Generate Dart code skeleton
const code = widget.generateSkeletonCode();

// Get file name
const fileName = widget.getFileName(); // 'login_page.dart'
```

### ConversionContext

Maintains state and context during the entire conversion process.

**Features:**
- Component and widget tracking
- Element and type mappings
- Error and warning management
- Statistics and progress tracking
- Serialization support

**Usage:**
```javascript
const { ConversionContext, ConversionPhase } = require('./models/ConversionContext');

const context = new ConversionContext({
  projectName: 'My App',
  sourceRoot: './react-app',
  targetRoot: './flutter-app'
});

// Start conversion
context.start(ConversionPhase.PARSING);

// Initialize default mappings
context.initializeDefaultMappings();

// Add components and widgets
context.addComponent(reactComponent);
context.addWidget(flutterWidget);

// Track errors and warnings
context.addError({
  message: 'Failed to parse component',
  component: 'LoginPage',
  phase: ConversionPhase.PARSING
});

// Get statistics
const stats = context.getStatistics();
console.log(context.getSummary());
```

### ValidationResult

Represents validation results with severity levels and suggestions.

**Features:**
- Multi-level severity (error, warning, info, success)
- Categorization (syntax, type, structure, etc.)
- Scoring and grading (0-100, A-F)
- Detailed reporting

**Usage:**
```javascript
const { ValidationResult, ValidationSeverity } = require('./models/ValidationResult');

const result = new ValidationResult({
  target: 'LoginPage.tsx',
  valid: true
});

// Add issues
result.addError('Missing required prop: onPress', {
  file: 'src/components/Button.tsx',
  line: 42,
  suggestions: ['Add onPress prop to Button component']
});

result.addWarning('Consider using memo for performance', {
  category: 'performance'
});

// Get score and grade
const score = result.getScore(); // 0-100
const grade = result.getGrade(); // A-F

// Generate report
console.log(result.getDetailedReport());
```

## Utilities

### Logger

Comprehensive logging utility with multiple levels and file output support.

**Features:**
- Multiple log levels (DEBUG, INFO, WARN, ERROR, SILENT)
- Colorized terminal output
- File logging support
- Child logger creation
- Progress indicators

**Usage:**
```javascript
const { createModuleLogger, LogLevel } = require('./utils/logger');

const logger = createModuleLogger('MyModule');

logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');

logger.success('Operation completed successfully');
logger.failure('Operation failed');

// Progress tracking
logger.progress(5, 10, 'Converting components');

// Create child logger
const childLogger = logger.child('SubModule');
```

### FileHandler

Safe file operations with error handling and validation.

**Features:**
- Read, write, copy, delete operations
- Directory management
- JSON file support
- Recursive file search
- Path resolution

**Usage:**
```javascript
const { createFileHandler } = require('./utils/fileHandler');

const fileHandler = createFileHandler({
  baseDir: process.cwd(),
  createMissing: true,
  overwrite: false
});

// Read file
const content = await fileHandler.readFile('src/component.tsx');

// Write file
await fileHandler.writeFile('lib/widget.dart', dartCode);

// Ensure directory exists
await fileHandler.ensureDir('lib/features/auth');

// Find files
const components = await fileHandler.findFiles('src', /\.tsx$/);

// JSON operations
const config = await fileHandler.readJSON('config.json');
await fileHandler.writeJSON('output.json', data);
```

### Config

Configuration management with validation and persistence.

**Features:**
- Default configuration
- Deep merging
- Validation
- File persistence (JSON, JS)
- Dot-notation access

**Usage:**
```javascript
const { createConfig, loadConfig } = require('./utils/config');

// Create with custom config
const config = createConfig({
  conversion: {
    stateManagement: {
      default: 'cubit'
    }
  }
});

// Get values
const stateManagement = config.get('conversion.stateManagement.default');

// Set values
config.set('logging.level', 'debug');

// Load from file
const config2 = await loadConfig('refactoring.config.json');

// Save to file
await config.saveToFile('my-config.json');
```

## Testing

All models and utilities have comprehensive unit tests.

**Run tests:**
```bash
npm test -- tests/refactoring/models/ComponentModel.test.js
npm test -- tests/refactoring/models/WidgetModel.test.js
```

**Test coverage:**
- ComponentModel: All methods and edge cases
- WidgetModel: All methods and edge cases
- Serialization/deserialization
- Validation and error handling

## Implementation Status

### Phase 1: Core Infrastructure and Models ✅ COMPLETED

**Completed:**
- ✅ Directory structure
- ✅ ComponentModel with props, state, hooks, methods
- ✅ WidgetModel with properties, children, imports
- ✅ ConversionContext with mappings and error tracking
- ✅ ValidationResult with severity levels and scoring
- ✅ Logger utility with multiple levels and colors
- ✅ FileHandler utility with comprehensive file operations
- ✅ Config utility with validation and persistence
- ✅ Comprehensive test suites for ComponentModel and WidgetModel
- ✅ Complete JSDoc documentation

**Key Features:**
- Immutable model design where appropriate
- Comprehensive validation and error handling
- ES6+ best practices (classes, async/await, const/let)
- Full serialization/deserialization support
- Testable and maintainable code

### Phase 2: Parsers and Generators (NEXT)

**Planned:**
- React/JSX parser using AST (Abstract Syntax Tree)
- TypeScript type extractor
- State management pattern detector
- Flutter widget generator
- Dart code formatter
- Import organizer

### Phase 3: AI Integration

**Planned:**
- OpenAI/Anthropic integration for complex conversions
- Code quality analyzer
- Best practice recommender
- Documentation generator

### Phase 4: CLI and Tooling

**Planned:**
- Command-line interface
- Interactive mode
- Watch mode for incremental conversion
- Progress reporting
- Diff viewer

## Design Principles

1. **Modularity** - Each module has a single responsibility
2. **Testability** - All code is unit-testable
3. **Documentation** - Comprehensive JSDoc comments
4. **Error Handling** - Graceful error handling with detailed messages
5. **Immutability** - Models are immutable where appropriate
6. **Type Safety** - Input validation on all constructors
7. **Extensibility** - Easy to add new features and mappings

## Next Steps

To continue implementation:

1. **Phase 2 - Parsers:**
   - Implement React component parser using `@babel/parser`
   - Extract component structure, props, state, hooks
   - Detect state management patterns
   - Extract styling information

2. **Phase 2 - Generators:**
   - Implement Flutter widget generator
   - Generate Clean Architecture structure (domain/data/presentation)
   - Generate BLoC/Cubit based on complexity
   - Generate tests

3. **Phase 3 - AI Integration:**
   - Integrate with Claude API for complex conversions
   - Generate documentation
   - Suggest optimizations

4. **Phase 4 - CLI:**
   - Create command-line interface
   - Add interactive prompts
   - Implement watch mode

## Contributing

When adding new features:

1. Follow existing patterns and conventions
2. Add comprehensive JSDoc documentation
3. Write unit tests with good coverage
4. Update this README
5. Follow ES6+ best practices

## License

MIT License - Part of prprompts-flutter-generator project
