import type { UserMe } from './model/user'

export type JmErrorCode =
  | 'AUTH_REQUIRED'
  | 'DECRYPTION_FAILED'
  | 'INVALID_RESPONSE'
  | 'NETWORK_ERROR'
  | 'NO_AVAILABLE_FORK'
  | 'UNSUPPORTED_OPERATION'

export class JmApiError extends Error {
  public constructor(
    public readonly code: JmErrorCode,
    message: string,
    public readonly endpoint?: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'JmApiError'
  }
}

export interface JmSession {
  username: string
  token?: string
  avs?: string
  user?: UserMe
}

export interface ImageDecoder {
  decode(blob: Blob, segmentCount: number): Promise<string>
}

export interface JMComicOptions {
  baseUrl?: string
  timeout?: number
  retry?: number
  session?: JmSession
  imageDecoder?: ImageDecoder
  now?: () => number
}

export interface PageResult<T> {
  total: number
  list: T[]
}

export interface ImageSegment {
  destinationY: number
  height: number
  sourceY: number
}