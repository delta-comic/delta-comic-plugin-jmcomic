import type { z } from 'zod'

import { JmApiError } from './types'

export const parseResponse = <T>(schema: z.ZodType<T>, value: unknown, endpoint: string): T => {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  throw new JmApiError('INVALID_RESPONSE', `接口 ${endpoint} 返回了无法识别的数据`, endpoint, {
    cause: result.error,
  })
}