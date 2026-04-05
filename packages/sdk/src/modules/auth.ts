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
    await this.logout(signal)
    const ky = this.sdk.requester.create()
    const result = ky.post<UserMe>(this.sdk.config.apiPath.login, {
      body: jsonToFormData(data),
      signal
    })
    const user = await result.json()

    return (this.user = { user, data })
  }

  /**
   * @deprecated 实际上并非弃用，该接口为实验性功能，不确保内容可以正常使用
   */
  public signUp(data: SignupData, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    return ky
      .post<void>(this.sdk.config.apiPath.signup, { body: jsonToFormData(data), signal })
      .text()
  }

  public async logout(signal?: AbortSignal) {
    if (!this.user) return
    const ky = this.sdk.requester.create()
    await ky.post(this.sdk.config.apiPath.logout, { signal }).text()
    this.user = undefined
  }
}