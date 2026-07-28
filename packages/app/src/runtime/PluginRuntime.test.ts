import { db } from '@delta-comic/db'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { PluginRuntime } from './PluginRuntime'

const user = {
  uid: 7,
  username: 'tester',
  fname: 'Tester',
  photo: 'nopic.gif',
  jwttoken: 'token',
  s: 'avs',
} as never

const query = db as unknown as {
  deleteFrom: ReturnType<typeof vi.fn>
  executeTakeFirst: ReturnType<typeof vi.fn>
  replaceInto: ReturnType<typeof vi.fn>
  values: ReturnType<typeof vi.fn>
}

afterEach(() => vi.restoreAllMocks())

describe('PluginRuntime', () => {
  test('restores only valid password-free sessions and clears corrupted storage', async () => {
    const runtime = new PluginRuntime()
    query.executeTakeFirst
      .mockResolvedValueOnce({
        value: JSON.stringify({ username: 'tester', token: 'token', user }),
      })
      .mockResolvedValueOnce({ value: '{broken' })
      .mockResolvedValueOnce({ value: JSON.stringify({ token: 'missing-username' }) })
      .mockResolvedValueOnce({ value: JSON.stringify({ username: 'tester', token: 7 }) })
    await expect(runtime.restoreSession()).resolves.toMatchObject({ username: 'tester' })
    expect(runtime.jm.auth.session?.user).toEqual(user)
    await expect(runtime.restoreSession()).resolves.toBeUndefined()
    await expect(runtime.restoreSession()).resolves.toBeUndefined()
    await expect(runtime.restoreSession()).resolves.toBeUndefined()
    expect(query.deleteFrom).toHaveBeenCalledWith('nativeStore')
  })

  test('persists login state, validates it, and clears expired tokens', async () => {
    const runtime = new PluginRuntime()
    await expect(runtime.validateSession()).resolves.toBeUndefined()
    vi.spyOn(runtime.jm.requester, 'request').mockResolvedValue(user)
    await expect(runtime.login({ username: 'tester', password: 'secret' })).resolves.toMatchObject({
      username: 'tester',
    })
    expect(query.replaceInto).toHaveBeenCalledWith('nativeStore')
    expect(query.values).toHaveBeenCalledWith(
      expect.objectContaining({ value: expect.not.stringContaining('secret') }),
    )

    runtime.jm.auth.restoreSession({ username: 'tester', token: 'token', user })
    vi.spyOn(runtime.jm.user, 'getUser').mockResolvedValue({} as never)
    await expect(runtime.validateSession()).resolves.toMatchObject({ username: 'tester' })
    vi.mocked(runtime.jm.user.getUser).mockRejectedValueOnce(new Error('expired'))
    await expect(runtime.validateSession()).resolves.toBeUndefined()
    expect(runtime.jm.auth.session).toBeUndefined()
  })

  test('preloads navigation, probes exact request headers, and resets abort state', async () => {
    const runtime = new PluginRuntime()
    const categories = { categories: [], blocks: [] }
    const promotes = [{ id: 1 }]
    const weekBest = { categories: [], type: [] }
    vi.spyOn(runtime.jm.promote, 'getCategories').mockResolvedValue(categories as never)
    vi.spyOn(runtime.jm.promote, 'getPromotes').mockResolvedValue(promotes as never)
    vi.spyOn(runtime.jm.promote, 'getWeekBestCate').mockResolvedValue(weekBest)
    await runtime.preload()
    expect(runtime.categories).toBe(categories)
    expect(runtime.promotes).toBe(promotes)
    expect(runtime.weekBest).toBe(weekBest)

    const text = vi.fn().mockResolvedValue('ok')
    const get = vi.fn().mockReturnValue({ text })
    vi.spyOn(runtime.jm.requester, 'create').mockReturnValue({ get } as never)
    const signal = new AbortController().signal
    await runtime.testFork('https://api.test', signal)
    expect(runtime.jm.requester.create).toHaveBeenCalledWith({
      baseUrl: 'https://api.test',
      retry: 0,
      timeout: 8000,
    })

    runtime.shutdown()
    expect(runtime.signal.aborted).toBe(true)
    runtime.start('https://api.test')
    expect(runtime.signal.aborted).toBe(false)
    expect(runtime.jm.config.requestUsingFork).toBe('https://api.test')
  })

  test('does not write empty sessions and removes all owned state on uninstall', async () => {
    const runtime = new PluginRuntime()
    query.replaceInto.mockClear()
    await runtime.persistSession()
    expect(query.replaceInto).not.toHaveBeenCalled()
    const clear = vi.spyOn(runtime, 'clearSession').mockResolvedValue(undefined)
    await runtime.uninstall()
    expect(runtime.signal.aborted).toBe(true)
    expect(clear).toHaveBeenCalledOnce()
  })
})