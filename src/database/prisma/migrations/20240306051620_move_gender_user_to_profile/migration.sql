/*
  Warnings:

  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - Added the required column `gender` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "gender";

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "gender" "Gender" NOT NULL;
