import eslint from '@eslint/js'
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended'
import tsEslint from 'typescript-eslint'
import unicornPlugin from 'eslint-plugin-unicorn'
import jestPlugin from 'eslint-plugin-jest'

export default tsEslint.config(
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'eslint.config.mjs',
      'jest.config.js',
      'dist/**',
    ],
  },

  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  ...tsEslint.configs.stylisticTypeChecked,
  unicornPlugin.configs['flat/recommended'],
  jestPlugin.configs['flat/recommended'],
  prettierPluginRecommended,
  {
    rules: {
      'prettier/prettier': 2,
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/import-style': [
        'error',
        {
          extendDefaultStyles: false,
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['test.tsconfig.json'],
      },
    },
  },
)
