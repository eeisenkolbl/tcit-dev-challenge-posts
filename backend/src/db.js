import pg from 'pg';

// Pool: reutiliza conexiones en vez de abrir una por request.
// Sin DATABASE_URL, pg lee las variables estándar PGHOST, PGUSER, PGPASSWORD y
// PGDATABASE. En Cloud Run se usan esas, con PGHOST=/cloudsql/<connection_name>
// (el socket del conector de Cloud SQL).
export function createPool() {
  return new pg.Pool({ connectionString: process.env.DATABASE_URL });
}
