/*
  Warnings:

  - You are about to drop the column `cityId` on the `Store` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_cityId_fkey";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "cityId",
ADD COLUMN     "city_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
