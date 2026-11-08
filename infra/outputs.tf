# Datos que necesita Cloud Run para conectarse a la base. Ninguno es secreto.
output "db_connection_name" {
  description = "Nombre de conexión para el socket /cloudsql/<connection_name>"
  value       = google_sql_database_instance.main.connection_name
}

output "db_name" {
  value = google_sql_database.posts.name
}

output "db_user" {
  value = google_sql_user.app.name
}

output "db_password_secret_id" {
  description = "ID del secreto en Secret Manager con la contraseña de db_user"
  value       = google_secret_manager_secret.db_password.secret_id
}

output "image_repository" {
  description = "Prefijo de la imagen para gcloud builds submit --tag"
  value       = local.image_repository
}

output "service_url" {
  description = "URL pública de la app en Cloud Run"
  value       = google_cloud_run_v2_service.app.uri
}
