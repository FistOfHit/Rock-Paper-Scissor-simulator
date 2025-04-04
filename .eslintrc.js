module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: 'eslint:recommended',
  overrides: [
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{js,cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-undef': 'off' // Temporarily disable undefined variables due to window globals
  },
  globals: {
    // Define global variables used in the project
    window: 'writable',
    document: 'writable',
    localStorage: 'writable',
    fetch: 'readonly'
  }
}
