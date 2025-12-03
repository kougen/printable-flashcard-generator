import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {promises as fs} from "fs";
import {convert} from "pdf-img-convert";
import sharp from "sharp";

export async function GET(_req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const {id} = await params;

  const pdf = await prisma.flashcard.findUnique({
    where: {id},
  });

  if (!pdf) {
    return new NextResponse("Not found", {status: 404});
  }

  if (pdf.expiresAt < new Date()) {
    await prisma.flashcard.delete({where: {id}});
    try {
      await fs.unlink(pdf.path);
    } catch (e) {
      console.error("Failed to delete expired PDF file:", e);
    }
    return new NextResponse("Expired", {status: 410});
  }

  try {
    const pdfBytes = await fs.readFile(pdf.path);
    
    // Convert first page of PDF to PNG
    const pngPages = await convert(pdfBytes, {
      page_numbers: [1],
    });

    if (!pngPages || pngPages.length === 0) {
      return new NextResponse("Failed to generate thumbnail", {status: 500});
    }

    // Get the first page as a Uint8Array
    const firstPage = pngPages[0] as Uint8Array;
    
    // Resize to thumbnail size (e.g., 300px width, maintaining aspect ratio)
    const thumbnailBuffer = await sharp(Buffer.from(firstPage))
      .resize(300, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(thumbnailBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      },
    });
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return new NextResponse("Failed to generate thumbnail", {status: 500});
  }
}
