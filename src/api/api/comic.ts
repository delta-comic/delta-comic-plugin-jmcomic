import { uni, Utils } from 'delta-comic-core'

import { jmStore } from '@/store'
import { pluginName } from '@/symbol'

import type { jm as JmType } from '..'

import { _jmComment } from '../comment'
import { createFullToUniItem, jmStream } from './utils'
export namespace _jmApiComic {
  const { PromiseContent } = Utils.data
  export const getComic = PromiseContent.fromAsyncFunction(
    async (id: string, signal?: AbortSignal) =>
      createFullToUniItem(
        await jmStore.api.value!.get<JmType.comic.RawFullComic>(`/album?id=${id}`, { signal })
      )
  )

  const comicsPagesDB = new Map<string, JmType.comic.RawLessComic>()
  export const getComicPages = PromiseContent.fromAsyncFunction(
    async (id: string, signal?: AbortSignal) => {
      const key = id
      const pageDB = comicsPagesDB.get(key)
      if (pageDB) var _chapter = pageDB
      else
        var _chapter = await jmStore.api.value!.get<JmType.comic.RawLessComic>(
          `/chapter?id=${id}`,
          { signal }
        )
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
  )

  export const likeComic = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) =>
    jmStore.api.value!.postForm('/like', { id }, { signal })
  )
  export const favouriteComic = PromiseContent.fromAsyncFunction(
    (aid: string, signal?: AbortSignal) =>
      jmStore.api.value!.postForm<{ status: string; msg: string; type: 'add' | 'remove' }>(
        '/favorite',
        { aid },
        { signal }
      )
  )

  export const getComment = PromiseContent.fromAsyncFunction(
    async (Id: string, page: number = 1, signal?: AbortSignal) => {
      const all = await jmStore.api.value!.get<{
        list: JmType.comment.RawComment[]
        total: string
      }>('/forum', { params: { mode: 'manhua', page, aid: Id }, signal })
      return { list: all.list.map(v => new _jmComment.Comment(v)), total: Number(all.total) }
    }
  )
  export const createCommentsStream = (blogId: string) =>
    jmStream((page, signal) => getComment(blogId, page, signal))

  export const sendComment = PromiseContent.fromAsyncFunction(
    (id: string, content: string, isSpoiler: boolean, signal?: AbortSignal) =>
      jmStore.api.value!.postForm(
        '/comment',
        { aid: id, content, comment: content, isSpoiler },
        { signal }
      )
  )
  export const sendChildComment = PromiseContent.fromAsyncFunction(
    (id: string, parentCId: string, content: string, isSpoiler: boolean, signal?: AbortSignal) =>
      jmStore.api.value!.postForm(
        '/comment',
        { aid: id, content, comment: content, isSpoiler, comment_id: parentCId },
        { signal }
      )
  )
}