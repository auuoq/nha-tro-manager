import { requireOwner } from "@/server/permissions/rbac";
import { getServerSession } from "@/server/auth/session";
import { runSerializableTransaction } from "@/server/database/run-serializable-transaction";
import { resolveChargeConfigService } from "./resolve-charge-config.service";
import { calculateMeteredChargeService } from "./calculate-metered-charge.service";
import { calculatePerPersonChargeService } from "./calculate-per-person-charge.service";
import { createDraftInvoiceSchema, CreateDraftInvoiceInput } from "../schemas/invoice.schema";
import { ContractStatus, ChargeType, InvoiceItemType, ChargeMethod, InvoiceStatus } from "@prisma/client";

export async function generateUniqueInvoiceCode(tx: any): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  let attempts = 0;
  while (attempts < 10) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `INV-${dateStr}-${randomHex}`;
    const existing = await tx.invoice.findUnique({ where: { invoiceCode: code } });
    if (!existing) return code;
    attempts++;
  }
  throw new Error("CANNOT_GENERATE_UNIQUE_INVOICE_CODE");
}

export async function createDraftInvoiceService(input: CreateDraftInvoiceInput) {
  const session = await getServerSession();
  if (!session?.user) throw new Error("UNAUTHORIZED");
  requireOwner(session.user);

  const validated = createDraftInvoiceSchema.parse(input);

  return runSerializableTransaction(async (tx) => {
    // 1. Verify Contract ownership & status
    const contract = await tx.contract.findUnique({
      where: { id: validated.contractId },
      include: {
        room: {
          select: {
            id: true,
            buildingId: true,
            building: { select: { ownerId: true } },
          },
        },
      },
    });

    if (!contract || contract.room.building.ownerId !== session.user.id) {
      throw new Error("FORBIDDEN_NOT_CONTRACT_OWNER");
    }

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new Error("CANNOT_CREATE_INVOICE_FOR_NON_ACTIVE_CONTRACT: Chỉ có thể tạo hóa đơn cho Hợp đồng đang hoạt động (ACTIVE).");
    }

    // 2. Check existing active invoice for this period
    const existingActiveInvoice = await tx.invoice.findFirst({
      where: {
        contractId: validated.contractId,
        billingPeriod: validated.billingPeriod,
        status: { in: ["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE"] },
        deletedAt: null,
      },
    });

    if (existingActiveInvoice) {
      throw new Error(
        `CONFLICT_INVOICE_ALREADY_EXISTS: Hóa đơn kỳ ${validated.billingPeriod} cho hợp đồng này đã tồn tại ở trạng thái ${existingActiveInvoice.status}.`
      );
    }

    // 3. Determine Revision Number
    const lastRev = await tx.invoice.aggregate({
      where: { contractId: validated.contractId, billingPeriod: validated.billingPeriod },
      _max: { revision: true },
    });
    const revision = (lastRev._max.revision || 0) + 1;

    // 4. Cutoff Date
    const [year, month] = validated.billingPeriod.split("-").map(Number);
    const cutoffDate = new Date(year, month, 0, 23, 59, 59); // Last second of the month
    const dueDate = new Date(year, month - 1, contract.billingDay || 5);

    const invoiceCode = await generateUniqueInvoiceCode(tx);

    // 5. Build Items Array
    const itemsData: any[] = [];
    let sortOrder = 1;

    // Item 1: Room Rent
    const roomPrice = Number(contract.monthlyPrice);
    itemsData.push({
      type: InvoiceItemType.ROOM,
      description: `Tiền thuê phòng tháng ${validated.billingPeriod}`,
      quantity: 1,
      unit: "tháng",
      unitPrice: roomPrice,
      amount: roomPrice,
      sortOrder: sortOrder++,
      calculationMetadata: {
        contractId: contract.id,
        monthlyPrice: roomPrice,
        billingPeriod: validated.billingPeriod,
      },
    });

    // Charges to resolve
    const chargeTypes: ChargeType[] = [
      ChargeType.ELECTRICITY,
      ChargeType.WATER,
      ChargeType.WIFI,
      ChargeType.GARBAGE,
      ChargeType.PARKING,
    ];

    for (const cType of chargeTypes) {
      try {
        const resolved = await resolveChargeConfigService(tx, {
          contractId: contract.id,
          roomId: contract.roomId,
          buildingId: contract.room.buildingId,
          chargeType: cType,
          targetDate: cutoffDate,
        });

        if (resolved.chargeMethod === ChargeMethod.FREE) {
          itemsData.push({
            type: cType as unknown as InvoiceItemType,
            description: `Phí ${cType} (Miễn phí)`,
            quantity: 1,
            unit: "lần",
            unitPrice: 0,
            amount: 0,
            sortOrder: sortOrder++,
            calculationMetadata: { chargeMethod: "FREE", sourceLevel: resolved.sourceLevel },
          });
          continue;
        }

        if (resolved.chargeMethod === ChargeMethod.METERED) {
          const meteredResult = await calculateMeteredChargeService(tx, {
            roomId: contract.roomId,
            meterType: cType as unknown as any,
            billingPeriod: validated.billingPeriod,
          });

          const amount = meteredResult.totalConsumption * resolved.unitPrice;
          itemsData.push({
            type: cType as unknown as InvoiceItemType,
            description: `Tiền ${cType === "ELECTRICITY" ? "Điện" : "Nước"} kỳ ${validated.billingPeriod} (${meteredResult.totalConsumption} ${cType === "ELECTRICITY" ? "kWh" : "m³"})`,
            quantity: meteredResult.totalConsumption,
            unit: cType === "ELECTRICITY" ? "kWh" : "m³",
            unitPrice: resolved.unitPrice,
            amount,
            meterReadingId: meteredResult.readingId,
            previousReading: meteredResult.previousReading,
            currentReading: meteredResult.currentReading,
            sortOrder: sortOrder++,
            calculationMetadata: {
              sourceLevel: resolved.sourceLevel,
              ...meteredResult.metadata,
            },
          });
        } else if (resolved.chargeMethod === ChargeMethod.PER_PERSON) {
          const perPersonResult = await calculatePerPersonChargeService(tx, {
            contractId: contract.id,
            cutoffDate,
          });

          const amount = perPersonResult.activeTenantCount * resolved.unitPrice;
          itemsData.push({
            type: cType as unknown as InvoiceItemType,
            description: `Phí ${cType} theo đầu người (${perPersonResult.activeTenantCount} người)`,
            quantity: perPersonResult.activeTenantCount,
            unit: "người",
            unitPrice: resolved.unitPrice,
            amount,
            sortOrder: sortOrder++,
            calculationMetadata: {
              sourceLevel: resolved.sourceLevel,
              ...perPersonResult.metadata,
            },
          });
        } else if (resolved.chargeMethod === ChargeMethod.PER_ROOM) {
          itemsData.push({
            type: cType as unknown as InvoiceItemType,
            description: `Phí ${cType} cố định theo phòng`,
            quantity: 1,
            unit: "phòng",
            unitPrice: resolved.unitPrice,
            amount: resolved.unitPrice,
            sortOrder: sortOrder++,
            calculationMetadata: { sourceLevel: resolved.sourceLevel },
          });
        }
      } catch (err: any) {
        // If optional charge is missing config, log note or throw if electricity/water
        if (cType === ChargeType.ELECTRICITY || cType === ChargeType.WATER) {
          throw err;
        }
      }
    }

    const subtotalAmount = itemsData.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = subtotalAmount;

    // 6. Create Invoice & Items
    const invoice = await tx.invoice.create({
      data: {
        invoiceCode,
        roomId: contract.roomId,
        contractId: contract.id,
        billingPeriod: validated.billingPeriod,
        revision,
        dueDate,
        subtotalAmount,
        discountAmount: 0,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: InvoiceStatus.DRAFT,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_DRAFT_INVOICE",
        entity: "Invoice",
        entityId: invoice.id,
        details: JSON.stringify({
          invoiceCode,
          contractId: contract.id,
          billingPeriod: validated.billingPeriod,
          totalAmount,
        }),
      },
    });

    return invoice;
  });
}
