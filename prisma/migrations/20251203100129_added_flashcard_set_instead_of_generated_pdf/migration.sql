/*
  Warnings:

  - You are about to drop the `GeneratedPdf` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FlashcardType" AS ENUM ('IMAGES', 'WORDS');

-- DropForeignKey
ALTER TABLE "GeneratedPdf" DROP CONSTRAINT "GeneratedPdf_parentPdfId_fkey";

-- DropForeignKey
ALTER TABLE "GeneratedPdf" DROP CONSTRAINT "GeneratedPdf_userId_fkey";

-- DropTable
DROP TABLE "GeneratedPdf";

-- DropEnum
DROP TYPE "PdfType";

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "type" "FlashcardType" NOT NULL,
    "flashcardSetId" TEXT NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flashcard_set" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "flashcard_set_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flashcard_expiresAt_idx" ON "Flashcard"("expiresAt");

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_flashcardSetId_fkey" FOREIGN KEY ("flashcardSetId") REFERENCES "flashcard_set"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcard_set" ADD CONSTRAINT "flashcard_set_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
