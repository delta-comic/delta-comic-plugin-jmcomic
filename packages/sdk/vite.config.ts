import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite-plus'

const testTsconfig = fileURLToPath(new URL('./tsconfig.test.json', import.meta.url))

export default defineConfig({
  pack: {
    platform: 'neutral',
    entry: ['./src/index.ts', './src/browser.ts', './src/node.ts'],
    dts: { tsgo: true, tsconfig: './tsconfig.app.json' },
    sourcemap: true,
  },
  test: {
    name: 'sdk',
    environment: 'node',
    include: ['./test/**/*.test.ts'],
    typecheck: {
      enabled: true,
      checker: 'tsc',
      tsconfig: testTsconfig,
      include: ['./test/**/*.test-d.ts'],
    },
  },
})