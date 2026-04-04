import { AES, ECB, MD5, Utf8 } from 'crypto-es'
import { isArray, isNull, isString } from 'es-toolkit/compat'
import { ofetch, type FetchOptions } from 'ofetch'

import type { JMComic } from '..'

import type { LoginUser } from './auth'

export class Requester {
  constructor(protected sdk: JMComic) {}
  private static innerHeaderKey = 'Jm-Key'
  /**
   * @description 从config创建ofetch实例
   */
  public create(overrideConfig: FetchOptions = {}, usingUser: LoginUser | null = null) {
    const user = isNull(usingUser) ? undefined : (usingUser ?? this.sdk.auth.latestUser)
    const {
      requestTimeout: timeout,
      requestRetry: retry,
      requestUsingFork: baseURL
    } = this.sdk.config

    return ofetch.create({
      timeout,
      retry,
      baseURL,
      onRequest(config) {
        const authorization = user?.user.jwttoken ?? ''
        const key = Date.now().toString()
        const token = MD5(`${key}185Hcomic3PAPP7R`).toString()
        const tokenParam = `${key},1.7.9`
        config.options.headers.set(Requester.innerHeaderKey, key)
        config.options.headers.set('Token', token)
        config.options.headers.set('Tokenparam', tokenParam)
        if (authorization) config.options.headers.set('Authorization', `Bearer ${authorization}`)
        const baseHeader = { Version: 'v1.2.9' }
        for (const key in baseHeader) {
          if (Object.prototype.hasOwnProperty.call(baseHeader, key)) {
            const element = baseHeader[<keyof typeof baseHeader>key]
            config.options.headers.set(key, element)
          }
        }
      },
      async onResponse(config) {
        const jmKey = config.response.headers.get(Requester.innerHeaderKey)
        if (!jmKey) return
        const body = (await config.response.json()) as {
          data?: string | []
          code: number
          message: string
          error?: string
        }
        const keyTemplates: string[] = ['185Hcomic3PAPP7R', '18comicAPPContent'] // 预定义的密钥模板
        const decrypt = (cipherText: string) => {
          for (const template of keyTemplates) {
            try {
              const dynamicKey = MD5(`${jmKey}${template}`).toString()
              const decrypted = AES.decrypt(cipherText, Utf8.parse(dynamicKey), { mode: ECB })
              return JSON.parse(decrypted.toString(Utf8))
            } catch {
              continue
            }
          }
          console.error('Decryption failed', body, cipherText)
          throw new Error('Decryption failed')
        }
        if (!body.data) return body.data
        if (isArray(body) || !isString(body.data)) throw new Error(JSON.stringify(body))

        return decrypt(body.data)
      },
      ...overrideConfig
    })
  }
}