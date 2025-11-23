import {PDFDocument, PDFPage} from "pdf-lib";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  drawRectangle,
  gridPositions,
  PAGE_HEIGHT,
  PAGE_WIDTH
} from "./lib";

export const generateImagesPdf = async (images: File[]): Promise<Uint8Array> => {
  const imagesPdf = await PDFDocument.create();
  const totalImages = images.length;

  let currentPageIndex = -1;
  let currentPage: PDFPage | null = null;

  for (const pos of gridPositions(totalImages)) {
    if (pos.pageIndex !== currentPageIndex) {
      currentPage = imagesPdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentPageIndex = pos.pageIndex;
    }

    if (!currentPage) continue;

    const file = images[pos.globalIndex];
    const imgBytes = Buffer.from(await file.arrayBuffer());

    const embeddedImage =
      file.type === "image/png"
        ? await imagesPdf.embedPng(imgBytes)
        : await imagesPdf.embedJpg(imgBytes);

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

  return await imagesPdf.save();
};
