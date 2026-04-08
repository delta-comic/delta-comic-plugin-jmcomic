import type { JMComic } from '..'
import { jsonToFormData } from '../helpers'
import type { LoginData, LoginUser } from '../model/auth'
import type { Gender, UserMe } from '../model/user'

export class Auth {
  constructor(protected sdk: JMComic) {}
  public user?: LoginUser

  /**
   * @param data 不传值仅仅只是dev测试方便，实战必须传值，不传会报错
   */
  public async login(data?: LoginData, signal?: AbortSignal) {
    if (!data) {
      // 这个账号是公开账号
      if (import.meta.env.DEV) data = { password: '1q2w3e4r', username: '_wenxig' }
      else throw new Error('Login must have data param in production mode!')
    }

    await this.logout(signal)
    const ky = this.sdk.requester.create()
    const result = ky.post<UserMe>(this.sdk.config.apiPath.auth_login, {
      body: jsonToFormData(data),
      signal
    })
    const user = await result.json()

    return (this.user = { user, data })
  }

  /**
   * @deprecated 实际上并非弃用，该接口为实验性功能，不确保内容可以正常使用
   */
  public signUp(
    data: {
      email: string
      gender: Gender
      password: string
      password_confirm: string
      username: string
    },
    signal?: AbortSignal
  ) {
    const ky = this.sdk.requester.create()
    return ky
      .post<void>(this.sdk.config.apiPath.auth_signup, { body: jsonToFormData(data), signal })
      .text()
  }

  public async logout(signal?: AbortSignal) {
    if (!this.user) return
    const ky = this.sdk.requester.create()
    await ky.post(this.sdk.config.apiPath.auth_logout, { signal }).text()
    this.user = undefined
  }

  public async forgetPassword(data: { email: string }, signal?: AbortSignal) {
    const ky = this.sdk.requester.create()
    const result = await ky
      .post<never>(this.sdk.config.apiPath.auth_forgetPassword, {
        body: jsonToFormData({ email: data.email }),
        signal
      })
      .json()
    return result
  }
}