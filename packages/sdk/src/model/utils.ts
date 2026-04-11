import z from 'zod'

export const createListSchema = <T extends z.ZodType>(item: T) =>
  z.object(
    {
      total: z.number({ error: r => `List total is illegal. (Input ${JSON.stringify(r.input)})` }),
      list: z.array(item, {
        error: r => `List data is illegal. (Input ${JSON.stringify(r.input)})`
      })
    },
    { error: r => `List is illegal. (Input ${JSON.stringify(r.input)})` }
  )
export interface List<T> {
  total: number
  list: T[]
}

export type PaginationQuery<T extends object> = T & { page: number }

export const sNumeric = z.union([z.stringFormat('Numeric', /^\d+$/), z.number()], {
  error: r =>
    `${String(r.path?.at(-1) ?? 'It')} must be a numeric string or number. (Input <${typeof r.input}> ${JSON.stringify(r.input)})`
})
export type Numeric = string | number

export const sString = z.string({
  error: r =>
    `${String(r.path?.at(-1) ?? 'It')} must be string. (Input <${typeof r.input}> ${JSON.stringify(r.input)})`
})