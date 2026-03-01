import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, type Lead } from "@/lib/db/schema";

export async function getLeadsByBuilderId(
  builderId: string
): Promise<Lead[]> {
  return db
    .select()
    .from(leads)
    .where(eq(leads.builderId, builderId))
    .orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const rows = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createLead(lead: {
  builderId: string;
  userId: string;
  sessionId: string;
  name: string;
  mobile: string;
  platform: "website" | "whatsapp";
  metadata?: Record<string, unknown>;
}): Promise<Lead> {
  const rows = await db
    .insert(leads)
    .values({
      builderId: lead.builderId,
      sessionId: lead.sessionId,
      userId: lead.userId,
      name: lead.name,
      mobile: lead.mobile,
      mobileVerified: lead.platform === "whatsapp",
      platform: lead.platform,
      metadata: lead.metadata ?? {},
    })
    .returning();
  return rows[0];
}

export async function getLeadByMobileAndBuilder(
  mobile: string,
  builderId: string
): Promise<Lead | null> {
  const rows = await db
    .select()
    .from(leads)
    .where(and(eq(leads.mobile, mobile), eq(leads.builderId, builderId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLeadBySessionId(
  sessionId: string
): Promise<Lead | null> {
  const rows = await db
    .select()
    .from(leads)
    .where(eq(leads.sessionId, sessionId))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateLead(
  id: string,
  updates: Partial<
    Pick<Lead, "name" | "mobile" | "mobileVerified" | "metadata">
  >
): Promise<Lead> {
  const rows = await db
    .update(leads)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning();
  return rows[0];
}
