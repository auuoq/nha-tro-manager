import { PrivateStorageProvider } from "./providers/private-storage.provider";
import { LocalPrivateStorageProvider } from "./providers/local-storage.provider";
import { SupabasePrivateStorageProvider } from "./providers/supabase-storage.provider";
import { env } from "../../config/env";

export function getPrivateStorageProvider(): PrivateStorageProvider {
  if (env.PRIVATE_STORAGE_PROVIDER === "supabase") {
    return new SupabasePrivateStorageProvider();
  }
  return new LocalPrivateStorageProvider();
}
