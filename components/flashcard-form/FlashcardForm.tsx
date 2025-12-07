"use client";

import {useReducer, useState} from "react";
import {GenerateResult, Page} from "./types";
import FlashcardPage from "./FlashcardPage";
import {Button, buttonVariants} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";

type Action =
  | { type: "updateWord"; pageIndex: number; cardIndex: number; word: string }
  | { type: "updateImage"; pageIndex: number; cardIndex: number; image: File | null }
  | { type: "addPage" }
  | { type: "removePage"; pageIndex: number }
  | { type: "reset" };

const GRID_COLS = 3;
const GRID_ROWS = 5;
const CARDS_PER_PAGE = GRID_COLS * GRID_ROWS;

const createEmptyPage = (): Page =>
  Array.from({length: CARDS_PER_PAGE}, () => ({word: "", image: null}));

const pagesReducer = (state: Page[], action: Action): Page[] => {
  switch (action.type) {
    case "updateWord":
      return state.map((page, pIdx) =>
        pIdx !== action.pageIndex
          ? page
          : page.map((card, cIdx) =>
            cIdx !== action.cardIndex ? card : {...card, word: action.word},
          ),
      );

    case "updateImage":
      return state.map((page, pIdx) =>
        pIdx !== action.pageIndex
          ? page
          : page.map((card, cIdx) =>
            cIdx !== action.cardIndex ? card : {...card, image: action.image},
          ),
      );

    case "addPage":
      return [...state, createEmptyPage()];

    case "removePage":
      if (state.length === 1) return [createEmptyPage()];
      return state.filter((_, idx) => idx !== action.pageIndex);

    case "reset":
      return [createEmptyPage()];

    default:
      return state;
  }
};

type FlashcardFormProps = {
  flashcardSets: { id: string; name: string }[] | undefined;
};

export default function FlashcardForm({flashcardSets}: FlashcardFormProps) {
  const [pages, dispatch] = useReducer(pagesReducer, [createEmptyPage()]);
  const [excludeImages, setExcludeImages] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const updateCardWord = (pageIndex: number, cardIndex: number, word: string) =>
    dispatch({type: "updateWord", pageIndex, cardIndex, word});

  const updateCardImage = (pageIndex: number, cardIndex: number, image: File | null) =>
    dispatch({type: "updateImage", pageIndex, cardIndex, image});

  const addPage = () => dispatch({type: "addPage"});
  const removePage = (pageIndex: number) => dispatch({type: "removePage", pageIndex});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData();
    const name = (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
    form.append("name", name);

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

    if (excludeImages) {
      form.append("exclude_images", "true");
    }

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
        <Input id="name" name="name" type="text" placeholder="Flashcard Set Name" required/>

        {pages.map((page, pageIndex) => (
          <FlashcardPage
            gridCols={GRID_COLS}
            key={pageIndex}
            page={page}
            pageIndex={pageIndex}
            updateCardWord={updateCardWord}
            updateCardImage={updateCardImage}
            removePage={removePage}
          />
        ))}

        <Button type="button" variant="secondary" onClick={addPage}>
          Add new page
        </Button>

        <NativeSelect id="flashcardSet" name="flashcardSet" defaultValue="">
          <NativeSelectOption value="">Select a flashcard set</NativeSelectOption>
          {flashcardSets?.map((set) => (
            <NativeSelectOption key={set.id} value={set.id}>
              {set.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Label
          className="text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
          <Checkbox
            onCheckedChange={(value) => setExcludeImages(!!value)}
            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />
          <div className="grid gap-1.5 font-normal">
            <p className="text-sm leading-none font-medium">
              Only include words
            </p>
            <p className="text-muted-foreground text-sm">
              Only generate PDFs containing words, not images.
            </p>
          </div>
        </Label>

        <Button type="submit" disabled={loading}>
          {loading ? "Generating…" : "Generate PDF"}
        </Button>
      </form>

      {result && (
        <div className="mt-6 space-y-2 border p-4 rounded">
          <h2 className="font-semibold">Result</h2>

          {result.error && <p className="text-destructive">{result.error}</p>}

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
  );
}