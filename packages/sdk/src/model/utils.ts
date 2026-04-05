export interface List<T> {
  total: number
  list: T[]
}

export type PaginationQuery<T extends object> = T & { page: number }