import { defineConfig } from 'vite-plus'
import type { OxfmtConfig } from 'vite-plus/fmt'
import type { OxlintConfig } from 'vite-plus/lint'

import fmt from './.oxfmtrc.json' with { type: 'json' }
import lint from './.oxlintrc.json' with { type: 'json' }

export default defineConfig({
  staged: { '*': 'vp check --fix' },
  fmt: fmt as OxfmtConfig,
  lint: lint as OxlintConfig,
  run: { cache: { tasks: true, scripts: false } },
  test: {
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'script/**/*.{ts,mts}',
        'packages/sdk/src/**/*.ts',
        'packages/app/src/**/*.{ts,vue}',
      ],
      exclude: [
        '**/*.{test,spec}.{ts,tsx,mts}',
        '**/*.test-d.ts',
        '**/*.d.ts',
        '**/src/test/**',
        'script/**/*.{ts,mts}',
        'packages/app/src/metadata.ts',
      ],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
    exclude: ['**/node_modules/**', '**/.git/**'],
    projects: [
      { test: { name: 'root', environment: 'node', include: ['script/**/*.test.ts'] } },
      'packages/app',
      'packages/sdk',
    ],
  },
})