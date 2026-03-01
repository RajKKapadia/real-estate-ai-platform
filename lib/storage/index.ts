import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function uploadFile(
  storagePath: string,
  file: File
): Promise<{ storagePath: string; publicUrl: string }> {
  const fullPath = path.join(UPLOAD_DIR, storagePath);
  await mkdir(path.dirname(fullPath), { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  const publicUrl = `/uploads/${storagePath}`;
  return { storagePath, publicUrl };
}

export async function deleteFile(storagePath: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, storagePath);
  try {
    await unlink(fullPath);
  } catch {
    // file already gone
  }
}
