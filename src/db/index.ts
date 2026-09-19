import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Supabase PostgreSQL connection string from environment
const connectionString = process.env.DATABASE_URL || '';

const isPostgres = connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://');

/**
 * When connecting to Supabase Transaction Pooler (PgBouncer on port 6543),
 * `prepare: false` is required to prevent prepared statement errors.
 */
export const sqlClient = isPostgres
  ? postgres(connectionString, {
      prepare: false,
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : null;

/**
 * Drizzle ORM Database Instance
 * Fully typed with our schema tables (users, verifiedSchemes, schemeProviders, schemeInquiries, etc.)
 */
export const db = sqlClient ? drizzle(sqlClient, { schema }) : null;

export * from './schema';
export { schema };
