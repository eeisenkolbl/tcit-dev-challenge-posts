import { createApp } from './app.js';
import { createPool } from './db.js';
import { migrate } from './migrate.js';
import { createPostsRepository } from './posts/repository.js';

const pool = createPool();
await migrate(pool);

const app = createApp({ postsRepository: createPostsRepository(pool) });

// Cloud Run indica el puerto en PORT (8080 por defecto).
const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
