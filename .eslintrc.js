module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier'
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:unicorn/recommended'
    ],
    rules: {
        'prettier/prettier': 2,
        'unicorn/no-null': 'Off',
        'unicorn/filename-case': 'Off',
        'unicorn/prefer-node-protocol': 'Off',
        'unicorn/import-style': [
            'error',
            {
                'extendDefaultStyles': false
            }
        ]
    }
};
