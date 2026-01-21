# Tracker

## Rules
- Keep items short.
- Move items only between sections (do not duplicate).
- When AI suggests work, it must also say what to move here.

-------



## IN PROGRESS

- Seed default users: owner admin, manager admin, admin, seller, user

--------


## TODO

### Backend MVP



- Implement RBAC middleware (roles)
- Implement Apartments CRUD (seller-owned)
- Implement listing status actions (active/hidden/sold)
- Implement admin moderation endpoint (hide/unhide)
- Implement Complex CRUD (lightweight grouper)
- Implement "other apartments in same complex" endpoint
- Implement multi-language fields handling

### Web MVP
- Setup React app skeleton
- Auth screens + token handling
- Apartment browse + detail
- Role-based navigation (user/seller/admin/manager/owner)
- Seller listing create/edit + upload images
- Admin moderation UI (hide/unhide)

### Mobile Later
- Create Expo project
- Mirror key flows from web
- Ensure API parity

--------
## DONE
- Defined product rules: complex grouper, apartment main item
- Defined roles: user/seller/admin/manager/owner
- Defined listing statuses: active/hidden/sold
- Defined multi-language requirement: uz/ru/en
- Established docs protocol (Action Report + File Info updates required)
- Initialized monorepo root structure (backend/, frontend/, docs/)
- Added .gitignore and .env.example
- Created DEVELOPMENT_PLAN.md (using SERVICE_DOC rules)
- Setup Express app/server skeleton
- Setup DB connection + Prisma schema
- Implement Auth (USER register/login)