import eslint from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import pluginReact from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat['jsx-runtime'],
      prettierConfig,
    ],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      'simple-import-sort/imports': ['error', {
        groups: [
          // 1. Node.js native modules (node: 프로토콜)
          ['^node:'],
          // 2. External modules (npm 패키지)
          ['^@?\\w'],
          // 3. Aliases (@/)
          ['^@/'],
          // 4. Relative imports
          ['^\\.'],
          // 5. Type imports
          ['^.+\\u0000$'],
        ],
      }],
      'simple-import-sort/exports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // React 규칙 활성화
      'react/jsx-uses-react': 'error', // JSX에서 React 사용 감지
      'react/jsx-uses-vars': 'error', // JSX에서 변수 사용 감지
      'react/prop-types': 'off', // TypeScript 사용 시 PropTypes 비활성화
      // React Hooks 규칙 활성화
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // React Fast Refresh 관련: 컴포넌트만 export하도록 경고
      ],
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
