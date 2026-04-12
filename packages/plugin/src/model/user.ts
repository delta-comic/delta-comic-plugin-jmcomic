import { uni } from '@delta-comic/model'

import { pluginName } from '../symbol'

// export class UserMe extends uni.user.User {
//   override customUser
//   constructor(v: RawUserMe) {
//     super({
//       id: v.uid,
//       name: v.username,
//       avatar: { $$plugin: pluginName, type: 'default', pathname: `/media/users/${v.uid}.jpg` },
//       $$plugin: pluginName
//     })
//     this.customUser = { user: v, expInfo: new ExpInfo(v) }
//   }
// }

// export class CommentUser extends uni.user.User {
//   public static is(v: unknown): v is CommentUser {
//     return v instanceof CommentUser
//   }
//   override customUser
//   constructor(c: RawComment) {
//     super({
//       id: c.UID,
//       name: c.username,
//       avatar: c.photo.includes('nopic')
//         ? undefined
//         : { $$plugin: pluginName, type: 'default', pathname: `/media/users/${c.photo}` },
//       $$plugin: pluginName
//     })
//     this.customUser = { user: c, expInfo: new ExpInfo(c.expinfo) }
//   }
// }

// export class BlogUser extends uni.user.User {
//   public static is(v: unknown): v is BlogUser {
//     return v instanceof BlogUser
//   }
//   override customUser
//   constructor(c: _jmBlog.RawFullBlog | _jmBlog.RawCommonBlog) {
//     super({
//       id: c.uid,
//       name: c.username,
//       avatar: c.photo.includes('nopic')
//         ? undefined
//         : { $$plugin: pluginName, type: 'default', pathname: `/media/users/${c.uid}.jpg` },
//       $$plugin: pluginName
//     })
//     this.customUser = { user: c, expInfo: 'expInfo' in c ? new ExpInfo(c.expInfo) : undefined }
//   }
// }

export class JmUser extends uni.user.User {
  public static fromComment(comment: CommentLike) {}
}