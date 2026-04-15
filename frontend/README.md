# React + TypeScript + Vite

## tsconfig 구조

이 프로젝트는 TypeScript의 [프로젝트 레퍼런스(Project References)](https://www.typescriptlang.org/docs/handbook/project-references.html) 기능을 활용해 tsconfig를 세 파일로 분리합니다.

### `tsconfig.json` (루트)
`files: []`로 직접 컴파일 대상을 갖지 않으며, `tsconfig.app.json`과 `tsconfig.node.json`을 참조하는 진입점 역할만 합니다. IDE와 타입 체커는 이 파일을 통해 전체 프로젝트를 인식합니다.

### `tsconfig.app.json` (브라우저 앱 코드)
`src/` 디렉토리를 대상으로 하며, 브라우저 환경에 맞는 설정을 가집니다.

- `target: "es2023"`, `lib: ["ES2023", "DOM", "DOM.Iterable"]` — 최신 브라우저 API와 DOM 타입을 사용합니다.
- `types: ["vite/client"]` — Vite가 제공하는 `import.meta.env`, 에셋 임포트 등의 타입을 인식합니다.
- `moduleResolution: "bundler"` — Vite(번들러)가 모듈 해석을 담당하므로, Node.js 방식 대신 번들러 모드를 사용합니다.
- `allowImportingTsExtensions: true` — `.ts`, `.tsx` 확장자를 명시한 임포트를 허용합니다. `noEmit: true`와 함께 사용해야 합니다.
- `verbatimModuleSyntax: true` — `import type`과 일반 `import`를 구분하도록 강제해, 번들러의 트리쉐이킹 및 타입 전용 임포트 제거를 안정화합니다.
- `jsx: "react-jsx"` — React 17+의 새로운 JSX 변환 방식을 사용해, 파일마다 `import React`를 작성하지 않아도 됩니다.
- `erasableSyntaxOnly: true` — 런타임에 영향을 주지 않고 타입 제거만으로 동작 가능한 문법만 허용합니다. (`enum`, `namespace` 등 비권장)

### `tsconfig.node.json` (Vite 설정 파일)
`vite.config.ts`만을 대상으로 하며, Node.js 환경에 맞는 설정을 가집니다.

- `lib: ["ES2023"]` — DOM 타입 없이 Node.js 환경 전용입니다.
- `types: ["node"]` — Node.js 전역 타입(`process`, `__dirname` 등)을 인식합니다.
- 나머지 옵션은 `tsconfig.app.json`과 동일한 번들러 모드 및 린팅 규칙을 공유합니다.

---

## vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- `defineConfig` — 설정 객체에 타입 추론을 제공하는 Vite 헬퍼입니다.
- `@vitejs/plugin-react` — [Oxc](https://oxc.rs) 기반의 공식 React 플러그인으로, JSX 변환과 Fast Refresh(HMR)를 처리합니다. SWC 기반의 `@vitejs/plugin-react-swc`로 교체하면 대규모 프로젝트에서 빌드 속도를 높일 수 있습니다.
- `vite-tsconfig-paths` — `tsconfig.json`의 `paths` 옵션을 Vite 번들러가 인식하도록 연결해주는 플러그인입니다. 아래 섹션에서 자세히 설명합니다.

## vite-tsconfig-paths

### 역할

TypeScript는 `tsconfig.json`의 `compilerOptions.paths`를 통해 경로 별칭(alias)을 지원합니다. 예를 들어 아래처럼 설정하면:

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "paths": {
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

소스 코드에서 다음과 같이 사용할 수 있습니다:

```ts
import Button from '@components/Button'
import { formatDate } from '@utils/date'
```

그런데 TypeScript 컴파일러(`tsc`)는 이 별칭을 타입 검사에만 활용하고, 실제 번들링은 Vite가 담당합니다. **Vite는 기본적으로 `tsconfig.paths`를 읽지 않기 때문에**, 별도 설정 없이는 런타임에서 모듈을 찾지 못해 빌드가 실패합니다.

`vite-tsconfig-paths`는 Vite 플러그인으로 동작하며, `tsconfig.json`의 `paths` 설정을 읽어 Vite의 모듈 해석 단계에 그대로 적용합니다. 덕분에 `vite.config.ts`에 `resolve.alias`를 중복으로 정의하지 않아도 됩니다.

### `vite.config.ts` 없이 alias를 설정하는 기존 방식과의 차이

| | `resolve.alias` 수동 설정 | `vite-tsconfig-paths` |
|---|---|---|
| 설정 위치 | `vite.config.ts` | `tsconfig.json` (단일 소스) |
| 타입 지원 | 별도 `paths` 설정 필요 | 자동 연동 |
| 유지보수 | 두 곳을 동기화해야 함 | 한 곳만 수정 |

---

## ESLint 구성

### 적용된 플러그인 및 preset

| 플러그인 | 역할 |
|---|---|
| `@eslint/js` | ESLint 기본 추천 규칙 |
| `typescript-eslint` | TypeScript 타입 인식 규칙 |
| `eslint-plugin-react-hooks` | Hook 규칙 및 의존성 배열 검사 |
| `eslint-plugin-react-refresh` | Fast Refresh 호환성 검사 |
| `eslint-plugin-react` | React JSX 규칙 |
| `eslint-config-prettier` | Prettier와 충돌하는 ESLint 규칙 비활성화 |
| `eslint-plugin-simple-import-sort` | import/export 알파벳 정렬 |
| `eslint-plugin-unused-imports` | 미사용 import/변수 감지 |

### 적용된 규칙 상세

#### import 정렬 (`simple-import-sort`)

import는 다음 순서로 그룹화되며, 각 그룹 내에서는 알파벳 순으로 정렬됩니다.

```
1. Node.js native  →  import fs from 'node:fs'
2. External        →  import { useState } from 'react'
3. Aliases         →  import Button from '@/components/Button'
4. Relative        →  import styles from './App.css'
5. Type imports    →  import type { FC } from 'react'
```

#### 미사용 코드 (`unused-imports`)

- 미사용 import → `error` (빌드 전 제거 강제)
- 미사용 변수 → `warn` (단, `_` 접두사 변수는 무시)

```ts
const _unused = 'ignored' // 경고 없음
const unused = 'error'    // 경고 발생
```

#### React 규칙

- `react/prop-types: off` — TypeScript로 props를 타입 정의하므로 PropTypes 불필요
- `react/jsx-uses-react: error` — JSX 파일에서 React import 감지
- `react/jsx-uses-vars: error` — JSX에서 사용된 변수를 미사용으로 잘못 감지하는 것을 방지
- `react-hooks/rules-of-hooks: error` — Hook을 조건문·반복문 안에서 호출 시 오류
- `react-hooks/exhaustive-deps: error` — `useEffect` 등의 의존성 배열 누락·과잉 시 오류
- `react-refresh/only-export-components: warn` — Fast Refresh가 정상 동작하려면 컴포넌트만 export해야 함

### 규칙 변경 방법

#### 규칙 심각도 변경

`rules` 객체에서 `'error'` / `'warn'` / `'off'` 중 하나로 변경합니다.

```js
rules: {
  'react-hooks/exhaustive-deps': 'warn', // error → warn으로 완화
}
```

#### import 그룹 순서 변경

`simple-import-sort/imports`의 `groups` 배열 순서를 바꾸면 됩니다. 각 내부 배열이 하나의 그룹이며, 배열 내 패턴은 정규식입니다.

```js
'simple-import-sort/imports': ['error', {
  groups: [
    ['^node:'],       // 순서를 바꾸거나
    ['^@/'],          // 그룹을 추가·삭제할 수 있음
    ['^@?\\w'],
    ['^\\.'],
    ['^.+\\u0000$'],
  ],
}],
```

#### 특정 파일에서 규칙 비활성화

파일 상단에 주석을 추가합니다.

```ts
/* eslint-disable react-hooks/exhaustive-deps */
```

한 줄만 비활성화하려면:

```ts
useEffect(() => { ... }, []) // eslint-disable-line react-hooks/exhaustive-deps
```

#### 새 플러그인 추가

1. 패키지 설치: `npm install --save-dev eslint-plugin-xxx`
2. `eslint.config.js`에 import 추가
3. `plugins` 객체에 등록
4. `rules`에 원하는 규칙 추가

```js
import pluginXxx from 'eslint-plugin-xxx'

plugins: { 'xxx': pluginXxx },
rules: { 'xxx/some-rule': 'error' },
```

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
