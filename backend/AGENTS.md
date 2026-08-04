# Backend Agent Instructions

## Rules

- Keep Express routes thin; place parsing/integration logic in services and persistence in `src/db`.
- Enforce authentication, roles, permissions, ownership, and input validation on the server.
- Reuse domain functions instead of duplicating logic between user and admin routes.
- Use CommonJS and existing async error forwarding patterns.
- Never add credential defaults or expose secrets in responses or logs.
