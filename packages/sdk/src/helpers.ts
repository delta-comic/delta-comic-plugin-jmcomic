export const jsonToFormData = (data: object): FormData => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    formData.append(
      key,
      typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value),
    )
  }
  return formData
}

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException
    ? error.name === 'AbortError'
    : error instanceof Error && error.name === 'AbortError'

export const createAbortError = (): Error => {
  if (typeof DOMException !== 'undefined')
    return new DOMException('The operation was aborted.', 'AbortError')
  return Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' })
}