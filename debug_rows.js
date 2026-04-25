const { createClient } = require('@libsql/client');
require('dotenv').config();

const isPlaceholder = (str) => !str || str.includes('your-') || str.includes('your_');
const url = !isPlaceholder(process.env.TURSO_DATABASE_URL) ? process.env.TURSO_DATABASE_URL : 'file:audit.db';

const db = createClient({ url });

async function debug() {
    try {
        console.log('--- DB ROW DEBUG ---');
        const parties = await db.execute("SELECT * FROM parties");
        console.log('Parties Rows:', JSON.stringify(parties.rows, null, 2));
        
        const articles = await db.execute("SELECT * FROM articles");
        console.log('Articles Rows:', JSON.stringify(articles.rows, null, 2));
    } catch (err) {
        console.error('DEBUG ERROR:', err);
    }
}

debug();
