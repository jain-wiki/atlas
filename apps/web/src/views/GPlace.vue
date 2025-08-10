<template>
  <QPage class="tw:md:px-4">
    <QBreadcrumbs class="tw:my-1">
      <QBreadcrumbsEl label="Home" :to="{ name: 'Home' }" />
      <QBreadcrumbsEl label="Google Maps Places" />
    </QBreadcrumbs>
    <!-- Search Form -->
    <QCard class="tw:p-4 tw:mb-6">
      <QCardSection>
        <div class="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 lg:tw:grid-cols-4 tw:gap-4 tw:mb-4">
          <QInput v-model="searchForm.digipin5" label="Digipin5" outlined dense clearable />
          <QInput v-model="searchForm.locality" label="Locality" outlined dense clearable />
          <QInput v-model="searchForm.administrativeArea" label="Administrative Area" outlined dense clearable />
          <QInput v-model="searchForm.classification" label="Classification" outlined dense clearable />
        </div>
        <div class="tw:flex tw:gap-2">
          <QBtn @click="searchPlaces" color="primary" :loading="loading" label="Search" />
          <QBtn @click="clearForm" color="secondary" outline label="Clear" />
        </div>
      </QCardSection>
    </QCard>

    <!-- Place List Component -->
    <PlaceList :places="places" :loading="loading" :pagination="pagination" @page-change="handlePageChange" />
  </QPage>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Ax } from '@/helper/axios'
import PlaceList from '@/components/place/PlaceList.vue'
import type { Pagination } from '@atlas/types/src/list'

interface Place {
  id: string
  rtree_id: number
  displayName: string
  administrativeArea?: string
  locality?: string
  pincode?: string
  digipin5: string
  response: string
  createdAt: string
  classification?: string
}

const loading = ref(false)
const places = ref<Place[]>([])
const searchForm = reactive({
  digipin5: '',
  locality: '',
  administrativeArea: '',
  classification: ''
})

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
  searchForm.classification = ''
  pagination.pageNo = 1
  getPlaces()
}

function handlePageChange(page: number) {
  pagination.pageNo = page
  getPlaces()
}

onMounted(() => {
  getPlaces()
})

</script>