import express from 'express';
import { createPostsRouter } from './posts/router.js';

// Arma la app sin escuchar ningún puerto: así supertest la puede probar
// directamente. server.js es el que la conecta a la base real y la levanta.
export function createApp({ postsRepository }) {
  const app = express();

  app.use(express.json());
  app.use('/api/posts', createPostsRouter(postsRepository));

  // Manejador de errores (4 parámetros): cualquier error no previsto responde
  // 500 en JSON sin exponer detalles internos al cliente.
  app.use((err, req, res, next) => {
    // JSON mal formado en el body: es culpa del cliente, no del servidor.
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON inválido' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}
