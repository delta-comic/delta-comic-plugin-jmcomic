export const pluginName = 'jmcomic'

export const contentKeys = {
  comic: 'comic',
  blog: 'blog',
  novel: 'novel',
  bookAuthor: 'book-author',
  book: 'book',
} as const

export const searchKeys = {
  keyword: 'keyword',
  blog: 'blog',
  novel: 'novel',
  creator: 'creator',
} as const

export const subscribeKeys = {
  comicAuthor: 'comic-author',
  novelAuthor: 'novel-author',
  creator: 'creator',
} as const

export const defaultImageForks = [
  'https://cdn-msp.jmapinodeudzn.net',
  'https://cdn-msp2.jmapinodeudzn.net',
  'https://cdn-msp.jmapiproxy1.cc',
  'https://cdn-msp.jmapiproxy2.cc',
  'https://cdn-msp.jmapiproxy3.cc',
  'https://cdn-msp.jmapiproxy4.cc',
] as const