#!/usr/bin/env node
/**
 * PRPROMPTS Automation Validator
 * Validates code quality, security, and compliance
 * Version: 4.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomationValidator {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.validationResults = {
      timestamp: new Date().toISOString(),
      passed: true,
      categories: {
        structure: { passed: true, issues: [] },
        security: { passed: true, issues: [] },
        patterns: { passed: true, issues: [] },
        testing: { passed: true, issues: [] },
        compliance: { passed: true, issues: [] }
      },
      score: 100,
      recommendations: []
    };
  }

  // Main validation entry point
  async validate() {
    console.log('\n🔍 Starting PRPROMPTS Validation...\n');

    await this.validateStructure();
    await this.validateSecurity();
    await this.validatePatterns();
    await this.validateTesting();
    await this.validateCompliance();

    this.calculateScore();
    this.generateRecommendations();

    return this.validationResults;
  }

  // Validate Clean Architecture structure
  async validateStructure() {
    console.log('📁 Validating project structure...');

    const requiredDirs = [
      'lib/core/constants',
      'lib/core/errors',
      'lib/core/network',
      'lib/core/security',
      'lib/features',
      'lib/shared/theme'
    ];

    const missingDirs = [];
    for (const dir of requiredDirs) {
      const fullPath = path.join(this.projectPath, dir);
      if (!fs.existsSync(fullPath)) {
        missingDirs.push(dir);
      }
    }

    if (missingDirs.length > 0) {
      this.validationResults.categories.structure.passed = false;
      this.validationResults.categories.structure.issues.push({
        severity: 'error',
        message: `Missing required directories: ${missingDirs.join(', ')}`,
        fix: 'Run /bootstrap-from-prprompts to create structure'
      });
    }

    // Check for proper layering
    const violations = await this.checkLayerViolations();
    if (violations.length > 0) {
      this.validationResults.categories.structure.passed = false;
      violations.forEach(v => {
        this.validationResults.categories.structure.issues.push({
          severity: 'warning',
          message: `Layer violation: ${v}`,
          fix: 'Refactor to follow Clean Architecture principles'
        });
      });
    }

    console.log(this.validationResults.categories.structure.passed ? '  ✅ Structure valid' : '  ❌ Structure issues found');
  }

  // Check for Clean Architecture layer violations
  async checkLayerViolations() {
    const violations = [];

    try {
      // Check if domain layer imports from data or presentation
      const domainFiles = this.findFiles('lib/features/*/domain', '*.dart');
      for (const file of domainFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('import') && (content.includes('/data/') || content.includes('/presentation/'))) {
          violations.push(`Domain layer violation in ${path.relative(this.projectPath, file)}`);
        }
      }

      // Check if data layer imports from presentation
      const dataFiles = this.findFiles('lib/features/*/data', '*.dart');
      for (const file of dataFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('import') && content.includes('/presentation/')) {
          violations.push(`Data layer violation in ${path.relative(this.projectPath, file)}`);
        }
      }
    } catch (error) {
      // Silent fail if structure doesn't exist yet
    }

    return violations;
  }

  // Validate security patterns
  async validateSecurity() {
    console.log('🔒 Validating security patterns...');

    const securityChecks = [
      { pattern: /private\s+key/gi, issue: 'Private keys found in code' },
      { pattern: /api[_\s]?key\s*=\s*["'][^"']+["']/gi, issue: 'Hardcoded API keys' },
      { pattern: /password\s*=\s*["'][^"']+["']/gi, issue: 'Hardcoded passwords' },
      { pattern: /JWT\.sign/g, issue: 'JWT signing in Flutter (should only verify)' },
      { pattern: /http:\/\//g, issue: 'Insecure HTTP usage' }
    ];

    const dartFiles = this.findFiles('lib', '*.dart');
    let securityIssues = [];

    for (const file of dartFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const relativePath = path.relative(this.projectPath, file);

        for (const check of securityChecks) {
          if (check.pattern.test(content)) {
            securityIssues.push({
              severity: 'critical',
              message: `${check.issue} in ${relativePath}`,
              fix: 'Remove sensitive data and use secure practices'
            });
          }
        }
      } catch (error) {
        // Skip file if can't read
      }
    }

    if (securityIssues.length > 0) {
      this.validationResults.categories.security.passed = false;
      this.validationResults.categories.security.issues = securityIssues;
    }

    // Check for required security files
    const securityFiles = [
      'lib/core/security/encryption_service.dart',
      'lib/core/security/secure_storage_service.dart'
    ];

    for (const file of securityFiles) {
      if (!fs.existsSync(path.join(this.projectPath, file))) {
        this.validationResults.categories.security.issues.push({
          severity: 'warning',
          message: `Missing security file: ${file}`,
          fix: 'Implement security infrastructure'
        });
      }
    }

    console.log(this.validationResults.categories.security.passed ? '  ✅ Security valid' : '  ❌ Security issues found');
  }

  // Validate PRPROMPTS patterns
  async validatePatterns() {
    console.log('📋 Validating PRPROMPTS patterns...');

    // Check if following BLoC pattern
    const blocFiles = this.findFiles('lib/features/*/presentation/bloc', '*.dart');
    const featureDirs = this.getFeatureDirs();

    if (featureDirs.length > 0 && blocFiles.length === 0) {
      this.validationResults.categories.patterns.issues.push({
        severity: 'warning',
        message: 'No BLoC implementations found',
        fix: 'Implement BLoC pattern as per PRPROMPTS/03-bloc_implementation.md'
      });
    }

    // Check for proper use case pattern
    const useCaseFiles = this.findFiles('lib/features/*/domain/usecases', '*.dart');
    if (featureDirs.length > 0 && useCaseFiles.length === 0) {
      this.validationResults.categories.patterns.issues.push({
        severity: 'warning',
        message: 'No use cases found',
        fix: 'Implement use cases as per PRPROMPTS/01-feature_scaffold.md'
      });
    }

    // Check for repository pattern
    const repoFiles = this.findFiles('lib/features/*/data/repositories', '*.dart');
    if (featureDirs.length > 0 && repoFiles.length === 0) {
      this.validationResults.categories.patterns.issues.push({
        severity: 'warning',
        message: 'No repository implementations found',
        fix: 'Implement repository pattern'
      });
    }

    if (this.validationResults.categories.patterns.issues.length > 0) {
      this.validationResults.categories.patterns.passed = false;
    }

    console.log(this.validationResults.categories.patterns.passed ? '  ✅ Patterns valid' : '  ❌ Pattern issues found');
  }

  // Validate testing
  async validateTesting() {
    console.log('🧪 Validating tests...');

    // Check test coverage
    try {
      execSync('flutter test --coverage', {
        cwd: this.projectPath,
        stdio: 'pipe'
      });

      const coverageFile = path.join(this.projectPath, 'coverage', 'lcov.info');
      if (fs.existsSync(coverageFile)) {
        const coverage = this.calculateCoverage(coverageFile);

        if (coverage < 70) {
          this.validationResults.categories.testing.issues.push({
            severity: 'warning',
            message: `Test coverage is ${coverage}% (minimum 70% required)`,
            fix: 'Add more tests to increase coverage'
          });
          this.validationResults.categories.testing.passed = false;
        } else {
          console.log(`  📊 Test coverage: ${coverage}%`);
        }
      }
    } catch (error) {
      this.validationResults.categories.testing.issues.push({
        severity: 'error',
        message: 'Tests failed to run',
        fix: 'Fix failing tests'
      });
      this.validationResults.categories.testing.passed = false;
    }

    // Check for test files
    const testFiles = this.findFiles('test', '*_test.dart');
    const libFiles = this.findFiles('lib', '*.dart').filter(f => !f.includes('.g.dart'));

    if (libFiles.length > 0 && testFiles.length === 0) {
      this.validationResults.categories.testing.issues.push({
        severity: 'error',
        message: 'No test files found',
        fix: 'Create tests for your code'
      });
      this.validationResults.categories.testing.passed = false;
    }

    console.log(this.validationResults.categories.testing.passed ? '  ✅ Tests valid' : '  ❌ Testing issues found');
  }

  // Validate compliance requirements
  async validateCompliance() {
    console.log('🏛️ Validating compliance...');

    // Read PRD for compliance requirements
    const prdPath = path.join(this.projectPath, 'docs', 'PRD.md');
    let compliance = [];

    if (fs.existsSync(prdPath)) {
      const prdContent = fs.readFileSync(prdPath, 'utf8');
      const complianceMatch = prdContent.match(/compliance:\s*\[(.*?)\]/);
      if (complianceMatch) {
        compliance = complianceMatch[1].split(',').map(c => c.trim().replace(/['"]/g, ''));
      }
    }

    // HIPAA compliance checks
    if (compliance.includes('hipaa')) {
      this.validateHIPAA();
    }

    // PCI-DSS compliance checks
    if (compliance.includes('pci-dss')) {
      this.validatePCIDSS();
    }

    // GDPR compliance checks
    if (compliance.includes('gdpr')) {
      this.validateGDPR();
    }

    console.log(this.validationResults.categories.compliance.passed ? '  ✅ Compliance valid' : '  ❌ Compliance issues found');
  }

  // HIPAA compliance validation
  validateHIPAA() {
    const issues = [];

    // Check for encryption
    if (!fs.existsSync(path.join(this.projectPath, 'lib/core/security/encryption_service.dart'))) {
      issues.push({
        severity: 'critical',
        message: 'HIPAA: Missing encryption service for PHI',
        fix: 'Implement AES-256-GCM encryption'
      });
    }

    // Check for audit logging
    if (!fs.existsSync(path.join(this.projectPath, 'lib/core/utils/audit_logger.dart'))) {
      issues.push({
        severity: 'critical',
        message: 'HIPAA: Missing audit logging for PHI access',
        fix: 'Implement audit logging'
      });
    }

    if (issues.length > 0) {
      this.validationResults.categories.compliance.passed = false;
      this.validationResults.categories.compliance.issues.push(...issues);
    }
  }

  // PCI-DSS compliance validation
  validatePCIDSS() {
    const dartFiles = this.findFiles('lib', '*.dart');

    for (const file of dartFiles) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for card number storage
      if (/\d{13,19}/.test(content)) {
        this.validationResults.categories.compliance.passed = false;
        this.validationResults.categories.compliance.issues.push({
          severity: 'critical',
          message: `PCI-DSS: Possible card number in ${path.relative(this.projectPath, file)}`,
          fix: 'Never store full card numbers, use tokenization'
        });
      }
    }
  }

  // GDPR compliance validation
  validateGDPR() {
    const issues = [];

    // Check for privacy policy
    if (!fs.existsSync(path.join(this.projectPath, 'assets/privacy_policy.md'))) {
      issues.push({
        severity: 'warning',
        message: 'GDPR: Missing privacy policy',
        fix: 'Add privacy policy document'
      });
    }

    // Check for data deletion capability
    if (!this.findFiles('lib', '*delete*.dart').length) {
      issues.push({
        severity: 'warning',
        message: 'GDPR: No data deletion functionality found',
        fix: 'Implement right to erasure'
      });
    }

    if (issues.length > 0) {
      this.validationResults.categories.compliance.passed = false;
      this.validationResults.categories.compliance.issues.push(...issues);
    }
  }

  // Calculate overall score
  calculateScore() {
    let score = 100;
    let totalIssues = 0;
    let criticalIssues = 0;

    Object.values(this.validationResults.categories).forEach(category => {
      category.issues.forEach(issue => {
        totalIssues++;
        if (issue.severity === 'critical') {
          criticalIssues++;
          score -= 15;
        } else if (issue.severity === 'error') {
          score -= 10;
        } else if (issue.severity === 'warning') {
          score -= 5;
        }
      });
    });

    this.validationResults.score = Math.max(0, score);
    this.validationResults.passed = this.validationResults.score >= 70;
  }

  // Generate recommendations
  generateRecommendations() {
    const recs = [];

    if (this.validationResults.score < 70) {
      recs.push('Critical issues found. Address security and compliance issues first.');
    }

    if (!this.validationResults.categories.testing.passed) {
      recs.push('Improve test coverage to at least 70%.');
    }

    if (!this.validationResults.categories.patterns.passed) {
      recs.push('Follow PRPROMPTS patterns for consistency.');
    }

    this.validationResults.recommendations = recs;
  }

  // Helper: Find files matching pattern
  findFiles(dir, pattern) {
    const files = [];
    const fullPath = path.join(this.projectPath, dir);

    if (!fs.existsSync(fullPath)) {
      return files;
    }

    const walk = (currentPath) => {
      try {
        const items = fs.readdirSync(currentPath);
        for (const item of items) {
          const itemPath = path.join(currentPath, item);
          const stat = fs.statSync(itemPath);

          if (stat.isDirectory()) {
            walk(itemPath);
          } else if (item.match(pattern.replace('*', '.*'))) {
            files.push(itemPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    walk(fullPath);
    return files;
  }

  // Get feature directories
  getFeatureDirs() {
    const featuresPath = path.join(this.projectPath, 'lib', 'features');
    if (!fs.existsSync(featuresPath)) {
      return [];
    }

    return fs.readdirSync(featuresPath)
      .filter(item => fs.statSync(path.join(featuresPath, item)).isDirectory());
  }

  // Calculate test coverage
  calculateCoverage(lcovPath) {
    try {
      const content = fs.readFileSync(lcovPath, 'utf8');
      const lines = content.split('\n');
      let totalLines = 0;
      let coveredLines = 0;

      lines.forEach(line => {
        if (line.startsWith('LF:')) {
          totalLines += parseInt(line.substring(3));
        } else if (line.startsWith('LH:')) {
          coveredLines += parseInt(line.substring(3));
        }
      });

      if (totalLines === 0) return 0;
      return Math.round((coveredLines / totalLines) * 100);
    } catch (error) {
      return 0;
    }
  }

  // Generate validation report
  generateReport() {
    const report = [];

    report.push('\n╔════════════════════════════════════════════════╗');
    report.push('║          VALIDATION REPORT                     ║');
    report.push('╚════════════════════════════════════════════════╝\n');

    report.push(`Overall Score: ${this.validationResults.score}/100 ${this.validationResults.passed ? '✅' : '❌'}\n`);

    // Category results
    Object.entries(this.validationResults.categories).forEach(([name, category]) => {
      const status = category.passed ? '✅' : '❌';
      const issueCount = category.issues.length;
      report.push(`${name.charAt(0).toUpperCase() + name.slice(1)}: ${status} ${issueCount > 0 ? `(${issueCount} issues)` : ''}`);

      if (issueCount > 0) {
        category.issues.forEach(issue => {
          const icon = issue.severity === 'critical' ? '🔴' :
                       issue.severity === 'error' ? '🟠' : '🟡';
          report.push(`  ${icon} ${issue.message}`);
          if (issue.fix) {
            report.push(`     Fix: ${issue.fix}`);
          }
        });
      }
    });

    // Recommendations
    if (this.validationResults.recommendations.length > 0) {
      report.push('\n📝 Recommendations:');
      this.validationResults.recommendations.forEach(rec => {
        report.push(`  • ${rec}`);
      });
    }

    const output = report.join('\n');
    console.log(output);

    // Save report to file
    const reportPath = path.join(this.projectPath, '.prprompts', 'validation-report.txt');
    try {
      const dir = path.dirname(reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(reportPath, output);
      console.log(`\n📄 Report saved to: ${reportPath}`);
    } catch (error) {
      // Silent fail
    }

    return this.validationResults;
  }
}

// Export for use in other modules
module.exports = AutomationValidator;

// CLI interface if run directly
if (require.main === module) {
  const validator = new AutomationValidator();

  validator.validate().then(results => {
    validator.generateReport();
    process.exit(results.passed ? 0 : 1);
  });
}