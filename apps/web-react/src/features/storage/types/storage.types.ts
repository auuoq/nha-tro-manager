export interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
}

export interface UploadResponse {
  key: string;
  url?: string;
}
