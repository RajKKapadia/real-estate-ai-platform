import { run } from "@openai/agents";
import { getBuilderById } from "@/lib/db/queries/builders-detail";
import { getConnectionByType } from "@/lib/db/queries/connections";
import { getOrCreateSession } from "@/lib/db/queries/sessions";
import { realEstateAgent } from "@/lib/ai/agent";
import { DatabaseSession } from "@/lib/ai/agent-sessions";
import type { UserContext } from "@/lib/user.types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ builderId: string }> }
) {
  const { builderId } = await params;

  const builder = await getBuilderById(builderId);
  if (!builder) {
    return new Response("Builder not found", { status: 404 });
  }

  const origin = req.headers.get("origin");
  const connection = await getConnectionByType(builderId, "website");

  if (connection?.allowedDomain && origin) {
    const allowedOrigins = [
      `https://${connection.allowedDomain}`,
      `http://${connection.allowedDomain}`,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];
    if (!allowedOrigins.some((o) => origin.startsWith(o))) {
      return new Response("Origin not allowed", { status: 403 });
    }
  }

  const body = await req.json();
  const { messages, sessionId: externalId } = body as {
    messages: {
      id: string;
      role: string;
      parts: { type: string; text: string }[];
    }[];
    sessionId: string;
  };

  const session = await getOrCreateSession({
    builderId,
    platform: "website",
    externalId,
  });

  const context: UserContext = {
    builderId,
    userId: `conv-website-${externalId}`,
    platform: "website",
  };

  const dbSession = new DatabaseSession(session.id);

  const latestMessage = messages[messages.length - 1];
  const latestText = latestMessage.parts
    .filter(
      (p): p is { type: "text"; text: string } =>
        typeof p === "object" && "text" in p
    )
    .map((p) => p.text)
    .join("");

  const result = await run(realEstateAgent, latestText, {
    stream: true,
    context,
    maxTurns: 8,
    session: dbSession,
  });

  const textStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of result) {
          if (
            event.type === "raw_model_stream_event" &&
            event.data.type === "output_text_delta"
          ) {
            const delta = (event.data as { delta: string }).delta;
            controller.enqueue(new TextEncoder().encode(delta));
          }
        }
        await result.completed;
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return new Response(textStream, { status: 200, headers });
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
