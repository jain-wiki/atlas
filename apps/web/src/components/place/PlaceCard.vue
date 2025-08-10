<template>
  <QCard class="hover:tw:shadow-lg tw:transition-shadow">
    <QCardSection>
      <div class="tw:flex tw:items-start tw:justify-between tw:mb-3">
        <span class="tw:text-lg tw:font-semibold tw:text-grey-8 tw:line-clamp-2 tw:flex-1">
          {{ place.displayName }}
        </span>
        <QBtn icon="open_in_new" flat round dense color="primary" size="sm" @click.stop="openGoogleMaps" />
      </div>

      <div class="tw:space-y-2 tw:text-sm tw:text-grey-6">
        <div class="tw:flex tw:items-center tw:gap-2">
          <QIcon name="location_on" size="16px" />
          <span>{{ place.locality }}, {{ place.administrativeArea }}</span>
        </div>

        <div class="tw:flex tw:items-center tw:gap-2">
          <QIcon name="local_post_office" size="16px" />
          <span>{{ place.pincode }}</span>
        </div>

        <div class="tw:flex tw:items-center tw:gap-2">
          <QIcon name="pin_drop" size="16px" />
          <span>{{ place.digipin5 }}</span>
        </div>

        <div v-if="place.classification" class="tw:flex tw:items-center tw:gap-2">
          <QIcon name="category" size="16px" />
          <span>{{ place.classification }}</span>
        </div>
      </div>
    </QCardSection>

    <QCardActions class="tw:px-4 tw:pb-4">
      <QChip :label="formatDate(place.createdAt)" icon="schedule" size="sm" color="grey-3" text-color="grey-7" />
      <QSpace />
      <QBtn label="Details" color="primary" flat dense @click.stop="$emit('show-details')" />
    </QCardActions>
  </QCard>
</template>

<script setup lang="ts">
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
  place: Place
}>()

defineEmits<{
  'show-details': []
}>()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function openGoogleMaps() {
  try {
    const placeInfo = JSON.parse(props.place.response) as PlaceData
    if (placeInfo.googleMapsUri) {
      window.open(placeInfo.googleMapsUri, '_blank')
    } else if (placeInfo.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${placeInfo.location.latitude},${placeInfo.location.longitude}`
      window.open(url, '_blank')
    }
  } catch {
    // Fallback to search by name
    const query = encodeURIComponent(`${props.place.displayName} ${props.place.locality} ${props.place.administrativeArea}`)
    window.open(`https://www.google.com/maps/search/${query}`, '_blank')
  }
}
</script>
