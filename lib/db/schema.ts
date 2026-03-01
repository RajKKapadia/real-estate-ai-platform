import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  smallint,
  bigint,
  integer,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const builder = pgTable("builder", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  clerkId: text().unique().notNull(),
  email: text().notNull(),
  fullName: text(),
  imageUrl: text(),
  createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
});

export const builderDetails = pgTable("builder_details", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  builderId: uuid()
    .notNull()
    .unique()
    .references(() => builder.id, { onDelete: "cascade" })
    .notNull(),
  agentName: text().notNull(),
  property: text().notNull(),
  description: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
});

export const projects = pgTable("projects", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  builderId: uuid()
    .notNull()
    .references(() => builder.id, { onDelete: "cascade" }),
  name: text().notNull(),
  location: text().notNull(),
  propertyType: text().notNull(),
  bhk: smallint().notNull(),
  priceRangeMin: bigint({ mode: "number" }),
  priceRangeMax: bigint({ mode: "number" }),
  additionalFacilities: text().array(),
  description: text(),
  createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
});

export const projectDocuments = pgTable("project_documents", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  projectId: uuid()
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  fileName: text().notNull(),
  fileType: text().notNull(),
  storagePath: text().notNull(),
  publicUrl: text().notNull(),
  sizeBytes: integer(),
  createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
});

export const leads = pgTable("leads", {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  builderId: uuid()
    .notNull()
    .references(() => builder.id, { onDelete: "cascade" }),
  sessionId: uuid().notNull(),
  userId: text().notNull(),
  name: text().notNull(),
  mobile: text().notNull(),
  mobileVerified: boolean().default(false),
  platform: text().notNull(),
  metadata: jsonb().default({}),
  createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    builderId: uuid()
      .notNull()
      .references(() => builder.id, { onDelete: "cascade" }),
    platform: text().notNull(),
    userId: text().notNull(),
    leadId: uuid().references(() => leads.id, { onDelete: "set null" }),
    metadata: jsonb().default({}),
    createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
    updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  },
  (t) => [unique().on(t.builderId, t.platform, t.userId)]
);

export const sessionItems = pgTable(
  "session_items",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
    sessionId: uuid()
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    itemData: jsonb().notNull(),
    sequence: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  },
  (t) => [
    index("session_items_seq_idx").on(t.sessionId, t.sequence),
    unique("session_items_seq_unique").on(t.sessionId, t.sequence),
  ]
);

export const connections = pgTable(
  "connections",
  {
    id: uuid().primaryKey().default(sql`gen_random_uuid()`),
        builderId: uuid()
      .notNull()
      .references(() => builder.id, { onDelete: "cascade" }),
    connectionType: text().notNull(),
    allowedDomain: text(),
    embedScriptTag: text(),
    metaAccessToken: text(),
    metaAppSecret: text(),
    senderPhoneId: text(),
    webhookVerifyToken: text(),
    webhookUrl: text(),
    is_active: boolean().default(true),
    createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
    updatedAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
  },
  (t) => [unique().on(t.builderId, t.connectionType)]
);

/**
 * Token usage table - tracks LLM token consumption for analytics and billing
 */
export const tokenUsage = pgTable('token_usage', {
  id: uuid().primaryKey().default(sql`gen_random_uuid()`),
  userId: text().notNull(),
  sessionId: uuid('session_id'),
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  model: text(),
  operationType: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).default(sql`now()`).notNull(),
}, (table) => [
  index('token_usage_user_idx').on(table.userId),
  index('token_usage_created_at_idx').on(table.createdAt),
]);

// Inferred types for use across the app
export type Builder = typeof builder.$inferSelect;
export type BuilderDetails = typeof builderDetails.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type Lead = typeof leads.$inferSelect;  
export type Session = typeof sessions.$inferSelect;
export type SessionItem = typeof sessionItems.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type TokenUsage = typeof tokenUsage.$inferSelect;
export type NewTokenUsage = typeof tokenUsage.$inferInsert;
