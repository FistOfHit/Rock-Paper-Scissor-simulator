module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    '*.js',
    '!jest.config.js',
    '!jest.setup.js',
    '!.eslintrc.js'
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/jest.setup.js'
  },
  // Increase test timeout to avoid issues in CI environment
  testTimeout: 10000,
  // Simplify test environment for CI
  verbose: true,
  bail: false,
  // Allow tests to pass even with console errors
  silent: false
};
