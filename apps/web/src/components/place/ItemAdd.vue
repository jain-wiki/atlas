<template>
  <QDialog :model-value="show" @update:model-value="show = $event" maximized class="grid-map-dialog">
    <QCard class="tw:h-full tw:flex tw:flex-col">
      <QBar class="tw:bg-gradient-to-br! tw:from-slate-800 tw:to-slate-500 tw:text-white tw:z-[1000]">
        <QSpace />
        <QBtn dense flat icon="close" @click="show = false">
          <QTooltip>Close</QTooltip>
        </QBtn>
      </QBar>

      <QCardSection class="tw:grid-cols-2 tw:grid">
        <!-- Form -->
        <div class="tw:flex-1">
          <QForm @submit="onSubmit" class="tw:max-w-2xl tw:mx-auto tw:space-y-6">
            <div>
              <span class="tw:text-lg">Add Item to Main Database (ie. WikiBase on https://data.jain.wiki)</span>
            </div>
            <!-- Required Fields -->
            <div class=" tw:text-gray-700 tw:underline">Basic Details</div>
            <div class="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-2">
              <QInput v-model="formData.label" label="Label *" outlined dense required counter maxlength="100"
                class="tw:col-span-full" hint="Remove the words like 'Jain Temple/Mandir'" />

              <QInput v-model="formData.description" label="Description *" outlined dense required counter
                maxlength="500" class="tw:col-span-full" />

              <QSelect v-model="formData.classification" label="Classification *" outlined dense
                :options="classificationOptions" emit-value map-options
                :rules="[val => !!val || 'Classification is required']" />

              <QSelect v-model="formData.sect" label="Sect" outlined dense :options="sectOptions" emit-value map-options
                clearable />
            </div>

            <!-- Location Fields -->
            <div class="tw:text-gray-700 tw:underline">Location Details</div>

            <div class="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-2">
              <QInput v-model="formData.administrativeArea" label="Administrative Area" outlined dense
                maxlength="100" />

              <QInput v-model="formData.locality" label="Locality" outlined dense maxlength="100" />

              <QInput v-model="formData.postalCode" label="Postal Code" outlined dense maxlength="20" />
            </div>

            <!-- Submit Button -->
            <div class="tw:flex tw:justify-end tw:space-x-4 tw:pt-6">
              <QBtn type="button" label="Cancel" color="grey-5" @click="show = false" class="tw:px-6" />
              <QBtn type="submit" label="Save to WikiBase" color="primary" :loading="isSubmitting"
                :disable="isSubmitting" class="tw:px-6" />
            </div>
          </QForm>
        </div>
        <div>
          Hello
        </div>
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { Ax } from '@/helper/axios'
import { computed, reactive, ref, watch } from 'vue'
import type { Place } from '@atlas/types/src/gplace'

const show = defineModel<boolean>('show', { default: false })

const props = defineProps<{
  place: Place | null
}>()

const emit = defineEmits<{
  'item-added': []
}>()

const placeResponse = computed(() => JSON.parse(props.place?.response ?? '{}'))

// Form data reactive object
const formData = reactive({
  label: '',
  description: '',
  classification: '' as 'T' | 'C' | '',
  sect: '' as 'Digambar' | 'Shwetambar' | 'Terapanth' | 'Sthanakvasi' | '',
  administrativeArea: '',
  locality: '',
  postalCode: '',
  googleMapsUri: '',
  googleMapsPlaceId: ''
})

// Form submission loading state
const isSubmitting = ref(false)

// Options for dropdowns
const classificationOptions = [
  { label: 'Temple', value: 'T' },
  { label: 'Community Center', value: 'C' }
]

const sectOptions = [
  { label: 'Digambar', value: 'Digambar' },
  { label: 'Shwetambar', value: 'Shwetambar' },
  { label: 'Terapanth', value: 'Terapanth' },
  { label: 'Sthanakvasi', value: 'Sthanakvasi' }
]

// Pre-populate form with place data if available
const populateFormFromPlace = () => {
  if (props.place && placeResponse.value) {
    const response = placeResponse.value

    // Auto-adjust label to exactly 100 characters
    let label = props.place.displayName || response.displayName?.text || ''
    if (label.length > 100) {
      label = label.substring(0, 100)
    } else if (label.length < 100) {
      // Pad with spaces to reach 100 characters
      label = label.padEnd(100, ' ')
    }
    formData.label = label

    formData.administrativeArea = props.place.administrativeArea || response.administrativeArea || ''
    formData.locality = props.place.locality || response.locality || ''
    formData.postalCode = props.place.pincode || response.postalCode || ''
    formData.googleMapsPlaceId = response.id || ''
    formData.googleMapsUri = response.googleMapsUri || ''

    // Generate description from address components
    const addressComponents = []
    if (response.formattedAddress) {
      formData.description = response.formattedAddress
    } else {
      if (formData.locality) addressComponents.push(formData.locality)
      if (formData.administrativeArea) addressComponents.push(formData.administrativeArea)
      if (formData.postalCode) addressComponents.push(formData.postalCode)
      formData.description = addressComponents.join(', ')
    }
  }
}

// Watch for place changes and populate form
watch(() => props.place, () => {
  if (props.place) {
    populateFormFromPlace()
  }
}, { immediate: true })

// Form submission handler
const onSubmit = async () => {
  isSubmitting.value = true
  try {
    // Prepare the payload for the API
    const payload = {
      label: formData.label.trim(),
      description: formData.description.trim(),
      classification: formData.classification,
      googleMapsUri: formData.googleMapsUri.trim(),
      googleMapsPlaceId: formData.googleMapsPlaceId.trim(),
      ...(formData.sect && { sect: formData.sect }),
      ...(formData.administrativeArea && { administrativeArea: formData.administrativeArea.trim() }),
      ...(formData.locality && { locality: formData.locality.trim() }),
      ...(formData.postalCode && { postalCode: formData.postalCode.trim() })
    }

    // Call the API
    const response = await Ax.post('/public/wiki/item', payload)

    if (response.data.success) {
      emit('item-added')
      show.value = false

      // Reset form
      Object.assign(formData, {
        label: '',
        description: '',
        classification: '',
        sect: '',
        administrativeArea: '',
        locality: '',
        postalCode: '',
        googleMapsUri: '',
        googleMapsPlaceId: ''
      })
    }
  } catch (error: any) {
    console.error('Error adding item to WikiBase:', error)
  }
  isSubmitting.value = false
}

</script>
