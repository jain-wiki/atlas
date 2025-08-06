import { Database } from "bun:sqlite";

const db = new Database(":memory:");  // Or use a file path like "mydb.sqlite"

// Attempt to create a simple 2D R*Tree virtual table
try {
  db.exec(`
    CREATE VIRTUAL TABLE demo_index USING rtree(
      id,             -- Integer primary key
      minX, maxX,     -- Minimum and maximum X coordinate
      minY, maxY      -- Minimum and maximum Y coordinate
    );
  `);

  // Insert sample data (bounding boxes for spatial queries)
  db.exec(`
    INSERT INTO demo_index(id, minX, maxX, minY, maxY)
    VALUES
      (1, -80.77470, -80.77470, 35.37785, 35.37785),
      (2, -80.781227, -80.604706, 35.208813, 35.297367);
  `);

  // Test a simple spatial query
  const result = db.query(`
    SELECT id FROM demo_index
    WHERE minX <= -80.77470 AND maxX >= -80.77470
    AND minY <= 35.37785 AND maxY >= 35.37785;
  `).all();

  console.log("Query result:", result);  // Should return matching IDs
  console.log("R*Tree is working!");
} catch (error) {
  // @ts-ignore
  console.error("Error:", error.message);  // Likely "no such module: rtree" if not enabled
}

db.close();
