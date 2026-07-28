import { describe, expect, it } from 'vitest'

import packageJson from '../package.json' with { type: 'json' }
import releaseConfig, { releaseBranches } from '../release.config.mjs'

describe('release configuration', () => {
  it('publishes stable and next channels only', () => {
    expect(releaseBranches).toEqual(['main', { channel: 'next', name: 'next', prerelease: 'next' }])
  })

  it('uploads only manifest.json and plugin.zip', () => {
    const githubPlugin = releaseConfig.plugins?.find(
      plugin => Array.isArray(plugin) && plugin[0] === '@semantic-release/github',
    )
    expect(githubPlugin).toEqual([
      '@semantic-release/github',
      {
        assets: [
          { label: 'manifest.json', path: 'dist/release/manifest.json' },
          { label: 'plugin.zip', path: 'dist/release/plugin.zip' },
        ],
        releaseNameTemplate: `${packageJson.description} <%= nextRelease.version %><%= nextRelease.channel ? " 预览版" : " 正式版" %>`,
      },
    ])
  })
})