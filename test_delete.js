const { createClient } = require('@libsql/client');
require('dotenv').config();

const isPlaceholder = (str) => !str || str.includes('your-') || str.includes('your_');
const url = !isPlaceholder(process.env.TURSO_DATABASE_URL) ? process.env.TURSO_DATABASE_URL : 'file:audit.db';
const authToken = !isPlaceholder(process.env.TURSO_AUTH_TOKEN) ? process.env.TURSO_AUTH_TOKEN : '';

const db = createClient({ url, authToken });

async function testDelete() {
    try {
        console.log('--- SURGICAL DELETE TEST ---');
        const parties = await db.execute("SELECT * FROM parties LIMIT 1");
        if (parties.rows.length === 0) {
            console.log('No parties found to delete.');
            return;
        }

        const id = parties.rows[0].id;
        console.log(`Attempting to delete Party ID: ${id} (${parties.rows[0].name})`);

        // Manual cascade
        await db.execute({ sql: "DELETE FROM tasks WHERE party_id = ?", args: [id] });
        const result = await db.execute({ sql: "DELETE FROM parties WHERE id = ?", args: [id] });

        console.log('Rows Affected:', result.rowsAffected);
        
        const check = await db.execute({ sql: "SELECT * FROM parties WHERE id = ?", args: [id] });
        if (check.rows.length === 0) {
            console.log('SUCCESS: Record is GONE from database.');
        } else {
            console.log('FAILURE: Record still exists in database!');
        }
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
    }
}

testDelete();
