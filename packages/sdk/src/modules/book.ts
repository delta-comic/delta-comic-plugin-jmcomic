import type { JMComic } from '..'
import type {
  AuthorDetail,
  BookDetail as CommonBook,
  BookPages as FullBook,
  LessBook
} from '../model/book'
import type { List, PaginationQuery } from '../model/utils'

interface BookList<T> {
  content: T[]
  total: number
}

interface Sourced {
  lang?: string
  source?: string
}

export class Book {
  constructor(protected sdk: JMComic) {}

  public async search(
    data: PaginationQuery<{ keyword?: string } & Sourced>,
    signal?: AbortSignal
  ): Promise<List<LessBook>> {
    const ky = this.sdk.requester.create()
    const res = await ky
      .get<BookList<LessBook>>(this.sdk.config.apiPath.book_search, {
        searchParams: {
          page: data.keyword,
          search_query: data.keyword,
          lang: data.lang,
          source: data.source
        },
        signal
      })
      .json()
    return { total: res.total, list: res.content }
  }

  public async getAuthorDetail(data: { id: number } & Sourced, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<AuthorDetail>(this.sdk.config.apiPath.book_getAuthorDetail, {
        searchParams: { id: data.id, lang: data.lang, source: data.source },
        signal
      })
      .json()
  }

  /**
   * @description 说实在的，我不知道这个接口存在的意义是什么，`getBookFullDetail`返回更加丰富。
   */
  public async getBookDetail(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<CommonBook>(this.sdk.config.apiPath.book_getBookDetail, {
        searchParams: { id: data.id },
        signal
      })
      .json()
  }

  public async getBookFullDetail(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<FullBook>(this.sdk.config.apiPath.book_getBookFullDetail, {
        searchParams: { id: data.id },
        signal
      })
      .json()
  }
}