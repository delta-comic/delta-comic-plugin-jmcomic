import { z } from 'zod'

import type {
  CommonNovel,
  FullNovel,
  JMComic,
  MutationResult,
  NovelContent,
  Numeric,
  PageResult,
  PaginationQuery,
} from '..'
import { jsonToFormData } from '../helpers'
import { sCommonNovel, sFullNovel, sNovelContent } from '../model/novel'
import { sMutationResult, sNumeric } from '../model/utils'

const sNovelPage = z.object({ total: sNumeric.transform(Number), list: z.array(sCommonNovel) })

export class Novel {
  public constructor(protected readonly sdk: JMComic) {}

  public getPromoteList(
    data: PaginationQuery,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonNovel>> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.novel.list, sNovelPage, {
      signal,
      searchParams: { page: data.page },
    })
  }

  public search(
    data: PaginationQuery<{ keyword: string }>,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonNovel>> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.novel.search, sNovelPage, {
      signal,
      searchParams: { search_query: data.keyword, page: data.page },
    })
  }

  public getInfo(data: { id: string }, signal?: AbortSignal): Promise<FullNovel> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.novel.detail, sFullNovel, {
      signal,
      searchParams: { nid: data.id },
    })
  }

  public getContent(
    data: { chapterId: Numeric; lang: 'tw' | 'cn' },
    signal?: AbortSignal,
  ): Promise<NovelContent> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.novel.chapters,
      sNovelContent,
      { signal, searchParams: { ncid: data.chapterId, lang: data.lang } },
    )
  }

  public like(data: { id: string }, signal?: AbortSignal): Promise<MutationResult> {
    return this.sdk.requester.request('post', this.sdk.config.apiPath.forum.like, sMutationResult, {
      signal,
      body: jsonToFormData({ nid: data.id, like_type: 'novel' }),
    })
  }

  public favorite(data: { id: Numeric }, signal?: AbortSignal): Promise<MutationResult> {
    return this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.novel.favorites,
      sMutationResult,
      { body: jsonToFormData({ nid: data.id }), signal },
    )
  }

  public getFavoriteList(
    data: PaginationQuery<{ folderId?: Numeric; order?: string }>,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonNovel>> {
    return this.sdk.requester.request('post', this.sdk.config.apiPath.novel.favorites, sNovelPage, {
      body: jsonToFormData({
        page: data.page,
        folder_id: data.folderId ?? '',
        o: data.order ?? '',
      }),
      signal,
    })
  }

  public sendComment(
    data: {
      novelId: Numeric
      chapterId?: Numeric
      parentCommentId?: Numeric
      content: string
      isSpoiled: boolean
    },
    signal?: AbortSignal,
  ): Promise<MutationResult> {
    return this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.forum.comment,
      sMutationResult,
      {
        signal,
        body: jsonToFormData({
          nid: data.novelId,
          comment_id: data.parentCommentId,
          ncid: data.chapterId,
          comment: data.content,
          isSpoiler: data.isSpoiled,
        }),
      },
    )
  }
}