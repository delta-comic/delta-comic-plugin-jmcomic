import { z } from 'zod'

export const sGender = z
  .enum(['Male', 'Female', 'null'], {
    error: r => `Gender is illegal. (Input ${JSON.stringify(r.input)})`
  })
  .nullable()
export type Gender = 'Male' | 'Female' | null

export const sBadge = z.object(
  {
    content: z.stringFormat('path', /^(\/[\w%\.\-\(\)]+)+\.\w+$/, 'Content is not a path.'),
    id: z.stringFormat('Numeric', /\d+/, 'Id is not a numeric string.'),
    name: z.string('Badge`s name is illegal.')
  },
  'Badge is illegal.'
)
export interface Badge {
  /**
   * @description 勋章图片路径，图是正方形
   * @example '/static/resources/images/%E5%8B%B3%E7%AB%A0/2021.8%E5%8B%B3%E7%AB%A0/maidragon_7.png'
   */
  content: string
  /**
   * @description 该勋章唯一id，本质数字
   * @description '175'
   */
  id: string
  /**
   * @description 由于勋章是人物头像，因此这个就是人物名称
   * @example '尔科亚'
   */
  name: string
}

export const sExpInfo = z.object(
  {
    level_name: z.string({
      error: r => `Level name is illegal. (Input: ${JSON.stringify(r.input)})`
    }),
    level: z.number({ error: r => `Level is illegal. (Input: ${JSON.stringify(r.input)})` }),
    exp: z.stringFormat('Numeric', /\d+/, {
      error: r => `Exp is not a numeric string. (Input: ${JSON.stringify(r.input)})`
    }),
    nextLevelExp: z.number({
      error: r => `NextLevelExp is illegal. (Input: ${JSON.stringify(r.input)})`
    }),
    expPercent: z.number({
      error: r => `ExpPercent is illegal. (Input: ${JSON.stringify(r.input)})`
    }),
    uid: z.stringFormat('Numeric', /\d+/, {
      error: r => `Uid is not a numeric string. (Input: ${JSON.stringify(r.input)})`
    }),
    badges: z.array(sBadge, {
      error: r => `Badges is illegal. (Input: ${JSON.stringify(r.input)})`
    })
  },
  'ExpInfo is illegal.'
)
export interface ExpInfo {
  /**
   * @description 用户实际使用的称号
   * @example '地上的月影'
   */
  level_name: string
  /**
   * @description 用户等级
   * @example 4
   */
  level: number
  /**
   * @description 当前经验值，本质数字
   * @example '1085'
   */
  exp: string
  /**
   * @description 下一等级总共所需的经验
   * @example 2100
   */
  nextLevelExp: number
  /**
   * @description 升级进度
   * @example 51.66666666666667
   */
  expPercent: number
  /**
   * @description 用户唯一id，本质数字
   * @example '11451419'
   */
  uid: string
  /**
   * @description 用户勋章
   */
  badges: Badge[]
}

