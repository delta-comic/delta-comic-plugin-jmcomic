import type { AuthorDetail, BookDetail, BookPages, JMComic, LessBook, List, PaginationQuery } from '..'

interface BookList<T> {
  content: T[]
  total: string
}
type BookResult<T> = { data: T }

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
      .get<BookResult<BookList<LessBook>>>(this.sdk.config.apiPath.book_search, {
        searchParams: {
          page: data.page,
          search_query: data.keyword,
          lang: data.lang,
          source: data.source
        },
        signal
      })
      .json()
      .then(v => v.data)
    return { total: Number(res.total), list: res.content }
  }

  public async getAuthorDetail(data: { id: string } & Sourced, signal?: AbortSignal) {
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
      .get<BookResult<BookDetail>>(this.sdk.config.apiPath.book_getBookDetail, {
        searchParams: { id: data.id },
        signal
      })
      .json()
      .then(v => v.data)
  }

  public async getBookPages(data: { id: number }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<BookPages>(this.sdk.config.apiPath.book_getBookFullDetail, {
        searchParams: { id: data.id },
        signal
      })
      .json()
  }
}