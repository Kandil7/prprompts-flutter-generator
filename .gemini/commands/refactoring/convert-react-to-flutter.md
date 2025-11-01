# Convert React to Flutter

You are helping convert React/React Native code to Flutter using the PRPROMPTS refactoring system.

## Overview

This command guides the user through converting a React application to Flutter with Clean Architecture, BLoC/Cubit state management, and production-ready patterns.

## Steps

### 1. Gather Information

Ask the user for:

1. **React source directory**: Where is the React code located?
   - Example: `./src`, `./app`, `./components`
   - Validate that the directory exists

2. **Flutter target directory**: Where should the Flutter code be generated?
   - Example: `./flutter-app`, `./mobile`
   - Will be created if it doesn't exist

3. **Conversion options**: What preferences do they have?
   - State management: Auto-detect, BLoC, Cubit, or Provider?
   - Architecture: Clean Architecture (recommended), MVC, or MVVM?
   - AI enhancement: Enable AI code optimization? (slower but higher quality)
   - Validation: Run validation after conversion?

### 2. Run Conversion

Execute the conversion command:

```bash
prprompts refactor <source> <target> --ai claude --validate
```

Example:
```bash
prprompts refactor ./src ./flutter-app --ai claude --validate --state-management bloc --architecture clean
```

### 3. Show Progress

As the conversion runs, explain what's happening:

1. **Parsing React files**: Analyzing components, hooks, state management
2. **Generating Flutter code**: Creating widgets, BLoCs, repositories
3. **AI Enhancement**: Optimizing code quality, generating tests
4. **Validation**: Checking code quality, security, performance
5. **Writing files**: Saving generated Flutter code

### 4. Display Results

After conversion completes, show:

```
✅ Conversion Summary:
  • Files converted: 15
  • Components: 12 → 12 widgets
  • Lines of code: 2,450 (React) → 2,850 (Flutter)
  • State management: BLoC (3 files), Cubit (9 files)

📊 Validation Results:
  Overall Score: 85/100 (B)
  ✓ Code Quality: 90/100
  ✓ Security: 100/100
  ! Performance: 75/100 (5 warnings)
  ✗ Accessibility: 65/100 (2 errors)

📁 Generated Files:
  flutter-app/
  ├── lib/
  │   ├── core/            # Shared infrastructure
  │   ├── features/        # Feature modules (Clean Architecture)
  │   └── config/          # App configuration
  └── test/                # Unit & widget tests
```

### 5. Show Issues (if any)

If there are validation issues, highlight them:

```
⚠️  Issues Found:
  ERROR [A11y] Missing Semantics label (login_page.dart:42)
  WARN [Perf] Missing const constructor (user_card.dart:15)
```

### 6. Provide Next Steps

Guide the user on what to do next:

```
💡 Next Steps:
  1. Review generated code in: flutter-app/
  2. Run: cd flutter-app && flutter pub get
  3. Run: flutter analyze
  4. Run: flutter test
  5. Review validation report: flutter-app/.prprompts/validation-report.html
```

### 7. Offer to Help Further

Ask if they need help with:
- Reviewing specific files
- Fixing validation issues
- Understanding the architecture
- Adding missing features
- Optimizing performance

## Example Conversation

**Assistant**: I'll help you convert your React application to Flutter! Let's start by gathering some information.

**Assistant**: Where is your React source code located? (e.g., `./src`, `./components`)

**User**: ./src

**Assistant**: Great! Where would you like the Flutter code to be generated? (e.g., `./flutter-app`)

**User**: ./flutter-app

**Assistant**: Perfect! Now, let me ask about your preferences:

1. **State Management**: Would you like me to auto-detect the best option, or do you have a preference (BLoC, Cubit, Provider)?

**User**: Auto-detect

**Assistant**: 2. **Architecture**: I recommend Clean Architecture for maintainability. Should I use that?

**User**: Yes

**Assistant**: 3. **AI Enhancement**: Would you like me to use AI to optimize the code quality and generate tests? This will take longer but produce higher quality code.

**User**: Yes, use AI

**Assistant**: Excellent! I'll now convert your React app to Flutter with these settings:
- Source: ./src
- Target: ./flutter-app
- State Management: Auto-detect
- Architecture: Clean Architecture
- AI Enhancement: Enabled (Claude)
- Validation: Enabled

Running conversion...

```bash
prprompts refactor ./src ./flutter-app --ai claude --validate --state-management auto --architecture clean
```

[Show progress and results as conversion runs]

## Key Features to Highlight

1. **Clean Architecture**: Separates domain, data, and presentation layers
2. **BLoC/Cubit**: Type-safe state management with event-driven architecture
3. **Responsive**: Adapts to mobile, tablet, and desktop
4. **Tests**: Auto-generates unit and widget tests
5. **Security**: Built-in security patterns (JWT, encryption, etc.)
6. **Validation**: Comprehensive quality checks

## Common Issues & Solutions

### Issue: "Directory not found"
**Solution**: Ensure the React source path is correct. Try using an absolute path.

### Issue: "No React components found"
**Solution**: Check that your React files use `.jsx`, `.tsx`, `.js`, or `.ts` extensions.

### Issue: "Conversion failed"
**Solution**: Check the error message. Common causes:
- Invalid React syntax
- Missing dependencies
- Unsupported React features

### Issue: "Low validation score"
**Solution**: Review the validation report and fix issues:
- Add Semantics labels for accessibility
- Use const constructors
- Fix security warnings

## Important Notes

- **Backup your code**: Always commit your React code before conversion
- **Review generated code**: AI-generated code should be reviewed
- **Run tests**: Always run `flutter test` after conversion
- **Iterative process**: You may need to refine the conversion
- **Ask for help**: If you're stuck, ask me to help with specific files or issues

## Commands Reference

```bash
# Basic conversion
prprompts refactor <source> <target>

# With options
prprompts refactor ./src ./flutter-app --ai claude --validate

# Interactive mode
prprompts refactor-interactive

# Validation only
prprompts validate ./flutter-app --config strict --format html

# CI mode
prprompts validate ./flutter-app --ci --threshold 85
```
