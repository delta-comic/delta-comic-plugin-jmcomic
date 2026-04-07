import type { JMComic } from '..'
import { jsonToFormData } from '../helpers'
import type { CommonComic, FullComic, LessComic } from '../model/comic'
import type { MainComment } from '../model/comment'
import type { SortType } from '../model/search'
import type { List, PaginationQuery } from '../model/utils'

type ComicList<T> = { list: T[]; total: string }

type SearchList<T> = { search_query: string; total: string; content: T[] }

export class Comic {
  constructor(protected sdk: JMComic) {}

  public async searchByKeyword(
    data: PaginationQuery<{ keyword: string; order: SortType }>,
    signal?: AbortSignal
  ): Promise<List<CommonComic>> {
    const ky = this.sdk.requester.create()
    const result = await ky
      .get<SearchList<CommonComic>>(this.sdk.config.apiPath.comic_searchByKeyword, {
        searchParams: { search_query: data.keyword, o: data.order, page: data.page },
        signal
      })
      .json()
    return { list: result.content, total: Number(result.total) }
  }

  public async searchByCategory(
    data: PaginationQuery<{ category: string; order: SortType }>,
    signal?: AbortSignal
  ): Promise<List<CommonComic>> {
    const ky = this.sdk.requester.create()
    const result = await ky
      .get<SearchList<CommonComic> & { tags: string[] }>(
        this.sdk.config.apiPath.comic_searchByCategory,
        { searchParams: { c: data.category, o: data.order, page: data.page }, signal }
      )
      .json()
    return { list: result.content, total: Number(result.total) }
  }

  public async getComicInfo(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<FullComic>(this.sdk.config.apiPath.comic_getInfo, {
        searchParams: { id: data.id },
        signal
      })
      .json()
  }

  /**
   * @returns 形如`["/media/photos/350234/00001.webp"]`的数组，本质`/media/photos/${data.id}/${img}`
   */
  public getComicPages = async (data: { id: number }, signal?: AbortSignal) => {
    const ky = this.sdk.requester.create()
    const comic = await ky
      .get<LessComic>(this.sdk.config.apiPath.comic_getPages, {
        searchParams: { id: data.id },
        signal
      })
      .json()
    return comic.images.map(img => `/media/photos/${data.id}/${img}`)
  }

  public async likeComic(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post<{ msg: string; status: string; code: number }>(this.sdk.config.apiPath.forum_like, {
        body: jsonToFormData({ id: data.id }),
        signal
      })
      .json()
  }

  public async favoriteComic(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post<{ status: string; msg: string; type: 'add' | 'remove' }>(
        this.sdk.config.apiPath.forum_favorite,
        { body: jsonToFormData({ aid: data.id }), signal }
      )
      .json()
  }

  public async getComments(
    data: PaginationQuery<{ id: number }>,
    signal?: AbortSignal
  ): Promise<List<MainComment>> {
    const ky = this.sdk.requester.create()
    const list = await ky
      .get<ComicList<MainComment>>(this.sdk.config.apiPath.forum_getComments, {
        searchParams: { mode: 'manhua', page: data.page, aid: data.id },
        signal
      })
      .json()
    return { list: list.list, total: Number(list.total) }
  }

  public async sendComment(
    data: { comicId: number; content: string; isSpoiled: boolean },
    signal?: AbortSignal
  ) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_sendComment, {
        body: jsonToFormData({
          aid: data.comicId,
          content: data.content,
          isSpoiler: data.isSpoiled
        }),
        signal
      })
      .json()
  }

  public async sendChildComment(
    data: { comicId: number; parentCommentId: number; content: string },
    signal?: AbortSignal
  ) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_sendComment, {
        body: jsonToFormData({
          aid: data.comicId,
          comment_id: data.parentCommentId,
          comment: data.content
        }),
        signal
      })
      .json()
  }
}