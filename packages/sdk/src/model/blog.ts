import type { Gender, ExpInfo } from './user'

export interface CommonBlog {
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

export interface FullBlog {
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
  expInfo: ExpInfo
  game_url: null
  is_liked: boolean
  /** @example "2025-04-24" */
  date: string
}