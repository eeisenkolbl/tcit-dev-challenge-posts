# Repositorio de imágenes Docker. Cloud Build sube aquí la imagen y Cloud Run
# la descarga desde aquí.
resource "google_artifact_registry_repository" "app" {
  repository_id = "tcit-posts"
  location      = var.region
  format        = "DOCKER"

  # Cada deploy sube una imagen nueva; se guardan solo las 5 más recientes
  # para no pagar almacenamiento de versiones viejas.
  cleanup_policies {
    id     = "mantener-ultimas-5"
    action = "KEEP"
    most_recent_versions {
      keep_count = 5
    }
  }
  cleanup_policies {
    id     = "borrar-el-resto"
    action = "DELETE"
    condition {
      tag_state = "ANY"
    }
  }

  depends_on = [google_project_service.services]
}
