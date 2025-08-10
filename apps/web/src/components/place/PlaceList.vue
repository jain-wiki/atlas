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
      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:lg:grid-cols-3 tw:gap-4 tw:mb-6">
        <PlaceCard v-for="place in places" :key="place.id" :place="place" @show-details="emit('show-details', place)"
          @show-item="emit('show-item', place)" />
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

  </div>
</template>

<script setup lang="ts">
import type { Place } from '@atlas/types/src/gplace'
import type { Pagination } from '@atlas/types/src/list'
import PlaceCard from './PlaceCard.vue'

const props = defineProps<{
  places: Place[]
  loading: boolean
  pagination: Pagination
}>()

const emit = defineEmits<{
  'page-change': [page: number]
  'show-details': [place: Place]
  'show-item': [place: Place]
}>()

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



</script>
