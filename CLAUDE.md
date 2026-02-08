# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Buzzthing is a **scheduled jobs admin dashboard** (PWA) for managing cron jobs and their associated payment plans. It's built on TanStack Start (SSR) with Clerk authentication and communicates with an external API at `VITE_API_URL`.

## Commands

- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build (Vite build + service worker generation)
- `npm run test` — Run tests with Vitest
- `npm run check` — Biome lint + format check
- `npm run lint` — Biome lint only
- `npm run format` — Biome format only

## Architecture

**Framework stack:** TanStack Start (React 19) + TanStack Router (file-based routing) + TanStack React Query + Nitro server + Vite 7

**Authentication:** Clerk (`@clerk/tanstack-react-start`). Clerk middleware runs in `src/start.ts`. The root layout wraps content in `<ClerkProvider>` with `<SignedIn>`/`<SignedOut>` gates — unauthenticated users see a sign-in prompt.

**Routing:** File-based via TanStack Router. Route files live in `src/routes/`. The route tree is auto-generated to `src/routeTree.gen.ts` (do not edit). Routes use `createFileRoute` and load data via React Query's `queryClient.ensureQueryData()` in route loaders. The router context provides a `QueryClient`.

**Key routes:**
- `/` (`src/routes/index.tsx`) — Jobs dashboard listing all cron jobs, with search/filter
- `/jobs/$id` (`src/routes/jobs.$id.tsx`) — Job detail page with toggle/delete mutations and payment plan management
- `src/routes/demo/` — Demo/example routes from the TanStack starter (prefixed files can be safely deleted)

**Data fetching:** All API calls use `fetch()` against `import.meta.env.VITE_API_URL`. Query options are defined as standalone `queryOptions()` objects and consumed by both route loaders and `useSuspenseQuery`.

**UI components:** shadcn/ui (new-york style) in `src/components/ui/`. Uses Tailwind CSS v4, Radix UI primitives, and lucide-react icons. The `cn()` utility is at `src/lib/utils.ts`. Add new shadcn components via the shadcn CLI (config in `components.json`).

**Layout:** Root layout (`src/routes/__root.tsx`) renders `<AppSidebar>` (collapsible sidebar with navigation and user controls) + `<SidebarInset>` content area. Theme toggling (dark/light/system) via `ThemeProvider` with `localStorage` persistence under key `vite-ui-theme`.

**PWA / Service Worker:** `vite-plugin-pwa` handles dev-time registration. The custom service worker source is `src/sw.ts` (Workbox strategies: NetworkFirst for navigation, CacheFirst for static assets/images). The build step runs `scripts/generate-sw.mjs` which bundles the SW with esbuild then injects the precache manifest via workbox-build.

**Path alias:** `@/` maps to `./src/` (configured in both `tsconfig.json` and `vite.config.ts`).

## Code Style

- **Formatter/Linter:** Biome with tab indentation and double quotes for JS/TS
- Biome scope: only files under `src/`, `.vscode/`, `index.html`, and `vite.config.ts`; excludes `src/routeTree.gen.ts` and `src/styles.css`
- TypeScript strict mode enabled with `noUnusedLocals` and `noUnusedParameters`

## Environment Variables

Required in `.env` (gitignored):
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk public key (exposed to client)
- `CLERK_SECRET_KEY` — Clerk server-side secret
- `VITE_API_URL` — Backend API base URL for job/payment endpoints
- `VITE_VAPID_PUBLIC_KEY` — VAPID public key for Web Push notifications
