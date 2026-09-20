import { Pool, type QueryResult } from 'pg';

// A plain Postgres connection (works with Supabase, Neon, or any standard
// Postgres) rather than @vercel/postgres, which only speaks Neon's own
// WebSocket proxy protocol and can't reach a Supabase database at all.
// Cached at module scope so warm serverless invocations reuse the pool
// instead of opening a new connection every request.
function connectionString(): string {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error('POSTGRES_URL (or DATABASE_URL) env var is not set');
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
