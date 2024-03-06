/*
  Warnings:

  - A unique constraint covering the columns `[value,sportsTypeId]` on the table `Tier` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tier_value_sportsTypeId_key" ON "Tier"("value", "sportsTypeId");
