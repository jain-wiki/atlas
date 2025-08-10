<template>
  <QDialog :model-value="show" maximized>
    <QCard>
      <QBar class="tw:bg-gradient-to-br! tw:from-slate-800 tw:to-slate-500 tw:text-white">
        <span>Map Boxes</span>
        <QSpace />
        <QBtn dense flat icon="close" v-close-popup>
          <QTooltip>Close</QTooltip>
        </QBtn>
      </QBar>

      <QCardSection>
        <span class="grid-info" v-if="gridRectangles.length > 0">
          {{ gridRectangles.length }} grid cells displayed
        </span>
        <span>
          The Zoom level is {{ map?.getZoom() }}
        </span>
      </QCardSection>

      <div>
        <div id="grid-map" class="map" ref="mapContainer"></div>
      </div>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getUniqueDigiPinPrefixes, getBoundingBoxFromDigiPINPrefix } from '@atlas/utils/digipinutils'

const show = ref(true)
const mapContainer = ref(null)
const map = ref(null)
const L = ref(null)
const gridRectangles = ref([])

/**
 * Generate and display DigiPin grid on the map
 */
const generateDigiPinGrid = () => {
  try {
    // Get current map bounds
    const bounds = map.value.getBounds()
    const minLat = bounds.getSouth()
    const maxLat = bounds.getNorth()
    const minLon = bounds.getWest()
    const maxLon = bounds.getEast()

    console.log('Map bounds:', { minLat, maxLat, minLon, maxLon })

    // Get unique DigiPin prefixes for the current view
    const digiPinPrefixes = getUniqueDigiPinPrefixes(minLat, maxLat, minLon, maxLon, 0.01)
    console.log(`Found ${digiPinPrefixes.length} DigiPin prefixes`)

    // Create rectangles for each DigiPin prefix
    digiPinPrefixes.forEach((prefix, index) => {
      try {
        const bbox = getBoundingBoxFromDigiPINPrefix(prefix)

        // Create rectangle with 80% transparency
        const rectangle = L.value.rectangle(
          [[bbox.minLat, bbox.minLon], [bbox.maxLat, bbox.maxLon]],
          {
            color: '#3388ff',
            weight: 1,
            opacity: 0.8,
            fillColor: '#3388ff',
            fillOpacity: 0.2
          }
        ).addTo(map.value)

        // Add popup with low/high corners (SW and NE) in easy-to-copy JSON format
        const info = {
          low: {
            latitude: parseFloat(bbox.minLat.toFixed(3)),
            longitude: parseFloat(bbox.minLon.toFixed(3))
          },
          high: {
            latitude: parseFloat(bbox.maxLat.toFixed(3)),
            longitude: parseFloat(bbox.maxLon.toFixed(3))
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

    console.log(`Added ${gridRectangles.value.length} grid rectangles to map`)
  } catch (error) {
    console.error('Error generating DigiPin grid:', error)
  }
}



/**
 * Initialize the Leaflet map with Mumbai coordinates
 */
const initializeMap = async () => {
  try {
    // Dynamically import Leaflet to avoid loading it on the home page
    L.value = await import('leaflet')

    // Mumbai coordinates
    const mumbaiCoords = [19.0760, 72.8777]

    // Initialize the map
    map.value = L.value.map(mapContainer.value).setView(mumbaiCoords, 13)

    // Add OpenStreetMap tiles
    L.value.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

onMounted(async () => {
  await initializeMap()
})

onBeforeUnmount(() => {
  // Clean up map instance
  if (map.value) {
    map.value.remove()
  }
})
</script>
