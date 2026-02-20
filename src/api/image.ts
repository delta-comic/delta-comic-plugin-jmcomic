// import type { uni } from '@delta-comic/model'
// import { interceptors } from '@delta-comic/request'
// import axios from 'axios'
// import { retry } from 'es-toolkit'
// import { decode_image, decode_images_batch } from 'jmcomic-helper'

// export namespace _jmImage {
//   const api = axios.create()
//   api.interceptors.response.use(undefined, interceptors.checkIsAxiosError)
//   api.interceptors.response.use(undefined, interceptors.createAutoRetry(api))
//   const cache = new Map<string, Promise<string>>()

//   export interface DecodeOptions {
//     page: number
//     id: number
//   }

//   export async function decodeImageWasm(
//     imageData: ArrayBuffer | Uint8Array,
//     options: DecodeOptions
//   ): Promise<string> {
//     const uint8Array = imageData instanceof Uint8Array ? imageData : new Uint8Array(imageData)

//     try {
//       const dataUrl = decode_image(uint8Array, options.page, options.id)
//       return dataUrl
//     } catch (error) {
//       // 提供友好的错误信息
//       throw new Error(`图片解码失败: ${error}`)
//     }
//   }

//   export interface BatchDecodeItem {
//     /** 图片数据 */
//     data: ArrayBuffer | Uint8Array
//     /** 页码 */
//     page: number
//     /** ID */
//     id: number
//   }

//   export async function decodeImagesBatchWasm(items: BatchDecodeItem[]): Promise<string[]> {
//     const wasmInput = items.map(item => ({
//       data: item.data instanceof Uint8Array ? item.data : new Uint8Array(item.data),
//       page: item.page,
//       id: item.id
//     }))

//     try {
//       const results = decode_images_batch(wasmInput)
//       return results as string[]
//     } catch (error) {
//       throw new Error(`批量图片解码失败: ${error}`)
//     }
//   }

//   export const decoder: uni.resource.ProcessInstance = async (
//     nowPath: string,
//     img: uni.resource.Resource
//   ) => {
//     const page = Number(img.$$meta?.page || 0)
//     const id = Number(img.$$meta?.id || 0)

//     if (nowPath.indexOf('.gif') > 0 || id < 220980) return [nowPath, false]

//     const cacheKey = `${nowPath}@${page}|${id}`
//     let cachedValue = cache.get(cacheKey)
//     if (cachedValue) return [await cachedValue, false]
//     const promise = Promise.withResolvers<string>()
//     cache.set(cacheKey, promise.promise)

//     const arrayBuffer = await (
//       await retry(() => fetch(`${img.getThisFork()}/${nowPath}`))
//     ).arrayBuffer()

//     const dataUrl = await decodeImageWasm(arrayBuffer, { page, id })

//     promise.resolve(dataUrl)
//     return [await promise.promise, false]
//   }
// }

import { uni } from '@delta-comic/model'
import { interceptors } from '@delta-comic/request'
import axios from 'axios'
import { MD5 } from 'crypto-js'
import { padStart } from 'es-toolkit/compat'

export namespace _jmImage {
  const api = axios.create()
  api.interceptors.response.use(undefined, interceptors.checkIsAxiosError)
  api.interceptors.response.use(undefined, interceptors.createAutoRetry(api))
  const cache = new Map<string, Promise<string>>()
  const getChunkNumber = (page: number | string, id: string | number) => {
    const _id = Number(id)
    const _page = padStart(page.toString(), 5, '0')
    const data = MD5(`${_id}${_page}`).toString()
    const lastChar = data[data.length - 1]
    let key = lastChar.charCodeAt(0)
    if (268850 <= _id && _id <= 421925) key = key % 10
    else key = key % 8
    if (0 <= key && key <= 9) return key * 2 + 2
    else return 10
  }
  export const decoder = async (
    nowPath: string,
    img: uni.resource.Resource
  ): Promise<[path: string, exit: false]> => {
    if (nowPath.indexOf('.gif') > 0 || Number(img.$$meta!.id) < 220980) {
      return [nowPath, false]
    }

    // 避免重复解密
    if (cache.has(nowPath)) return [await cache.get(nowPath)!, false]
    const promise = Promise.withResolvers<string>()
    cache.set(nowPath, promise.promise)

    // 1) 获取 blob（确保图片允许 CORS）
    const blob = await interceptors.useForceRetry(() =>
      api.get<Blob>(`${img.getThisFork()}/${nowPath}`, { responseType: 'blob' })
    )
    const bitmap = await createImageBitmap(blob)
    const width = bitmap.width,
      height = bitmap.height

    // 3) 创建目标 canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    // 4) 计算分段并按你的逻辑重组
    const segCount = getChunkNumber(img.$$meta!.page, img.$$meta!.id)
    const segH = Math.floor(height / segCount)
    const rem = height % segCount

    let ty0 = height - segH - rem
    let ty1 = height
    let dy = 0

    // 第一段
    ctx.drawImage(bitmap, 0, ty0, width, ty1 - ty0, 0, dy, width, ty1 - ty0)
    dy += segH + rem

    // 后续段
    for (let i = 1; i < segCount; i++) {
      ty0 -= segH
      ty1 -= segH
      ctx.drawImage(bitmap, 0, ty0, width, segH, 0, dy, width, segH)
      dy += segH
    }
    canvas.toBlob(blob => {
      if (!blob)
        return promise.reject(
          new Error('[plugin jmcomic]image decode fail, cannot convert to blob')
        )
      const dataUrl = URL.createObjectURL(blob)
      promise.resolve(dataUrl)
    })
    return [await promise.promise, false]
  }
}