/*
  Warnings:

  - Made the column `credits` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "credits" SET NOT NULL,
ALTER COLUMN "credits" SET DEFAULT 20;
