# Service Documentation

## Project Summary
A real-estate platform for **newly built apartments only**.

- **Apartment Listing** is the only “item” shown everywhere (home, featured, search, etc.).
- **Complex** is a lightweight **grouping container** (name + image) used only to relate apartments and enable “other apartments in this project”.
- Backend is **API-first** and device-agnostic (Web first, Mobile later uses same API).

## Platforms
- Stage 1: Backend (REST API)
- Stage 2: Web app (frontend client)
- Stage 3: Mobile apps (Android + iOS) using same API

## Roles & Permissions
Roles:
- USER (buyer) — can self-register.
- SELLER — cannot self-register; created only by OWNER_ADMIN.
- ADMIN (regular) — moderation; can hide listings.
- MANAGER_ADMIN — can create/manage regular admins; created only by OWNER_ADMIN.
- OWNER_ADMIN — super admin; can create manager admins and sellers.

Role creation rules:
- USER: self-register
- SELLER: OWNER_ADMIN only
- ADMIN: OWNER_ADMIN or MANAGER_ADMIN
- MANAGER_ADMIN: OWNER_ADMIN only
- OWNER_ADMIN: exists by default (seed)

## Listing Lifecycle States
Apartment listing status:
- `active`
- `hidden`
- `sold`

Visibility rules:
- USER sees: active + sold (sold marked), but not hidden
- ADMIN can set hidden/active
- SELLER can mark their own listing sold (and update own listing)
- OWNER_ADMIN can do all

## Multi-language
Multi-language content: `uz`, `ru`, `en`.
Translatable fields (minimum):
- apartment title
- apartment description
- materials (if text)
- infrastructure (if text)
(You can expand later.)

## Data Model Overview

### Complex (group-only)
- id
- name
- image (cover)

### Apartment Listing (main item)
- id
- complexId (nullable but recommended; used for grouping)
- status (active/hidden/sold)
- price, rooms, area, floor
- developer (entity name or reference)
- location: address + lat/lng
- description (multi-language)
- materials (multi-language or structured)
- airQualityIndex (numeric + optional source note)
- infrastructure (structured booleans/distances + optional multi-language note)
- investmentGrowthPercent (numeric + optional note)
- contactInfo (phone, telegram/whatsapp, email)
- images (list)
- installment options (bankName, years, interest, downPayment, etc.)
- timestamps (createdAt, updatedAt)

## API Modules (Conceptual)
- Auth (JWT)
- Users
- Admin Management (owner/manager/admin creation & control)
- Complexes (group list/create/edit)
- Apartments (CRUD + status + filtering + grouping)
- Media (upload images, serve URLs)
- Utilities (installment calc endpoints)

## Non-UI Requirement
Backend must not assume any homepage layout (featured/most sold/etc). Frontend decides presentation.
Backend only provides:
- endpoints to list apartments with sorting/filtering
- optional flags (e.g., `isFeatured` only if you explicitly decide later)

## Hard Rule: Documentation + Action Log Protocol
Whenever AI proposes or provides:
- creating/editing/deleting files
- adding/removing functions or modules
- changing folder structure
it MUST also output:
1) what to append to `ACTION_REPORT.md`
2) what entries to update/add in `FILE_INFO_DB.md`
3) tracker movement in `TRACKER.md` (todo → in-progress → done)

If AI does not provide these 3 outputs, you should reply:
> “Provide Action Report + File Info DB updates for your changes.”

That is a mandatory workflow rule for this project.
