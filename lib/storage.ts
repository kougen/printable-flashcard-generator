import path from "path";
import crypto from "crypto";
import {promises as fs} from "fs";
import {prisma} from "@/lib/db";

const STORAGE_DIR = path.join(process.cwd(), "storage", "pdfs");

function buildFilename(base: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = crypto.randomBytes(4).toString("hex");
  const ext = path.extname(base) || ".pdf";
  const name = path.basename(base, ext);
  return `${name}_${timestamp}_${random}${ext}`;
}

export async function storeGeneratedPdf(options: {
  bytes: Uint8Array;
  baseFilename: string;
  userId?: string;
  ttlHours?: number;
}) {
  const {bytes, baseFilename, userId, ttlHours = 24 * 7} = options;

  await fs.mkdir(STORAGE_DIR, {recursive: true});

  const filename = buildFilename(baseFilename);
  const absolutePath = path.join(STORAGE_DIR, filename);

  await fs.writeFile(absolutePath, bytes);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  const dbRecord = await prisma.generatedPdf.create({
    data: {
      userId: userId ?? null,
      path: absolutePath,
      expiresAt: expiresAt,
    },
  });

  const publicUrl = `/api/pdfs/${dbRecord.id}`;

  return {record: dbRecord, url: publicUrl};
}