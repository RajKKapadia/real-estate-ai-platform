import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { builderDetails, type BuilderDetails } from "@/lib/db/schema";

export async function getBuilderDetailsByBuilderId(
  builderId: string
): Promise<BuilderDetails[]> {
  return db
    .select()
    .from(builderDetails)
    .where(eq(builderDetails.builderId, builderId))
    .orderBy(desc(builderDetails.createdAt));
}

export async function getBuilderById(
  builderId: string
): Promise<BuilderDetails | null> {
  const rows = await db
    .select()
    .from(builderDetails)
    .where(eq(builderDetails.builderId, builderId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBuilderDetailsById(
  id: string
): Promise<BuilderDetails | null> {
  const rows = await db
    .select()
    .from(builderDetails)
    .where(eq(builderDetails.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createBuilderDetails(data: {
  builderId: string;
  agentName: string;
  property?: string;
  description?: string;
}): Promise<BuilderDetails> {
  const rows = await db
    .insert(builderDetails)
    .values({
      builderId: data.builderId,
      agentName: data.agentName,
      property: data.property ?? "",
      description: data.description ?? "",
    })
    .returning();
  return rows[0];
}

export { createBuilderDetails as createBuilder };

export async function updateBuilderDetails(
  id: string,
  updates: Partial<Pick<BuilderDetails, "agentName" | "property" | "description">>
): Promise<BuilderDetails> {
  const rows = await db
    .update(builderDetails)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(builderDetails.id, id))
    .returning();
  return rows[0];
}

export { updateBuilderDetails as updateBuilder };

export async function deleteBuilderDetails(id: string): Promise<void> {
  await db.delete(builderDetails).where(eq(builderDetails.id, id));
}

export { deleteBuilderDetails as deleteBuilder };

export { getBuilderDetailsByBuilderId as getBuildersByUserId };
