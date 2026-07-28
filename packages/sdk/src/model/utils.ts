import z from 'zod'

import type { PageResult } from '../types'

export const createListSchema = <T extends z.ZodType>(item: T) =>
  z.object(
    {
      total: z.number({ error: r => `List total is illegal. (Input ${JSON.stringify(r.input)})` }),
      list: z.array(item, {
        error: r => `List data is illegal. (Input ${JSON.stringify(r.input)})`,
      }),
    },
    { error: r => `List is illegal. (Input ${JSON.stringify(r.input)})` },
  )
export type List<T> = PageResult<T>

export type PaginationQuery<T extends object = {}> = T & { page: number }

export const sNumeric = z.union(
  [
    z.stringFormat('Numeric', /^\d+$/, {
      error: r =>
        `${String(r.path?.at(-1) ?? 'It')} must be a numeric string or number. (Input <${typeof r.input}> ${JSON.stringify(r.input)})`,
    }),
    z.number({
      error: r =>
        `${String(r.path?.at(-1) ?? 'It')} must be a numeric string or number. (Input <${typeof r.input}> ${JSON.stringify(r.input)})`,
    }),
  ],
  {
    error: r =>
      `${String(r.path?.at(-1) ?? 'It')} must be a numeric string or number. (Input <${typeof r.input}> ${JSON.stringify(r.input)})`,
  },
)
export type Numeric = string | number

export const sString = z.string({
  error: r =>
    `${String(r.path?.at(-1) ?? 'It')} must be string. (Input <${typeof r.input}> ${JSON.stringify(r.input)})`,
})

export const sMutationResult = z
  .object({
    code: z.number().optional(),
    msg: z.string().optional(),
    status: z.union([z.string(), z.number()]).optional(),
    type: z.enum(['add', 'remove']).optional(),
  })
  .loose()

export interface MutationResult {
  code?: number
  msg?: string
  status?: number | string
  type?: 'add' | 'remove'
  [key: string]: unknown
}