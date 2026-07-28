import { array, number, object, string, type ZodType } from 'zod'

import type { PageResult } from '../types'

export { sMutationResult, sNumeric } from './generated/utils'

export const createListSchema = <T extends ZodType>(item: T) =>
  object(
    {
      total: number({ error: r => `List total is illegal. (Input ${JSON.stringify(r.input)})` }),
      list: array(item, { error: r => `List data is illegal. (Input ${JSON.stringify(r.input)})` }),
    },
    { error: r => `List is illegal. (Input ${JSON.stringify(r.input)})` },
  )
export type List<T> = PageResult<T>

export type PaginationQuery<T extends object = {}> = T & { page: number }

/**
 * @zod
 * @schema union([z.stringFormat('Numeric', /^\d+$/), z.number()])
 */
export type Numeric = string | number

export const sString = string({
  error: issue =>
    `${String(issue.path?.at(-1) ?? 'It')} must be string. (Input <${typeof issue.input}> ${JSON.stringify(issue.input)})`,
})

/** @zod */
export interface MutationResult {
  code?: number
  msg?: string
  status?: number | string
  type?: 'add' | 'remove'
  [key: string]: unknown
}