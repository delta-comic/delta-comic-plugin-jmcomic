import { MD5, AES, enc, mode, pad, lib } from 'crypto-js'
import { Utils } from 'delta-comic-core'

export const image = [
  'https://cdn-msp.jmapinodeudzn.net',
  'https://cdn-msp2.jmapinodeudzn.net',
  'https://cdn-msp.jmapiproxy1.cc',
  'https://cdn-msp.jmapiproxy2.cc',
  'https://cdn-msp.jmapiproxy3.cc',
  'https://cdn-msp.jmapiproxy4.cc'
]
export const apiGetter = [
  'https://rup4a04-c01.tos-ap-southeast-1.bytepluses.com',
  'https://rup4a04-c02.tos-cn-hongkong.bytepluses.com'
]
export const getApiFork = async () => {
  const api = Utils.request.createAxios(() => apiGetter[0])
  return (<{ Server: string[] }>convertData(await api.get<string>('/newsvr-2025.txt'))).Server.map(
    v => `https://${v}`
  )
}

export function convertData(inputBase64: string, secret: string = 'diosfjckwpqpdfjkvnqQjsik') {
  // 1. md5(secret) -> hex string
  const md5Hex: string = MD5(enc.Utf8.parse(secret)).toString(enc.Hex)

  // 2. 将 hex 字符串当作 UTF-8 文本作为 AES key（与目标实现一致）
  const key = enc.Utf8.parse(md5Hex)

  // 3. base64 -> WordArray
  const ciphertextWA = enc.Base64.parse(inputBase64.trim())

  // 4. AES-ECB 解密（默认 PKCS7 填充）
  const cipherParams = lib.CipherParams.create({ ciphertext: ciphertextWA })
  const decryptedWA = AES.decrypt(cipherParams, key, { mode: mode.ECB, padding: pad.Pkcs7 })

  const result = enc.Utf8.stringify(decryptedWA)
  if (!result) throw new Error('Decryption produced empty result (wrong secret or corrupted input)')
  return JSON.parse(result)
}