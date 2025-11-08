import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, sqlite } from './index';

/**
 * Run database migrations
 */
async function main() {
  console.log('Running migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

main();
