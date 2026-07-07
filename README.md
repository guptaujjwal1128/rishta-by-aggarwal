# Rishta by Aggarwal

Matrimonial biodata application with:

- React/Vite frontend
- Node/Express backend
- PostgreSQL database
- Gemini biodata extraction
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

## Local Build

Frontend:

```bash
cd frontend
npm run build
```

Backend syntax check:

```bash
find backend/src -name '*.js' -print | xargs -n 1 node -c
node -c backend/index.js
```

Docker images:

```bash
npm run build:images
```

Or separately:

```bash
npm run build:backend
npm run build:frontend
```

## Deploy

This assumes GCP resources already exist:

- Artifact Registry Docker repo
- Cloud Run services or permission to create them
- Cloud SQL database
- Secret Manager secrets
- Cloud Storage bucket

1. Create deployment env:

```bash
cp deploy/.env.example deploy/.env
```

2. Fill:

```text
deploy/.env
```

3. Authenticate Docker to Artifact Registry:

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

Use your actual region if different.

4. Build, push, and deploy:

```bash
npm run deploy:all
```

Or step-by-step:

```bash
npm run build:images
npm run push:images
npm run deploy:backend
npm run deploy:frontend
```

The deploy scripts use low-cost Cloud Run settings:

```text
CPU: 1
Memory: 512Mi
Min instances: 0
Max instances: 1
```

## CI/CD

GitHub Actions workflow:

```text
.github/workflows/deploy.yml
```

It runs on pushes to `main`.

Required GitHub Actions secret:

```text
GCP_SA_KEY
```

Required GitHub Actions variables are the same values shown in:

```text
deploy/.env.example
```

## Runtime Config

Backend reads runtime env vars from `process.env`.

Frontend reads public runtime config from:

```text
/env.js
```

Never put backend secrets in frontend env.
