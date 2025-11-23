import path from "path";
import {PDFDocument, PDFPage, rgb} from "pdf-lib";
import {promises as fs} from "fs";
import crypto from "crypto";

export const GRID_COLS = 3;
export const GRID_ROWS = 5;
export const CARD_WIDTH = 300;
export const CARD_HEIGHT = 200;

export const PAGE_WIDTH = GRID_COLS * CARD_WIDTH;
export const PAGE_HEIGHT = GRID_ROWS * CARD_HEIGHT;
export const ITEMS_PER_PAGE = GRID_COLS * GRID_ROWS;

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const drawRectangle = (page: PDFPage, x: number, y: number) => {
  page.drawRectangle({
    x,
    y,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });
}

export const createPdf = async (pdf: PDFDocument, filename: string) => {
  const pdfBytes = await pdf.save();
  const timestampedFilename = getTimestampedFilename(filename);
  const pdfPath = path.join(UPLOAD_DIR, timestampedFilename);
  await fs.writeFile(pdfPath, pdfBytes);
  return `/uploads/${timestampedFilename}`;
}

function getTimestampedFilename(base: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = crypto.randomBytes(4).toString("hex");
  const ext = path.extname(base) || ".pdf";
  const name = path.basename(base, ext);
  return `${name}_${timestamp}_${random}${ext}`;
}
