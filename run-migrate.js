import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './src/db/db';

async function run() {
  try {
    console.log("Applying migrations programmatically...");
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("Migrations applied successfully!");
  } catch (e) {
    console.error("Migration error:", e);
  } finally {
    await client.end();
  }
}
run();
