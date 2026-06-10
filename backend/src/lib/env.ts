import { z } from "zod";
import { logger } from "./logger";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().min(1, "PORT is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ALLOWED_ORIGIN: z.string().default("*"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  JWT_SECRET: z.string().default("dev-only-secret-change-for-production"),
  ADMIN_USERNAME: z.string().default("admin"),
  ADMIN_PASSWORD: z.string().default("admin123"),
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

  if (
    result.data.JWT_SECRET === "dev-only-secret-change-for-production" &&
    result.data.NODE_ENV === "production"
  ) {
    logger.warn("JWT_SECRET is using the default insecure value in production. Set a strong secret.");
  }

  return result.data;
}

export const env = validateEnv();
