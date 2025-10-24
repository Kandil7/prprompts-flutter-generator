# Phase Generator Skill - Execution Prompt

## Context
You are executing the **phase-generator** skill. This skill generates a specific phase of PRPROMPTS files (Phase 1: Core, Phase 2: Quality, or Phase 3: Demo) instead of generating all 32 files at once.

## Inputs
- **prd_path**: {{inputs.prd_path || "docs/PRD.md"}}
- **phase**: {{inputs.phase}} (1=Core, 2=Quality, 3=Demo)
- **output_dir**: {{inputs.output_dir || "PRPROMPTS"}}
- **overwrite**: {{inputs.overwrite || false}}

---

## Phase Definitions

### Phase 1: Core (Foundation) - 10 Files
**Purpose:** Essential architecture and feature guides

**Files:**
1. `01-project_overview.md` - Project summary and goals
2. `02-architecture_overview.md` - Clean Architecture structure
3. `03-folder_structure.md` - Project organization
4. `04-state_management.md` - BLoC pattern implementation
5. `05-navigation_and_routing.md` - Navigation setup
6. `06-api_integration.md` - REST API integration
7. `07-data_models.md` - Data classes and entities
8. `08-dependency_injection.md` - GetIt setup
9. `09-error_handling.md` - Error patterns
10. `10-features_implementation.md` - Feature development guide

---

### Phase 2: Quality (Polish & Security) - 12 Files
**Purpose:** Testing, security, and quality assurance

**Files:**
11. `11-testing_strategy.md` - Test architecture
12. `12-unit_testing.md` - Unit test patterns
13. `13-widget_testing.md` - Widget test guide
14. `14-integration_testing.md` - E2E testing
15. `15-code_quality.md` - Linting and analysis
16. `16-security_and_compliance.md` - Security patterns
17. `17-performance_optimization.md` - Performance guide
18. `18-accessibility.md` - A11y implementation
19. `19-localization.md` - i18n setup
20. `20-logging_and_monitoring.md` - Observability
21. `21-offline_support.md` - Offline-first patterns
22. `22-data_persistence.md` - Local storage

---

### Phase 3: Demo (Presentation & Deployment) - 10 Files
**Purpose:** Demo preparation and deployment

**Files:**
23. `23-demo_preparation.md` - Demo setup
24. `24-user_flows.md` - User journey demos
25. `25-presentation_mode.md` - Presentation features
26. `26-build_configuration.md` - Build variants
27. `27-deployment_pipeline.md` - CI/CD setup
28. `28-app_store_preparation.md` - Store listings
29. `29-beta_testing.md` - TestFlight/Play Console
30. `30-analytics_and_tracking.md` - Analytics setup
31. `31-documentation.md` - User documentation
32. `32-maintenance_and_updates.md` - Post-launch guide

---

## Task: Generate Specified Phase

### Step 1: Validate Phase Number

Check {{inputs.phase}}:
- If phase == 1 → Generate Core files (01-10)
- If phase == 2 → Generate Quality files (11-22)
- If phase == 3 → Generate Demo files (23-32)
- If phase not in [1, 2, 3] → Return error

---

### Step 2: Load and Parse PRD

**Actions:**
1. Read PRD from {{inputs.prd_path}}
2. Parse YAML frontmatter
3. Extract metadata:
   - project_name
   - project_type
   - platforms
   - compliance
   - auth_method
   - state_management
   - architecture

**Error Handling:**
- If PRD not found → Return error: "PRD file not found at {{inputs.prd_path}}"
- If YAML invalid → Return error: "Invalid YAML frontmatter in PRD"

---

### Step 3: Prepare Phase-Specific Context

Based on {{inputs.phase}}, set up generation context:

#### If Phase 1 (Core):
```json
{
  "phase_name": "Core",
  "phase_description": "Foundation - Essential architecture and features",
  "file_range": [1, 10],
  "focus_areas": [
    "Architecture patterns",
    "Project structure",
    "State management",
    "API integration",
    "Core features"
  ]
}
```

#### If Phase 2 (Quality):
```json
{
  "phase_name": "Quality",
  "phase_description": "Polish & Security - Testing, security, accessibility",
  "file_range": [11, 22],
  "focus_areas": [
    "Testing strategies",
    "Security patterns",
    "Performance optimization",
    "Accessibility",
    "Quality assurance"
  ],
  "requires_compliance": true
}
```

