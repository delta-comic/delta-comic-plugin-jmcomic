import { createCommonBookToItem, createCommonToUniItem } from '../api/utils'
import type { JmBlog } from './blog'
import type { RawCommonBook } from './book'
import type { JmItem, RawCommonComic } from './comic'

export interface RawPromote {
  id: string
  title: string
  slug: string
  type: string
  filter_val: string | number
  content: (RawCommonComic | RawCommonBook)[]
}
export class Promote implements RawPromote {
  public id: string
  public get $id() {
    return Number(this.id)
  }
  public title: string
  public slug: string
  public type: string
  public filter_val: string | number
  public get $filter_val() {
    return Number(this.filter_val)
  }
  public content: (RawCommonComic | RawCommonBook)[]
  public get $content(): JmBlog[] {
    return this.type == 'library'
      ? this.content.map(<any>createCommonBookToItem)
      : this.content.map(<any>createCommonToUniItem)
  }
  constructor(v: RawPromote) {
    this.id = v.id
    this.title = v.title
    this.slug = v.slug
    this.type = v.type
    this.filter_val = v.filter_val
    this.content = v.content
  }
}

export interface PromoteItem {
  list: RawCommonComic[]
  total: number
}

export interface Category {
  id?: string
  title?: string
}

export interface WeekBestList {
  categories: { id: string; title: string; time: string }[]
  type: { id: string; title: string }[]
}

export interface WeekBestItem {
  total: number
  list: RawCommonComic[]
}

export interface ByKeyword {
  search_query: string
  total: string
  content: RawCommonComic[]
}

export interface ByCategory extends ByKeyword {
  tags: string[]
}

export interface Levelboard {
  day: JmItem[]
  week: JmItem[]
  month: JmItem[]
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