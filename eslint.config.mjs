//@ts-check
import eslint from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import pluginBarrelFiles from 'eslint-plugin-barrel-files';
import { importX } from 'eslint-plugin-import-x';
import pluginPerfectionist from 'eslint-plugin-perfectionist';
import pluginPrettier from 'eslint-plugin-prettier/recommended';
import * as pluginRegexp from 'eslint-plugin-regexp';
import pluginUnicorn from 'eslint-plugin-unicorn';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import { configs as tseslintConfigs } from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['**/node_modules/*', '**/dist/*', '.git/', 'pnpm-lock.yaml']),
  eslint.configs.recommended,
  {
    extends: [tseslintConfigs.strictTypeChecked, tseslintConfigs.stylisticTypeChecked],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-expect-error': false }],
    },
  },
  {
    plugins: {
      // @ts-expect-error https://github.com/typescript-eslint/typescript-eslint/issues/11543
      'import-x': importX,
    },
    extends: ['import-x/flat/recommended'],
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['./tsconfig.json'],
        }),
      ],
    },
    rules: {
      'import-x/no-default-export': ['warn'],
    },
  },
  pluginUnicorn.configs.unopinionated,
  pluginRegexp.configs['flat/recommended'],
  {
    plugins: { perfectionist: pluginPerfectionist },
    rules: { 'perfectionist/sort-imports': 'warn' },
  },
  {
    //@ts-expect-error
    extends: [pluginBarrelFiles.configs.recommended],
    rules: {
      'barrel-files/avoid-namespace-import': 'off',
      'barrel-files/avoid-importing-barrel-files': 'off',
    },
  },
  {
    files: ['**/*.config.{js,mjs,ts}'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  {
    files: ['**/src/*.{js,mjs,ts}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: ['**/*.config.{js,mjs,ts}', 'build/**/*'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    extends: [tseslintConfigs.disableTypeChecked],
  },
  {
    extends: [pluginPrettier],
    rules: { 'prettier/prettier': 'warn' },
  },
);
