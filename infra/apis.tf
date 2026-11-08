# Las APIs ya se encendieron a mano; declararlas aquí deja registro en el
# código de qué servicios usa el proyecto. Encender una API ya encendida no
# cambia nada.
locals {
  services = [
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "cloudbuild.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
  ]
}

resource "google_project_service" "services" {
  for_each = toset(local.services)

  service = each.value

  # Con `terraform destroy` no se apaga la API: apagarla puede romper
  # recursos que no maneja Terraform.
  disable_on_destroy = false
}
