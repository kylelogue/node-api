import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    { files: ['src/**/*.{js,mjs,cjs,ts}'] },
    { ignores: ['dist/**'] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            'curly': ['error', 'multi-line'],
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'indent': ['error', 4],
            'no-console': 'error',
            'no-extra-semi': 'error',
            'no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxEOF: 1
                }
            ],
            'no-trailing-spaces': 'error',
            'no-unneeded-ternary': [
                'error',
                { defaultAssignment: false }
            ],
            'no-var': 'error',
            'object-curly-spacing': ['error', 'always'],
            'prefer-const': [
                'error',
                {
                    destructuring: 'all',
                    ignoreReadBeforeAssign: true
                }
            ],
            'prefer-spread': 'error',
            'prefer-template': 'error',
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'space-before-function-paren': ['error', 'always'],

        }
    }
];