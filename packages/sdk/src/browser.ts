import { createImageSegments } from './image'
import type { ImageDecoder } from './types'

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)), { once: true })
    reader.addEventListener('error', () => reject(reader.error), { once: true })
    reader.readAsDataURL(blob)
  })

export class BrowserImageDecoder implements ImageDecoder {
  public async decode(blob: Blob, segmentCount: number): Promise<string> {
    const bitmap = await createImageBitmap(blob)
    try {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const context = canvas.getContext('2d')
      if (!context) throw new Error('无法创建图片画布')
      for (const segment of createImageSegments(bitmap.height, segmentCount)) {
        context.drawImage(
          bitmap,
          0,
          segment.sourceY,
          bitmap.width,
          segment.height,
          0,
          segment.destinationY,
          bitmap.width,
          segment.height,
        )
      }
      return blobToDataUrl(await canvas.convertToBlob({ type: blob.type || 'image/png' }))
    } finally {
      bitmap.close()
    }
  }
}