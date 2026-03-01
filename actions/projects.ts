"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBuilderOwnership } from "@/lib/auth/guard";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/db/queries/projects";
import { projectSchema } from "@/lib/validators";

export async function createProjectAction(
  builderId: string,
  formData: FormData
) {
  await requireBuilderOwnership(builderId);

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    propertyType: formData.get("propertyType"),
    bhk: formData.get("bhk"),
    priceRangeMin: formData.get("priceRangeMin") || undefined,
    priceRangeMax: formData.get("priceRangeMax") || undefined,
    additionalFacilities: formData.get("additionalFacilities") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await createProject({ builderId, ...parsed.data });
  redirect(`/builders/${builderId}/projects`);
}

export async function updateProjectAction(
  builderId: string,
  projectId: string,
  formData: FormData
) {
  await requireBuilderOwnership(builderId);

  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    propertyType: formData.get("propertyType"),
    bhk: formData.get("bhk"),
    priceRangeMin: formData.get("priceRangeMin") || undefined,
    priceRangeMax: formData.get("priceRangeMax") || undefined,
    additionalFacilities: formData.get("additionalFacilities") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await updateProject(projectId, parsed.data);
  revalidatePath(`/builders/${builderId}/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectAction(
  builderId: string,
  projectId: string
) {
  await requireBuilderOwnership(builderId);
  await deleteProject(projectId);
  redirect(`/builders/${builderId}/projects`);
}
