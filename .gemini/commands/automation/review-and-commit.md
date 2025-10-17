# Review and Commit (PRPROMPTS-Validated)

Perform PRPROMPTS validation gates and commit.

## 1. PRPROMPTS Validation Gates
For the current task, read its referenced PRPROMPTS file and check:

From **VALIDATION GATES** section:
- [ ] Pre-commit checklist items all passed
- [ ] Code examples match PRPROMPTS patterns
- [ ] Constraints (DO/DON'T) respected

Example for BLoC task:
```
VALIDATION GATES from @PRPROMPTS/03-bloc_implementation.md:
✓ BLoC uses events/states (not methods)
✓ No business logic in widgets
✓ Repository abstraction exists
✓ Tests cover all BLoC states
```

## 2. Security Validation
If task involves sensitive data:
- Run checklist from @PRPROMPTS/16-security_and_compliance.md
- Verify no hardcoded secrets
- Check encryption for PII/PHI
- Verify JWT implementation (RS256 only!)

## 3. Code Quality Gates
```bash
# Analyzer
flutter analyze
# Expect: No issues found

# Tests
flutter test
# Expect: All tests passing

# Format
dart format lib/ test/ --set-exit-if-changed
# Expect: No formatting changes needed
```

## 4. Generate Commit Message
Format: `type(scope): description`

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring
- test: Adding tests
- docs: Documentation
- chore: Maintenance

Scope: Feature name or module

Description: Reference PRPROMPTS file used

Example:
```
feat(auth): implement JWT verification with RS256

- Followed @PRPROMPTS/04-api_integration.md
- Public key verification only (no signing in Flutter)
- Added unit tests for token validation
- Refs: IMPLEMENTATION_PLAN.md Task 2.3
```

## 5. Commit
```bash
git commit -m "[generated message]"
```

## 6. Progress Report
```
✓ Commit: [hash]
✓ Progress: X/Y tasks (Z% complete)
✓ Phase: [current phase]
✓ Next: [next task name]

Continue? Say 'next' or 'pause'
```
