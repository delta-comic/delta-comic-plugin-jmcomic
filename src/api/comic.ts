import { uni } from '@delta-comic/model'

import { jm } from '.'
import { _jmImage } from './image'
import type { _jmSearch } from './search'

export namespace _jmComic {
  export interface RawSeries {
    id: string
    name: string
    sort: string
  }
  export class Series implements RawSeries {
    public toJSON() {
      return this.$$raw
    }
    public id: string
    public get $id() {
      return Number(this.id)
    }
    public name: string
    public sort: string
    public get $sort() {
      return Number(this.sort)
    }
    constructor(protected $$raw: RawSeries) {
      this.id = $$raw.id
      this.name = $$raw.name
      this.sort = $$raw.sort
    }
    public static is(v: any): v is Series {
      return v instanceof Series
    }
    public toUniEp() {
      // return new uni.comic.Ep(this)
    }
  }

  export interface RawBaseComic {
    id: string
    name: string
    is_favorite: boolean
    liked: boolean
  }

  export interface RawLessComic extends RawBaseComic {
    addtime: string
    images: string[]
    series: RawSeries[]
    series_id: string
    tags: string
  }

  export interface RawCommonComic extends RawBaseComic {
    author: string
    description?: string
    image: string
    category: _jmSearch.Category
    category_sub: _jmSearch.Category
    update_at?: number
  }

  export interface RawRecommendComic {
    id: string
    author: string
    name: string
    image: string
  }

  export interface RawFullComic extends RawBaseComic {
    images: string[]
    addtime: string
    description: string
    total_views: string
    series: RawSeries[]
    series_id: string
    comment_total: string
    author: string[]
    tags: string[]
    works: string[]
    actors: string[]
    related_list: RawRecommendComic[]
    liked: boolean
    is_aids: boolean
    price: string
    purchased: string
    likes: string
  }

  export class JmItem extends uni.item.Item {
    public override like(signal?: AbortSignal): PromiseLike<boolean> {
      return jm.api.comic.likeComic(this.id, signal)
    }
    public override report(_signal?: AbortSignal): PromiseLike<any> {
      window.$message.warning('Method not implemented.')
      throw new Error('Method not implemented.')
    }
    public override sendComment(text: string, signal?: AbortSignal): PromiseLike<any> {
      return jm.api.comic.sendComment(this.id, text, false, signal)
    }
    constructor(v: uni.item.RawItem) {
      super(v)
    }
  }
}