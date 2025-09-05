-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "coldType" VARCHAR(200);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_lunchTypeId_fkey" FOREIGN KEY ("lunchTypeId") REFERENCES "LunchType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
