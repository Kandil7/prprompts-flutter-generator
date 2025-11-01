/**
 * PRPROMPTS Flutter Generator - Validation System
 *
 * Phase 5: Comprehensive validation framework for React-to-Flutter refactoring
 *
 * Exports:
 * - Core Validators (Code, Architecture, Security, Performance, Accessibility)
 * - Behavior Validators (State, Props, API)
 * - Orchestrator (coordinates all validators)
 * - Report Generator (JSON, HTML, Markdown reports)
 */

// Core Validators
const CodeValidator = require('./CodeValidator');
const ArchitectureValidator = require('./ArchitectureValidator');
const SecurityValidator = require('./SecurityValidator');
const PerformanceValidator = require('./PerformanceValidator');
const AccessibilityValidator = require('./AccessibilityValidator');

// Orchestration
const ValidationOrchestrator = require('./ValidationOrchestrator');
const ReportGenerator = require('./ReportGenerator');

// Models
const { ValidationResult } = require('../models/ValidationResult');

/**
 * Quick validation functions
 */

/**
 * Validate a single Dart file
 * @param {string} filePath - Path to Dart file
 * @param {string} code - Dart source code (optional, will read from file if not provided)
 * @param {object} config - Validation configuration
 * @returns {Promise<object>} Validation results
 */
async function validateFile(filePath, code = null, config = {}) {
  const orchestrator = new ValidationOrchestrator(config);
  return await orchestrator.validateFile(filePath, code);
}

/**
 * Validate entire Flutter project
 * @param {string} projectPath - Path to Flutter project root
 * @param {object} config - Validation configuration
 * @returns {Promise<object>} Comprehensive validation results
 */
async function validateProject(projectPath, config = {}) {
  const orchestrator = new ValidationOrchestrator(config);
  return await orchestrator.validateProject(projectPath);
}

/**
 * Validate code against specific validator
 * @param {string} validator - Validator name (code, architecture, security, performance, accessibility)
 * @param {string} target - File path or project path
 * @param {string} code - Optional source code
 * @param {object} config - Validator configuration
 * @returns {ValidationResult}
 */
function validateWith(validator, target, code = null, config = {}) {
  const validators = {
    code: CodeValidator,
    architecture: ArchitectureValidator,
    security: SecurityValidator,
    performance: PerformanceValidator,
    accessibility: AccessibilityValidator
  };

  const ValidatorClass = validators[validator.toLowerCase()];
  if (!ValidatorClass) {
    throw new Error(`Unknown validator: ${validator}. Available: ${Object.keys(validators).join(', ')}`);
  }

  const validatorInstance = new ValidatorClass(config);

  // Architecture validator expects project path only
  if (validator.toLowerCase() === 'architecture') {
    return validatorInstance.validate(target);
  }

  // Other validators expect (filePath, code)
  return validatorInstance.validate(target, code);
}

/**
 * Generate validation report
 * @param {object} results - Validation results
 * @param {string} format - Report format (json, html, markdown)
 * @returns {string} Report content
 */
function generateReport(results, format = 'json') {
  const generator = new ReportGenerator();

  switch (format.toLowerCase()) {
    case 'html':
      return generator.generateHTML(results);
    case 'markdown':
    case 'md':
      return generator.generateMarkdown(results);
    case 'json':
    default:
      return JSON.stringify(results, null, 2);
  }
}

/**
 * Validation configuration templates
 */
const ValidationConfig = {
  // Strict configuration - for production code
  strict: {
    enabledValidators: {
      code: true,
      architecture: true,
      security: true,
      performance: true,
      accessibility: true
    },
    thresholds: {
      minimumScore: 90,
      errorTolerance: 0,
      warningTolerance: 5
    },
    code: {
      strictNullSafety: true,
      requireConstConstructors: true,
      requireKeyParameter: true
    },
    security: {
      checkSecrets: true,
      checkCompliance: true,
      strictMode: true
    }
  },

  // Standard configuration - for development
  standard: {
    enabledValidators: {
      code: true,
      architecture: true,
      security: true,
      performance: true,
      accessibility: true
    },
    thresholds: {
      minimumScore: 80,
      errorTolerance: 0,
      warningTolerance: 10
    },
    code: {
      strictNullSafety: true,
      requireConstConstructors: false,
      requireKeyParameter: true
    }
  },

  // Lenient configuration - for legacy code
  lenient: {
    enabledValidators: {
      code: true,
      architecture: false,
      security: true,
      performance: false,
      accessibility: false
    },
    thresholds: {
      minimumScore: 60,
      errorTolerance: 5,
      warningTolerance: 20
    },
    code: {
      strictNullSafety: false,
      requireConstConstructors: false,
      requireKeyParameter: false
    },
    security: {
      checkSecrets: true,
      checkCompliance: false,
      strictMode: false
    }
  },

  // Security-focused configuration
  security: {
    enabledValidators: {
      code: false,
      architecture: false,
      security: true,
      performance: false,
      accessibility: false
    },
    thresholds: {
      minimumScore: 100,
      errorTolerance: 0,
      warningTolerance: 0
    },
    security: {
      checkSecrets: true,
      checkCompliance: true,
      strictMode: true
    }
  },

  // Performance-focused configuration
  performance: {
    enabledValidators: {
      code: false,
      architecture: false,
      security: false,
      performance: true,
      accessibility: false
    },
    thresholds: {
      minimumScore: 85,
      errorTolerance: 0,
      warningTolerance: 5
    },
    performance: {
      enforceConst: true,
      checkListViews: true,
      checkImageOptimization: true
    }
  }
};

// Exports
module.exports = {
  // Validators
  CodeValidator,
  ArchitectureValidator,
  SecurityValidator,
  PerformanceValidator,
  AccessibilityValidator,

  // Orchestration
  ValidationOrchestrator,
  ReportGenerator,

  // Models
  ValidationResult,

  // Quick functions
  validateFile,
  validateProject,
  validateWith,
  generateReport,

  // Configuration templates
  ValidationConfig,

  // Default export
  default: {
    validateFile,
    validateProject,
    validateWith,
    generateReport,
    ValidationConfig
  }
};
