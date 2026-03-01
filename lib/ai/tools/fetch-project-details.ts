import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import { getProjectsByBuilderId } from "@/lib/db/queries/projects";
import type { UserContext } from "@/lib/user.types";

export const fetchProjectDetails = tool({
  name: "fetch_project_details",
  description:
    "Fetch the builder's real estate project information from the database. This is your ONLY source of project data — call this tool whenever the user asks about properties, pricing, locations, amenities, or availability.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Optional search query to filter projects (e.g. property type, location, BHK)"
      ),
  }),
  async execute({ query }, ctx?: RunContext<UserContext>) {
    const { builderId } = ctx!.context;
    const projects = await getProjectsByBuilderId(builderId);

    if (projects.length === 0) {
      return { projects: [], message: "No projects currently available." };
    }

    let filtered = projects;
    if (query) {
      const q = query.toLowerCase();
      filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.propertyType.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    return {
      projects: filtered.map((p) => ({
        name: p.name,
        location: p.location,
        propertyType: p.propertyType,
        bhk: p.bhk,
        priceRangeMin: p.priceRangeMin,
        priceRangeMax: p.priceRangeMax,
        additionalFacilities: p.additionalFacilities,
        description: p.description,
      })),
    };
  },
});
