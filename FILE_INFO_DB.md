# File Info DB (Registry)

This file is the **registry** of project files.
Update it whenever files are created/edited/removed.

## Registry Fields (use this format per file)
- **Path**: Full file path
- **Type**: source/config/doc
- **Purpose**: Brief description of what the file does
- **Owned by**: backend/frontend/docs
- **Key responsibilities**: Main functions/features
- **Depends on**: Other files/dependencies
- **Used by**: Which components/routes use this file
- **Last change summary**: What was changed recently

---

## Root Files

### Path: /SERVICE_DOC.md
- **Type**: doc
- **Purpose**: Overall service spec, roles, DB overview, workflow rules
- **Owned by**: docs
- **Key responsibilities**: Single source for product rules + governance
- **Depends on**: —
- **Used by**: All contributors
- **Last change summary**: Initial creation

### Path: /FILE_INFO_DB.md
- **Type**: doc
- **Purpose**: File registry: what each file does
- **Owned by**: docs
- **Key responsibilities**: Maintain file purpose + dependencies + change summaries
- **Depends on**: —
- **Used by**: All contributors
- **Last change summary**: Reorganized and standardized formatting

### Path: /TRACKER.md
- **Type**: doc
- **Purpose**: Todo/in-progress/done tracking
- **Owned by**: docs
- **Key responsibilities**: Work planning & progress tracking
- **Depends on**: DEVELOPMENT_PLAN decisions
- **Used by**: All contributors
- **Last change summary**: Initial creation

### Path: /ACTION_REPORT.md
- **Type**: doc
- **Purpose**: Append-only action log of file changes
- **Owned by**: docs
- **Key responsibilities**: Quick history of what changed (no who/when)
- **Depends on**: —
- **Used by**: All contributors
- **Last change summary**: Initial creation

### Path: /DEVELOPMENT_PLAN.md
- **Type**: doc
- **Purpose**: Step-by-step build plan with 5 phases and weekly deliverables
- **Owned by**: docs
- **Key responsibilities**: Implementation timeline, success metrics, phase breakdown
- **Depends on**: SERVICE_DOC.md requirements
- **Used by**: All contributors for planning and tracking
- **Last change summary**: Initial creation with 6-week timeline covering backend to deployment

### Path: /.gitignore
- **Type**: config
- **Purpose**: Ignore node_modules, env files, build outputs, uploads, IDE files
- **Owned by**: root
- **Key responsibilities**: Prevent committing secrets, large artifacts, and development files
- **Depends on**: Tooling (Node.js, IDEs)
- **Used by**: Git
- **Last change summary**: Initial creation with standard Node.js exclusions

### Path: /.env.example
- **Type**: config
- **Purpose**: Example environment variables for server, database, JWT, uploads, and CORS
- **Owned by**: root
- **Key responsibilities**: Onboarding and deployment reference; no actual secrets
- **Depends on**: Backend configuration needs
- **Used by**: Backend services, deployment scripts
- **Last change summary**: Initial creation with PORT, DATABASE_URL, JWT_SECRET, etc.

---

## Backend Files

### Core Configuration

#### Path: /backend/package.json
- **Type**: config
- **Purpose**: Backend dependencies and scripts
- **Owned by**: backend
- **Key responsibilities**: Start/dev/build/test scripts, dependency management
- **Depends on**: npm
- **Used by**: Backend runtime
- **Last change summary**: Added Prisma dependencies, bcrypt, and database-related scripts

#### Path: /backend/tsconfig.json
- **Type**: config
- **Purpose**: TypeScript compiler configuration
- **Owned by**: backend
- **Key responsibilities**: Define TypeScript compilation rules and targets
- **Depends on**: TypeScript
- **Used by**: TypeScript compiler during build/dev
- **Last change summary**: Created with ES2020 target, strict mode, CommonJS modules

#### Path: /backend/prisma/schema.prisma
- **Type**: source
- **Purpose**: Database schema definition
- **Owned by**: backend
- **Key responsibilities**: Define relational data models
- **Depends on**: Prisma ORM
- **Used by**: Prisma Client, backend services
- **Last change summary**: Added UserFavorite and SavedSearch models for user personalization features

#### Path: /backend/prisma/seed.ts
- **Type**: source
- **Purpose**: Database seeding for development and testing
- **Owned by**: backend
- **Key responsibilities**: Populate database with initial users and test data
- **Depends on**: prisma/schema.prisma, bcrypt for password hashing
- **Used by**: Development setup, testing
- **Last change summary**: Completed with all required user roles and test apartments

### Configuration Modules

#### Path: /backend/src/config/env.ts
- **Type**: source
- **Purpose**: Load & validate env variables
- **Owned by**: backend
- **Key responsibilities**: Ensure required env keys exist, provide typed config
- **Depends on**: dotenv
- **Used by**: Server/app/db
- **Last change summary**: Created with validation for PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN

#### Path: /backend/src/config/db.ts
- **Type**: source
- **Purpose**: DB client initialization (Prisma ORM)
- **Owned by**: backend
- **Key responsibilities**: Connect client, export db instance, connection testing
- **Depends on**: env.ts, @prisma/client
- **Used by**: Services/repositories
- **Last change summary**: Created with Prisma client setup, connection testing, and health check helpers

### Server & App

