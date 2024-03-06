/*
  Warnings:

  - The primary key for the `SportsType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `SportsType` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `sportsTypeId` on the `Match` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sportsTypeId` on the `Score` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sportsTypeId` on the `Tier` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `bankName` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `A` on the `_likerSportsType` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_sportsTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_sportsTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Tier" DROP CONSTRAINT "Tier_sportsTypeId_fkey";

-- DropForeignKey
ALTER TABLE "_likerSportsType" DROP CONSTRAINT "_likerSportsType_A_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "sportsTypeId",
ADD COLUMN     "sportsTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "sportsTypeId",
ADD COLUMN     "sportsTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SportsType" DROP CONSTRAINT "SportsType_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "SportsType_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Tier" ALTER COLUMN "value" SET DEFAULT 'beginner',
DROP COLUMN "sportsTypeId",
ADD COLUMN     "sportsTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "bankName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "_likerSportsType" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_likerSportsType_AB_unique" ON "_likerSportsType"("A", "B");

-- AddForeignKey
ALTER TABLE "Tier" ADD CONSTRAINT "Tier_sportsTypeId_fkey" FOREIGN KEY ("sportsTypeId") REFERENCES "SportsType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_sportsTypeId_fkey" FOREIGN KEY ("sportsTypeId") REFERENCES "SportsType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_sportsTypeId_fkey" FOREIGN KEY ("sportsTypeId") REFERENCES "SportsType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likerSportsType" ADD CONSTRAINT "_likerSportsType_A_fkey" FOREIGN KEY ("A") REFERENCES "SportsType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
