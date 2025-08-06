// Ref: https://developers.google.com/maps/documentation/places/web-service/text-search

import axios from 'axios';
import type { LocationRestriction } from '@atlas/types/maps';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

const mapsFieldMask = [
  // Essentials Only SKU:
  'places.id',
  'places.name',
  'places.attributions',
  'nextPageToken', // Token for the next page of results
  // Text Search Pro SKU:
  'places.displayName', // Display name of the place
  'places.adrFormatAddress',
  'places.formattedAddress',
  'places.postalAddress',
  'places.plusCode',
  'places.location', // Location of the place (latitude and longitude)
  'places.googleMapsUri', // Main URL to the place on Google Maps
  'places.types', // Types of the place (e.g., 'place_of_worship')
].join(',');





async function getTemplesFromGoogleMaps(locationRestriction: LocationRestriction, nextPageToken?: string, pageCount: number = 1) {

  const response = await axios.post(
    'https://places.googleapis.com/v1/places:searchText',
    {
      textQuery: 'jain temples',
      languageCode: 'en',
      locationRestriction: locationRestriction,
      pageToken: nextPageToken || undefined, // Use nextPageToken if provided.
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': mapsFieldMask,
      }
    }
  );


  const places = response.data.places || [];
  const responsePageToken = response.data.nextPageToken;
  if (responsePageToken) {
    // TODO: Handle pagination
  }

  return places;

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
