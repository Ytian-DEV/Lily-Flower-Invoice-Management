# Design System

Centralized visual standards for Lily Flowers - Baybay City Branch.

Use the exported tokens from `@/design-system` for typed constants, and Tailwind token classes from `src/styles/global.css` for component styling.

## Standards

- Colors: use semantic Tailwind tokens such as `primary`, `surface`, `success-bg`, `danger-text`, and `status-paid-bg`.
- Typography: headings use `font-heading`; body copy uses `font-body`.
- Radius: default interactive and card radius is `rounded-xl` or the `radius.md` token.
- Shadows: use `shadow-soft` or elevation tokens from `shadows`.
- Animation: keep transitions at `duration-300` or below.
- Forms: use shared form primitives and `componentStyles.formField` for new primitives.
- Tables: use shared table components and semantic empty/loading/error states.
- Dark mode: add future theme overrides by extending tokens, not by rewriting components.