#### Path: /backend/src/server.ts
- **Type**: source
- **Purpose**: Server entrypoint (listen, graceful shutdown)
- **Owned by**: backend
- **Key responsibilities**: Start HTTP server, bind port, handle graceful shutdown
- **Depends on**: app.ts, env config
- **Used by**: Node runtime
- **Last change summary**: Created with environment validation, logging, and graceful shutdown

#### Path: /backend/src/app.ts
- **Type**: source
- **Purpose**: Main Express application configuration
- **Owned by**: backend
- **Key responsibilities**: Set up middleware, mount routes, handle errors, serve static files
- **Depends on**: All route modules, middleware modules
- **Used by**: server.ts
- **Last change summary**: Fixed analytics routes import to correctly match named export from analytics.routes.ts



### Middleware

#### Path: /backend/src/middleware/auth.ts
- **Type**: source
- **Purpose**: JWT auth (verify token, attach user)
- **Owned by**: backend
- **Key responsibilities**: Request authentication, user validation against database
- **Depends on**: jwt util, database client
- **Used by**: Protected routes
- **Last change summary**: Created with authentication middleware that validates tokens and checks user existence

#### Path: /backend/src/middleware/roles.ts
- **Type**: source
- **Purpose**: Role-based access control
- **Owned by**: backend
- **Key responsibilities**: requireRole(...) checks, role creation permission validation
- **Depends on**: auth middleware, roles utilities
- **Used by**: Admin/seller endpoints
- **Last change summary**: Created with role requirement, role creation permission, and user management permission middleware

#### Path: /backend/src/middleware/upload.ts
- **Type**: source
- **Purpose**: File upload handling with Multer
- **Owned by**: backend
- **Key responsibilities**: Handle multiple file uploads with validation and error handling
- **Depends on**: Multer library
- **Used by**: Apartment image upload endpoints
- **Last change summary**: Enhanced to handle multiple files with proper error handling and file management utilities

### Utilities

#### Path: /backend/src/utils/jwt.ts
- **Type**: source
- **Purpose**: Token sign/verify helpers
- **Owned by**: backend
- **Key responsibilities**: Centralize JWT operations (sign, verify, extract from headers)
- **Depends on**: env secrets, jsonwebtoken library
- **Used by**: Auth middleware & module
- **Last change summary**: Created with JWT signing, verification, and header extraction utilities

#### Path: /backend/src/utils/roles.ts
- **Type**: source
- **Purpose**: Role utilities and permission definitions
- **Owned by**: backend
- **Key responsibilities**: Define role hierarchy, check permissions, validate role creation rules
- **Depends on**: Prisma UserRole enum
- **Used by**: Roles middleware, admin modules
- **Last change summary**: Created with complete implementation of SERVICE_DOC.md role creation rules

#### Path: /backend/src/utils/i18n.ts
- **Type**: source
- **Purpose**: Multi-language helpers
- **Owned by**: backend
- **Key responsibilities**: uz/ru/en content handling, validation, formatting
- **Depends on**: —
- **Used by**: Apartments/complexes data shaping
- **Last change summary**: Created with complete uz/ru/en handling, validation, and formatting utilities

### Auth Module

#### Path: /backend/src/modules/auth/auth.validators.ts
- **Type**: source
- **Purpose**: Input validation for authentication endpoints
- **Owned by**: backend
- **Key responsibilities**: Validate registration and login inputs using Zod schemas
- **Depends on**: zod library
- **Used by**: auth controller
- **Last change summary**: Created with email, password, and name validation rules

#### Path: /backend/src/modules/auth/auth.service.ts
- **Type**: source
- **Purpose**: Authentication business logic
- **Owned by**: backend
- **Key responsibilities**: User registration, login, password hashing, JWT generation
- **Depends on**: Database client, bcrypt, jwt utils
- **Used by**: auth controller
- **Last change summary**: Created with registration (USER role only), login, and profile retrieval logic

#### Path: /backend/src/modules/auth/auth.controller.ts
- **Type**: source
- **Purpose**: Authentication HTTP endpoint handlers
- **Owned by**: backend
- **Key responsibilities**: Handle register, login, and profile requests
- **Depends on**: auth service, validators
- **Used by**: auth routes
- **Last change summary**: Created with error handling and response formatting for auth endpoints

#### Path: /backend/src/modules/auth/auth.routes.ts
- **Type**: source
- **Purpose**: Authentication route definitions
- **Owned by**: backend
- **Key responsibilities**: Define public (register/login) and protected (profile) routes
- **Depends on**: auth controller, auth middleware
- **Used by**: app.ts route mounting
- **Last change summary**: Created with /register, /login, and /profile routes

### Admin Module

#### Path: /backend/src/modules/admin/admin.controller.ts
- **Type**: source
- **Purpose**: Admin management controller
- **Owned by**: backend
- **Key responsibilities**: Handle user creation and management
- **Depends on**: auth middleware, roles middleware
- **Used by**: admin routes
- **Last change summary**: Created as placeholder for user management implementation

#### Path: /backend/src/modules/admin/admin.routes.ts
- **Type**: source
- **Purpose**: Admin management demo and permission testing endpoints
- **Owned by**: backend
- **Key responsibilities**: Demonstrate RBAC in action, provide role information endpoints
- **Depends on**: auth middleware, roles middleware, roles utilities
- **Used by**: admin UI for permission checks
- **Last change summary**: Created with role information and permission checking endpoints

### Apartments Module

