import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { connections, type Connection } from "@/lib/db/schema";

export async function getConnectionsByBuilderId(
  builderId: string
): Promise<Connection[]> {
  return db
    .select()
    .from(connections)
    .where(eq(connections.builderId, builderId));
}

export async function getConnectionByType(
  builderId: string,
  connectionType: "website" | "whatsapp"
): Promise<Connection | null> {
  const rows = await db
    .select()
    .from(connections)
    .where(
      and(
        eq(connections.builderId, builderId),
        eq(connections.connectionType, connectionType)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertConnection(connection: {
  builderId: string;
  connectionType: "website" | "whatsapp";
  allowedDomain?: string | null;
  embedScriptTag?: string | null;
  metaAccessToken?: string | null;
  metaAppSecret?: string | null;
  senderPhoneId?: string | null;
  webhookVerifyToken?: string | null;
  webhookUrl?: string | null;
  is_active?: boolean;
}): Promise<Connection> {
  const rows = await db
    .insert(connections)
    .values(connection)
    .onConflictDoUpdate({
      target: [connections.builderId, connections.connectionType],
      set: {
        allowedDomain: connection.allowedDomain ?? null,
        embedScriptTag: connection.embedScriptTag ?? null,
        metaAccessToken: connection.metaAccessToken ?? null,
        metaAppSecret: connection.metaAppSecret ?? null,
        senderPhoneId: connection.senderPhoneId ?? null,
        webhookVerifyToken: connection.webhookVerifyToken ?? null,
        webhookUrl: connection.webhookUrl ?? null,
        is_active: connection.is_active ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  return rows[0];
}
