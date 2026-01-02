# Project Architecture

This document describes the architecture of this full-stack application template. It is designed to be a high-performance, lightweight starting point for building modern web applications using **Bun**, **React**, and **SQLite**.

## Technology Stack

*   **Runtime & Tooling**: [Bun](https://bun.com) (v1.3.5+) - Used for package management, script running, bundling, and the HTTP server.
*   **Frontend**:
    *   **React** (v19) - UI library.
    *   **Tailwind CSS** (v4) - Utility-first CSS framework.
    *   **Shadcn UI** - Reusable component library (located in `src/components/ui`).
*   **Backend**:
    *   **Bun.serve()** - Native HTTP server.
    *   **bun:sqlite** - Built-in high-performance SQLite driver.
*   **Language**: TypeScript throughout.

## Project Structure

```
├── build.ts                # Custom build script using Bun.build
├── src/
│   ├── index.ts            # Backend entry point (Server & API definitions)
│   ├── frontend.tsx        # Frontend entry point (React Root)
│   ├── App.tsx             # Main React Application Component
│   ├── index.html          # HTML Template
│   ├── index.css           # Global Styles (Tailwind imports)
│   └── components/         # React Components
│       └── ui/             # Shadcn UI primitives
├── dist/                   # Production build output
└── db.sqlite               # Local SQLite database (auto-created)
```

## Backend Architecture

The backend is a single file server (`src/index.ts`) that handles both API requests and static file serving.

### Key Features
*   **Combined Server**: Uses `Bun.serve` to serve the `index.html` for frontend routes (SPA fallback) and handle `/api/*` requests.
*   **Database**: A global `Database` instance (`bun:sqlite`) is initialized on startup. Tables are automatically created if they don't exist.
*   **Routing**: API validation and routing are handled manually within the `routes` object of `Bun.serve`.

Example API Handler:
```typescript
"/api/resource": {
  GET(req) {
    // DB Query
    return Response.json(data);
  }
}
```

## Frontend Architecture

The frontend is a stand-alone React application bundled by Bun.

### Key Features
*   **Entry Point**: `src/frontend.tsx` mounts the React root.
*   **Component System**: Uses Shadcn UI. Components are raw code in `src/components/ui` allowing full customization.
*   **API Interaction**: Uses standard `fetch` API to communicate with the backend.
*   **Direct Imports**: Supports importing `.css` and `.svg` files directly into TypeScript files.

## Build & Deploy

### Development
```bash
bun dev
```
Runs `src/index.ts` in watch mode (`--hot`). Changes to frontend or backend code trigger instant reloads.

### Production Build
```bash
bun run build
```
Executes `build.ts`. This script:
1.  Cleans `dist/`.
2.  Bundles `src/index.html` (and its dependency `frontend.tsx`) into optimized static assets.
3.  Outputs to `dist/`.

To run production:
```bash
bun start
```
(Note: `index.ts` contains logic to serve static assets in production, or one can configure a reverse proxy like Nginx to serve `dist/` and proxy `/api` to the Bun server).

## Extension Guide

1.  **New API Endpoints**: Add new keys to the `routes` object in `src/index.ts`.
2.  **New UI Components**: Use `bunx shadcn@latest add <component>` to add primitives, or build your own in `src/components`.
3.  **Database Migration**: Currently manual. For complex apps, consider adding a migration tool or script.
