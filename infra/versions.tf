terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # El estado se guarda en un bucket de GCS creado a mano (versionado),
  # así no depende de este PC y se puede recuperar una versión anterior.
  backend "gcs" {
    bucket = "tcit-posts-challenge-tfstate"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
