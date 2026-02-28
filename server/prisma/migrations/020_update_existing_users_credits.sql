-- Update existing users from 10 to 20 credits
ALTER TABLE "User" ALTER COLUMN "credits" SET DEFAULT 20;
