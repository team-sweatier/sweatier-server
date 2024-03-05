-- CreateTable
CREATE TABLE "_likerMatches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_likerMatches_AB_unique" ON "_likerMatches"("A", "B");

-- CreateIndex
CREATE INDEX "_likerMatches_B_index" ON "_likerMatches"("B");

-- AddForeignKey
ALTER TABLE "_likerMatches" ADD CONSTRAINT "_likerMatches_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likerMatches" ADD CONSTRAINT "_likerMatches_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
