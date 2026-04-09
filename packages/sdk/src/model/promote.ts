import type { CommonBook } from './book'
import type { CommonComic } from './comic'

export interface PromoteItem {
  id: string
  title: string
  slug: string
  type: string
  filter_val: string | number
  content: (CommonComic | CommonBook)[]
}

export interface WeekBestList {
  categories: { id: string; title: string; time: string }[]
  type: { id: string; title: string }[]
}

export interface WeekBestItem {
  total: number
  list: CommonComic[]
}

export interface ByKeyword {
  search_query: string
  total: string
  content: CommonComic[]
}

export interface ByCategory extends ByKeyword {
  tags: string[]
}

export interface CategoriesResult {
  categories: CategoryResult[]
  blocks: { title: string; content: string[] }[]
}
export interface CategoryResult {
  id: number
  name: string
  slug: string
  total_albums: string
  type: string
  sub_categories?: { CID: string; name: string; slug: string }[]
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