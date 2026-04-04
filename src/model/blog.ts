import { uni } from '@delta-comic/model'

import { likeBlog, sendComment } from '@/api/blog'

import type { Gender, RawExpInfo } from './user'

export type BlogType = 'dinner' | 'raiders' | 'sexytalk'

export interface RawCommonBlog {
  id: string
  uid: string
  username: string
  user_photo: string
  gender: Gender
  game_url: string
  gid: string
  title: string
  tags: string[]
  category: { name: string; slug: string }
  content: string
  photo: string
  total_views: string
  total_comments: string
  total_likes: string
  /** @example "2025-04-24" */
  date: string
}

export class JmBlog extends uni.item.Item {
  override $$meta: { raw: RawCommonBlog | RawFullBlog }
  override like(signal?: AbortSignal): Promise<any> {
    return likeBlog(this.id, signal)
  }
  override report(_signal?: AbortSignal): Promise<any> {
    throw new Error('Method not implemented.')
  }
  override sendComment(text: string, signal?: AbortSignal): Promise<any> {
    return sendComment(this.id, text, signal)
  }
  constructor(v: uni.item.RawItem) {
    super(v)
    this.$$meta = <any>v.$$meta
  }
}

export interface RawFullBlog {
  id: string
  uid: string
  title: string
  tags: string[]
  content: string
  photo: string
  total_views: string
  total_comments: string
  total_likes: string
  username: string
  nickname: string
  user_photo: null
  category: { name: string; slug: string }
  expInfo: RawExpInfo
  game_url: null
  is_liked: boolean
  /** @example "2025-04-24" */
  date: string
}