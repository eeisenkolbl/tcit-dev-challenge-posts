// Postgres local para desarrollo, sin instalar nada en el sistema: el paquete
// trae los binarios de Postgres 18.6 (la misma versión que Cloud SQL).
// Los datos quedan en backend/.pgdata (ignorado por Git), así persisten entre
// ejecuciones. Se detiene con Ctrl+C.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import EmbeddedPostgres from 'embedded-postgres';

const databaseDir = fileURLToPath(new URL('../.pgdata', import.meta.url));

// Credenciales solo para desarrollo local; en Cloud Run se usan app_user y
// la contraseña de Secret Manager.
const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  // 5433 y no 5432: con WSL en modo de red "mirrored", los puertos que usa
  // Linux quedan tomados también en Windows (y 5432 es el típico de Postgres).
  port: 5433,
  persistent: true,
});

// initdb solo la primera vez: si la carpeta ya existe, el cluster ya está creado.
if (!existsSync(databaseDir)) {
  await pg.initialise();
}
await pg.start();

try {
  await pg.createDatabase('posts');
  console.log('Base "posts" creada.');
} catch (err) {
  // 42P04 = duplicate_database: ya existía de una ejecución anterior.
  if (err.code !== '42P04') throw err;
}

console.log('Postgres local en postgres://postgres:postgres@localhost:5433/posts');
console.log('Ctrl+C para detenerlo.');

process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});
