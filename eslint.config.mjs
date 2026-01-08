import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
    {
        ignores: ['node_modules/**', 'dist/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettierConfig,
    {
        plugins: {
            prettier: prettierPlugin,
        },
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'prettier/prettier': 'error',
            'no-useless-return': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    argsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-this-alias': [
                'error',
                {
                    allowDestructuring: true,
                    allowedNames: ['self'],
                },
            ],
            '@typescript-eslint/require-await': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unnecessary-condition': 'warn',
        },
    },
)
