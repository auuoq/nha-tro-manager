export interface PrivateStorageInput {
  buffer: Buffer;
  originalFilename: string;
  category: "cccd" | "meter";
  ownerId: string;
  entityId: string; // tenantId or roomId
  subId?: string; // side ("front"/"back") or readingId
}

export interface PrivateStorageProvider {
  upload(input: PrivateStorageInput): Promise<{ success: boolean; storagePath?: string; error?: string }>;
  createSignedReadUrl(storagePath: string, expiresInSeconds?: number): Promise<string>;
  remove(storagePath: string): Promise<void>;
}
