import z from 'zod'

import { type Gender, type ExpInfo, sGender, sExpInfo } from './user'
import { sNumeric, sString, type Numeric } from './utils'

export const sCommonBlog = z.object(
  {
    id: sNumeric,
    uid: sNumeric,
    gid: sNumeric.nullable().optional(),
    total_views: sNumeric,
    total_comments: sNumeric,
    total_likes: sNumeric,
    username: sString,
    user_photo: sString.nullable().optional(),
    gender: sGender.optional(),
    game_url: sString.nullable().optional(),
    title: sString,
    tags: sString.array(),
    category: z.object({ name: sString.nullable(), slug: sString.nullable() }),
    content: sString,
    photo: sString,
    date: sString.optional()
  },
  'CommonBlog is illegal.'
)
export interface CommonBlog {
  /**
   * @description 这个字段是blog的唯一id，本质数字
   * @example '1145'
   * @alias `BID`
   */
  id: Numeric
  uid: Numeric
  username: string
  user_photo?: string | null
  gender: Gender
  game_url: string
  gid?: Numeric | null
  title: string
  /**
   * @description 标签，但是，虽然是数组，但是标签被塞在一个字符串，由逗号分隔，但也有特例
   * @example
   * [ '本本推荐,巨乳,制服' ]
   * [ '本本推荐', '巨乳', '制服' ]
   * [ '' ]
   */
  tags: string[]
  /**
   * @description 分类
   */
  category: {
    /**
     * @description 中文的分类名称
     * @example 绅夜食堂
     */
    name: string | null
    /**
     * @description 分类id
     * @example dinner
     */
    slug: string | null
  }
  content: string
  photo: string
  total_views: Numeric
  total_comments: Numeric
  total_likes: Numeric
  /** @example "2025-04-24" */
  date?: string
}

export const sFullBlog = sCommonBlog.extend({
  nickname: sString,
  expInfo: sExpInfo,
  is_liked: z.boolean({ error: r => `isLiked is illegal. (Input ${JSON.stringify(r.input)})` })
})
export interface FullBlog extends CommonBlog {
  nickname: string
  expInfo: ExpInfo
  is_liked: boolean
}