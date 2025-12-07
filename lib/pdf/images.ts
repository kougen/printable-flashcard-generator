import {PDFDocument, PDFImage, PDFPage} from "pdf-lib";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  drawRectangle,
  GeneratedPdfResponse,
  gridPositions,
  PAGE_HEIGHT,
  PAGE_WIDTH
} from "./lib";
import sharp from "sharp";

export const embedImage = async (pdf: PDFDocument, file: File): Promise<PDFImage> => {
  const bytes = Buffer.from(await file.arrayBuffer());
  switch (file.type) {
    case "image/png":
      return await pdf.embedPng(bytes);
    case "image/jpg":
    case "image/jpeg":
      return await pdf.embedJpg(bytes);
    case "image/webp":
    case "image/gif":
    case "image/svg+xml":
      const pngBuffer = await sharp(bytes)
        .png()
        .toBuffer();

      return await pdf.embedPng(pngBuffer);
    default:
      throw new Error(`Unsupported image type: ${file.type}`);
  }
}

export const generateImagesPdf = async (images: File[]): Promise<GeneratedPdfResponse> => {
  const imagesPdf = await PDFDocument.create();
  const totalImages = images.length;

  let currentPageIndex = -1;
  let currentPage: PDFPage | null = null;

  for (const pos of gridPositions(totalImages)) {
    if (pos.pageIndex !== currentPageIndex) {
      currentPage = imagesPdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentPageIndex = pos.pageIndex;
    }

    if (!currentPage) {
      continue;
    }

    const file = images[pos.globalIndex];

    const embeddedImage = await embedImage(imagesPdf, file);

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    const scale = Math.min(CARD_WIDTH / imgWidth, CARD_HEIGHT / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const imgX = pos.x + (CARD_WIDTH - drawWidth) / 2;
    const imgY = pos.y + (CARD_HEIGHT - drawHeight) / 2;

    drawRectangle(currentPage, pos.x, pos.y);

    currentPage.drawImage(embeddedImage, {
      x: imgX,
      y: imgY,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return {
    pdf: await imagesPdf.save(),
    pageCount: imagesPdf.getPageCount(),
    flashcardCount: totalImages,
  }
};
