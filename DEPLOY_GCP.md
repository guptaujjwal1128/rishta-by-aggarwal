# Deploy to Google Cloud Platform

This project is set up for a GCP-only production deployment:

- `backend`: Node/Express on Cloud Run
- `frontend`: Vite/React static app served by nginx on Cloud Run
- Database: Cloud SQL for PostgreSQL
- Uploaded photos/docs: Cloud Storage
- Secrets: Secret Manager

## Deployment flow

Recommended production flow:

```text
PR -> merge to main -> GitHub Actions builds Docker images -> pushes to Artifact Registry -> deploys Cloud Run
```

No backend secrets are baked into Docker images. The backend reads runtime env vars
from `process.env`. The frontend reads public runtime config from `/env.js`, generated
when the nginx container starts.

Use these local env templates:

```text
backend/.env.development.example
backend/.env.production.example
frontend/.env.development.example
frontend/.env.production.example
deploy/.env.production.example
```

Copy examples before local use:

```bash
cp backend/.env.development.example backend/.env
cp frontend/.env.development.example frontend/.env
cp deploy/.env.production.example deploy/.env.production
```

Do not commit real `.env` files.

## 1. Choose variables

```bash
export PROJECT_ID="your-gcp-project"
export REGION="asia-south1"
export SQL_INSTANCE="rishta-postgres"
export DB_NAME="rishta_prod"
export DB_USER="rishta"
export DB_PASSWORD="replace-with-strong-password"
export BUCKET_NAME="$PROJECT_ID-rishta-uploads"
export GOOGLE_CLIENT_ID="your-google-oauth-client-id"
export GEMINI_API_KEY="your-gemini-api-key"
export JWT_SECRET="$(openssl rand -base64 48)"

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  sqladmin.googleapis.com secretmanager.googleapis.com storage.googleapis.com \
  artifactregistry.googleapis.com
```

## 2. Create Cloud SQL PostgreSQL

```bash
gcloud sql instances create "$SQL_INSTANCE" \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region="$REGION"

gcloud sql databases create "$DB_NAME" --instance="$SQL_INSTANCE"

gcloud sql users create "$DB_USER" \
  --instance="$SQL_INSTANCE" \
  --password="$DB_PASSWORD"

export INSTANCE_CONNECTION_NAME="$PROJECT_ID:$REGION:$SQL_INSTANCE"
```

## 3. Create Cloud Storage bucket

```bash
gcloud storage buckets create "gs://$BUCKET_NAME" \
  --location="$REGION" \
  --uniform-bucket-level-access

# The current app stores public image URLs for gallery/PDF display.
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" \
  --member="allUsers" \
  --role="roles/storage.objectViewer"
```

## 4. Create secrets

```bash
printf "%s" "$JWT_SECRET" | gcloud secrets create rishta-jwt-secret --data-file=-
printf "%s" "$GEMINI_API_KEY" | gcloud secrets create rishta-gemini-api-key --data-file=-

export DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@/$DB_NAME?host=/cloudsql/$INSTANCE_CONNECTION_NAME"
printf "%s" "$DATABASE_URL" | gcloud secrets create rishta-database-url --data-file=-
```

If a secret already exists, update it:

```bash
printf "%s" "$JWT_SECRET" | gcloud secrets versions add rishta-jwt-secret --data-file=-
printf "%s" "$GEMINI_API_KEY" | gcloud secrets versions add rishta-gemini-api-key --data-file=-
printf "%s" "$DATABASE_URL" | gcloud secrets versions add rishta-database-url --data-file=-
```

## 5. Deploy backend API to Cloud Run

```bash
gcloud run deploy rishta-api \
  --source backend \
  --region "$REGION" \
  --allow-unauthenticated \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --set-env-vars NODE_ENV=production,GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID",GEMINI_MODEL=gemini-3.5-flash,GCS_UPLOAD_BUCKET="$BUCKET_NAME",ADMIN_EMAIL=admin@rishta.local,ADMIN_PASSWORD=change-this-admin-password,ADMIN_NAME="Rishta Admin" \
  --set-secrets DATABASE_URL=rishta-database-url:latest,JWT_SECRET=rishta-jwt-secret:latest,GEMINI_API_KEY=rishta-gemini-api-key:latest
```

