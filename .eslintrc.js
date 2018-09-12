module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  globals: {
    L: true
  },
  plugins: [],
  rules: {
    quotes: ['error', 'single']
  }
}
