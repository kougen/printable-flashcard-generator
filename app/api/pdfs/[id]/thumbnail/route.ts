import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {promises as fs} from "fs";
import {promisify} from "util";
import {execFile} from "child_process";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

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
    const outputBase = "/tmp/thumbnail";
    await execFileAsync("pdftoppm", [
      pdf.path,
      outputBase,
      "-png",
      "-singlefile",
    ]);

    const pngPath = `${outputBase}.png`;
    const bytes = await fs.readFile(pngPath);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    console.error("Failed to generate thumbnail:", e);
    return new NextResponse("Thumbnail generation failed", {status: 500});
  }
}
