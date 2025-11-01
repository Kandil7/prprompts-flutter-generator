# Phase 5: Validation System

## Overview

Comprehensive validation framework for React-to-Flutter refactoring that ensures:
- ✅ Dart code syntax and conventions
- ✅ Clean Architecture compliance
- ✅ Security best practices (HIPAA, PCI-DSS, GDPR)
- ✅ Performance optimization
- ✅ Accessibility standards (WCAG AA)
- ✅ Behavior consistency with React source

## Features

### 🎯 Core Validators

1. **CodeValidator** - Dart syntax and conventions
   - Syntax validation (braces, parentheses)
   - Import checks (Flutter, BLoC, required packages)
   - Class structure (extends/implements)
   - Constructor validation (Key? key, super())
   - Method signatures (build(), initState(), dispose())
   - Null safety compliance (String?, required, late)
   - Naming conventions (PascalCase, camelCase)
   - Best practices (const, logging, TODO comments)

2. **ArchitectureValidator** - Clean Architecture compliance
   - Folder structure (domain/data/presentation)
   - Layer dependencies (domain isolated from data/presentation)
   - Repository pattern (abstract in domain, impl in data)
   - Use case pattern (single responsibility)
   - BLoC/Cubit structure (events, states, bloc)
   - Entity/Model separation

3. **SecurityValidator** - Security best practices
   - Hardcoded secrets detection (API keys, tokens, passwords)
   - JWT handling (verify only, never sign)
   - PCI-DSS compliance (no card storage)
   - HIPAA compliance (encryption, audit logging)
   - HTTPS enforcement
   - SQL injection detection
   - XSS vulnerability detection
   - Sensitive data logging
   - Cryptographic practices

4. **PerformanceValidator** - Performance optimization
   - Missing const constructors
   - Excessive rebuilds (BlocBuilder without buildWhen)
   - ListView usage (builder vs direct)
   - Expensive operations in build()
   - Unnecessary setState() calls
   - Image loading optimization
   - RepaintBoundary usage
   - Memoization opportunities

5. **AccessibilityValidator** - WCAG AA compliance
   - Semantics widgets for screen readers
   - Button labels and tooltips
   - Touch target sizes (>= 48x48dp)
   - Color contrast ratios (>= 4.5:1)
   - Form field labels
   - Image alt text
   - Live region announcements

### 🎭 Behavior Validators (Optional - requires React source)

6. **StateValidator** - State management consistency
7. **PropsValidator** - Props/parameters matching
8. **ApiValidator** - API endpoint behavior consistency

### 🎼 Orchestration

**ValidationOrchestrator** - Runs all validators and generates comprehensive reports
- Coordinates multiple validators
- Aggregates results with weighted scoring
- Generates reports in JSON, HTML, and Markdown
- Provides actionable recommendations
- Categorizes issues by severity (error, warning, info)

### 📊 Report Generation

**ReportGenerator** - Creates beautiful, actionable reports
- **JSON**: Machine-readable format for CI/CD
- **HTML**: Interactive web view with charts and styling
- **Markdown**: Documentation format for README/docs

## Usage

### Quick Start

```javascript
const { validateProject, ValidationConfig } = require('./validation');

// Validate entire Flutter project
const results = await validateProject('/path/to/flutter/project', {
  ...ValidationConfig.strict,
  reportFormats: ['html', 'json', 'markdown'],
  outputPath: './validation-reports'
});

console.log(`Score: ${results.overallScore}/100 (${results.grade})`);
console.log(`Passed: ${results.passed ? 'YES' : 'NO'}`);
```

### Validate Single File

```javascript
const { validateFile } = require('./validation');

const results = await validateFile(
  '/path/to/file.dart',
  null, // Will read from file
  ValidationConfig.standard
);

console.log(`Errors: ${results.summary.totalErrors}`);
console.log(`Warnings: ${results.summary.totalWarnings}`);
```

### Use Specific Validator

```javascript
const { validateWith } = require('./validation');

// Security check only
const securityResults = validateWith(
  'security',
  '/path/to/project',
  null,
  { checkSecrets: true, checkCompliance: true }
);

// Performance check
const perfResults = validateWith(
  'performance',
  '/path/to/file.dart',
  dartCode
);
```

### Custom Configuration

```javascript
const customConfig = {
  enabledValidators: {
    code: true,
    architecture: true,
    security: true,
    performance: false,
    accessibility: false
  },
  thresholds: {
    minimumScore: 85,
    errorTolerance: 0,
    warningTolerance: 10
  },
  code: {
    strictNullSafety: true,
    requireConstConstructors: true
  },
  security: {
    checkSecrets: true,
    strictMode: true
  },
  reportFormats: ['html'],
  outputPath: './reports'
};

const results = await validateProject('/path/to/project', customConfig);
```

## Configuration Templates

### Strict (Production)
```javascript
ValidationConfig.strict
```
- All validators enabled
- Minimum score: 90
- Zero error tolerance
- For production-ready code

### Standard (Development)
```javascript
ValidationConfig.standard
```
- All validators enabled
- Minimum score: 80
- Balanced thresholds
- For active development

### Lenient (Legacy)
```javascript
ValidationConfig.lenient
```
- Only critical validators
- Minimum score: 60
- Relaxed thresholds
- For legacy code migration

### Security-Focused
```javascript
ValidationConfig.security
```
- Security validator only
- Zero tolerance
- For security audits

### Performance-Focused
```javascript
ValidationConfig.performance
```
- Performance validator only
- High thresholds
- For optimization work

## Validation Results Structure

