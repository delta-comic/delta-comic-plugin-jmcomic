import z from 'zod'

import { type Gender, type ExpInfo, sGender, sExpInfo } from './user'

export const sCommonBlog = z.object(
  {
    id: z.stringFormat('Numeric', /\d+/, 'Id is not a numeric string.'),
    uid: z.stringFormat('Numeric', /\d+/, 'Uid is not a numeric string.'),
    username: z.string(),
    user_photo: z.string().nullable().optional(),
    gender: sGender,
    game_url: z.string().nullable().optional(),
    gid: z.stringFormat('Numeric', /\d+/, 'Gid is not a numeric string.').nullable().optional(),
    title: z.string(),
    tags: z.string().array(),
    category: z.object({ name: z.string(), slug: z.string() }),
    content: z.string(),
    photo: z.string(),
    total_views: z.stringFormat('Numeric', /\d+/, 'total_views is not a numeric string.'),
    total_comments: z.stringFormat('Numeric', /\d+/, 'total_comments is not a numeric string.'),
    total_likes: z.stringFormat('Numeric', /\d+/, 'total_likes is not a numeric string.'),
    date: z.date('Date is illegal.')
  },
  'CommonBlog is illegal.'
)
export interface CommonBlog {
  /**
   * @description 这个字段是blog的唯一id，本质数字
   * @example '1145'
   * @alias `BID`
   */
  id: string
  uid: string
  username: string
  user_photo: null | string
  gender: Gender
  game_url: string
  gid: string
  title: string
  /**
   * @description 标签，但是，虽然是数组，但是标签被塞在一个数组，由逗号分隔，但也有特例
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
    name: string
    /**
     * @description 分类id
     * @example dinner
     */
    slug: string
  }
  content: string
  photo: string
  total_views: string
  total_comments: string
  total_likes: string
  /** @example "2025-04-24" */
  date: string
}

export const sFullBlog = sCommonBlog.extend({
  nickname: z.string(),
  expInfo: sExpInfo,
  is_liked: z.boolean()
})
export interface FullBlog extends CommonBlog {
  nickname: string
  expInfo: ExpInfo
  is_liked: boolean
}