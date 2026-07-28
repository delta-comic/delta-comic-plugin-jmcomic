import { describe, expect, test, vi } from 'vitest'

import { JmApiError, JMComic } from '../src'
import { createAbortError, isAbortError, jsonToFormData } from '../src/helpers'

const user = { uid: 7, username: 'tester', fname: 'Tester', jwttoken: 'token', s: 'avs' } as never

describe('request module contracts', () => {
  test('serializes forms and detects both abort error implementations', () => {
    const form = jsonToFormData({ count: 2, nested: { ok: true }, omitted: undefined })
    expect(Object.fromEntries(form)).toEqual({ count: '2', nested: '{"ok":true}' })
    expect(isAbortError(createAbortError())).toBe(true)
    expect(isAbortError(Object.assign(new Error('cancelled'), { name: 'AbortError' }))).toBe(true)
    expect(isAbortError(new Error('failed'))).toBe(false)
  })

  test('keeps authentication state and clears it even when remote logout fails', async () => {
    const sdk = new JMComic({ session: { username: 'saved', token: 'old' } })
    const request = vi.spyOn(sdk.requester, 'request').mockResolvedValue(user)
    const text = vi.fn().mockResolvedValue('ok')
    const post = vi.fn().mockReturnValue({ text })
    vi.spyOn(sdk.requester, 'create').mockReturnValue({ post } as never)

    const login = await sdk.auth.login({ username: 'tester', password: 'secret' })
    expect(login.user).toBe(user)
    expect(sdk.auth.session).toMatchObject({ username: 'tester', token: 'token', avs: 'avs' })
    expect(request).toHaveBeenCalledWith('post', '/login', expect.anything(), expect.anything())
    await expect(
      sdk.auth.signUp({
        email: 'test@example.invalid',
        gender: 'Male',
        password: 'secret',
        password_confirm: 'secret',
        username: 'tester',
      }),
    ).resolves.toBe('ok')
    request.mockResolvedValue({ message: 'sent' })
    await expect(sdk.auth.forgetPassword({ email: 'test@example.invalid' })).resolves.toEqual({
      message: 'sent',
    })

    post.mockReturnValueOnce({ text: vi.fn().mockRejectedValue(new Error('offline')) })
    await expect(sdk.auth.logout()).rejects.toThrow('offline')
    expect(sdk.auth.session).toBeUndefined()
    await expect(sdk.auth.logout()).resolves.toBeUndefined()
  })

  test('covers authenticated user reads and mutations without changing remote account data', async () => {
    const sdk = new JMComic()
    expect(() => sdk.user.getHistory({ page: 1 })).toThrow(JmApiError)
    sdk.auth.restoreSession({ username: 'tester', token: 'token', user })

    const request = vi.spyOn(sdk.requester, 'request')
    const text = vi.fn().mockResolvedValue('ok')
    vi.spyOn(sdk.requester, 'create').mockReturnValue({
      post: vi.fn().mockReturnValue({ text }),
    } as never)

    request.mockResolvedValueOnce({ daily_id: 9 })
    await sdk.user.dailyCheck()
    expect(text).toHaveBeenCalledOnce()

    request
      .mockResolvedValueOnce({ nickName: 'Tester' })
      .mockResolvedValueOnce({ nickName: 'Updated' })
      .mockResolvedValueOnce({ status: 'ok' })
      .mockResolvedValueOnce({ list: [{ id: 1 }] })
      .mockResolvedValueOnce({ list: [{ id: 2 }] })
      .mockResolvedValueOnce({ status: 'ok' })
      .mockResolvedValueOnce({ list: [{ id: 'title' }] })
      .mockResolvedValueOnce({ status: 'ok' })
      .mockResolvedValueOnce({ total: 0, list: [] })
      .mockResolvedValueOnce({ total: 0, list: [] })
      .mockResolvedValueOnce({ status: 'ok' })
      .mockResolvedValueOnce({ status: 'ok' })

    await sdk.user.getUser({ uid: 7 })
    await sdk.user.setUser({ uid: 7, user: { nickName: 'Updated' } as never })
    await sdk.user.buyBadge({ badgeId: 1 })
    await sdk.user.getMyBadges()
    await sdk.user.getAllBadges()
    await sdk.user.changeBadgesOrder({ idList: ['2', '1'] })
    await sdk.user.getAllTitles()
    await sdk.user.setTitles({ id: 'title' })
    await sdk.user.getFavoriteList({ page: 1 })
    await sdk.user.getHistory({ page: 1 })
    await sdk.user.removeHistory({ comicId: 1 })
    await sdk.user.getRemoveSingleHistory({ comicId: 2 })
    expect(request).toHaveBeenCalledTimes(13)
  })

  test('maps novel and content mutation methods to their real request contracts', async () => {
    const sdk = new JMComic()
    const request = vi.spyOn(sdk.requester, 'request').mockResolvedValue({ total: 0, list: [] })

    await sdk.novel.getPromoteList({ page: 1 })
    await sdk.novel.search({ keyword: 'author', page: 2 })
    await sdk.novel.getInfo({ id: '3' })
    await sdk.novel.getContent({ chapterId: 4, lang: 'cn' })
    await sdk.novel.like({ id: '3' })
    await sdk.novel.favorite({ id: 3 })
    await sdk.novel.getFavoriteList({ page: 2, folderId: 4, order: 'mr' })
    await sdk.novel.sendComment({
      novelId: 3,
      chapterId: 4,
      parentCommentId: 5,
      content: 'reply',
      isSpoiled: true,
    })
    await sdk.blog.like({ id: 5 })
    await sdk.blog.sendComment({ id: 5, parentCommentId: 6, content: 'reply' })
    await sdk.comic.like({ id: 7 })
    await sdk.comic.favorite({ id: 7 })
    await sdk.comic.sendComment({
      comicId: 7,
      parentCommentId: 8,
      content: 'reply',
      isSpoiled: false,
    })
    expect(request).toHaveBeenCalledTimes(13)
  })
})