/**
 * SecurityValidator - Validates security best practices
 *
 * Checks:
 * - Hardcoded secrets/API keys
 * - JWT handling (verify only, never sign)
 * - PCI-DSS compliance (no card storage)
 * - HIPAA compliance (encryption, audit logging)
 * - HTTPS enforcement
 * - SQL injection risks
 * - XSS vulnerabilities
 */

const { ValidationResult } = require('../models/ValidationResult');
const { createModuleLogger } = require('../utils/logger');
const logger = createModuleLogger('SecurityValidator');
const fs = require('fs');
const path = require('path');

class SecurityValidator {
  constructor(config = {}) {
    this.config = {
      checkSecrets: true,
      checkCompliance: true,
      strictMode: true,
      ...config
    };

    // Patterns for common secrets
    this.secretPatterns = [
      { pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/gi, name: 'API Key' },
      { pattern: /(?:secret[_-]?key|secretkey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/gi, name: 'Secret Key' },
      { pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/gi, name: 'Password' },
      { pattern: /(?:token|auth[_-]?token)\s*[:=]\s*['"][a-zA-Z0-9-_]{20,}['"]/gi, name: 'Auth Token' },
      { pattern: /(?:private[_-]?key|privatekey)\s*[:=]\s*['"]-----BEGIN/gi, name: 'Private Key' },
      { pattern: /sk_live_[a-zA-Z0-9]{24,}/g, name: 'Stripe Secret Key' },
      { pattern: /sk_test_[a-zA-Z0-9]{24,}/g, name: 'Stripe Test Key' },
      { pattern: /AIza[0-9A-Za-z-_]{35}/g, name: 'Google API Key' },
      { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS Access Key' },
    ];
  }

  /**
   * Validate security for a file or project
   */
  validate(target, code = null) {
    const errors = [];
    const warnings = [];
    const info = [];

    try {
      if (code) {
        // Validate single file
        this._validateCode(target, code, errors, warnings, info);
      } else if (fs.existsSync(target)) {
        // Validate project
        this._validateProject(target, errors, warnings, info);
      } else {
        errors.push({
          message: `Target not found: ${target}`,
          severity: 'error'
        });
      }

      const score = this._calculateScore(errors, warnings);

      return new ValidationResult({
        isValid: errors.length === 0,
        score,
        errors,
        warnings,
        info,
        target,
        validator: 'SecurityValidator',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error(`SecurityValidator failed for ${target}:`, error);
      return new ValidationResult({
        isValid: false,
        score: 0,
        errors: [{ message: `Validation failed: ${error.message}`, severity: 'error' }],
        warnings: [],
        info: [],
        target,
        validator: 'SecurityValidator',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validate project security
   */
  _validateProject(projectPath, errors, warnings, info) {
    const libPath = path.join(projectPath, 'lib');
    if (fs.existsSync(libPath)) {
      this._validateDirectory(libPath, errors, warnings, info);
    }

    // Check for .env files in git
    const envFile = path.join(projectPath, '.env');
    if (fs.existsSync(envFile)) {
      warnings.push({
        message: '.env file exists - ensure it\'s in .gitignore',
        path: envFile,
        severity: 'warning',
        suggestion: 'Add .env to .gitignore to prevent committing secrets'
      });
    }

    // Check .gitignore
    const gitignorePath = path.join(projectPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      if (!content.includes('.env')) {
        warnings.push({
          message: '.env not in .gitignore',
          path: gitignorePath,
          severity: 'warning',
          suggestion: 'Add .env to .gitignore'
        });
      }
      if (!content.includes('*.key')) {
        warnings.push({
          message: '*.key not in .gitignore',
          path: gitignorePath,
          severity: 'warning',
          suggestion: 'Add *.key to .gitignore to prevent committing keys'
        });
      }
    }
  }

  /**
   * Recursively validate directory
   */
  _validateDirectory(dirPath, errors, warnings, info) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        this._validateDirectory(fullPath, errors, warnings, info);
      } else if (entry.name.endsWith('.dart')) {
        const code = fs.readFileSync(fullPath, 'utf-8');
        this._validateCode(fullPath, code, errors, warnings, info);
      }
    }
  }

  /**
   * Validate code security
   */
  _validateCode(filePath, code, errors, warnings, info) {
    // 1. Check for hardcoded secrets
    this._checkSecrets(filePath, code, errors, warnings);

    // 2. Check JWT handling
    this._checkJWTHandling(filePath, code, errors, warnings);

    // 3. Check PCI-DSS compliance
    this._checkPCIDSS(filePath, code, errors, warnings);

    // 4. Check HIPAA compliance
    this._checkHIPAA(filePath, code, errors, warnings);

    // 5. Check HTTPS enforcement
    this._checkHTTPS(filePath, code, warnings, info);

    // 6. Check SQL injection risks
    this._checkSQLInjection(filePath, code, warnings, info);

    // 7. Check XSS vulnerabilities
    this._checkXSS(filePath, code, warnings, info);

    // 8. Check sensitive data logging
    this._checkSensitiveLogging(filePath, code, warnings);

    // 9. Check cryptographic practices
    this._checkCryptography(filePath, code, warnings, info);
  }

  /**
   * Check for hardcoded secrets
   */
  _checkSecrets(filePath, code, errors, warnings) {
    if (!this.config.checkSecrets) return;

    for (const { pattern, name } of this.secretPatterns) {
      const matches = [...code.matchAll(pattern)];
      for (const match of matches) {
        const lineNum = code.substring(0, match.index).split('\n').length;

        // Skip if it's a placeholder or example
        const matchText = match[0].toLowerCase();
        if (matchText.includes('example') ||
            matchText.includes('placeholder') ||
            matchText.includes('your_') ||
            matchText.includes('xxx') ||
            matchText.includes('replace')) {
          continue;
        }

        errors.push({
          message: `Potential hardcoded ${name} detected`,
          path: filePath,
          line: lineNum,
          severity: 'error',
          suggestion: 'Use environment variables or secure storage for secrets',
          code: match[0].substring(0, 50) + '...'
        });
      }
    }

    // Check for API base URLs with secrets in query params
    const urlSecretsPattern = /https?:\/\/[^\s]+[?&](?:key|token|secret|password)=[^\s&'"]+/gi;
    const urlMatches = [...code.matchAll(urlSecretsPattern)];
    for (const match of urlMatches) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      errors.push({
        message: 'Secret in URL query parameter',
        path: filePath,
        line: lineNum,
        severity: 'error',
        suggestion: 'Pass secrets in headers, not URL parameters',
        code: match[0]
      });
    }
  }

  /**
   * Check JWT handling (should only verify, never sign)
   */
  _checkJWTHandling(filePath, code, errors, warnings) {
    // Check for JWT signing (bad in Flutter)
    const jwtSignPatterns = [
      /jwt\.sign\s*\(/gi,
      /JwtEncoder\s*\(/gi,
      /encode\s*\([^)]*privateKey/gi
    ];

    for (const pattern of jwtSignPatterns) {
      if (pattern.test(code)) {
        const lineNum = code.substring(0, pattern.lastIndex).split('\n').length;
        errors.push({
          message: 'JWT signing detected in Flutter code',
          path: filePath,
          line: lineNum,
          severity: 'error',
          suggestion: 'Flutter should only verify JWTs, never sign them. Signing should happen on the backend.'
        });
      }
    }

    // Check for proper JWT verification
    if (code.includes('jwt') || code.includes('JWT')) {
      if (!code.includes('verify') && !code.includes('decode')) {
        warnings.push({
          message: 'JWT handling without verification',
          path: filePath,
          severity: 'warning',
          suggestion: 'Always verify JWT signatures with public key'
        });
      }

      // Check for private key in JWT code
      if (code.includes('privateKey') && code.includes('jwt')) {
        errors.push({
          message: 'Private key used with JWT - security risk',
          path: filePath,
          severity: 'error',
          suggestion: 'Never store or use private keys in Flutter. Use public keys for verification only.'
        });
      }
    }
  }

  /**
   * Check PCI-DSS compliance (no card storage)
   */
  _checkPCIDSS(filePath, code, errors, warnings) {
    // Check for credit card number storage
    const cardPatterns = [
      { pattern: /(?:card[_-]?number|cardnumber|creditcard)\s*[:=]/gi, name: 'Card number variable' },
      { pattern: /(?:cvv|cvc|card[_-]?code)\s*[:=]/gi, name: 'CVV/CVC storage' },
      { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, name: 'Card number pattern' },
      { pattern: /(?:expiry|expiration)[_-]?(?:date|month|year)\s*[:=]/gi, name: 'Card expiry storage' }
    ];

    for (const { pattern, name } of cardPatterns) {
      if (pattern.test(code)) {
        const lineNum = code.substring(0, pattern.lastIndex).split('\n').length;

        // Check if it's tokenization (okay)
        if (code.includes('token') || code.includes('stripe') || code.includes('payment_method')) {
          continue;
        }

        errors.push({
          message: `PCI-DSS violation: ${name} detected`,
          path: filePath,
          line: lineNum,
          severity: 'error',
          suggestion: 'Never store full card numbers. Use tokenization (Stripe, PayPal, etc.)'
        });
      }
    }

    // Check for proper tokenization usage
    if ((code.includes('payment') || code.includes('card')) && !code.includes('token')) {
      warnings.push({
        message: 'Payment handling without tokenization',
        path: filePath,
        severity: 'warning',
        suggestion: 'Use payment tokenization services (Stripe, PayPal, Braintree)'
      });
    }
  }

  /**
   * Check HIPAA compliance (encryption, audit logging)
   */
  _checkHIPAA(filePath, code, errors, warnings) {
    // Check for PHI (Protected Health Information) handling
    const phiKeywords = ['patient', 'medical', 'health', 'diagnosis', 'prescription', 'treatment'];
    const hasPHI = phiKeywords.some(keyword => code.toLowerCase().includes(keyword));

    if (!hasPHI) return;

    // Check for encryption
    if (!code.includes('encrypt') && !code.includes('cipher')) {
      errors.push({
        message: 'HIPAA: PHI data without encryption',
        path: filePath,
        severity: 'error',
        suggestion: 'Encrypt PHI data at rest using AES-256-GCM or stronger'
      });
    }

    // Check for audit logging
    if (!code.includes('log') && !code.includes('audit')) {
      warnings.push({
        message: 'HIPAA: PHI access without audit logging',
        path: filePath,
        severity: 'warning',
        suggestion: 'Log all PHI access with timestamp, user, and action'
      });
    }

    // Check for secure storage
    if (code.includes('SharedPreferences') || code.includes('Hive')) {
      warnings.push({
        message: 'HIPAA: PHI may be stored in non-encrypted storage',
        path: filePath,
        severity: 'warning',
        suggestion: 'Use flutter_secure_storage or encrypted SQLite for PHI'
      });
    }
  }

  /**
   * Check HTTPS enforcement
   */
  _checkHTTPS(filePath, code, warnings, info) {
    // Check for HTTP URLs (should be HTTPS)
    const httpPattern = /http:\/\/(?!localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)[^\s'"]+/gi;
    const matches = [...code.matchAll(httpPattern)];

    for (const match of matches) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      warnings.push({
        message: 'HTTP URL detected (should use HTTPS)',
        path: filePath,
        line: lineNum,
        severity: 'warning',
        suggestion: 'Use HTTPS for all external connections',
        code: match[0]
      });
    }

    // Check for network security config
    if (code.includes('dio') || code.includes('http')) {
      if (!code.includes('https://')) {
        info.push({
          message: 'Ensure network security configuration enforces HTTPS',
          path: filePath,
          severity: 'info',
          suggestion: 'Configure network client to reject non-HTTPS connections'
        });
      }
    }
  }

  /**
   * Check SQL injection risks
   */
  _checkSQLInjection(filePath, code, warnings, info) {
    // Check for raw SQL queries
    const rawSQLPatterns = [
      /execute\s*\(\s*['"]SELECT.*\$/gi,
      /execute\s*\(\s*['"]INSERT.*\$/gi,
      /execute\s*\(\s*['"]UPDATE.*\$/gi,
      /execute\s*\(\s*['"]DELETE.*\$/gi,
      /rawQuery\s*\(\s*['"][^'"]*\$\{/gi
    ];

    for (const pattern of rawSQLPatterns) {
      if (pattern.test(code)) {
        const lineNum = code.substring(0, pattern.lastIndex).split('\n').length;
        warnings.push({
          message: 'Potential SQL injection risk - raw query with interpolation',
          path: filePath,
          line: lineNum,
          severity: 'warning',
          suggestion: 'Use parameterized queries: execute("SELECT * FROM users WHERE id = ?", [id])'
        });
      }
    }
  }

  /**
   * Check XSS vulnerabilities
   */
  _checkXSS(filePath, code, warnings, info) {
    // Check for unsafe HTML rendering
    const xssPatterns = [
      /Html\s*\(\s*data:\s*(?!sanitized)/gi,
      /HtmlWidget\s*\([^)]*\$\{/gi,
      /innerHTML\s*=/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(code)) {
        const lineNum = code.substring(0, pattern.lastIndex).split('\n').length;
        warnings.push({
          message: 'Potential XSS risk - unsafe HTML rendering',
          path: filePath,
          line: lineNum,
          severity: 'warning',
          suggestion: 'Sanitize HTML content before rendering or use safe widgets'
        });
      }
    }
  }

  /**
   * Check sensitive data logging
   */
  _checkSensitiveLogging(filePath, code, warnings) {
    const sensitiveKeywords = [
      'password', 'token', 'secret', 'key', 'credit', 'card', 'ssn',
      'social security', 'passport', 'license', 'account number'
    ];

    const logPatterns = [
      /print\s*\(/gi,
      /log\s*\(/gi,
      /logger\.\w+\s*\(/gi,
      /debugPrint\s*\(/gi
    ];

    for (const pattern of logPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const lineStart = match.index;
        const lineEnd = code.indexOf(';', lineStart);
        const logStatement = code.substring(lineStart, lineEnd > 0 ? lineEnd : lineStart + 100);

        for (const keyword of sensitiveKeywords) {
          if (logStatement.toLowerCase().includes(keyword)) {
            const lineNum = code.substring(0, match.index).split('\n').length;
            warnings.push({
              message: `Potential sensitive data in log: ${keyword}`,
              path: filePath,
              line: lineNum,
              severity: 'warning',
              suggestion: 'Avoid logging sensitive data. Redact or hash if necessary.'
            });
            break;
          }
        }
      }
    }
  }

  /**
   * Check cryptographic practices
   */
  _checkCryptography(filePath, code, warnings, info) {
    // Check for weak encryption
    const weakAlgorithms = ['md5', 'sha1', 'des', 'rc4'];

    for (const algo of weakAlgorithms) {
      const pattern = new RegExp(`\\b${algo}\\b`, 'gi');
      if (pattern.test(code)) {
        const lineNum = code.substring(0, pattern.lastIndex).split('\n').length;
        warnings.push({
          message: `Weak cryptographic algorithm: ${algo.toUpperCase()}`,
          path: filePath,
          line: lineNum,
          severity: 'warning',
          suggestion: 'Use SHA-256, SHA-512, or AES-256-GCM instead'
        });
      }
    }

    // Check for proper secure storage usage
    if (code.includes('flutter_secure_storage')) {
      info.push({
        message: 'Using flutter_secure_storage (good practice)',
        path: filePath,
        severity: 'info'
      });
    } else if (code.includes('token') || code.includes('secret')) {
      warnings.push({
        message: 'Secrets handling without secure storage',
        path: filePath,
        severity: 'warning',
        suggestion: 'Use flutter_secure_storage for sensitive data'
      });
    }

    // Check for random number generation
    if (code.includes('Random()') && !code.includes('Random.secure()')) {
      warnings.push({
        message: 'Non-cryptographic random number generator',
        path: filePath,
        severity: 'warning',
        suggestion: 'Use Random.secure() for cryptographic operations'
      });
    }
  }

  /**
   * Calculate security score
   */
  _calculateScore(errors, warnings) {
    const criticalPenalty = errors.filter(e =>
      e.message.includes('PCI-DSS') ||
      e.message.includes('HIPAA') ||
      e.message.includes('secret')
    ).length * 25;

    const errorPenalty = (errors.length - errors.filter(e =>
      e.message.includes('PCI-DSS') || e.message.includes('HIPAA')
    ).length) * 10;

    const warningPenalty = warnings.length * 3;

    const totalPenalty = criticalPenalty + errorPenalty + warningPenalty;

    return Math.max(0, Math.min(100, 100 - totalPenalty));
  }
}

module.exports = SecurityValidator;
