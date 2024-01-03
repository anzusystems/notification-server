// eslint-disable-next-line unicorn/prefer-module,no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@stylistic'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:unicorn/recommended'],
  rules: {
    'unicorn/no-null': 'Off',
    'unicorn/filename-case': 'Off',
    'unicorn/prefer-node-protocol': 'Off',
    'unicorn/import-style': [
      'error',
      {
        extendDefaultStyles: false,
      },
    ],
    '@stylistic/semi': ['error', 'never'],
    '@stylistic/quotes': ['error', 'single', 'avoid-escape'],
    '@stylistic/object-curly-spacing': ['error', 'always'],
    '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    '@stylistic/no-trailing-spaces': 'error',
    '@stylistic/comma-dangle': ['error', 'only-multiline'],
    '@stylistic/max-len': [
      'error',
      {
        code: 120,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
        ignorePattern: '^import .*',
      },
    ],
  },
}
