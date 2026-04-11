import type { CommonNovel, FullNovel, JMComic, List, PaginationQuery } from '..'

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
  public async getInfo(data: { id: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const info = await ky
      .get<FullNovel>(this.sdk.config.apiPath.novel_detail, {
        signal,
        searchParams: { nid: data.id }
      })
      .json()

    return info
  }
}