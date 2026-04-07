import type { JMComic } from '..'
import { jsonToFormData } from '../helpers'
import type { CommonBlog, FullBlog } from '../model/blog'
import type { RecommendComic } from '../model/comic'
import type { MainComment } from '../model/comment'
import type { SortType } from '../model/search'
import type { List, PaginationQuery } from '../model/utils'

type BlogType<T> = { list: T[]; count: number }
type BlogList2<T> = { list: T[]; total: string }

export class Blog {
  constructor(protected sdk: JMComic) {}

  public async search(
    data: PaginationQuery<{ type: string; keyword?: string; order?: SortType }>,
    signal?: AbortSignal
  ): Promise<List<CommonBlog>> {
    const ky = this.sdk.requester.create()
    const all = await ky
      .get<BlogType<CommonBlog>>(this.sdk.config.apiPath.blog_search, {
        searchParams: {
          mode: 'blog',
          page: data.page,
          blog_type: data.type,
          search_query: data.keyword,
          o: data.order
        },
        signal
      })
      .json()
    return { list: all.list, total: Number(all.count) }
  }

  public async getInfo(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<{ info: FullBlog; related_comics?: RecommendComic[]; related_blogs?: CommonBlog[] }>(
        this.sdk.config.apiPath.blog_getInfo,
        { searchParams: { id: data.id }, signal }
      )
      .json()
  }

  public async getComments(
    data: PaginationQuery<{ id: number }>,
    signal?: AbortSignal
  ): Promise<List<MainComment>> {
    const ky = this.sdk.requester.create()
    const list = await ky
      .get<BlogList2<MainComment>>(this.sdk.config.apiPath.forum_getComments, {
        searchParams: { mode: 'blog', page: data.page, bid: data.id },
        signal
      })
      .json()
    return { list: list.list, total: Number(list.total) }
  }

  public async likeBlog(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_like, {
        body: jsonToFormData({ id: data.id, like_type: 'blog' }),
        signal
      })
      .json()
  }

  public async sendComment(data: { id: number; content: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_sendComment, {
        body: jsonToFormData({ bid: data.id, comment: data.content }),
        signal
      })
      .json()
  }

  public async sendChildComment(
    data: { id: number; parentCommentId: number; content: string },
    signal?: AbortSignal
  ) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_sendComment, {
        body: jsonToFormData({
          bid: data.id,
          comment_id: data.parentCommentId,
          comment: data.content
        }),
        signal
      })
      .json()
  }
}