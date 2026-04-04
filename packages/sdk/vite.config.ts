import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: { platform: 'neutral', entry: './src/index.ts', dts: { build: true } },
  test: { include: ['./test/**/*.test.ts'], setupFiles: ['dotenv/config'] }
})