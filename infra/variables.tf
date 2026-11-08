variable "project_id" {
  description = "ID del proyecto de GCP"
  type        = string
  default     = "tcit-posts-challenge"
}

variable "region" {
  description = "Región donde viven Cloud SQL y Cloud Run"
  type        = string
  default     = "southamerica-west1"
}

variable "db_instance_name" {
  description = "Nombre de la instancia de Cloud SQL (creada a mano y luego importada)"
  type        = string
  default     = "tcit-posts-db"
}

variable "db_name" {
  description = "Nombre de la base de datos de la aplicación"
  type        = string
  default     = "posts"
}

variable "db_user" {
  description = "Usuario de Postgres que usa la API"
  type        = string
  default     = "app_user"
}
