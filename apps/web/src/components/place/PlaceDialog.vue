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

      <!-- Classification Form -->
      <QCardSection v-if="place && !successMessage">
        <QSeparator class="tw:mb-4" />
        <div class="tw:text-h6 tw:mb-4">Update Classification</div>
        <QOptionGroup v-model="selectedClassification" :options="classificationOptions" color="primary" type="radio" />
      </QCardSection>

      <!-- Success Message -->
      <QCardSection v-if="successMessage">
        <QSeparator class="tw:mb-4" />
        <div class="tw:text-center tw:py-4">
          <QIcon name="check_circle" color="positive" size="3em" class="tw:mb-2" />
          <div class="tw:text-positive tw:text-lg">{{ successMessage }}</div>
        </div>
      </QCardSection>

      <QCardActions align="right">
        <QBtn v-if="placeData?.googleMapsUri && !successMessage" label="Open in Google Maps" color="primary"
          @click="openGoogleMapsFromDialog" />
        <QBtn v-if="!successMessage && place" label="Update Classification" color="positive" :loading="updating"
          :disable="!selectedClassification" @click="updateClassification" />
        <QBtn label="Close" color="grey" flat @click="closeDialog" />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Place } from '@atlas/types/src/gplace'
import { Ax } from '@/helper/axios'

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

const emit = defineEmits<{
  'update:show': [value: boolean]
  'place-updated': []
}>()

const updating = ref(false)
const successMessage = ref('')
const selectedClassification = ref('')

const classificationOptions = [
  { label: 'Temple', value: 'T' },
  { label: 'Community', value: 'C' },
  { label: 'Rejected', value: 'R' }
]

const placeData = computed<PlaceData | null>(() => {
  if (!props.place?.response) return null
  try {
    return JSON.parse(props.place.response)
  } catch {
    return null
  }
})

// Reset form when dialog opens/closes or place changes
watch([() => props.show, () => props.place], () => {
  if (props.show && props.place) {
    selectedClassification.value = props.place.classification || ''
    successMessage.value = ''
  }
})

async function updateClassification() {
  if (!props.place || !selectedClassification.value) return

  updating.value = true
  try {
    const response = await Ax.patch(`/public/gplace/classify/${props.place.id}`, {
      classification: selectedClassification.value
    })

    if (response.data.success) {
      successMessage.value = response.data.message || 'Classification updated successfully!'

      // Emit event to parent to refresh data
      setTimeout(() => {
        emit('place-updated')
      }, 1500) // Small delay to show success message
    }
  } catch (error) {
    console.error('Error updating classification:', error)
    // You could add error handling here if needed
  }
  updating.value = false
}

function closeDialog() {
  emit('update:show', false)
  // Reset state when closing
  setTimeout(() => {
    successMessage.value = ''
    selectedClassification.value = ''
  }, 300) // Small delay for dialog close animation
}

function openGoogleMapsFromDialog() {
  if (placeData.value?.googleMapsUri) {
    window.open(placeData.value.googleMapsUri, '_blank')
  }
}
</script>
