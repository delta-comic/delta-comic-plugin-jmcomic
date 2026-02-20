import { uni } from '@delta-comic/model'
import dayjs from 'dayjs'

import { pluginName } from '@/symbol'

import { createRelatedBookToItem, dateTranslate } from './api/utils'
import type { _jmUser } from './user'

export namespace _jmBook {
  export interface RawCommonBook {
    author: string
    id: string
    image: string
    name: string
    update_at: number
  }

  export interface RawListBook {
    id: string
    author_name: string
    update_date: string // "77 days ago"
    author_avatar: string
    background_image: string
  }

  export interface RawRelatedBook {
    id: string
    work_image: string // /media/library/album/1043902/thumb/album.jpg,
    work_title: string
    work_date: string
    platform_name: string
  }

  export interface RawAuthorDetail {
    work_title: ''
    author_name: string
    work_date: ''
    author_avatar: string ///media/library/artists/6212623/icon/136650067.gif
    background_image: string ///media/library/artists/6212623/banner/136650067.gif
    sponsor: {
      platform_url: string //https://www.patreon.com/user?u=136650067
      platform_name: string
    }[]
    related_works: RawRelatedBook[]
    filters: { language: string[]; source: { service: string; name: string }[] }
  }

  export class AuthorDetail implements RawAuthorDetail {
    public work_title: ''
    public author_name: string
    public work_date: ''
    public author_avatar: string
    public background_image: string
    public sponsor: { platform_url: string; platform_name: string }[]
    public related_works: RawRelatedBook[]
    public get $related_works() {
      return this.related_works.map(createRelatedBookToItem)
    }
    public filters: { language: string[]; source: { service: string; name: string }[] }
    constructor(item: RawAuthorDetail) {
      this.work_title = item.work_title
      this.author_name = item.author_name
      this.work_date = item.work_date
      this.author_avatar = item.author_avatar
      this.background_image = item.background_image
      this.sponsor = item.sponsor
      this.related_works = item.related_works
      this.filters = item.filters
    }
  }

  export interface RawBookDetail {
    work_date: string //20392 days ago,
    author_name: string
    work_title: string
    related_works: RawRelatedBook[]
  }

  export class BookDetail implements RawBookDetail {
    public work_date: string //20392 days ago
    public get $work_date() {
      return dateTranslate(this.work_date)
    }
    public author_name: string
    public work_title: string
    public related_works: RawRelatedBook[]
    public get $related_works() {
      return this.related_works.map(createRelatedBookToItem)
    }
    constructor(v: RawBookDetail) {
      this.work_date = v.work_date
      this.author_name = v.author_name
      this.work_title = v.work_title
      this.related_works = v.related_works
    }
  }

  export interface RawBookPages {
    id: number
    name: string
    total_page: number
    images: {
      page: number
      image: string // https://cdn-msp12.jmdanjonproxy.xyz/media/library/album/1023045/00000.jpg
    }[]
    content: string // <p>72Pic</p>
    addtime: number // 1970
    adddt: string // 2025-05-18 01:00:14
  }
  export class BookPages implements RawBookPages {
    public id: number
    public name: string
    public total_page: number
    public images: { page: number; image: string }[]
    public get $images() {
      return this.images.map(img =>
        uni.image.Image.create({
          $$plugin: pluginName,
          forkNamespace: 'default',
          path: new URL(img.image).pathname
        })
      )
    }
    public content: string
    public addtime: number
    public adddt: string
    public get $adddt() {
      return dayjs(this.adddt, 'YYYY-MM-DD HH:mm:ss')
    }
    constructor(v: RawBookPages) {
      this.id = v.id
      this.name = v.name
      this.total_page = v.total_page
      this.images = v.images
      this.content = v.content
      this.addtime = v.addtime
      this.adddt = v.adddt
    }
  }

  export class JmBook extends uni.item.Item {
    override $$meta: { raw: RawCommonBook; background?: uni.image.RawImage }
    override like(_signal?: AbortSignal): PromiseLike<boolean> {
      throw new Error('Method not implemented.')
    }
    override report(_signal?: AbortSignal): PromiseLike<any> {
      throw new Error('Method not implemented.')
    }
    override sendComment(_text: string, _signal?: AbortSignal): PromiseLike<any> {
      window.$message.warning('不支持发送评论')
      throw new Error('Method not implemented.')
    }
    constructor(v: uni.item.RawItem) {
      super(v)
      this.$$meta = <any>v.$$meta
    }
  }
}