import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default tseslint.config(
    {
        // node_modules and .git are ignored already. These two are ours.
        ignores: ['dist/**', 'src/contract/api.d.ts'],
    },
    {
        // A bare directory on the CLI expands to .js/.mjs/.cjs without this.
        files: ['**/*.{js,jsx,ts,tsx}'],
        extends: [
            js.configs.recommended,
            // Turns off the base rules that misread TypeScript type syntax, `no-unused-vars`
            // on an interface signature and `no-redeclare` on a type import among them.
            tseslint.configs.recommended,
            react.configs.flat.recommended,
            react.configs.flat['jsx-runtime'],
            // Last, so formatting rules lose to prettier.
            prettier,
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
        },
        settings: {
            // Pinned: 'detect' crashes, eslint-plugin-react probes for a context API
            // that eslint 10 removed.
            react: { version: '19.2' },
        },
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            // The v7 flat preset also runs the React Compiler lints at error.
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    }
);
