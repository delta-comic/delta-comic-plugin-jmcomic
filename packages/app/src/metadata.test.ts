import { describe, expect, it } from 'vitest'

import { createPluginManifest, pluginMetadata } from './metadata'

describe('plugin metadata', () => {
  it('creates a loader manifest with the supplied release version', () => {
    expect(createPluginManifest('1.2.3-next.4')).toEqual({
      author: pluginMetadata.author,
      description: pluginMetadata.description,
      entry: { cssPath: 'index.css', jsPath: 'index.js' },
      name: { display: '插件模板', id: 'template' },
      require: [{ id: 'core' }],
      version: { plugin: '1.2.3-next.4', supportCore: '>=3.0.0-next.6 <4.0.0' },
    })
  })
})