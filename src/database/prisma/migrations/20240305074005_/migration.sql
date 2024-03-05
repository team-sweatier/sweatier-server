/*
  Warnings:

  - You are about to drop the `_likerMatches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_participantMatches` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gender` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Gender" ADD VALUE 'both';

-- DropForeignKey
ALTER TABLE "_likerMatches" DROP CONSTRAINT "_likerMatches_A_fkey";

-- DropForeignKey
ALTER TABLE "_likerMatches" DROP CONSTRAINT "_likerMatches_B_fkey";

-- DropForeignKey
ALTER TABLE "_participantMatches" DROP CONSTRAINT "_participantMatches_A_fkey";

-- DropForeignKey
ALTER TABLE "_participantMatches" DROP CONSTRAINT "_participantMatches_B_fkey";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "gender" "Gender" NOT NULL;

-- DropTable
DROP TABLE "_likerMatches";

-- DropTable
DROP TABLE "_participantMatches";

-- CreateTable
CREATE TABLE "_participantMatch" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_likerSportsType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_participantMatch_AB_unique" ON "_participantMatch"("A", "B");

-- CreateIndex
CREATE INDEX "_participantMatch_B_index" ON "_participantMatch"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_likerSportsType_AB_unique" ON "_likerSportsType"("A", "B");

-- CreateIndex
CREATE INDEX "_likerSportsType_B_index" ON "_likerSportsType"("B");

-- AddForeignKey
ALTER TABLE "_participantMatch" ADD CONSTRAINT "_participantMatch_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participantMatch" ADD CONSTRAINT "_participantMatch_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likerSportsType" ADD CONSTRAINT "_likerSportsType_A_fkey" FOREIGN KEY ("A") REFERENCES "SportsType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likerSportsType" ADD CONSTRAINT "_likerSportsType_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
