# TCIT Dev Challenge: Posts

App para crear, listar, eliminar y filtrar posts (nombre y descripción). Frontend en React + Redux Toolkit, API en Node.js (Express) y PostgreSQL. Está desplegada en Google Cloud:

https://tcit-posts-1026342355065.southamerica-west1.run.app

## Cómo está armado

```
Navegador → Cloud Run (un solo contenedor)
              ├─ /           build de React servido por Express
              └─ /api/posts  API JSON
                    │ socket /cloudsql/...
                    ▼
               Cloud SQL (PostgreSQL 18)
```

- `frontend/`: React + Redux Toolkit con Vite. `npm run build` deja el build en `backend/public`.
- `backend/`: API en Express 5, esquema SQL en `db/` y tests en `test/`.
- `infra/`: Terraform (Cloud SQL, base y usuario, Secret Manager, IAM, Artifact Registry, Cloud Run).
- `Dockerfile`: compila el frontend y empaqueta el backend en una sola imagen.

## API

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/posts` | 200 con todos los posts |
| POST | `/api/posts` | 201 con el post creado; 400 si los datos no son válidos |
| DELETE | `/api/posts/:id` | 200 con el post eliminado; 404 si no existe |

Ejemplo de post: `{ "id": 1, "name": "Hola", "description": "Mundo", "createdAt": "2026-11-08T23:16:34.250Z" }`

## Correr en local

Solo hace falta Node.js 24. El Postgres local viene en un paquete npm (`embedded-postgres`), así que no hay que instalar PostgreSQL. Uso tres terminales:

```powershell
cd backend
npm install
npm run db:local        # Postgres en el puerto 5433 evitando otros posibles postgres corriendo localmente
```

```powershell
cd backend
Copy-Item .env.example .env
npm run dev             # API en http://localhost:8080
```

```powershell
cd frontend
npm install
npm run dev             # http://localhost:5173, reenvía /api a la API
```

Tests de la API: `cd backend; npm test` (no necesitan base de datos).

Uso el puerto 5433 y no el 5432 porque con WSL en modo de red `mirrored` los puertos que usa Linux también quedan tomados en Windows.

## Despliegue

La instancia de Cloud SQL y el bucket del estado de Terraform los creé a mano. La instancia la incorporé a Terraform con un bloque `import`, y el resto lo crea Terraform:

```powershell
cd infra
terraform init
terraform apply
```

Para desplegar el código construyo la imagen con Cloud Build, etiquetada con el SHA del commit, y la despliego en Cloud Run:

```powershell
$image = "southamerica-west1-docker.pkg.dev/tcit-posts-challenge/tcit-posts/app:$(git rev-parse --short HEAD)"
gcloud builds submit --tag $image .
gcloud run deploy tcit-posts --image $image --region southamerica-west1
```

## Decisiones

- Crear y eliminar no vuelven a pedir la lista: la API devuelve el post afectado (con `RETURNING`) y Redux actualiza el estado local. El filtro por nombre también es local.
- La contraseña de la base la genera Terraform y queda en Secret Manager. Cloud Run la recibe como variable de entorno y se conecta a Cloud SQL por el socket del conector, sin redes autorizadas.
- Cloud Run usa una cuenta de servicio propia con dos permisos: `cloudsql.client` y acceso solo al secreto de la contraseña.
- Terraform crea Cloud Run con una imagen de ejemplo e ignora los cambios de imagen; la imagen real la actualiza el deploy.


