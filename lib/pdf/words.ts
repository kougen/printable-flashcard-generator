import {PDFDocument, rgb, StandardFonts} from "pdf-lib";
import {
  ITEMS_PER_PAGE,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  GRID_COLS,
  CARD_WIDTH,
  CARD_HEIGHT,
  drawRectangle,
  createPdf
} from "./lib";

const FONT_SIZE = 30;

export const generateWordsPdf = async (words: string[]) => {
  const wordsPdf = await PDFDocument.create();
  const font = await wordsPdf.embedFont(StandardFonts.Helvetica);

  const totalWords = words.length;
  const numWordPages = Math.ceil(totalWords / ITEMS_PER_PAGE);

  for (let pageIndex = 0; pageIndex < numWordPages; pageIndex++) {
    const page = wordsPdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    for (let i = 0; i < ITEMS_PER_PAGE; i++) {
      const wordIndex = pageIndex * ITEMS_PER_PAGE + i;
      if (wordIndex >= totalWords) {
        break;
      }

      const word = words[wordIndex];
      const col = i % GRID_COLS;
      const row = Math.floor(i / GRID_COLS);

      const x = col * CARD_WIDTH;
      const y = PAGE_HEIGHT - (row + 1) * CARD_HEIGHT;

      drawRectangle(page, x, y);

      const lines = wrapTextByChars(word, 15);
      const totalTextHeight = lines.length * FONT_SIZE;
      let textY = y + (CARD_HEIGHT + totalTextHeight) / 2 - FONT_SIZE;

      for (const line of lines) {
        const lineWidth = font.widthOfTextAtSize(line, FONT_SIZE);
        const textX = x + (CARD_WIDTH - lineWidth) / 2;

        page.drawText(line, {
          x: textX,
          y: textY,
          size: FONT_SIZE,
          font,
          color: rgb(0, 0, 0),
        });

        textY -= FONT_SIZE;
      }
    }
  }

  return await createPdf(wordsPdf, "final_words.pdf");
}

function wrapTextByChars(text: string, maxChars = 15): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    const add = current ? current + " " + w : w;
    if (add.length > maxChars) {
      if (current) {
        lines.push(current);
      }
      if (w.length > maxChars) {
        for (let i = 0; i < w.length; i += maxChars) {
          lines.push(w.slice(i, i + maxChars));
        }
        current = "";
      } else {
        current = w;
      }
    } else {
      current = add;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}
