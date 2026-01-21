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
### Path: /.gitignore
- Type: config
- Purpose: ignore node_modules, env files, build outputs, uploads, IDE files
- Owned by: root
- Key responsibilities: prevent committing secrets, large artifacts, and development files
- Depends on: tooling (Node.js, IDEs)
- Used by: git
- Last change summary: initial creation with standard Node.js exclusions

### Path: /.env.example
- Type: config
- Purpose: example environment variables for server, database, JWT, uploads, and CORS
- Owned by: root
- Key responsibilities: onboarding and deployment reference; no actual secrets
- Depends on: backend configuration needs
- Used by: backend services, deployment scripts
- Last change summary: initial creation with PORT, DATABASE_URL, JWT_SECRET, etc.

### Path: /DEVELOPMENT_PLAN.md
- Type: doc
- Purpose: step-by-step build plan with 5 phases and weekly deliverables
- Owned by: docs
- Key responsibilities: implementation timeline, success metrics, phase breakdown
- Depends on: SERVICE_DOC.md requirements
- Used by: all contributors for planning and tracking
- Last change summary: initial creation with 6-week timeline covering backend to deployment
## Backend (created)

### Path: /backend/package.json
- Type: config
- Purpose: backend dependencies and scripts
- Owned by: backend
- Key responsibilities: start/dev/build/test scripts, dependency management
- Depends on: npm
- Used by: backend runtime
- Last change summary: added bcrypt for password hashing and @types/bcrypt for TypeScript

### Path: /backend/prisma/seed.ts
- Type: source
- Purpose: database seeding for development and testing
- Owned by: backend
- Key responsibilities: populate database with initial users and test data
- Depends on: prisma/schema.prisma, bcrypt for password hashing
- Used by: development setup, testing
- Last change summary: completed with all required user roles (owner, manager, admin, seller, user) and secure password hashing

### Path: /backend/src/config/env.ts
- Type: source
- Purpose: load & validate env variables
- Owned by: backend
- Key responsibilities: ensure required env keys exist, provide typed config
- Depends on: dotenv
- Used by: server/app/db
- Last change summary: previously created; now used by db.ts for DATABASE_URL validation
### Path: /backend/tsconfig.json
- Type: config
- Purpose: TypeScript compiler configuration
- Owned by: backend
- Key responsibilities: define TypeScript compilation rules and targets
- Depends on: TypeScript
- Used by: TypeScript compiler during build/dev
- Last change summary: created with ES2020 target, strict mode, CommonJS modules

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
- Purpose: DB client initialization (Prisma ORM)
- Owned by: backend
- Key responsibilities: connect client, export db instance, connection testing
- Depends on: env.ts, @prisma/client
- Used by: services/repositories
- Last change summary: created with Prisma client setup, connection testing, and health check helpers

### Path: /backend/prisma/schema.prisma
- Type: source
- Purpose: database schema (models: User, Apartment, Complex, ApartmentImage)
- Owned by: backend
- Key responsibilities: define tables/relations, migrations, enforce data integrity
- Depends on: prisma
- Used by: db, services, Prisma Client
- Last change summary: added ApartmentStatusLog model for auditing status changes with fromStatus, toStatus, changedBy, and reason fields

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
- Key responsibilities: request authentication, user validation against database
- Depends on: jwt util, database client
- Used by: protected routes
- Last change summary: updated to use Prisma UserRole enum for type-safe role handling

### Path: /backend/src/middleware/roles.ts
- Type: source
- Purpose: role-based access control
- Owned by: backend
- Key responsibilities: requireRole(...) checks, role creation permission validation
- Depends on: auth middleware, roles utilities
- Used by: admin/seller endpoints
- Last change summary: created with role requirement, role creation permission, and user management permission middleware

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
- Key responsibilities: validate file type/size, store, provide file URLs
- Depends on: multer, express, file system
- Used by: apartments media endpoints
- Last change summary: created with file filtering, size limits, storage configuration, and file management helpers

### Path: /backend/src/modules/apartments/apartment.validators.ts
- Type: source
- Purpose: input validation for apartment operations
- Owned by: backend
- Key responsibilities: validate creation, update, and query parameters using Zod
- Depends on: zod library
- Used by: apartment controller
- Last change summary: created with comprehensive validation for all apartment fields including multi-language, infrastructure, and installment options

### Path: /backend/src/modules/apartments/apartment.service.ts
- Type: source
  Purpose: apartment business logic
- Owned by: backend
- Key responsibilities: CRUD operations, filtering, seller authorization, visibility rules
- Depends on: database client, i18n utils, upload middleware
- Used by: apartment controller
- Last change summary: created with complete CRUD including multi-language handling, seller ownership checks, and USER visibility rules (no HIDDEN)

### Path: /backend/src/modules/apartments/apartment.controller.ts
- Type: source
- Purpose: apartment HTTP endpoint handlers
- Owned by: backend
- Key responsibilities: handle create, read, update, delete, and list requests
- Depends on: apartment service, validators, auth middleware
- Used by: apartment routes
- Last change summary: created with error handling, file upload processing, and role-based authorization