export const sUserMe = sExpInfo.extend({
  ad_free: z.boolean({ error: r => `Ad free is illegal. (Input ${JSON.stringify(r.input)})` }),
  ad_free_before: z.string({
    error: r => `Ad free before is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  album_favorites: z.number({
    error: r => `Album favorites is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  album_favorites_max: z.number({
    error: r => `Album favorites max is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  charge: z.string({ error: r => `Charge is illegal. (Input ${JSON.stringify(r.input)})` }),
  coin: z.number({ error: r => `Coin is illegal. (Input ${JSON.stringify(r.input)})` }),
  email: z.string({ error: r => `Email is illegal. (Input ${JSON.stringify(r.input)})` }),
  emailverified: z.string({
    error: r => `Emailverified is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  fname: z.string({ error: r => `Fname is illegal. (Input ${JSON.stringify(r.input)})` }),
  gender: sGender,
  invitation_qrcode: z.string({
    error: r => `Invitation qrcode is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  invitation_url: z.string({
    error: r => `Invitation url is illegal. (Input ${JSON.stringify(r.input)})`
  }),
  invited_cnt: z.stringFormat('Numeric', /\d+/, {
    error: r => `Invited cnt is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  jar: z.string({ error: r => `Jar is illegal. (Input ${JSON.stringify(r.input)})` }),
  jwttoken: z
    .string({ error: r => `Jwt token is illegal. (Input ${JSON.stringify(r.input)})` })
    .optional(),
  message: z.string({ error: r => `Message is illegal. (Input ${JSON.stringify(r.input)})` }),
  photo: z.string({ error: r => `Photo is illegal. (Input ${JSON.stringify(r.input)})` }),
  s: z.string({ error: r => `S is illegal. (Input ${JSON.stringify(r.input)})` }),
  username: z.string({ error: r => `Username is illegal. (Input ${JSON.stringify(r.input)})` })
})
export interface UserMe extends ExpInfo {
  ad_free: boolean
  ad_free_before: string
  album_favorites: number
  album_favorites_max: number
  charge: string
  coin: number
  email?: string
  emailverified: string
  fname: string
  gender: Gender | null
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

export const sUserEdit = z.object(
  {
    aboutMe: z.string({ error: r => `AboutMe is illegal. (Input ${JSON.stringify(r.input)})` }),
    birthPlace: z.string({
      error: r => `BirthPlace is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    birthday: z.string({ error: r => `Birthday is illegal. (Input ${JSON.stringify(r.input)})` }),
    city: z.string({ error: r => `City is illegal. (Input ${JSON.stringify(r.input)})` }),
    collections: z.string({
      error: r => `Collections is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    company: z.string({ error: r => `Company is illegal. (Input ${JSON.stringify(r.input)})` }),
    country: z.string({ error: r => `Country is illegal. (Input ${JSON.stringify(r.input)})` }),
    erogenic: z.string({ error: r => `Erogenic is illegal. (Input ${JSON.stringify(r.input)})` }),
    email: z
      .string({ error: r => `Email is illegal. (Input ${JSON.stringify(r.input)})` })
      .optional(),
    favorite: z.string({ error: r => `Favorite is illegal. (Input ${JSON.stringify(r.input)})` }),
    firstName: z.string({ error: r => `FirstName is illegal. (Input ${JSON.stringify(r.input)})` }),
    gender: sGender,
    hate: z.string({ error: r => `Hate is illegal. (Input ${JSON.stringify(r.input)})` }),
    ideal: z.string({ error: r => `Ideal is illegal. (Input ${JSON.stringify(r.input)})` }),
    infoHere: z.string({ error: r => `InfoHere is illegal. (Input ${JSON.stringify(r.input)})` }),
    lastName: z.string({ error: r => `LastName is illegal. (Input ${JSON.stringify(r.input)})` }),
    nickName: z.string({ error: r => `NickName is illegal. (Input ${JSON.stringify(r.input)})` }),
    occupation: z.string({
      error: r => `Occupation is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    password: z.string({ error: r => `Password is illegal. (Input ${JSON.stringify(r.input)})` }),
    password_confirm: z.string({
      error: r => `Password confirm is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    relations: z.string({ error: r => `Relations is illegal. (Input ${JSON.stringify(r.input)})` }),
    school: z.string({ error: r => `School is illegal. (Input ${JSON.stringify(r.input)})` }),
    sexuality: z.string({ error: r => `Sexuality is illegal. (Input ${JSON.stringify(r.input)})` }),
    status: z.string({ error: r => `Status is illegal. (Input ${JSON.stringify(r.input)})` }),
    website: z.string({ error: r => `Website is illegal. (Input ${JSON.stringify(r.input)})` })
  },
  'UserEdit is illegal.'
)
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
  gender: Gender
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

export const sBadgeItem = sBadge.extend({
  type: z.literal('badge', { error: r => `Type is not badge. (Input ${JSON.stringify(r.input)})` }),
  coin: z.stringFormat('Numeric', /\d+/, {
    error: r => `Coin is not a numeric string. (Input ${JSON.stringify(r.input)})`
  }),
  rule: z.string({ error: r => `Rule is illegal. (Input ${JSON.stringify(r.input)})` }),
  begin_time: z.string({ error: r => `Begin time is illegal. (Input ${JSON.stringify(r.input)})` }),
  created_at: z.string({ error: r => `Created at is illegal. (Input ${JSON.stringify(r.input)})` }),
  updated_at: z.string({ error: r => `Updated at is illegal. (Input ${JSON.stringify(r.input)})` }),
  end_time: z.string({ error: r => `End time is illegal. (Input ${JSON.stringify(r.input)})` }),
  done: z.boolean({ error: r => `Done is illegal. (Input ${JSON.stringify(r.input)})` })
})
export interface BadgeItem extends Badge {
  type: 'badge'
  /**
   * @description 消耗的coin数量，本质数字
   * @example '120'
   */
  coin: string
  /**
   * @description 可用判定条件，本质json
   * @example '{"type":"buy","operator":"<","value":1,"unique":1}'
   */
  rule: string
  /**
   * @description 起售日期
   * @example "2021-05-06 00:00:00"
   */
  begin_time: string
  /**
   * @description 创建日期，通常与begin_time极为接近(相差<=1天)
   * @example "2021-05-06 13:48:16"
   */
  created_at: string
  /**
   * @description 更新日期，如果没有更新，则与created_at相同
   * @example "2021-05-06 13:48:16"
   */
  updated_at: string
  /**
   * @description 购买截止日期，疑似永不下架
   * @example 2080-05-06 23:59:59
   */
  end_time: string
  /**
   * @description 是否已经购买
   */
  done: boolean
}

export const sTitleItem = z.object(
  {
    id: z.stringFormat('Numeric', /\d+/, {
      error: r => `Id is not a numeric string. (Input ${JSON.stringify(r.input)})`
    }),
    name: z.string({ error: r => `Name is illegal. (Input ${JSON.stringify(r.input)})` }),
    type: z.literal('title', {
      error: r => `Type is not title. (Input ${JSON.stringify(r.input)})`
    }),
    content: z.string({ error: r => `Content is illegal. (Input ${JSON.stringify(r.input)})` }),
    coin: z.literal('0', { error: r => `Coin is not 0. (Input ${JSON.stringify(r.input)})` }),
    rule: z.string({ error: r => `Rule is illegal. (Input ${JSON.stringify(r.input)})` }),
    begin_time: z.string({
      error: r => `Begin time is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    end_time: z.string({ error: r => `End time is illegal. (Input ${JSON.stringify(r.input)})` }),
    created_at: z.string({
      error: r => `Created at is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    updated_at: z.string({
      error: r => `Updated at is illegal. (Input ${JSON.stringify(r.input)})`
    }),
    done: z.boolean({ error: r => `Done is illegal. (Input ${JSON.stringify(r.input)})` })
  },
  'TitleItem is illegal.'
)
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