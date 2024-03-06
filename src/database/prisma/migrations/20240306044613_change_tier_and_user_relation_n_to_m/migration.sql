/*
  Warnings:

  - You are about to drop the column `tierId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tierId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "tierId";

-- CreateTable
CREATE TABLE "_userTier" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userTier_AB_unique" ON "_userTier"("A", "B");

-- CreateIndex
CREATE INDEX "_userTier_B_index" ON "_userTier"("B");

-- AddForeignKey
ALTER TABLE "_userTier" ADD CONSTRAINT "_userTier_A_fkey" FOREIGN KEY ("A") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userTier" ADD CONSTRAINT "_userTier_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
