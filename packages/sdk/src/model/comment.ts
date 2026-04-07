import type { ExpInfo, Gender } from './user'

export interface ChildComment {
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
   * @description 评论id
   * @example '10215272'
   */
  CID: string
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
  name: string
  /**
   * @description 评论内容，html格式，外层一定是<div>
   * @example
   * "<div style='flex-direction:row;flex-wrap:wrap;'>慕名而来</div>"
   */
  content: string
  /**
   * @description 头像路径
   * @deprecated 你不应当使用这个获得头像，使用`@example`中的拼接获取最合适(个人观点)
   * @example `/media/users/${this.uid}.jpg` // 个人认为最佳实践
   * @example
   * 'nopic-Male.gif
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

export interface MainComment extends ChildComment {
  /**
   * @description 子评论，
   * @summary 接口就是这么个东西，错拼没人发现吗
   */
  replys?: ChildComment[]
}