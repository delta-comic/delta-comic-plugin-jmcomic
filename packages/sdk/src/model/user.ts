export type Gender = 'Male' | 'Female'
export interface Badge {
  content: string
  id: string
  name: string
}

export interface ExpInfo {
  level_name: string
  level: number
  nextLevelExp: string
  exp: string
  expPercent: number
  uid: string
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