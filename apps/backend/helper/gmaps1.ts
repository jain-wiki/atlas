// Ref: https://developers.google.com/maps/documentation/places/web-service/text-search

import axios from 'axios';
import type { LocationRestriction, Place } from '@atlas/types/maps';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const PAGES_LIMIT = 4; // Limit to 3 pages of results

const mapsFieldMask = [
  // Essentials Only SKU:
  'places.id',
  // 'places.name', // This is not needed, hence commented out
  'places.attributions',
  'nextPageToken', // Token for the next page of results
  // Text Search Pro SKU:
  'places.displayName', // Display name of the place
  'places.formattedAddress',
  'places.postalAddress',
  'places.plusCode',
  'places.location', // Location of the place (latitude and longitude)
  'places.googleMapsUri', // Main URL to the place on Google Maps
  'places.types', // Types of the place (e.g., 'place_of_worship')
].join(',');





async function getTemplesFromGoogleMaps(locationRestriction: LocationRestriction) {
  let allPlaces: Place[] = [];
  let currentPageToken = undefined as string | undefined;
  let currentPageCount = 1;

  // Make up to 3 API calls
  while (currentPageCount <= PAGES_LIMIT) {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: 'jain temples',
        languageCode: 'en',
        locationRestriction: locationRestriction,
        pageToken: currentPageToken || undefined, // Use currentPageToken if provided.
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': mapsFieldMask,
        }
      }
    );

    const places = response.data?.places || [];
    allPlaces = allPlaces.concat(places);

    const responsePageToken = response.data?.nextPageToken;

    // Log warning on final call
    if (currentPageCount === PAGES_LIMIT && responsePageToken) {
      console.warn(`Fetching ${PAGES_LIMIT} page of results. This is the final page that will be fetched. There are still more results available, but this function is limited to ${PAGES_LIMIT} pages.`);
    }

    // If no more pages or we've reached our limit, break
    if (!responsePageToken || currentPageCount >= PAGES_LIMIT) {
      break;
    }

    // Prepare for next iteration
    currentPageToken = responsePageToken;
    currentPageCount++;
  }

  return allPlaces;

}


if (import.meta.main) {
  // For testing purposes.
  const locationRestriction: LocationRestriction = {
    rectangle: {
      low: { latitude: 19.188, longitude: 72.941 },
      high: { latitude: 19.228, longitude: 72.976 }
    }
  }
  const data = await getTemplesFromGoogleMaps(locationRestriction);
}
