import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import browserslist from 'browserslist'
import { deltaComic, deltaComicPlus } from 'delta-comic-core/vite'
import { browserslistToTargets } from 'lightningcss'
import { fileURLToPath, URL } from 'node:url'
import { NaiveUiResolver, VantResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, type UserConfigExport } from 'vite'
import wasm from 'vite-plugin-wasm'

import _package from './package.json'
export default defineConfig(
  ({ command }) =>
    ({
      plugins: [
        wasm(),
        vue(),
        vueJsx(),
        Components({ dts: true, resolvers: [NaiveUiResolver(), VantResolver()] }),
        tailwindcss(),
        deltaComicPlus(
          {
            name: { display: '禁漫天堂', id: 'jmcomic' },
            version: { plugin: _package.version, supportCore: '^1.1' },
            author: _package.author.name,
            description: _package.description,
            require: [
              { id: 'core' },
              { id: 'layout', download: 'gh:delta-comic/delta-comic-plugin-layout' }
            ],
            entry: { jsPath: './index.js', cssPath: 'auto' }
          },
          command
        )
      ],
      resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
      css: {
        transformer: 'lightningcss',
        lightningcss: {
          targets: browserslistToTargets(browserslist('> 1%, last 2 versions, not ie <= 8'))
        }
      },
      build: { sourcemap: true, minify: true, cssMinify: true },
      server: { port: 6173 },
      base: '/',
      optimizeDeps: { exclude: ['jmcomic-helper'] }
    }) satisfies UserConfigExport
)