<script setup lang="ts">
import type { UniContentPage, UniImage, UniItem } from '@delta-comic/model'
import { NAlert, NButton, NSpin } from 'naive-ui'
import { onMounted } from 'vue'

import ResolvedImage from '@/components/ResolvedImage.vue'
import { translate } from '@/i18n'
import { useAsyncTask } from '@/runtime/useAsyncTask'

interface ComicLoader extends UniContentPage {
  loadImages(signal?: AbortSignal): Promise<UniImage[]>
}

interface Props {
  page: UniContentPage
  union?: UniItem
}

const props = defineProps<Props>()
const images = useAsyncTask(signal => (props.page as ComicLoader).loadImages(signal))
onMounted(images.run)
</script>

<template>
  <div class="min-h-40">
    <NSpin v-if="images.loading.value" class="flex justify-center p-12" />
    <NAlert
      v-else-if="images.error.value"
      type="error"
      class="m-4"
      :title="translate('jmcomic.state.error')"
    >
      <div class="flex flex-col gap-3">
        <span>{{ images.error.value.message }}</span>
        <NButton class="self-start" @click="images.run">{{
          translate('jmcomic.action.retry')
        }}</NButton>
      </div>
    </NAlert>
    <div v-else-if="images.data.value?.length" class="mx-auto flex max-w-5xl flex-col items-center">
      <ResolvedImage
        v-for="(entry, index) in images.data.value"
        :key="index"
        class="h-auto w-full object-contain"
        :image="entry"
        :alt="translate('jmcomic.reader.page', { page: index + 1 })"
      />
    </div>
    <p v-else class="p-8 text-center text-neutral-500">{{ translate('jmcomic.state.empty') }}</p>
  </div>
</template>