import z from 'zod'

import { type Gender, type ExpInfo, sGender, sExpInfo } from './user'

export const sCommonBlog = z.object(
  {
    id: z.stringFormat('Numeric', /\d+/, {
      error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    uid: z.stringFormat('Numeric', /\d+/, {
      error: r => `Uid is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    gid: z
      .stringFormat('Numeric', /\d+/, {
        error: r => `Gid is not a numeric string. (Input ${JSON.stringify(r.input)})`
      })
      .nullable()
      .optional(),
    total_views: z.stringFormat('Numeric', /\d+/, {
      error: r => `total_views is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    total_comments: z.stringFormat('Numeric', /\d+/, {
      error: r => `total_comments is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    total_likes: z.stringFormat('Numeric', /\d+/, {
      error: r => `total_likes is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    username: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` }),
    user_photo: z
      .string({ error: r => `Avatar is illegal. (Input ${JSON.stringify(r.input)})` })
      .nullable()
      .optional(),
    gender: sGender.optional(),
    game_url: z
      .string({ error: r => `Game url is illegal. (Input ${JSON.stringify(r.input)})` })
      .nullable()
      .optional(),
    title: z.string({ error: r => `Title is illegal. (Input ${JSON.stringify(r.input)})` }),
    tags: z.string({ error: r => `Tag is illegal. (Input ${JSON.stringify(r.input)})` }).array(),
    category: z.object({ name: z.string().nullable(), slug: z.string().nullable() }),
    content: z.string({ error: r => `Content is illegal. (Input ${JSON.stringify(r.input)})` }),
    photo: z.string({ error: r => `Cover is illegal. (Input ${JSON.stringify(r.input)})` }),
    date: z.string({ error: r => `Date is illegal. (Input ${JSON.stringify(r.input)})` }).optional()
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
    name: string | null
    /**
     * @description 分类id
     * @example dinner
     */
    slug: string | null
  }
  content: string
  photo: string
  total_views: string
  total_comments: string
  total_likes: string
  /** @example "2025-04-24" */
  date?: string
}

export const sFullBlog = sCommonBlog.extend({
  nickname: z.string({
    error: r => `User nick name is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  expInfo: sExpInfo,
  is_liked: z.boolean({ error: r => `isLiked is illegal. (Input ${JSON.stringify(r.input)})` })
})
export interface FullBlog extends CommonBlog {
  nickname: string
  expInfo: ExpInfo
  is_liked: boolean
}