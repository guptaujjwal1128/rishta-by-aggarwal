CODING GUIDELINES

GENERAL

1. Organize imports in this order with a blank line between groups:
   - External dependencies
   - Internal shared modules
   - Local project files

2. Use strict TypeScript. Avoid `any`. Prefer proper types and utility types when needed.

3. Keep code simple, readable, and modular. Avoid deeply nested logic.

4. Write concise comments only when necessary. Explain why, not what.

5. Follow existing project structure, patterns, and naming conventions.

6. Avoid code duplication. Reuse existing utilities, hooks, and components.

7. Naming conventions:
   - Components: PascalCase
   - Hooks: camelCase with `use` prefix
   - Types/Interfaces: PascalCase
   - Utils: camelCase

FRONTEND

1. Use functional React components with hooks.

2. Follow project structure:
   src/app
   src/components
   src/pages
   src/hooks
   src/utils
   src/contexts
   src/styles
   src/constants

3. Follow Atomic Design:
   - atoms → small UI components
   - molecules → composed components
   - pages → full pages

4. Prefer MUI `styled()` components over inline `sx`.

5. Use theme values (palette, typography) instead of hardcoded styles.

6. Keep components small and focused.

7. Place business logic in hooks, not UI components.

8. Use `useNavigate` with `void navigate()` to avoid floating promise warnings.

9. Use global state through contexts or custom hooks.

BACKEND

1. Follow layered architecture:
   controllers → services → repositories → database

2. Controllers handle request/response only. Business logic belongs in services.

3. Use repository pattern for database access. Avoid DB calls in controllers.

4. Follow REST API conventions:
   GET /resource
   POST /resource
   PUT /resource/:id
   DELETE /resource/:id

5. Validate request inputs using DTOs or validation schemas.

6. Use centralized error handling and return consistent API responses.

7. Never expose sensitive data in API responses.
