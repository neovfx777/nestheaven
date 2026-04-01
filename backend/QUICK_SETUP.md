# Quick Setup Guide for NestHeaven Backend

## Option 1: Use Docker (Recommended)

1. Install Docker Desktop
2. Run this command in the backend directory:
```bash
docker-compose up -d
```

## Option 2: Local (SQLite - default)

1. Copy the env template:
```bash
cp .env.example .env
```

2. Update the `JWT_SECRET` in `.env`.

3. (Optional) SQLite location:
```env
DATABASE_URL="file:./prisma/dev.db"
```

## After Database Setup

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Run migrations:
```bash
npx prisma db push
# or: npx prisma migrate dev
```

4. Seed the database:
```bash
npx prisma db seed
```

5. Start the server:
```bash
npm run dev
```

## Test Login

Create credentials through seed with an explicit secret:
- Set account env values in backend `.env`:
  - `OWNER_ADMIN_EMAIL`, `OWNER_ADMIN_PASSWORD`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - `MANAGER_ADMIN_EMAIL`, `MANAGER_ADMIN_PASSWORD`
  - `SELLER_EMAIL`, `SELLER_PASSWORD`
- Run `npx prisma db seed`
- Login with configured emails/passwords from env

The server will run on http://localhost:3000
