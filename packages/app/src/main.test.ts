import { UniUser } from '@delta-comic/model'
import { SharedFunction } from '@delta-comic/utils'
import type { LoginUser, UserMe } from 'jmcomic-sdk'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { contentKeys, pluginName, searchKeys } from '@/constants'
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
const model = jmcomicPluginConfig.model!
const content = model.content!
const user = model.user!
const remotes = model.remotes!
const resource = remotes.find(remote => remote.type === 'resource')!
const special = model.special!
const hooks = jmcomicPluginConfig.hooks!

afterEach(() => {
  vi.restoreAllMocks()
  runtime.jm.auth.clearSession()
  UniUser.userBase.delete(pluginName)
})

describe('plugin registration', () => {
  test('publishes declarative content models through the layout plugin', () => {
    expect(content.models!.map(model => model.name).toSorted()).toEqual(
      Object.values(contentKeys).toSorted(),
    )
    expect(content.search!.methods.map(method => method.id).toSorted()).toEqual(
      Object.values(searchKeys).toSorted(),
    )
    expect(content.models![0]?.Layout).toMatchObject({ name: 'LayoutDefault' })
    expect(model.social!.subscribe).toBeDefined()
    expect(model.expose!.jm).toBe(runtime.jm)
  })

  test('declares an API remote with an auto-select trigger', async () => {
    expect(remotes).toHaveLength(2)
    expect(remotes[0]!.type).toBe('remote')
    expect(remotes[0]).toMatchObject({
      name: 'jmcomic.remotes.api',
      remotes: [{ name: 'jmcomic.remotes.autoSelect', url: 'auto' }],
    })
    expect(resource.type).toBe('resource')
    expect(resource.name).toBe('jmcomic.remotes.images')
    vi.spyOn(runtime.jm.fork, 'getForks').mockResolvedValue({
      Setting: [],
      Server: ['https://cdn-msp.jmapinodeudzn.net'],
      jm3_Server: [],
    })
    const resourceRemotes =
      typeof resource.remotes === 'function'
        ? await resource.remotes(new AbortController().signal)
        : resource.remotes
    expect(resourceRemotes).toContainEqual({
      name: 'https://cdn-msp.jmapinodeudzn.net',
      url: 'https://cdn-msp.jmapinodeudzn.net',
    })
  })

  test('runs auto fork selection when the API remote is tested', async () => {
    const selectFork = vi
      .spyOn(runtime.jm.fork, 'autoPickFork')
      .mockResolvedValue('https://api.test')
    const signal = new AbortController().signal

    await remotes[0]!.test('auto', signal)

    expect(selectFork).toHaveBeenCalledWith(undefined, signal)
  })

  test('restores a session or asks for the selected login form', async () => {
    vi.spyOn(runtime, 'restoreSession').mockImplementation(async () => {
      runtime.jm.auth.restoreSession({ username: 'tester', token: 'token', user: testUser })
      return runtime.jm.auth.session
    })
    await expect(user.auth.default()).resolves.toBe('login')
    expect(UniUser.userBase.get(pluginName)?.id).toBe('1')

    vi.spyOn(runtime, 'login').mockResolvedValue(login)
    const form = vi.fn().mockResolvedValue({ username: 'tester', password: 'secret' })
    const loginSelection = user.auth.selections.find(selection => selection.id === 'login')!
    await loginSelection.call({ form } as never)
    expect(form).toHaveBeenCalledOnce()
    expect(runtime.login).toHaveBeenCalledWith({ username: 'tester', password: 'secret' })
  })

  test('signs up through the explicit authentication selection', async () => {
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
    const selection = user.auth.selections.find(item => item.id === 'signup')!
    await selection.call({ form } as never)
    expect(runtime.jm.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ gender: 'Male' }),
      runtime.signal,
    )
  })

  test('processes image resources and probes image forks', async () => {
    vi.spyOn(runtime.jm.image, 'decryptImage').mockResolvedValue({ url: 'blob:decoded' })
    const process = resource.processors![0]!.call
    await expect(
      process('/page.webp', { $$plugin: pluginName, $$meta: { comicId: '42', page: 3 } } as never),
    ).resolves.toEqual(['blob:decoded', true])
    await expect(process('/plain.webp', { $$plugin: pluginName } as never)).resolves.toEqual([
      '/plain.webp',
      false,
    ])

    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    vi.stubGlobal('fetch', fetch)
    const signal = new AbortController().signal
    await resource.test('https://image.test', signal)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/media/photos/'), {
      method: 'HEAD',
      signal,
    })
    fetch.mockResolvedValueOnce(new Response(null, { status: 503 }))
    await expect(resource.test('https://image.test', signal)).rejects.toThrow('503')
  })

  test('provides random, hot-search, ranking and latest content', async () => {
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
    await expect(content.promotes!.fetchRandomItems!(signal)).resolves.toHaveLength(1)
    await expect(content.search!.getHotSearch(signal)).resolves.toEqual([
      { input: 'tag', search: { method: searchKeys.keyword } },
    ])
    await expect(
      content.promotes!.hotPageContent!.levelboard![0]!.content(signal),
    ).resolves.toHaveLength(1)
    await expect(
      content.promotes!.hotPageContent!.levelboard![1]!.content(signal),
    ).resolves.toHaveLength(1)
  })

  test('preloads categories and treats repeated check-ins as non-fatal', async () => {
    const describe = vi.fn()
    expect(special.map(step => step.name)).toEqual([
      'jmcomic.progress.checkIn',
      'jmcomic.progress.preload',
    ])

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
    vi.spyOn(runtime, 'preload').mockResolvedValue(undefined)
    await special[1]!.call(describe)
    expect(runtime.preload).toHaveBeenCalledOnce()
    expect(content.promotes!.categories).toMatchObject([
      { namespace: 'main' },
      { namespace: 'sub' },
    ])

    runtime.jm.auth.restoreSession({ username: 'tester', token: 'token', user: testUser })
    const daily = vi.spyOn(runtime.jm.user, 'dailyCheck').mockRejectedValue(new Error('checked'))
    await expect(special[0]!.call(describe)).resolves.toBeUndefined()
    expect(daily).toHaveBeenCalledOnce()
  })

  test('synchronizes only comic favourites and exposes author search', async () => {
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
    const signal = new AbortController().signal
    const favourites = user.favourites
    await expect(favourites.download(signal)).resolves.toMatchObject([{ id: '1' }])

    const favorite = vi.spyOn(runtime.jm.comic, 'favorite').mockResolvedValue({ status: 'ok' })
    await favourites.upload(
      [
        { $$plugin: pluginName, id: '1', contentType: [pluginName, contentKeys.comic] } as never,
        { $$plugin: pluginName, id: '2', contentType: [pluginName, contentKeys.blog] } as never,
      ],
      signal,
    )
    expect(favorite).toHaveBeenCalledOnce()

    await user.userActions![0]!.call({ label: 'Author' } as never)
    expect(SharedFunction.call).toHaveBeenCalledWith('routeToSearch', 'Author', [
      pluginName,
      searchKeys.keyword,
    ])
  })

  test('routes barcode matches and cleans state during lifecycle hooks', async () => {
    hooks.onSearchBarcodeSubmit!({ input: 'JM350234', search: { method: searchKeys.keyword } })
    expect(SharedFunction.call).toHaveBeenCalledWith(
      'routeToContent',
      [pluginName, contentKeys.comic],
      '350234',
      '',
    )

    const shutdown = vi.spyOn(runtime, 'shutdown').mockImplementation(() => undefined)
    hooks.onUnload!()
    expect(shutdown).toHaveBeenCalledOnce()
    const uninstall = vi.spyOn(runtime, 'uninstall').mockResolvedValue(undefined)
    await hooks.onUninstall!()
    expect(uninstall).toHaveBeenCalledOnce()
  })
})