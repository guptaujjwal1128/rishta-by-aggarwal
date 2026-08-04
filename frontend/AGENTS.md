# Frontend Agent Instructions

## Rules

- Follow existing `src/app`, `components`, `pages`, `hooks`, `context`, `store`, `styles`, and `constants` patterns.
- Follow Atomic Design: atoms are primitives, molecules compose them, and pages assemble screens.
- Use Redux Toolkit for shared state and RTK Query for server data; keep short-lived component interactions local.
- Prefer MUI `styled()` for reusable styling and theme tokens over hardcoded values. Use `sx` only for isolated layout.
- Do not change visual design unless explicitly requested.
