---
trigger: always_on
---

### GENERAL

1. Organize imports in this order with a blank line between groups:
   - External dependencies
   - Internal shared modules
   - Local project files

2. Use strict TypeScript. Avoid `any`. Prefer proper types and utility types when needed.

3. Write concise comments only when necessary. Explain why, not what.

4. Do precisely what has been told, don't make UI changes on your own.

### FRONTEND

1. Follow project structure:
   src/app
   src/components
   src/pages
   src/hooks
   src/utils
   src/contexts
   src/styles
   src/constants

2. Follow Atomic Design:
   - atoms → small UI components
   - molecules → composed components
   - pages → full pages

3. Prefer MUI `styled()` for reusable components over inline `sx`.

4. Use theme values (palette, typography) instead of hardcoded styles.

### BACKEND