#### Path: /backend/src/modules/apartments/apartment.validators.ts
- **Type**: source
- **Purpose**: Input validation for apartment operations
- **Owned by**: backend
- **Key responsibilities**: Validate creation, update, and query parameters using Zod
- **Depends on**: zod library
- **Used by**: apartment controller
- **Last change summary**: Created with comprehensive validation for all apartment fields including multi-language, infrastructure, and installment options

#### Path: /backend/src/modules/apartments/apartment.service.ts
Type: source
Purpose: Apartment business logic with JSON field handling
Owned by: backend
Key responsibilities: CRUD operations, filtering, multi-language support, image management
Depends on: Prisma client, i18n utilities, upload middleware
Used by: apartment controller
Last change summary: Fixed JSON field handling to match Prisma schema, corrected field names, added constructor

### Path: /backend/src/modules/apartments/status.routes.ts (New/Created)
Type: source

Purpose: Route definitions for status management endpoints

Owned by: backend

Key responsibilities: Define authenticated routes for status operations

Depends on: status controller, auth middleware, roles middleware

Used by: app.ts route mounting

Last change summary: Created to fix undefined routes error in app.ts


#### Path: /backend/src/modules/apartments/apartment.controller.ts
- **Type**: source
- **Purpose**: Apartment HTTP endpoint handlers
- **Owned by**: backend
- **Key responsibilities**: Handle create, read, update, delete, and list requests
- **Depends on**: apartment service, validators, auth middleware
- **Used by**: apartment routes
- **Last change summary**: Added image upload endpoints with proper error handling

#### Path: /backend/src/modules/apartments/apartment.routes.ts
- **Type**: source
- **Purpose**: Apartment route definitions
- **Owned by**: backend
- **Key responsibilities**: Define public (list, detail) and protected (seller CRUD) routes
- **Depends on**: apartment controller, auth middleware, roles middleware, upload middleware
- **Used by**: app.ts route mounting
- **Last change summary**: Added routes for image upload, reorder, and delete operations

### Apartment Status Module

#### Path: /backend/src/modules/apartments/status.validators.ts
- **Type**: source
- **Purpose**: Validation for status change operations
- **Owned by**: backend
- **Key responsibilities**: Validate status change requests, mark-as-sold data
- **Depends on**: zod library, Prisma enums
- **Used by**: status controller
- **Last change summary**: Created with schemas for status changes, mark-as-sold, and bulk operations

#### Path: /backend/src/modules/apartments/status.service.ts
Type: source
Purpose: Status management business logic
Owned by: backend
Key responsibilities: Handle apartment status changes, validation, history tracking, bulk operations
Depends on: Prisma client, validation schemas
Used by: status controller
Last change summary: Fixed method signatures to match controller expectations, added proper error handling



#### Path: /backend/src/modules/apartments/status.controller.ts
Type: source
Purpose: HTTP handlers for status operations
Owned by: backend
Key responsibilities: Handle status change requests, mark as sold, get history, bulk operations
Depends on: status service, validation schemas, auth middleware
Used by: status routes
Last change summary: Fixed circular dependency, added missing prisma import, matched method signatures with service


#### Path: /backend/src/modules/apartments/status.routes.ts
- **Type**: source
- **Purpose**: Route definitions for status management
- **Owned by**: backend
- **Key responsibilities**: Define authenticated routes for status changes, history, and bulk operations
- **Depends on**: status controller, auth middleware, roles middleware
- **Used by**: apartment routes
- **Last change summary**: Created with routes for individual status changes, seller mark-as-sold, and admin bulk operations

### Complexes Module

#### Path: /backend/src/modules/complexes/complex.validators.ts
- **Type**: source
- **Purpose**: Input validation for complex operations
- **Owned by**: backend
- **Key responsibilities**: Validate complex creation, update, query parameters, and admin filters
- **Depends on**: zod library
- **Used by**: complex controller
- **Last change summary**: Added complexFiltersSchema for admin complex filtering

#### Path: /backend/src/modules/complexes/complex.service.ts
- **Type**: source
- **Purpose**: Complex business logic
- **Owned by**: backend
- **Key responsibilities**: CRUD operations, statistics, filtering for complex management
- **Depends on**: database client
- **Used by**: complex controller
- **Last change summary**: Added getComplexStats() and findComplexesWithFilters() methods for admin dashboard

#### Path: /backend/src/modules/complexes/other-apartments.service.ts
- **Type**: source
- **Purpose**: "Other apartments in same complex" business logic
- **Owned by**: backend
- **Key responsibilities**: Find related apartments in same complex, complex statistics
- **Depends on**: database client, apartment data
- **Used by**: complex controller
- **Last change summary**: Created with logic to find other apartments in same complex and complex statistics

#### Path: /backend/src/modules/complexes/complex.controller.ts
Type: source
Purpose: Fixed complex controller to match route method names
Owned by: backend
Key responsibilities: Handle complex CRUD operations, filtering, statistics, and apartment relationships
Depends on: ComplexService, OtherApartmentsService, validation schemas
Used by: complex routes
Last change summary: Unified method names to match routes (getAll, search, getById, etc.), added route-compatible methods, preserved backward compatibility with aliases

#### Path: /backend/src/modules/complexes/complex.routes.ts
Type: source
Purpose: Fixed route definitions to match controller methods
Owned by: backend
Key responsibilities: Define complex API endpoints with proper authentication and role checks
Depends on: complex controller, auth middleware, roles middleware
Used by: app.ts route mounting
Last change summary: Updated method bindings to match unified controller methods


