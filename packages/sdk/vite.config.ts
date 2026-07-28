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
  run: {
    tasks: {
      'schema:generate': {
        command: ['ts-to-zod --all', 'vp fmt src/model/generated --write'],
        cache: false,
      },
      'build': { command: 'vp pack', dependsOn: ['schema:generate'] },
      'typecheck': {
        command: ['tsgo -p tsconfig.app.json --noEmit', 'tsgo -p tsconfig.node.json --noEmit'],
        dependsOn: ['schema:generate'],
      },
    },
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