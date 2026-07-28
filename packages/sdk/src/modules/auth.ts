import { z } from 'zod'

import type { Gender, JMComic, JmSession, LoginData, LoginUser } from '..'
import { jsonToFormData } from '../helpers'
import { sUserMe } from '../model/user'

export interface SignUpData {
  email: string
  gender: Gender
  password: string
  password_confirm: string
  username: string
}

export class Auth {
  public user?: LoginUser
  private restoredSession?: JmSession

  public constructor(
    protected readonly sdk: JMComic,
    session?: JmSession,
  ) {
    if (session) this.restoreSession(session)
  }

  public get session(): JmSession | undefined {
    if (this.user) {
      return {
        username: this.user.username,
        token: this.user.user.jwttoken,
        avs: this.user.user.s,
        user: this.user.user,
      }
    }
    return this.restoredSession
  }

  public restoreSession(session: JmSession): void {
    this.restoredSession = { ...session }
    this.user = session.user ? { username: session.username, user: session.user } : undefined
  }

  public clearSession(): void {
    this.user = undefined
    this.restoredSession = undefined
  }

  public async login(data: LoginData, signal?: AbortSignal): Promise<LoginUser> {
    const user = await this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.auth.login,
      sUserMe,
      { body: jsonToFormData(data), signal },
    )
    const loginUser = { data, username: data.username, user } satisfies LoginUser
    this.user = loginUser
    this.restoredSession = undefined
    return loginUser
  }

  public async signUp(data: SignUpData, signal?: AbortSignal): Promise<string> {
    return this.sdk.requester
      .create()
      .post(this.sdk.config.apiPath.auth.signUp, { body: jsonToFormData(data), signal })
      .text()
  }

  public async logout(signal?: AbortSignal): Promise<void> {
    const hasSession = Boolean(this.session?.token)
    try {
      if (hasSession)
        await this.sdk.requester
          .create()
          .post(this.sdk.config.apiPath.auth.logout, { signal })
          .text()
    } finally {
      this.clearSession()
    }
  }

  public forgetPassword(
    data: { email: string },
    signal?: AbortSignal,
  ): Promise<{ message?: string }> {
    return this.sdk.requester.request(
      'post',
      this.sdk.config.apiPath.auth.forgetPassword,
      z.object({ message: z.string().optional() }).loose(),
      { body: jsonToFormData(data), signal },
    )
  }
}