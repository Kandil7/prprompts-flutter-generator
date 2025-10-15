# PRPROMPTS Specification v2.0

Complete specification for generating secure, adaptive PRPROMPTS files for large-scale Flutter projects.

## Overview

PRPROMPTS (Prompt Reference Pattern) is a structured approach to generating development guides that are:
- **PRD-Driven**: Customized based on project requirements
- **Compliance-Aware**: HIPAA, PCI-DSS, GDPR support
- **Junior-Friendly**: Explains "why" behind every rule
- **Security-Critical**: Correct JWT, encryption, tokenization patterns

## PRP Pattern

Every PRPROMPTS file MUST follow this exact structure:

```markdown
## FEATURE
What this guide helps you accomplish

## EXAMPLES
Real code with actual file paths (lib/features/login/presentation/login_page.dart)

## CONSTRAINTS
✅ DO / ❌ DON'T rules

## VALIDATION GATES
Manual checklist + automated CI checks

## BEST PRACTICES
Junior-friendly explanations with "Why?" sections

## REFERENCES
Official docs, compliance guides, internal ADRs
```

## Critical Definitions

### Clean Architecture
Uncle Bob's layered approach:
- **Presentation Layer**: UI, BLoC/Cubit, Widgets
- **Domain Layer**: Entities, Use Cases, Repository Interfaces (NO external imports!)
- **Data Layer**: Repository Implementations, Data Sources, Models

### JWT in Flutter (CRITICAL ⚠️)

**The #1 Security Mistake:**
- ❌ **NEVER** sign JWT tokens in Flutter
- ❌ **NEVER** store private keys in Flutter code
- ❌ **NEVER** use HS256 (symmetric) algorithm

**Correct Approach:**
- ✅ **Backend signs** tokens (Node.js with `node-jsonwebtoken`, RS256)
- ✅ **Flutter only verifies** tokens using public key
- ✅ Use `dart_jsonwebtoken` package for verification
- ✅ Always verify claims: `aud`, `iss`, `exp`, `sub`

**Example (Backend - Node.js)**:
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(payload, privateKey, {
  algorithm: 'RS256',
  expiresIn: '15m',
  audience: 'my-flutter-app',
  issuer: 'api.example.com'
});
```

**Example (Flutter - Verification Only)**:
```dart
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

