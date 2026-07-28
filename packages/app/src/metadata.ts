export const pluginMetadata = {
  author: 'wenxig',
  description: '为 Delta Comic 提供禁漫天堂的漫画、图文、小说和创作者画册内容',
  entry: { cssPath: 'index.css', jsPath: 'index.js' },
  name: { display: '禁漫天堂', id: 'jmcomic' },
  require: [{ id: 'core' }],
  supportCore: '>=3.0.0-next.6 <4.0.0',
} as const

export function createPluginManifest(version: string) {
  return {
    author: pluginMetadata.author,
    description: pluginMetadata.description,
    entry: { ...pluginMetadata.entry },
    name: { ...pluginMetadata.name },
    require: pluginMetadata.require.map(required => ({ ...required })),
    version: { plugin: version, supportCore: pluginMetadata.supportCore },
  }
}