### Analytics Module

#### Path: /backend/src/modules/analytics/analytics.service.ts
- **Type**: source
- **Purpose**: Analytics data aggregation and business logic
- **Owned by**: backend
- **Key responsibilities**: Collect platform statistics, growth metrics, revenue data, performance analytics
- **Depends on**: Prisma client, database schema
- **Used by**: analytics controller
- **Last change summary**: Created with comprehensive analytics methods including platform overview, growth tracking, revenue analysis, and performance metrics

#### Path: /backend/src/modules/analytics/analytics.controller.ts
- **Type**: source
- **Purpose**: HTTP handlers for analytics endpoints
- **Owned by**: backend
- **Key responsibilities**: Handle analytics data requests with validation and error handling
- **Depends on**: analytics service, validation schemas
- **Used by**: analytics routes
- **Last change summary**: Created with endpoints for all analytics data including export functionality

#### Path: /backend/src/modules/analytics/analytics.routes.ts
Type: source

Purpose: Analytics dashboard routes

Owned by: backend

Key responsibilities: Define protected analytics endpoints for admin users

Depends on: analytics controller, auth middleware, roles middleware

Used by: app.ts route mounting

Last change summary: Verified exists and exports correctly as named export



### Users Module

#### Path: /backend/src/modules/users/user.service.ts
- **Type**: source
- **Purpose**: User personalization business logic
- **Owned by**: backend
- **Key responsibilities**: Manage user favorites and saved searches
- **Depends on**: Prisma client
- **Used by**: user controller
- **Last change summary**: Implemented CRUD for favorites and saved searches

#### Path: /backend/src/modules/users/user.controller.ts
- **Type**: source
- **Purpose**: User personalization HTTP handlers
- **Owned by**: backend
- **Key responsibilities**: Handle favorites and saved searches requests
- **Depends on**: user service, auth middleware
- **Used by**: user routes
- **Last change summary**: Implemented favorites and saved searches endpoints

#### Path: /backend/src/modules/users/user.routes.ts
- **Type**: source
- **Purpose**: User-specific feature routes
- **Owned by**: backend
- **Key responsibilities**: Expose favorites and saved searches endpoints
- **Depends on**: auth middleware, user controller
- **Used by**: app.ts
- **Last change summary**: Created routes for favorites and saved searches

---

## Frontend Files

### Core Configuration

#### Path: /frontend/package.json
- **Type**: config
- **Purpose**: Frontend dependencies and scripts
- **Owned by**: frontend
- **Key responsibilities**: Dev/build scripts, dependency management
- **Depends on**: npm, Vite
- **Used by**: Vite, React
- **Last change summary**: Created with React, TypeScript, Vite, Tailwind, and essential libraries

#### Path: /frontend/vite.config.ts
- **Type**: config
- **Purpose**: Vite build configuration
- **Owned by**: frontend
- **Key responsibilities**: Development server, build optimization, proxy configuration
- **Depends on**: Vite, TypeScript
- **Used by**: Vite build system
- **Last change summary**: Created with proxy for backend API (/api → localhost:3000) and uploads

#### Path: /frontend/tsconfig.json
- **Type**: config
- **Purpose**: TypeScript configuration for frontend
- **Owned by**: frontend
- **Key responsibilities**: TypeScript compilation rules, path aliases
- **Depends on**: TypeScript
- **Used by**: TypeScript compiler, IDE
- **Last change summary**: Created with React JSX support, strict mode, and path aliases

#### Path: /frontend/tsconfig.node.json
- **Type**: config
- **Purpose**: TypeScript configuration for Node context
- **Owned by**: frontend
- **Key responsibilities**: Vite configuration TypeScript support
- **Depends on**: TypeScript
- **Used by**: Vite build system
- **Last change summary**: Created for Vite config TypeScript support

#### Path: /frontend/.env.example
- **Type**: config
- **Purpose**: Frontend environment variables example
- **Owned by**: frontend
- **Key responsibilities**: Example configuration for frontend
- **Depends on**: Vite environment variables
- **Used by**: Development setup
- **Last change summary**: Created with API_URL and app configuration

### Styling Configuration

#### Path: /frontend/index.html
- **Type**: source
- **Purpose**: Main HTML entry point
- **Owned by**: frontend
- **Key responsibilities**: HTML structure, meta tags, root div
- **Depends on**: Vite
- **Used by**: Browser
- **Last change summary**: Created with basic structure and meta tags

#### Path: /frontend/tailwind.config.js
- **Type**: config
- **Purpose**: Tailwind CSS configuration
- **Owned by**: frontend
- **Key responsibilities**: Define theme, colors, plugins
- **Depends on**: Tailwind CSS
- **Used by**: PostCSS, build system
- **Last change summary**: Created with custom theme and primary/secondary colors

#### Path: /frontend/postcss.config.js
- **Type**: config
- **Purpose**: PostCSS configuration
- **Owned by**: frontend
- **Key responsibilities**: Process CSS with Tailwind and autoprefixer
- **Depends on**: PostCSS, Tailwind
- **Used by**: Vite build system
- **Last change summary**: Created with Tailwind and autoprefixer plugins

