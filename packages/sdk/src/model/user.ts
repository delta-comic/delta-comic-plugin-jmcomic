import { z } from 'zod'

export const sGender = z.enum(['Male', 'Female', 'null'], 'Gender is illegal.')
export type Gender = 'Male' | 'Female' | 'null'

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
    level_name: z.string('Level name is illegal.'),
    level: z.number('Level is illegal.'),
    exp: z.stringFormat('Numeric', /\d+/, 'Exp is not a numeric string.'),
    nextLevelExp: z.stringFormat('Numeric', /\d+/, 'NextLevelExp is not a numeric string.'),
    expPercent: z.number('ExpPercent is illegal.'),
    uid: z.stringFormat('Numeric', /\d+/, 'Uid is not a numeric string.'),
    badges: z.array(sBadge, 'Badges is illegal.')
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
  nextLevelExp: string
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
  ad_free: z.boolean('Ad free is illegal.'),
  ad_free_before: z.string('Ad free before is illegal.'),
  album_favorites: z.number('Album favorites is illegal.'),
  album_favorites_max: z.number('Album favorites max is illegal.'),
  charge: z.string('Charge is illegal.'),
  coin: z.number('Coin is illegal.'),
  email: z.string('Email is illegal.'),
  emailverified: z.string('Emailverified is illegal.'),
  fname: z.string('Fname is illegal.'),
  gender: sGender,
  invitation_qrcode: z.string('Invitation qrcode is illegal.'),
  invitation_url: z.string('Invitation url is illegal.'),
  invited_cnt: z.stringFormat('Numeric', /\d+/, 'Invited cnt is not a numeric string.'),
  jar: z.string('Jar is illegal.'),
  jwttoken: z.string().optional(),
  message: z.string('Message is illegal.'),
  photo: z.string('Photo is illegal.'),
  s: z.string('S is illegal.'),
  username: z.string('Username is illegal.')
})
export interface UserMe extends ExpInfo {
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

export const sUserEdit = z.object(
  {
    aboutMe: z.string('AboutMe is illegal.'),
    birthPlace: z.string('BirthPlace is illegal.'),
    birthday: z.string('Birthday is illegal.'),
    city: z.string('City is illegal.'),
    collections: z.string('Collections is illegal.'),
    company: z.string('Company is illegal.'),
    country: z.string('Country is illegal.'),
    erogenic: z.string('Erogenic is illegal.'),
    email: z.string('Email is illegal.'),
    favorite: z.string('Favorite is illegal.'),
    firstName: z.string('FirstName is illegal.'),
    gender: z.string('Gender is illegal.'),
    hate: z.string('Hate is illegal.'),
    ideal: z.string('Ideal is illegal.'),
    infoHere: z.string('InfoHere is illegal.'),
    lastName: z.string('LastName is illegal.'),
    nickName: z.string('NickName is illegal.'),
    occupation: z.string('Occupation is illegal.'),
    password: z.string('Password is illegal.'),
    password_confirm: z.string('Password confirm is illegal.'),
    relations: z.string('Relations is illegal.'),
    school: z.string('School is illegal.'),
    sexuality: z.string('Sexuality is illegal.'),
    status: z.string('Status is illegal.'),
    website: z.string('Website is illegal.')
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

export const sBadgeItem = sBadge.extend({
  type: z.literal('badge', 'Type is not badge.'),
  coin: z.stringFormat('Numeric', /\d+/, 'Coin is not a numeric string.'),
  rule: z.string('Rule is illegal.'),
  begin_time: z.string('Begin time is illegal.'),
  created_at: z.string('Created at is illegal.'),
  updated_at: z.string('Updated at is illegal.'),
  end_time: z.string('End time is illegal.'),
  done: z.boolean('Done is illegal.')
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
    id: z.stringFormat('Numeric', /\d+/, 'Id is not a numeric string.'),
    name: z.string('Name is illegal.'),
    type: z.literal('title', 'Type is not title.'),
    content: z.string('Content is illegal.'),
    coin: z.literal('0', 'Coin is not 0.'),
    rule: z.string('Rule is illegal.'),
    begin_time: z.string('Begin time is illegal.'),
    end_time: z.string('End time is illegal.'),
    created_at: z.string('Created at is illegal.'),
    updated_at: z.string('Updated at is illegal.'),
    done: z.boolean('Done is illegal.')
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