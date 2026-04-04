import {} from 'ofetch'

import { jsonToFormData } from '@/helpers'
import type { Gender, UserMe } from '@/model/user'

import type { JMComic } from '..'

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
  public loginUsers = new Array<[username: string, user: LoginUser]>()
  public get latestUser() {
    return this.loginUsers.at(-1)?.[1]
  }

  public login(data: LoginData, signal?: AbortSignal) {
    const fetch = this.sdk.requester.create({}, null)
    return fetch(this.sdk.config.apiPath.login, {
      body: jsonToFormData(data),
      signal,
      method: 'POST'
    })
  }

  public signUp(data: SignupData, signal?: AbortSignal) {
    const fetch = this.sdk.requester.create({}, null)
    return fetch(this.sdk.config.apiPath.signup, {
      body: jsonToFormData(data),
      signal,
      method: 'POST'
    })
  }

  public logout(signal?: AbortSignal, usingUser = this.latestUser) {
    const fetch = this.sdk.requester.create({}, usingUser)
    fetch(this.sdk.config.apiPath.logout, { signal, method: 'POST' })
  }
}