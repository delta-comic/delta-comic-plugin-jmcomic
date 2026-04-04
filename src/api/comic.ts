import { uni } from '@delta-comic/model'

import { jmStore } from '@/store'
import { pluginName } from '@/symbol'

import type { RawFullComic, RawLessComic } from '../model/comic'
import { Comment, type RawComment } from '../model/comment'
import { createFullToUniItem, toStreamQuery } from './utils'

export const getComic = async (id: string, signal?: AbortSignal) =>
  createFullToUniItem(await jmStore.api.value!.get<RawFullComic>(`/album?id=${id}`, { signal }))

const comicsPagesDB = new Map<string, RawLessComic>()
export const getComicPages = async (id: string, signal?: AbortSignal) => {
  const key = id
  const pageDB = comicsPagesDB.get(key)
  if (pageDB) var _chapter = pageDB
  else var _chapter = await jmStore.api.value!.get<RawLessComic>(`/chapter?id=${id}`, { signal })
  const chapter = _chapter
  const imgs = chapter.images.map(img => {
    const page = Number(img.match(/\d+/g)?.[0])
    return uni.image.Image.create({
      $$plugin: pluginName,
      forkNamespace: 'default',
      path: `/media/photos/${id}/${img}`,
      processSteps: ['comicDecode'],
      $$meta: { page, id: chapter.id }
    })
  })
  comicsPagesDB.set(key, _chapter)
  return imgs
}

export const likeComic = (id: string, signal?: AbortSignal) =>
  jmStore.api.value!.postForm('/like', { id }, { signal })

export const favouriteComic = (aid: string, signal?: AbortSignal) =>
  jmStore.api.value!.postForm<{ status: string; msg: string; type: 'add' | 'remove' }>(
    '/favorite',
    { aid },
    { signal }
  )

export const getComment = async (Id: string, page: number = 1, signal?: AbortSignal) => {
  const all = await jmStore.api.value!.get<{ list: RawComment[]; total: string }>('/forum', {
    params: { mode: 'manhua', page, aid: Id },
    signal
  })
  return { list: all.list.map(v => new Comment(v)), total: Number(all.total) }
}

export const createCommentsStream = (blogId: string) =>
  toStreamQuery((page, signal) => getComment(blogId, page, signal))

export const sendComment = (
  id: string,
  content: string,
  isSpoiler: boolean,
  signal?: AbortSignal
) =>
  jmStore.api.value!.postForm(
    '/comment',
    { aid: id, content, comment: content, isSpoiler },
    { signal }
  )

export const sendChildComment = (
  id: string,
  parentCId: string,
  content: string,
  isSpoiler: boolean,
  signal?: AbortSignal
) =>
  jmStore.api.value!.postForm(
    '/comment',
    { aid: id, content, comment: content, isSpoiler, comment_id: parentCId },
    { signal }
  )