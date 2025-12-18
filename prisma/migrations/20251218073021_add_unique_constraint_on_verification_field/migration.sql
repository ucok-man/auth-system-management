/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `Verification` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Verification_value_key" ON "Verification"("value");
