import {
  JMComic,
  JmApiError,
  type CommonComic,
  type JmSession,
  type PageResult,
  sCommonComic,
  SortType,
} from 'jmcomic-sdk'
import { BrowserImageDecoder } from 'jmcomic-sdk/browser'
import { NodeImageDecoder } from 'jmcomic-sdk/node'
/// <reference lib="dom" />
import { assertType, expectTypeOf } from 'vitest'

const sdk = new JMComic({ baseUrl: 'https://example.test', retry: 0 })
const signal = new AbortController().signal

expectTypeOf(
  sdk.comic.searchByKeyword({ keyword: 'test', order: SortType.Relate, page: 1 }, signal),
).resolves.toEqualTypeOf<PageResult<CommonComic>>()
expectTypeOf(sdk.comic.getInfo({ id: 1 }, signal)).resolves.toHaveProperty('series')
expectTypeOf(sdk.blog.search({ type: 'all', page: 1 }, signal)).resolves.toHaveProperty('list')
expectTypeOf(sdk.novel.search({ keyword: 'test', page: 1 }, signal)).resolves.toHaveProperty(
  'total',
)
expectTypeOf(sdk.book.search({ keyword: 'test', page: 1 }, signal)).resolves.toHaveProperty('list')

assertType<JmSession>({ username: 'tester', token: 'token' })
assertType<PageResult<string>>({ total: 1, list: ['one'] })
assertType<Error>(new JmApiError('NETWORK_ERROR', 'failed'))
expectTypeOf(sCommonComic.parse({})).toEqualTypeOf<CommonComic>()
assertType<BrowserImageDecoder>(new BrowserImageDecoder())
assertType<NodeImageDecoder>(new NodeImageDecoder())

// @ts-expect-error page is required for paginated search
sdk.comic.searchByKeyword({ keyword: 'test', order: SortType.Relate })
// @ts-expect-error comic ids cannot be arbitrary objects
sdk.comic.getInfo({ id: { value: 1 } })
// @ts-expect-error sort must use a supported SortType value
sdk.comic.searchByKeyword({ keyword: 'test', order: 'newest', page: 1 })
// @ts-expect-error chapter language is constrained by the API
sdk.novel.getContent({ chapterId: 1, lang: 'en' })
// @ts-expect-error sessions never retain a password
assertType<JmSession>({ username: 'tester', password: 'secret' })