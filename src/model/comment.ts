import { uni } from '@delta-comic/model'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import DOMPurify from 'dompurify'
import { isEmpty } from 'es-toolkit/compat'

import { sendChildComment, sendComment } from '@/api/comic'
import { likeComment } from '@/api/comment'
import { pluginName } from '@/symbol'

import { Gender, RawExpInfo, CommentUser } from './user'
dayjs.extend(customParseFormat)

export interface RawComment {
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
  expinfo: RawExpInfo
  name: string
  content: string
  photo: string
  spoiler: string
  replys?: RawComment[]
}
export class Comment extends uni.comment.Comment {
  override $$meta: { raw: RawComment }
  override sender: CommentUser
  override async like(signal?: AbortSignal): Promise<boolean> {
    await likeComment(this.$$meta.raw.name.match(/\d+/g)?.[0] ?? '', this.id, signal)
    return Promise.resolve(false)
  }
  override report(_signal?: AbortSignal): PromiseLike<any> {
    window.$message.error('Method not implemented.')
    return Promise.resolve(undefined)
  }
  override sendComment(text: string, signal?: AbortSignal): PromiseLike<any> {
    const raw: RawComment = this.$$meta!.raw
    if (isEmpty(raw.parent_CID)) {
      return sendComment(raw.AID, text, false, signal)
    }
    return sendChildComment(raw.AID, raw.parent_CID, text, false, signal)
  }
  public override fetchChildren
  constructor(v: RawComment) {
    const sender = new CommentUser(v)
    super({
      $$plugin: pluginName,
      childrenCount: v.replys?.length ?? 0,
      content: { text: DOMPurify.sanitize(v.content), type: 'html' },
      id: v.CID,
      isLiked: false,
      isTop: false,
      likeCount: Number(v.likes),
      reported: false,
      sender,
      time: (() => {
        const date = dayjs(v.addtime, 'MMM D, YYYY')
        if (v.update_at != '0') {
          const time = dayjs(Number(v.update_at))
          date.set('hour', time.hour())
          date.set('minute', time.minute())
          date.set('second', time.second())
          date.set('millisecond', time.millisecond())
        }
        return date.toDate().getTime()
      })()
    })
    this.$$meta = { raw: v }
    this.sender = sender

    this.fetchChildren = Object.assign(async () => v.replys?.map(v => new Comment(v)) ?? [], {
      initialPageParam: 0
    })
  }
}