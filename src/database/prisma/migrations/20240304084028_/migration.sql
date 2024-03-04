/*
  Warnings:

  - Added the required column `rankId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportsTypeId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "currentApplicants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rankId" TEXT NOT NULL,
ADD COLUMN     "sportsTypeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "img" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sportsTypeId_fkey" FOREIGN KEY ("sportsTypeId") REFERENCES "SportsType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
