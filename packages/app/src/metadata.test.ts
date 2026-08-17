import { describe, expect, it } from 'vitest'

import { createPluginManifest, pluginMetadata } from './metadata'

describe('plugin metadata', () => {
  it('creates a loader manifest with the supplied release version', () => {
    expect(createPluginManifest('1.2.3-next.4')).toEqual({
      apiVersion: pluginMetadata.apiVersion,
      author: pluginMetadata.author,
      description: pluginMetadata.description,
      entry: { cssPath: 'index.css', jsPath: 'index.js' },
      name: { display: '禁漫天堂', id: 'jmcomic' },
      require: [
        { id: 'core' },
        { id: 'layout', download: 'gh:delta-comic/delta-comic-plugin-layout' },
      ],
      version: { plugin: '1.2.3-next.4', supportCore: '>=3.0.0-next.12 <4.0.0' },
    })
  })
})