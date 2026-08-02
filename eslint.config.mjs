import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const publicApiRestrictions = [
  {
    regex: '^\\.\\./\\.\\./',
    message: 'Используйте абсолютный алиас @/ для импортов между модулями.',
  },
  {
    regex: '^@/pages/[^/]+/.+',
    message: 'Импортируйте страницу только через её публичный index.ts.',
  },
  {
    regex: '^@/shared/(api|config|model)/.+',
    message: 'Импортируйте shared-модуль только через его публичный index.ts.',
  },
  {
    regex: '^@/entities/[^/]+/.+',
    message: 'Импортируйте entity только через её публичный index.ts.',
  },
  {
    regex: '^@/shared/ui/[^/]+/.+',
    message: 'Импортируйте shared UI-модуль только через его публичный index.ts.',
  },
  {
    regex: '^@/mocks/.+',
    message: 'Импортируйте mocks только через публичный index.ts.',
  },
];

const createImportRule = (additionalPatterns = []) => [
  'error',
  {
    patterns: [...publicApiRestrictions, ...additionalPatterns],
  },
];

export default defineConfig([
  globalIgnores([
    'coverage/**',
    'dist/**',
    'node_modules/**',
    'playwright-report/**',
    'public/mockServiceWorker.js',
    'test-results/**',
  ]),
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      curly: ['error', 'all'],
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
      'no-restricted-imports': createImportRule(),
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.type='MetaProperty'][object.meta.name='import'][object.property.name='meta'][property.name='env']",
          message: 'Обращайтесь к import.meta.env только в shared/config/env.ts.',
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createImportRule([
        {
          regex: '^@/(app|entities|features|mocks|pages|widgets)(/|$)',
          message: 'Shared не может зависеть от верхних слоёв или mocks.',
        },
      ]),
    },
  },
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createImportRule([
        {
          regex: '^@/(app|features|mocks|pages|widgets)(/|$)',
          message: 'Entities могут использовать только Shared.',
        },
      ]),
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createImportRule([
        {
          regex: '^@/(app|mocks|pages)(/|$)',
          message: 'Pages могут использовать только нижележащие слои.',
        },
      ]),
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createImportRule([
        {
          regex: '^@/(app|features|mocks|pages|widgets)(/|$)',
          message: 'Features могут использовать только Entities и Shared.',
        },
      ]),
    },
  },
  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createImportRule([
        {
          regex: '^@/(app|mocks|pages|widgets)(/|$)',
          message: 'Widgets могут использовать только нижележащие слои.',
        },
      ]),
    },
  },
  {
    files: ['src/mocks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createImportRule([
        {
          regex: '^@/(app|pages)(/|$)',
          message: 'Mocks не могут зависеть от App или Pages.',
        },
      ]),
    },
  },
  {
    files: ['src/mocks/**/*.integration.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': createImportRule([
        {
          regex: '^@/app(/|$)',
          message: 'Integration-тесты mocks не должны зависеть от App.',
        },
      ]),
    },
  },
  {
    files: ['src/shared/config/env.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['src/shared/lib/observability/adapters.ts'],
    rules: {
      'no-console': ['error', { allow: ['error'] }],
    },
  },
  prettier,
]);
