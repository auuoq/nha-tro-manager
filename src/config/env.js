"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    AUTH_SECRET: zod_1.z.string().min(1, "AUTH_SECRET is required"),
    APP_URL: zod_1.z.string().url().default("http://localhost:3000"),
    STORAGE_PRIVATE_BUCKET: zod_1.z.string().optional().default("private-cccd"),
    PAYMENT_WEBHOOK_SECRET: zod_1.z.string().optional().default("webhook-secret-key"),
});
function parseEnv() {
    const result = envSchema.safeParse({
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
        APP_URL: process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
        STORAGE_PRIVATE_BUCKET: process.env.STORAGE_PRIVATE_BUCKET,
        PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
    });
    if (!result.success) {
        console.error("❌ Environment validation error:", result.error.format());
        throw new Error("INVALID_ENV_CONFIGURATION");
    }
    return result.data;
}
exports.env = parseEnv();
