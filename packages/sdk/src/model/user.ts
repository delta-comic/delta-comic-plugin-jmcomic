import type { Numeric } from './utils'

export * from './generated/user'

/**
 * @zod
 * @schema union([z.enum(['Male', 'Female']), z.null(), z.literal('null').transform(() => null), z.literal('').transform(() => null)])
 */
export type Gender = 'Male' | 'Female' | null

/** @zod */
export interface Badge {
  /**
   * @description 勋章图片路径，图是正方形
   * @example '/static/resources/images/%E5%8B%B3%E7%AB%A0/2021.8%E5%8B%B3%E7%AB%A0/maidragon_7.png'
   */
  content: string
  /**
   * @description 该勋章唯一id，本质数字
   * @example '175'
   */
  id: Numeric
  /**
   * @description 由于勋章是人物头像，因此这个就是人物名称
   * @example '尔科亚'
   */
  name: string
}

/** @zod */
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
  level: Numeric
  /**
   * @description 当前经验值，本质数字
   * @example '1085'
   */
  exp: Numeric
  /**
   * @description 下一等级总共所需的经验
   * @example 2100
   */
  nextLevelExp: Numeric
  /**
   * @description 升级进度
   * @example 51.66666666666667
   */
  expPercent: Numeric
  /**
   * @description 用户唯一id，本质数字
   * @example '11451419'
   */
  uid: Numeric
  /**
   * @description 用户勋章
   */
  badges: Badge[]
}

/** @zod */
export interface UserMe extends ExpInfo {
  ad_free: boolean
  ad_free_before: string
  album_favorites: Numeric
  album_favorites_max: Numeric
  charge: string
  coin: Numeric
  email?: string
  emailverified: string
  fname: string
  gender: Gender | null
  invitation_qrcode: string
  invitation_url: string
  invited_cnt: Numeric
  jar: string
  jwttoken?: string
  message: string
  photo: string
  s: string
  username: string
}

/** @zod */
export interface UserEdit {
  aboutMe: string
  birthPlace: string
  birthday: string
  city: string
  collections: string
  company: string
  country: string
  erogenic: string
  email?: string
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

/** @zod */
export interface BadgeItem extends Badge {
  type: 'badge'
  /**
   * @description 消耗的coin数量，本质数字
   * @example '120'
   */
  coin: Numeric
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

/** @zod */
export interface TitleItem {
  /** @pattern ^\d+$ */
  id: string
  name: string
  type: 'title'
  content: string
  coin: '0'
  rule: string
  begin_time: string
  end_time: string
  created_at: string
  updated_at: string | null
  done: boolean
}