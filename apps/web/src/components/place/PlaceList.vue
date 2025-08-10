<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
      <QSpinner color="primary" size="3em" />
    </div>

    <!-- No Places Found -->
    <div v-else-if="!places.length" class="tw:text-center tw:py-8">
      <QIcon name="location_off" size="4em" color="grey-5" class="tw:mb-4" />
      <p class="tw:text-grey-6 tw:text-lg">No places found</p>
    </div>

    <!-- Places Grid -->
    <div v-else>
      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:lg:grid-cols-3 tw:gap-6 tw:mb-6">
        <QCard v-for="place in places" :key="place.id" class="hover:tw:shadow-lg tw:transition-shadow">
          <QCardSection>
            <div class="tw:flex tw:items-start tw:justify-between tw:mb-3">
              <span class="tw:text-lg tw:font-semibold tw:text-grey-8 tw:line-clamp-2 tw:flex-1">
                {{ place.displayName }}
              </span>
              <QBtn icon="open_in_new" flat round dense color="primary" size="sm" @click.stop="openGoogleMaps(place)" />
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
            <QBtn label="Details" color="primary" flat dense @click.stop="showPlaceDetails(place)" />
          </QCardActions>
        </QCard>
      </div>

      <!-- Pagination Controls -->
      <div class="tw:flex tw:justify-center tw:items-center tw:gap-4 tw:mt-8">
        <QBtn icon="chevron_left" :disable="pagination.pageNo <= 1" @click="previousPage" flat round />

        <div class="tw:flex tw:items-center tw:gap-2">
          <span class="tw:text-sm tw:text-grey-6">Page</span>
          <QInput :model-value="pagination.pageNo" @update:model-value="(value) => goToPage(value || 1)" type="number"
            :min="1" dense outlined style="width: 80px" class="tw:text-center" />
          <span class="tw:text-sm tw:text-grey-6">of {{ pagination.totalPages || '?' }}</span>
        </div>

        <QBtn icon="chevron_right" :disable="!pagination.hasMore" @click="nextPage" flat round />
      </div>

      <!-- Results Info -->
      <div class="tw:text-center tw:text-sm tw:text-grey-6 tw:mt-4">
        Showing {{ places.length }} result{{ places.length !== 1 ? 's' : '' }} per page
      </div>
    </div>

    <!-- Place Details Dialog -->
    <QDialog v-model="showDetails">
      <QCard style="min-width: 500px; max-width: 800px">
        <QCardSection class="tw:bg-primary tw:text-white">
          <div class="tw:text-h6">{{ selectedPlace?.displayName }}</div>
        </QCardSection>

        <QCardSection v-if="selectedPlace">
          <div class="tw:space-y-4">
            <div>
              <strong>Location:</strong> {{ selectedPlace.locality }}, {{ selectedPlace.administrativeArea }}
            </div>
            <div>
              <strong>Pincode:</strong> {{ selectedPlace.pincode }}
            </div>
            <div>
              <strong>Digipin5:</strong> {{ selectedPlace.digipin5 }}
            </div>
            <div v-if="selectedPlace.classification">
              <strong>Classification:</strong> {{ selectedPlace.classification }}
            </div>
            <div>
              <strong>Created:</strong> {{ formatDate(selectedPlace.createdAt) }}
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
          <QBtn label="Close" color="grey" flat @click="showDetails = false" />
        </QCardActions>
      </QCard>
    </QDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Place } from '@atlas/types/src/gplace'
import type { Pagination } from '@atlas/types/src/list'

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
  places: Place[]
  loading: boolean
  pagination: Pagination
}>()

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const showDetails = ref(false)
const selectedPlace = ref<Place | null>(null)

const placeData = computed<PlaceData | null>(() => {
  if (!selectedPlace.value?.response) return null
  try {
    return JSON.parse(selectedPlace.value.response)
  } catch {
    return null
  }
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function previousPage() {
  if (props.pagination.pageNo > 1) {
    emit('page-change', props.pagination.pageNo - 1)
  }
}

function nextPage() {
  if (props.pagination.hasMore) {
    emit('page-change', props.pagination.pageNo + 1)
  }
}

function goToPage(page: number | string) {
  const pageNum = typeof page === 'string' ? parseInt(page) : page
  if (pageNum > 0) {
    emit('page-change', pageNum)
  }
}

function openGoogleMaps(place: Place) {
  try {
    const placeInfo = JSON.parse(place.response) as PlaceData
    if (placeInfo.googleMapsUri) {
      window.open(placeInfo.googleMapsUri, '_blank')
    } else if (placeInfo.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${placeInfo.location.latitude},${placeInfo.location.longitude}`
      window.open(url, '_blank')
    }
  } catch {
    // Fallback to search by name
    const query = encodeURIComponent(`${place.displayName} ${place.locality} ${place.administrativeArea}`)
    window.open(`https://www.google.com/maps/search/${query}`, '_blank')
  }
}

function showPlaceDetails(place: Place) {
  selectedPlace.value = place
  showDetails.value = true
}

function openGoogleMapsFromDialog() {
  if (placeData.value?.googleMapsUri) {
    window.open(placeData.value.googleMapsUri, '_blank')
  }
}

</script>
