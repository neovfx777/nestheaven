# File Info DB (Registry)

This file is the **registry** of project files.
Update it whenever files are created/edited/removed.

## Registry Fields (use this format per file)
- Path:
- Type: (source/config/doc)
- Purpose:
- Owned by: (backend/frontend/docs)
- Key responsibilities:
- Depends on:
- Used by:
- Last change summary:

---

# Planned Repository Structure (Monorepo)

## Root

### Path: /SERVICE_DOC.md
- Type: doc
- Purpose: Overall service spec, roles, DB overview, workflow rules
- Owned by: docs
- Key responsibilities: single source for product rules + governance
- Depends on: —
- Used by: all contributors
- Last change summary: initial creation

### Path: /FILE_INFO_DB.md
- Type: doc
- Purpose: file registry: what each file does
- Owned by: docs
- Key responsibilities: maintain file purpose + dependencies + change summaries
- Depends on: —
- Used by: all contributors
- Last change summary: initial creation

### Path: /TRACKER.md
- Type: doc
- Purpose: todo/in-progress/done tracking
- Owned by: docs
- Key responsibilities: work planning & progress
- Depends on: DEVELOPMENT_PLAN decisions
- Used by: all contributors
- Last change summary: initial creation

### Path: /ACTION_REPORT.md
- Type: doc
- Purpose: append-only action log of file changes
- Owned by: docs
- Key responsibilities: quick history of what changed (no who/when)
- Depends on: —
- Used by: all contributors
- Last change summary: initial creation

### Path: /DEVELOPMENT_PLAN.md
- Type: doc
- Purpose: step-by-step build plan + deliverables
- Owned by: docs
- Key responsibilities: implementation phases and file creation order
- Depends on: SERVICE_DOC.md
- Used by: all contributors
- Last change summary: planned (not yet created here)

### Path: /.gitignore
- Type: config
- Purpose: ignore node_modules, env, build outputs, uploads (if desired)
- Owned by: root
- Key responsibilities: prevent committing secrets/large artifacts
- Depends on: tooling
- Used by: git
- Last change summary: planned

### Path: /.env.example
- Type: config
- Purpose: example env vars (no secrets)
- Owned by: root
- Key responsibilities: onboarding and deployments
- Depends on: backend config
- Used by: backend
- Last change summary: planned

---

## Backend (planned)

### Path: /backend/package.json
- Type: config
- Purpose: backend dependencies and scripts
- Owned by: backend
- Key responsibilities: start/dev/test scripts
- Depends on: npm
- Used by: backend runtime
- Last change summary: planned

### Path: /backend/src/server.ts
- Type: source
- Purpose: server entrypoint (listen, graceful shutdown)
- Owned by: backend
- Key responsibilities: start http server, bind port
- Depends on: app.ts, env config
- Used by: node runtime
- Last change summary: planned

