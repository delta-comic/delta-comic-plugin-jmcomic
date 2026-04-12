import { uni } from '@delta-comic/model'

import { sdk } from '../sdk'

export const decryptor: uni.resource.ProcessInstance = async (path, image) => {
  const comicId = Number(image.$$meta!.id)
  const pageIndex = Number(image.$$meta!.page)
  const { url } = await sdk.image.decryptImage(path, comicId, pageIndex)
  return [url, false]
}