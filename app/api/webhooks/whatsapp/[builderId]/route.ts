import { NextRequest } from "next/server";
import { getConnectionByType } from "@/lib/db/queries/connections";
import {
  verifyWebhookSignature,
  parseWebhookPayload,
} from "@/lib/whatsapp/webhook";
import { whatsappQueue } from "@/lib/queue/whatsapp-queue";
import { decryptIfNeeded } from "@/lib/encryption";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ builderId: string }> }
) {
  const { builderId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!mode || !token || !challenge) {
    return new Response("Missing params", { status: 400 });
  }

  const connection = await getConnectionByType(builderId, "whatsapp");
  if (!connection) {
    return new Response("No WhatsApp connection", { status: 404 });
  }

  const verifyToken = connection.webhookVerifyToken ?? null;

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ builderId: string }> }
) {
  const { builderId } = await params;

  const connection = await getConnectionByType(builderId, "whatsapp");
  if (!connection || !connection.metaAppSecret) {
    return new Response("No WhatsApp connection", { status: 404 });
  }

  const signature = req.headers.get("x-hub-signature-256") || "";
  const rawBody = await req.text();

  const appSecret = decryptIfNeeded(connection.metaAppSecret);
  if (!verifyWebhookSignature(rawBody, signature, appSecret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const message = parseWebhookPayload(body);

  if (message) {
    await whatsappQueue.add("process-message", {
      builderId,
      message,
    }, {
      jobId: `${builderId}:${message.messageId}`,
    });
  }

  return new Response("OK", { status: 200 });
}
