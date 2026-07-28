import { describe, expect, it, vi } from 'vitest'

import {
  describeReleaseBranchAction,
  parseReleaseBranchArgs,
  ReleaseBranchManager,
  type GitRunner,
} from './release-branches.mts'

interface GitFixture {
  dirty?: boolean
  hashes?: Record<string, string>
  refs?: string[]
}

function createGitFixture({ dirty = false, hashes = {}, refs = [] }: GitFixture = {}) {
  const knownRefs = new Set(refs)
  return vi.fn<GitRunner>(async args => {
    if (args[0] === 'status') return { status: 0, stdout: dirty ? ' M package.json\n' : '' }
    if (args[0] === 'show-ref') {
      return { status: knownRefs.has(args.at(-1) ?? '') ? 0 : 1, stdout: '' }
    }
    if (args[0] === 'rev-parse') {
      return { status: 0, stdout: `${hashes[args[1]] ?? 'same-sha'}\n` }
    }
    return { status: 0, stdout: '' }
  })
}

describe('release branch CLI', () => {
  it('parses supported actions and options', () => {
    expect(parseReleaseBranchArgs(['preview', '--dry-run'])).toEqual({
      action: 'preview',
      dryRun: true,
      help: false,
    })
    expect(parseReleaseBranchArgs(['--help']).help).toBe(true)
    expect(() => parseReleaseBranchArgs(['production'])).toThrow('Unknown or missing')
    expect(() => parseReleaseBranchArgs(['stable', '--force'])).toThrow('Unknown option')
  })

  it('describes dry runs without invoking git', () => {
    expect(describeReleaseBranchAction('develop')).toContain('No git command was executed')
    expect(describeReleaseBranchAction('preview')).toContain('develop -> next')
  })
})

describe('ReleaseBranchManager', () => {
  it('refuses a dirty worktree', async () => {
    const git = createGitFixture({ dirty: true })
    await expect(new ReleaseBranchManager(git).promote('preview')).rejects.toThrow(
      'worktree must be clean',
    )
    expect(git).toHaveBeenCalledExactlyOnceWith(['status', '--porcelain'])
  })

  it('bootstraps develop from origin/main', async () => {
    const git = createGitFixture({ refs: ['refs/remotes/origin/main'] })
    await new ReleaseBranchManager(git).prepareDevelop()
    expect(git).toHaveBeenCalledWith(['switch', '-c', 'develop', 'refs/remotes/origin/main'])
    expect(git).toHaveBeenCalledWith(['push', '--set-upstream', 'origin', 'develop'])
  })

  it('merges a stable release back into an existing develop branch', async () => {
    const refs = ['refs/remotes/origin/develop', 'refs/heads/develop', 'refs/remotes/origin/main']
    const git = createGitFixture({ refs })
    await new ReleaseBranchManager(git).prepareDevelop()
    expect(git).toHaveBeenCalledWith(['merge', '--no-ff', '--no-edit', 'refs/remotes/origin/main'])
    expect(git).toHaveBeenCalledWith(['push', 'origin', 'develop'])
  })

  it('protects a local develop branch that has no remote counterpart', async () => {
    const refs = ['refs/remotes/origin/main', 'refs/heads/develop']
    await expect(
      new ReleaseBranchManager(createGitFixture({ refs })).prepareDevelop(),
    ).rejects.toThrow('Local develop exists without origin/develop')
  })

  it('creates next on the first preview promotion', async () => {
    const refs = ['refs/remotes/origin/develop', 'refs/heads/develop']
    const git = createGitFixture({ refs })
    await new ReleaseBranchManager(git).promote('preview')
    expect(git).toHaveBeenCalledWith(['switch', '-c', 'next', 'develop'])
    expect(git).toHaveBeenCalledWith(['push', '--set-upstream', 'origin', 'next'])
    expect(git).toHaveBeenLastCalledWith(['switch', 'develop'])
  })

  it('merges a synchronized source into an existing target', async () => {
    const refs = [
      'refs/remotes/origin/develop',
      'refs/heads/develop',
      'refs/remotes/origin/next',
      'refs/heads/next',
    ]
    const git = createGitFixture({ refs })
    await new ReleaseBranchManager(git).promote('preview')
    expect(git).toHaveBeenCalledWith(['merge', '--no-ff', '--no-edit', 'develop'])
    expect(git).toHaveBeenCalledWith(['push', 'origin', 'next'])
  })

  it('rejects local-only commits on the source branch', async () => {
    const refs = ['refs/remotes/origin/next', 'refs/heads/next']
    const hashes = { 'refs/heads/next': 'local', 'refs/remotes/origin/next': 'remote' }
    const git = createGitFixture({ hashes, refs })
    await expect(new ReleaseBranchManager(git).promote('stable')).rejects.toThrow(
      'not synchronized',
    )
    expect(git).not.toHaveBeenCalledWith(['push', 'origin', 'main'])
  })

  it('requires main to exist before a stable promotion', async () => {
    const refs = ['refs/remotes/origin/next', 'refs/heads/next']
    await expect(
      new ReleaseBranchManager(createGitFixture({ refs })).promote('stable'),
    ).rejects.toThrow('origin/main does not exist')
  })

  it('dispatches actions through execute', async () => {
    const refs = ['refs/remotes/origin/main']
    const git = createGitFixture({ refs })
    await new ReleaseBranchManager(git).execute('develop')
    expect(git).toHaveBeenCalledWith(['push', '--set-upstream', 'origin', 'develop'])
  })
})