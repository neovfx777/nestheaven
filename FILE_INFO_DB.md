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
- Purpose: step-by-step build plan with 5 phases and weekly deliverables
- Owned by: docs
- Key responsibilities: implementation timeline, success metrics, phase breakdown
- Depends on: SERVICE_DOC.md requirements
- Used by: all contributors for planning and tracking
- Last change summary: initial creation with 6-week timeline covering backend to deployment

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

---

## Backend (created)

### Path: /backend/package.json
- Type: config
- Purpose: backend dependencies and scripts
- Owned by: backend
- Key responsibilities: start/dev/build/test scripts, dependency management
- Depends on: npm
- Used by: backend runtime
- Last change summary: added Prisma dependencies, bcrypt, and database-related scripts

### Path: /backend/tsconfig.json
- Type: config
- Purpose: TypeScript compiler configuration
- Owned by: backend
- Key responsibilities: define TypeScript compilation rules and targets
- Depends on: TypeScript
- Used by: TypeScript compiler during build/dev
- Last change summary: created with ES2020 target, strict mode, CommonJS modules

### Path: /backend/prisma/schema.prisma
- Type: source
- Purpose: database schema (models: User, Apartment, Complex, ApartmentImage, ApartmentStatusLog)
- Owned by: backend
- Key responsibilities: define tables/relations, migrations, enforce data integrity
- Depends on: prisma
- Used by: db, services, Prisma Client
- Last change summary: created with complete schema including status audit logging

### Path: /backend/prisma/seed.ts
- Type: source
- Purpose: database seeding for development and testing
- Owned by: backend
- Key responsibilities: populate database with initial users and test data
- Depends on: prisma/schema.prisma, bcrypt for password hashing
- Used by: development setup, testing
- Last change summary: completed with all required user roles and test apartments

### Path: /backend/src/config/env.ts
- Type: source
- Purpose: load & validate env variables
- Owned by: backend
- Key responsibilities: ensure required env keys exist, provide typed config
- Depends on: dotenv
- Used by: server/app/db
- Last change summary: created with validation for PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN

### Path: /backend/src/config/db.ts
- Type: source
- Purpose: DB client initialization (Prisma ORM)
- Owned by: backend
- Key responsibilities: connect client, export db instance, connection testing
- Depends on: env.ts, @prisma/client
- Used by: services/repositories
- Last change summary: created with Prisma client setup, connection testing, and health check helpers

### Path: /backend/src/server.ts
- Type: source
- Purpose: server entrypoint (listen, graceful shutdown)
- Owned by: backend
- Key responsibilities: start HTTP server, bind port, handle graceful shutdown
- Depends on: app.ts, env config
- Used by: node runtime
- Last change summary: created with environment validation, logging, and graceful shutdown

