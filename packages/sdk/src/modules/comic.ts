import { z } from 'zod'

import type {
  ComicComment,
  CommonComic,
  FullComic,
  JMComic,
  LessComic,
  MutationResult,
  Numeric,
  PageResult,
  PaginationQuery,
  SortType,
} from '..'
import { jsonToFormData } from '../helpers'
import { sCommonComic, sFullComic, sLessComic } from '../model/comic'
import { sComment } from '../model/comment'
import { sMutationResult, sNumeric } from '../model/utils'

const sComicComment: z.ZodType<ComicComment> = sComment.extend({
  AID: sNumeric,
  replys: z.lazy(() => z.array(sComicComment)).optional(),
})
const sComicPage = z.object({ total: sNumeric.transform(Number), content: z.array(sCommonComic) })
const sCommentPage = z.object({ total: sNumeric.transform(Number), list: z.array(sComicComment) })

export class Comic {
  public constructor(protected readonly sdk: JMComic) {}

  public async searchByKeyword(
    data: PaginationQuery<{ keyword: string; order: SortType }>,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonComic>> {
    const result = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.comic.search,
      sComicPage,
      { searchParams: { search_query: data.keyword, o: data.order, page: data.page }, signal },
    )
    return { list: result.content, total: result.total }
  }

  public async searchByCategory(
    data: PaginationQuery<{ category: string; order: SortType }>,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonComic>> {
    const result = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.comic.category,
      sComicPage,
      { searchParams: { c: data.category, o: data.order, page: data.page }, signal },
    )
    return { list: result.content, total: result.total }
  }

  public getInfo(data: { id: Numeric }, signal?: AbortSignal): Promise<FullComic> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.comic.detail, sFullComic, {
      searchParams: { id: data.id },
      signal,
    })
  }

  public async getPages(data: { id: Numeric }, signal?: AbortSignal): Promise<string[]> {
    const comic: LessComic = await this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.comic.pages,
      sLessComic,
      { searchParams: { id: data.id }, signal },
    )
    return comic.images.map(image => `/media/photos/${data.id}/${image}`)
  }

  public like(data: { id: Numeric }, signal?: AbortSignal): Promise<MutationResult> {
    return this.sdk.requester.request('post', this.sdk.config.apiPath.forum.like, sMutationResult, {
      body: jsonToFormData({ id: data.id }),
      signal,
    })
  }

  public favorite(data: { id: Numeric }, signal?: AbortSignal): Promise<MutationResult> {
    return this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.forum.favorite,
      sMutationResult,
      { body: jsonToFormData({ aid: data.id }), signal },
    )
  }

  public async getComments(
    data: PaginationQuery<{ id: Numeric }>,
    signal?: AbortSignal,
  ): Promise<PageResult<ComicComment>> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.forum.comments, sCommentPage, {
      searchParams: { mode: 'manhua', page: data.page, aid: data.id },
      signal,
    })
  }

  public sendComment(
    data: { comicId: Numeric; parentCommentId?: Numeric; content: string; isSpoiled: boolean },
    signal?: AbortSignal,
  ): Promise<MutationResult> {
    return this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.forum.comment,
      sMutationResult,
      {
        body: jsonToFormData({
          aid: data.comicId,
          content: data.content,
          comment_id: data.parentCommentId,
          isSpoiler: data.isSpoiled,
          is_spoiler: data.isSpoiled,
        }),
        signal,
      },
    )
  }
}