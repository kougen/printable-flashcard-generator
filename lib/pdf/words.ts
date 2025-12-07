import {PDFDocument, PDFPage, rgb, StandardFonts} from "pdf-lib";
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  CARD_WIDTH,
  CARD_HEIGHT,
  drawRectangle,
  gridPositions, GeneratedPdfResponse
} from "./lib";

const FONT_SIZE = 30;

export const generateWordsPdf = async (words: string[]): Promise<GeneratedPdfResponse> => {
  const wordsPdf = await PDFDocument.create();
  const font = await wordsPdf.embedFont(StandardFonts.Helvetica);

  const totalWords = words.length;

  let currentPageIndex = -1;
  let currentPage: PDFPage | null = null;

  for (const pos of gridPositions(totalWords)) {
    if (pos.pageIndex !== currentPageIndex) {
      currentPage = wordsPdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentPageIndex = pos.pageIndex;
    }

    if (!currentPage) continue;

    const word = words[pos.globalIndex];

    drawRectangle(currentPage, pos.x, pos.y);

    const lines = wrapTextByChars(word, 15);
    const totalTextHeight = lines.length * FONT_SIZE;
    let textY = pos.y + (CARD_HEIGHT + totalTextHeight) / 2 - FONT_SIZE;

    for (const line of lines) {
      const lineWidth = font.widthOfTextAtSize(line, FONT_SIZE);
      const textX = pos.x + (CARD_WIDTH - lineWidth) / 2;

      currentPage.drawText(line, {
        x: textX,
        y: textY,
        size: FONT_SIZE,
        font,
        color: rgb(0, 0, 0),
      });

      textY -= FONT_SIZE;
    }
  }

  return {
    pdf: await wordsPdf.save(),
    pageCount: wordsPdf.getPageCount(),
    flashcardCount: totalWords,
  }
};

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