Future<bool> verifyToken(String token) async {
  try {
    final jwt = JWT.verify(
      token,
      RSAPublicKey(publicKeyString), // Public key only!
      audience: Audience(['my-flutter-app']),
      issuer: 'api.example.com',
    );
    // Verify expiration
    return jwt.payload['exp'] > DateTime.now().millisecondsSinceEpoch / 1000;
  } catch (e) {
    print('Token verification failed: $e');
    return false;
  }
}
```

**Why?**
- Private keys in Flutter = anyone can extract and create fake tokens
- RS256 (asymmetric) = backend signs with private key, Flutter verifies with public key
- Verifying `aud` prevents token reuse across different services
- Verifying `exp` prevents replay attacks with stolen tokens

### Integrated Tools

1. **Structurizr** - C4 model as code
   - Generates interactive architecture diagrams
   - DSL format: `workspace.dsl`
   - Command: `structurizr-cli export -workspace workspace.dsl -format plantuml`

2. **Serena MCP** - Semantic code analysis for Flutter
   - Context-aware refactoring
   - Flutter-specific rules
   - Command: `serena analyze lib/features/`

3. **GitHub CLI** - AI-powered commands
   - `/fix-github-issue 123` - Auto-fix issues
   - `gh pr create --fill` - Auto PR descriptions
   - `gh copilot suggest "add unit tests"`

## File Structure

### Phase 1: Core Architecture (Files 1-10)
Focus: Clean Architecture, BLoC, Testing, Performance

1. **feature_scaffold.md** - Clean Architecture + BLoC scaffold
2. **responsive_layout.md** - Adaptive UI (mobile/tablet/desktop)
3. **bloc_implementation.md** - BLoC vs Cubit decision matrix
4. **api_integration.md** - ⚠️ JWT verification, HTTP clients
5. **testing_strategy.md** - Test pyramid (80%+ coverage)
6. **design_system_usage.md** - Material 3, theme
7. **onboarding_junior.md** - New developer guide
8. **accessibility_a11y.md** - WCAG 2.1 Level AA
9. **internationalization_i18n.md** - ARB files, i18n
10. **performance_optimization.md** - FPS, memory, build times

### Phase 2: Quality, Security & Team (Files 11-22)
Focus: Git, Security, Compliance, Team Coordination

11. **git_branching_strategy.md** - Feature branches, PR reviews
12. **progress_tracking_workflow.md** - Sprint planning, issue tracking
13. **multi_team_coordination.md** - Cross-team dependencies
14. **security_audit_checklist.md** - Pre-release security
15. **release_management.md** - App Store submission
16. **security_and_compliance.md** - ⭐ PRD-sensitive (HIPAA/PCI-DSS/GDPR)
17. **performance_optimization_detailed.md** - Advanced profiling
18. **quality_gates_and_code_metrics.md** - Coverage, complexity
19. **localization_and_accessibility.md** - RTL, i18n + a11y
20. **versioning_and_release_notes.md** - Semantic versioning
21. **team_culture_and_communication.md** - Async-first
22. **autodoc_integration.md** - `dartdoc`, code comments

### Phase 3: Advanced Systems (Files 23-32 + README)
Focus: AI, Analytics, Demos, Retrospectives

23. **ai_pair_programming_guide.md** - Claude Code, GitHub Copilot
24. **dashboard_and_analytics.md** - Firebase Analytics, Crashlytics
25. **tech_debt_and_refactor_strategy.md** - Debt tracking
26. **demo_environment_setup.md** - ⭐ PRD-scenario based
27. **demo_progress_tracker.md** - Client-facing dashboard
28. **demo_branding_and_visuals.md** - Client theming
29. **demo_deployment_automation.md** - CI/CD for demos
30. **client_demo_report_template.md** - Weekly summaries
31. **project_role_adaptation.md** - ⭐ PRD-driven (team size)
32. **lessons_learned_engine.md** - Retrospectives
+ **README.md** - Index and usage guide

## Customization Rules

PRPROMPTS files are customized based on PRD YAML metadata:

### Compliance-Based

**HIPAA** (`compliance: ["hipaa"]`):
- `16-security_and_compliance.md`: PHI encryption (AES-256-GCM), audit logging
- `04-api_integration.md`: HTTPS-only validation
- `24-dashboard_and_analytics.md`: Warning against logging PHI

**PCI-DSS** (`compliance: ["pci-dss"]`):
- `16-security_and_compliance.md`: Payment tokenization (Stripe/PayPal)
- `04-api_integration.md`: TLS 1.2+ requirement
- `14-security_audit_checklist.md`: PCI SAQ checklist

**GDPR** (`compliance: ["gdpr"]`):
- `16-security_and_compliance.md`: Consent management, right to erasure
- `24-dashboard_and_analytics.md`: Cookie consent

### Auth Method

**JWT** (`auth_method: "jwt"`):
- `04-api_integration.md`: JWT verification example (Flutter side only!)
- `16-security_and_compliance.md`: Token refresh flow

**OAuth2** (`auth_method: "oauth2"`):
- `04-api_integration.md`: OAuth2 flow (Google/GitHub)
- `16-security_and_compliance.md`: PKCE requirement

**Firebase** (`auth_method: "firebase"`):
- `04-api_integration.md`: Firebase Auth example
- `24-dashboard_and_analytics.md`: Firebase Console integration

### Offline Support

**Offline Mode** (`offline_support: true`):
- `04-api_integration.md`: Retry logic, queue sync
- `10-performance_optimization.md`: Offline-first patterns
- `26-demo_environment_setup.md`: Offline demo scenario

### Team Size

**Small (5-10)** (`team_size: "5-10"`):
- `31-project_role_adaptation.md`: Generalist roles, rotated responsibilities
- `13-multi_team_coordination.md`: Simplified, single team focus

**Large (26-50+)** (`team_size: "26-50|50+"`):
- `31-project_role_adaptation.md`: Specialized roles (iOS/Android/Backend)
- `13-multi_team_coordination.md`: Cross-team API contracts, RFC process

### State Management

**BLoC** (`state_management: "bloc"`):
- `03-bloc_implementation.md`: Full BLoC examples with events/states
- `05-testing_strategy.md`: Use `bloc_test` package

**Riverpod** (`state_management: "riverpod"`):
- `03-bloc_implementation.md`: Rename to `state_management.md`, use Riverpod
- `05-testing_strategy.md`: Use `ProviderContainer` for tests

## Quality Requirements

### Per File

- ✅ **Length**: 500-600 words (README: 300-400)
- ✅ **Format**: Strict PRP sections
- ✅ **Examples**: Real Flutter paths (e.g., `lib/features/login/presentation/login_page.dart`)
- ✅ **Junior-Friendly**: Explain "why" (e.g., "We verify `aud` to prevent token reuse")
- ✅ **Validation Gates**: Tests/docs/reviews required before merge
- ❌ **NO PLACEHOLDERS**: Replace all `[...]`, `{feature_name}`, `TODO`

### Critical Technical Corrections

1. **JWT**: NEVER show Flutter signing tokens. Only verification with public key.
2. **PCI-DSS**: NEVER store full credit card numbers. Use tokenization (Stripe, PayPal).
3. **HIPAA**: Always encrypt PHI at rest (AES-256-GCM) using `flutter_secure_storage`.
4. **State Management**: BLoC for complex state (events), Cubit for simple state (methods).

## Common Mistakes to Avoid

### ❌ Security Mistakes

1. **JWT Signing in Flutter**
   ```dart
   // ❌ WRONG - Private key exposed!
   final token = JWT({'user': 'john'}).sign(SecretKey('my-secret'));
   ```

2. **Storing Full Credit Cards**
   ```dart
   // ❌ WRONG - PCI-DSS violation!
   await db.insert('cards', {'number': '4242424242424242'});
   ```

3. **Logging Sensitive Data**
   ```dart
   // ❌ WRONG - PHI/PII in logs!
   print('Patient SSN: ${patient.ssn}');
   ```

### ✅ Correct Approaches

1. **JWT Verification Only**
   ```dart
   // ✅ CORRECT - Verify with public key
   final jwt = JWT.verify(token, RSAPublicKey(publicKey));
   ```

2. **Payment Tokenization**
   ```dart
   // ✅ CORRECT - Store token only
   final token = await stripe.createToken(cardNumber);
   await db.insert('cards', {'last4': last4, 'token': token});
   ```

3. **Safe Logging**
   ```dart
   // ✅ CORRECT - No sensitive data
   print('Patient record updated: ${patient.id}');
   ```

## Delivery Strategy

Generate in **3 phases** to ensure completeness and avoid token limits:

1. **Phase 1**: Core Architecture (10 files) - `claude gen-phase-1`
2. **Phase 2**: Quality & Security (12 files) - `claude gen-phase-2`
3. **Phase 3**: Advanced Systems (10 files + README) - `claude gen-phase-3`

Or generate all at once:
```bash
claude gen-prprompts
```

## Usage

### For Developers

**Starting a new feature:**
```bash
cat PRPROMPTS/01-feature_scaffold.md
```

**Before merge:**
```bash
cat PRPROMPTS/14-security_audit_checklist.md
```

**Search by topic:**
```bash
grep -i "jwt" PRPROMPTS/*.md
grep -i "hipaa" PRPROMPTS/*.md
```

### For Team Leads

**Onboarding:**
```bash
cat PRPROMPTS/07-onboarding_junior.md
```

**Sprint planning:**
```bash
cat PRPROMPTS/12-progress_tracking_workflow.md
```

**Role assignment:**
```bash
cat PRPROMPTS/31-project_role_adaptation.md
```

## References

- **Clean Architecture**: Uncle Bob's Clean Architecture book
- **Flutter BLoC**: https://bloclibrary.dev/
- **JWT RFC 7519**: https://tools.ietf.org/html/rfc7519
- **HIPAA Security Rule**: https://www.hhs.gov/hipaa/for-professionals/security/
- **PCI-DSS v4.0**: https://www.pcisecuritystandards.org/
- **GDPR Article 32**: https://gdpr-info.eu/art-32-gdpr/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Flutter Accessibility**: https://flutter.dev/docs/development/accessibility-and-localization/accessibility

## Support

- 📖 [Main README](../README.md)
- 📝 [PRD Guide](PRD-GUIDE.md)
- 🐛 [Report Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)

---

**Version**: 2.0.0
**Last Updated**: 2025-10-16
**Status**: Production Ready
