/*
  Warnings:

  - Added the required column `pages` to the `flashcard_set` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flashcard_set" ADD COLUMN     "description" TEXT,
ADD COLUMN     "flashcardsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pages" INTEGER NOT NULL;
