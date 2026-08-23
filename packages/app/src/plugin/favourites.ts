import { type UniItem, type UniItemRaw } from '@delta-comic/model'

import { contentKeys, pluginName } from '@/constants'
import { fromCommonComic } from '@/models/items'
import { runtime } from '@/runtime/PluginRuntime'

export const downloadFavorites = async (signal: AbortSignal) => {
  const items: UniItem[] = []
  for (let page = 1; ; page += 1) {
    const result = await runtime.jm.user.getFavoriteList({ page }, signal)
    items.push(...result.list.map(fromCommonComic))
    if (result.list.length === 0 || items.length >= result.total) return items
  }
}

export const uploadFavorites = async (items: UniItemRaw[], signal: AbortSignal) => {
  await Promise.all(
    items
      .filter(item => {
        const type = item.contentType
        return Array.isArray(type) && type[0] === pluginName && type[1] === contentKeys.comic
      })
      .map(item => runtime.jm.comic.favorite({ id: item.id }, signal)),
  )
}