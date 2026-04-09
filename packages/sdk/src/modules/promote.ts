import type { CommonComic, JMComic, PaginationQuery, PromoteItem } from '..'

interface PromoteList {
  list: CommonComic[]
  total: string | number
}

export class Promote {
  constructor(protected sdk: JMComic) {}
  public async getPromote(data: PaginationQuery<{}>, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<PromoteItem[]>(this.sdk.config.apiPath.promote_get, {
        signal,
        searchParams: { page: data.page }
      })
      .json()
  }

  public async getPromoteItem(data: PaginationQuery<{ id: number }>, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const result = await ky
      .get<PromoteList>(this.sdk.config.apiPath.promote_list, {
        signal,
        searchParams: { page: data.page, id: data.id }
      })
      .json()
    return { list: result.list, total: Number(result.total) }
  }
}