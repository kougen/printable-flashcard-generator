import {PDFDocument} from "pdf-lib";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  createPdf,
  drawRectangle,
  GRID_COLS,
  ITEMS_PER_PAGE,
  PAGE_HEIGHT,
  PAGE_WIDTH
} from "./lib";

export const generateImagesPdf = async (images: File[]) => {
  const imagesPdf = await PDFDocument.create();
  const totalImages = images.length;
  const numImagePages = Math.ceil(totalImages / ITEMS_PER_PAGE);

  for (let pageIndex = 0; pageIndex < numImagePages; pageIndex++) {
    const page = imagesPdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    for (let i = 0; i < ITEMS_PER_PAGE; i++) {
      const imageIndex = pageIndex * ITEMS_PER_PAGE + i;
      if (imageIndex >= totalImages) {
        break;
      }

      const file = images[imageIndex];
      const imgBytes = Buffer.from(await file.arrayBuffer());

      let embeddedImage;
      if (file.type === "image/png") {
        embeddedImage = await imagesPdf.embedPng(imgBytes);
      } else {
        embeddedImage = await imagesPdf.embedJpg(imgBytes);
      }

      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);

      const x = col * CARD_WIDTH;
      const y = PAGE_HEIGHT - (row + 1) * CARD_HEIGHT;

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      const scale = Math.min(
        CARD_WIDTH / imgWidth,
        CARD_HEIGHT / imgHeight,
      );

      const drawWidth = imgWidth * scale;
      const drawHeight = imgHeight * scale;

      const imgX = x + (CARD_WIDTH - drawWidth) / 2;
      const imgY = y + (CARD_HEIGHT - drawHeight) / 2;

      drawRectangle(page, x, y);

      page.drawImage(embeddedImage, {
        x: imgX,
        y: imgY,
        width: drawWidth,
        height: drawHeight,
      });
    }
  }

  return await createPdf(imagesPdf, "final_images.pdf");
}
