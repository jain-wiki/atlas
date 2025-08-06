import { Database } from 'bun:sqlite';
// @ts-ignore
import sqlText from '../lib/schema.sql' with { type: 'text' };

const db = new Database(':memory:');
db.exec(sqlText);

// 1. Insert a place into the gmaps_places_index
// Note: we are not providing values for id, as it is auto-incremented
const { lastInsertRowid } = db.exec(`
    INSERT INTO gmaps_places_index (minX, maxX, minY, maxY, cid)
    VALUES (12.34, 12.34, 90.12, 90.12, "Q123")
`);
// Insert place into gmaps_places
db.exec(`
    INSERT INTO gmaps_places (id, lat, lng, rtree_id, response)
    VALUES ("Q123", 90.12, 12.34, ${lastInsertRowid}, '{"name": "Test Place"}')
`);

// 2.1. Query the gmaps_places_index to verify insertion
const rows = db.query('SELECT * FROM gmaps_places_index;').all();
console.log('Places Index after insertion:', rows);  // Should show the inserted bounding box
// 2.2. Query the gmaps_places table to verify the trigger worked
const places = db.query('SELECT * FROM gmaps_places;').all();
console.log('Places after insertion:', places);  // Should show the place with id 'Q123'

// 3. Test a spatial query on the gmaps_places_index. also join the gmaps_places table to get more details
const spatialQuery = db.query(`
    SELECT gmaps_places_index.*
    FROM gmaps_places_index
    JOIN gmaps_places ON gmaps_places.rtree_id = gmaps_places_index.id
    WHERE minX < 13.00 AND maxX > 12.00
    AND minY < 91.00 AND maxY > 89.00
`).all();
console.log('Spatial query result:', spatialQuery);

// 4. Test the trigger by deleting an entry from gmaps_places
db.exec('DELETE FROM gmaps_places WHERE id = "Q123"');
// Check if the corresponding entry in gmaps_places_index is also deleted
const remainingPlacesIndex = db.query('SELECT * FROM gmaps_places_index;').all();
console.log('Remaining Places Index after deletion:', remainingPlacesIndex);
// Check if the corresponding entry in gmaps_places is also deleted
const remainingPlaces = db.query('SELECT * FROM gmaps_places;').all();
console.log('Remaining Places after deletion:', remainingPlaces);
