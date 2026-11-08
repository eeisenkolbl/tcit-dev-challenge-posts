import { readFile } from 'node:fs/promises';

const schemaUrl = new URL('../db/schema.sql', import.meta.url);

// El esquema es idempotente (IF NOT EXISTS), así que se puede aplicar en cada
// arranque del servidor sin una herramienta de migraciones aparte.
export async function migrate(pool) {
  const sql = await readFile(schemaUrl, 'utf8');
  await pool.query(sql);
}
