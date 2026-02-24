# Admin Login

Admin credentials are not hardcoded in this project anymore.

Use one of these flows:

1. Create admin users from backend admin panel.
2. Seed users with explicit secure password:
   - Set account values in backend env:
     - `OWNER_ADMIN_EMAIL`, `OWNER_ADMIN_PASSWORD`
     - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
     - `MANAGER_ADMIN_EMAIL`, `MANAGER_ADMIN_PASSWORD`
     - `SELLER_EMAIL`, `SELLER_PASSWORD`
   - (Production only) also set `ALLOW_PRODUCTION_SEED=true`.
   - Run `npm run db:seed` in `backend`.

After first login, rotate passwords to unique values per account.
