import { MD5, Hex, Utf8, Base64, AES, CipherParams, ECB, Pkcs7 } from 'crypto-es'
import { isArray, sortBy } from 'es-toolkit/compat'
import ky from 'ky'

import type { JMComic } from '..'

export interface Forks {
  /**
   * @example ['www.cdnhth.club', 'www.cdngwc.cc']
   */
  Setting: string[]
  /**
   * @example ['www.cdnhth.club', 'www.cdngwc.cc']
   */
  Server: string[]
  /**
   * @example [
   *  ['www.cdnhth.club', '線路1'],
   *  ['www.cdngwc.cc', '線路2']
   * ]
   */
  jm3_Server: [url: string, name: string][]
}

export class Fork {
  constructor(protected sdk: JMComic) {}
  /**
   * @description 从网络获取所有分流，源在`config.forkGetSource`中定义
   * @returns 可以将结果传入`this.autoPickFork`以自动选择并设置入config
   */
  public async getForks() {
    const { forkGetSource: source, forkGetPath: path } = this.sdk.config
    const ky = this.sdk.requester.create({ prefixUrl: undefined })
    let result = ''
    const acs = new Array<AbortController>()
    await Promise.all(
      source.map(async baseURL => {
        try {
          const ac = new AbortController()
          acs.push(ac)
          const body = await ky.get<string>(path, { prefixUrl: baseURL, signal: ac.signal })
          result = await body.text()
          for (const ac of acs) ac.abort()
        } catch (error) {
          console.warn(error)
          return
        }
      })
    )
    if (result.length == 0) throw new Error('Fail to fetch forks, because not source is useable.')
    return this.decryptionResponse(result)
  }
  /**
   * @param forks 传入分流的根url，如果没有，就会自动`getForks()`
   * @returns 结果会自动存入`config.requestUsingFork`
   */
  public async autoPickFork(forks_?: string[] | Forks, signal?: AbortSignal) {
    if (!forks_) forks_ = await this.getForks()
    const forks = isArray(forks_) ? forks_ : forks_.Setting.map(p => `https://${p}`)
    if (forks.length == 0) throw new Error('[plugin test] no fork found')
    const { forkTestPath: path } = this.sdk.config

    if (signal?.aborted) {
      throw Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' })
    }

    const record: [url: string, result: false | number][] = []
    const controller = new AbortController()
    const onAbort = () => controller.abort()
    signal?.addEventListener('abort', onAbort, { once: true })

    try {
      await Promise.all(
        forks.map(async fork => {
          const requestController = new AbortController()
          const timeoutId = setTimeout(() => requestController.abort(), 10000)
          controller.signal.addEventListener('abort', () => requestController.abort(), {
            once: true
          })

          try {
            const begin = Date.now()
            await ky.get(path, { prefixUrl: fork, signal: requestController.signal })
            record.push([fork, Date.now() - begin])
          } catch {
            record.push([fork, false])
          } finally {
            clearTimeout(timeoutId)
          }
        })
      )
    } finally {
      signal?.removeEventListener('abort', onAbort)
    }

    if (signal?.aborted) {
      throw Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' })
    }

    const result = sortBy(
      record.filter(v => v[1] != false),
      v => v[1]
    )[0]
    if (!result) throw new Error("Can't select fork")

    return (this.sdk.config.requestUsingFork = result[0])
  }

  public decryptionResponse(inputBase64: string) {
    // 1. md5(secret) -> hex string
    const md5Hex = MD5(Utf8.parse(this.sdk.config.forkFetchSecret)).toString(Hex)

    // 2. 将 hex 字符串当作 UTF-8 文本作为 AES key（与目标实现一致）
    const key = Utf8.parse(md5Hex)

    // 3. base64 -> WordArray
    const ciphertextWA = Base64.parse(inputBase64.trim())

    // 4. AES-ECB 解密（默认 PKCS7 填充）
    const cipherParams = CipherParams.create({ ciphertext: ciphertextWA })
    const decryptedWA = AES.decrypt(cipherParams, key, { mode: ECB, padding: Pkcs7 })

    const result = Utf8.stringify(decryptedWA)
    if (!result)
      throw new Error('Decryption produced empty result (wrong secret or corrupted input)')
    return JSON.parse(result) as Forks
  }
}