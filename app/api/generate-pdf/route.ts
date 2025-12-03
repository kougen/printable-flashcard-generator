import {NextRequest, NextResponse} from "next/server";
import {generateImagesPdf} from "@/lib/pdf/images";
import {generateWordsPdf} from "@/lib/pdf/words";
import {storeGeneratedPdf} from "@/lib/storage";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {prisma} from "@/lib/db";

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

  if (!words.length && (excludeImages || !imageEntries.length)) {
    return NextResponse.json({
      message: "No words or images provided",
    }, {status: 400});
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  const userId = session?.user?.id || undefined;

  const flashcardSet = await prisma.flashcardSet.create({
    data: {
      name: name,
      userId: userId,
    },
  });

  const responseBody: Record<string, unknown> = {};

  if (!excludeImages && imageEntries.length) {
    const imagesBytes = await generateImagesPdf(imageEntries);
    const {url, record} = await storeGeneratedPdf({
      bytes: imagesBytes,
      baseFilename: "images.pdf",
      ttlHours: 24 * 7,
      type: "IMAGES",
      flashcardSetId: flashcardSet.id,
    });

    responseBody.pdf_images_url = url;
    responseBody.pdf_images_id = record.id;
  }

  if (words.length) {
    const wordsBytes = await generateWordsPdf(words);
    const {url, record} = await storeGeneratedPdf({
      bytes: wordsBytes,
      baseFilename: "words.pdf",
      ttlHours: 24 * 7,
      type: "WORDS",
      flashcardSetId: flashcardSet.id,
    });

    responseBody.pdf_words_url = url;
    responseBody.pdf_words_id = record.id;
  }

  return NextResponse.json(responseBody);
}