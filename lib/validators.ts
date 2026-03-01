import { z } from "zod";

export const builderSchema = z.object({
  agentName: z.string().min(1, "Agent name is required").max(100),
  property: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
});

export type BuilderInput = z.infer<typeof builderSchema>;

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  location: z.string().min(1, "Location is required").max(300),
  propertyType: z.enum(["flat", "apartment", "villa", "plot", "commercial"]),
  bhk: z.coerce.number().int().min(1).max(5),
  priceRangeMin: z.coerce.number().int().positive().optional(),
  priceRangeMax: z.coerce.number().int().positive().optional(),
  additionalFacilities: z
    .string()
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .optional(),
  description: z.string().max(5000).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const websiteConnectionSchema = z.object({
  allowedDomain: z
    .string()
    .min(1, "Domain is required")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/,
      "Enter a valid domain (e.g. example.com)"
    ),
});

export type WebsiteConnectionInput = z.infer<typeof websiteConnectionSchema>;

export const whatsappConnectionSchema = z.object({
  metaAccessToken: z.string().min(1, "Access token is required"),
  metaAppSecret: z.string().min(1, "App secret is required"),
  senderPhoneId: z.string().min(1, "Phone number ID is required"),
});

export type WhatsAppConnectionInput = z.infer<typeof whatsappConnectionSchema>;

export const leadUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  mobile: z.string().min(1).max(20).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
