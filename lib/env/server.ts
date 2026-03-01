import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
    emptyStringAsUndefined: true,
    server: {
        DATABASE_URL: z.string().url(),
        PASSOWRD: z.string(),
        NODE_ENV: z.string(),
        REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
        OPENAI_API_KEY: z.string(),
        CLERK_WEBHOOK_SECRET: z.string(),
        CLERK_SECRET_KEY: z.string(),
        ENCRYPTION_KEY: z.string(),
        NEXT_PUBLIC_APP_URL: z.string(),
        NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
    },
    experimental__runtimeEnv: process.env,
})
