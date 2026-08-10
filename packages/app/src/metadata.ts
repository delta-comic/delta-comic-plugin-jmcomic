import { DELTA_COMIC_PLUGIN_API_VERSION, type PluginManifest } from '@delta-comic/model'

export const pluginMetadata = {
  apiVersion: DELTA_COMIC_PLUGIN_API_VERSION,
  author: 'wenxig',
  description: '为 Delta Comic 提供禁漫天堂的漫画、图文、小说和创作者画册内容',
  entry: { cssPath: 'index.css', jsPath: 'index.js' },
  kind: 'normal',
  name: { display: '禁漫天堂', id: 'jmcomic' },
  require: [{ id: 'core' }, { id: 'layout', download: 'gh:delta-comic/delta-comic-plugin-layout' }],
  supportCore: '>=3.0.0-next.10 <4.0.0',
} as const

export function createPluginManifest(version: string) {
  return {
    apiVersion: pluginMetadata.apiVersion,
    author: pluginMetadata.author,
    description: pluginMetadata.description,
    entry: { ...pluginMetadata.entry },
    kind: pluginMetadata.kind,
    name: { ...pluginMetadata.name },
    require: pluginMetadata.require.map(required => ({ ...required })),
    version: { plugin: version, supportCore: pluginMetadata.supportCore },
  } satisfies PluginManifest
}