#### Path: /frontend/src/vite-env.d.ts
- **Type**: source
- **Purpose**: Vite type definitions
- **Owned by**: frontend
- **Key responsibilities**: TypeScript support for Vite environment
- **Depends on**: Vite
- **Used by**: TypeScript compiler
- **Last change summary**: Created for Vite client types

#### Path: /frontend/src/index.css
- **Type**: source
- **Purpose**: Global CSS styles
- **Owned by**: frontend
- **Key responsibilities**: Tailwind directives, custom CSS variables, global styles
- **Depends on**: Tailwind CSS
- **Used by**: All components
- **Last change summary**: Created with Tailwind directives and custom theme variables

### Application Entry Points

#### Path: /frontend/src/main.tsx
- **Type**: source
- **Purpose**: App bootstrap
- **Owned by**: frontend
- **Key responsibilities**: Render React app, setup providers (React Query)
- **Depends on**: App.tsx, React DOM
- **Used by**: Browser entry point
- **Last change summary**: Created with React Query client setup and React Strict Mode

#### Path: /frontend/src/App.tsx
- **Type**: source
- **Purpose**: Main application component with routing
- **Owned by**: frontend
- **Key responsibilities**: Define routes, layout structure, global toast notifications
- **Depends on**: react-router-dom, layout components
- **Used by**: main.tsx
- **Last change summary**: Fixed import statements for ComplexList and ComplexForm components (changed from default to named imports)

### API Layer

#### Path: /frontend/src/api/client.ts
- **Type**: source
- **Purpose**: API client wrapper (baseURL, auth header)
- **Owned by**: frontend
- **Key responsibilities**: Centralized API requests with auth token injection and error handling
- **Depends on**: axios, auth store
- **Used by**: All API modules
- **Last change summary**: Created with request/response interceptors for auth headers and token refresh

#### Path: /frontend/src/api/auth.ts
- **Type**: source
- **Purpose**: Authentication API functions
- **Owned by**: frontend
- **Key responsibilities**: Typed API calls for login, register, profile
- **Depends on**: api client
- **Used by**: auth store, auth pages
- **Last change summary**: Created with TypeScript interfaces for all auth API responses

#### Path: /frontend/src/api/apartments.ts
- **Type**: source
- **Purpose**: Apartment and complex API functions
- **Owned by**: frontend
- **Key responsibilities**: Typed API calls for apartments, complexes, filtering, and search
- **Depends on**: api client
- **Used by**: Apartment pages, components
- **Last change summary**: Enhanced to support filtered complex queries and statistics

#### Path: /frontend/src/api/status.ts
- **Type**: source
- **Purpose**: Status management API functions
- **Owned by**: frontend
- **Key responsibilities**: Interface with backend status endpoints
- **Depends on**: api client
- **Used by**: AdminApartments, StatusChangeModal, BulkOperations
- **Last change summary**: Created with all status operations including bulk changes

#### Path: /frontend/src/api/users.ts
- **Type**: source
- **Purpose**: User-related API functions
- **Owned by**: frontend
- **Key responsibilities**: Interact with favorites and saved searches backend endpoints
- **Depends on**: api client
- **Used by**: User dashboard, apartment pages
- **Last change summary**: Created with favorites and saved searches API calls

### State Management

#### Path: /frontend/src/stores/authStore.ts
- **Type**: source
- **Purpose**: Authentication state management
- **Owned by**: frontend
- **Key responsibilities**: Manage user authentication state, token storage, API integration
- **Depends on**: auth API, localStorage
- **Used by**: Header, protected routes, auth pages
- **Last change summary**: Enhanced with API actions (loginUser, registerUser, fetchProfile), loading states, and error handling

### Utilities

#### Path: /frontend/src/utils/validation.ts
- **Type**: source
- **Purpose**: Form validation schemas
- **Owned by**: frontend
- **Key responsibilities**: Validate login and register inputs using Zod
- **Depends on**: zod library
- **Used by**: Auth pages, forms
- **Last change summary**: Created with loginSchema and registerSchema with password validation rules

#### Path: /frontend/src/utils/cn.ts
- **Type**: source
- **Purpose**: Class name utility function
- **Owned by**: frontend
- **Key responsibilities**: Merge Tailwind CSS classes conditionally
- **Depends on**: clsx, tailwind-merge
- **Used by**: All UI components
- **Last change summary**: Created for consistent class name merging

### Layout Components

#### Path: /frontend/src/components/layout/Layout.tsx
- **Type**: source
- **Purpose**: Main layout wrapper
- **Owned by**: frontend
- **Key responsibilities**: Provide consistent layout with header and footer
- **Depends on**: Header, Footer, react-router
- **Used by**: App.tsx
- **Last change summary**: Added Footer component to layout structure

#### Path: /frontend/src/components/layout/Header.tsx
- **Type**: source
- **Purpose**: Site header with navigation
- **Owned by**: frontend
- **Key responsibilities**: Logo, navigation links, auth status display
- **Depends on**: auth store, react-router
- **Used by**: Layout.tsx
- **Last change summary**: Fixed file extension (.ts to .tsx) and added missing React import

#### Path: /frontend/src/components/layout/Footer.tsx
- **Type**: source
- **Purpose**: Site footer component
- **Owned by**: frontend
- **Key responsibilities**: Display footer with links, contact info, and newsletter
- **Depends on**: layout
- **Used by**: Layout.tsx
- **Last change summary**: Created with responsive grid, social links, and contact information

