import {PDFDocument, PDFPage, rgb} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  PAGE_HEIGHT,
  PAGE_WIDTH,
  CARD_WIDTH,
  CARD_HEIGHT,
  drawRectangle,
  gridPositions, GeneratedPdfResponse
} from "./lib";

import {readFile} from "fs/promises";
import {join} from "path";

const FONT_SIZE = 30;

const reKana = /[\u3040-\u30FF]/;
const reHan = /[\u4E00-\u9FFF]/;

export const generateWordsPdf = async (words: string[]): Promise<GeneratedPdfResponse> => {
  const wordsPdf = await PDFDocument.create();

  wordsPdf.registerFontkit(fontkit);

  const fontsFolder = join(process.cwd(), "assets", "fonts");

  const fontLatin = await wordsPdf.embedFont(
    await readFile(join(fontsFolder, "Roboto-Regular.ttf")),
    {subset: true}
  );

  const fontJP = await wordsPdf.embedFont(
    await readFile(join(fontsFolder, "NotoSansJP-Regular.ttf")),
    {subset: true}
  );

  const fontZH = await wordsPdf.embedFont(
    await readFile(join(fontsFolder, "NotoSansTC-Regular.ttf")),
    {subset: true}
  );

  function pickFont(text: string) {
    if (reKana.test(text)) {
      return fontJP;
    }
    if (reHan.test(text)) {
      return fontZH;
    }
    return fontLatin;
  }


  const totalWords = words.length;

  let currentPageIndex = -1;
  let currentPage: PDFPage | null = null;

  for (const pos of gridPositions(totalWords)) {
    if (pos.pageIndex !== currentPageIndex) {
      currentPage = wordsPdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentPageIndex = pos.pageIndex;
    }

    if (!currentPage) {
      continue;
    }

    const word = words[pos.globalIndex];

    drawRectangle(currentPage, pos.x, pos.y);

    const lines = wrapTextByChars(word, 15);
    const totalTextHeight = lines.length * FONT_SIZE;
    let textY = pos.y + (CARD_HEIGHT + totalTextHeight) / 2 - FONT_SIZE;

    for (const line of lines) {
      const font = pickFont(line);
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
