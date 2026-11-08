-- Las tres operaciones que va a hacer la API, escritas a mano.
-- En la base las columnas van en snake_case; el alias "createdAt" las deja en
-- camelCase para el JSON, como pide el enunciado.

-- Crear: RETURNING devuelve la fila insertada, sin un SELECT aparte.
INSERT INTO posts (name, description)
VALUES ('Primer post', 'Hola desde Postgres local')
RETURNING id, name, description, created_at AS "createdAt";

INSERT INTO posts (name, description)
VALUES ('Segundo post', 'Este lo vamos a borrar')
RETURNING id, name, description, created_at AS "createdAt";

-- Listar: la API la pide una sola vez; el filtro por nombre es en el frontend.
SELECT id, name, description, created_at AS "createdAt"
FROM posts
ORDER BY id;

-- Eliminar: RETURNING devuelve el post borrado (0 filas si no existía -> 404).
DELETE FROM posts
WHERE name = 'Segundo post'
RETURNING id, name, description, created_at AS "createdAt";
