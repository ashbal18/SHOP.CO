/*
  Warnings:

  - You are about to drop the column `city_id` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `province_id` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "city_id",
DROP COLUMN "province_id";
