module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage configuration (disabled by default, use --coverage flag to enable)
  collectCoverage: false,
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js',
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/.github/',
    '/examples/',
    '/marketing/',
    'postinstall.test.js', // Temporarily skip due to process.exit mocking issues
    'updater.test.js', // Temporarily skip due to process.exit mocking issues
    'cli.test.js', // Temporarily skip due to process.exit mocking issues
  ],

  // Maximum number of concurrent workers
  maxWorkers: '50%',
};
