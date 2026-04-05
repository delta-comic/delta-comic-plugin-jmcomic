import type { CommonBook } from './book'
import type { CommonComic } from './comic'

export interface RawPromote {
  id: string
  title: string
  slug: string
  type: string
  filter_val: string | number
  content: (CommonComic | CommonBook)[]
}

export interface PromoteItem {
  list: CommonComic[]
  total: number
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

export type SearchMode = 'jid' | 'keyword' | 'category' | 'tag'
export type SortType = 'mv' | 'mp' | 'tf' | '' | LevelSort
export type LevelSort = 'mv_m' | 'mv_w' | 'mv_t'
export const sortMap = [
  { text: '相关性最高', value: '' },
  { text: '点赞数最多', value: 'tf' },
  { text: '图片数最多', value: 'mp' },
  { text: '观看数最多', value: 'mv' },
  { text: '本月观看数最多', value: 'mv_m' },
  { text: '本周观看数最多', value: 'mv_w' },
  { text: '今日观看数最多', value: 'mv_t' }
]