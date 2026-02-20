import { uni } from '@delta-comic/model'

import { pluginName } from '@/symbol'

import type { _jmBlog } from './blog'
import type { _jmComment } from './comment'
import { _jmImage } from './image'

export namespace _jmUser {
  export type Gender = 'Male' | 'Female'
  export interface RawBadge {
    content: string
    id: string
    name: string
  }
  export class Badge implements RawBadge {
    public content: string
    public get $content() {
      return uni.image.Image.create({
        $$plugin: pluginName,
        type: 'default',
        pathname: this.content
      })
    }
    public id: string
    public name: string
    constructor(v: RawBadge) {
      this.content = v.content
      this.id = v.id
      this.name = v.name
    }
  }

  export interface RawExpInfo {
    level_name: string
    level: number
    nextLevelExp: string
    exp: string
    expPercent: number
    uid: string
    badges: RawBadge[]
  }
  export class ExpInfo implements RawExpInfo {
    public level_name: string
    public level: number
    public nextLevelExp: string
    public get $nextLevelExp() {
      return Number(this.nextLevelExp)
    }
    public exp: string
    public get $exp() {
      return Number(this.exp)
    }
    public expPercent: number
    public uid: string
    public get $uid() {
      return Number(this.uid)
    }
    public badges: RawBadge[]
    public get $badges() {
      return this.badges.map(v => new Badge(v))
    }
    constructor(v: RawExpInfo) {
      this.level_name = v.level_name
      this.level = v.level
      this.nextLevelExp = v.nextLevelExp
      this.exp = v.exp
      this.expPercent = v.expPercent
      this.uid = v.uid
      this.badges = v.badges
    }
  }

  export interface RawUserMe extends RawExpInfo {
    ad_free: boolean
    ad_free_before: string
    album_favorites: number
    album_favorites_max: number
    charge: string
    coin: number
    email: string
    emailverified: string
    fname: string
    gender: Gender
    invitation_qrcode: string
    invitation_url: string
    invited_cnt: string
    jar: string
    jwttoken?: string
    message: string
    photo: string
    s: string
    username: string
  }
  export class UserMe extends uni.user.User {
    override customUser
    constructor(v: RawUserMe) {
      super({
        id: v.uid,
        name: v.username,
        avatar: { $$plugin: pluginName, type: 'default', pathname: `/media/users/${v.uid}.jpg` },
        $$plugin: pluginName
      })
      this.customUser = { user: v, expInfo: new ExpInfo(v) }
    }
  }

  export class CommentUser extends uni.user.User {
    public static is(v: unknown): v is CommentUser {
      return v instanceof CommentUser
    }
    override customUser
    constructor(c: _jmComment.RawComment) {
      super({
        id: c.UID,
        name: c.username,
        avatar: c.photo.includes('nopic')
          ? undefined
          : { $$plugin: pluginName, type: 'default', pathname: `/media/users/${c.photo}` },
        $$plugin: pluginName
      })
      this.customUser = { user: c, expInfo: new ExpInfo(c.expinfo) }
    }
  }

  export class BlogUser extends uni.user.User {
    public static is(v: unknown): v is BlogUser {
      return v instanceof BlogUser
    }
    override customUser
    constructor(c: _jmBlog.RawFullBlog | _jmBlog.RawCommonBlog) {
      super({
        id: c.uid,
        name: c.username,
        avatar: c.photo.includes('nopic')
          ? undefined
          : { $$plugin: pluginName, type: 'default', pathname: `/media/users/${c.uid}.jpg` },
        $$plugin: pluginName
      })
      this.customUser = { user: c, expInfo: 'expInfo' in c ? new ExpInfo(c.expInfo) : undefined }
    }
  }

  export interface UserEdit {
    aboutMe: string
    birthPlace: string
    birthday: string
    city: string
    collections: string
    company: string
    country: string
    erogenic: string
    email: string
    favorite: string
    firstName: string
    gender: string
    hate: string
    ideal: string
    infoHere: string
    lastName: string
    nickName: string
    occupation: string
    password: string
    password_confirm: string
    relations: string
    school: string
    sexuality: string
    status: string
    website: string
  }

  export interface BadgeItem extends RawBadge {
    type: 'badge'
    coin: string
    rule: string
    begin_time: string // 2021-05-06 00:00:00
    end_time: string //2080-05-06 23:59:59
    created_at: string //2021-05-06 13:48:16
    updated_at: string // 2021-05-06 13:48:16
    done: boolean //是否已经购买
  }
  export interface TitleItem {
    id: string
    name: string
    type: 'title'
    content: string
    coin: '0'
    rule: string
    begin_time: string
    end_time: string
    created_at: string
    updated_at: string
    done: boolean
  }
}