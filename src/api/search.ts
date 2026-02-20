import { createCommonBookToItem, createCommonToUniItem } from './api/utils'
import type { _jmBlog } from './blog'
import type { _jmBook } from './book'
import { _jmComic } from './comic'

export namespace _jmSearch {
  export interface RawPromote {
    id: string
    title: string
    slug: string
    type: string
    filter_val: string | number
    content: (_jmComic.RawCommonComic | _jmBook.RawCommonBook)[]
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
    public content: (_jmComic.RawCommonComic | _jmBook.RawCommonBook)[]
    public get $content(): _jmBlog.JmBlog[] {
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
    list: _jmComic.RawCommonComic[]
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
    list: _jmComic.RawCommonComic[]
  }

  export interface ByKeyword {
    search_query: string
    total: string
    content: _jmComic.RawCommonComic[]
  }

  export interface ByCategory extends ByKeyword {
    tags: string[]
  }

  export interface Levelboard {
    day: _jmComic.JmItem[]
    week: _jmComic.JmItem[]
    month: _jmComic.JmItem[]
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
}