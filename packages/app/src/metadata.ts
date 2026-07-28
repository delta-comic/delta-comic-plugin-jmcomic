export const pluginMetadata = {
  author: 'your-name',
  description: '一个基于官方工具链的 Delta Comic 插件示例',
  entry: { cssPath: 'index.css', jsPath: 'index.js' },
  name: { display: '插件模板', id: 'template' },
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