import type { ExpInfo, Gender } from './user'

export interface ChildComment {
  AID: string
  BID: string
  CID: string
  UID: string
  username: string
  nickname: string
  likes: string
  gender: Gender
  update_at: string
  addtime: string
  parent_CID: string
  expinfo: ExpInfo
  name: string
  content: string
  photo: string
  spoiler: string
}

export interface MainComment extends ChildComment {
  /**
   * @description 子评论，
   * @summary 接口就是这么个东西，错拼没人发现吗
   */
  replys?: ChildComment[]
}