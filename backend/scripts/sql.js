// Ejecuta un archivo .sql contra la base y muestra los resultados.
// Reemplaza a psql, que no viene con embedded-postgres.
// Uso: npm run sql -- db/schema.sql
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const file = process.argv[2];
if (!file) {
  console.error('Uso: npm run sql -- <archivo.sql>');
  process.exit(1);
}

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5433/posts';

const client = new pg.Client({ connectionString });
await client.connect();

try {
  const sql = await readFile(file, 'utf8');
  // Con varias sentencias, pg devuelve un resultado por sentencia.
  const results = [].concat(await client.query(sql));
  for (const r of results) {
    console.log(`${r.command} (${r.rowCount ?? 0} filas)`);
    if (r.rows.length > 0) console.table(r.rows);
  }
} finally {
  await client.end();
}
