import type { BlogType, RawCommonBlog, RawFullBlog } from '@/model/blog'
import type { RawRecommendComic } from '@/model/comic'
import { Comment, type RawComment } from '@/model/comment'
import type { SortType } from '@/model/search'
import { jmStore } from '@/store'

import { createCommonBlogToUniItem, toStreamQuery } from './utils'

export const blogType: Record<BlogType, string> = {
  dinner: '绅夜食堂',
  raiders: '游戏文库',
  sexytalk: '西斯话题'
}
export const getBlogSearch = async (
  type: BlogType,
  search_query: string = '',
  order: SortType = '',
  page: number = 1,
  signal?: AbortSignal
) => {
  const all = await jmStore.api.value!.get<{ list: RawCommonBlog[]; count: number }>('/blogs', {
    params: { mode: 'blog', page, blog_type: type, search_query, o: order },
    signal
  })
  return { list: all.list.map(v => createCommonBlogToUniItem(v, type)), total: Number(all.count) }
}

export const createBlogsStream = (type: BlogType, search_query = '', order: SortType = '') =>
  toStreamQuery((page, signal) => getBlogSearch(type, search_query, order, page, signal))

export const getInfo = (id: string, signal?: AbortSignal) =>
  jmStore.api.value!.get<{
    info: RawFullBlog
    related_comics?: RawRecommendComic[]
    related_blogs?: RawCommonBlog[]
  }>('/blog', { signal, params: { id } })

export const getComment = async (blogId: string, page: number = 1, signal?: AbortSignal) => {
  const all = await jmStore.api.value!.get<{ list: RawComment[]; total: string }>('/forum', {
    params: { mode: 'blog', page, bid: blogId },
    signal
  })
  return { list: all.list.map(v => new Comment(v)), total: Number(all.total) }
}

export const createCommentsStream = (blogId: string) =>
  toStreamQuery((page, signal) => getComment(blogId, page, signal))

export const likeBlog = (id: string, signal?: AbortSignal) =>
  jmStore.api.value!.postForm('/like', { id, like_type: 'blog' }, { signal })

export const sendComment = (id: string, content: string, signal?: AbortSignal) =>
  jmStore.api.value!.postForm('/comment', { bid: id, comment: content, content }, { signal })

export const sendChildComment = (
  id: string,
  parentCId: string,
  content: string,
  signal?: AbortSignal
) =>
  jmStore.api.value!.postForm(
    '/comment',
    { bid: id, content, comment: content, comment_id: parentCId },
    { signal }
  )