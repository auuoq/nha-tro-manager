import { requireSuperAdmin } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { generateRandomTempPassword, hashPassword } from "@/server/auth/auth-service";
import { createOwnerSchema, CreateOwnerInput } from "../schemas/owner.schema";
import { createOwnerInTx } from "../repositories/owner-write.repository";
import { CreateOwnerResult } from "../types/owner.types";

export async function createOwnerService(input: CreateOwnerInput): Promise<CreateOwnerResult> {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireSuperAdmin(session.user);

  const validated = createOwnerSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    // Check phone / email conflict
    const existingUser = await tx.user.findFirst({
      where: {
        OR: [
          { phone: validated.phone },
          ...(validated.email ? [{ email: validated.email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new Error("CONFLICT_PHONE_OR_EMAIL_ALREADY_EXISTS");
    }

    const tempPassword = generateRandomTempPassword(8);
    const passwordHash = await hashPassword(tempPassword);

    const newOwnerUser = await createOwnerInTx(tx, {
      phone: validated.phone,
      email: validated.email,
      passwordHash,
      fullName: validated.fullName,
      businessName: validated.businessName,
      taxCode: validated.taxCode,
      address: validated.address,
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_OWNER_ACCOUNT",
        entity: "User",
        entityId: newOwnerUser.id,
        details: JSON.stringify({ phone: newOwnerUser.phone, fullName: newOwnerUser.fullName }),
      },
    });

    return {
      ownerId: newOwnerUser.id,
      fullName: newOwnerUser.fullName,
      phone: newOwnerUser.phone,
      tempPassword,
    };
  });
}
