import 'dotenv/config';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { index as db } from './db/index';

async function runMigrations() {
  try {
    console.log('⏳ Running migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('✅ Migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
