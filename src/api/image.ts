import type { uni } from '@delta-comic/model'
import { interceptors } from '@delta-comic/request'
import axios from 'axios'
import { retry } from 'es-toolkit'
import { decode_image, decode_images_batch } from 'jmcomic-helper'

export namespace _jmImage {
  const api = axios.create()
  api.interceptors.response.use(undefined, interceptors.checkIsAxiosError)
  api.interceptors.response.use(undefined, interceptors.createAutoRetry(api))
  const cache = new Map<string, Promise<string>>()

  export interface DecodeOptions {
    page: number
    id: number
  }

  export async function decodeImageWasm(
    imageData: ArrayBuffer | Uint8Array,
    options: DecodeOptions
  ): Promise<string> {
    const uint8Array = imageData instanceof Uint8Array ? imageData : new Uint8Array(imageData)

    try {
      const dataUrl = decode_image(uint8Array, options.page, options.id)
      return dataUrl
    } catch (error) {
      // 提供友好的错误信息
      throw new Error(`图片解码失败: ${error}`)
    }
  }

  export interface BatchDecodeItem {
    /** 图片数据 */
    data: ArrayBuffer | Uint8Array
    /** 页码 */
    page: number
    /** ID */
    id: number
  }

  export async function decodeImagesBatchWasm(items: BatchDecodeItem[]): Promise<string[]> {
    const wasmInput = items.map(item => ({
      data: item.data instanceof Uint8Array ? item.data : new Uint8Array(item.data),
      page: item.page,
      id: item.id
    }))

    try {
      const results = decode_images_batch(wasmInput)
      return results as string[]
    } catch (error) {
      throw new Error(`批量图片解码失败: ${error}`)
    }
  }

  export const decoder: uni.resource.ProcessInstance = async (
    nowPath: string,
    img: uni.resource.Resource
  ) => {
    const page = Number(img.$$meta?.page || 0)
    const id = Number(img.$$meta?.id || 0)

    if (nowPath.indexOf('.gif') > 0 || id < 220980) return [nowPath, false]

    const cacheKey = `${nowPath}@${page}|${id}`
    let cachedValue = cache.get(cacheKey)
    if (cachedValue) return [await cachedValue, false]
    const promise = Promise.withResolvers<string>()
    cache.set(cacheKey, promise.promise)

    const arrayBuffer = await (
      await retry(() => fetch(`${img.getThisFork()}/${nowPath}`))
    ).arrayBuffer()

    const dataUrl = await decodeImageWasm(arrayBuffer, { page, id })

    promise.resolve(dataUrl)
    return [await promise.promise, false]
  }
}