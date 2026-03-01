import { requireUser } from "@/lib/auth";
import type { Builder } from "@/lib/db/schema";

export async function requireBuilderOwnership(
  builderId: string
): Promise<Builder> {
  const user = await requireUser();

  if (user.id !== builderId) {
    throw new Error("Builder not found or access denied");
  }

  return user;
}
