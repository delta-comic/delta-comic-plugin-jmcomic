import { onBeforeUnmount, shallowRef, type ShallowRef } from 'vue'

export interface AsyncTask<T> {
  data: ShallowRef<T | undefined>
  error: ShallowRef<Error | undefined>
  loading: ShallowRef<boolean>
  run: () => Promise<T | undefined>
}

export const useAsyncTask = <T>(task: (signal: AbortSignal) => Promise<T>): AsyncTask<T> => {
  const data = shallowRef<T>()
  const error = shallowRef<Error>()
  const loading = shallowRef(false)
  let controller: AbortController | undefined

  const run = async () => {
    controller?.abort()
    controller = new AbortController()
    loading.value = true
    error.value = undefined
    try {
      const result = await task(controller.signal)
      data.value = result
      return result
    } catch (cause) {
      if (!controller.signal.aborted)
        error.value = cause instanceof Error ? cause : new Error(String(cause))
      return undefined
    } finally {
      if (!controller.signal.aborted) loading.value = false
    }
  }

  onBeforeUnmount(() => controller?.abort())
  return { data, error, loading, run }
}