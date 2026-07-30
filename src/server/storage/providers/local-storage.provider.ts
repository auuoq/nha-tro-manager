import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PrivateStorageInput, PrivateStorageProvider } from "./private-storage.provider";
import { validateImageFileBuffer } from "../file-validation";
import { generateCCCDSignedUrl } from "../signed-url.service";

export class LocalPrivateStorageProvider implements PrivateStorageProvider {
  async upload(input: PrivateStorageInput): Promise<{ success: boolean; storagePath?: string; error?: string }> {
    const validation = validateImageFileBuffer(input.buffer, input.originalFilename);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const folderName = input.category === "cccd" ? "private-cccd" : "private-meters";
    const storageRoot = path.join(process.cwd(), "storage", folderName);

    if (!fs.existsSync(storageRoot)) {
      fs.mkdirSync(storageRoot, { recursive: true });
    }

    const ext = validation.detectedMime === "image/png" ? "png" : validation.detectedMime === "image/webp" ? "webp" : "jpg";
    const uniqueFilename = `${crypto.randomUUID()}.${ext}`;
    const fullPath = path.join(storageRoot, uniqueFilename);

    try {
      fs.writeFileSync(fullPath, input.buffer);
      const relativePath = `${folderName}/${uniqueFilename}`;
      return { success: true, storagePath: relativePath };
    } catch (err) {
      console.error("Failed to write local private file:", err);
      return { success: false, error: "Lỗi lưu file storage local" };
    }
  }

  async createSignedReadUrl(storagePath: string, expiresInSeconds = 300): Promise<string> {
    if (storagePath.startsWith("private-cccd/")) {
      // Local signed route fallback
      const tenantId = storagePath.replace("private-cccd/", "").split(".")[0];
      const { url } = generateCCCDSignedUrl(tenantId, "FRONT", expiresInSeconds);
      return url;
    }
    return `/api/storage/meter-reading?path=${encodeURIComponent(storagePath)}`;
  }

  async remove(storagePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), "storage", storagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (e) {
      console.error("Failed to delete local private file:", e);
    }
  }
}
