import type { JMComic } from '..'
import { jsonToFormData } from '../helpers'
import type { Gender, UserMe } from '../model/user'

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

export interface LoginUser {
  data: LoginData
  user: UserMe
}

export class Auth {
  constructor(protected sdk: JMComic) {}
  public user?: LoginUser

  public async login(data: LoginData, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const result = ky.post<UserMe>(this.sdk.config.apiPath.login, {
      body: jsonToFormData(data),
      signal
    })
    return (this.user = { user: await result.json(), data })
  }

  public signUp(data: SignupData, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return ky
      .post<void>(this.sdk.config.apiPath.signup, { body: jsonToFormData(data), signal })
      .text()
  }

  public async logout(signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    await ky.post(this.sdk.config.apiPath.logout, { signal }).text()
    this.user = undefined
  }
}