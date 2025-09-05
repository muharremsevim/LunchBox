/*
  Warnings:

  - You are about to drop the column `orderId` on the `Parameter` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Parameter" DROP CONSTRAINT "Parameter_orderId_fkey";

-- AlterTable
ALTER TABLE "Parameter" DROP COLUMN "orderId";
