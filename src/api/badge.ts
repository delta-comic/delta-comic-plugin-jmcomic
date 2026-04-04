import { uni } from '@delta-comic/model'

import type { BadgeItem } from '@/model/user'
import { jmStore } from '@/store'
import { pluginName } from '@/symbol'

export const buyBadge = (badgeId: number | string, signal?: AbortSignal) => {
  const user = uni.user.User.userBase.get(pluginName)
  if (!user) throw new Error('not login')
  return jmStore.api.value!.postForm('/coin', { uid: user.id, task_id: badgeId }, { signal })
}

export const getMyBadges = async (signal?: AbortSignal) => {
  const user = uni.user.User.userBase.get(pluginName)
  if (!user) throw new Error('not login')
  const my = await jmStore.api.value!.get<{ list: BadgeItem[] }>('/tasks', {
    params: { type: 'badge', filter: 'my', uid: user.id },
    signal
  })
  return my.list
}
export const getAllBadges = async (signal?: AbortSignal) => {
  const all = await jmStore.api.value!.get<{ list: BadgeItem[] }>('/tasks', {
    params: { type: 'badge', filter: 'all' },
    signal
  })
  return all.list
}
export const changeBadgesOrder = async (idList: string[], signal?: AbortSignal) => {
  const user = uni.user.User.userBase.get(pluginName)
  if (!user) throw new Error('not login')
  const result = await jmStore.api.value!.postForm(
    '/tasks',
    { type: 'badge', uid: user.id, new_sort_ids: idList.join(','), task_id: 0 },
    { signal }
  )
  return result
}