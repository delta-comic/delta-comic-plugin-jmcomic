import type {
  CommonNovel,
  FullNovel,
  JMComic,
  List,
  NovelContent,
  Numeric,
  PaginationQuery
} from '..'
import { jsonToFormData } from '../helpers'

interface NovelList<T> {
  total: string
  list: T[]
}
export class Novel {
  constructor(protected sdk: JMComic) {}
  public async getPromoteList(
    data: PaginationQuery<{}>,
    signal?: AbortSignal
  ): Promise<List<CommonNovel>> {
    const ky = this.sdk.requester.create()
    const result = await ky
      .get<NovelList<CommonNovel>>(this.sdk.config.apiPath.novel_list, {
        signal,
        searchParams: { page: data.page }
      })
      .json()
    return { total: Number(result.total), list: result.list }
  }

  public async search(
    data: PaginationQuery<{ keyword: string }>,
    signal?: AbortSignal
  ): Promise<List<CommonNovel>> {
    const ky = this.sdk.requester.create()
    const list = await ky
      .get<NovelList<CommonNovel>>(this.sdk.config.apiPath.novel_search, {
        signal,
        searchParams: { search_query: data.keyword, page: data.page }
      })
      .json()

    return { list: list.list, total: Number(list.total) }
  }

  public async getInfo(data: { id: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<FullNovel>(this.sdk.config.apiPath.novel_detail, {
        signal,
        searchParams: { nid: data.id }
      })
      .json()
  }

  public async getContent(data: { chapterId: Numeric; lang: 'tw' | 'cn' }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<NovelContent>(this.sdk.config.apiPath.novel_chapters, {
        signal,
        searchParams: { ncid: data.chapterId, lang: data.lang }
      })
      .json()
  }

  public async like(data: { id: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_like, {
        signal,
        searchParams: { nid: data.id, like_type: 'novel' }
      })
      .json()
  }

  public async favorite(data: { id: Numeric }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post<{ status: string; msg: string; type: 'add' | 'remove' }>(
        this.sdk.config.apiPath.novel_favorites,
        { body: jsonToFormData({ nid: data.id }), signal }
      )
      .json()
  }

  public async getFavoriteList(data: PaginationQuery<{}>, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .post<{ status: string; msg: string; type: 'add' | 'remove' }>(
        this.sdk.config.apiPath.novel_favorites,
        { body: jsonToFormData({ page: data.page, folder_id: '', o: '' }), signal }
      )
      .json()
  }

  public async sendComment(
    data: {
      novelId: Numeric
      chapterId?: Numeric
      parentCommentId: Numeric
      content: string
      isSpoiled: boolean
    },
    signal?: AbortSignal
  ) {
    const ky = this.sdk.requester.create()
    return await ky
      .post(this.sdk.config.apiPath.forum_sendComment, {
        signal,
        searchParams: {
          nid: data.novelId,
          comment_id: data.parentCommentId,
          ncid: data.chapterId,
          comment: data.content,
          isSpoiler: data.isSpoiled
        }
      })
      .json()
  }
}