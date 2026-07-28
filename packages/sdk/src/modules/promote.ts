import { z } from 'zod'

import type {
  CategoriesResult,
  CommonBook,
  CommonComic,
  CommonNovel,
  JMComic,
  PageResult,
  PaginationQuery,
  PromoteItem,
  WeekBest,
} from '..'
import { sCommonBook } from '../model/book'
import { sCommonComic } from '../model/comic'
import { sCommonNovel } from '../model/novel'
import { sCategoriesResult, sPromoteItem, sWeekBest } from '../model/promote'
import { sNumeric } from '../model/utils'

const sPromoteComic: z.ZodType<CommonComic> = sCommonComic
  .extend({ image: z.string().optional() })
  .transform(comic => ({ ...comic, image: comic.image ?? `/media/albums/${comic.id}_3x4.jpg` }))
const sPromotePage = z.object({ list: z.array(sPromoteComic), total: sNumeric.transform(Number) })
const sWeekPage = z.object({
  list: z.array(z.union([sCommonComic, sCommonBook, sCommonNovel])),
  total: sNumeric.transform(Number),
})

export class Promote {
  public constructor(protected readonly sdk: JMComic) {}

  public getCategories(signal?: AbortSignal): Promise<CategoriesResult> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.promote.categories,
      sCategoriesResult,
      { signal },
    )
  }

  public getPromotes(signal?: AbortSignal): Promise<PromoteItem[]> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.promote.list,
      z.array(sPromoteItem),
      { signal, searchParams: { page: 1 } },
    )
  }

  public getPromoteItem(
    data: PaginationQuery<{ id: number }>,
    signal?: AbortSignal,
  ): Promise<PageResult<CommonComic>> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.promote.item, sPromotePage, {
      signal,
      searchParams: { page: data.page, id: data.id },
    })
  }

  public getWeekBestCate(signal?: AbortSignal): Promise<WeekBest> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.promote.weekCategories,
      sWeekBest,
      { signal },
    )
  }

  public getWeekBestList(
    data: { id: number; type: string },
    signal?: AbortSignal,
  ): Promise<PageResult<CommonComic | CommonBook | CommonNovel>> {
    return this.sdk.requester.request('get', this.sdk.config.apiPath.promote.weekList, sWeekPage, {
      signal,
      searchParams: { type: data.type, id: data.id },
    })
  }

  public getHotTags(signal?: AbortSignal): Promise<string[]> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.promote.hotTags,
      z.array(z.string()),
      { signal },
    )
  }

  public getRandomProvide(signal?: AbortSignal): Promise<CommonComic[]> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.promote.random,
      z.array(sCommonComic),
      { signal, searchParams: { time: this.sdk.config.now() } },
    )
  }

  public getLatest(data: PaginationQuery, signal?: AbortSignal): Promise<CommonComic[]> {
    return this.sdk.requester.request(
      'get',
      this.sdk.config.apiPath.promote.latest,
      z.array(sCommonComic),
      { signal, searchParams: { page: data.page } },
    )
  }
}