### Path: /backend/src/app.ts
- Type: source
- Purpose: express app setup
- Owned by: backend
- Key responsibilities: middleware, routes, error handler mount, static file serving
- Depends on: routes, middleware/*
- Used by: server.ts
- Last change summary: created with security middleware, CORS, rate limiting, health check, and route mounting

### Path: /backend/src/middleware/auth.ts
- Type: source
- Purpose: JWT auth (verify token, attach user)
- Owned by: backend
- Key responsibilities: request authentication, user validation against database
- Depends on: jwt util, database client
- Used by: protected routes
- Last change summary: created with authentication middleware that validates tokens and checks user existence

### Path: /backend/src/middleware/roles.ts
- Type: source
- Purpose: role-based access control
- Owned by: backend
- Key responsibilities: requireRole(...) checks, role creation permission validation
- Depends on: auth middleware, roles utilities
- Used by: admin/seller endpoints
- Last change summary: created with role requirement, role creation permission, and user management permission middleware

### Path: /backend/src/middleware/upload.ts
- Type: source
- Purpose: handle image uploads (multer)
- Owned by: backend
- Key responsibilities: validate file type/size, store, provide file URLs
- Depends on: multer, express, file system
- Used by: apartments media endpoints
- Last change summary: created with file filtering, size limits, storage configuration, and file management helpers

### Path: /backend/src/utils/jwt.ts
- Type: source
- Purpose: token sign/verify helpers
- Owned by: backend
- Key responsibilities: centralize JWT operations (sign, verify, extract from headers)
- Depends on: env secrets, jsonwebtoken library
- Used by: auth middleware & module
- Last change summary: created with JWT signing, verification, and header extraction utilities

### Path: /backend/src/utils/roles.ts
- Type: source
- Purpose: role utilities and permission definitions
- Owned by: backend
- Key responsibilities: define role hierarchy, check permissions, validate role creation rules
- Depends on: Prisma UserRole enum
- Used by: roles middleware, admin modules
- Last change summary: created with complete implementation of SERVICE_DOC.md role creation rules

### Path: /backend/src/utils/i18n.ts
- Type: source
- Purpose: multi-language helpers
- Owned by: backend
- Key responsibilities: uz/ru/en content handling, validation, formatting
- Depends on: —
- Used by: apartments/complexes data shaping
- Last change summary: created with complete uz/ru/en handling, validation, and formatting utilities

### Auth Module
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

### Admin Module
### Path: /backend/src/modules/admin/admin.controller.ts
- Type: source
- Purpose: admin management controller (placeholder)
- Owned by: backend
- Key responsibilities: will handle user creation and management (to be implemented)
- Depends on: auth middleware, roles middleware
- Used by: admin routes
- Last change summary: created as placeholder for user management implementation

### Path: /backend/src/modules/admin/admin.routes.ts
- Type: source
- Purpose: admin management demo and permission testing endpoints
- Owned by: backend
- Key responsibilities: demonstrate RBAC in action, provide role information endpoints
- Depends on: auth middleware, roles middleware, roles utilities
- Used by: admin UI for permission checks
- Last change summary: created with role information and permission checking endpoints

### Apartments Module
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
- Purpose: apartment business logic
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
- Last change summary: created with routes for listing, detail, seller create/update/delete, and my-apartments

### Apartment Status Module
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

### Complexes Module
### Path: /backend/src/modules/complexes/complex.validators.ts
- Type: source
- Purpose: input validation for complex operations
- Owned by: backend
- Key responsibilities: validate complex creation, update, query parameters, and other-apartments queries
- Depends on: zod library
- Used by: complex controller
- Last change summary: created with validation for complex CRUD and "other apartments" queries

### Path: /backend/src/modules/complexes/complex.service.ts
- Type: source
- Purpose: complex business logic
- Owned by: backend
- Key responsibilities: CRUD operations for complex grouping, statistics, search
- Depends on: database client
- Used by: complex controller
- Last change summary: created with lightweight complex management (name + image only) and statistics

### Path: /backend/src/modules/complexes/other-apartments.service.ts
- Type: source
- Purpose: "other apartments in same complex" business logic
- Owned by: backend
- Key responsibilities: find related apartments in same complex, complex statistics
- Depends on: database client, apartment data
- Used by: complex controller
- Last change summary: created with logic to find other apartments in same complex and complex statistics

### Path: /backend/src/modules/complexes/complex.controller.ts
- Type: source
- Purpose: complex HTTP endpoint handlers
- Owned by: backend
- Key responsibilities: handle complex CRUD, related apartments, statistics, search
- Depends on: complex service, other-apartments service, validators
- Used by: complex routes
- Last change summary: created with endpoints for complex management and "other apartments" functionality

### Path: /backend/src/modules/complexes/complex.routes.ts
- Type: source
- Purpose: complex route definitions
- Owned by: backend
- Key responsibilities: define public (list, search, stats) and protected (CRUD) routes
- Depends on: complex controller, auth middleware
- Used by: app.ts route mounting
- Last change summary: created with routes for complex CRUD, search, statistics, and related apartments

---

## Frontend (created)

### Path: /frontend/package.json
- Type: config
- Purpose: frontend dependencies and scripts
- Owned by: frontend
- Key responsibilities: dev/build scripts, dependency management
- Depends on: npm, Vite
- Used by: Vite, React
- Last change summary: created with React, TypeScript, Vite, Tailwind, and essential libraries

### Path: /frontend/vite.config.ts
- Type: config
- Purpose: Vite build configuration
- Owned by: frontend
- Key responsibilities: development server, build optimization, proxy configuration
- Depends on: Vite, TypeScript
- Used by: Vite build system
- Last change summary: created with proxy for backend API (/api → localhost:3000) and uploads

### Path: /frontend/tsconfig.json
- Type: config
- Purpose: TypeScript configuration for frontend
- Owned by: frontend
- Key responsibilities: TypeScript compilation rules, path aliases
- Depends on: TypeScript
- Used by: TypeScript compiler, IDE
- Last change summary: created with React JSX support, strict mode, and path aliases

### Path: /frontend/tsconfig.node.json
- Type: config
- Purpose: TypeScript configuration for Node context
- Owned by: frontend
- Key responsibilities: Vite configuration TypeScript support
- Depends on: TypeScript
- Used by: Vite build system
- Last change summary: created for Vite config TypeScript support

### Path: /frontend/.env.example
- Type: config
- Purpose: frontend environment variables example
- Owned by: frontend
- Key responsibilities: example configuration for frontend
- Depends on: Vite environment variables
- Used by: development setup
- Last change summary: created with API_URL and app configuration

### Path: /frontend/index.html
- Type: source
- Purpose: main HTML entry point
- Owned by: frontend
- Key responsibilities: HTML structure, meta tags, root div
- Depends on: Vite
- Used by: browser
- Last change summary: created with basic structure and meta tags

### Path: /frontend/tailwind.config.js
- Type: config
- Purpose: Tailwind CSS configuration
- Owned by: frontend
- Key responsibilities: define theme, colors, plugins
- Depends on: Tailwind CSS
- Used by: PostCSS, build system
- Last change summary: created with custom theme and primary/secondary colors

### Path: /frontend/postcss.config.js
- Type: config
- Purpose: PostCSS configuration
- Owned by: frontend
- Key responsibilities: process CSS with Tailwind and autoprefixer
- Depends on: PostCSS, Tailwind
- Used by: Vite build system
- Last change summary: created with Tailwind and autoprefixer plugins

### Path: /frontend/src/vite-env.d.ts
- Type: source
- Purpose: Vite type definitions
- Owned by: frontend
- Key responsibilities: TypeScript support for Vite environment
- Depends on: Vite
- Used by: TypeScript compiler
- Last change summary: created for Vite client types

### Path: /frontend/src/index.css
- Type: source
- Purpose: global CSS styles
- Owned by: frontend
- Key responsibilities: Tailwind directives, custom CSS variables, global styles
- Depends on: Tailwind CSS
- Used by: all components
- Last change summary: created with Tailwind directives and custom theme variables

### Path: /frontend/src/main.tsx
- Type: source
- Purpose: app bootstrap
- Owned by: frontend
- Key responsibilities: render React app, setup providers (React Query)
- Depends on: App.tsx, React DOM
- Used by: browser entry point
- Last change summary: created with React Query client setup and React Strict Mode

### Path: /frontend/src/App.tsx
- Type: source
- Purpose: main application component with routing
- Owned by: frontend
- Key responsibilities: define routes, layout structure, global toast notifications
- Depends on: react-router-dom, layout components
- Used by: main.tsx
- Last change summary: created with public routes (home, apartments, auth) and protected dashboard route

### Path: /frontend/src/api/client.ts
- Type: source
- Purpose: API client wrapper (baseURL, auth header)
- Owned by: frontend
- Key responsibilities: centralized API requests with auth token injection and error handling
- Depends on: axios, auth store
- Used by: all API modules
- Last change summary: created with request/response interceptors for auth headers and token refresh

### Path: /frontend/src/api/auth.ts
- Type: source
- Purpose: authentication API functions
- Owned by: frontend
- Key responsibilities: typed API calls for login, register, profile
- Depends on: api client
- Used by: auth store, auth pages
- Last change summary: created with TypeScript interfaces for all auth API responses

### Path: /frontend/src/api/apartments.ts
- Type: source
- Purpose: apartment API functions and types
- Owned by: frontend
- Key responsibilities: typed API calls for apartments, complexes, filtering, and search
- Depends on: api client
- Used by: apartment pages, components
- Last change summary: created with TypeScript interfaces for apartments, filtering, and paginated responses

### Path: /frontend/src/stores/authStore.ts
- Type: source
- Purpose: authentication state management
- Owned by: frontend
- Key responsibilities: manage user authentication state, token storage, API integration
- Depends on: auth API, localStorage
- Used by: Header, protected routes, auth pages
- Last change summary: enhanced with API actions (loginUser, registerUser, fetchProfile), loading states, and error handling

### Path: /frontend/src/utils/validation.ts
- Type: source
- Purpose: form validation schemas
- Owned by: frontend
- Key responsibilities: validate login and register inputs using Zod
- Depends on: zod library
- Used by: auth pages, forms
- Last change summary: created with loginSchema and registerSchema with password validation rules

### Layout Components
### Path: /frontend/src/components/layout/Layout.tsx
- Type: source
- Purpose: main layout wrapper
- Owned by: frontend
- Key responsibilities: provide consistent layout with header and footer
- Depends on: Header, Footer, react-router
- Used by: App.tsx
- Last change summary: added Footer component to layout structure

### Path: /frontend/src/components/layout/Header.tsx
- Type: source
- Purpose: site header with navigation
- Owned by: frontend
- Key responsibilities: logo, navigation links, auth status display
- Depends on: auth store, react-router
- Used by: Layout.tsx
- Last change summary: added complexes link to navigation

### Path: /frontend/src/components/layout/Footer.tsx
- Type: source
- Purpose: site footer component
- Owned by: frontend
- Key responsibilities: display footer with links, contact info, and newsletter
- Depends on: layout
- Used by: Layout.tsx
- Last change summary: created with responsive grid, social links, and contact information

### Auth Components
### Path: /frontend/src/components/auth/ProtectedRoute.tsx
- Type: source
- Purpose: route protection component
- Owned by: frontend
- Key responsibilities: protect routes based on authentication and roles
- Depends on: react-router, auth store
- Used by: App.tsx routing
- Last change summary: created with authentication check and optional role-based access control

### Path: /frontend/src/components/auth/AuthForm.tsx
- Type: source
- Purpose: reusable authentication form components
- Owned by: frontend
- Key responsibilities: provide consistent auth form layout, error display, loading states
- Depends on: auth store
- Used by: LoginPage, RegisterPage
- Last change summary: created with FormInput component and shared auth form layout

### Apartment Components
### Path: /frontend/src/components/apartments/ApartmentCard.tsx
- Type: source
- Purpose: apartment listing card component
- Owned by: frontend
- Key responsibilities: display apartment preview with image, price, specs, and status
- Depends on: apartment API types
- Used by: ApartmentsPage
- Last change summary: created with responsive design, status badges, and hover effects

### Path: /frontend/src/components/apartments/ApartmentFilters.tsx
- Type: source
- Purpose: apartment filtering component
- Owned by: frontend
- Key responsibilities: provide advanced filtering UI for apartments
- Depends on: apartment API, complexes data
- Used by: ApartmentsPage
- Last change summary: created with price range, rooms, area, complex, developer, and sort options

### Path: /frontend/src/components/apartments/ApartmentGallery.tsx
- Type: source
- Purpose: apartment image gallery component
- Owned by: frontend
- Key responsibilities: display apartment images with carousel and fullscreen view
- Depends on: apartment images data
- Used by: ApartmentDetailPage
- Last change summary: created with thumbnail navigation, fullscreen modal, and image counter

### Pages
### Path: /frontend/src/pages/HomePage.tsx
- Type: source
- Purpose: home page
- Owned by: frontend
- Key responsibilities: welcome users, provide entry point to app
- Depends on: layout
- Used by: App routing
- Last change summary: created as placeholder with welcome message

### Path: /frontend/src/pages/auth/LoginPage.tsx
- Type: source
- Purpose: user login page
- Owned by: frontend
- Key responsibilities: handle user login with validation and error handling
- Depends on: auth store, validation, AuthForm component
- Used by: App routing
- Last change summary: created with react-hook-form integration, redirect logic, and remember me option

### Path: /frontend/src/pages/auth/RegisterPage.tsx
- Type: source
- Purpose: user registration page
- Owned by: frontend
- Key responsibilities: handle user registration with password validation
- Depends on: auth store, validation, AuthForm component
- Used by: App routing
- Last change summary: created with password requirements display and terms agreement

### Path: /frontend/src/pages/apartments/ApartmentsPage.tsx
- Type: source
- Purpose: apartment listing and browsing page
- Owned by: frontend
- Key responsibilities: display paginated apartments with filtering and search
- Depends on: apartment API, ApartmentCard, ApartmentFilters
- Used by: App routing
- Last change summary: created with React Query integration, URL state management, and pagination

### Path: /frontend/src/pages/apartments/ApartmentDetailPage.tsx
- Type: source
- Purpose: apartment detail view page
- Owned by: frontend
- Key responsibilities: show detailed apartment information with tabs
- Depends on: apartment API, ApartmentGallery
- Used by: App routing
- Last change summary: created with multi-language support, installment calculator, and related apartments

### Path: /frontend/src/pages/ComplexesPage.tsx
- Type: source
- Purpose: complexes listing page (placeholder)
- Owned by: frontend
- Key responsibilities: placeholder for future complexes browsing
- Depends on: layout
- Used by: App routing
- Last change summary: created as placeholder for complexes page implementation

### Path: /frontend/src/pages/NotFoundPage.tsx
- Type: source
- Purpose: 404 error page
- Owned by: frontend
- Key responsibilities: handle undefined routes
- Depends on: layout
- Used by: App routing
- Last change summary: created with 404 message and home link

### Dashboard Components
### Path: /frontend/src/pages/dashboard/DashboardLayout.tsx
- Type: source
- Purpose: dashboard layout with role-based sidebar
- Owned by: frontend
- Key responsibilities: provide dashboard layout with navigation filtered by user role
- Depends on: auth store, user role
- Used by: DashboardPage
- Last change summary: created with responsive sidebar, role-based menu filtering, and user info display

### Path: /frontend/src/pages/dashboard/DashboardPage.tsx
- Type: source
- Purpose: main dashboard page router
- Owned by: frontend
- Key responsibilities: route users to appropriate dashboard based on role
- Depends on: auth store, all dashboard components
- Used by: App routing (protected)
- Last change summary: updated to route users to role-specific dashboards (USER, SELLER, ADMIN, MANAGER_ADMIN, OWNER_ADMIN)

### Path: /frontend/src/pages/dashboard/UserDashboard.tsx
- Type: source
- Purpose: USER role dashboard
- Owned by: frontend
- Key responsibilities: display user-specific features (favorites, saved searches, notifications)
- Depends on: auth store
- Used by: DashboardPage (for USER role)
- Last change summary: created with favorites management, saved searches, and user activity tracking

### Path: /frontend/src/pages/dashboard/SellerDashboard.tsx
- Type: source
- Purpose: SELLER role dashboard
- Owned by: frontend
- Key responsibilities: apartment listing management and seller analytics
- Depends on: auth store
- Used by: DashboardPage (for SELLER role)
- Last change summary: created with listing management, sales analytics, and seller performance metrics

### Path: /frontend/src/pages/dashboard/AdminDashboard.tsx
- Type: source
- Purpose: ADMIN role dashboard
- Owned by: frontend
- Key responsibilities: content moderation and platform management
- Depends on: auth store
- Used by: DashboardPage (for ADMIN role)
- Last change summary: created with content review, flagged content management, and moderation tools

### Path: /frontend/src/pages/dashboard/ManagerDashboard.tsx
- Type: source
- Purpose: MANAGER_ADMIN role dashboard
- Owned by: frontend
- Key responsibilities: admin management and platform oversight
- Depends on: auth store
- Used by: DashboardPage (for MANAGER_ADMIN role)
- Last change summary: created with admin account management, performance monitoring, and manager tools

### Path: /frontend/src/pages/dashboard/OwnerDashboard.tsx
- Type: source
- Purpose: OWNER_ADMIN role dashboard
- Owned by: frontend
- Key responsibilities: complete system oversight and management
- Depends on: auth store
- Used by: DashboardPage (for OWNER_ADMIN role)
- Last change summary: created with system-wide analytics, user management, and owner-level tools

---

## Frontend (planned - next steps)

### Path: /frontend/src/features/*
- Type: source
- Purpose: role-based UI flows (user/seller/admin/manager/owner)
- Owned by: frontend
- Key responsibilities: screens and logic separated per domain
- Depends on: api
- Used by: App router
- Last change summary: planned - will implement role-specific features

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