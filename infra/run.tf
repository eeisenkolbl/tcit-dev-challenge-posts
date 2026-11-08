locals {
  # Ruta de la imagen que sube Cloud Build (gcloud builds submit --tag ...).
  image_repository = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}

resource "google_cloud_run_v2_service" "app" {
  name     = "tcit-posts"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  # Es un challenge: permitir `terraform destroy` al terminar.
  deletion_protection = false

  template {
    service_account = google_service_account.run.email

    # Escala a 0 sin tráfico (no cuesta nada en reposo) y como máximo 2
    # instancias: db-f1-micro admite pocas conexiones.
    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    # Monta el socket de Cloud SQL en /cloudsql/<connection_name>.
    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.main.connection_name]
      }
    }

    containers {
      # Imagen de ejemplo de Google solo para el primer `apply`: la imagen real
      # todavía no existe. Después la reemplaza `gcloud run deploy` (ver
      # ignore_changes abajo).
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      # pg lee estas variables estándar (ver backend/src/db.js).
      env {
        name  = "PGHOST"
        value = "/cloudsql/${google_sql_database_instance.main.connection_name}"
      }
      env {
        name  = "PGDATABASE"
        value = google_sql_database.posts.name
      }
      env {
        name  = "PGUSER"
        value = google_sql_user.app.name
      }
      # La contraseña no aparece en la configuración del servicio: Cloud Run
      # la lee de Secret Manager al arrancar cada instancia.
      env {
        name = "PGPASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  lifecycle {
    # La imagen la actualiza el deploy del código, no Terraform. Sin esto, cada
    # `terraform apply` volvería a poner la imagen de ejemplo.
    ignore_changes = [
      template[0].containers[0].image,
      client,
      client_version,
    ]
  }

  # El secreto debe tener versión y la cuenta de servicio permiso antes de
  # que arranque la primera instancia.
  depends_on = [
    google_secret_manager_secret_version.db_password,
    google_secret_manager_secret_iam_member.run_db_password,
    google_project_iam_member.run_cloudsql_client,
  ]
}

# App pública: cualquiera puede abrir la URL sin autenticarse.
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = google_cloud_run_v2_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
