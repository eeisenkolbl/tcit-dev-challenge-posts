# La instancia se creó a mano con gcloud. Este bloque la adopta en el estado
# de Terraform en vez de crear una nueva. Los valores de `settings` copian la
# configuración real (gcloud sql instances describe) para que el plan no
# quiera modificarla.
import {
  to = google_sql_database_instance.main
  id = "projects/${var.project_id}/instances/${var.db_instance_name}"
}

resource "google_sql_database_instance" "main" {
  name             = var.db_instance_name
  region           = var.region
  database_version = "POSTGRES_18"

  # Protección propia de Terraform: `destroy` falla mientras sea true.
  deletion_protection = true

  settings {
    edition           = "ENTERPRISE"
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    pricing_plan      = "PER_USE"

    disk_type             = "PD_SSD"
    disk_size             = 10
    disk_autoresize       = true
    disk_autoresize_limit = 0

    enable_dataplex_integration = true

    location_preference {
      zone = "southamerica-west1-b"
    }

    # Sin backups: es un challenge y cada backup cuesta. En producción iría en true.
    backup_configuration {
      enabled                        = false
      start_time                     = "11:00"
      transaction_log_retention_days = 7

      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    # IP pública sin redes autorizadas: nadie entra directo por IP. Cloud Run
    # se conecta por el conector de Cloud SQL (socket /cloudsql/...), que
    # autentica con IAM y cifra el tráfico.
    ip_configuration {
      ipv4_enabled = true
      ssl_mode     = "ALLOW_UNENCRYPTED_AND_ENCRYPTED"
    }
  }
}

resource "google_sql_database" "posts" {
  name     = var.db_name
  instance = google_sql_database_instance.main.name
}

# La contraseña la genera Terraform: nadie la escribe ni la ve. Sin caracteres
# especiales para evitar problemas de escape en cadenas de conexión.
resource "random_password" "db" {
  length  = 32
  special = false
}

resource "google_sql_user" "app" {
  name     = var.db_user
  instance = google_sql_database_instance.main.name
  password = random_password.db.result
}
