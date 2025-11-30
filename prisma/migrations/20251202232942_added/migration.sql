/*
  Warnings:

  - Added the required column `type` to the `GeneratedPdf` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PdfType" AS ENUM ('IMAGES', 'WORDS');

-- AlterTable
ALTER TABLE "GeneratedPdf" ADD COLUMN     "pairedPdfId" TEXT,
ADD COLUMN     "type" "PdfType" NOT NULL;

-- AddForeignKey
ALTER TABLE "GeneratedPdf" ADD CONSTRAINT "GeneratedPdf_pairedPdfId_fkey" FOREIGN KEY ("pairedPdfId") REFERENCES "GeneratedPdf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
