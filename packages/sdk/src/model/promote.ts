import z from 'zod'

import { sCommonBook, type CommonBook } from './book'
import { sCommonComic, type CommonComic } from './comic'
import { sLessNovel, type LessNovel } from './novel'
import { sNumeric, type Numeric } from './utils'

export const sPromoteItem = z.object({
  id: sNumeric,
  title: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` }),
  slug: z.string({ error: r => `User nick name is illegal. (Input ${JSON.stringify(r.input)})` }),
  type: z.string({ error: r => `update_at is illegal. (Input ${JSON.stringify(r.input)})` }),
  filter_val: z.union([
    z.stringFormat('Numeric', /^\d+$/, {
      error: r => `parent_Id is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    z.number({ error: r => `parent_Id is illegal. (Input ${JSON.stringify(r.input)})` }),
    z.literal('')
  ]),
  content: z.array(
    z.union([sCommonComic, sCommonBook, sLessNovel], {
      error: r => `content is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    { error: r => `content is illegal. (Input ${JSON.stringify(r.input)})` }
  )
})
export interface PromoteItem {
  /**
   * @description 推荐列表的唯一id，本质数字，不保证连续
   * @example ['26', '29', '30', 999, 1000] // 可见存在突变
   */
  id: Numeric
  title: string
  slug: string
  type: string
  filter_val: string | number
  content: (CommonComic | CommonBook | LessNovel)[]
}

export const sWeekBest = z.object({
  categories: z.array(
    z.object({
      id: z.stringFormat('Numeric', /^\d+$/, {
        error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
      }),
      title: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` }),
      time: z.string({
        error: r => `User nick name is illegal. (Input ${JSON.stringify(r.input)})`
      })
    }),
    { error: r => `content is illegal. (Input ${JSON.stringify(r.input)})` }
  ),
  type: z.array(
    z.object({
      id: z.string({
        error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
      }),
      title: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` })
    }),
    { error: r => `content is illegal. (Input ${JSON.stringify(r.input)})` }
  )
})
export interface WeekBest {
  categories: { id: string; title: string; time: string }[]
  type: { id: string; title: string }[]
}

export const sCategoryResult = z.object({
  id: z.stringFormat('Numeric', /^\d+$/, {
    error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  name: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` }),
  slug: z.string({ error: r => `User nick name is illegal. (Input ${JSON.stringify(r.input)})` }),
  total_albums: z.stringFormat('Numeric', /^\d+$/, {
    error: r => `total_albums is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  type: z.string({ error: r => `type is illegal. (Input ${JSON.stringify(r.input)})` }),
  sub_categories: z
    .array(
      z.object({
        Id: z.stringFormat('Numeric', /^\d+$/, {
          error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
        }),
        name: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` }),
        slug: z.string({
          error: r => `User nick name is illegal. (Input ${JSON.stringify(r.input)})`
        })
      }),
      { error: r => `sub_categories is illegal. (Input ${JSON.stringify(r.input)})` }
    )
    .optional()
})
export interface CategoryResult {
  id: number
  name: string
  slug: string
  total_albums: string
  type: string
  sub_categories?: { Id: string; name: string; slug: string }[]
}

export const sCategoriesResult = z.object({
  categories: z.array(sCategoryResult),
  blocks: z.array(
    z.object({
      title: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` }),
      content: z.array(
        z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` })
      )
    }),
    { error: r => `blocks is illegal. (Input ${JSON.stringify(r.input)})` }
  )
})
export interface CategoriesResult {
  categories: CategoryResult[]
  blocks: { title: string; content: string[] }[]
}

export enum SortType {
  Relate = '',
  Like = 'tf',
  ImageMost = 'mp',

  TotalViewBest = 'mv',
  MonthViewBest = 'mv_m',
  WeekViewBest = 'mv_w',
  TodayViewBest = 'mv_t'
}