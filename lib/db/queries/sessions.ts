import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  sessions,
  sessionItems,
  type Session,
  type SessionItem,
} from "@/lib/db/schema";

export async function getSessionsByBuilderId(
  builderId: string
): Promise<(Session & { itemCount: number })[]> {
  const rows = await db
    .select({
      id: sessions.id,
      builderId: sessions.builderId,
      platform: sessions.platform,
      userId: sessions.userId,
      leadId: sessions.leadId,
      metadata: sessions.metadata,
      createdAt: sessions.createdAt,
      updatedAt: sessions.updatedAt,
      itemCount: sql<number>`coalesce(${count(sessionItems.id)}, 0)::int`,
    })
    .from(sessions)
    .leftJoin(sessionItems, eq(sessionItems.sessionId, sessions.id))
    .where(eq(sessions.builderId, builderId))
    .groupBy(sessions.id)
    .orderBy(desc(sessions.updatedAt));

  return rows as (Session & { itemCount: number })[];
}

export async function getSessionById(id: string): Promise<Session | null> {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getOrCreateSession(session: {
  builderId: string;
  platform: "website" | "whatsapp";
  userId: string;
}): Promise<Session> {
  const existing = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.builderId, session.builderId),
        eq(sessions.platform, session.platform),
        eq(sessions.userId, session.userId)
      )
    )
    .limit(1);

  if (existing[0]) return existing[0];

  const rows = await db.insert(sessions).values(session).returning();
  return rows[0];
}

export async function getSessionItemsBySessionId(
  sessionId: string
): Promise<SessionItem[]> {
  return db
    .select()
    .from(sessionItems)
    .where(eq(sessionItems.sessionId, sessionId))
    .orderBy(asc(sessionItems.sequence));
}

export async function updateSessionLead(
  sessionId: string,
  leadId: string
): Promise<void> {
  await db
    .update(sessions)
    .set({ leadId, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));
}
