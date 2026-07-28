<script setup lang="ts">
import type { UniContentPage, UniItem } from '@delta-comic/model'
import type { BookContents } from 'jmcomic-sdk'
import { NAlert, NButton, NSpin } from 'naive-ui'
import { onMounted } from 'vue'

import { translate } from '@/i18n'
import { useAsyncTask } from '@/runtime/useAsyncTask'

import SafeRichText from './SafeRichText.vue'

interface GalleryLoader extends UniContentPage {
  loadPages(signal?: AbortSignal): Promise<BookContents>
}

interface Props {
  page: UniContentPage
  union?: UniItem
}

const props = defineProps<Props>()
const gallery = useAsyncTask(signal => (props.page as GalleryLoader).loadPages(signal))
onMounted(gallery.run)
</script>

<template>
  <NSpin v-if="gallery.loading.value" class="flex justify-center p-12" />
  <NAlert
    v-else-if="gallery.error.value"
    type="error"
    class="m-4"
    :title="translate('jmcomic.state.error')"
  >
    <div class="flex flex-col gap-3">
      <span>{{ gallery.error.value.message }}</span>
      <NButton class="self-start" @click="gallery.run">{{
        translate('jmcomic.action.retry')
      }}</NButton>
    </div>
  </NAlert>
  <div v-else-if="gallery.data.value" class="mx-auto flex max-w-5xl flex-col items-center">
    <SafeRichText v-if="gallery.data.value.content" :html="gallery.data.value.content" />
    <img
      v-for="entry in gallery.data.value.images"
      :key="String(entry.page)"
      class="h-auto w-full object-contain"
      :src="entry.image"
      :alt="translate('jmcomic.reader.page', { page: Number(entry.page) + 1 })"
      loading="lazy"
    />
  </div>
  <p v-else class="p-8 text-center text-neutral-500">{{ translate('jmcomic.state.empty') }}</p>
</template>