### Auth Components

#### Path: /frontend/src/components/auth/ProtectedRoute.tsx
- **Type**: source
- **Purpose**: Route protection component
- **Owned by**: frontend
- **Key responsibilities**: Protect routes based on authentication and roles
- **Depends on**: react-router, auth store
- **Used by**: App.tsx routing
- **Last change summary**: Created with authentication check and optional role-based access control

#### Path: /frontend/src/components/auth/AuthForm.tsx
- **Type**: source
- **Purpose**: Reusable authentication form components
- **Owned by**: frontend
- **Key responsibilities**: Provide consistent auth form layout, error display, loading states
- **Depends on**: auth store
- **Used by**: LoginPage, RegisterPage
- **Last change summary**: Created with FormInput component and shared auth form layout

### Apartment Components

#### Path: /frontend/src/components/apartments/ApartmentCard.tsx
- **Type**: source
- **Purpose**: Apartment listing card component
- **Owned by**: frontend
- **Key responsibilities**: Display apartment preview with image, price, specs, and status
- **Depends on**: apartment API types
- **Used by**: ApartmentsPage
- **Last change summary**: Added favorite toggle integration

#### Path: /frontend/src/components/apartments/ApartmentFilters.tsx
- **Type**: source
- **Purpose**: Apartment filtering component
- **Owned by**: frontend
- **Key responsibilities**: Provide advanced filtering UI for apartments
- **Depends on**: apartment API, complexes data
- **Used by**: ApartmentsPage
- **Last change summary**: Created with price range, rooms, area, complex, developer, and sort options

#### Path: /frontend/src/components/apartments/ApartmentGallery.tsx
- **Type**: source
- **Purpose**: Apartment image gallery component
- **Owned by**: frontend
- **Key responsibilities**: Display apartment images with carousel and fullscreen view
- **Depends on**: apartment images data
- **Used by**: ApartmentDetailPage
- **Last change summary**: Created with thumbnail navigation, fullscreen modal, and image counter

### UI Components

#### Path: /frontend/src/components/ui/Button.tsx
- **Type**: source
- **Purpose**: Reusable button component with variants
- **Owned by**: frontend
- **Key responsibilities**: Provide consistent button styling across app
- **Depends on**: Tailwind CSS
- **Used by**: All components
- **Last change summary**: Created with multiple variants and sizes

#### Path: /frontend/src/components/ui/Input.tsx
- **Type**: source
- **Purpose**: Input component with icons and error handling
- **Owned by**: frontend
- **Key responsibilities**: Text input with left/right icons, labels, validation
- **Depends on**: cn utility
- **Used by**: AdminApartments, forms throughout app
- **Last change summary**: Created with icon support and error display

#### Path: /frontend/src/components/ui/Select.tsx
- **Type**: source
- **Purpose**: Reusable select dropdown component
- **Owned by**: frontend
- **Key responsibilities**: Render select with options, handle onChange, show errors
- **Depends on**: cn utility
- **Used by**: AdminApartments, StatusChangeModal, forms
- **Last change summary**: Created with label support and error display

#### Path: /frontend/src/components/ui/Textarea.tsx
- **Type**: source
- **Purpose**: Reusable textarea component
- **Owned by**: frontend
- **Key responsibilities**: Multi-line text input with label and error handling
- **Depends on**: cn utility
- **Used by**: StatusChangeModal, forms
- **Last change summary**: Created with label and error support

#### Path: /frontend/src/components/ui/Badge.tsx
- **Type**: source
- **Purpose**: Status badge component with variants
- **Owned by**: frontend
- **Key responsibilities**: Display status with appropriate colors
- **Depends on**: cn utility
- **Used by**: AdminApartments, apartment listings
- **Last change summary**: Created with variant support (default, success, destructive, secondary, outline)

#### Path: /frontend/src/components/ui/Modal.tsx
- **Type**: source
- **Purpose**: Reusable modal dialog component
- **Owned by**: frontend
- **Key responsibilities**: Modal overlay, escape key handling, focus management
- **Depends on**: React DOM, Tailwind CSS
- **Used by**: StatusChangeModal, BulkOperations
- **Last change summary**: Created with overlay click handling and escape key support

#### Path: /frontend/src/components/ui/ImageUpload.tsx
- **Type**: source
- **Purpose**: Drag-and-drop image upload with preview and reordering
- **Owned by**: frontend
- **Key responsibilities**: Handle image uploads with visual feedback
- **Depends on**: react-dropzone, @dnd-kit for drag-and-drop
- **Used by**: ApartmentForm
- **Last change summary**: Created with drag-and-drop, preview, and sortable functionality

#### Path: /frontend/src/components/ui/MultiLanguageInput.tsx
- **Type**: source
- **Purpose**: Input component for multi-language content
- **Owned by**: frontend
- **Key responsibilities**: Handle inputs in multiple languages with tab switching
- **Depends on**: Input, Textarea components
- **Used by**: ApartmentForm
- **Last change summary**: Created with language tabs and preview display

#### Path: /frontend/src/components/ui/Card.tsx
- **Type**: source
- **Purpose**: Reusable card component for dashboard
- **Owned by**: frontend
- **Key responsibilities**: Provide consistent card styling for dashboard components
- **Depends on**: cn utility
- **Used by**: AnalyticsDashboard and other dashboard components
- **Last change summary**: Fixed import path for cn utility from "../../../utils/cn" to "../../utils/cn"

