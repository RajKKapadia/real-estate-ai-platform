"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { requireBuilderOwnership } from "@/lib/auth/guard";
import { getBuilderById } from "@/lib/db/queries/builders-detail";
import {
  createBuilder,
  updateBuilder,
  deleteBuilder,
} from "@/lib/db/queries/builders-detail";
import { builderSchema } from "@/lib/validators";

export async function createBuilderAction(formData: FormData) {
  const user = await requireUser();

  const parsed = builderSchema.safeParse({
    agentName: formData.get("agentName"),
    property: formData.get("property") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const builder = await createBuilder({
    builderId: user.id,
    ...parsed.data,
  });

  redirect(`/builders/${builder.builderId}`);
}

export async function updateBuilderAction(builderId: string, formData: FormData) {
  await requireBuilderOwnership(builderId);

  const parsed = builderSchema.safeParse({
    agentName: formData.get("agentName"),
    property: formData.get("property") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const builderDetails = await getBuilderById(builderId);
  if (!builderDetails) {
    return { error: { agentName: ["Builder not found"] } };
  }

  await updateBuilder(builderDetails.id, parsed.data);
  revalidatePath(`/builders/${builderId}`);
  return { success: true };
}

export async function deleteBuilderAction(builderId: string) {
  await requireBuilderOwnership(builderId);

  const builderDetails = await getBuilderById(builderId);
  if (builderDetails) {
    await deleteBuilder(builderDetails.id);
  }

  redirect("/builders");
}
