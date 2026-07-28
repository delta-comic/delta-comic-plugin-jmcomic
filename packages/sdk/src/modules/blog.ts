import { z } from 'zod'

import type {
  BlogComment,
  CommonBlog,
  FullBlog,
  JMComic,
  MutationResult,
  Numeric,
  PageResult,
  PaginationQuery,
  RecommendComic,
  SortType,
} from '..'
import { jsonToFormData } from '../helpers'
import { sCommonBlog, sFullBlog } from '../model/blog'
import { sRecommendComic } from '../model/comic'
import { sComment } from '../model/comment'
import { sMutationResult, sNumeric } from '../model/utils'

export const blogTypes = {
  all: '全部',
  news: '最新消息',
  discussion: '闲聊交流',
  recommendation: '本本推荐',
} as const

const sBlogComment: z.ZodType<BlogComment> = z.lazy(() =>
  z.intersection(sComment, z.object({ BID: sNumeric, replys: z.array(sBlogComment).optional() })),
)
const sBlogPage = z.object({ list: z.array(sCommonBlog), count: sNumeric.transform(Number) })
const sBlogCommentPage = z.object({
  list: z.array(sBlogComment),
  total: sNumeric.transform(Number),
})
const sBlogDetail = z.object({
  info: sFullBlog,
  related_comics: z.array(sRecommendComic).optional(),
  related_blogs: z.array(sCommonBlog).optional(),
})

export interface BlogDetail {
  info: FullBlog
  related_comics?: RecommendComic[]
  related_blogs?: CommonBlog[]
}

export class Blog {
  public constructor(protected readonly sdk: JMComic) {}

  public async search(
    data: PaginationQuery<{ type: string; keyword?: string; order?: SortType }>,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonBlog>> {
    const result = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.blog.search,
      sBlogPage,
      {
        searchParams: {
          mode: 'blog',
          page: data.page,
          blog_type: data.type,
          search_query: data.keyword,
          o: data.order,
        },
        signal,
      },
    )
    return { list: result.list, total: result.count }
  }

  public getInfo(data: { id: Numeric }, signal?: AbortSignal): Promise<BlogDetail> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.blog.detail, sBlogDetail, {
      searchParams: { id: data.id },
      signal,
    })
  }

  public getComments(
    data: PaginationQuery<{ id: Numeric }>,
    signal?: AbortSignal,
  ): Promise<PageResult<BlogComment>> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.forum.comments,
      sBlogCommentPage,
      { searchParams: { mode: 'blog', page: data.page, bid: data.id }, signal },
    )
  }

  public like(data: { id: Numeric }, signal?: AbortSignal): Promise<MutationResult> {
    return this.sdk.requester.request('post', this.sdk.config.apiPath.forum.like, sMutationResult, {
      body: jsonToFormData({ id: data.id, like_type: 'blog' }),
      signal,
    })
  }

  public sendComment(
    data: { id: Numeric; parentCommentId?: Numeric; content: string },
    signal?: AbortSignal,
  ): Promise<MutationResult> {
    return this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.forum.comment,
      sMutationResult,
      {
        body: jsonToFormData({
          bid: data.id,
          comment_id: data.parentCommentId,
          comment: data.content,
        }),
        signal,
      },
    )
  }
}