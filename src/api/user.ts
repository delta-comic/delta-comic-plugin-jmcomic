import type { RawCommonComic } from '@/model/comic'
import type { UserEdit } from '@/model/user'
import { jmStore } from '@/store'

import { createCommonToUniItem, toStreamQuery } from './utils'

export const createFavouriteStream = () =>
  toStreamQuery(async (page, signal) => {
    const { list, total } = await jmStore.api.value!.get<{
      list: RawCommonComic[]
      folder_list: { FID: string; UID: string; name: string }[]
      total: string
      count: number
    }>('/favorite', { params: { page, folder_id: 0, o: 'mr' }, signal })
    return { list: list.map(createCommonToUniItem), total: Number(total) }
  })

export const favouriteComic = (id: string, signal?: AbortSignal) =>
  jmStore.api.value!.postForm('/favorite', { aid: id }, { signal })

export const dailyCheck = async (signal?: AbortSignal) => {
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
}

//useredit
export const getUser = (uid: number | string, signal?: AbortSignal) =>
  jmStore.api.value!.get<UserEdit>(`/useredit/${uid}`, { signal })

export const setUser = (uid: number | string, user: UserEdit, signal?: AbortSignal) =>
  jmStore.api.value!.postForm(`/useredit/${uid}`, user, { signal })