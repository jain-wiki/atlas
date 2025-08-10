<template>
  <QDialog :model-value="show" maximized class="grid-map-dialog">
    <QCard class="tw:h-full tw:flex tw:flex-col">
      <QBar class="tw:bg-gradient-to-br! tw:from-slate-800 tw:to-slate-500 tw:text-white tw:z-[1000]">
        <span>Add Item to Main Database (WikiBase on https://data.jain.wiki)</span>
        <QSpace />
        <QBtn dense flat icon="close" @click="show = false">
          <QTooltip>Close</QTooltip>
        </QBtn>
      </QBar>

      <QCardSection class="tw:flex-shrink-0">
        {{ place }}
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import type { Place } from '@atlas/types/src/gplace'
import { Ax } from '@/helper/axios'

const show = defineModel<boolean>('show', { default: false })

const props = defineProps<{
  place: Place | null
}>()

const emit = defineEmits<{
  'item-added': []
}>()



</script>
