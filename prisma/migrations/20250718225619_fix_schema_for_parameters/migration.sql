/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Parameter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Parameter_key_key" ON "Parameter"("key");
