"use client";

import {Card} from "./types";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Image from "next/image";

type FlashcardProps = {
  pageIndex: number;
  cardIndex: number;
  card: Card;
  updateCardWord: (pageIndex: number, cardIndex: number, word: string) => void;
  updateCardImage: (pageIndex: number, cardIndex: number, file: File | null) => void;
}

export default function Flashcard(
  {
    card,
    pageIndex,
    cardIndex,
    updateCardWord,
    updateCardImage,
  }: FlashcardProps
) {
  return (
    <div
      className="border rounded-md p-3 flex flex-col gap-2 bg-muted"
    >
      <p className="text-xs text-muted-foreground">
        Card {cardIndex + 1}
      </p>
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-2 w-2/3">
          <Input
            type="text"
            value={card.word}
            onChange={(ev) =>
              updateCardWord(pageIndex, cardIndex, ev.target.value)
            }
            placeholder="Word"
            className="border px-2 py-1 rounded text-sm"
          />
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(ev) =>
                  updateCardImage(
                    pageIndex,
                    cardIndex,
                    ev.target.files?.[0] ?? null,
                  )
                }
                className="text-xs"
              />

              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  const img = await getClipboardImage();
                  if (img) {
                    updateCardImage(pageIndex, cardIndex, img);
                  }
                }}
              >
                Paste
              </Button>
            </div>
          </div>
        </div>


        <div className="flex flex-col items-center justify-center gap-2 w-1/3">
          {card.image ? (
            <>
              <p className="text-xs text-muted-foreground">{card.image.name}</p>
              <Image
                src={getImagePreview(card.image)}
                alt="Preview"
                width={60}
                height={60}
                className="rounded-md"
              /></>) : (
            <p className="text-xs text-muted-foreground">No image</p>
          )}
        </div>
      </div>
    </div>

  )
}

function getImagePreview(file: File) {
  return URL.createObjectURL(file);
}

async function getClipboardImage(): Promise<File | null> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const type = item.types.find((t) => t.startsWith("image/"));
      if (!type) continue;

      const blob = await item.getType(type);
      return new File([blob], "clipboard-image.png", {type});
    }
  } catch {
  }
  return null;
}
