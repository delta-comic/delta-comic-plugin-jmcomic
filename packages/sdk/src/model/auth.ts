import type { UserMe } from "./user"

export interface LoginData {
  username: string
  password: string
}
export interface LoginUser {
  data: LoginData
  user: UserMe
}
