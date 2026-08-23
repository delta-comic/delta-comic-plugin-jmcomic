import { readFile } from 'node:fs/promises'

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
          { label: 'manifest.json', path: 'packages/app/dist/manifest.json' },
          { label: 'plugin.zip', path: 'packages/app/dist/plugin.zip' },
        ],
        releaseNameTemplate: `${packageJson.description} <%= nextRelease.version %><%= nextRelease.channel ? " 预览版" : " 正式版" %>`,
      },
    ])
  })

  it('grants short-lived npm and GitHub Packages publishing credentials', async () => {
    const workflow = await readFile('.github/workflows/release.yaml', 'utf8')

    expect(workflow).toContain('id-token: write')
    expect(workflow).toContain('packages: write')
    expect(workflow).toContain("registry-url: 'https://npm.pkg.github.com'")
    expect(workflow).not.toMatch(/NPM_TOKEN|npm-token/i)
  })
})