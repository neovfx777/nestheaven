# Quick Setup Guide for NestHeaven Backend

## Option 1: Use Docker (Recommended)

1. Install Docker Desktop
2. Run this command in the backend directory:
```bash
docker-compose up -d
```

## Option 2: Manual PostgreSQL Setup

1. Install PostgreSQL on your system
2. Create a database:
```sql
CREATE DATABASE good_home;
```

3. Update the .env file with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/good_home?schema=public"
```

## Option 3: Use Neon (Cloud PostgreSQL - Free)

1. Go to https://neon.tech
2. Create a free account and database
3. Copy the connection string
4. Update your .env file:
```env
DATABASE_URL="your_neon_connection_string"
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
npx prisma migrate dev --name init
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
