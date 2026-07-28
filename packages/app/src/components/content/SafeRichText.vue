<script setup lang="ts">
import { computed } from 'vue'

import { parseRichText } from '@/adapters/richText'

interface Props {
  html: string
}

const props = defineProps<Props>()
const blocks = computed(() => parseRichText(props.html))
</script>

<template>
  <article
    class="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 leading-8 text-neutral-800 dark:text-neutral-100"
  >
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <h1 v-if="block.type === 'heading' && block.level === 1" class="text-3xl font-bold">
        {{ block.text }}
      </h1>
      <h2 v-else-if="block.type === 'heading' && block.level === 2" class="text-2xl font-semibold">
        {{ block.text }}
      </h2>
      <h3 v-else-if="block.type === 'heading'" class="text-xl font-semibold">
        {{ block.text }}
      </h3>
      <blockquote
        v-else-if="block.type === 'quote'"
        class="border-primary border-l-4 pl-4 text-neutral-600 dark:text-neutral-300"
      >
        {{ block.text }}
      </blockquote>
      <pre
        v-else-if="block.type === 'code'"
        class="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm text-neutral-100"
      ><code>{{ block.text }}</code></pre>
      <img
        v-else-if="block.type === 'image'"
        class="mx-auto max-h-[80vh] max-w-full rounded-lg object-contain"
        :src="block.src"
        :alt="block.alt"
        loading="lazy"
      />
      <a
        v-else-if="block.type === 'link'"
        class="text-primary underline underline-offset-4"
        :href="block.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ block.text }}
      </a>
      <p v-else class="break-words whitespace-pre-wrap">{{ block.text }}</p>
    </template>
  </article>
</template>