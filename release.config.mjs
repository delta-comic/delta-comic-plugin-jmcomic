import packageJson from './package.json' with { type: 'json' }
import { createReleaseNameTemplate } from './script/release-notes.mts'

export const releaseBranches = ['main', { name: 'next', channel: 'next', prerelease: 'next' }]

export default {
  branches: releaseBranches,
  repositoryUrl: packageJson.repository.url,
  tagFormat: '${version}',
  plugins: [
    ['@semantic-release/commit-analyzer', { preset: 'angular' }],
    './script/semantic-release-plugin.mts',
    ['@semantic-release/release-notes-generator', { preset: 'angular' }],
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'packages/app/dist/manifest.json', label: 'manifest.json' },
          { path: 'packages/app/dist/plugin.zip', label: 'plugin.zip' },
        ],
        releaseNameTemplate: createReleaseNameTemplate(packageJson.description),
      },
    ],
  ],
}