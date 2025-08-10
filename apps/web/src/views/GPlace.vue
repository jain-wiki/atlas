<template>
  <QPage class="tw:p-6">
    <div class="tw:mb-6">
      <h1 class="tw:text-2xl tw:font-bold tw:mb-4">Google Maps Places</h1>

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
    </div>

    <!-- Place List Component -->
    <PlaceList :places="places" :loading="loading" :pagination="pagination" @page-change="handlePageChange" />
  </QPage>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Ax } from '@/helper/axios'
import PlaceList from '@/components/place/PlaceList.vue'

const $router = useRouter()

interface Place {
  id: string
  rtree_id: number
  displayName: string
  administrativeArea: string
  locality: string
  pincode: string
  digipin5: string
  response: string
  createdAt: string
  classification: string | null
}

interface SearchForm {
  digipin5: string
  locality: string
  administrativeArea: string
  classification: string
}

interface Pagination {
  pageNo: number
  pageLimit: number
  totalPages: number
  hasMore: boolean
}

const loading = ref(false)
const places = ref<Place[]>([])
const searchForm = reactive<SearchForm>({
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

async function getPlaces(page = 1) {
  loading.value = true

  try {
    const params = new URLSearchParams()

    if (searchForm.digipin5) params.append('digipin5', searchForm.digipin5)
    if (searchForm.locality) params.append('locality', searchForm.locality)
    if (searchForm.administrativeArea) params.append('administrativeArea', searchForm.administrativeArea)
    if (searchForm.classification) params.append('classification', searchForm.classification)

    params.append('pageNo', page.toString())
    params.append('pageLimit', pagination.pageLimit.toString())

    const response = await Ax.get(`/public/gplace/list?${params.toString()}`)

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
  } finally {
    loading.value = false
  }
}

function searchPlaces() {
  pagination.pageNo = 1
  getPlaces(1)
}

function clearForm() {
  searchForm.digipin5 = ''
  searchForm.locality = ''
  searchForm.administrativeArea = ''
  searchForm.classification = ''
  pagination.pageNo = 1
  getPlaces(1)
}

function handlePageChange(page: number) {
  getPlaces(page)
}

onMounted(() => {
  getPlaces()
})

</script>