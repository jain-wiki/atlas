import type { Place } from '@atlas/types/maps';
import { db } from '../lib/db'
import { getCidFromGoogleMapsUri } from '@atlas/utils/src/maputils';
import { getDigipinPrefix } from '@atlas/utils/digipinutils';


// This will be used to check if a place already exists in the gmaps_places table
const checkStatement = db.prepare('SELECT id FROM gmaps_places WHERE id = ?');
// This will be used to insert places into the gmaps_places table
const insertStmt = db.prepare(`INSERT INTO gmaps_places
    (id, rtree_id, displayName, administrativeArea, locality, pincode, digipin5, response )
    VALUES
    ($id, $rtree_id, $displayName, $administrativeArea, $locality, $pincode, $digipin5, $response)`
)

export function insertPlaces(places: Place[]) {
  // Loop through each place and insert it into the database
  for (const place of places) {
    // check if the place exists in the database
    const cid = getCidFromGoogleMapsUri(place.googleMapsUri);
    if (!cid) { continue; } // Skip if no cid is found
    const existingPlace = checkStatement.get(cid);
    if (existingPlace) {
      continue; // Skip if the place already exists
    } else {
      insertPlaceInDb(place);
    }
  }

}

function insertPlaceInDb(place: Place) {
  if (!place.googleMapsUri || !place.location) { return }
  const cid = getCidFromGoogleMapsUri(place.googleMapsUri);
  if (!cid) { return }


  const response = JSON.stringify(place);
  const insertObj = {
    $id: cid,
    // $rtree_id: undefined, // This will be set later
    $displayName: place.displayName?.text || '',
    $administrativeArea: place.postalAddress?.administrativeArea || '',
    $locality: place.postalAddress?.locality || '',
    $pincode: place.postalAddress?.postalCode || '',
    $digipin5: getDigipinPrefix(place.location.latitude, place.location.longitude),
    $response: response,
  }

  // Use transaction
  db.transaction(() => {
    // 1st add the place to the gmaps_places_index table,
    //   which will give us the id,
    //   which will then be used to insert into the gmaps_places table as rtree_id
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO gmaps_places_index
      (minX, maxX, minY, maxY, cid)
      VALUES
      ($minX, $maxX, $minY, $maxY)
    `).run({
      $minX: place.location.longitude - 0.0001,
      $maxX: place.location.longitude + 0.0001,
      $minY: place.location.latitude - 0.0001,
      $maxY: place.location.latitude + 0.0001,
    })

    // 2nd add the place to the gmaps_places table
    // @ts-ignore
    insertObj.$rtree_id = lastInsertRowid;
    insertStmt.run(insertObj);

  })


}


