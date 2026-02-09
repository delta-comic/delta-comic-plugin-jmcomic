<script setup lang="ts">
import { JmBookPage } from '@/api/page'
import { coreModule, requireDepend } from 'delta-comic-core'
const {
  comp: { FavouriteSelect }
} = requireDepend(coreModule)
const $props = defineProps<{ page: JmBookPage }>()
</script>

<template></template>