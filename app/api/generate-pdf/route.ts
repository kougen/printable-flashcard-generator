import {NextRequest, NextResponse} from "next/server";
import {generateImagesPdf} from "@/lib/pdf/images";
import {generateWordsPdf} from "@/lib/pdf/words";
import {storeGeneratedPdf} from "@/lib/storage";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new NextResponse("Expected multipart/form-data", {status: 400});
  }

  const formData = await req.formData();

  const words = formData
    .getAll("words")
    .map((w) => String(w).trim())
    .filter(Boolean);

  const imageEntries = formData.getAll("images") as File[];
  const excludeImagesRaw = formData.get("exclude_images");
  const excludeImages =
    excludeImagesRaw === "true" ||
    excludeImagesRaw === "1" ||
    excludeImagesRaw === "on";

  if (!words.length && (excludeImages || !imageEntries.length)) {
    return new NextResponse("No words or images provided", {status: 400});
  }

  const session = await auth.api.getSession({
    headers: await headers()
  })

  console.log(session)

  const userId = session?.user?.id || undefined;

  const responseBody: Record<string, unknown> = {};

  if (words.length) {
    const wordsBytes = await generateWordsPdf(words);
    const {url, record} = await storeGeneratedPdf({
      bytes: wordsBytes,
      baseFilename: "words.pdf",
      userId,
      ttlHours: 24 * 7,
    });

    responseBody.pdf_words_url = url;
    responseBody.pdf_words_id = record.id;
  }

  if (!excludeImages && imageEntries.length) {
    const imagesBytes = await generateImagesPdf(imageEntries);
    const {url, record} = await storeGeneratedPdf({
      bytes: imagesBytes,
      baseFilename: "images.pdf",
      userId,
      ttlHours: 24 * 7,
    });

    responseBody.pdf_images_url = url;
    responseBody.pdf_images_id = record.id;
  }

  return NextResponse.json(responseBody);
}