/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phoneNumber` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_phoneNumber_key" ON "UserProfile"("phoneNumber");
