-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_city_id_fkey";

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "city_id" SET DATA TYPE TEXT;
