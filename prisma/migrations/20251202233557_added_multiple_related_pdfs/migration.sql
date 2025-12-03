/*
  Warnings:

  - You are about to drop the column `pairedPdfId` on the `GeneratedPdf` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GeneratedPdf" DROP CONSTRAINT "GeneratedPdf_pairedPdfId_fkey";

-- AlterTable
ALTER TABLE "GeneratedPdf" DROP COLUMN "pairedPdfId",
ADD COLUMN     "parentPdfId" TEXT;

-- AddForeignKey
ALTER TABLE "GeneratedPdf" ADD CONSTRAINT "GeneratedPdf_parentPdfId_fkey" FOREIGN KEY ("parentPdfId") REFERENCES "GeneratedPdf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
