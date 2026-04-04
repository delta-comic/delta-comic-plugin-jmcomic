import { defineConfig } from 'vite-plus'

export default defineConfig({ pack: { platform: 'neutral', entry: './src/index.ts', dts: true } })