```javascript
{
  projectPath: string,
  timestamp: string,
  overallScore: number,      // 0-100
  grade: string,             // A, B, C, D, F
  passed: boolean,
  duration: string,

  summary: {
    totalErrors: number,
    totalWarnings: number,
    totalInfo: number,
    filesValidated: number,
    criticalIssues: number
  },

  validators: {
    code: ValidationResult,
    architecture: ValidationResult,
    security: ValidationResult,
    performance: ValidationResult,
    accessibility: ValidationResult
  },

  issues: [
    {
      severity: 'error' | 'warning' | 'info',
      message: string,
      path?: string,
      line?: number,
      suggestion: string,
      code?: string,
      validator: string
    }
  ],

  recommendations: [
    {
      priority: 'critical' | 'high' | 'medium' | 'low',
      category: string,
      message: string,
      action: string
    }
  ]
}
```

## Validation Rules

### Security Rules

```javascript
// ❌ Bad: Hardcoded API key
const apiKey = 'sk_live_12345';

// ✅ Good: Environment variable
const apiKey = Config.apiKey;

// ❌ Bad: JWT signing in Flutter
jwt.sign(payload, privateKey);

// ✅ Good: JWT verification only
jwt.verify(token, publicKey);

// ❌ Bad: Storing card numbers
final cardNumber = '4242424242424242';

// ✅ Good: Using tokenization
final cardToken = stripe.createToken(card);

// ❌ Bad: HTTP endpoint
http://api.example.com

// ✅ Good: HTTPS endpoint
https://api.example.com
```

### Performance Rules

```javascript
// ❌ Bad: Non-const widget
Text('Hello')

// ✅ Good: Const widget
const Text('Hello')

// ❌ Bad: ListView with children
ListView(children: items.map((i) => Widget()).toList())

// ✅ Good: ListView.builder
ListView.builder(itemCount: items.length, itemBuilder: ...)

// ❌ Bad: BlocBuilder without buildWhen
BlocBuilder<MyBloc, MyState>(builder: ...)

// ✅ Good: BlocBuilder with buildWhen
BlocBuilder<MyBloc, MyState>(
  buildWhen: (prev, curr) => prev.id != curr.id,
  builder: ...
)
```

### Accessibility Rules

```javascript
// ❌ Bad: GestureDetector without Semantics
GestureDetector(onTap: ..., child: Icon(...))

// ✅ Good: Wrapped with Semantics
Semantics(
  label: 'Submit form',
  child: GestureDetector(onTap: ..., child: Icon(...))
)

// ❌ Bad: Small touch target (24x24)
Container(width: 24, height: 24, child: GestureDetector(...))

// ✅ Good: Minimum touch target (48x48)
Container(width: 48, height: 48, child: GestureDetector(...))

// ❌ Bad: Low contrast colors
Color(0xFFAAAAAA) on Color(0xFFBBBBBB) // 1.2:1

// ✅ Good: High contrast colors
Color(0xFF000000) on Color(0xFFFFFFFF) // 21:1
```

## Report Examples

### HTML Report
![HTML Report Screenshot](html-report-sample.png)

Features:
- Interactive score cards with color-coded grades
- Issue grouping by validator and severity
- Actionable recommendations with priority levels
- Responsive design for mobile/desktop viewing

### Markdown Report

```markdown
# Validation Report

**Project:** my-flutter-app
**Score:** 85/100 (Grade: B)
**Status:** ✅ PASSED

## Summary
- Errors: 2
- Warnings: 15
- Info: 8
- Files Validated: 45

## Validator Scores
- Code: 90/100 ✅
- Architecture: 85/100 ✅
- Security: 100/100 🎯
- Performance: 75/100 ⚠️
- Accessibility: 65/100 ❌

## Recommendations
### ⚠️ Performance (HIGH)
**Issue:** Performance score below 70
**Action:** Optimize const constructors and ListView usage
```

## Integration with CI/CD

### GitHub Actions

```yaml
- name: Validate Flutter Code
  run: |
    node -e "
    const { validateProject, ValidationConfig } = require('./lib/refactoring/validation');
    validateProject('./', ValidationConfig.strict).then(results => {
      console.log(\`Score: \${results.overallScore}/100\`);
      if (!results.passed) process.exit(1);
    });
    "
```

### Pre-commit Hook

```bash
#!/bin/bash
node -e "
const { validateFile } = require('./lib/refactoring/validation');
const files = process.argv.slice(1);
Promise.all(files.map(f => validateFile(f))).then(results => {
  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.error('Validation failed for:', failed.map(r => r.filePath));
    process.exit(1);
  }
});
" $@
```

## Testing

Run validator tests:

```bash
npm test tests/refactoring/validation/
```

Tests cover:
- Syntax validation edge cases
- Architecture pattern detection
- Security vulnerability detection
- Performance anti-patterns
- Accessibility compliance
- Score calculation accuracy

## Performance

- **Single file validation:** ~100ms
- **Project validation (100 files):** ~5-10s
- **Report generation:** ~50ms (JSON), ~200ms (HTML)

## Limitations

1. **Behavior Validators**: Require React source code for comparison
2. **Dynamic Analysis**: Cannot detect runtime-only issues
3. **False Positives**: May flag intentional patterns as issues
4. **Custom Rules**: Requires code modifications for project-specific rules

## Roadmap

- [ ] State/Props/API validators implementation
- [ ] Auto-fix capabilities for common issues
- [ ] Custom rule configuration UI
- [ ] IDE integration (VS Code extension)
- [ ] Real-time validation in editor
- [ ] Machine learning for pattern detection

## License

MIT License - Part of PRPROMPTS Flutter Generator

---

*Generated by PRPROMPTS Flutter Generator - Phase 5 Validation System*
