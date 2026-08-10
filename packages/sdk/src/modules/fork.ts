import { AES, Base64, CipherParams, ECB, Hex, MD5, Pkcs7, Utf8 } from 'crypto-es'
import ky from 'ky'
import { z } from 'zod'

import type { JMComic } from '..'
import { createAbortError } from '../helpers'
import { JmApiError } from '../types'
import { parseResponse } from '../validation'

export interface Forks {
  Setting: string[]
  Server: string[]
  jm3_Server: [url: string, name: string][]
}

const forksSchema: z.ZodType<Forks> = z.object({
  Setting: z.array(z.string()),
  Server: z.array(z.string()),
  jm3_Server: z.array(z.tuple([z.string(), z.string()])),
})
export class Fork {
  public constructor(protected readonly sdk: JMComic) {}

  public async getForks(signal?: AbortSignal): Promise<Forks> {
    const controllers = this.sdk.config.forkSources.map(() => new AbortController())
    const abortAll = () => controllers.forEach(controller => controller.abort())
    signal?.addEventListener('abort', abortAll, { once: true })
    try {
      const encrypted = await Promise.any(
        this.sdk.config.forkSources.map((source, index) =>
          ky
            .get(this.sdk.config.forkPath, {
              baseUrl: source,
              signal: controllers[index]!.signal,
              timeout: this.sdk.config.requestTimeout,
              retry: 0,
            })
            .text(),
        ),
      )
      abortAll()
      return this.decryptResponse(encrypted)
    } catch (error) {
      if (signal?.aborted) throw createAbortError()
      throw new JmApiError('NO_AVAILABLE_FORK', '无法获取禁漫分流列表', undefined, { cause: error })
    } finally {
      signal?.removeEventListener('abort', abortAll)
    }
  }

  public async autoPickFork(forks?: string[] | Forks, signal?: AbortSignal): Promise<string> {
    const source = forks ?? (await this.getForks(signal))
    const urls = Array.isArray(source) ? source : source.Setting.map(value => `https://${value}`)
    if (urls.length === 0) throw new JmApiError('NO_AVAILABLE_FORK', '分流列表为空')
    if (signal?.aborted) throw createAbortError()

    const results = await Promise.all(
      urls.map(async url => {
        const startedAt = this.sdk.config.now()
        try {
          await ky.get(this.sdk.config.forkTestPath, {
            baseUrl: url,
            signal,
            timeout: this.sdk.config.requestTimeout,
            retry: 0,
          })
          return { url, latency: this.sdk.config.now() - startedAt }
        } catch {
          return undefined
        }
      }),
    )
    if (signal?.aborted) throw createAbortError()
    const fastest = results
      .filter((value): value is { url: string; latency: number } => value !== undefined)
      .sort((left, right) => left.latency - right.latency)[0]
    if (!fastest) throw new JmApiError('NO_AVAILABLE_FORK', '没有可用的禁漫分流')
    this.sdk.config.requestUsingFork = fastest.url
    return fastest.url
  }

  public decryptResponse(inputBase64: string): Forks {
    try {
      const md5Hex = MD5(Utf8.parse(this.sdk.config.forkSecret)).toString(Hex)
      const ciphertext = Base64.parse(inputBase64.trim())
      const decrypted = AES.decrypt(CipherParams.create({ ciphertext }), Utf8.parse(md5Hex), {
        mode: ECB,
        padding: Pkcs7,
      }).toString(Utf8)
      if (!decrypted) throw new Error('empty result')
      return parseResponse(forksSchema, JSON.parse(decrypted) as unknown, 'forks')
    } catch (error) {
      if (error instanceof JmApiError) throw error
      throw new JmApiError('DECRYPTION_FAILED', '分流列表解密失败', 'forks', { cause: error })
    }
  }

  /** @deprecated 使用 decryptResponse。 */
  public decryptionResponse(inputBase64: string): Forks {
    return this.decryptResponse(inputBase64)
  }
}