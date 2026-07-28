<script setup lang="ts">
import type { UniContentPage, UniItem } from '@delta-comic/model'
import { NAlert, NButton, NSpin } from 'naive-ui'
import { onMounted } from 'vue'

import { translate } from '@/i18n'
import { useAsyncTask } from '@/runtime/useAsyncTask'

import SafeRichText from './SafeRichText.vue'

interface RichTextLoader extends UniContentPage {
  loadRichText(signal?: AbortSignal): Promise<string>
}

interface Props {
  page: UniContentPage
  union?: UniItem
}

const props = defineProps<Props>()
const content = useAsyncTask(signal => (props.page as RichTextLoader).loadRichText(signal))
onMounted(content.run)
</script>

<template>
  <NSpin v-if="content.loading.value" class="flex justify-center p-12" />
  <NAlert
    v-else-if="content.error.value"
    type="error"
    class="m-4"
    :title="translate('jmcomic.state.error')"
  >
    <div class="flex flex-col gap-3">
      <span>{{ content.error.value.message }}</span>
      <NButton class="self-start" @click="content.run">{{
        translate('jmcomic.action.retry')
      }}</NButton>
    </div>
  </NAlert>
  <SafeRichText v-else-if="content.data.value" :html="content.data.value" />
  <p v-else class="p-8 text-center text-neutral-500">{{ translate('jmcomic.state.empty') }}</p>
</template>