export const APP_NAME = "RealEstateAI";

export const PROPERTY_TYPES = [
  "flat",
  "apartment",
  "villa",
  "plot",
  "commercial",
] as const;

export const BHK_OPTIONS = [1, 2, 3, 4, 5] as const;

export const PLATFORMS = ["website", "whatsapp"] as const;

export const CONNECTION_TYPES = ["website", "whatsapp"] as const;

export const MESSAGE_ROLES = ["user", "assistant"] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const REAL_ESTATE_AGENT_MODEL = "gpt-4.1-mini";
