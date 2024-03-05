/*
  Warnings:

  - You are about to drop the column `applicants` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "applicants";

-- CreateTable
CREATE TABLE "_participantMatches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_participantMatches_AB_unique" ON "_participantMatches"("A", "B");

-- CreateIndex
CREATE INDEX "_participantMatches_B_index" ON "_participantMatches"("B");

-- AddForeignKey
ALTER TABLE "_participantMatches" ADD CONSTRAINT "_participantMatches_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_participantMatches" ADD CONSTRAINT "_participantMatches_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
