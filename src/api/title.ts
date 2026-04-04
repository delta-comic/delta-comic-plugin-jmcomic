import { uni } from '@delta-comic/model'

import type { TitleItem } from '@/model/user'
import { jmStore } from '@/store'
import { pluginName } from '@/symbol'

export const getAllTitles = async (signal?: AbortSignal) => {
  const all = await jmStore.api.value!.get<{ list: TitleItem[] }>('/tasks', {
    params: { type: 'title', filter: 'all' },
    signal
  })
  return all.list
}
export const setTitles = async (id: string, signal?: AbortSignal) => {
  const user = uni.user.User.userBase.get(pluginName)
  if (!user) throw new Error('not login')
  const result = await jmStore.api.value!.postForm(
    '/tasks',
    { type: 'title', uid: user.id, task_id: id },
    { signal }
  )
  return result
}