"use server";

import { revalidatePath } from "next/cache";
import { requireBuilderOwnership } from "@/lib/auth/guard";
import { updateLead } from "@/lib/db/queries/leads";
import { leadUpdateSchema } from "@/lib/validators";

export async function updateLeadAction(
  builderId: string,
  leadId: string,
  formData: FormData
) {
  await requireBuilderOwnership(builderId);

  const parsed = leadUpdateSchema.safeParse({
    name: formData.get("name") || undefined,
    mobile: formData.get("mobile") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await updateLead(leadId, parsed.data);
  revalidatePath(`/builders/${builderId}/leads`);
  return { success: true };
}