### Feature Components

#### Path: /frontend/src/components/favorites/FavoriteButton.tsx
- **Type**: source
- **Purpose**: Favorite toggle UI
- **Owned by**: frontend
- **Key responsibilities**: Add/remove apartment from favorites
- **Depends on**: users API, auth store
- **Used by**: ApartmentCard, FavoritesPage
- **Last change summary**: Created reusable favorite toggle component

#### Path: /frontend/src/components/search/SaveSearchModal.tsx
- **Type**: source
- **Purpose**: Save apartment search UI
- **Owned by**: frontend
- **Key responsibilities**: Collect and persist saved search filters
- **Depends on**: users API, Modal component
- **Used by**: ApartmentsPage
- **Last change summary**: Created modal for saving searches

### Pages

#### Path: /frontend/src/pages/HomePage.tsx
- **Type**: source
- **Purpose**: Home page
- **Owned by**: frontend
- **Key responsibilities**: Welcome users, provide entry point to app
- **Depends on**: layout
- **Used by**: App routing
- **Last change summary**: Created as placeholder with welcome message

#### Path: /frontend/src/pages/auth/LoginPage.tsx
- **Type**: source
  - **Purpose**: User login page
- **Owned by**: frontend
- **Key responsibilities**: Handle user login with validation and error handling
- **Depends on**: auth store, validation, AuthForm component
- **Used by**: App routing
- **Last change summary**: Created with react-hook-form integration, redirect logic, and remember me option

#### Path: /frontend/src/pages/auth/RegisterPage.tsx
- **Type**: source
- **Purpose**: User registration page
- **Owned by**: frontend
- **Key responsibilities**: Handle user registration with password validation
- **Depends on**: auth store, validation, AuthForm component
- **Used by**: App routing
- **Last change summary**: Created with password requirements display and terms agreement

#### Path: /frontend/src/pages/apartments/ApartmentsPage.tsx
- **Type**: source
- **Purpose**: Apartment listing and browsing page
- **Owned by**: frontend
- **Key responsibilities**: Display paginated apartments with filtering and search
- **Depends on**: apartment API, ApartmentCard, ApartmentFilters
- **Used by**: App routing
- **Last change summary**: Added save search functionality

#### Path: /frontend/src/pages/apartments/ApartmentDetailPage.tsx
- **Type**: source
- **Purpose**: Apartment detail view page
- **Owned by**: frontend
- **Key responsibilities**: Show detailed apartment information with tabs
- **Depends on**: apartment API, ApartmentGallery
- **Used by**: App routing
- **Last change summary**: Created with multi-language support, installment calculator, and related apartments

#### Path: /frontend/src/pages/ComplexesPage.tsx
- **Type**: source
- **Purpose**: Complexes listing page
- **Owned by**: frontend
- **Key responsibilities**: Placeholder for future complexes browsing
- **Depends on**: layout
- **Used by**: App routing
- **Last change summary**: Created as placeholder for complexes page implementation

#### Path: /frontend/src/pages/NotFoundPage.tsx
- **Type**: source
- **Purpose**: 404 error page
- **Owned by**: frontend
- **Key responsibilities**: Handle undefined routes
- **Depends on**: layout
- **Used by**: App routing
- **Last change summary**: Created with 404 message and home link

### Dashboard Pages

#### Path: /frontend/src/pages/dashboard/DashboardLayout.tsx
- **Type**: source
- **Purpose**: Dashboard layout with role-based sidebar
- **Owned by**: frontend
- **Key responsibilities**: Provide dashboard layout with navigation filtered by user role
- **Depends on**: auth store, user role
- **Used by**: DashboardPage
- **Last change summary**: Added "Complexes" and "Analytics" menu items to admin navigation

#### Path: /frontend/src/pages/dashboard/DashboardPage.tsx
- **Type**: source
- **Purpose**: Main dashboard page router
- **Owned by**: frontend
- **Key responsibilities**: Route users to appropriate dashboard based on role
- **Depends on**: auth store, all dashboard components
- **Used by**: App routing (protected)
- **Last change summary**: Simplified from 123 lines to 30 lines; removed duplicate code; improved role-based routing

#### Path: /frontend/src/pages/dashboard/UserDashboard.tsx
- **Type**: source
- **Purpose**: USER role dashboard
- **Owned by**: frontend
- **Key responsibilities**: Display user-specific features (favorites, saved searches, notifications)
- **Depends on**: auth store
- **Used by**: DashboardPage (for USER role)
- **Last change summary**: Replaced mock data with real favorites and saved searches

#### Path: /frontend/src/pages/dashboard/SellerDashboard.tsx
- **Type**: source
- **Purpose**: SELLER role dashboard
- **Owned by**: frontend
- **Key responsibilities**: Apartment listing management and seller analytics
- **Depends on**: auth store
- **Used by**: DashboardPage (for SELLER role)
- **Last change summary**: Updated to include apartment management routes

#### Path: /frontend/src/pages/dashboard/AdminDashboard.tsx
- **Type**: source
- **Purpose**: ADMIN role dashboard
- **Owned by**: frontend
- **Key responsibilities**: Content moderation and platform management
- **Depends on**: auth store
- **Used by**: DashboardPage (for ADMIN role)
- **Last change summary**: Completely redesigned with real moderation UI, statistics, and tabbed interface; replaced mock data with real API calls

