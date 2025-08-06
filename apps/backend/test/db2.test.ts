import { Database } from "bun:sqlite";

const db = new Database(":memory:");  // Or use a file path like "mydb.sqlite"

// Attempt to create a simple FTS5 virtual table for full-text search
try {
  db.exec(`
    CREATE VIRTUAL TABLE documents USING fts5(
      title,
      content,
      tokenize='porter unicode61 remove_diacritics 2'  -- Optional: Use Porter stemming for better search
    );
  `);

  // Insert sample data
  db.exec(`
    INSERT INTO documents(title, content) VALUES
      ('Sample Document 1', 'This is a test document about SQLite and full-text search.'),
      ('Sample Document 2', 'Bun is a fast JavaScript runtime with built-in SQLite support.'),
      ('Sample Document 3', 'Exploring FTS in databases for efficient text queries.');
  `);

  // Test a full-text search query (search for documents containing "SQLite")
  const result = db.query(`
    SELECT title, snippet(documents, 1, '<b>', '</b>', '...', 16) AS excerpt
    FROM documents
    WHERE documents MATCH 'SQLite'
    ORDER BY rank;
  `).all();

  console.log("Query result:", result);  // Should return matching titles and excerpts
  console.log("FTS is working!");
} catch (error) {
  // @ts-ignore
  console.error("Error:", error.message);  // Likely "no such module: fts5" if not enabled
}

db.close();
