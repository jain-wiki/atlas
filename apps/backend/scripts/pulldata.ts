import type { LocationRestriction } from '@atlas/types/maps';
import { getBoundingBoxFromDigiPINPrefix } from '@atlas/utils/digipinutils';
import { getTemplesFromGoogleMaps } from '../helper/gmaps1';
import { insertPlaces } from '../helper/gmapsdb';
import { db } from '../lib/db';
import { dayjs } from '@atlas/utils';

// Read rect.txt line by line using bun
const file = await Bun.file('rect.txt').text()
const lines = file.split('\n');

// Process each line
for (const line of lines) {
  const digipin5 = line.trim();
  if (!digipin5) { continue; }


  const { maxLat, maxLng, minLat, minLng } = getBoundingBoxFromDigiPINPrefix(digipin5);

  const locationRestriction: LocationRestriction = {
    rectangle: {
      // The low point marks the southwest corner of the rectangle, and the high point represents the northeast corner of the rectangle.
      low: { latitude: minLat, longitude: minLng }, // South West
      high: { latitude: maxLat, longitude: maxLng } // North East
    }
  }

  const places = await getTemplesFromGoogleMaps(locationRestriction)
  insertPlaces(places); // save to db
  // Since there was no error, update the rectangle in the rect table
  const updatedAt = dayjs().utc().format('YYYY-MM-DD HH:mm:ss')
  db.run('INSERT OR REPLACE INTO rect (id, updatedAt) VALUES (?, ?);', [digipin5, updatedAt]);

  console.log(`✅${digipin5} Found ${places.length} places`);
  // Wait for a short time to avoid hitting the rate limit
  await Bun.sleep(1000);
}