### Path: /backend/src/app.ts
- Type: source
- Purpose: express app setup
- Owned by: backend
- Key responsibilities: middleware, routes, error handler mount
- Depends on: routes/index.ts, middleware/*
- Used by: server.ts
- Last change summary: planned

### Path: /backend/src/config/env.ts
- Type: source
- Purpose: load & validate env variables
- Owned by: backend
- Key responsibilities: ensure required env keys exist
- Depends on: dotenv
- Used by: server/app/db
- Last change summary: planned

### Path: /backend/src/config/db.ts
- Type: source
- Purpose: DB client initialization (Prisma or chosen ORM)
- Owned by: backend
- Key responsibilities: connect client, export db instance
- Depends on: env.ts
- Used by: services/repositories
- Last change summary: planned

### Path: /backend/prisma/schema.prisma
- Type: source
- Purpose: database schema (models: User, Apartment, Complex, etc.)
- Owned by: backend
- Key responsibilities: define tables/relations, migrations
- Depends on: prisma
- Used by: db, services
- Last change summary: planned

### Path: /backend/src/routes/index.ts
- Type: source
- Purpose: combine module routes
- Owned by: backend
- Key responsibilities: mount /auth, /users, /apartments, /admin, /complexes
- Depends on: module routes
- Used by: app.ts
- Last change summary: planned

### Path: /backend/src/middleware/auth.ts
- Type: source
- Purpose: JWT auth (verify token, attach user)
- Owned by: backend
- Key responsibilities: request authentication
- Depends on: jwt util
- Used by: protected routes
- Last change summary: planned

### Path: /backend/src/middleware/roles.ts
- Type: source
- Purpose: role-based access control
- Owned by: backend
- Key responsibilities: requireRole(...) checks
- Depends on: auth middleware
- Used by: admin/seller endpoints
- Last change summary: planned

### Path: /backend/src/middleware/error.ts
- Type: source
- Purpose: global error handler
- Owned by: backend
- Key responsibilities: normalize errors, HTTP status codes
- Depends on: —
- Used by: app.ts
- Last change summary: planned

### Path: /backend/src/middleware/upload.ts
- Type: source
- Purpose: handle image uploads (multer)
- Owned by: backend
- Key responsibilities: validate file type/size, store
- Depends on: multer
- Used by: apartments media endpoints
- Last change summary: planned

### Path: /backend/src/modules/auth/*
- Type: source
- Purpose: login/register token issuing
- Owned by: backend
- Key responsibilities: JWT issue, password hash/verify
- Depends on: user model, jwt util
- Used by: clients
- Last change summary: planned

### Path: /backend/src/modules/admin/*
- Type: source
- Purpose: admin management + moderation actions
- Owned by: backend
- Key responsibilities: create seller, create admins, hide listing
- Depends on: roles middleware
- Used by: admin UI
- Last change summary: planned

### Path: /backend/src/modules/apartments/*
- Type: source
- Purpose: apartment listing CRUD + filters
- Owned by: backend
- Key responsibilities: create/edit/list, status change, "other in complex"
- Depends on: auth/roles/upload
- Used by: all clients
- Last change summary: planned

### Path: /backend/src/modules/complexes/*
- Type: source
- Purpose: complex grouping CRUD (lightweight)
- Owned by: backend
- Key responsibilities: create/list/edit group container
- Depends on: —
- Used by: sellers/admins (and clients optionally)
- Last change summary: planned

### Path: /backend/src/utils/jwt.ts
- Type: source
- Purpose: token sign/verify helpers
- Owned by: backend
- Key responsibilities: centralize JWT operations
- Depends on: env secrets
- Used by: auth middleware & module
- Last change summary: planned

### Path: /backend/src/utils/i18n.ts
- Type: source
- Purpose: multi-language helpers
- Owned by: backend
- Key responsibilities: choose language fields, validation
- Depends on: —
- Used by: apartments/complexes data shaping
- Last change summary: planned

---

## Frontend (web, planned)

### Path: /frontend/package.json
- Type: config
- Purpose: frontend deps and scripts
- Owned by: frontend
- Key responsibilities: dev/build
- Depends on: npm
- Used by: Vite
- Last change summary: planned

### Path: /frontend/src/main.tsx
- Type: source
- Purpose: app bootstrap
- Owned by: frontend
- Key responsibilities: render App, providers
- Depends on: App.tsx
- Used by: browser
- Last change summary: planned

### Path: /frontend/src/api/client.ts
- Type: source
- Purpose: API client wrapper (baseURL, auth header)
- Owned by: frontend
- Key responsibilities: centralized API requests
- Depends on: token storage
- Used by: feature APIs
- Last change summary: planned

### Path: /frontend/src/features/*
- Type: source
- Purpose: role-based UI flows (user/seller/admin/manager/owner)
- Owned by: frontend
- Key responsibilities: screens and logic separated per domain
- Depends on: api
- Used by: App router
- Last change summary: planned

---

## Mobile (later)

### Path: /mobile/*
- Type: source
- Purpose: React Native (Expo) app consuming same backend API
- Owned by: mobile
- Key responsibilities: Android+iOS UI only
- Depends on: backend API contract
- Used by: devices
- Last change summary: planned
