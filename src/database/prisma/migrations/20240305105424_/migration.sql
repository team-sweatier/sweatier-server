/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - Added the required column `accountNumber` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "accountNumber",
DROP COLUMN "phoneNumber";

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "accountNumber" TEXT NOT NULL;
