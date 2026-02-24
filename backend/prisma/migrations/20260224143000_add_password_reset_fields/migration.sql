-- Add password reset fields
ALTER TABLE "User" ADD COLUMN "password_reset_token" TEXT;
ALTER TABLE "User" ADD COLUMN "password_reset_expires_at" DATETIME;

-- Index token lookup for password reset endpoint
CREATE INDEX "User_password_reset_token_idx" ON "User"("password_reset_token");
