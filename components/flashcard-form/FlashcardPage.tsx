"use client"

import Flashcard from "./Flashcard";
import {Card} from "./types";

type FlashcardPageProps = {
  gridCols: number;
  pageIndex: number;
  page: Card[];
  updateCardWord: (pageIndex: number, cardIndex: number, word: string) => void;
  updateCardImage: (pageIndex: number, cardIndex: number, file: File | null) => void;
  removePage: (pageIndex: number) => void;
  excludeImages?: boolean;
}

export default function FlashcardPage(
  {
    page,
    gridCols,
    pageIndex,
    updateCardWord,
    updateCardImage,
    removePage,
    excludeImages
  }: FlashcardPageProps
) {
  return (
    <section className="border rounded-lg p-4 space-y-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Page {pageIndex + 1}</h2>

        <button
          type="button"
          onClick={() => removePage(pageIndex)}
          className="text-sm text-destructive underline"
        >
          Remove page
        </button>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        }}
      >
        {page.map((card, cardIndex) => <Flashcard key={cardIndex} card={card} cardIndex={cardIndex}
                                                  pageIndex={pageIndex} updateCardWord={updateCardWord}
                                                  excludeImages={excludeImages}
                                                  updateCardImage={updateCardImage}/>)}
      </div>
    </section>
  )

}