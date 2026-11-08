import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

// Repositorio falso en memoria con la misma interfaz que el real.
function fakeRepository(posts = []) {
  let nextId = posts.length + 1;
  return {
    async list() {
      return posts;
    },
    async create({ name, description }) {
      const post = { id: nextId++, name, description, createdAt: '2026-11-08T00:00:00.000Z' };
      posts.push(post);
      return post;
    },
    async remove(id) {
      const index = posts.findIndex((p) => p.id === id);
      return index === -1 ? null : posts.splice(index, 1)[0];
    },
  };
}

test('GET /api/posts devuelve la lista en JSON', async () => {
  const posts = [{ id: 1, name: 'Hola', description: 'Mundo', createdAt: '2026-11-08T00:00:00.000Z' }];
  const app = createApp({ postsRepository: fakeRepository(posts) });

  const res = await request(app).get('/api/posts');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, posts);
});

test('GET /api/posts responde 500 si falla la base', async () => {
  const app = createApp({
    postsRepository: {
      async list() {
        throw new Error('conexión rechazada');
      },
    },
  });

  const res = await request(app).get('/api/posts');

  assert.equal(res.status, 500);
  assert.deepEqual(res.body, { error: 'Error interno del servidor' });
});

test('POST /api/posts crea el post y lo devuelve con 201', async () => {
  const repository = fakeRepository();
  const app = createApp({ postsRepository: repository });

  const res = await request(app)
    .post('/api/posts')
    .send({ name: '  Nuevo  ', description: 'Desde el test' });

  assert.equal(res.status, 201);
  // El nombre llega sin los espacios de los extremos.
  assert.deepEqual(res.body, {
    id: 1,
    name: 'Nuevo',
    description: 'Desde el test',
    createdAt: '2026-11-08T00:00:00.000Z',
  });
  assert.equal((await repository.list()).length, 1);
});

test('POST /api/posts responde 400 sin nombre y no crea nada', async () => {
  const repository = fakeRepository();
  const app = createApp({ postsRepository: repository });

  const res = await request(app).post('/api/posts').send({ name: '   ', description: 'x' });

  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'El nombre es obligatorio' });
  assert.equal((await repository.list()).length, 0);
});

test('POST /api/posts responde 400 si el nombre supera 100 caracteres', async () => {
  const app = createApp({ postsRepository: fakeRepository() });

  const res = await request(app).post('/api/posts').send({ name: 'a'.repeat(101), description: '' });

  assert.equal(res.status, 400);
});

test('POST /api/posts responde 400 con JSON mal formado', async () => {
  const app = createApp({ postsRepository: fakeRepository() });

  const res = await request(app)
    .post('/api/posts')
    .set('Content-Type', 'application/json')
    .send('{"name": ');

  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'JSON inválido' });
});

test('DELETE /api/posts/:id elimina el post y lo devuelve', async () => {
  const post = { id: 7, name: 'Borrar', description: 'x', createdAt: '2026-11-08T00:00:00.000Z' };
  const repository = fakeRepository([post]);
  const app = createApp({ postsRepository: repository });

  const res = await request(app).delete('/api/posts/7');

  assert.equal(res.status, 200);
  assert.deepEqual(res.body, post);
  assert.equal((await repository.list()).length, 0);
});

test('DELETE /api/posts/:id responde 404 si no existe', async () => {
  const app = createApp({ postsRepository: fakeRepository() });

  const res = await request(app).delete('/api/posts/99');

  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Post no encontrado' });
});

test('DELETE /api/posts/:id responde 400 con un id inválido', async () => {
  const app = createApp({ postsRepository: fakeRepository() });

  for (const id of ['abc', '1.5', '-3', '0', '99999999999']) {
    const res = await request(app).delete(`/api/posts/${id}`);
    assert.equal(res.status, 400, `id "${id}"`);
  }
});

test('una ruta desconocida bajo /api responde 404 en JSON', async () => {
  const app = createApp({ postsRepository: fakeRepository() });

  const res = await request(app).get('/api/no-existe');

  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Ruta no encontrada' });
});
