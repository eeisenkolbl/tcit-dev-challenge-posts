# Identidad propia para Cloud Run, en vez de la cuenta de servicio por defecto
# de Compute (que tiene rol Editor sobre todo el proyecto). Solo recibe los
# dos permisos que la app necesita.
resource "google_service_account" "run" {
  account_id   = "tcit-posts-run"
  display_name = "Cloud Run: API de posts"
}

# Conectarse a Cloud SQL por el conector (socket /cloudsql/...).
resource "google_project_iam_member" "run_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.run.email}"
}

# Leer únicamente el secreto db-password (permiso sobre el secreto, no sobre
# todos los secretos del proyecto).
resource "google_secret_manager_secret_iam_member" "run_db_password" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.run.email}"
}
