import type { StreamQuery, UniComment, UniContentPage, UniItem } from '@delta-comic/model'
import { type DCPluginConfig } from '@delta-comic/plugin'
import { assertType, expectTypeOf } from 'vitest'
import type { ComponentEmit, ComponentProps } from 'vue-component-type-helpers'

import JmCommentRow from '@/components/JmCommentRow.vue'
import JmItemCard from '@/components/JmItemCard.vue'
import { contentKeys, searchKeys, subscribeKeys } from '@/constants'
import jmcomicPlugin from '@/main'
import { contentPages } from '@/models/pages'

assertType<DCPluginConfig>(jmcomicPlugin)
expectTypeOf<keyof typeof contentPages>().toEqualTypeOf<
  'blog' | 'book' | 'book-author' | 'comic' | 'novel'
>()
expectTypeOf<keyof typeof searchKeys>().toEqualTypeOf<'blog' | 'creator' | 'keyword' | 'novel'>()
expectTypeOf<keyof typeof subscribeKeys>().toEqualTypeOf<
  'comicAuthor' | 'creator' | 'novelAuthor'
>()
assertType<'comic'>(contentKeys.comic)

declare const item: UniItem
declare const comment: UniComment
declare const page: UniContentPage

type ItemCardProps = ComponentProps<typeof JmItemCard>
type ItemCardEmit = ComponentEmit<typeof JmItemCard>
type CommentProps = ComponentProps<typeof JmCommentRow>

assertType<ItemCardProps>({ item, type: 'small', freeHeight: true })
assertType<CommentProps>({ comment, item })
assertType<ItemCardEmit>((event: 'click') => event)
assertType<StreamQuery<UniItem>>(page.fetchRecommends)

// @ts-expect-error card variants are intentionally constrained
assertType<ItemCardProps>({ item, type: 'wide' })
// @ts-expect-error item is required
assertType<ItemCardProps>({ freeHeight: true })
// @ts-expect-error comment rows require a UniComment
assertType<CommentProps>({ comment: item, item })
// @ts-expect-error unsupported content keys must not compile
assertType<unknown>(contentPages.video)