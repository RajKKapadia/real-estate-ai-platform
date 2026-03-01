"use server";

import { revalidatePath } from "next/cache";
import { requireBuilderOwnership } from "@/lib/auth/guard";
import { getProjectById } from "@/lib/db/queries/projects";
import {
  createDocument,
  deleteDocument,
} from "@/lib/db/queries/documents";
import { uploadFile, deleteFile } from "@/lib/storage";
import {
  MAX_FILE_SIZE,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/constants";

export async function uploadDocumentAction(
  builderId: string,
  projectId: string,
  formData: FormData
) {
  await requireBuilderOwnership(builderId);

  const project = await getProjectById(projectId);
  if (!project || project.builderId !== builderId) {
    return { error: "Project not found" };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size exceeds 10MB limit" };
  }

  const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type);
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (!isDocument && !isImage) {
    return { error: "Unsupported file type" };
  }

  const fileType = isImage ? "image" : "document";
  const storagePath = `${builderId}/${projectId}/${Date.now()}-${file.name}`;

  const { storagePath: path, publicUrl } = await uploadFile(storagePath, file);

  await createDocument({
    projectId,
    fileName: file.name,
    fileType,
    storagePath: path,
    publicUrl,
    sizeBytes: file.size,
  });

  revalidatePath(`/builders/${builderId}/projects/${projectId}`);
  return { success: true };
}

export async function deleteDocumentAction(
  builderId: string,
  projectId: string,
  documentId: string
) {
  await requireBuilderOwnership(builderId);

  const storagePath = await deleteDocument(documentId);
  if (storagePath) {
    await deleteFile(storagePath);
  }

  revalidatePath(`/builders/${builderId}/projects/${projectId}`);
  return { success: true };
}
