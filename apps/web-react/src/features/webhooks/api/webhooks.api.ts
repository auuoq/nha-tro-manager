import { apiClient } from "@/api/client";
import { WebhookEvent, WebhookMatchInput } from "../types/webhook.types";
import { PaginatedData, PaginationParams } from "@/shared/types/pagination";

export const webhooksApi = {
  listUnmatched: async (params?: PaginationParams): Promise<PaginatedData<WebhookEvent>> => {
    const res = await apiClient.get("/webhooks/bank/unmatched", { params });
    return res.data.data;
  },

  matchWebhook: async (eventId: string, data: WebhookMatchInput): Promise<void> => {
    await apiClient.post(`/webhooks/bank/${eventId}/match`, data);
  },
};
