import { Pool, type QueryResult } from 'pg';

// A plain Postgres connection (works with Supabase, Neon, or any standard
// Postgres) rather than @vercel/postgres, which only speaks Neon's own
// WebSocket proxy protocol and can't reach a Supabase database at all.
// Cached at module scope so warm serverless invocations reuse the pool
// instead of opening a new connection every request.
function connectionString(): string {
  // Supabase's Vercel integration doesn't always set POSTGRES_URL — check
  // the pooled Prisma URL and the direct non-pooling URL too, in that
  // order (pooled preferred, to avoid exhausting Postgres' connection
  // limit across concurrent serverless invocations).
  const url =
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'No Postgres connection string env var found (checked POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, DATABASE_URL)',
    );
  }
  return url;
}

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: connectionString(),
      // Supabase's pooled connection requires SSL; Node's default CA
      // bundle doesn't include Supabase's, so this trusts the connection
      // the same way @vercel/postgres and most serverless Postgres
      // clients do rather than pinning a specific CA cert.
      ssl: { rejectUnauthorized: false },
      max: 1,
    });
  }
  return pool;
}

// Mimics @vercel/postgres's `sql` tagged-template so every call site
// (sql`SELECT ... WHERE id = ${id}`) stays unchanged — just swaps the
// underlying driver.
export function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<QueryResult> {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}${strings[i + 1]}`;
  }
  return getPool().query(text, values);
}
