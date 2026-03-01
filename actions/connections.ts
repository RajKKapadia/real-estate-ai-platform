"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { requireBuilderOwnership } from "@/lib/auth/guard";
import { getConnectionByType, upsertConnection } from "@/lib/db/queries/connections";
import {
  websiteConnectionSchema,
  whatsappConnectionSchema,
} from "@/lib/validators";
import { encrypt } from "@/lib/encryption";
import { env } from "@/lib/env/server";
import { z } from "zod";

export async function upsertWebsiteConnectionAction(
  builderId: string,
  formData: FormData
) {
  await requireBuilderOwnership(builderId);

  const parsed = websiteConnectionSchema.safeParse({
    allowedDomain: formData.get("allowedDomain"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const embedScript = `<script src="${appUrl}/widget.js" data-builder-id="${builderId}"></script>`;

  await upsertConnection({
    builderId,
    connectionType: "website",
    allowedDomain: parsed.data.allowedDomain,
    embedScriptTag: embedScript,
  });

  revalidatePath(`/builders/${builderId}/connections`);
  return { success: true };
}

export async function upsertWhatsAppConnectionAction(
  builderId: string,
  formData: FormData
) {
  await requireBuilderOwnership(builderId);

  const parsed = whatsappConnectionSchema.safeParse({
    metaAccessToken: formData.get("metaAccessToken"),
    metaAppSecret: formData.get("metaAppSecret"),
    senderPhoneId: formData.get("senderPhoneId"),
  });

  if (!parsed.success) {
    return { error: z.treeifyError(parsed.error) };
  }

  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const existingConnection = await getConnectionByType(builderId, "whatsapp");
  const webhookVerifyToken = existingConnection?.webhookVerifyToken
    ? existingConnection.webhookVerifyToken
    : randomUUID();

  await upsertConnection({
    builderId,
    connectionType: "whatsapp",
    metaAccessToken: encrypt(parsed.data.metaAccessToken),
    metaAppSecret: encrypt(parsed.data.metaAppSecret),
    senderPhoneId: encrypt(parsed.data.senderPhoneId),
    webhookVerifyToken,
    webhookUrl: `${appUrl}/api/webhooks/whatsapp/${builderId}`,
  });

  revalidatePath(`/builders/${builderId}/connections`);
  return { success: true };
}
