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
            <div class="tw:mb-2">
              <span class="tw:text-lg">Add Item to Main Database (ie. WikiBase on https://data.jain.wiki)</span>
            </div>
            <!-- Required Fields -->
            <div class=" tw:text-gray-700 tw:underline tw:mb-2">Basic Details</div>
            <div class="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-2">
              <QInput v-model="formData.label" label="Label *" outlined dense required counter maxlength="100"
                class="tw:col-span-full" hint="Remove the words like 'Jain Temple/Mandir' or 'Digambar/Shwetambar'" />

              <QInput v-model="formData.description" label="Description *" outlined dense required counter
                maxlength="100" class="tw:col-span-full"
                hint="High level address of the place. Village/Town/City, District, State. Remove plus code if any." />

              <div class="tw:space-y-2">
                <div class="tw:text-sm tw:font-medium tw:mb-0">Classification *</div>
                <QOptionGroup v-model="formData.classification" :options="classificationOptions" color="primary"
                  inline />
              </div>

              <div class="tw:space-y-2">
                <div class="tw:text-sm tw:font-medium tw:mb-0">Sect
                  <QBtn v-if="formData.sect" outline dense size="sm" label="Clear" color="primary"
                    @click="formData.sect = ''" class="tw:ml-2!" />
                </div>
                <QOptionGroup v-model="formData.sect" :options="sectOptions" color="primary" inline class="tw:mb-0" />
                <div class="tw:text-gray-600 tw:text-xs">If you need to add more then one value for this field, make
                  the changes directly on the <strong>WikiBase</strong>, after the item is created.</div>
              </div>


              <div class="tw:space-y-2">
                <div class="tw:text-sm tw:font-medium tw:mb-0">Tirthankar</div>
                <QSelect v-model="formData.tirthankar" :options="filteredTirthankarOptions" color="primary" use-input
                  input-debounce="0" @filter="filterTirthankar" @input-value="setTirthankarInputValue" clearable
                  outlined dense hint="Type to search" />
              </div>
            </div>

            <!-- Location Fields -->
            <div class="tw:text-gray-700 tw:underline tw:mb-2">Location Details</div>
            <div class="tw:mb-2 tw:text-gray-600 tw:text-xs">
              <span>latitude: {{ formData.latitude }}, longitude: {{ formData.longitude }}</span><br />
              <span>Place ID: {{ formData.googleMapsPlaceId }}</span><br />
              <span>Google Maps URI: {{ formData.googleMapsUri }}</span>
            </div>

            <div class="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-2">
              <QInput v-model="formData.administrativeArea" label="State in India" outlined dense maxlength="100" />

              <QInput v-model="formData.locality" label="City/Town/Village" outlined dense />
              <QInput v-model="formData.address" label="Address" type="textarea" outlined dense rows="2"
                hint="Full address. Remove plus code if any." />

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
          <pre>
{{ placeResponse }}</pre>
        </div>
      </QCardSection>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { Ax } from '@/helper/axios'
import { computed, reactive, ref, watch } from 'vue'
import type { Place } from '@atlas/types/src/gplace'

const props = defineProps<{
  place: Place | null
}>()
const emit = defineEmits<{
  'item-added': []
}>()

const placeResponse = computed(() => JSON.parse(props.place?.response ?? '{}'))
const show = defineModel<boolean>('show', { default: false })
const isSubmitting = ref(false) // Form submission loading state

// Reactive data for Tirthankar autocomplete
const tirthankarInputValue = ref('')
const filteredTirthankarOptions = ref<Array<{ value: string; label: string }>>([])

// Form data reactive object
const formData = reactive({
  label: '',
  description: '',
  classification: '' as 'T' | 'C' | '',
  sect: '' as 'Digambar' | 'Shwetambar' | 'Terapanth' | 'Sthanakvasi' | '',
  tirthankar: '' as 'Q14' | 'Q15' | 'Q16' | 'Q17' | 'Q18' | 'Q19' | 'Q20' | 'Q21' | 'Q22' | 'Q23' | 'Q24' | 'Q25' | 'Q26' | 'Q27' | 'Q28' | 'Q29' | 'Q30' | 'Q31' | 'Q32' | 'Q33' | 'Q34' | 'Q35' | 'Q36' | 'Q37',
  latitude: '',
  longitude: '',
  administrativeArea: '',
  locality: '',
  postalCode: '',
  address: '',
  googleMapsUri: '',
  googleMapsPlaceId: ''
})

// Options for dropdowns
const classificationOptions = [
  { label: 'Temple', value: 'T' },
  { label: 'Community Center (Bhavan/Sthanak)', value: 'C' }
]

const sectOptions = [
  { label: 'Digambar', value: 'Digambar' },
  { label: 'Shwetambar', value: 'Shwetambar' },
  { label: 'Terapanth', value: 'Terapanth' },
  { label: 'Sthanakvasi', value: 'Sthanakvasi' }
]

const tirthankarOptions = [
  { value: 'Q14', label: 'Rishabhanath' },
  { value: 'Q15', label: 'Ajitanath' },
  { value: 'Q16', label: 'Sambhavanath' },
  { value: 'Q17', label: 'Abhinandananath' },
  { value: 'Q18', label: 'Sumatinath' },
  { value: 'Q19', label: 'Padmaprabhu' },
  { value: 'Q20', label: 'Suparshvanath' },
  { value: 'Q21', label: 'Chandraprabhu' },
  { value: 'Q22', label: 'Suvidhinath' },
  { value: 'Q23', label: 'Shitalanath' },
  { value: 'Q24', label: 'Shreyansanath' },
  { value: 'Q25', label: 'Vasupujya' },
  { value: 'Q26', label: 'Vimalanath' },
  { value: 'Q27', label: 'Anantanath' },
  { value: 'Q28', label: 'Dharmanath' },
  { value: 'Q29', label: 'Shantinath' },
  { value: 'Q30', label: 'Kunthunath' },
  { value: 'Q31', label: 'Aranath' },
  { value: 'Q32', label: 'Mallinath' },
  { value: 'Q33', label: 'Munisuvrat' },
  { value: 'Q34', label: 'Naminath' },
  { value: 'Q35', label: 'Neminath' },
  { value: 'Q36', label: 'Parshvanath' },
  { value: 'Q37', label: 'Mahavir' },]

// Tirthankar autocomplete methods
const filterTirthankar = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    if (val === '') {
      filteredTirthankarOptions.value = tirthankarOptions
    }
    else {
      const needle = val.toLowerCase()
      filteredTirthankarOptions.value = tirthankarOptions.filter(
        option => option.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const setTirthankarInputValue = (val: string) => {
  tirthankarInputValue.value = val
}

// Initialize filtered options
filteredTirthankarOptions.value = tirthankarOptions

// Pre-populate form with place data if available
const populateFormFromPlace = () => {
  if (props.place && placeResponse.value) {
    const response = placeResponse.value
    formData.label = props.place.displayName


    formData.latitude = response.location.latitude || ''
    formData.longitude = response.location.longitude || ''
    formData.administrativeArea = props.place.administrativeArea || ''
    formData.locality = props.place.locality || ''
    formData.postalCode = props.place.pincode || ''
    formData.googleMapsPlaceId = response.id || ''
    formData.googleMapsUri = response.googleMapsUri || ''
    formData.address = response.formattedAddress

    // Generate description from address components
    const lastLineOfaddressLines = response.postalAddress?.addressLines?.slice(-1)[0] || ''
    formData.description = `${lastLineOfaddressLines} , ${response.postalAddress?.locality}, ${response.postalAddress?.administrativeArea}`

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
      ...(formData.tirthankar && { tirthankar: formData.tirthankar }),
      ...(formData.administrativeArea && { administrativeArea: formData.administrativeArea.trim() }),
      ...(formData.locality && { locality: formData.locality.trim() }),
      ...(formData.postalCode && { postalCode: formData.postalCode.trim() }),
      ...(formData.address && { address: formData.address.trim() })
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
        tirthankar: '',
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
