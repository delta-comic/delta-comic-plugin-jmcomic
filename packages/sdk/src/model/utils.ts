export { sMutationResult, sNumeric } from './generated/utils'

export type PaginationQuery<T extends object = {}> = T & { page: number }

/**
 * @zod
 * @schema union([z.stringFormat('Numeric', /^\d+$/), z.number()])
 */
export type Numeric = string | number

/** @zod */
export interface MutationResult {
  code?: number
  msg?: string
  status?: number | string
  type?: 'add' | 'remove'
  [key: string]: unknown
}