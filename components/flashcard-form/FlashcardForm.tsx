"use client";

import {useState} from "react";
import {GenerateResult, Page} from "./types";
import FlashcardPage from "./FlashcardPage";
import {Button, buttonVariants} from "@/components/ui/button";

const GRID_COLS = 3;
const GRID_ROWS = 5;
const CARDS_PER_PAGE = GRID_COLS * GRID_ROWS;

export default function FlashcardForm() {
  const [pages, setPages] = useState<Page[]>([createEmptyPage()]);
  const [excludeImages, setExcludeImages] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const updateCardWord = (pageIndex: number, cardIndex: number, word: string) => {
    setPages((prev) => {
      const copy = structuredClone(prev) as Page[];
      copy[pageIndex][cardIndex].word = word;
      return copy;
    });
  };

  const updateCardImage = (pageIndex: number, cardIndex: number, file: File | null) => {
    setPages((prev) => {
      const copy = structuredClone(prev) as Page[];
      copy[pageIndex][cardIndex].image = file;
      return copy;
    });
  };

  const addPage = () => {
    setPages((prev) => [...prev, createEmptyPage()]);
  };

  const removePage = (pageIndex: number) => {
    setPages((prev) => {
      if (prev.length === 1) {
        return [createEmptyPage()];
      }
      const copy = [...prev];
      copy.splice(pageIndex, 1);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData();
    for (const page of pages) {
      for (const card of page) {
        if (card.word.trim() !== "") {
          form.append("words", card.word);
        }
        if (card.image) {
          form.append("images", card.image);
        }
      }
    }

    if (excludeImages) form.append("exclude_images", "true");

    setLoading(true);
    setResult(null);

    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      body: form,
    });

    setLoading(false);

    if (!res.ok) {
      setResult({error: "PDF generation failed."});
      return;
    }

    const json: GenerateResult = await res.json();
    setResult(json);
  };


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Generate Flashcard PDFs</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {pages.map((page, pageIndex) => <FlashcardPage gridCols={GRID_COLS} key={pageIndex} page={page}
                                                       pageIndex={pageIndex}
                                                       updateCardWord={updateCardWord}
                                                       updateCardImage={updateCardImage}
                                                       removePage={removePage}/>)}

        <Button type="button" variant="secondary" onClick={addPage}>
          Add new page
        </Button>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={excludeImages}
            onChange={(e) => setExcludeImages(e.target.checked)}
          />
          Exclude images PDF
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate PDF"}
        </Button>
      </form>

      {result && (
        <div className="mt-6 space-y-2 border p-4 rounded">
          <h2 className="font-semibold">Result</h2>

          {result.error && (
            <p className="text-destructive">{result.error}</p>
          )}

          {result.pdf_words_url && (
            <p>
              <a
                href={result.pdf_words_url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({variant: "link"})}
              >
                Download Words PDF
              </a>
            </p>
          )}

          {result.pdf_images_url && (
            <p>
              <a
                href={result.pdf_images_url}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({variant: "link"})}
              >
                Download Images PDF
              </a>
            </p>
          )}
        </div>
      )}
    </div>

  )
}

const createEmptyPage = (): Page =>
  Array.from({length: CARDS_PER_PAGE}, () => ({word: "", image: null}));
