import {NextRequest, NextResponse} from "next/server";
import {generateImagesPdf} from "@/lib/pdf/images";
import {generateWordsPdf} from "@/lib/pdf/words";
import {storeGeneratedPdf, storePdfInDatabase} from "@/lib/storage";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {prisma} from "@/lib/db";
import {FlashcardSet} from "@/prisma/generated/prisma/client";
import {FlashcardSetCreateInput} from "@/prisma/generated/prisma/models";

type ExistingFlashcardSet = {
  id: string | null;
  userId?: string;
};

async function getFlashcardSet(existingInput?: ExistingFlashcardSet, newInput?: FlashcardSetCreateInput): Promise<FlashcardSet> {
  if (existingInput?.id && existingInput.userId) {
    const existingSet = await prisma.flashcardSet.findUnique({
      where: {id: existingInput.id, userId: existingInput.userId},
    });
    if (!existingSet) {
      throw new Error("Flashcard set not found");
    }
    return existingSet;
  }

  if (!newInput?.name) {
    throw new Error("Missing name for new flashcard set");
  }

  return await prisma.flashcardSet.create({
    data: newInput,
  });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({
      message: "Invalid content type, expected multipart/form-data",
    }, {status: 400});
  }

  const formData = await req.formData();

  const words = formData
    .getAll("words")
    .map((w) => String(w).trim())
    .filter(Boolean);

  const name = formData.get("name") as string;

  if (!name) {
    return NextResponse.json({
      message: "Missing 'name' field",
    }, {status: 400});
  }

  const imageEntries = formData.getAll("images") as File[];
  const excludeImagesRaw = formData.get("exclude_images");
  const excludeImages =
    excludeImagesRaw === "true" ||
    excludeImagesRaw === "1" ||
    excludeImagesRaw === "on";
  const existingFlashcardSetId = formData.get("flashcard_set_id") as string | null;

  if (words?.length <= 0 && (!excludeImages && imageEntries.length <= 0)) {
    return NextResponse.json({
      message: "No words or images provided",
    }, {status: 400});
  }

  if (!excludeImages && imageEntries.length > 0 && words.length !== imageEntries.length) {
    return NextResponse.json({
      message: "Number of words and images must be the same",
    }, {status: 400});
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  const userId = session?.user?.id || undefined;

  const responseBody: Record<string, unknown> = {};

  try {
    const {pdf: wordsPdf, pageCount, flashcardCount} = await generateWordsPdf(words);
    const wordsPath = await storeGeneratedPdf({
      bytes: wordsPdf,
      baseFilename: "words.pdf",
    });

    const flashcardSet = await getFlashcardSet(
      {id: existingFlashcardSetId, userId},
      {
        name,
        pages: pageCount,
        flashcardsCount: flashcardCount,
        user: {
          connect: userId ? {id: userId} : undefined,
        }
      }
    );

    const wordsRecord = await storePdfInDatabase({
      flashcardSetId: flashcardSet.id,
      type: "WORDS",
      absolutePath: wordsPath,
    })

    responseBody.pdf_words_url = `/api/pdfs/${wordsRecord.id}`;
    responseBody.pdf_words_id = wordsRecord.id;

    if (!excludeImages && imageEntries.length) {
      const {pdf: imagesPdf} = await generateImagesPdf(imageEntries);
      const imagesPath = await storeGeneratedPdf({
        bytes: imagesPdf,
        baseFilename: "images.pdf",
      });

      const imagesRecord = await storePdfInDatabase({
        flashcardSetId: flashcardSet.id,
        type: "IMAGES",
        absolutePath: imagesPath,
      });

      responseBody.pdf_images_url = `/api/pdfs/${imagesRecord.id}`;
      responseBody.pdf_images_id = imagesRecord.id;
    }

    return NextResponse.json(responseBody);
  } catch (e) {
    console.error("PDF generation error:", e);
    return NextResponse.json({
      message: "Failed to generate PDF",
    }, {status: 500});
  }
}