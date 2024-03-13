/*
  Warnings:

  - Added the required column `rules` to the `SportsType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SportsType" ADD COLUMN     "rules" TEXT NOT NULL;
