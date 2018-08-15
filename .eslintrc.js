module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  globals: {
    L: true
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error', { SingleQuote: true }]
  }
}
