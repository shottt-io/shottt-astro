import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './src/db/db';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function run() {
  try {
    console.log("Applying migrations programmatically...");
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("Migrations applied successfully!");

    console.log("Checking if 'super' user exists...");
    const existingSuper = await db.query.users.findFirst({
      where: eq(users.username, 'super'),
    });

    if (!existingSuper) {
      console.log("Super user does not exist. Creating super user...");
      const password = process.env.SUPER_PASSWORD || 'super123';
      await db.insert(users).values({
        username: 'super',
        password: hashPassword(password),
        name: 'مدیر کل مجموعه‌ها',
      });
      console.log("Super user created successfully!");
    } else {
      console.log("Super user already exists.");
    }
  } catch (e) {
    console.error("Migration/seed error:", e);
  } finally {
    await client.end();
  }
}
run();
