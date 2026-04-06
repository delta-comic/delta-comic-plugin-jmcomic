export type Gender = 'Male' | 'Female' | 'null'
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

export interface BadgeItem extends Badge {
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