import z from 'zod'

export const createListSchema = <T extends z.ZodAny>(type: T) =>
  z.object({ total: z.number(), list: z.array(type) })
export interface List<T> {
  total: number
  list: T[]
}

export type PaginationQuery<T extends object> = T & { page: number }