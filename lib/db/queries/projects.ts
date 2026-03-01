import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, type Project } from "@/lib/db/schema";

export async function getProjectsByBuilderId(
  builderId: string
): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(eq(projects.builderId, builderId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProject(project: {
  builderId: string;
  name: string;
  location: string;
  propertyType: string;
  bhk: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  additionalFacilities?: string[];
  description?: string;
}): Promise<Project> {
  const rows = await db.insert(projects).values(project).returning();
  return rows[0];
}

export async function updateProject(
  id: string,
  updates: Partial<
    Pick<
      Project,
      | "name"
      | "location"
      | "propertyType"
      | "bhk"
      | "priceRangeMin"
      | "priceRangeMax"
      | "additionalFacilities"
      | "description"
    >
  >
): Promise<Project> {
  const rows = await db
    .update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return rows[0];
}

export async function deleteProject(id: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}
