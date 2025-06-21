/*
  Warnings:

  - You are about to drop the column `creatorId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "creatorId",
ADD COLUMN     "isPendingVerification" BOOLEAN NOT NULL DEFAULT true;
