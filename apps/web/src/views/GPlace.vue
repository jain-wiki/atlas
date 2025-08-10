<template>
  <QPage class="tw:md:px-4">
    <QBreadcrumbs class="tw:my-1">
      <QBreadcrumbsEl label="Home" :to="{ name: 'Home' }" />
      <QBreadcrumbsEl label="Google Maps Places" />
    </QBreadcrumbs>
    <!-- Search Form -->
    <QCard class="tw:mb-4" flat bordered>
      <QCardSection>
        <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:lg:grid-cols-4 tw:gap-4 tw:mb-4">
          <QSelect v-model="searchForm.classification" label="Classification" outlined dense clearable
            :options="classificationOptions" option-value="value" option-label="label" emit-value map-options />
          <QInput v-model="searchForm.locality" label="Locality" outlined dense clearable />
          <QInput v-model="searchForm.administrativeArea" label="Administrative Area" outlined dense clearable />
          <QInput v-model="searchForm.digipin5" label="Digipin5" outlined dense clearable />
        </div>
        <div class="tw:flex tw:gap-2">
          <QBtn @click="searchPlaces" color="primary" :loading="loading" label="Search" />
          <QBtn @click="clearForm" color="secondary" outline label="Clear" />
        </div>
      </QCardSection>
    </QCard>

    <!-- Place List Component -->
    <PlaceList :places="places" :loading="loading" :pagination="pagination" @page-change="handlePageChange"
      @show-details="showPlaceDetails" />

    <!-- Dialogs -->
    <PlaceDialog v-model:show="showDetails" :place="selectedPlace" @place-updated="handlePlaceUpdated" />
    <GridMap @digipin-selected="handleDigipinSelected" />
  </QPage>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { Ax } from '@/helper/axios'
import PlaceList from '@/components/place/PlaceList.vue'
import PlaceDialog from '@/components/place/PlaceDialog.vue'
import GridMap from '@/components/place/GridMap.vue'
import type { Pagination } from '@atlas/types/src/list'
import type { Place } from '@atlas/types/src/gplace'


const loading = ref(false)
const places = ref<Place[]>([])
const showDetails = ref(false)
const selectedPlace = ref<Place | null>(null)
const searchForm = reactive({
  digipin5: '',
  locality: '',
  administrativeArea: '',
  classification: 'pending'
})

const classificationOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Temple', value: 'T' },
  { label: 'Community', value: 'C' },
  { label: 'Rejected', value: 'R' }
]

const pagination = reactive<Pagination>({
  pageNo: 1,
  pageLimit: 20,
  totalPages: 1,
  hasMore: false
})

async function getPlaces() {
  loading.value = true

  try {

    const response = await Ax.get(`/public/gplace/list`, {
      params: {
        ...searchForm,
        ...pagination
      }
    })

    if (response.data.success) {
      places.value = response.data.data
      pagination.pageNo = response.data.pageNo
      pagination.pageLimit = response.data.pageLimit

      // Calculate if there are more pages (simple estimation)
      pagination.hasMore = response.data.data.length === pagination.pageLimit
      pagination.totalPages = Math.ceil(pagination.pageNo + (pagination.hasMore ? 1 : 0))
    }
  } catch (error) {
    console.error('Error fetching places:', error)
    places.value = []
  }
  loading.value = false
}

function searchPlaces() {
  pagination.pageNo = 1
  getPlaces()
}

function clearForm() {
  searchForm.digipin5 = ''
  searchForm.locality = ''
  searchForm.administrativeArea = ''
  searchForm.classification = 'pending'
  pagination.pageNo = 1
  getPlaces()
}

function handlePageChange(page: number) {
  pagination.pageNo = page
  getPlaces()
}

function showPlaceDetails(place: Place) {
  selectedPlace.value = place
  showDetails.value = true
}

function handlePlaceUpdated() {
  showDetails.value = false
  getPlaces() // Refresh the data after successful update
}

function handleDigipinSelected(digipin5: string) {
  searchForm.digipin5 = digipin5
  searchPlaces() // This will reset pageNo to 1 and call getPlaces()
}

onMounted(() => {
  getPlaces()
})

</script>