### Path: /backend/src/modules/apartments/apartment.routes.ts
- Type: source
- Purpose: apartment route definitions
- Owned by: backend
- Key responsibilities: define public (list, detail) and protected (seller CRUD) routes
- Depends on: apartment controller, auth middleware, roles middleware, upload middleware
- Used by: app.ts route mounting
- Last change summary: added status routes for individual apartment status management

### Path: /backend/src/modules/apartments/status.validators.ts
- Type: source
- Purpose: validation for status change operations
- Owned by: backend
- Key responsibilities: validate status change requests, mark-as-sold data
- Depends on: zod library, Prisma enums
- Used by: status controller
- Last change summary: created with schemas for status changes, mark-as-sold, and bulk operations

### Path: /backend/src/modules/apartments/status.service.ts
- Type: source
- Purpose: status change business logic and permission validation
- Owned by: backend
- Key responsibilities: validate status transitions, check permissions, log changes, handle bulk operations
- Depends on: database client, Prisma enums
- Used by: status controller
- Last change summary: created with complete status transition rules matching SERVICE_DOC.md specifications

### Path: /backend/src/modules/apartments/status.controller.ts
- Type: source
- Purpose: HTTP handlers for status operations
- Owned by: backend
- Key responsibilities: handle status changes, mark-as-sold, history, bulk operations, transition checks
- Depends on: status service, validators, auth middleware
- Used by: status routes
- Last change summary: created with endpoints for all status operations including bulk admin actions

### Path: /backend/src/modules/apartments/status.routes.ts
- Type: source
- Purpose: route definitions for status management
- Owned by: backend
- Key responsibilities: define authenticated routes for status changes, history, and bulk operations
- Depends on: status controller, auth middleware, roles middleware
- Used by: apartment routes
- Last change summary: created with routes for individual status changes, seller mark-as-sold, and admin bulk operations

### Path: /backend/src/modules/auth/*
- Type: source
- Purpose: login/register token issuing
- Owned by: backend
- Key responsibilities: JWT issue, password hash/verify
- Depends on: user model, jwt util
- Used by: clients
- Last change summary: planned
### Path: /backend/src/modules/auth/auth.validators.ts
- Type: source
- Purpose: input validation for authentication endpoints
- Owned by: backend
- Key responsibilities: validate registration and login inputs using Zod schemas
- Depends on: zod library
- Used by: auth controller
- Last change summary: created with email, password, and name validation rules

### Path: /backend/src/modules/auth/auth.service.ts
- Type: source
- Purpose: authentication business logic
- Owned by: backend
- Key responsibilities: user registration, login, password hashing, JWT generation
- Depends on: database client, bcrypt, jwt utils
- Used by: auth controller
- Last change summary: created with registration (USER role only), login, and profile retrieval logic

### Path: /backend/src/modules/auth/auth.controller.ts
- Type: source
- Purpose: authentication HTTP endpoint handlers
- Owned by: backend
- Key responsibilities: handle register, login, and profile requests
- Depends on: auth service, validators
- Used by: auth routes
- Last change summary: created with error handling and response formatting for auth endpoints

### Path: /backend/src/modules/auth/auth.routes.ts
- Type: source
- Purpose: authentication route definitions
- Owned by: backend
- Key responsibilities: define public (register/login) and protected (profile) routes
- Depends on: auth controller, auth middleware
- Used by: app.ts route mounting
- Last change summary: created with /register, /login, and /profile routes

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

### Path: /backend/src/utils/roles.ts
- Type: source
- Purpose: role utilities and permission definitions
- Owned by: backend
- Key responsibilities: define role hierarchy, check permissions, validate role creation rules
- Depends on: Prisma UserRole enum
- Used by: roles middleware, admin modules
- Last change summary: created with complete implementation of SERVICE_DOC.md role creation rules

### Path: /backend/src/modules/admin/admin.routes.ts
- Type: source
- Purpose: admin management demo and permission testing endpoints
- Owned by: backend
- Key responsibilities: demonstrate RBAC in action, provide role information endpoints
- Depends on: auth middleware, roles middleware, roles utilities
- Used by: admin UI for permission checks
- Last change summary: created with role information and permission checking endpoints

### Path: /backend/src/modules/admin/admin.controller.ts
- Type: source
- Purpose: admin management controller (placeholder)
- Owned by: backend
- Key responsibilities: will handle user creation and management (to be implemented)
- Depends on: auth middleware, roles middleware
- Used by: admin routes
- Last change summary: created as placeholder for user management implementation
### Path: /backend/src/utils/jwt.ts
- Type: source
- Purpose: token sign/verify helpers
- Owned by: backend
- Key responsibilities: centralize JWT operations (sign, verify, extract from headers)
- Depends on: env secrets, jsonwebtoken library
- Used by: auth middleware & module
- Last change summary: created with JWT signing, verification, and header extraction utilities


### Path: /backend/src/utils/i18n.ts
- Type: source
- Purpose: multi-language helpers
- Owned by: backend
- Key responsibilities: choose language fields, validation, formatting
- Depends on: —
- Used by: apartments/complexes data shaping
- Last change summary: created with complete uz/ru/en handling, validation, and formatting utilities
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
