/*
  Warnings:

  - You are about to drop the column `sportsTypeId` on the `Rating` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_sportsTypeId_fkey";

-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "sportsTypeId";
