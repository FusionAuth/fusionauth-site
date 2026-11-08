import { promises as fs } from 'fs';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// SQLite database connection
const db = new sqlite3.Database('./db/users.db');
const dbAll = promisify(db.all.bind(db));

try {
  const rows = await dbAll('SELECT * FROM users ORDER BY created_at DESC');
  console.log(`Found ${rows.length} users to export`);

  await fs.writeFile('users.json', JSON.stringify(rows, null, 4));

  console.log('Export completed successfully!');
  console.log('File saved as: users.json');
  console.log(`Total users exported: ${rows.length}`);

  // Show breakdown by provider
  const localUsers = rows.filter(u => u.provider === 'local').length;
  const oauthUsers = rows.filter(u => u.provider === 'google').length;
  console.log(`- Local users: ${localUsers}`);
  console.log(`- OAuth users: ${oauthUsers}`);

} catch (error) {
  console.error('Export failed:', error);
  process.exit(1);
} finally {
  db.close();
}
