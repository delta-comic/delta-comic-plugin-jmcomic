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
  /**
   * @description 这个字段是blog的唯一id，本质数字
   * @example '1145'
   * @alias `BID`
   */
  id: string
  uid: string
  title: string
  /**
   * @description 标签，但是，虽然是数组，但是标签被塞在一个数组，由逗号分隔
   * @example
   * [ '本本推荐,巨乳,制服' ]
   * [ '' ]
   */
  tags: string[]
  content: string
  photo: string
  total_views: string
  total_comments: string
  total_likes: string
  username: string
  nickname: string
  user_photo: null
  /**
   * @description 分类
   */
  category: {
    /**
     * @description 中文的分类名称
     * @example 绅夜食堂
     */
    name: string
    /**
     * @description 分类id
     * @example dinner
     */
    slug: string
  }
  expInfo: ExpInfo
  game_url: null
  is_liked: boolean
  /** @example "2025-04-24" */
  date: string
}