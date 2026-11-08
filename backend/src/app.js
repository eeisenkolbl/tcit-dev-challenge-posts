import { fileURLToPath } from 'node:url';
import express from 'express';
import { createPostsRouter } from './posts/router.js';

// Build de React (lo genera `npm run build` en frontend/). En desarrollo no
// existe y se usa el servidor de Vite; express.static simplemente no encuentra nada.
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

// Arma la app sin escuchar ningún puerto: así supertest la puede probar
// directamente. server.js es el que la conecta a la base real y la levanta.
export function createApp({ postsRepository }) {
  const app = express();

  app.use(express.json());
  app.use('/api/posts', createPostsRouter(postsRepository));
  // Cualquier otra ruta bajo /api responde 404 en JSON, no la página HTML de Express.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  // Frontend y API en el mismo servicio y el mismo origen: sin CORS.
  app.use(express.static(publicDir));

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