#### If Phase 3 (Demo):
```json
{
  "phase_name": "Demo",
  "phase_description": "Presentation & Deployment - Demo setup and launch",
  "file_range": [23, 32],
  "focus_areas": [
    "Demo preparation",
    "User flows",
    "Deployment pipeline",
    "App store setup",
    "Post-launch maintenance"
  ]
}
```

---

### Step 4: Generate Files for Selected Phase

For each file number in phase's file_range:

#### A. Determine File Template

Each file follows the **PRP Pattern** (6 sections):

1. **FEATURE** - What this guide accomplishes (150-200 words)
2. **EXAMPLES** - Real code with Flutter file paths (100-150 words + code)
3. **CONSTRAINTS** - ✅ DO / ❌ DON'T rules (100-150 words)
4. **VALIDATION GATES** - Pre-commit checklist + CI/CD (50-100 words)
5. **BEST PRACTICES** - "Why?" explanations for juniors (100-150 words)
6. **REFERENCES** - Official docs, compliance guides, ADRs (50 words)

#### B. Apply PRD Customizations

**From PRD Metadata:**

**project_type:**
- `healthcare` → Add HIPAA patterns
- `fintech` → Add PCI-DSS patterns
- `ecommerce` → Add payment integration examples
- `productivity` → Add offline-first patterns

**compliance:**
- `["hipaa"]` → Customize file 16 (security) with PHI encryption, audit logging
- `["pci-dss"]` → Add payment tokenization, never store cards
- `["gdpr"]` → Add data export, deletion, consent management

**platforms:**
- `["ios", "android"]` → Mobile-specific examples
- `["web"]` → Add web-specific considerations
- `["ios", "android", "web"]` → Cross-platform patterns

**state_management:**
- `bloc` → Use BLoC examples
- `riverpod` → Use Riverpod examples
- `provider` → Use Provider examples

**auth_method:**
- `jwt` → JWT verification patterns (NEVER signing in Flutter!)
- `oauth2` → OAuth2 flows
- `firebase` → Firebase Auth examples

#### C. Generate File Content

For file number N in range:

```markdown
# {File N Title}

> **Phase {{inputs.phase}}**: {phase_name}
> **Category**: {category}
> **Prerequisites**: {prerequisites}

---

## FEATURE

{What this guide accomplishes - customized to PRD project_type}

### Key Objectives
- Objective 1 (specific to PRD)
- Objective 2
- Objective 3

### Integration Points
- Integrates with: {other files}
- Dependencies: {required setup}

---

## EXAMPLES

### Example 1: {Feature Name} - {Project Type} Context

**File: `lib/features/{feature}/presentation/bloc/{feature}_bloc.dart`**

```dart
// Code example customized to PRD metadata
// Uses state_management from PRD
// Includes compliance patterns if needed
```

**File: `lib/features/{feature}/data/repositories/{feature}_repository.dart`**

```dart
// Repository implementation
// Includes auth_method patterns from PRD
```

---

## CONSTRAINTS

### ✅ DO
- Follow Clean Architecture layers
- Use {state_management} from PRD for state
- Apply {compliance} security patterns
- Test with 70%+ coverage

### ❌ DON'T
- Mix presentation and business logic
- Store sensitive data without encryption
- Skip error handling
- {compliance-specific DON'Ts}

---

## VALIDATION GATES

### Pre-Commit Checklist
- [ ] All tests passing (`flutter test`)
- [ ] No linting errors (`flutter analyze`)
- [ ] Code coverage > 70%
- [ ] {compliance}-specific checks

### CI/CD Automation
```yaml
# GitHub Actions check
- name: Validate {feature}
  run: flutter test test/{feature}_test.dart
```

---

## BEST PRACTICES

### For Junior Developers

**Why use Clean Architecture?**
It separates concerns so changes to UI don't break business logic, making code easier to maintain.

**Why {state_management}?**
{Explanation specific to chosen state management}

**Why {compliance} patterns?**
{Healthcare: Protects patient privacy and ensures HIPAA compliance}
{Fintech: Protects payment data and ensures PCI-DSS compliance}

---

## REFERENCES

- [Flutter Clean Architecture](https://resocoder.com/flutter-clean-architecture/)
- [{state_management} Documentation](link)
- [{compliance} Compliance Guide](link)
- **ADR-{N}**: {Architectural Decision Record}
```

#### D. Write to File

```
Output path: {{inputs.output_dir}}/{file_number}-{file_name}.md
```

