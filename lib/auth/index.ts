import { auth, currentUser } from "@clerk/nextjs/server";
import { getBuilderByClerkId, upsertBuilder } from "@/lib/db/queries/builders";
import type { Builder } from "@/lib/db/schema";

export async function getCurrentUser(): Promise<Builder | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existingBuilder = await getBuilderByClerkId(userId);
  if (existingBuilder) return existingBuilder;

  // Fallback for local/dev environments where Clerk webhooks may not be configured.
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) return null;

  return upsertBuilder({
    clerkId: clerkUser.id,
    email: primaryEmail,
    fullName:
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      null,
    imageUrl: clerkUser.imageUrl ?? null,
  });
}

export async function requireUser(): Promise<Builder> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
