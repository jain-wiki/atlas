<template>
  <QDialog :model-value="show" maximized class="grid-map-dialog">
    <QCard class="tw:h-full tw:flex tw:flex-col">
      <QBar class="tw:bg-gradient-to-br! tw:from-slate-800 tw:to-slate-500 tw:text-white tw:z-[1000]">
        <span>Map Boxes</span>
        <QSpace />
        <QBtn dense flat icon="close" v-close-popup>
          <QTooltip>Close</QTooltip>
        </QBtn>
      </QBar>

      <QCardSection class="tw:flex-shrink-0">
        <div class="tw:flex tw:items-center tw:justify-between tw:gap-4">
          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="grid-info" v-if="gridRectangles.length > 0">
              {{ gridRectangles.length }} grid cells displayed
            </span>
            <span v-if="map">
              The Zoom level is {{ map.getZoom() }}
            </span>
          </div>
          <QBtn color="primary" icon="my_location" label="Current Location" @click="setCurrentLocation"
            :loading="isLocationLoading" :disable="locationError !== null">
            <QTooltip v-if="locationError">{{ locationError }}</QTooltip>
          </QBtn>
          <div v-if="locationError">
            {{ locationError }}
          </div>
        </div>
      </QCardSection>

      <div class="tw:flex-1 tw:relative">
        <div id="grid-map" class="map tw:h-full tw:w-full" ref="mapContainer"></div>
      </div>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, type Ref } from 'vue'
import { useGeolocation } from '@vueuse/core'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getUniqueDigiPinPrefixes, getBoundingBoxFromDigiPINPrefix } from '@atlas/utils/digipinutils'

const show = ref(true)
const mapContainer: Ref<HTMLElement | null> = ref(null)
const map: Ref<L.Map | null> = ref(null)
const gridRectangles: Ref<L.Rectangle[]> = ref([])
const currentLocationMarker: Ref<L.Marker | null> = ref(null)

// Geolocation setup
const { coords, error: locationError, resume, pause } = useGeolocation()

// Computed properties for location state
const isLocationLoading = computed(() => {
  // Show loading if we don't have coordinates yet and there's no error
  return coords.value.latitude === null && coords.value.longitude === null && locationError.value === null
})


/**
 * Set the map center to user's current location
 */
const setCurrentLocation = (): void => {
  try {
    if (!map.value) {
      console.warn('Map not initialized'); return;
    }
    if (locationError.value) {
      console.error('Geolocation error:', locationError.value); return;
    }

    if (coords.value.latitude !== null && coords.value.longitude !== null) {
      const currentLocation: [number, number] = [coords.value.latitude, coords.value.longitude]

      // Remove existing location marker if any
      if (currentLocationMarker.value) {
        map.value.removeLayer(currentLocationMarker.value)
      }

      // Set map view to current location
      map.value.setView(currentLocation, 13)

      // Add a marker at current location
      currentLocationMarker.value = L.marker(currentLocation, {
        icon: L.divIcon({
          className: 'current-location-marker',
          html: '<div style="background-color: #007cff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,124,255,0.6);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      })
        .addTo(map.value)
        .bindPopup('Your current location')
        .openPopup()

      pause() // Pause geolocation tracking to save battery

    } else {
      console.warn('Location coordinates not available yet')
      // Resume geolocation to get fresh coordinates
      resume()
    }
  } catch (err) {
    console.error('Error setting current location:', err)
  }
}

/**
 * Generate and display DigiPin grid on the map
 */
const generateDigiPinGrid = (): void => {
  try {
    if (!map.value) return

    // Clear existing grid rectangles
    gridRectangles.value.forEach(rectangle => {
      map.value?.removeLayer(rectangle)
    })
    gridRectangles.value = []

    // Get current map bounds
    const bounds = map.value.getBounds()
    const minLat = bounds.getSouth()
    const maxLat = bounds.getNorth()
    const minLon = bounds.getWest()
    const maxLon = bounds.getEast()

    // Get unique DigiPin prefixes for the current view
    const digiPinPrefixes = getUniqueDigiPinPrefixes(minLat, maxLat, minLon, maxLon, 0.01)

    // Create rectangles for each DigiPin prefix
    digiPinPrefixes.forEach((prefix) => {
      try {
        const bbox = getBoundingBoxFromDigiPINPrefix(prefix)

        // Create rectangle with 80% transparency
        const rectangle = L.rectangle(
          [[bbox.minLat, bbox.minLng], [bbox.maxLat, bbox.maxLng]],
          {
            color: '#3388ff',
            weight: 1,
            opacity: 0.8,
            fillColor: '#3388ff',
            fillOpacity: 0.2
          }
        ).addTo(map.value!)

        // Add popup with low/high corners (SW and NE) in easy-to-copy JSON format
        const info = {
          low: {
            latitude: parseFloat(bbox.minLat.toFixed(3)),
            longitude: parseFloat(bbox.minLng.toFixed(3))
          },
          high: {
            latitude: parseFloat(bbox.maxLat.toFixed(3)),
            longitude: parseFloat(bbox.maxLng.toFixed(3))
          }
        }

        const popupContent = `${prefix}
<pre style="margin:0;">${JSON.stringify(info, null, 1)}</pre>`
        rectangle.bindPopup(popupContent)

        gridRectangles.value.push(rectangle)
      } catch (error) {
        console.warn(`Error processing DigiPin prefix ${prefix}:`, error)
      }
    })

  } catch (error) {
    console.error('Error generating DigiPin grid:', error)
  }
}

/**
 * Initialize the Leaflet map with Mumbai coordinates
 */
const initializeMap = (): void => {
  try {
    if (!mapContainer.value) return

    // Mumbai coordinates
    const mumbaiCoords: [number, number] = [19.0760, 72.8777]

    // Initialize the map
    map.value = L.map(mapContainer.value, {
      minZoom: 10,
      maxZoom: 13
    }).setView(mumbaiCoords, 13)

    // Add OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map.value)

    // Set event listeners for map movements. This will trigger grid generation on move or zoom
    map.value.on('moveend', generateDigiPinGrid)
    map.value.on('zoomend', generateDigiPinGrid)

    // Generate grid for initial view
    setTimeout(generateDigiPinGrid, 500) // Small delay to ensure map is fully loaded
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

onMounted(() => {
  setTimeout(initializeMap, 100)
})

onBeforeUnmount(() => {
  // Clean up map instance
  if (map.value) {
    map.value.remove()
    map.value = null
  }
  gridRectangles.value = []
  currentLocationMarker.value = null

  // Pause geolocation to save battery
  pause()
})
</script>
