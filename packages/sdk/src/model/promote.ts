import type { CommonBook } from './book'
import type { CommonComic } from './comic'
import type { LessNovel } from './novel'
import type { Numeric } from './utils'

export * from './generated/promote'

/** @zod */
export interface PromoteItem {
  /**
   * @description 推荐列表的唯一id，本质数字，不保证连续
   * @example ['26', '29', '30', 999, 1000] // 可见存在突变
   */
  id: Numeric
  title: string
  slug: string
  type: string
  filter_val: Numeric | ''
  content: (CommonComic | CommonBook | LessNovel)[]
}

/** @zod */
export interface WeekBest {
  categories: {
    /** @pattern ^\d+$ */
    id: string
    title: string
    time: string
  }[]
  type: { id: string; title: string }[]
}

/** @zod */
export interface CategoryResult {
  /** @schema union([z.stringFormat('Numeric', /^\d+$/), z.number()]).transform(String) */
  id: string
  name: string
  slug: string
  /** @schema union([z.stringFormat('Numeric', /^\d+$/), z.number()]).transform(String) */
  total_albums: string
  /** @schema string().optional().default('') */
  type: string
  /** @schema array(z.object({ CID: z.union([z.stringFormat('Numeric', /^\d+$/), z.number()]), name: z.string(), slug: z.string() })).transform(items => items.map(item => ({ id: String(item.CID), name: item.name, slug: item.slug }))).optional() */
  sub_categories?: { id: string; name: string; slug: string }[]
}

/** @zod */
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
  TodayViewBest = 'mv_t',
}