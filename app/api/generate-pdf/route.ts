import {NextRequest, NextResponse} from "next/server";
import {promises as fs} from "fs";
import path from "path";
import {generateImagesPdf, generateWordsPdf} from "@/lib/pdf";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new NextResponse("Expected multipart/form-data", {status: 400});
  }

  const formData = await req.formData();

  const words = formData.getAll("words").map((w) => String(w).trim()).filter(Boolean);

  const imageEntries = formData.getAll("images") as File[];
  const excludeImagesRaw = formData.get("exclude_images");
  const excludeImages =
    excludeImagesRaw === "true" ||
    excludeImagesRaw === "1" ||
    excludeImagesRaw === "on";

  if (!words.length && (excludeImages || !imageEntries.length)) {
    return new NextResponse("No words or images provided", {status: 400});
  }

  await fs.mkdir(UPLOAD_DIR, {recursive: true});

  const responseBody: Record<string, unknown> = {};

  if (words.length) {
    responseBody.pdf_words_url = await generateWordsPdf(words);
  }

  if (!excludeImages && imageEntries.length) {
    responseBody.pdf_images_url = await generateImagesPdf(imageEntries);
  }

  return NextResponse.json(responseBody);
}
