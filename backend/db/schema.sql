-- Esquema de la aplicación. Idempotente: se puede correr muchas veces sin
-- error ni pérdida de datos (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS posts (
  -- IDENTITY es el reemplazo estándar de SERIAL. ALWAYS impide que alguien
  -- inserte un id a mano y desincronice la secuencia.
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description text        NOT NULL CHECK (char_length(description) <= 500),
  created_at  timestamptz NOT NULL DEFAULT now()
);
