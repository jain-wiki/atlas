import { editWikiItem } from '../helper/wikiitem';
import { db } from '../lib/db';

// All places where item is not null
const places = db.query(
  'SELECT * FROM gmaps_places WHERE item IS NOT NULL');

if (import.meta.main) {
  for (const place of places) {
    const { item, response } = place as any;
    const responseData = JSON.parse(response);

    const { latitude, longitude } = responseData?.location || {};

    // convert location to 6 decimal places and then save
    const resp = await editWikiItem(item, {
      'P2': {
        value: {
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          precision: 1e-7,
        }
      }
    });
    console.log(`${item} ${resp}`)
  }
}