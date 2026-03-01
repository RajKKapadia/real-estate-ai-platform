import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { builder, type Builder } from "@/lib/db/schema";

export async function getBuilderByClerkId(
  clerkId: string
): Promise<Builder | null> {
  const rows = await db
    .select()
    .from(builder)
    .where(eq(builder.clerkId, clerkId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertBuilder(data: {
  clerkId: string;
  email: string;
  fullName?: string | null;
  imageUrl?: string | null;
}): Promise<Builder> {
  const rows = await db
    .insert(builder)
    .values({
      clerkId: data.clerkId,
      email: data.email,
      fullName: data.fullName ?? null,
      imageUrl: data.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: builder.clerkId,
      set: {
        email: data.email,
        fullName: data.fullName ?? null,
        imageUrl: data.imageUrl ?? null,
        updatedAt: new Date(),
      },
    })
    .returning();
  return rows[0];
}

export async function deleteBuilderByClerkId(clerkId: string): Promise<void> {
  await db.delete(builder).where(eq(builder.clerkId, clerkId));
}
