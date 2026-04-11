import type {
  CommonBook,
  CommonComic,
  CommonNovel,
  JMComic,
  List,
  PaginationQuery,
  PromoteItem,
  WeekBest
} from '..'

interface PromoteList {
  list: CommonComic[]
  total: string | number
}

interface WeekBestList {
  total: number
  list: CommonComic[]
}

export class Promote {
  constructor(protected sdk: JMComic) {}
  public async getPromotes(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky.get<PromoteItem[]>(this.sdk.config.apiPath.promote_get, { signal }).json()
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

  public async getWeekBestCate(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky.get<WeekBest>(this.sdk.config.apiPath.weekBest_cate, { signal }).json()
  }

  public async getWeekBestList(
    data: { id: number; type: string },
    signal?: AbortSignal
  ): Promise<List<CommonComic | CommonBook | CommonNovel>> {
    const ky = this.sdk.requester.create()
    const result = await ky
      .get<WeekBestList>(this.sdk.config.apiPath.weekBest_list, {
        signal,
        searchParams: { type: data.type, id: data.type }
      })
      .json()
    return { list: result.list, total: Number(result.total) }
  }

  public async getHotTags(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky.get<string[]>(this.sdk.config.apiPath.promote_hotTags, { signal }).json()
  }

  public async getRandomProvide(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return await ky
      .get<unknown>(this.sdk.config.apiPath.promote_random, {
        signal,
        searchParams: { time: Date.now() }
      })
      .json()
  }
}