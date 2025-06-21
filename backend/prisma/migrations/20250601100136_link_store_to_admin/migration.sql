/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "adminId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Store_adminId_key" ON "Store"("adminId");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
