import { AES, ECB, MD5, Utf8 } from 'crypto-es'
import { isArray, isString, merge } from 'es-toolkit/compat'
import ky, { type Options } from 'ky'

import type { JMComic } from '..'

export class Requester {
  constructor(protected sdk: JMComic) {}
  private static innerHeaderKey = 'Jm-Key'
  /**
   * @description 从config创建ofetch实例
   */
  public create(overrideConfig: Options = {}) {
    const user = this.sdk.auth.user
    const {
      requestTimeout: timeout,
      requestRetry: retry,
      requestUsingFork: baseUrl
    } = this.sdk.config

    return ky.create(
      merge<Options, Options>(
        {
          timeout,
          retry,
          baseUrl,
          hooks: {
            beforeRequest: [
              ({ request }) => {
                const authorization = user?.user.jwttoken ?? ''
                const key = Date.now().toString()
                const token = MD5(`${key}185Hcomic3PAPP7R`).toString()
                const tokenParam = `${key},1.7.9`
                request.headers.set(Requester.innerHeaderKey, key)
                request.headers.set('Token', token)
                request.headers.set('Tokenparam', tokenParam)
                if (authorization) request.headers.set('Authorization', `Bearer ${authorization}`)
                const baseHeader = { Version: 'v1.2.9' }
                for (const key in baseHeader) {
                  if (Object.prototype.hasOwnProperty.call(baseHeader, key)) {
                    const element = baseHeader[<keyof typeof baseHeader>key]
                    request.headers.set(key, element)
                  }
                }
              }
            ],
            afterResponse: [
              async ({ request, response }) => {
                const jmKey = request.headers.get(Requester.innerHeaderKey)
                if (!jmKey) return
                try {
                  var body = (await response.json()) as {
                    data?: string | []
                    code: number
                    message: string
                    error?: string
                  }
                } catch {
                  return
                }
                const keyTemplates: string[] = ['185Hcomic3PAPP7R', '18comicAPPContent'] // 预定义的密钥模板
                const decrypt = (cipherText: string) => {
                  for (const template of keyTemplates) {
                    try {
                      const dynamicKey = MD5(`${jmKey}${template}`).toString()
                      const decrypted = AES.decrypt(cipherText, Utf8.parse(dynamicKey), {
                        mode: ECB
                      })
                      return decrypted.toString(Utf8)
                    } catch {
                      continue
                    }
                  }
                  console.error('Decryption failed', body, cipherText)
                  throw new Error('Decryption failed')
                }
                if (!body.data) return new Response(body.data)
                if (isArray(body) || !isString(body.data)) throw new Error(JSON.stringify(body))

                return new Response(decrypt(body.data))
              }
            ]
          }
        },
        overrideConfig
      )
    )
  }
}