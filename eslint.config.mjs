import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import stylistic from '@stylistic/eslint-plugin'
import unicorn from 'eslint-plugin-unicorn'
import prettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**'],
  },
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.cjs'],
    ...eslint.configs.recommended,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-undef': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    plugins: {
      '@typescript-eslint': tseslint,
      '@stylistic': stylistic,
      unicorn: unicorn,
    },
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/import-style': [
        'error',
        {
          extendDefaultStyles: false,
        },
      ],
      'unicorn/prefer-module': 'off',
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
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
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    plugins: {
      unicorn: unicorn,
    },
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },
  prettier,
]
