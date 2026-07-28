import { fileURLToPath, URL } from 'node:url'

import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'
import { defineConfig, lazyPlugins, type PluginOption, type UserConfig } from 'vite-plus'

import packageJson from './package.json' with { type: 'json' }
import { createPluginManifest } from './src/metadata.js'

export default defineConfig(
  ({ command, mode }) =>
    ({
      base: './',
      build: {
        emptyOutDir: true,
        minify: 'oxc',
        outDir: 'dist',
        sourcemap: false,
        target: 'es2022',
      },
      css: {
        lightningcss: { targets: browserslistToTargets(browserslist('> 1%, last 2 versions')) },
        transformer: 'lightningcss',
      },
      plugins: lazyPlugins(async () => {
        const [{ deltaComic }, { default: tailwindcss }, { default: vue }] = await Promise.all([
          import('@delta-comic/plugin/vite'),
          import('@tailwindcss/vite'),
          import('@vitejs/plugin-vue'),
        ])

        const frameworkPlugins = [
          vue() as unknown as PluginOption,
          tailwindcss() as unknown as PluginOption,
        ]
        if (mode === 'test') return frameworkPlugins

        const version = process.env.DELTA_PLUGIN_VERSION ?? packageJson.version
        const pluginHelpers = deltaComic(
          createPluginManifest(version),
          command,
        ) as unknown as PluginOption[]
        return [...frameworkPlugins, ...pluginHelpers]
      }),
      resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
      server: { host: true, port: 6175, strictPort: true },
      test: { environment: 'happy-dom', include: ['src/**/*.test.ts'] },
    }) as UserConfig,
)