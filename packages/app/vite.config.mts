import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'
import { defineConfig, lazyPlugins } from 'vite-plus'

import packageJson from './package.json' with { type: 'json' }
import { pluginName } from './src/constants.ts'

const testTsconfig = fileURLToPath(new URL('./tsconfig.app.json', import.meta.url))

import { DELTA_COMIC_PLUGIN_API_VERSION } from '@delta-comic/model'

export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: '[name]-[hash].js',
        entryFileNames: chunk => (chunk.name.endsWith('.d') ? 'index.d.ts' : 'index.js'),
      },
    },
    sourcemap: true,
  },
  css: {
    lightningcss: { targets: browserslistToTargets(browserslist('> 1%, last 2 versions')) },
    transformer: 'lightningcss',
  },
  plugins: lazyPlugins(async () => {
    const [{ deltaComic }, { default: tailwindcss }, { default: vue }, { dts }] = await Promise.all(
      [
        import('@delta-comic/plugin/vite'),
        import('@tailwindcss/vite'),
        import('@vitejs/plugin-vue'),
        import('rolldown-plugin-dts'),
      ],
    )
    const pluginLayoutId = mode === 'test' ? undefined : 'layout'

    return [
      vue(),
      tailwindcss(),
      deltaComic({
        apiVersion: DELTA_COMIC_PLUGIN_API_VERSION,
        author: 'wenxig',
        description: '为 Delta Comic 提供禁漫天堂的漫画、图文、小说和创作者画册内容',
        name: { display: '禁漫天堂', id: pluginName },
        require: [
          { id: 'core' },
          ...(pluginLayoutId
            ? [{ id: pluginLayoutId, download: 'gh:delta-comic/delta-comic-plugin-layout' }]
            : []),
        ],
        version: {
          plugin: process.env.DELTA_PLUGIN_VERSION ?? packageJson.version,
          supportCore: '>=3.0.0-next.19 <4.0.0',
        },
      }),
      ...(mode === 'test'
        ? []
        : [
            dts({
              vue: true,
              tsconfig: resolve(import.meta.dirname, './tsconfig.app.json'),
              sourcemap: true,
            }),
          ]),
    ]
  }),
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  run: {
    tasks: {
      build: {
        command: 'vp build',
        dependsOn: [{ task: 'build', from: 'dependencies' }],
        env: ['DELTA_PLUGIN_VERSION'],
        cache: true,
      },
      dev: {
        command: 'vp dev',
        dependsOn: [{ task: 'build', from: 'dependencies' }],
        cache: false,
      },
      typecheck: {
        command: ['vue-tsc -p tsconfig.app.json --noEmit', 'tsc -p tsconfig.node.json --noEmit'],
        dependsOn: [{ task: 'build', from: 'dependencies' }],
        cache: true,
      },
    },
  },
  server: { host: true, port: 6175, strictPort: true },
  test: {
    name: 'app',
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    typecheck: {
      enabled: true,
      checker: 'vue-tsc',
      tsconfig: testTsconfig,
      include: ['src/**/*.test-d.ts'],
    },
  },
}))