import z from 'zod'

export const createListSchema = <T extends z.ZodType>(item: T) =>
  z.object({ total: z.number(), list: z.array(item) })
export interface List<T> {
  total: number
  list: T[]
}

export type PaginationQuery<T extends object> = T & { page: number }