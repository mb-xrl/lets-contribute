/**
 * Neon setup script.
 *
 *   DATABASE_URL="postgres://..." npm run db:setup
 *
 * 1. Applies src/db/schema.sql (idempotent DDL)
 * 2. Seeds demo content if the database is empty
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from '../config';
import { PgStore } from './pg.store';

async function main() {
  if (!config.databaseUrl) {
    console.error(
      'DATABASE_URL is not set. Create a Neon project (https://neon.tech), copy the pooled connection string into .env, then re-run this script.',
    );
    process.exit(1);
  }

  const sql = neon(config.databaseUrl);
  const ddlPath = resolve(__dirname, 'schema.sql');
  const ddl = readFileSync(ddlPath, 'utf8');

  const statements = ddl
    .split(';')
    .map((statement) =>
      statement
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim(),
    )
    .filter((statement) => statement.length > 0);

  console.log(`→ applying ${statements.length} DDL statements`);
  for (const statement of statements) {
    await sql.query(statement);
  }

  const store = new PgStore();
  const { seeded } = await store.seedIfEmpty();
  console.log(seeded ? '→ seeded demo content' : '→ data already present, skipped seed');
  console.log('✅ Database ready');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
});
