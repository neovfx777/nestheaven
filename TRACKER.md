# Tracker

## Rules
- Keep items short.
- Move items only between sections (do not duplicate).
- When AI suggests work, it must also say what to move here.

-------



## IN PROGRESS

check seller dashboard and add functionalties

--------


## TODO

### Web MVP

create the listing creation page and tune the functions

test if the listings are appearing in the home page correctly

test if the listinngs are showing up inside the complex 

create and test the search function of  listings ,   (for all users or admins )









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
- Seed default users: owner admin, manager admin, admin, seller, user
- Implement RBAC middleware (roles)
- Implement Apartments CRUD (seller-owned)
- Implement listing status actions (active/hidden/sold)
- Implement admin moderation endpoint (hide/unhide)
- Implement Complex CRUD (lightweight grouper)
- Implement "other apartments in same complex" endpoint
- Implement multi-language fields handling
- Setup React app skeleton
- Auth screens + token handling- Apartment browse + detail
- Role-based navigation (user/seller/admin/manager/owner)
- Seller listing create/edit + upload images
- Admin moderation UI (hide/unhide)
- User favorites/saved searches UI
- Complex management UI for admins
- Advanced analytics dashboard 
- user_management in owner admin is working good <<<in owner account >>>
