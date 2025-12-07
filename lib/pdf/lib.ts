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

export type CellPosition = {
  pageIndex: number;
  cellIndex: number;
  globalIndex: number;
  col: number;
  row: number;
  x: number;
  y: number;
};

export type GeneratedPdfResponse = {
  pdf: Uint8Array;
  pageCount: number;
  flashcardCount: number;
}

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

export function* gridPositions(totalItems: number): Generator<CellPosition> {
  const numPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
    for (let cellIndex = 0; cellIndex < ITEMS_PER_PAGE; cellIndex++) {
      const globalIndex = pageIndex * ITEMS_PER_PAGE + cellIndex;
      if (globalIndex >= totalItems) return;

      const col = cellIndex % GRID_COLS;
      const row = Math.floor(cellIndex / GRID_COLS);

      const x = col * CARD_WIDTH;
      const y = PAGE_HEIGHT - (row + 1) * CARD_HEIGHT;

      yield {pageIndex, cellIndex, globalIndex, col, row, x, y};
    }
  }
}