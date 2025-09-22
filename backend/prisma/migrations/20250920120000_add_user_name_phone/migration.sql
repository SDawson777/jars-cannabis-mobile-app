-- Add nullable name and phone columns to User
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "name" TEXT;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "phone" TEXT;
