import { z } from "zod";

export const addContractMemberSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  tenantId: z.string().uuid("ID khách thuê không hợp lệ"),
});

export type AddContractMemberInput = z.infer<typeof addContractMemberSchema>;

export const changePrimaryTenantSchema = z.object({
  contractId: z.string().uuid("ID hợp đồng không hợp lệ"),
  newPrimaryTenantId: z.string().uuid("ID khách thuê đại diện mới không hợp lệ"),
});

export type ChangePrimaryTenantInput = z.infer<typeof changePrimaryTenantSchema>;