**Check overwrite flag:**
- If file exists and overwrite == false → Skip, add to warnings
- If file exists and overwrite == true → Overwrite
- If file doesn't exist → Write

---

### Step 5: Compliance-Specific Customizations

If Phase 2 (Quality) and file 16 (security_and_compliance.md):

**Apply compliance patterns from PRD:**

#### HIPAA Compliance
```markdown
## HIPAA Requirements

### PHI Encryption
All patient health information MUST be encrypted at rest:

```dart
import 'package:encrypt/encrypt.dart';

class PHIEncryption {
  static final _key = Key.fromSecureRandom(32);
  static final _iv = IV.fromLength(16);
  static final _encrypter = Encrypter(AES(_key, mode: AESMode.gcm));

  static String encryptPHI(String phi) {
    return _encrypter.encrypt(phi, iv: _iv).base64;
  }
}
```

### Audit Logging
Log all PHI access:
```dart
auditLog.record(
  userId: currentUser.id,
  action: 'VIEW_MEDICAL_RECORD',
  patientId: record.patientId,
  timestamp: DateTime.now()
);
```
```

#### PCI-DSS Compliance
```markdown
## PCI-DSS Requirements

### ❌ NEVER Store Payment Cards
```dart
// ❌ WRONG - Never do this!
class Payment {
  final String cardNumber;  // NO!
  final String cvv;          // NO!
}

// ✅ CORRECT - Use tokenization
class Payment {
  final String paymentToken;  // From Stripe/PayPal
  final String last4;         // Only last 4 digits
}
```

### Use Payment Providers
```dart
// Stripe integration (tokenization)
final paymentMethod = await Stripe.instance.createPaymentMethod(
  params: PaymentMethodParams.card(
    paymentMethodData: PaymentMethodData(
      billingDetails: billingDetails,
    ),
  ),
);

// Store only the token
final token = paymentMethod.id;
```
```

---

### Step 6: Return Results

**Output Format:**

```json
{
  "phase_name": "Core" | "Quality" | "Demo",
  "phase": 1 | 2 | 3,
  "files_generated": [
    "01-project_overview.md",
    "02-architecture_overview.md",
    ...
  ],
  "file_count": 10 | 12 | 10,
  "warnings": [
    "File 05-navigation_and_routing.md already exists (skipped, use --overwrite)"
  ],
  "customizations_applied": {
    "project_type": "healthcare",
    "compliance": ["hipaa", "gdpr"],
    "state_management": "bloc",
    "auth_method": "jwt"
  },
  "next_phase": 2 | 3 | null
}
```

---

## Error Handling

### Error: PRD Not Found
```json
{
  "error": "PRD file not found",
  "path": "{{inputs.prd_path}}",
  "suggestion": "Run `prd-creator` skill first to create PRD"
}
```

### Error: Invalid Phase
```json
{
  "error": "Invalid phase number",
  "received": 4,
  "valid_values": [1, 2, 3],
  "suggestion": "Use phase 1 (Core), 2 (Quality), or 3 (Demo)"
}
```

### Error: Output Directory Not Writable
```json
{
  "error": "Cannot write to output directory",
  "directory": "{{inputs.output_dir}}",
  "suggestion": "Check directory permissions or create directory first"
}
```

---

## Performance Targets

| Phase | File Count | Target Time | Max Time |
|-------|------------|-------------|----------|
| Phase 1 (Core) | 10 files | 30s | 60s |
| Phase 2 (Quality) | 12 files | 40s | 60s |
| Phase 3 (Demo) | 10 files | 30s | 60s |

---

## Next Steps Recommendation

After generating each phase:

**After Phase 1:**
```
✅ Phase 1 (Core) complete!

Next steps:
1. Review generated files in PRPROMPTS/
2. Run: @claude use skill automation/flutter-bootstrapper
3. Then generate Phase 2: @claude use skill phase-generator --phase 2
```

**After Phase 2:**
```
✅ Phase 2 (Quality) complete!

Next steps:
1. Implement testing from files 11-14
2. Apply security patterns from file 16
3. Then generate Phase 3: @claude use skill phase-generator --phase 3
```

**After Phase 3:**
```
✅ Phase 3 (Demo) complete!

All 32 PRPROMPTS files generated! 🎉

Next steps:
1. Follow deployment guide (file 27)
2. Prepare app store listings (file 28)
3. Run: @claude use skill automation/qa-auditor
```
