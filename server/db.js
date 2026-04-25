const { createClient } = require('@libsql/client');
require('dotenv').config();

// Use an environment variable for the Turso URL and Auth Token.
// For local development, it will fall back to a local SQLite file (audit.db).
// Check if credentials are valid or just placeholders
const isPlaceholder = (str) => !str || str.trim() === "" || str.includes('your-') || str.includes('your_');

const hasRemoteCreds = !isPlaceholder(process.env.TURSO_DATABASE_URL) && !isPlaceholder(process.env.TURSO_AUTH_TOKEN);

const url = hasRemoteCreds 
    ? process.env.TURSO_DATABASE_URL 
    : 'file:audit.db';

const authToken = hasRemoteCreds 
    ? process.env.TURSO_AUTH_TOKEN 
    : '';

const db = createClient({
  url: url,
  authToken: authToken,
});

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS parties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      party_id INTEGER NOT NULL,
      article_id INTEGER NOT NULL,
      sub_work TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Pending', 'Working', 'Completed')),
      remarks TEXT,
      date TEXT NOT NULL,
      completion_date TEXT,
      created_by TEXT DEFAULT 'Admin',
      FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
  `);
  
  // Migration to add created_by if it doesn't exist
  try {
    await db.execute('ALTER TABLE tasks ADD COLUMN created_by TEXT DEFAULT "Admin"');
    console.log('Migrated tasks table to include created_by');
  } catch (err) {
    // Column already exists or other error, typically safe to ignore for migrations if column exists
  }

  console.log('Turso Database schema verified and initialized with Cascade support.');
}

module.exports = { db, initDb };
