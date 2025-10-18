---
name: gen-prprompts
description: "[prprompts] Generate all 32 PRPROMPTS files from PRD"
category: PRPROMPTS Generation
version: 4.0.0
tags: [prprompts, generation, automation, flutter, clean-architecture]
---

# /gen-prprompts - Generate All 32 PRPROMPTS Files

Generate all 32 security-audited development guide files from your PRD. Each file is a 500-600 word structured prompt with Flutter code examples, best practices, and compliance patterns.

## Usage

```bash
/gen-prprompts
```

## What It Does

Reads `PRD.md` or `docs/PRD.md` and generates 32 PRPROMPTS files in 3 phases:

### Phase 1: Core Architecture (Files 01-10)
- 01-feature_scaffold.md - Feature structure
- 02-state_management.md - BLoC patterns
- 03-data_layer.md - Repositories & data sources
- 04-models.md - Entity & DTO classes
- 05-api_client.md - HTTP client configuration
- 06-navigation.md - Routing & deep links
- 07-dependency_injection.md - GetIt/Injectable
- 08-error_handling.md - Error boundaries
- 09-authentication.md - JWT/OAuth2 flows
- 10-local_storage.md - Hive/SQLite patterns

### Phase 2: Quality & Security (Files 11-22)
- 11-testing_strategy.md - Test structure
- 12-widget_testing.md - Widget test patterns
- 13-integration_testing.md - E2E test flows
- 14-security_patterns.md - Encryption & validation
- 15-compliance_checklist.md - Regulatory requirements
- 16-logging_monitoring.md - Analytics & error tracking
- 17-performance.md - Optimization techniques
- 18-accessibility.md - A11y compliance
- 19-offline_sync.md - Offline-first patterns
- 20-real_time.md - WebSocket/SSE
- 21-ci_cd.md - GitHub Actions/Codemagic
- 22-code_review.md - PR review checklist

### Phase 3: Demo & Learning (Files 23-32)
- 23-demo_mode.md - Demo environment setup
- 24-synthetic_data.md - Realistic test data
- 25-api_mocking.md - Mock server patterns
- 26-theme_config.md - Material 3 theming
- 27-l10n.md - Internationalization
- 28-responsive_design.md - Adaptive layouts
- 29-animations.md - Hero & implicit animations
- 30-onboarding.md - Welcome flows
- 31-subagent_guide.md - AI automation patterns
- 32-junior_dev_guide.md - Mentorship content

## Example Output

```
Generating PRPROMPTS from docs/PRD.md...

✓ Phase 1: Core Architecture (10 files) - 42 seconds
✓ Phase 2: Quality & Security (12 files) - 51 seconds
✓ Phase 3: Demo & Learning (10 files) - 38 seconds
✓ README.md with implementation order

📦 Generated 32 files in PRPROMPTS/ (18,427 words total)

Customizations Applied:
✓ HIPAA compliance patterns (PHI encryption, audit logs)
✓ JWT RS256 authentication flows
✓ Offline-first architecture (Hive + drift)
✓ Real-time updates (WebSocket + BLoC)
✓ Large team patterns (8 mobile developers, 2 junior)
✓ Weekly demo mode (synthetic HIPAA data)

Next: /bootstrap-from-prprompts to auto-implement (2 min)
```

## Output Structure

```
PRPROMPTS/
├── README.md (implementation order & quick reference)
├── 01-feature_scaffold.md
├── 02-state_management.md
├── ...
└── 32-junior_dev_guide.md
```

Each file contains:
- **FEATURE**: Clear description with Flutter context
- **EXAMPLES**: 3-5 code examples (200-300 lines total)
- **CONSTRAINTS**: Security, performance, compliance rules
- **VALIDATION GATES**: Automated checks before proceeding
- **BEST PRACTICES**: Industry standards & patterns
- **REFERENCES**: Official docs & resources

## Customization

PRPROMPTS automatically customize based on PRD frontmatter:

| PRD Setting | PRPROMPTS Customization |
|-------------|------------------------|
| `compliance: [hipaa]` | PHI encryption, audit logging, access controls |
| `auth_method: jwt` | RS256 tokens, refresh flows, secure storage |
| `offline_support: true` | Offline-first patterns, sync strategies |
| `real_time: true` | WebSocket reconnection, optimistic updates |
| `team_composition.mobile.junior: 2` | Extra explanations, step-by-step guides |
| `demo_frequency: weekly` | Demo mode, synthetic data, basic auth |

## Next Steps

After generating PRPROMPTS:

1. **Review:** `cat PRPROMPTS/README.md`
2. **Bootstrap:** `/bootstrap-from-prprompts` (2 min - sets up architecture)
3. **Auto-implement:** `/full-cycle` (1-2 hours - implements 1-10 features)
4. **QA Check:** `/qa-check` (generates compliance report)

## Phase-by-Phase Generation

You can also generate phases individually:

- `/gen-phase-1` - Core Architecture only (10 files)
- `/gen-phase-2` - Quality & Security only (12 files)
- `/gen-phase-3` - Demo & Learning only (10 files)
- `/gen-file <name>` - Single file (e.g., `/gen-file authentication`)

## Requirements

- **PRD file:** `PRD.md` or `docs/PRD.md` must exist
- **Gemini CLI:** v1.0.0+
- **Extension:** PRPROMPTS v4.0.0+

## Related Commands

- `/create-prd` - Create PRD first
- `/analyze-prd` - Validate PRD structure
- `/bootstrap-from-prprompts` - Auto-setup from PRPROMPTS
- `/implement-next` - Auto-implement next feature
- `/full-cycle` - Complete automation loop

---

**Powered by PRPROMPTS v4.0** | **40-60x Faster Development** | [Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)
