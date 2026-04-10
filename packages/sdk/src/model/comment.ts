import z from 'zod'

import { sExpInfo, sGender, type ExpInfo, type Gender } from './user'

export const sChildComment = z.object(
  {
    CID: z.stringFormat('Numeric', /\d+/, {
      error: r => `CID is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    AID: z
      .stringFormat('Numeric', /\d+/, {
        error: r => `AID is not a numeric string. (Input ${JSON.stringify(r.input)})`
      })
      .nullable()
      .optional(),
    BID: z
      .stringFormat('Numeric', /\d+/, {
        error: r => `BID is not a numeric string. (Input ${JSON.stringify(r.input)})`
      })
      .nullable()
      .optional(),
    NID: z
      .stringFormat('Numeric', /\d+/, {
        error: r => `NID is not a numeric string. (Input ${JSON.stringify(r.input)})`
      })
      .nullable()
      .optional(),
    NCID: z
      .stringFormat('Numeric', /\d+/, {
        error: r => `NCID is not a numeric string. (Input ${JSON.stringify(r.input)})`
      })
      .nullable()
      .optional(),
    UID: z.stringFormat('Numeric', /\d+/, {
      error: r => `UID is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    likes: z.stringFormat('Numeric', /\d+/, {
      error: r => `Likes is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    username: z.string({ error: r => `User name is illegal. (Input ${JSON.stringify(r.input)})` }),
    nickname: z.string({
      error: r => `User nick name is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    gender: sGender,
    update_at: z.string({ error: r => `update_at is illegal. (Input ${JSON.stringify(r.input)})` }),
    addtime: z.string({ error: r => `addtime is illegal. (Input ${JSON.stringify(r.input)})` }),
    parent_CID: z.string({
      error: r => `parent_CID is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    expinfo: sExpInfo,
    name: z
      .string({ error: r => `name is illegal. (Input ${JSON.stringify(r.input)})` })
      .nullable(),
    content: z.string({ error: r => `content is illegal. (Input ${JSON.stringify(r.input)})` }),
    photo: z.string({ error: r => `photo is illegal. (Input ${JSON.stringify(r.input)})` }),
    spoiler: z.string({ error: r => `spoiler is illegal. (Input ${JSON.stringify(r.input)})` })
  },
  'Comment is illegal.'
)
export interface ChildComment {
  /**
   * @description 评论id
   * @example '10215272'
   */
  CID: string
  /**
   * @description 漫画id
   * @example '350234'
   */
  AID?: string
  /**
   * @description 博客id
   * @example '1145'
   */
  BID?: string
  /**
   * @description 小说id
   */
  NID?: string
  NCID?: string
  /**
   * @description 用户id
   * @example ‘11451419’
   */
  UID: string
  /**
   * @description 用户注册名
   */
  username: string
  /**
   * @description 用户昵称，如果用户未设置昵称，则与`username`相同
   */
  nickname: string
  /**
   * @description 点赞数，本质number
   * @deprecated 评论没有任何方式点赞
   */
  likes: string
  /**
   * @description 性别
   */
  gender: Gender
  /**
   * @description 更新日期，本质number，大多情况为`"0"`
   * @example
   * "0"
   * "1639290342"
   */
  update_at: string
  /**
   * @description 发送时间
   * @example 'Apr 05, 2026'
   */
  addtime: string
  /**
   * @description 父评论id，没有则为`"0"`
   */
  parent_CID: string
  expinfo: ExpInfo
  /**
   * @description 不是用户名，是禁漫车牌号
   * @example "JM350234"
   */
  name: string | null
  /**
   * @description 评论内容，html格式，外层一定是<div>
   * @example
   * "<div style='flex-direction:row;flex-wrap:wrap;'>慕名而来</div>"
   */
  content: string
  /**
   * @description 头像路径
   * @example this.photo.startsWith('nopic') ? `你的fallback` : `/media/users/${this.photo}`
   * @example
   * 'nopic-Male.gif'
   * '2328401.jpg'
   */
  photo: string
  /**
   * @description 是否剧透，本质布尔值，但`boolean->number->string`；经实测，为真的数量占比异常巨大
   * @example
   * '1'
   * '0'
   */
  spoiler: string
}

export const sMainComment = sChildComment.extend({ replys: sChildComment.array().optional() })
export interface MainComment extends ChildComment {
  /**
   * @description 子评论，
   * @summary 接口就是这么个东西，错拼没人发现吗
   */
  replys?: ChildComment[]
}