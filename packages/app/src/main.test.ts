import { UniUser } from '@delta-comic/model'
import { Global } from '@delta-comic/plugin'
import { SharedFunction } from '@delta-comic/utils'
import type { LoginUser, UserMe } from 'jmcomic-sdk'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { contentKeys, pluginName, searchKeys, subscribeKeys } from '@/constants'
import { jmcomicPluginConfig } from '@/main'
import { runtime } from '@/runtime/PluginRuntime'

const testUser = {
  uid: 1,
  username: 'tester',
  fname: 'Tester',
  photo: 'nopic.gif',
  jwttoken: 'token',
  s: 'avs',
} as UserMe
const login = { username: 'tester', user: testUser } satisfies LoginUser

afterEach(() => {
  vi.restoreAllMocks()
  runtime.jm.auth.clearSession()
  UniUser.userBase.delete(pluginName)
})

describe('plugin registration', () => {
  test('publishes only the stable v3 keys', () => {
    expect(Object.keys(jmcomicPluginConfig.content ?? {}).toSorted()).toEqual(
      Object.values(contentKeys).toSorted(),
    )
    expect(Object.keys(jmcomicPluginConfig.search?.methods ?? {}).toSorted()).toEqual(
      Object.values(searchKeys).toSorted(),
    )
    expect(Object.keys(jmcomicPluginConfig.subscribe ?? {}).toSorted()).toEqual(
      Object.values(subscribeKeys).toSorted(),
    )
  })

  test('restores a token session without asking for a password', async () => {
    vi.spyOn(runtime, 'restoreSession').mockImplementation(async () => {
      runtime.jm.auth.restoreSession({ username: 'tester', token: 'token', user: testUser })
      return runtime.jm.auth.session
    })
    await expect(jmcomicPluginConfig.auth!.passSelect()).resolves.toBe('logIn')
  })

  test('requires login selection when no restorable token exists', async () => {
    vi.spyOn(runtime, 'restoreSession').mockResolvedValue(undefined)
    await expect(jmcomicPluginConfig.auth!.passSelect()).resolves.toBe(false)
  })

  test('asks for credentials only when session validation fails', async () => {
    vi.spyOn(runtime, 'validateSession').mockResolvedValue(undefined)
    vi.spyOn(runtime, 'login').mockResolvedValue(login)
    const form = vi.fn().mockResolvedValue({ username: 'tester', password: 'secret' })
    await jmcomicPluginConfig.auth!.logIn({ form } as never)
    expect(form).toHaveBeenCalledOnce()
    expect(runtime.login).toHaveBeenCalledWith({ username: 'tester', password: 'secret' })
    expect(UniUser.userBase.get(pluginName)?.id).toBe('1')
  })

  test('exposes the SDK after boot and cleans plugin-owned state on unload', async () => {
    vi.spyOn(runtime, 'start').mockImplementation(() => undefined)
    vi.spyOn(runtime, 'restoreSession').mockResolvedValue(undefined)
    const shutdown = vi.spyOn(runtime, 'shutdown').mockImplementation(() => undefined)
    const remove = vi.spyOn(Global, 'removeOwnedRegistrations').mockImplementation(() => undefined)
    await expect(
      jmcomicPluginConfig.onBooted!({ api: { api: 'https://api.test' } }),
    ).resolves.toEqual({ jm: runtime.jm })
    expect(runtime.start).toHaveBeenCalledWith('https://api.test')
    await jmcomicPluginConfig.onUnload!()
    expect(shutdown).toHaveBeenCalledOnce()
    expect(remove).toHaveBeenCalledWith(pluginName)
  })

  test('resource processing delegates comic metadata to the injected decoder', async () => {
    vi.spyOn(runtime.jm.image, 'decryptImage').mockResolvedValue({ url: 'blob:decoded' })
    const process = jmcomicPluginConfig.resource!.process!.comicDecode
    await expect(
      process('/page.webp', { $$plugin: pluginName, $$meta: { comicId: '42', page: 3 } } as never),
    ).resolves.toEqual(['blob:decoded', true])
    expect(runtime.jm.image.decryptImage).toHaveBeenCalledWith(
      '/page.webp',
      '42',
      3,
      runtime.signal,
    )
    await expect(process('/plain.webp', { $$plugin: pluginName } as never)).resolves.toEqual([
      '/plain.webp',
      false,
    ])
  })

  test('discovers API forks, probes endpoints, and validates image resources', async () => {
    vi.spyOn(runtime.jm.fork, 'getForks').mockResolvedValue({
      Setting: ['api.test', 'https://api2.test'],
      Server: [],
      jm3_Server: [],
    })
    await expect(jmcomicPluginConfig.api!.api!.forks()).resolves.toEqual([
      'https://api.test',
      'https://api2.test',
    ])
    const testFork = vi.spyOn(runtime, 'testFork').mockResolvedValue(undefined)
    const signal = new AbortController().signal
    await jmcomicPluginConfig.api!.api!.test('https://api.test', signal)
    expect(testFork).toHaveBeenCalledWith('https://api.test', signal)

    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetch)
    await jmcomicPluginConfig.resource!.types![0]!.test('https://image.test', signal)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/media/photos/'), {
      method: 'HEAD',
      signal,
    })
    fetch.mockResolvedValueOnce(new Response(null, { status: 503 }))
    await expect(
      jmcomicPluginConfig.resource!.types![0]!.test('https://image.test', signal),
    ).rejects.toThrow('503')
  })

  test('provides random, tags, boards and latest content from the SDK', async () => {
    const comic = {
      id: 1,
      name: 'Comic',
      author: 'Author',
      image: '/comic.jpg',
      category: { id: '1', title: 'Main' },
      category_sub: { id: '2', title: 'Sub' },
      is_favorite: false,
      liked: false,
    } as never
    vi.spyOn(runtime.jm.promote, 'getRandomProvide').mockResolvedValue([comic])
    vi.spyOn(runtime.jm.promote, 'getHotTags').mockResolvedValue(['tag'])
    vi.spyOn(runtime.jm.promote, 'getLatest').mockResolvedValue([comic])
    vi.spyOn(runtime.jm.comic, 'searchByKeyword').mockResolvedValue({ total: 1, list: [comic] })
    const signal = new AbortController().signal
    await expect(jmcomicPluginConfig.search!.fetchRandomItems!(signal)).resolves.toHaveLength(1)
    await expect(jmcomicPluginConfig.search!.hotSearch![0]!.fetchItems(signal)).resolves.toEqual([
      { text: 'tag' },
    ])
    await expect(
      jmcomicPluginConfig.search!.hotPage!.levelBoard![0]!.content(signal),
    ).resolves.toHaveLength(1)
    await expect(
      jmcomicPluginConfig.search!.hotPage!.mainListCard![0]!.content(signal),
    ).resolves.toHaveLength(1)
  })

  test('registers preloaded navigation and runs optional check-in safely', async () => {
    runtime.categories = {
      blocks: [],
      categories: [
        {
          id: '1',
          name: 'Main',
          slug: 'main',
          total_albums: '1',
          type: '',
          sub_categories: [{ id: '2', name: 'Sub', slug: 'sub' }],
        },
      ],
    }
    runtime.promotes = [
      { id: 1, title: 'Promote', slug: '', type: 'comic', filter_val: '', content: [] },
    ]
    runtime.weekBest = { categories: [], type: [] }
    vi.spyOn(runtime, 'preload').mockResolvedValue(undefined)
    const describe = vi.fn()
    await jmcomicPluginConfig.otherProgress![1]!.call(describe)
    expect(Global.addCategories).toHaveBeenCalledWith(
      pluginName,
      expect.objectContaining({ namespace: 'main' }),
      expect.objectContaining({ namespace: 'sub' }),
    )
    expect(Global.addTabbar).toHaveBeenCalledWith(
      pluginName,
      expect.objectContaining({ id: '1' }),
      expect.objectContaining({ id: 'week-best' }),
    )

    await expect(jmcomicPluginConfig.otherProgress![0]!.call(describe)).resolves.toBeUndefined()
    runtime.jm.auth.restoreSession({ username: 'tester', token: 'token', user: testUser })
    const daily = vi
      .spyOn(runtime.jm.user, 'dailyCheck')
      .mockRejectedValueOnce(new Error('already checked'))
      .mockResolvedValueOnce(undefined)
    await expect(jmcomicPluginConfig.otherProgress![0]!.call(describe)).resolves.toBeUndefined()
    await expect(jmcomicPluginConfig.otherProgress![0]!.call(describe)).resolves.toBeUndefined()
    expect(daily).toHaveBeenCalledTimes(2)
    expect(describe).toHaveBeenCalledWith('jmcomic.progress.checkIn')
    expect(describe).toHaveBeenCalledWith('jmcomic.progress.checkInDone')
  })

  test('signs up explicitly, synchronizes only comic favorites, and exposes user actions', async () => {
    const form = vi
      .fn()
      .mockResolvedValue({
        username: 'tester',
        email: 'test@example.invalid',
        password: 'secret',
        password_confirm: 'secret',
        gender: 'Male',
      })
    vi.spyOn(runtime.jm.auth, 'signUp').mockResolvedValue('ok')
    vi.spyOn(runtime, 'login').mockResolvedValue(login)
    await jmcomicPluginConfig.auth!.signUp({ form } as never)
    expect(runtime.jm.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ gender: 'Male' }),
      runtime.signal,
    )

    const comic = {
      id: 1,
      name: 'Comic',
      author: 'Author',
      image: '/comic.jpg',
      category: { id: '1', title: 'Main' },
      category_sub: { id: '2', title: 'Sub' },
      is_favorite: true,
      liked: false,
    } as never
    vi.spyOn(runtime.jm.user, 'getFavoriteList').mockResolvedValue({ total: 1, list: [comic] })
    const sync = jmcomicPluginConfig.user!.syncFavourite!
    await expect(sync.download()).resolves.toMatchObject([{ id: '1' }])
    const favorite = vi.spyOn(runtime.jm.comic, 'favorite').mockResolvedValue({ status: 'ok' })
    await sync.upload([
      { $$plugin: pluginName, id: '1', contentType: [pluginName, contentKeys.comic] } as never,
      { $$plugin: pluginName, id: '2', contentType: [pluginName, contentKeys.blog] } as never,
    ])
    expect(favorite).toHaveBeenCalledOnce()

    const searchAction = jmcomicPluginConfig.user!.userActions!.search!
    await searchAction.call({ label: 'Author' } as never)
    expect(SharedFunction.call).toHaveBeenCalledWith('routeToSearch', 'Author', [
      pluginName,
      searchKeys.keyword,
    ])
    const statistics = jmcomicPluginConfig.user!.userActionPages![0]!.items.filter(
      item => item.type === 'statistic',
    )
    expect(
      statistics.map(item => (typeof item.value === 'function' ? item.value() : item.value)),
    ).toEqual([0, ''])
  })

  test('uninstall removes registrations and persisted state', async () => {
    const uninstall = vi.spyOn(runtime, 'uninstall').mockResolvedValue(undefined)
    await jmcomicPluginConfig.onUninstall!()
    expect(uninstall).toHaveBeenCalledOnce()
    expect(Global.removeOwnedRegistrations).toHaveBeenCalledWith(pluginName)
  })
})