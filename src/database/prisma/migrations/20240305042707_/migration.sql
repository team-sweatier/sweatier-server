/*
  Warnings:

  - You are about to drop the column `currentApplicants` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `rankId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `rankId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Rank` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `expired` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tierId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tierId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_rankId_fkey";

-- DropForeignKey
ALTER TABLE "Rank" DROP CONSTRAINT "Rank_sportsTypeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_rankId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "currentApplicants",
DROP COLUMN "rankId",
ADD COLUMN     "applicants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expired" BOOLEAN NOT NULL,
ADD COLUMN     "tierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "rankId",
ADD COLUMN     "tierId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Rank";

-- CreateTable
CREATE TABLE "Tier" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sportsTypeId" TEXT NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tier" ADD CONSTRAINT "Tier_sportsTypeId_fkey" FOREIGN KEY ("sportsTypeId") REFERENCES "SportsType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
