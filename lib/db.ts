import { Database } from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db: any = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'translations.db'),
      driver: Database
    });
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS translations (
        text TEXT,
        target_language TEXT,
        translation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (text, target_language)
      )
    `);
  }
  return db;
}
