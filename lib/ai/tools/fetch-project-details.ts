import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import { getProjectsByBuilderId } from "@/lib/db/queries/projects";
import type { UserContext } from "@/lib/user.types";
import type { Project } from "@/lib/db/schema";

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
};

const PROPERTY_TYPE_ALIASES: Record<string, string[]> = {
  flat: ["flat", "flats", "apartment", "apartments"],
  apartment: ["flat", "flats", "apartment", "apartments"],
  villa: ["villa", "villas"],
  plot: ["plot", "plots"],
  commercial: ["commercial", "office", "offices", "shop", "shops", "retail"],
};

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "any",
  "are",
  "available",
  "availability",
  "check",
  "currently",
  "do",
  "for",
  "has",
  "have",
  "in",
  "is",
  "list",
  "listed",
  "looking",
  "me",
  "near",
  "of",
  "or",
  "please",
  "project",
  "projects",
  "properties",
  "property",
  "show",
  "the",
  "there",
  "with",
  "you",
]);

const BEDROOM_TERMS = new Set([
  "bed",
  "beds",
  "bedroom",
  "bedrooms",
  "bhk",
  "room",
  "rooms",
]);

const PROPERTY_TYPE_TERMS = new Set(Object.values(PROPERTY_TYPE_ALIASES).flat());

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getRequestedBhk(query: string) {
  const digitMatch = query.match(/\b([1-5])\s*(?:bhk|bed|beds|bedroom|bedrooms)\b/);
  if (digitMatch) return Number(digitMatch[1]);

  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    const pattern = new RegExp(
      `\\b${word}\\s*(?:bhk|bed|beds|bedroom|bedrooms)\\b`
    );
    if (pattern.test(query)) return value;
  }

  return undefined;
}

function getRequestedPropertyTypes(query: string) {
  return Object.entries(PROPERTY_TYPE_ALIASES)
    .filter(([, aliases]) =>
      aliases.some((alias) => new RegExp(`\\b${alias}\\b`).test(query))
    )
    .map(([propertyType]) => propertyType);
}

function getSearchTokens(query: string) {
  const tokens = query.split(" ");
  const hasPoolToken = tokens.includes("pool") || tokens.includes("pools");
  const hasParkingToken =
    tokens.includes("parking") || tokens.includes("parkings");

  return tokens
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => !BEDROOM_TERMS.has(token))
    .filter((token) => !PROPERTY_TYPE_TERMS.has(token))
    .filter((token) => !Object.keys(NUMBER_WORDS).includes(token))
    .filter((token) => !(hasPoolToken && token === "swimming"))
    .filter((token) => !(hasParkingToken && token === "car"))
    .filter((token) => !/^[1-5]$/.test(token));
}

function getProjectSearchText(project: Project) {
  const facilities = project.additionalFacilities ?? [];

  return normalizeText(
    [
      project.name,
      project.location,
      project.propertyType,
      project.description,
      `${project.bhk} bhk`,
      `${project.bhk} bedroom`,
      `${project.bhk} bedrooms`,
      ...facilities,
    ].join(" ")
  );
}

function projectMatchesQuery(project: Project, query: string) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const requestedBhk = getRequestedBhk(normalizedQuery);
  if (requestedBhk !== undefined && project.bhk !== requestedBhk) {
    return false;
  }

  const requestedPropertyTypes = getRequestedPropertyTypes(normalizedQuery);
  if (
    requestedPropertyTypes.length > 0 &&
    !requestedPropertyTypes.includes(project.propertyType.toLowerCase())
  ) {
    return false;
  }

  const searchableText = getProjectSearchText(project);
  const searchTokens = getSearchTokens(normalizedQuery);

  if (searchTokens.length === 0) return true;
  return searchTokens.every((token) => searchableText.includes(token));
}

function formatProject(project: Project) {
  const additionalFacilities = project.additionalFacilities ?? [];

  return {
    name: project.name,
    location: project.location,
    propertyType: project.propertyType,
    bhk: project.bhk,
    bedrooms: project.bhk,
    bhkLabel: `${project.bhk} BHK`,
    priceRangeMin: project.priceRangeMin,
    priceRangeMax: project.priceRangeMax,
    additionalFacilities,
    amenities: additionalFacilities,
    description: project.description,
  };
}

function getAvailableFilters(projects: Project[]) {
  return {
    propertyTypes: [...new Set(projects.map((project) => project.propertyType))],
    bhk: [...new Set(projects.map((project) => project.bhk))].sort(
      (a, b) => a - b
    ),
    facilities: [
      ...new Set(
        projects.flatMap((project) => project.additionalFacilities ?? [])
      ),
    ].sort(),
  };
}

export const fetchProjectDetails = tool({
  name: "fetch_project_details",
  description:
    "Fetch the builder's real estate project information from the database. This is your ONLY source of project data — call this tool whenever the user asks about properties, pricing, locations, amenities, or availability.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Optional search query to filter projects by property type, location, BHK/bedroom count, amenity/facility, or description."
      ),
  }),
  async execute({ query }, ctx?: RunContext<UserContext>) {
    const { builderId } = ctx!.context;
    const projects = await getProjectsByBuilderId(builderId);

    if (projects.length === 0) {
      return { projects: [], message: "No projects currently available." };
    }

    const filtered = query
      ? projects.filter((project) => projectMatchesQuery(project, query))
      : projects;

    return {
      query: query ?? null,
      totalProjects: projects.length,
      matchedProjects: filtered.length,
      projects: filtered.map(formatProject),
      availableFilters: getAvailableFilters(projects),
      message:
        filtered.length === 0
          ? "No projects matched the requested criteria."
          : undefined,
    };
  },
});
