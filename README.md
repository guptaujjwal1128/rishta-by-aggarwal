# Rishta by Aggarwal

Matrimonial biodata application with:

- React/Vite frontend
- Node/Express backend
- PostgreSQL database
- Vertex AI biodata extraction
- Admin dashboard, profile verification, PDF biodata download, and photo uploads

## Run Locally

1. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Create env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start local Postgres:

```bash
docker compose up -d postgres
```

4. Start backend:

```bash
cd backend
npm run dev
```

Backend runs at:

```text
http://127.0.0.1:4000
```

5. Start frontend:

```bash
cd frontend
npm run dev
```

Frontend runs at:

```text
http://127.0.0.1:5173
```

## Checks

Frontend build:

```bash
cd frontend
npm run format && npm run lint
npm run build
```

Backend lint and formatting check:

```bash
cd backend
npm run check
```

## Deploy

GitHub Actions is the single deployment path:

- Pushes to `main` deploy automatically.
- For a manual deployment, open the `Deploy to GCP` workflow in GitHub Actions and select **Run workflow**.

## CI/CD

GitHub Actions workflow:

```text
.github/workflows/deploy.yml
```

It runs on pushes to `main`.

Required GitHub Actions repository variables:

```text
GCP_PROJECT_ID
GCP_REGION
ARTIFACT_REPOSITORY
BACKEND_SERVICE
FRONTEND_SERVICE
VERTEX_AI_LOCATION
VERTEX_AI_IMAGE_PROCESSING_PRIMARY
VERTEX_AI_IMAGE_PROCESSING_SECONDARY
RUNTIME_SERVICE_ACCOUNT
GOOGLE_CLIENT_ID
CLOUD_SQL_INSTANCE
GCS_UPLOAD_BUCKET
VITE_API_URL
```

Required GitHub Actions repository secret:

```text
GCP_SA_KEY
```
