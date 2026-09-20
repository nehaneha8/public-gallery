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

// Newer pg-connection-string versions treat a `sslmode=require` query
// param in the URL (which Supabase's connection strings include) as full
// certificate-chain verification, silently overriding the explicit `ssl`
// option below and failing against Supabase's chain with
// SELF_SIGNED_CERT_IN_CHAIN. Stripping it and controlling SSL purely via
// the explicit `ssl` config avoids that conflict.
function stripSslMode(raw: string): string {
  try {
    const url = new URL(raw);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return raw;
  }
}

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: stripSslMode(connectionString()),
      // Supabase's connection requires SSL; Node's default CA bundle
      // doesn't include Supabase's, so this trusts the connection the
      // same way most serverless Postgres clients do rather than pinning
      // a specific CA cert.
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
