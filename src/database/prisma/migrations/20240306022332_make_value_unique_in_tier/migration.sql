/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `Tier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tier_value_key" ON "Tier"("value");
