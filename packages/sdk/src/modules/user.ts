import type { BadgeItem, JMComic, TitleItem, UserEdit } from '..'
import { jsonToFormData } from '../helpers'

export class User {
  constructor(protected sdk: JMComic) {}
  public async dailyCheck(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const uid = this.sdk.auth.user?.user.uid
    if (!uid) throw new Error('You not login any account.')
    const dailyInfo = await ky
      .get<{ daily_id: number }>(this.sdk.config.apiPath.user_daily, {
        searchParams: { user_id: uid },
        signal
      })
      .json()
    try {
      await ky.post(this.sdk.config.apiPath.user_dailyCheck, {
        body: jsonToFormData({ user_id: uid, daily_id: dailyInfo.daily_id }),
        signal
      })
    } catch (err) {
      console.log('api daily check', err)
    }
  }

  public getUser(data: { uid: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return ky.get<UserEdit>(data.uid, { prefix: this.sdk.config.apiPath.user_edit, signal }).json()
  }

  public setUser(data: { uid: string; user: UserEdit }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return ky
      .get<UserEdit>(data.uid, {
        body: jsonToFormData(data.user),
        prefix: this.sdk.config.apiPath.user_edit,
        signal
      })
      .json()
  }

  public buyBadge = (data: { badgeId: number | string }, signal?: AbortSignal) => {
    const ky = this.sdk.requester.create()
    const uid = this.sdk.auth.user?.user.uid
    if (!uid) throw new Error('You not login any account.')

    return ky
      .post(this.sdk.config.apiPath.user_buyBadge, {
        body: jsonToFormData({ uid, task_id: data.badgeId }),
        signal
      })
      .json()
  }

  public async getMyBadges(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const uid = this.sdk.auth.user?.user.uid
    if (!uid) throw new Error('You not login any account.')

    const my = await ky
      .get<{ list: BadgeItem[] }>(this.sdk.config.apiPath.user_task, {
        searchParams: { type: 'badge', filter: 'my', uid },
        signal
      })
      .json()
    return my.list
  }

  public getAllBadges = async (signal?: AbortSignal) => {
    const ky = this.sdk.requester.create()
    const all = await ky
      .get<{ list?: BadgeItem[] }>(this.sdk.config.apiPath.user_task, {
        searchParams: { type: 'badge', filter: 'all' },
        signal
      })
      .json()

    if (!all.list) throw new Error('You not login any account.')
    return all.list
  }

  public async changeBadgesOrder(data: { idList: string[] }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const uid = this.sdk.auth.user?.user.uid
    if (!uid) throw new Error('You not login any account.')

    const result = await ky
      .post(this.sdk.config.apiPath.user_task, {
        body: jsonToFormData({
          type: 'badge',
          uid,
          new_sort_ids: data.idList.join(','),
          task_id: 0
        }),
        signal
      })
      .json()
    return result
  }

  public async getAllTitles(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()

    const all = await ky
      .get<{ list: TitleItem[] }>(this.sdk.config.apiPath.user_task, {
        searchParams: { type: 'title', filter: 'all' },
        signal
      })
      .json()
    return all.list
  }

  public async setTitles(data: { id: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const uid = this.sdk.auth.user?.user.uid
    if (!uid) throw new Error('You not login any account.')

    const result = await ky
      .post(this.sdk.config.apiPath.user_task, {
        body: jsonToFormData({ type: 'title', uid, task_id: data.id }),
        signal
      })
      .json()
    return result
  }
}