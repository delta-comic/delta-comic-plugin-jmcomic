<script setup lang="ts">
import type { UniComment, UniContentPage, UniEp, UniItem } from '@delta-comic/model'
import { SharedFunction } from '@delta-comic/utils'
import { NAlert, NButton, NInput, NSpin, NTag } from 'naive-ui'
import { onMounted, ref } from 'vue'

import JmCommentRow from '@/components/JmCommentRow.vue'
import JmItemCard from '@/components/JmItemCard.vue'
import ResolvedImage from '@/components/ResolvedImage.vue'
import { translate } from '@/i18n'
import { useAsyncTask } from '@/runtime/useAsyncTask'

interface Props {
  page: UniContentPage
}

type Tab = 'view' | 'detail' | 'eps' | 'comments' | 'recommends'

const props = defineProps<Props>()
const active = ref<Tab>('view')
const commentText = ref('')
const actionError = ref('')
const actionLoading = ref(false)

const detail = useAsyncTask(signal => props.page.fetchDetail(signal))
const comments = useAsyncTask<UniComment[]>(async signal => {
  const result = await props.page.fetchComments.query({}, props.page.fetchComments.initPage, signal)
  return result.data
})
const recommends = useAsyncTask<UniItem[]>(async signal => {
  const result = await props.page.fetchRecommends.query(
    {},
    props.page.fetchRecommends.initPage,
    signal,
  )
  return result.data
})
const eps = useAsyncTask<UniEp[]>(async signal => {
  const result = await props.page.fetchEps.query({}, props.page.fetchEps.initPage, signal)
  return result.data
})

onMounted(async () => {
  await detail.run()
  void Promise.all([comments.run(), recommends.run(), eps.run()])
})

async function like() {
  if (!detail.data.value) return
  actionLoading.value = true
  actionError.value = ''
  try {
    await detail.data.value.like()
  } catch (cause) {
    actionError.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    actionLoading.value = false
  }
}

async function sendComment() {
  const item = detail.data.value
  const text = commentText.value.trim()
  if (!item || !text) return
  actionLoading.value = true
  actionError.value = ''
  try {
    await item.sendComment(text)
    commentText.value = ''
    await comments.run()
  } catch (cause) {
    actionError.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    actionLoading.value = false
  }
}

const openEp = (entry: UniEp) =>
  SharedFunction.call(
    'routeToContent',
    props.page.contentType,
    props.page.id,
    entry.id,
    detail.data.value,
  )

const openItem = (item: UniItem) =>
  SharedFunction.call('routeToContent', item.contentType, item.id, item.$thisEp.id, item)

const tabs: { id: Tab; text: string }[] = [
  { id: 'view', text: 'jmcomic.tab.read' },
  { id: 'detail', text: 'jmcomic.tab.detail' },
  { id: 'eps', text: 'jmcomic.tab.chapters' },
  { id: 'comments', text: 'jmcomic.tab.comments' },
  { id: 'recommends', text: 'jmcomic.tab.recommends' },
]
</script>

<template>
  <main class="mx-auto flex w-full max-w-7xl flex-col">
    <NSpin v-if="detail.loading.value" class="flex justify-center p-12" />
    <NAlert
      v-else-if="detail.error.value"
      class="m-4"
      type="error"
      :title="translate('jmcomic.state.error')"
    >
      <div class="flex flex-col gap-3">
        <span>{{ detail.error.value.message }}</span>
        <NButton class="self-start" @click="detail.run">{{
          translate('jmcomic.action.retry')
        }}</NButton>
      </div>
    </NAlert>
    <template v-else-if="detail.data.value">
      <header class="flex gap-5 p-4 md:p-6">
        <ResolvedImage
          class="h-44 w-32 shrink-0 rounded-xl object-cover shadow-md md:h-60 md:w-44"
          :image="detail.data.value.$cover"
          :alt="detail.data.value.title"
        />
        <div class="flex min-w-0 flex-1 flex-col gap-3">
          <h1 class="text-2xl font-bold md:text-3xl">{{ detail.data.value.title }}</h1>
          <p v-if="detail.data.value.author.length" class="text-neutral-500">
            {{ detail.data.value.author.map(author => author.label).join(' · ') }}
          </p>
          <div class="flex flex-wrap gap-2">
            <NTag
              v-for="category in detail.data.value.categories"
              :key="`${category.group}:${category.name}`"
              size="small"
            >
              {{ category.name }}
            </NTag>
          </div>
          <div class="mt-auto flex flex-wrap gap-3">
            <NButton
              v-if="detail.data.value.commentSendable"
              type="primary"
              :loading="actionLoading"
              @click="like"
            >
              {{ translate('jmcomic.action.like') }}
            </NButton>
          </div>
        </div>
      </header>

      <NAlert v-if="actionError" class="mx-4 mb-3" type="error">{{ actionError }}</NAlert>

      <nav
        class="flex gap-2 overflow-x-auto border-y border-neutral-200 px-4 py-3 dark:border-neutral-800"
      >
        <NButton
          v-for="tab in tabs"
          :key="tab.id"
          :type="active === tab.id ? 'primary' : 'default'"
          secondary
          @click="active = tab.id"
        >
          {{ translate(tab.text) }}
        </NButton>
      </nav>

      <section v-show="active === 'view'">
        <slot name="view" :item="detail.data.value" />
      </section>

      <section v-if="active === 'detail'" class="p-5 leading-7">
        <p v-if="typeof detail.data.value.description === 'string'" class="whitespace-pre-wrap">
          {{ detail.data.value.description }}
        </p>
        <p v-else-if="detail.data.value.description">{{ detail.data.value.description.content }}</p>
        <p v-else class="text-neutral-500">{{ translate('jmcomic.state.empty') }}</p>
      </section>

      <section v-if="active === 'eps'" class="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <NButton
          v-for="entry in eps.data.value"
          :key="entry.id"
          :disabled="entry.id === page.ep"
          @click="openEp(entry)"
        >
          {{ entry.name }}
        </NButton>
        <p
          v-if="!eps.loading.value && !eps.data.value?.length"
          class="col-span-full text-center text-neutral-500"
        >
          {{ translate('jmcomic.state.empty') }}
        </p>
      </section>

      <section v-if="active === 'comments'" class="p-4">
        <div v-if="detail.data.value.commentSendable" class="mb-4 flex flex-col gap-3">
          <NInput
            v-model:value="commentText"
            type="textarea"
            :placeholder="translate('jmcomic.comment.placeholder')"
          />
          <NButton type="primary" :loading="actionLoading" class="self-end" @click="sendComment">
            {{ translate('jmcomic.action.send') }}
          </NButton>
        </div>
        <JmCommentRow
          v-for="comment in comments.data.value"
          :key="comment.id"
          :comment="comment"
          :item="detail.data.value"
        />
        <p
          v-if="!comments.loading.value && !comments.data.value?.length"
          class="p-5 text-center text-neutral-500"
        >
          {{ translate('jmcomic.state.empty') }}
        </p>
      </section>

      <section
        v-if="active === 'recommends'"
        class="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-5"
      >
        <JmItemCard
          v-for="item in recommends.data.value"
          :key="`${String(item.contentType)}:${item.id}`"
          :item="item"
          @click="openItem(item)"
        />
        <p
          v-if="!recommends.loading.value && !recommends.data.value?.length"
          class="col-span-full p-5 text-center text-neutral-500"
        >
          {{ translate('jmcomic.state.empty') }}
        </p>
      </section>
    </template>
  </main>
</template>