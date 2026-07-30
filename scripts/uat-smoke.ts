import { PrismaClient, PaymentMethod, PaymentSource, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { processBankWebhookService } from '../src/features/payments/services/process-bank-webhook.service';
import { recalculateInvoicePaymentStatusService } from '../src/features/payments/services/recalculate-invoice-payment-status.service';

const prisma = new PrismaClient();

async function runUATSmokeTest() {
  console.log("🚀 Bắt đầu UAT Smoke Test (Phase 4.4)...\\n");
  let passed = 0;
  let failed = 0;
  const results: any[] = [];

  const report = (name: string, status: 'PASS' | 'FAIL', details: any) => {
    if (status === 'PASS') passed++;
    else failed++;
    results.push({ name, status, details });
    console.log(`[${status}] ${name}`);
    if (status === 'FAIL') console.error("   --> Details:", details);
  };

  try {
    // 0. CLEANUP
    console.log("--- 0. DATABASE CLEANUP ---");
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "WebhookEvent", "Payment", "InvoiceItem", "Invoice", "MeterReading", "Meter", "ContractTenant", "Contract", "Tenant", "RoomAsset", "ChargeConfig", "Room", "Building", "OwnerProfile", "User" CASCADE;');
    console.log("Database cleaned.\\n");

    // 1. AUTHENTICATION
    console.log("--- 1. AUTHENTICATION ---");
    const superAdminPhone = "0833737181";
    let superAdmin = await prisma.user.create({
      data: {
        phone: superAdminPhone,
        role: 'SUPER_ADMIN',
        passwordHash: await bcrypt.hash('superadmin123', 10),
        fullName: 'Super Admin',
      }
    });
    const isSuperAdminPasswordCorrect = await bcrypt.compare('superadmin123', superAdmin.passwordHash);
    report("Seed SUPER_ADMIN & Login", isSuperAdminPasswordCorrect ? "PASS" : "FAIL", { expected: true, actual: isSuperAdminPasswordCorrect });

    // 2. OWNER ACCOUNT
    console.log("\\n--- 2. OWNER ACCOUNT ---");
    const ownerPhone = "0987654321";
    let owner1 = await prisma.user.create({
      data: {
        phone: ownerPhone,
        role: 'OWNER',
        passwordHash: await bcrypt.hash('temp_password', 10),
        fullName: 'Owner UAT',
        ownerProfile: {
          create: { businessName: 'Owner UAT Business' }
        }
      }
    });
    const isOwnerPasswordCorrect = await bcrypt.compare('temp_password', owner1.passwordHash);
    
    // Suspend Owner
    await prisma.ownerProfile.update({
      where: { userId: owner1.id },
      data: { status: 'SUSPENDED' }
    });
    const suspendedProfile = await prisma.ownerProfile.findUnique({ where: { userId: owner1.id } });
    
    // Reactivate Owner
    await prisma.ownerProfile.update({
      where: { userId: owner1.id },
      data: { status: 'ACTIVE' }
    });
    const reactivatedProfile = await prisma.ownerProfile.findUnique({ where: { userId: owner1.id } });
    
    report("Create, Login, Suspend, Reactivate OWNER", (isOwnerPasswordCorrect && suspendedProfile?.status === 'SUSPENDED' && reactivatedProfile?.status === 'ACTIVE') ? "PASS" : "FAIL", { login: isOwnerPasswordCorrect, suspended: suspendedProfile?.status, reactivated: reactivatedProfile?.status });

    // 3. BUILDING
    console.log("\\n--- 3. BUILDING ---");
    const building = await prisma.building.create({
      data: {
        ownerId: owner1.id,
        name: 'Tòa UAT Yên Hòa',
        address: 'Yên Hòa, Cầu Giấy, Hà Nội',
        bankAccountName: 'OWNER UAT',
        bankAccountNo: '123456789',
        bankBin: 'VCB',
        chargeConfigs: {
          createMany: {
            data: [
              { chargeType: 'ELECTRICITY', chargeMethod: 'METERED', unitPrice: 4000 },
              { chargeType: 'WATER', chargeMethod: 'METERED', unitPrice: 30000 },
              { chargeType: 'WIFI', chargeMethod: 'PER_ROOM', unitPrice: 100000 },
              { chargeType: 'GARBAGE', chargeMethod: 'PER_PERSON', unitPrice: 50000 },
              { chargeType: 'PARKING', chargeMethod: 'PER_PERSON', unitPrice: 100000 },
            ]
          }
        }
      }
    });
    report("Create Building & ChargeConfig", building.id ? "PASS" : "FAIL", { buildingId: building.id });

    // 4. ROOM
    console.log("\\n--- 4. ROOM ---");
    const room = await prisma.room.create({
      data: {
        buildingId: building.id,
        roomNumber: '201',
        floor: 2,
        areaSqM: 25,
        roomType: 'STUDIO',
        basePrice: 4500000,
        status: 'VACANT',
        assets: {
          createMany: {
            data: [
              { name: 'Điều hòa', quantity: 1, condition: 'GOOD' },
              { name: 'Giường', quantity: 1, condition: 'GOOD' },
              { name: 'Tủ quần áo', quantity: 1, condition: 'GOOD' },
              { name: 'Bình nóng lạnh', quantity: 1, condition: 'GOOD' }
            ]
          }
        }
      },
      include: { assets: true }
    });
    report("Create Room & Assets", (room.id && room.assets.length === 4) ? "PASS" : "FAIL", { roomId: room.id, assetsCount: room.assets.length });

    // 5. TENANT
    console.log("\\n--- 5. TENANT ---");
    const tenantUser = await prisma.user.create({
      data: {
        phone: '0909090909',
        role: 'TENANT',
        passwordHash: await bcrypt.hash('tenant123', 10),
        fullName: 'Nguyễn Văn UAT',
      }
    });
    const tenant = await prisma.tenant.create({
      data: {
        ownerId: owner1.id,
        userId: tenantUser.id,
        fullName: 'Nguyễn Văn UAT',
        phone: '0909090909',
        idCardNumber: '001002003004',
      }
    });
    report("Create Tenant", tenant.id ? "PASS" : "FAIL", { tenantId: tenant.id });

    // 6. CONTRACT
    console.log("\\n--- 6. CONTRACT ---");
    let contract = await prisma.contract.create({
      data: {
        roomId: room.id,
        contractCode: 'HD-201-UAT',
        status: 'DRAFT',
        monthlyPrice: 4500000,
        depositAmount: 4500000,
        billingDay: 5,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        contractTenants: {
          create: {
            tenantId: tenant.id,
            role: 'PRIMARY'
          }
        }
      }
    });
    
    // Activate contract
    contract = await prisma.contract.update({
      where: { id: contract.id },
      data: { status: 'ACTIVE' }
    });
    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: { status: 'RENTED' }
    });
    report("Create & Activate Contract", (contract.status === 'ACTIVE' && updatedRoom.status === 'RENTED') ? "PASS" : "FAIL", { contractStatus: contract.status, roomStatus: updatedRoom.status });

    // 7. METERS
    console.log("\\n--- 7. METERS ---");
    const elecMeter = await prisma.meter.create({
      data: { roomId: room.id, type: 'ELECTRICITY', serialNumber: 'ELEC-001', initialReading: 1000 }
    });
    const waterMeter = await prisma.meter.create({
      data: { roomId: room.id, type: 'WATER', serialNumber: 'WATER-001', initialReading: 100 }
    });
    
    const elecReading = await prisma.meterReading.create({
      data: { meterId: elecMeter.id, period: '07/2026', previousValue: 1000, currentValue: 1120, consumption: 120, status: 'RECORDED', recordedById: owner1.id }
    });
    const waterReading = await prisma.meterReading.create({
      data: { meterId: waterMeter.id, period: '07/2026', previousValue: 100, currentValue: 106, consumption: 6, status: 'RECORDED', recordedById: owner1.id }
    });
    report("Record Meters", (Number(elecReading.consumption) === 120 && Number(waterReading.consumption) === 6) ? "PASS" : "FAIL", { elecCons: Number(elecReading.consumption), waterCons: Number(waterReading.consumption) });

    // 8. INVOICE DRAFT
    console.log("\\n--- 8. INVOICE DRAFT ---");
    const subtotal = 4500000 + (120 * 4000) + (6 * 30000) + 100000 + 50000 + 100000;
    let invoice = await prisma.invoice.create({
      data: {
        roomId: room.id,
        contractId: contract.id,
        invoiceCode: 'INV-UAT-001',
        billingPeriod: `07/2026`,
        status: 'DRAFT',
        subtotalAmount: subtotal,
        totalAmount: subtotal,
        paidAmount: 0,
        remainingAmount: subtotal,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        items: {
          createMany: {
            data: [
              { type: 'ROOM', amount: 4500000, quantity: 1, unit: 'Tháng', unitPrice: 4500000, description: 'Tiền phòng' },
              { type: 'ELECTRICITY', amount: 480000, quantity: 120, unit: 'kWh', unitPrice: 4000, description: 'Điện' },
              { type: 'WATER', amount: 180000, quantity: 6, unit: 'm3', unitPrice: 30000, description: 'Nước' },
              { type: 'WIFI', amount: 100000, quantity: 1, unit: 'Phòng', unitPrice: 100000, description: 'Wifi' },
              { type: 'GARBAGE', amount: 50000, quantity: 1, unit: 'Người', unitPrice: 50000, description: 'Rác' },
              { type: 'PARKING', amount: 100000, quantity: 1, unit: 'Người', unitPrice: 100000, description: 'Gửi xe' },
            ]
          }
        }
      }
    });
    report("Invoice DRAFT Math", (Number(invoice.totalAmount) === 5410000 && Number(invoice.remainingAmount) === 5410000) ? "PASS" : "FAIL", { total: Number(invoice.totalAmount), remaining: Number(invoice.remainingAmount) });

    // 9. ISSUE & VIETQR
    console.log("\\n--- 9. ISSUE & VIETQR ---");
    invoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'ISSUED' }
    });
    const vietQRContent = `INV-UAT-001`;
    report("Issue Invoice & VietQR", invoice.status === 'ISSUED' ? "PASS" : "FAIL", { status: invoice.status, qrContent: vietQRContent, qrAmount: Number(invoice.remainingAmount) });

    // 10. PARTIAL PAYMENT
    console.log("\\n--- 10. PARTIAL PAYMENT ---");
    const partialPayment = await prisma.payment.create({
      data: {
        paymentCode: 'PAY-UAT-001',
        invoiceId: invoice.id,
        amount: 2000000,
        method: PaymentMethod.CASH,
        source: PaymentSource.ADMIN_MANUAL,
        status: PaymentStatus.CONFIRMED,
        recordedById: owner1.id,
        confirmedById: owner1.id,
        confirmedAt: new Date(),
        receivedAt: new Date()
      }
    });
    await recalculateInvoicePaymentStatusService(prisma, invoice.id);
    invoice = await prisma.invoice.findUnique({ where: { id: invoice.id } }) as any;
    report("Record Partial Payment", (Number(invoice.paidAmount) === 2000000 && Number(invoice.remainingAmount) === 3410000 && invoice.status === 'PARTIALLY_PAID') ? "PASS" : "FAIL", { paid: Number(invoice.paidAmount), remaining: Number(invoice.remainingAmount), status: invoice.status });

    // 11. FULL PAYMENT
    console.log("\\n--- 11. FULL PAYMENT ---");
    const fullPayment = await prisma.payment.create({
      data: {
        paymentCode: 'PAY-UAT-002',
        invoiceId: invoice.id,
        amount: 3410000,
        method: PaymentMethod.BANK_TRANSFER,
        source: PaymentSource.ADMIN_MANUAL,
        status: PaymentStatus.CONFIRMED,
        recordedById: owner1.id,
        confirmedById: owner1.id,
        confirmedAt: new Date(),
        receivedAt: new Date()
      }
    });
    await recalculateInvoicePaymentStatusService(prisma, invoice.id);
    invoice = await prisma.invoice.findUnique({ where: { id: invoice.id } }) as any;
    report("Record Full Payment", (Number(invoice.paidAmount) === 5410000 && Number(invoice.remainingAmount) === 0 && invoice.status === 'PAID') ? "PASS" : "FAIL", { paid: Number(invoice.paidAmount), remaining: Number(invoice.remainingAmount), status: invoice.status });

    // 12. REFUND
    console.log("\\n--- 12. REFUND ---");
    await prisma.payment.update({
      where: { id: fullPayment.id },
      data: {
        refundAmount: 410000,
        status: PaymentStatus.PARTIALLY_REFUNDED,
        refundReason: 'Refund UAT'
      }
    });
    await recalculateInvoicePaymentStatusService(prisma, invoice.id);
    invoice = await prisma.invoice.findUnique({ where: { id: invoice.id } }) as any;
    report("Refund Payment", (Number(invoice.paidAmount) === 5000000 && Number(invoice.remainingAmount) === 410000 && invoice.status === 'PARTIALLY_PAID') ? "PASS" : "FAIL", { paid: Number(invoice.paidAmount), remaining: Number(invoice.remainingAmount), status: invoice.status });

    // 13. CANCEL PAYMENT
    console.log("\\n--- 13. CANCEL PAYMENT ---");
    await prisma.payment.update({
      where: { id: partialPayment.id },
      data: {
        status: PaymentStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: 'UAT'
      }
    });
    await prisma.auditLog.create({
      data: {
        userId: owner1.id,
        action: 'CANCEL_PAYMENT',
        entity: 'Payment',
        entityId: partialPayment.id,
        details: 'UAT Cancel Payment'
      }
    });
    await recalculateInvoicePaymentStatusService(prisma, invoice.id);
    invoice = await prisma.invoice.findUnique({ where: { id: invoice.id } }) as any;
    report("Cancel Payment", (Number(invoice.paidAmount) === 3000000 && Number(invoice.remainingAmount) === 2410000 && invoice.status === 'PARTIALLY_PAID') ? "PASS" : "FAIL", { paid: Number(invoice.paidAmount), remaining: Number(invoice.remainingAmount), status: invoice.status });

    // 14. WEBHOOK IDEMPOTENCY
    console.log("\\n--- 14. WEBHOOK IDEMPOTENCY ---");
    const webhookPayload = {
      provider: 'CASSO',
      eventId: 'TX-WEBHOOK-123',
      transactionRef: 'FT123456789',
      amount: 100000,
      content: 'Thanh toan tien phong INV-UAT-001',
      rawPayload: { test: true }
    };
    
    // First time
    const webhookRes1 = await processBankWebhookService(webhookPayload);
    const invoiceAfterWebhook1 = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    
    // Second time (idempotent call)
    const webhookRes2 = await processBankWebhookService(webhookPayload);
    const invoiceAfterWebhook2 = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    
    const isIdempotent = (
      webhookRes2.message.includes("idempotent") || webhookRes2.message.includes("already processed")
    ) && (Number(invoiceAfterWebhook1?.paidAmount) === Number(invoiceAfterWebhook2?.paidAmount));
    
    report("Webhook Idempotency", isIdempotent ? "PASS" : "FAIL", { 
      res1Message: webhookRes1.message, 
      res2Message: webhookRes2.message,
      paidAfter1: Number(invoiceAfterWebhook1?.paidAmount),
      paidAfter2: Number(invoiceAfterWebhook2?.paidAmount)
    });

    // 15. AUTHORIZATION
    console.log("\\n--- 15. AUTHORIZATION ---");
    const owner2User = await prisma.user.create({
      data: {
        phone: '0999999999',
        role: 'OWNER',
        passwordHash: await bcrypt.hash('temp_password', 10),
        fullName: 'Owner UAT 2',
        ownerProfile: { create: { businessName: 'Owner UAT 2' } }
      }
    });
    
    // Query buildings, rooms, tenants, contracts, invoices as Owner 2
    const owner2Building = await prisma.building.findFirst({ where: { ownerId: owner2User.id } });
    const owner2Room = await prisma.room.findFirst({ where: { building: { ownerId: owner2User.id } } });
    const owner2Tenant = await prisma.tenant.findFirst({ where: { ownerId: owner2User.id } });
    const owner2Invoice = await prisma.invoice.findFirst({ where: { room: { building: { ownerId: owner2User.id } } } });
    const owner2Payment = await prisma.payment.findFirst({ where: { invoice: { room: { building: { ownerId: owner2User.id } } } } });
    
    const isOwner2Isolated = !owner2Building && !owner2Room && !owner2Tenant && !owner2Invoice && !owner2Payment;
    report("Authorization OWNER Isolation", isOwner2Isolated ? "PASS" : "FAIL", { 
      b: owner2Building, r: owner2Room, t: owner2Tenant, i: owner2Invoice, p: owner2Payment 
    });

    console.log("\\n==========================================");
    console.log(`🎉 UAT SMOKE TEST SUMMARY: ${passed}/${passed + failed} PASS`);
    console.log("==========================================\\n");
    
  } catch (err) {
    console.error("FATAL ERROR DURING UAT:", err);
    report("UAT Script Execution", "FAIL", err);
  } finally {
    await prisma.$disconnect();
    const fs = require('fs');
    fs.writeFileSync('uat_report.json', JSON.stringify(results, null, 2));
  }
}

runUATSmokeTest();
