import { Utils } from 'delta-comic-core'

import { jmStore } from '@/store'

import type { jm as JmType } from '..'

import { _jmComment } from '../comment'
import { createCommonBlogToUniItem, jmStream } from './utils'

export namespace _jmApiBlog {
  const { PromiseContent } = Utils.data

  export type BlogType = 'dinner' | 'raiders' | 'sexytalk'
  export const blogType: Record<BlogType, string> = {
    dinner: '绅夜食堂',
    raiders: '游戏文库',
    sexytalk: '西斯话题'
  }
  export const getBlogSearch = PromiseContent.fromAsyncFunction(
    async (
      type: BlogType,
      search_query: string = '',
      order: JmType.SortType = '',
      page: number = 1,
      signal?: AbortSignal
    ) => {
      const all = await jmStore.api.value!.get<{
        list: JmType.blog.RawCommonBlog[]
        count: number
      }>('/blogs', {
        params: { mode: 'blog', page, blog_type: type, search_query, o: order },
        signal
      })
      return {
        list: all.list.map(v => createCommonBlogToUniItem(v, type)),
        total: Number(all.count)
      }
    }
  )
  export const createBlogsStream = (
    type: BlogType,
    search_query = '',
    order: JmType.SortType = ''
  ) => jmStream((page, signal) => getBlogSearch(type, search_query, order, page, signal))

  export const getInfo = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) =>
    jmStore.api.value!.get<{
      info: JmType.blog.RawFullBlog
      related_comics?: JmType.comic.RawRecommendComic[]
      related_blogs?: JmType.blog.RawCommonBlog[]
    }>('/blog', { signal, params: { id } })
  )

  export const getComment = PromiseContent.fromAsyncFunction(
    async (blogId: string, page: number = 1, signal?: AbortSignal) => {
      const all = await jmStore.api.value!.get<{
        list: JmType.comment.RawComment[]
        total: string
      }>('/forum', { params: { mode: 'blog', page, bid: blogId }, signal })
      return { list: all.list.map(v => new _jmComment.Comment(v)), total: Number(all.total) }
    }
  )
  export const createCommentsStream = (blogId: string) =>
    jmStream((page, signal) => getComment(blogId, page, signal))

  export const likeBlog = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) =>
    jmStore.api.value!.postForm('/like', { id, like_type: 'blog' }, { signal })
  )

  export const sendComment = PromiseContent.fromAsyncFunction(
    (id: string, content: string, signal?: AbortSignal) =>
      jmStore.api.value!.postForm('/comment', { bid: id, comment: content, content }, { signal })
  )
  export const sendChildComment = PromiseContent.fromAsyncFunction(
    (id: string, parentCId: string, content: string, signal?: AbortSignal) =>
      jmStore.api.value!.postForm(
        '/comment',
        { bid: id, content, comment: content, comment_id: parentCId },
        { signal }
      )
  )
}