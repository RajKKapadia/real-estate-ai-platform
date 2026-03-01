import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { upsertBuilder, deleteBuilderByClerkId } from "@/lib/db/queries/builders";
import { env } from "@/lib/env/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (evt.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const primaryEmail =
        email_addresses.find((e) => e.id === evt.data.primary_email_address_id)
          ?.email_address ?? email_addresses[0]?.email_address;

      if (primaryEmail) {
        await upsertBuilder({
          clerkId: id,
          email: primaryEmail,
          fullName: [first_name, last_name].filter(Boolean).join(" ") || null,
          imageUrl: image_url ?? null,
        });
      }
      break;
    }
    case "user.deleted": {
      if (evt.data.id) {
        await deleteBuilderByClerkId(evt.data.id);
      }
      break;
    }
  }

  return new Response("OK", { status: 200 });
}
