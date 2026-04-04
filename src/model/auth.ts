import type { Gender } from './user'

export interface LoginData {
  username: string
  password: string
}
export interface SignupData {
  email: string
  gender: Gender
  password: string
  password_confirm: string
  username: string
}