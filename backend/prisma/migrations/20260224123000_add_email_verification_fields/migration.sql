-- Add email verification fields
ALTER TABLE "User" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "email_verified_at" DATETIME;
ALTER TABLE "User" ADD COLUMN "email_verification_token" TEXT;
ALTER TABLE "User" ADD COLUMN "email_verification_expires_at" DATETIME;

-- Index token lookup for verification endpoint
CREATE INDEX "User_email_verification_token_idx" ON "User"("email_verification_token");
