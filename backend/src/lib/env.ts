import { z } from "zod";
import { logger } from "./logger";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().min(1, "PORT is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ALLOWED_ORIGIN: z.string().default("http://localhost:5000"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  
  // Supabase Auth & Database (required)
  SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required for auth"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  STORAGE_BUCKET: z.string().default("member-photos"),
});

function validateEnv() {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    logger.error(`\nMissing or invalid environment variables:\n${issues}\n`);
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
