import z from 'zod'

import { sExpInfo, sGender, type ExpInfo, type Gender } from './user'
import { sNumeric, sString, type Numeric } from './utils'

export const sChildComment = z.object(
  {
    CID: sNumeric,
    AID: sNumeric.nullable().optional(),
    BID: sNumeric.nullable().optional(),
    NID: sNumeric.nullable().optional(),
    NCID: sNumeric.nullable().optional(),
    UID: sNumeric,
    likes: sNumeric,
    username: sString,
    nickname: sString,
    gender: sGender,
    update_at: sNumeric,
    addtime: sString,
    parent_CID: sNumeric,
    expinfo: sExpInfo,
    name: sString.nullable(),
    content: sString,
    photo: sString,
    spoiler: sNumeric
  },
  'Comment is illegal.'
)
export interface ChildComment {
  /**
   * @description 评论id
   * @example '10215272'
   */
  CID: Numeric
  /**
   * @description 漫画id
   * @example '350234'
   */
  AID?: Numeric
  /**
   * @description 博客id
   * @example '1145'
   */
  BID?: Numeric
  /**
   * @description 小说id
   */
  NID?: Numeric
  NCID?: Numeric
  /**
   * @description 用户id
   * @example ‘11451419’
   */
  UID: Numeric
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
  likes: Numeric
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
  update_at: Numeric
  /**
   * @description 发送时间
   * @example 'Apr 05, 2026'
   */
  addtime: string
  /**
   * @description 父评论id，没有则为`"0"`
   */
  parent_CID: Numeric
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
   * @description 是否剧透，本质布尔值，但`boolean->(number + 1)->string`
   * @example
   * '1' // false
   * '2' // true
   */
  spoiler: Numeric
}

export const sMainComment = sChildComment.extend({ replys: sChildComment.array().optional() })
export interface MainComment extends ChildComment {
  /**
   * @description 子评论，
   * @ps 接口就是这么个东西，错拼没人发现吗
   */
  replys?: ChildComment[]
}

export interface NovelComment {}