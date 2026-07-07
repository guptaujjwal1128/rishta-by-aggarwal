# Build and Deploy

This guide assumes GCP resources already exist:

- Artifact Registry Docker repo
- Cloud Run services or permission to create them
- Cloud SQL instance
- Cloud Storage bucket
- Secret Manager secrets

The app does not need secrets during Docker build. Secrets/config are injected at
Cloud Run runtime.

## Runtime config

Use one deploy env file:

```bash
cp deploy/.env.example deploy/.env
```

Fill:

```text
deploy/.env
```

Do not commit `deploy/.env`.

Required values include:

```text
PROJECT_ID
REGION
BACKEND_IMAGE
FRONTEND_IMAGE
GOOGLE_CLIENT_ID
ADMIN_EMAIL
ADMIN_PASSWORD or ADMIN_PASSWORD_SECRET
DATABASE_URL_SECRET
JWT_SECRET_SECRET
GEMINI_API_KEY_SECRET
CLOUD_SQL_INSTANCE
VITE_API_URL
VITE_GOOGLE_CLIENT_ID
```

## Build images locally

```bash
npm run build:images
```

Or separately:

```bash
npm run build:backend
npm run build:frontend
```

## Push images

Make sure Docker is authenticated to Artifact Registry:

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

Then:

```bash
npm run push:images
```

## Deploy to Cloud Run

Deploy backend:

```bash
npm run deploy:backend
```

Deploy frontend:

```bash
npm run deploy:frontend
```

All at once:

```bash
npm run deploy:all
```

The scripts deploy cheapest Cloud Run settings:

```text
Request-based billing
CPU: 1
Memory: 512Mi
Min instances: 0
Max instances: 1
```

## GitHub Actions CI/CD

Workflow:

```text
.github/workflows/deploy.yml
```

It runs on pushes to `main` and does:

```text
build backend image
build frontend image
push both images
deploy backend
deploy frontend
```

Add GitHub Actions secret:

```text
GCP_SA_KEY=<service account JSON>
```

Add GitHub Actions variables:

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

If you do not use `ADMIN_PASSWORD_SECRET`, add GitHub Actions secret:

```text
ADMIN_PASSWORD=<admin-password>
```

## Smoke test

Backend:

```bash
curl https://YOUR_BACKEND_URL/api/health
```

Frontend:

```bash
open https://YOUR_FRONTEND_URL
```
