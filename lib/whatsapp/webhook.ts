import { createHmac } from "crypto";

export function verifyWebhookSignature(
  body: string,
  signature: string,
  appSecret: string
): boolean {
  const expectedSignature =
    "sha256=" +
    createHmac("sha256", appSecret).update(body).digest("hex");

  return signature === expectedSignature;
}

export type WhatsAppIncomingMessage = {
  from: string;
  messageId: string;
  text: string;
  timestamp: string;
  phoneNumberId: string;
};

export function parseWebhookPayload(
  body: Record<string, unknown>
): WhatsAppIncomingMessage | null {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
    const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
    const value = changes?.value as Record<string, unknown>;
    const messages = (value?.messages as Array<Record<string, unknown>>)?.[0];
    const metadata = value?.metadata as Record<string, unknown>;

    if (!messages || (messages.type as string) !== "text") return null;

    return {
      from: messages.from as string,
      messageId: messages.id as string,
      text: (messages.text as Record<string, string>)?.body ?? "",
      timestamp: messages.timestamp as string,
      phoneNumberId: metadata?.phone_number_id as string,
    };
  } catch {
    return null;
  }
}
