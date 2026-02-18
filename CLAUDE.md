# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Draw me a lobster** — A web app inspired by [gradient.horse](http://gradient.horse). Users draw lobsters with separate parts (tail, left claw, right claw), then release them to walk across a flat ocean floor. All lobsters are shared globally.

### Core Interactions
- **Draw**: Modal (auto-opens on page load) with canvas to freehand-draw a lobster in 3 layers
- **Walk**: Lobsters walk horizontally along the flat ocean floor (linear x movement, wrap at edges)
- **Click/tap**: Makes a lobster jump
- **Double-click/tap**: Removes a lobster (soft-delete)
- **Gallery**: Browse all drawn lobsters (bottom-left button, arrow key navigation)
- **Lobster Amnesty**: Restores all removed lobsters (in info modal)

### Theme
Ocean floor — deep blue water gradient, light rays from surface, rising bubbles, swaying seaweed, sandy flat floor. Lobsters render in lobster-red (#e04020). Caveat font (Google Fonts). Shell-shaped teal SVG buttons.

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Drawing**: Raw HTML Canvas API (no canvas libraries)
- **Database**: Turso (libSQL cloud SQLite) — use `@libsql/client/web` (NOT `@libsql/client`) for Netlify serverless compatibility
- **Deployment**: Netlify
- **Font**: Caveat via Google Fonts CDN

## Commands

```bash
npm run dev          # Start dev server (find available port first)
npm run build        # Production build
npm run test         # Run tests (Vitest)
npm run test -- --run src/path/to/file.test.ts  # Single test file
npm run lint         # ESLint
npm run build && npx netlify deploy --prod --dir=.next  # Deploy
```

## Architecture

### Data Flow
Frontend (`page.tsx`) → API routes (`/api/lobsters/*`) → Turso DB (`@libsql/client/web`)

### API Routes
- `GET /api/lobsters` — Fetch all lobsters
- `POST /api/lobsters` — Create a new lobster (body as JSON)
- `DELETE /api/lobsters/[id]` — Soft-remove a lobster
- `POST /api/lobsters/amnesty` — Restore all removed lobsters
- `POST /api/lobsters/seed` — Seed sample lobsters (runs once when DB is empty)

### Drawing System
Each lobster = 3 canvas layers drawn separately:
1. **Tail** — main body/tail shape (orange #ff6633 in draw modal)
2. **Left claw** — left pincer (pink #ff9999 in draw modal)
3. **Right claw** — right pincer (blue #99bbff in draw modal)

Each layer = array of strokes `{ points: [{x, y}], color, size }`. On the main canvas, all layers render in uniform lobster-red (#e04020).

### Animation System (flat floor)
Lobsters walk horizontally along a flat ocean floor (no curved surface):
- `getFloorY(height)` — floor at 82% of screen height
- `RunningLobster { x, speed, legPhase, jumpVelocity, jumpHeight }` — horizontal position
- Claws animate with sinusoidal offset from `legPhase`
- Lobsters wrap from right edge to left edge

### Component Structure
- `app/page.tsx` — Main page, fetches lobsters from API, shell buttons (+, ?, gallery)
- `app/api/lobsters/` — API routes for CRUD
- `components/LobsterCanvas.tsx` — Full-screen animation canvas
- `components/DrawModal.tsx` — Drawing interface (dark canvas, 3 layers, pointer events)
- `components/InfoModal.tsx` — Info + amnesty button
- `components/GalleryModal.tsx` — Browse all drawn lobsters with arrow navigation
- `lib/animation.ts` — Linear movement, floor geometry, jump physics
- `lib/background.ts` — Ocean gradient, light rays, bubbles, seaweed, sandy floor
- `lib/drawing.ts` — Stroke rendering, undo, clear
- `lib/hit-detection.ts` — Circular hit test on flat floor
- `lib/lobster-store.ts` — Legacy localStorage wrapper (tests only)

### DB Schema (Turso)
```sql
CREATE TABLE lobsters (
  id TEXT PRIMARY KEY,
  tail TEXT,          -- JSON array of Stroke
  left_claw TEXT,     -- JSON array of Stroke
  right_claw TEXT,    -- JSON array of Stroke
  created_at INTEGER,
  removed INTEGER DEFAULT 0
);
```

### Environment Variables
```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=<token>
```
Set in `.env.local` (gitignored) and Netlify env vars.
