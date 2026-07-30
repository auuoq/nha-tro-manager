import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  PRIVATE_STORAGE_PROVIDER: z.enum(["local", "supabase"]).default("local"),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_TENANT_BUCKET: z.string().default("tenant-id-cards"),
  SUPABASE_METER_BUCKET: z.string().default("meter-readings"),
  PAYMENT_WEBHOOK_SECRET: z.string().optional().default("webhook-secret-key"),
});

function parseEnv() {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "nha-tro-manager-secret-key-staging-32-chars",
    APP_URL: process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
    PRIVATE_STORAGE_PROVIDER: process.env.PRIVATE_STORAGE_PROVIDER || "local",
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_TENANT_BUCKET: process.env.SUPABASE_TENANT_BUCKET || "tenant-id-cards",
    SUPABASE_METER_BUCKET: process.env.SUPABASE_METER_BUCKET || "meter-readings",
    PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || process.env.BANK_WEBHOOK_SECRET,
  });

  if (!result.success) {
    console.error("❌ Environment validation error:", result.error.format());
    throw new Error("INVALID_ENV_CONFIGURATION");
  }

  return result.data;
}

export const env = parseEnv();
