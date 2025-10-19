# Security Policy

## Supported Versions

We actively support the following versions of PRPROMPTS with security updates:

| Version | Supported          | Status            |
| ------- | ------------------ | ----------------- |
| 4.0.x   | :white_check_mark: | Current Release   |
| 3.1.x   | :x:                | End of Life       |
| < 3.1   | :x:                | End of Life       |

**Note:** We recommend always using the latest version (4.0.x) for the best security, performance, and features.

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in PRPROMPTS, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please use one of these methods:

#### 1. GitHub Security Advisories (Preferred)

1. Go to the [Security tab](https://github.com/Kandil7/prprompts-flutter-generator/security)
2. Click "Report a vulnerability"
3. Fill out the form with details

#### 2. Private Email

Email security reports to: **[Maintainer email - to be added]**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### What to Expect

**Response Time:**
- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity (see below)

**Severity Levels:**

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Remote code execution, arbitrary file access, credential theft | 24-48 hours |
| **High** | Authentication bypass, privilege escalation, data exposure | 3-7 days |
| **Medium** | Limited information disclosure, DoS | 14-30 days |
| **Low** | Minor issues with limited impact | 30-60 days |

**Process:**

1. **Acknowledgment**: We'll confirm receipt within 48 hours
2. **Investigation**: We'll investigate and validate the vulnerability
3. **Fix Development**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate public disclosure with you
5. **Release**: We'll release a security update
6. **Credit**: We'll credit you (if desired) in the release notes

---

## Security Best Practices

### For PRPROMPTS Users

When using PRPROMPTS, follow these security best practices:

#### 1. Keep Updated

```bash
# Check for updates
npm outdated -g prprompts-flutter-generator

# Update to latest version
npm update -g prprompts-flutter-generator
```

#### 2. Verify Installation

```bash
# Check installed version
prprompts --version

# Run health check
prprompts doctor
```

#### 3. Review Generated Code

Always review AI-generated code before deploying:
- Check for hardcoded secrets
- Verify security implementations
- Test authentication/authorization
- Validate input handling
- Review encryption usage

#### 4. Protect PRD Files

PRD files may contain sensitive information:
- Don't commit PRDs with sensitive data to public repos
- Use `.gitignore` to exclude `docs/PRD.md` if needed
- Sanitize PRDs before sharing

```bash
# Add to .gitignore
echo "docs/PRD.md" >> .gitignore
```

#### 5. Extension Security

When installing AI extensions:
- Only install from official sources
- Verify checksums if provided
- Review extension permissions
- Keep extensions updated

---

## Security Features

PRPROMPTS includes several security-focused features:

### 1. Security-First Architecture

All generated code follows security best practices:
- **Input Validation**: All user inputs validated
- **Output Encoding**: XSS prevention
- **Authentication**: Secure auth patterns
- **Authorization**: Role-based access control
- **Encryption**: Data encryption at rest and in transit

### 2. Compliance Support

PRPROMPTS supports multiple compliance standards:
- **HIPAA**: Healthcare data protection
- **PCI-DSS**: Payment card security
- **FERPA**: Education records privacy
- **GDPR**: EU data protection
- **SOC2**: Enterprise security

### 3. Audit Logging

Generated code includes audit logging for:
- User actions
- Data access
- Authentication events
- Configuration changes

Example:
```dart
await auditLogger.log(
  action: AuditAction.patientView,
  userId: currentUser.id,
  resourceId: patientId,
  resourceType: 'Patient',
  details: 'Patient record accessed',
);
```

### 4. Encryption Patterns

Secure encryption implementations:
```dart
// PHI encryption (HIPAA)
@JsonKey(fromJson: _decryptString, toJson: _encryptString)
required String ssn,

// AES-256-GCM encryption
final encrypted = await EncryptionService.encrypt(
  plaintext: sensitiveData,
  keyId: 'patient-data-key',
);
```

### 5. Secure Storage

```dart
// Secure local storage
await secureStorage.write(
  key: 'auth_token',
  value: token,
);

// Never use plain SharedPreferences for sensitive data
// ❌ await prefs.setString('token', token);
```


### 6. API Key Management

PRPROMPTS integrates with AI provider CLIs (Claude Code, Qwen Code, Gemini CLI) that require API keys for authentication.

#### Getting API Keys

**Claude Code (Anthropic):**
- Console: https://console.anthropic.com/settings/keys
- Documentation: https://docs.anthropic.com/claude/docs
- Authentication: Uses `~/.config/claude/config.json` or `ANTHROPIC_API_KEY` environment variable

**Qwen Code (Alibaba Cloud):**
- Console: https://dashscope.aliyun.com/
- Documentation: https://help.aliyun.com/zh/dashscope/
- Authentication: Uses `~/.config/qwen/config.json` or `DASHSCOPE_API_KEY` environment variable

**Gemini CLI (Google):**
- Console: https://aistudio.google.com/app/apikey
- Documentation: https://ai.google.dev/gemini-api/docs
- Authentication: Uses `~/.config/gemini/config.json` or `GOOGLE_API_KEY` environment variable

#### Secure API Key Storage

**✅ Best Practices:**

1. **Use Environment Variables** (recommended for development):
   ```bash
   # Copy the template
   cp .env.example .env

   # Add your keys
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   GOOGLE_API_KEY=AIzaSyxxxxx
   DASHSCOPE_API_KEY=sk-xxxxx
   ```

2. **Use CLI Authentication** (alternative):
   ```bash
   # Authenticate via CLI (stores in ~/.config/{ai}/config.json)
   claude auth login
   qwen auth login
   gemini auth login
   ```

3. **Use Secret Management Systems** (production):
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - HashiCorp Vault
   - 1Password CLI / Bitwarden CLI

4. **Separate Keys by Environment**:
   ```bash
   # Development
   ANTHROPIC_API_KEY=sk-ant-api03-dev-xxxxx

   # Production (use secret manager, not .env)
   ANTHROPIC_API_KEY=sk-ant-api03-prod-xxxxx
   ```

**❌ Never Do This:**

1. **Don't commit API keys to version control**:
   ```bash
   # ❌ BAD - hardcoded in code
   const apiKey = "sk-ant-api03-xxxxx";

   # ❌ BAD - committed .env file
   git add .env

   # ✅ GOOD - use .env.example template
   git add .env.example
   ```

2. **Don't expose keys in logs or errors**:
   ```javascript
   // ❌ BAD
   console.log(`Using API key: ${process.env.ANTHROPIC_API_KEY}`);

   // ✅ GOOD
   console.log(`API key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
   ```

3. **Don't share keys in issues, PRs, or chat**:
   - If you need to share logs, redact API keys first
   - Use `[REDACTED]` or `sk-ant-***` placeholders

4. **Don't use production keys in development**:
   - Create separate keys for dev, staging, and production
   - Use minimal permissions for each environment

#### Key Rotation

**Recommended Schedule:**
- **Development keys**: Rotate every 90 days
- **Production keys**: Rotate every 30-60 days
- **Compromised keys**: Revoke immediately

**Rotation Process:**
```bash
# 1. Generate new key in provider console
# 2. Update environment variables
# 3. Test with new key
# 4. Revoke old key
# 5. Update documentation
```

#### Incident Response: Leaked API Key

If you accidentally commit an API key to version control:

**🚨 Immediate Actions (within 5 minutes):**

1. **Revoke the key immediately** in the provider console:
   - Claude: https://console.anthropic.com/settings/keys
   - Gemini: https://aistudio.google.com/app/apikey
   - Qwen: https://dashscope.aliyun.com/

2. **Generate a new key** and update your `.env` file

3. **Test** that the new key works:
   ```bash
   prprompts doctor
   claude --version
   ```

**🔧 Cleanup Actions (within 1 hour):**

4. **Remove the key from git history**:
   ```bash
   # Using git-filter-repo (recommended)
   git filter-repo --invert-paths --path .env

   # Or using BFG Repo-Cleaner
   bfg --replace-text passwords.txt

   # Force push (if working alone)
   git push origin --force --all
   ```

5. **Notify your team** if the repository is shared

6. **Check provider logs** for unauthorized usage

7. **Update incident log** with details for future reference

**📝 Prevention:**

- Enable pre-commit hooks to detect secrets:
  ```bash
  npm install --save-dev @commitlint/cli
  # Add to .git/hooks/pre-commit
  ```
- Use tools like `git-secrets`, `truffleHog`, or `detect-secrets`
- Review `.gitignore` to ensure `.env` is excluded (already configured)

#### Monitoring API Usage

**Detect Anomalies:**
- Monitor API usage in provider consoles
- Set up billing alerts for unexpected usage spikes
- Review access logs regularly

**Signs of Compromised Keys:**
- Unexpected API calls from unknown IPs
- Usage spikes at unusual times
- Quota exceeded errors
- Billing anomalies

**If you suspect compromise:**
1. Revoke the key immediately
2. Generate new key
3. Review provider access logs
4. Check git history for leaks
5. Audit all systems using that key

---

## Known Security Considerations

### 1. AI-Generated Code

PRPROMPTS uses AI to generate code. While we strive for security:
- ⚠️ **Always review** generated code before production use
- ⚠️ **Test thoroughly** especially authentication and data handling
- ⚠️ **Verify compliance** implementations meet your requirements

### 2. Template Injection

PRD files are processed as templates:
- Don't process untrusted PRD files
- Sanitize any user-provided PRD content
- Use official examples as templates

### 3. Extension Permissions

AI extensions have access to your codebase:
- Only install official extensions
- Review extension code if concerned
- Keep extensions updated

### 4. Dependency Security

PRPROMPTS has minimal dependencies, but:
- We monitor dependencies for vulnerabilities
- We update dependencies regularly
- Run `npm audit` to check your installation

```bash
npm audit
```

---

## Security Audits

### Internal Audits

We conduct regular internal security reviews:
- Code reviews for all changes
- Dependency vulnerability scanning
- Template security validation
- Extension permission audits

### External Audits

We welcome external security audits:
- Coordinated disclosure preferred
- Bug bounty consideration for critical findings
- Public acknowledgment for responsible disclosure

---

## Vulnerability Disclosure Policy

When we release security updates:

### 1. Security Advisory

We publish a GitHub Security Advisory with:
- Vulnerability description
- Affected versions
- Impact assessment
- Mitigation steps
- Fixed version

### 2. Release Notes

Security fixes are documented in:
- CHANGELOG.md
- GitHub Release notes
- npm package description

### 3. User Notification

For critical vulnerabilities, we:
- Post to GitHub Discussions
- Update README.md with security notice
- Consider direct notification for known users

### 4. Public Disclosure

We follow responsible disclosure:
- Private coordination with reporter
- Fix development and testing
- Public disclosure after fix release
- Credit to reporter (if desired)

**Disclosure Timeline:**
- Day 0: Vulnerability reported
- Day 1-2: Acknowledged and validated
- Day 3-30: Fix developed (varies by severity)
- Day 30+: Public disclosure (or earlier if fix ready)

---

## Security Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

<!-- This section will be updated as researchers contribute -->

*No vulnerabilities reported yet. We appreciate responsible disclosure!*

---

## Security Compliance for Generated Code

### HIPAA Compliance

For healthcare applications:
```bash
# Create HIPAA-compliant PRD
prprompts create
# Select: Compliance → HIPAA

# Generated features:
# - PHI encryption (AES-256)
# - Audit logging
# - Role-based access
# - Secure messaging
# - BAA-ready architecture
```

### PCI-DSS Compliance

For payment applications:
```bash
# Create PCI-DSS-compliant PRD
prprompts create
# Select: Compliance → PCI-DSS

# Generated features:
# - Payment tokenization (Stripe)
# - No card storage
# - PCI SAQ A compliance
# - 3D Secure support
# - Encrypted transmission
```

### FERPA Compliance

For education applications:
```bash
# Create FERPA-compliant PRD
prprompts create
# Select: Compliance → FERPA

# Generated features:
# - Student record protection
# - Parent consent (COPPA)
# - Access logging
# - Data export/deletion
# - Role-based permissions
```

---

## Contact

**Security Team:** [Email to be added]

**GitHub Security:** [Security Advisories](https://github.com/Kandil7/prprompts-flutter-generator/security)

**General Issues:** [GitHub Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues) (for non-security issues only)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [PCI-DSS Standards](https://www.pcisecuritystandards.org/)
- [FERPA Privacy](https://studentprivacy.ed.gov/)

---

**Last Updated:** 2025-01-18
**Security Policy Version:** 1.0
**PRPROMPTS Version:** 4.0.0
