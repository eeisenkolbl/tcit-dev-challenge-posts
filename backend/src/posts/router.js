import { Router } from 'express';
import { parseId, validatePostInput } from './validation.js';

// El router recibe el repositorio por parámetro (inyección de dependencias):
// en los tests se le pasa uno falso en memoria y no hace falta una base.
export function createPostsRouter(repository) {
  const router = Router();

  // Express 5 captura los errores de funciones async y los manda al manejador
  // de errores; en Express 4 había que envolver cada handler en try/catch.
  router.get('/', async (req, res) => {
    res.json(await repository.list());
  });

  // 201 Created + el post creado, como pide el enunciado.
  router.post('/', async (req, res) => {
    const { value, error } = validatePostInput(req.body);
    if (error) {
      return res.status(400).json({ error });
    }
    res.status(201).json(await repository.create(value));
  });

  // 200 + el post eliminado, como pide el enunciado; 404 si no existía.
  router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Id inválido' });
    }
    const post = await repository.remove(id);
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }
    res.json(post);
  });

  return router;
}
