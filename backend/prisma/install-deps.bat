@echo off
echo Installing all required dependencies...
echo.

echo 1. Installing runtime dependencies...
call npm install @prisma/client bcrypt cors dotenv express jsonwebtoken multer zod

echo 2. Installing TypeScript types...
call npm install --save-dev @types/bcrypt @types/cors @types/express @types/jsonwebtoken @types/multer @types/node

echo 3. Installing development tools...
call npm install --save-dev prisma tsx typescript

echo.
echo ✅ Dependencies installed!
echo.
echo Now run:
echo   npx prisma generate
echo   npm run seed
echo   npm run dev