import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PrivateStorageInput, PrivateStorageProvider } from "./private-storage.provider";
import { validateImageFileBuffer } from "../file-validation";
import { env } from "../../../config/env";

export class SupabasePrivateStorageProvider implements PrivateStorageProvider {
  private client: SupabaseClient | null = null;

  constructor() {
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      this.client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
    }
  }

  private getBucketName(category: "cccd" | "meter"): string {
    return category === "cccd"
      ? env.SUPABASE_TENANT_BUCKET || "tenant-id-cards"
      : env.SUPABASE_METER_BUCKET || "meter-readings";
  }

  async upload(input: PrivateStorageInput): Promise<{ success: boolean; storagePath?: string; error?: string }> {
    if (!this.client) {
      return { success: false, error: "Supabase client chưa được cấu hình. Thêm SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY." };
    }

    const validation = validateImageFileBuffer(input.buffer, input.originalFilename);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const ext = validation.detectedMime === "image/png" ? "png" : validation.detectedMime === "image/webp" ? "webp" : "jpg";
    const uuid = crypto.randomUUID();
    const bucket = this.getBucketName(input.category);

    // Object path structure:
    // cccd: owners/{ownerId}/tenants/{tenantId}/{subId}/{uuid}.jpg
    // meter: owners/{ownerId}/meters/{entityId}/{subId}/{uuid}.jpg
    const subFolder = input.subId ? `${input.subId}/` : "";
    const objectPath = `owners/${input.ownerId}/${input.category === "cccd" ? "tenants" : "meters"}/${input.entityId}/${subFolder}${uuid}.${ext}`;

    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .upload(objectPath, input.buffer, {
          contentType: validation.detectedMime,
          upsert: true,
        });

      if (error) {
        console.error("Supabase Storage Upload Error:", error);
        return { success: false, error: `Lỗi Supabase storage: ${error.message}` };
      }

      // Store relative reference: bucket:objectPath
      const storagePath = `${bucket}:${data.path}`;
      return { success: true, storagePath };
    } catch (err: any) {
      console.error("Supabase Storage Upload Exception:", err);
      return { success: false, error: "Lỗi kết nối Supabase Storage" };
    }
  }

  async createSignedReadUrl(storagePath: string, expiresInSeconds = 300): Promise<string> {
    if (!this.client) {
      return "/placeholder-signed-url";
    }

    const ttl = Math.min(expiresInSeconds, 300);

    let bucket = env.SUPABASE_TENANT_BUCKET || "tenant-id-cards";
    let objectPath = storagePath;

    if (storagePath.includes(":")) {
      const parts = storagePath.split(":");
      bucket = parts[0];
      objectPath = parts.slice(1).join(":");
    }

    try {
      const { data, error } = await this.client.storage
        .from(bucket)
        .createSignedUrl(objectPath, ttl);

      if (error || !data?.signedUrl) {
        console.error("Supabase Create Signed URL Error:", error);
        return "";
      }

      return data.signedUrl;
    } catch (err) {
      console.error("Supabase Signed URL Exception:", err);
      return "";
    }
  }

  async remove(storagePath: string): Promise<void> {
    if (!this.client) return;

    let bucket = env.SUPABASE_TENANT_BUCKET || "tenant-id-cards";
    let objectPath = storagePath;

    if (storagePath.includes(":")) {
      const parts = storagePath.split(":");
      bucket = parts[0];
      objectPath = parts.slice(1).join(":");
    }

    try {
      await this.client.storage.from(bucket).remove([objectPath]);
    } catch (err) {
      console.error("Supabase Delete Object Error:", err);
    }
  }
}
