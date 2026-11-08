// Única capa que conoce SQL. Los alias dejan las columnas en camelCase para el
// JSON (created_at -> createdAt).
const COLUMNS = 'id, name, description, created_at AS "createdAt"';

export function createPostsRepository(pool) {
  return {
    async list() {
      const { rows } = await pool.query(`SELECT ${COLUMNS} FROM posts ORDER BY id`);
      return rows;
    },

    // Parámetros $1, $2: pg envía los valores aparte del SQL, así que no hay
    // inyección SQL posible. RETURNING devuelve el post creado.
    async create({ name, description }) {
      const { rows } = await pool.query(
        `INSERT INTO posts (name, description) VALUES ($1, $2) RETURNING ${COLUMNS}`,
        [name, description],
      );
      return rows[0];
    },

    // Devuelve el post borrado, o null si no existía.
    async remove(id) {
      const { rows } = await pool.query(`DELETE FROM posts WHERE id = $1 RETURNING ${COLUMNS}`, [id]);
      return rows[0] ?? null;
    },
  };
}