#### Path: /frontend/src/pages/dashboard/ManagerDashboard.tsx
- **Type**: source
- **Purpose**: MANAGER_ADMIN role dashboard
- **Owned by**: frontend
- **Key responsibilities**: Admin management and platform oversight
- **Depends on**: auth store
- **Used by**: DashboardPage (for MANAGER_ADMIN role)
- **Last change summary**: Created with admin account management, performance monitoring, and manager tools

#### Path: /frontend/src/pages/dashboard/OwnerDashboard.tsx
- **Type**: source
- **Purpose**: OWNER_ADMIN role dashboard
- **Owned by**: frontend
- **Key responsibilities**: Complete system oversight and management
- **Depends on**: auth store
- **Used by**: DashboardPage (for OWNER_ADMIN role)
- **Last change summary**: Created with system-wide analytics, user management, and owner-level tools

### Admin Dashboard Pages

#### Path: /frontend/src/pages/dashboard/admin/AdminApartments.tsx
- **Type**: source
- **Purpose**: Main admin apartment moderation interface
- **Owned by**: frontend
- **Key responsibilities**: List, filter, search apartments; manage status changes; bulk operations
- **Depends on**: apartments API, status API, React Query, UI components
- **Used by**: AdminDashboard
- **Last change summary**: Created with complete moderation functionality including filtering, search, and bulk operations

#### Path: /frontend/src/pages/dashboard/admin/StatusChangeModal.tsx
- **Type**: source
- **Purpose**: Modal for changing apartment status
- **Owned by**: frontend
- **Key responsibilities**: Show status options, collect reason, confirm changes
- **Depends on**: Modal component, status API
- **Used by**: AdminApartments
- **Last change summary**: Created with status transition validation and reason logging

#### Path: /frontend/src/pages/dashboard/admin/BulkOperations.tsx
- **Type**: source
- **Purpose**: Handle bulk status operations on multiple apartments
- **Owned by**: frontend
- **Key responsibilities**: Bulk hide/unhide operations with confirmation
- **Depends on**: Modal component, status API
- **Used by**: AdminApartments
- **Last change summary**: Created with bulk operation confirmation and error handling

#### Path: /frontend/src/pages/dashboard/admin/ComplexList.tsx
- **Type**: source
- **Purpose**: Admin complex management listing interface
- **Owned by**: frontend
- **Key responsibilities**: Display complexes with filtering, sorting, search, and bulk operations
- **Depends on**: complexes API, UI components, React Query
- **Used by**: Admin dashboard routing
- **Last change summary**: Created comprehensive complex management UI with statistics, filtering, and bulk operations

#### Path: /frontend/src/pages/dashboard/admin/ComplexForm.tsx
- **Type**: source
- **Purpose**: Form for creating/editing complexes
- **Owned by**: frontend
- **Key responsibilities**: Handle complex creation and editing with image upload
- **Depends on**: complexes API, form validation, image upload handling
- **Used by**: Admin dashboard routing
- **Last change summary**: Created with image upload, form validation, and edit/update functionality

#### Path: /frontend/src/pages/dashboard/admin/AnalyticsDashboard.tsx
- **Type**: source
- **Purpose**: Comprehensive analytics dashboard interface
- **Owned by**: frontend
- **Key responsibilities**: Display platform analytics with charts, tables, and filters
- **Depends on**: analytics API, Recharts, UI components
- **Used by**: Admin dashboard routing
- **Last change summary**: Created with multiple chart visualizations, overview cards, and data export functionality

### Seller Dashboard Pages

#### Path: /frontend/src/pages/dashboard/seller/ApartmentList.tsx
- **Type**: source
- **Purpose**: Display and manage seller's apartment listings
- **Owned by**: frontend
- **Key responsibilities**: List seller apartments with CRUD operations
- **Depends on**: apartment API, auth store
- **Used by**: SellerDashboard
- **Last change summary**: Created with listing display, delete functionality, and navigation

#### Path: /frontend/src/pages/dashboard/seller/ApartmentForm.tsx
- **Type**: source
- **Purpose**: Form for creating/editing apartment listings
- **Owned by**: frontend
- **Key responsibilities**: Handle apartment data entry with validation
- **Depends on**: apartment API, complex API, validation schemas
- **Used by**: SellerDashboard
- **Last change summary**: Created with multi-language inputs, image upload, and form validation

#### Path: /frontend/src/pages/dashboard/user/FavoritesPage.tsx
- **Type**: source
- **Purpose**: Favorites listing page
- **Owned by**: frontend
- **Key responsibilities**: Display user's saved apartments
- **Depends on**: users API, ApartmentCard
- **Used by**: UserDashboard routing
- **Last change summary**: Created favorites page with real API data

---

## Mobile (Future)

### Path: /mobile/*
- **Type**: source
- **Purpose**: React Native (Expo) app consuming same backend API
- **Owned by**: mobile
- **Key responsibilities**: Android+iOS UI only
- **Depends on**: backend API contract
- **Used by**: Devices
- **Last change summary**: Planned

---

## Summary

Total files documented: 103 files
- Root: 7 files
- Backend: 39 files
- Frontend: 57 files
- Mobile: 1 file (planned)

All files now follow consistent formatting with:
- Bold field names
- Consistent indentation
- Alphabetical sorting within sections
- Clear section organization
- Standardized last change summaries