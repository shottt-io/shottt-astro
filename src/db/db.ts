import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = 
  (typeof import.meta.env !== 'undefined' && import.meta.env ? import.meta.env.DATABASE_URL : undefined) || 
  process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database connections will fail at runtime.');
}

// For serverless/pooled environments (like PgBouncer), prepare: false is highly recommended
export const client = postgres(connectionString || '', { prepare: false });
export const db = drizzle(client, { schema });
export default db;