## 5a. Alternative: build locally, push image, deploy image

This skips Cloud Build source deployment and uses the scripts in this repo.

Create Artifact Registry once:

```bash
gcloud artifacts repositories create rishta \
  --repository-format=docker \
  --location="$REGION"

gcloud auth configure-docker "$REGION-docker.pkg.dev"
```

Fill:

```text
deploy/.env.production
```

Then:

```bash
npm run build:images
npm run push:images
npm run deploy:backend
npm run deploy:frontend
```

Or all at once:

```bash
npm run deploy:all
```

## 5b. CI/CD with GitHub Actions

The workflow lives at:

```text
.github/workflows/deploy.yml
```

It runs on pushes to `main`.

Create a GCP service account for GitHub Actions with these roles:

```text
Artifact Registry Writer
Cloud Run Admin
Service Account User
Cloud SQL Client
Secret Manager Secret Accessor
Storage Object User
```

For the simple first version, create a JSON key for that service account and add
it to GitHub:

```text
Repo -> Settings -> Secrets and variables -> Actions -> Secrets
GCP_SA_KEY=<service account JSON>
```

Add GitHub repository variables:

```text
GCP_PROJECT_ID=rishta-by-aggarwal
GCP_REGION=asia-south1
ARTIFACT_REPOSITORY=rishta
BACKEND_SERVICE=rishta-api
FRONTEND_SERVICE=rishta-web
GOOGLE_CLIENT_ID=1084232234514-mr554jri3hodjdme4ihlbadipqt73or5.apps.googleusercontent.com
GEMINI_MODEL=gemini-2.5-flash-lite
GCS_UPLOAD_BUCKET=<bucket-name>
ADMIN_EMAIL=admin@ayrishtabyaggarwal.in
ADMIN_NAME=Rishta Admin
DATABASE_URL_SECRET=rishta-database-url
JWT_SECRET_SECRET=rishta-jwt-secret
GEMINI_API_KEY_SECRET=rishta-gemini-api-key
ADMIN_PASSWORD_SECRET=rishta-admin-password
CLOUD_SQL_INSTANCE=rishta-by-aggarwal:asia-south1:rishta-by-aggarwal-db
VITE_API_URL=https://YOUR_BACKEND_URL/api
```

If you do not create `rishta-admin-password` in Secret Manager, add a GitHub
Actions secret instead:

```text
ADMIN_PASSWORD=<your-admin-password>
```

Get the API URL:

```bash
export API_URL="$(gcloud run services describe rishta-api --region "$REGION" --format='value(status.url)')"
echo "$API_URL"
```

## 6. Deploy frontend to Cloud Run

The frontend image writes `/env.js` at container startup, so `VITE_API_URL` and
`VITE_GOOGLE_CLIENT_ID` are runtime env vars.

```bash
gcloud run deploy rishta-web \
  --source frontend \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars VITE_API_URL="$API_URL/api",VITE_GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID"
```

Get the frontend URL:

```bash
export WEB_URL="$(gcloud run services describe rishta-web --region "$REGION" --format='value(status.url)')"
echo "$WEB_URL"
```

## 7. Configure Google OAuth origin

In Google Cloud Console → APIs & Services → Credentials → OAuth Web Client:

- Authorized JavaScript origins:
  - `$WEB_URL`
  - your custom domain, if you add one

If you use Facebook login later, add the same frontend URL in Facebook app settings.

## 8. Smoke test

```bash
curl "$API_URL/api/health"
open "$WEB_URL"
```

The backend creates/updates DB tables on startup and seeds the admin account from
`ADMIN_EMAIL` / `ADMIN_PASSWORD`.
