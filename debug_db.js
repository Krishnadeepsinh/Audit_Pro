const { createClient } = require('@libsql/client');
require('dotenv').config();

const isPlaceholder = (str) => !str || str.includes('your-') || str.includes('your_');
const url = !isPlaceholder(process.env.TURSO_DATABASE_URL) ? process.env.TURSO_DATABASE_URL : 'file:audit.db';

const db = createClient({ url });

async function debug() {
    try {
        console.log('--- DB DEBUG ---');
        console.log('Connecting to:', url);
        
        const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', tables.rows.map(r => r.name));
        
        const parties = await db.execute("SELECT * FROM parties");
        console.log('Parties count:', parties.rows.length);
    } catch (err) {
        console.error('DEBUG ERROR:', err);
    }
}

debug();
