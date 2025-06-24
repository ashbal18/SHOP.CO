-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "poinId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_poinId_fkey" FOREIGN KEY ("poinId") REFERENCES "Poin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
