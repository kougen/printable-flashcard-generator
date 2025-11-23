import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {promises as fs} from "fs";

export async function GET(_req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
  const {id} = await params;

  const pdf = await prisma.generatedPdf.findUnique({
    where: {id},
  });

  if (!pdf) {
    return new NextResponse("Not found", {status: 404});
  }

  if (pdf.expiresAt < new Date()) {
    return new NextResponse("Expired", {status: 410});
  }

  const bytes = await fs.readFile(pdf.path);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${id}.pdf"`,
    },
  });
}