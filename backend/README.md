# Backend

Node.js 20, Express, and PostgreSQL API for Rishta By Aggarwal. See the
[root README](../README.md) for workspace setup and deployment.

## Architecture

```text
HTTP request
  -> Express route
  -> authentication and permission middleware
  -> service/domain logic
  -> PostgreSQL, Vertex AI, Cloud Storage, or PDF generation
  -> JSON/file response
```

The backend is the source of truth for authentication, roles, permissions,
profile validation, moderation, AI extraction, storage, and audit history.

## Structure

```text
src/
├── auth/        # Permission definitions
├── db/          # PostgreSQL schema, queries, and mappings
├── middleware/  # Authentication and authorization
├── routes/      # HTTP contracts and request orchestration
└── services/    # AI, parsing, storage, social auth, and PDF logic
```

## Development

```bash
npm run dev          # start the API
npm run debug        # start with the Node inspector
npm run check        # lint and formatting validation
npm run lint:fix     # apply safe ESLint fixes
npm run format       # apply Prettier formatting
```

Copy `.env.example` to `.env` for local development. Never commit credentials.
Vertex AI uses Application Default Credentials locally and the attached Cloud
Run runtime service account in production.

## API Areas

- `/api/auth`: registration, login, social authentication, current user
- `/api/profiles`: search, own profile, extraction, photos, and PDFs
- `/api/notifications`: current-user notifications
- `/api/admin`: statistics, access management, moderation, and reviewed imports
