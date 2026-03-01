# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at localhost:3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (eslint-config-next with core web vitals + TS)
```

## Architecture

**Next.js 16 App Router** with React 19, TypeScript (strict mode), and Tailwind CSS v4.

- `app/` — Next.js App Router pages and layouts. Server Components by default.
- `components/ui/` — Shadcn/UI components (radix-mira style) built on Radix UI primitives and @base-ui/react.
- `lib/utils.ts` — `cn()` utility (clsx + tailwind-merge).
- `@/*` path alias maps to project root.

### Styling

- **Tailwind CSS v4** configured via PostCSS plugin (not tailwind.config.js). Theme defined with `@theme inline` in `app/globals.css`.
- **OKLch color space** for all color variables. Light/dark mode via `.dark` class.
- **CSS custom properties** for colors, radius, sidebar tokens — all defined in `:root` and `.dark` in globals.css.
- Shadcn components use `data-slot` attributes for identification and `data-variant`/`data-size` for styling hooks.

### Component Patterns

- **CVA (class-variance-authority)** for variant/size management on components like Button, Badge.
- **Compound components** for complex UI (Card, Field, AlertDialog, DropdownMenu, Combobox).
- Components use `React.ComponentProps<"element">` for prop types, always accept `className`, spread `...props`.
- Named exports only (no default exports). Export both component and variants (e.g., `Button, buttonVariants`).
- `"use client"` directive only on interactive components.
- Icons from `lucide-react`.

### Shadcn Configuration (`components.json`)

- Style: `radix-mira`, RSC enabled, icon library: `lucide`
- Aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`
- Add new components via: `pnpm dlx shadcn@latest add <component>`
