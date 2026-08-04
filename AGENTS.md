---
trigger: always_on
---

# Agent Instructions

Read before changing code:

- The nearest directory `README.md` — setup, deployment, architecture and implementation context
- The nearest directory `AGENTS.md` — scoped rules
- The nearest directory `FEATURES.md` — buisiness requirement and features

## Rules

- Follow existing patterns in the relevant feature folder.
- Use strict TypeScript; avoid `any` and unsafe casts.
- Keep backend business rules, authorization, validation, and persistence server-side.
- Organize imports as external, internal shared, then local, separated by blank lines.
- Use concise comments that explain why, not what.
- Implement only the requested scope; do not make unsolicited UI changes.
- Do not spend time or tokens on formatting and linting.
- Do not modify generated files, build output, `.env` files, or secrets.
- Do not commit, push, create/rewrite branches, or alter Git history without explicit approval.
