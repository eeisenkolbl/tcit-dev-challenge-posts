// Mismos límites que los CHECK de db/schema.sql: la API rechaza con un 400
// claro antes de que la base responda con un error genérico.
const MAX_NAME = 100;
const MAX_DESCRIPTION = 500;
// Máximo de una columna integer de Postgres; un id mayor daría error en la base.
const MAX_ID = 2_147_483_647;

// El id llega como texto en la URL. Devuelve el número, o null si no es un
// entero positivo válido ("abc", "1.5", "-3", "0").
export function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 1 && id <= MAX_ID ? id : null;
}

// Devuelve { value } con los datos limpios, o { error } con el motivo.
export function validatePostInput(body) {
  const { name, description } = body ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    return { error: 'El nombre es obligatorio' };
  }
  if (typeof description !== 'string') {
    return { error: 'La descripción debe ser texto' };
  }

  const value = { name: name.trim(), description: description.trim() };

  if (value.name.length > MAX_NAME) {
    return { error: `El nombre no puede superar ${MAX_NAME} caracteres` };
  }
  if (value.description.length > MAX_DESCRIPTION) {
    return { error: `La descripción no puede superar ${MAX_DESCRIPTION} caracteres` };
  }

  return { value };
}
