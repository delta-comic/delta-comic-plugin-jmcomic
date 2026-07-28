<script setup lang="ts">
import { DcCell, DcCellGroup } from '@delta-comic/ui'
import { NButton } from 'naive-ui'
import { computed } from 'vue'

import { translate } from '@/i18n'

interface Props {
  name?: string
}

interface Emits {
  confirm: [name: string]
}

const props = withDefaults(defineProps<Props>(), { name: 'Delta Comic' })
const emit = defineEmits<Emits>()

const greeting = computed(() => translate('template.greeting', { name: props.name }))

function confirm() {
  emit('confirm', props.name)
}
</script>

<template>
  <DcCellGroup class="m-4!" inset :title="translate('template.title')">
    <DcCell center :title="greeting">
      <NButton type="primary" @click="confirm">
        {{ translate('template.actions.confirm') }}
      </NButton>
    </DcCell>
  </DcCellGroup>
</template>