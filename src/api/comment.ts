import { Stream, uni } from '@delta-comic/model'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import DOMPurify from 'dompurify'
import { isEmpty } from 'es-toolkit/compat'

import { pluginName } from '@/symbol'

import { jm } from '.'
import { _jmImage } from './image'
import { _jmUser } from './user'
dayjs.extend(customParseFormat)

export namespace _jmComment {
  export interface RawComment {
    AID: string
    BID: string
    CID: string
    UID: string
    username: string
    nickname: string
    likes: string
    gender: _jmUser.Gender
    update_at: string
    addtime: string
    parent_CID: string
    expinfo: _jmUser.RawExpInfo
    name: string
    content: string
    photo: string
    spoiler: string
    replys?: RawComment[]
  }
  export class Comment extends uni.comment.Comment {
    override $$meta: { raw: RawComment }
    override sender: _jmUser.CommentUser
    override async like(signal?: AbortSignal): Promise<boolean> {
      await jm.api.comment.likeComment(
        this.$$meta.raw.name.match(/\d+/g)?.[0] ?? '',
        this.id,
        signal
      )
      return Promise.resolve(false)
    }
    override report(_signal?: AbortSignal): PromiseLike<any> {
      window.$message.error('Method not implemented.')
      return Promise.resolve(undefined)
    }
    override sendComment(text: string, signal?: AbortSignal): PromiseLike<any> {
      const raw: RawComment = this.$$meta!.raw
      if (isEmpty(raw.parent_CID)) {
        return jm.api.comic.sendComment(raw.AID, text, false, signal)
      }
      return jm.api.comic.sendChildComment(raw.AID, raw.parent_CID, text, false, signal)
    }
    override children
    constructor(v: RawComment) {
      const sender = new _jmUser.CommentUser(v)
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
      this.children = Stream.create<Comment>(function* () {
        yield v.replys?.map(v => new Comment(v)) ?? []
      })
    }
  }
}