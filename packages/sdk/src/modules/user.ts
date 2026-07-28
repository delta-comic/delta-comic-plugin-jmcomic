import { z } from 'zod'

import type {
  BadgeItem,
  CommonComic,
  JMComic,
  MutationResult,
  Numeric,
  PageResult,
  PaginationQuery,
  TitleItem,
  UserEdit,
  UserMe,
} from '..'
import { jsonToFormData } from '../helpers'
import { sCommonComic } from '../model/comic'
import { sBadgeItem, sTitleItem, sUserEdit } from '../model/user'
import { sMutationResult, sNumeric } from '../model/utils'
import { JmApiError } from '../types'

const sDailyInfo = z.object({ daily_id: sNumeric })
const sTaskList = <T extends z.ZodType>(item: T) => z.object({ list: z.array(item) })
const sSavedComic = sCommonComic.extend({
  is_favorite: z.boolean().optional().default(true),
  liked: z.boolean().optional().default(false),
})
const sComicPage = z.object({
  list: z.array(sSavedComic),
  total: sNumeric.transform(Number),
  count: sNumeric.optional(),
  folder_list: z.array(z.unknown()).optional(),
})

export class User {
  public constructor(protected readonly sdk: JMComic) {}

  private requireUser(): UserMe {
    const user = this.sdk.auth.user?.user ?? this.sdk.auth.session?.user
    if (!user) throw new JmApiError('AUTH_REQUIRED', '该操作需要先登录')
    return user
  }

  public async dailyCheck(signal?: AbortSignal): Promise<void> {
    const uid = this.requireUser().uid
    const daily = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.user.daily,
      sDailyInfo,
      { searchParams: { user_id: uid }, signal },
    )
    await this.sdk.requester
      .create()
      .post(this.sdk.config.apiPath.user.dailyCheck, {
        body: jsonToFormData({ user_id: uid, daily_id: daily.daily_id }),
        signal,
      })
      .text()
  }

  public getUser(data: { uid: Numeric }, signal?: AbortSignal): Promise<UserEdit> {
    return this.sdk.requester.request(
      'get',
      `${this.sdk.config.apiPath.user.edit}/${data.uid}`,
      sUserEdit,
      { signal },
    )
  }

  public setUser(data: { uid: Numeric; user: UserEdit }, signal?: AbortSignal): Promise<UserEdit> {
    return this.sdk.requester.request(
      'post',
      `${this.sdk.config.apiPath.user.edit}/${data.uid}`,
      sUserEdit,
      { body: jsonToFormData(data.user), signal },
    )
  }

  public buyBadge(data: { badgeId: Numeric }, signal?: AbortSignal): Promise<MutationResult> {
    const uid = this.requireUser().uid
    return this.sdk.requester.request('post', this.sdk.config.apiPath.user.badge, sMutationResult, {
      body: jsonToFormData({ uid, task_id: data.badgeId }),
      signal,
    })
  }

  public async getMyBadges(signal?: AbortSignal): Promise<BadgeItem[]> {
    const uid = this.requireUser().uid
    const result = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.user.task,
      sTaskList(sBadgeItem),
      { searchParams: { type: 'badge', filter: 'my', uid }, signal },
    )
    return result.list
  }

  public async getAllBadges(signal?: AbortSignal): Promise<BadgeItem[]> {
    const result = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.user.task,
      sTaskList(sBadgeItem),
      { searchParams: { type: 'badge', filter: 'all' }, signal },
    )
    return result.list
  }

  public changeBadgesOrder(
    data: { idList: string[] },
    signal?: AbortSignal,
  ): Promise<MutationResult> {
    const uid = this.requireUser().uid
    return this.sdk.requester.request('post', this.sdk.config.apiPath.user.task, sMutationResult, {
      body: jsonToFormData({ type: 'badge', uid, new_sort_ids: data.idList.join(','), task_id: 0 }),
      signal,
    })
  }

  public async getAllTitles(signal?: AbortSignal): Promise<TitleItem[]> {
    const result = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.user.task,
      sTaskList(sTitleItem),
      { searchParams: { type: 'title', filter: 'all' }, signal },
    )
    return result.list
  }

  public setTitles(data: { id: string }, signal?: AbortSignal): Promise<MutationResult> {
    const uid = this.requireUser().uid
    return this.sdk.requester.request('post', this.sdk.config.apiPath.user.task, sMutationResult, {
      body: jsonToFormData({ type: 'title', uid, task_id: data.id }),
      signal,
    })
  }

  public getFavoriteList(
    data: PaginationQuery<{ folderId?: Numeric; order?: string }>,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonComic>> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.forum.favorite, sComicPage, {
      searchParams: { page: data.page, folder_id: data.folderId ?? 0, o: data.order ?? 'mr' },
      signal,
    })
  }

  public getHistory(data: PaginationQuery, signal?: AbortSignal): Promise<PageResult<CommonComic>> {
    this.requireUser()
    return this.sdk.requester.request('get', this.sdk.config.apiPath.user.history, sComicPage, {
      searchParams: { page: data.page },
      signal,
    })
  }

  public removeHistory(data: { comicId: Numeric }, signal?: AbortSignal): Promise<MutationResult> {
    this.requireUser()
    return this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.user.history,
      sMutationResult,
      { body: jsonToFormData({ id: data.comicId }), signal },
    )
  }

  /** @deprecated 使用 removeHistory。 */
  public getRemoveSingleHistory(
    data: { comicId: Numeric },
    signal?: AbortSignal,
  ): Promise<MutationResult> {
    return this.removeHistory(data, signal)
  }
}