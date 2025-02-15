import { Database } from 'sqlite3';
import { open, Database as SqliteDatabase } from 'sqlite';
import path from 'path';

let dbInstance: SqliteDatabase | null = null;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  // Open SQLite database
  dbInstance = await open({
    filename: path.join(process.cwd(), 'translations.db'),
    driver: Database
  });

  // Create translations table if it doesn't exist
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS translations (
      text TEXT NOT NULL,
      target_language TEXT NOT NULL,
      translation TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (text, target_language)
    )
  `);

  return dbInstance;
}