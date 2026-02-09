import { uni, Utils } from 'delta-comic-core'

import { jmStore } from '@/store'
import { pluginName } from '@/symbol'

import type { jm as JmType } from '..'
import type { _jmUser } from '../user'

import { createCommonToUniItem, jmStream } from './utils'

export namespace _jmApiUser {
  const { PromiseContent } = Utils.data
  export const createFavouriteStream = () =>
    jmStream(async (page, signal) => {
      const { list, total } = await jmStore.api.value!.get<{
        list: JmType.comic.RawCommonComic[]
        folder_list: { FID: string; UID: string; name: string }[]
        total: string
        count: number
      }>('/favorite', { params: { page, folder_id: 0, o: 'mr' }, signal })
      return { list: list.map(createCommonToUniItem), total: Number(total) }
    })

  export const favouriteComic = PromiseContent.fromAsyncFunction(
    (id: string, signal?: AbortSignal) =>
      jmStore.api.value!.postForm('/favorite', { aid: id }, { signal })
  )

  export const dailyCheck = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => {
    const user = jmStore.user.value
    const dailyInfo = await jmStore.api.value!.get<{ daily_id: number }>(
      `/daily?user_id=${user?.id}`,
      { signal }
    )
    try {
      await jmStore.api.value!.postForm(
        `/daily_chk`,
        { user_id: user?.id, daily_id: dailyInfo.daily_id },
        { signal }
      )
    } catch (err) {
      console.log('api daily check', err)
    }
  })

  //useredit
  export const getUser = PromiseContent.fromAsyncFunction(
    (uid: number | string, signal?: AbortSignal) =>
      jmStore.api.value!.get<_jmUser.UserEdit>(`/useredit/${uid}`, { signal })
  )

  export const setUser = PromiseContent.fromAsyncFunction(
    (uid: number | string, user: _jmUser.UserEdit, signal?: AbortSignal) =>
      jmStore.api.value!.postForm(`/useredit/${uid}`, user, { signal })
  )
}

export namespace _jmApiUser.badge {
  const { PromiseContent } = Utils.data
  export const buy = PromiseContent.fromAsyncFunction(
    (badgeId: number | string, signal?: AbortSignal) => {
      const user = uni.user.User.userBase.get(pluginName)
      if (!user) throw new Error('not login')
      return jmStore.api.value!.postForm('/coin', { uid: user.id, task_id: badgeId }, { signal })
    }
  )
  export const getMy = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => {
    const user = uni.user.User.userBase.get(pluginName)
    if (!user) throw new Error('not login')
    const my = await jmStore.api.value!.get<{ list: _jmUser.BadgeItem[] }>('/tasks', {
      params: { type: 'badge', filter: 'my', uid: user.id },
      signal
    })
    return my.list
  })
  export const getAll = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => {
    const all = await jmStore.api.value!.get<{ list: _jmUser.BadgeItem[] }>('/tasks', {
      params: { type: 'badge', filter: 'all' },
      signal
    })
    return all.list
  })
  export const changeOrder = PromiseContent.fromAsyncFunction(
    async (idList: string[], signal?: AbortSignal) => {
      const user = uni.user.User.userBase.get(pluginName)
      if (!user) throw new Error('not login')
      const result = await jmStore.api.value!.postForm(
        '/tasks',
        { type: 'badge', uid: user.id, new_sort_ids: idList.join(','), task_id: 0 },
        { signal }
      )
      return result
    }
  )
}

export namespace _jmApiUser.title {
  const { PromiseContent } = Utils.data
  export const getAll = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => {
    const all = await jmStore.api.value!.get<{ list: _jmUser.TitleItem[] }>('/tasks', {
      params: { type: 'title', filter: 'all' },
      signal
    })
    return all.list
  })
  export const set = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => {
    const user = uni.user.User.userBase.get(pluginName)
    if (!user) throw new Error('not login')
    const result = await jmStore.api.value!.postForm(
      '/tasks',
      { type: 'title', uid: user.id, task_id: id },
      { signal }
    )
    return result
  })
}