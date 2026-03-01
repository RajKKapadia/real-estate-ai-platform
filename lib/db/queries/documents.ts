import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { projectDocuments, type ProjectDocument } from "@/lib/db/schema";

export async function getDocumentsByProjectId(
  projectId: string
): Promise<ProjectDocument[]> {
  return db
    .select()
    .from(projectDocuments)
    .where(eq(projectDocuments.projectId, projectId))
    .orderBy(desc(projectDocuments.createdAt));
}

export async function createDocument(doc: {
  projectId: string;
  fileName: string;
  fileType: "document" | "image";
  storagePath: string;
  publicUrl: string;
  sizeBytes?: number;
}): Promise<void> {
  await db.insert(projectDocuments).values(doc);
}

export async function deleteDocument(id: string): Promise<string | null> {
  const rows = await db
    .delete(projectDocuments)
    .where(eq(projectDocuments.id, id))
    .returning({ storagePath: projectDocuments.storagePath });
  return rows[0]?.storagePath ?? null;
}
