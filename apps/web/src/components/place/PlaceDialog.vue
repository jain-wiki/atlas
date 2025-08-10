<template>
  <QDialog :model-value="show" @update:model-value="$emit('update:show', $event)">
    <QCard style="min-width: 500px; max-width: 800px">
      <QCardSection class="tw:bg-slate-700 tw:text-white">
        <div class="tw:text-h6">{{ place?.displayName }}</div>
      </QCardSection>

      <QCardSection v-if="place">
        <div class="tw:space-y-2">
          <div>
            <strong>Location:</strong> {{ place.pincode }}, {{ place.locality }}, {{ place.administrativeArea }}
          </div>
          <div>
            <strong>Digipin5:</strong> {{ place.digipin5 }}
          </div>
          <div v-if="place.classification">
            <strong>Classification:</strong> {{ place.classification }}
          </div>
          <div v-if="placeData">
            <strong>Address:</strong> {{ placeData.formattedAddress }}
          </div>
          <div v-if="placeData?.types?.length">
            <strong>Types:</strong>
            <div class="tw:flex tw:flex-wrap tw:gap-1 tw:mt-1">
              <QChip v-for="type in placeData.types" :key="type" :label="type.replace(/_/g, ' ')" size="sm"
                color="grey-3" />
            </div>
          </div>
        </div>
      </QCardSection>

      <QCardActions align="right">
        <QBtn v-if="placeData?.googleMapsUri" label="Open in Google Maps" color="primary"
          @click="openGoogleMapsFromDialog" />
        <QBtn label="Close" color="grey" flat @click="$emit('update:show', false)" />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from '@atlas/types/src/gplace'

interface PlaceData {
  formattedAddress?: string
  types?: string[]
  googleMapsUri?: string
  location?: {
    latitude: number
    longitude: number
  }
}

const props = defineProps<{
  show: boolean
  place: Place | null
}>()

defineEmits<{
  'update:show': [value: boolean]
}>()

const placeData = computed<PlaceData | null>(() => {
  if (!props.place?.response) return null
  try {
    return JSON.parse(props.place.response)
  } catch {
    return null
  }
})

function openGoogleMapsFromDialog() {
  if (placeData.value?.googleMapsUri) {
    window.open(placeData.value.googleMapsUri, '_blank')
  }
}
</script>
