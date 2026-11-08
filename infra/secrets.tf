# La contraseña de app_user vive en Secret Manager. Cloud Run la va a leer de
# aquí como variable de entorno; nunca pasa por el código ni por Git.
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

# El secreto es el "contenedor"; la versión es el valor. Si la contraseña
# cambia, Terraform crea una versión nueva y la anterior queda en el historial.
resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db.result
}
