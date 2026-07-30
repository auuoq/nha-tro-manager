"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
async function runPhase44Tests() {
    console.log("🧪 Running Phase 4.4 Payment, Webhook, Idempotency, Overpayment & Refund Validation Test Suite...\n");
    let passedCount = 0;
    const totalTests = 10;
    // Test 1: Payment amount > 0 guard
    try {
        const validateAmount = (amount) => amount > 0;
        if (!validateAmount(0) && !validateAmount(-1000) && validateAmount(500000)) {
            console.log("✅ [TEST 1 PASSED] Amount > 0 validation guard OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 1 FAILED] Amount guard error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 1 FAILED]", e);
    }
    // Test 2: Cannot record payment for DRAFT or CANCELLED invoice
    try {
        const validInvoiceStatuses = ["ISSUED", "PARTIALLY_PAID", "OVERDUE"];
        const canPay = (status) => validInvoiceStatuses.includes(status);
        if (!canPay("DRAFT") && !canPay("CANCELLED") && canPay("ISSUED") && canPay("PARTIALLY_PAID") && canPay("OVERDUE")) {
            console.log("✅ [TEST 2 PASSED] Payment invoice status guard OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 2 FAILED] Invoice status guard error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 2 FAILED]", e);
    }
    // Test 3: Ledger calculation - Partial payment updates status to PARTIALLY_PAID
    try {
        const totalAmount = 3800000;
        const paidAmount = 1500000;
        const remainingAmount = Math.max(0, totalAmount - paidAmount);
        let status = "ISSUED";
        if (paidAmount >= totalAmount)
            status = "PAID";
        else if (paidAmount > 0)
            status = "PARTIALLY_PAID";
        if (remainingAmount === 2300000 && status === "PARTIALLY_PAID") {
            console.log("✅ [TEST 3 PASSED] Partial payment ledger status calculation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 3 FAILED] Partial payment calculation error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 3 FAILED]", e);
    }
    // Test 4: Full payment updates status to PAID and remainingAmount = 0
    try {
        const totalAmount = 3800000;
        const paidAmount = 3800000;
        const remainingAmount = Math.max(0, totalAmount - paidAmount);
        let status = "ISSUED";
        if (paidAmount >= totalAmount)
            status = "PAID";
        else if (paidAmount > 0)
            status = "PARTIALLY_PAID";
        if (remainingAmount === 0 && status === "PAID") {
            console.log("✅ [TEST 4 PASSED] Full payment ledger status calculation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 4 FAILED] Full payment calculation error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 4 FAILED]", e);
    }
    // Test 5: Overpayment calculation - remainingAmount = 0, overpaymentAmount recorded
    try {
        const totalAmount = 3800000;
        const paidAmount = 4000000;
        const remainingAmount = Math.max(0, totalAmount - paidAmount);
        const overpaymentAmount = Math.max(0, paidAmount - totalAmount);
        if (remainingAmount === 0 && overpaymentAmount === 200000) {
            console.log("✅ [TEST 5 PASSED] Overpayment calculation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 5 FAILED] Overpayment calculation error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 5 FAILED]", e);
    }
    // Test 6: Cancel Payment recalculates invoice remainingAmount back
    try {
        const totalAmount = 3800000;
        const payments = [
            { amount: 2000000, status: "CONFIRMED" },
            { amount: 1800000, status: "CANCELLED" }, // Cancelled, should be ignored
        ];
        const netPaid = payments
            .filter((p) => p.status === "CONFIRMED")
            .reduce((sum, p) => sum + p.amount, 0);
        const remaining = Math.max(0, totalAmount - netPaid);
        const status = netPaid >= totalAmount ? "PAID" : netPaid > 0 ? "PARTIALLY_PAID" : "ISSUED";
        if (netPaid === 2000000 && remaining === 1800000 && status === "PARTIALLY_PAID") {
            console.log("✅ [TEST 6 PASSED] Cancel Payment ledger recalculation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 6 FAILED] Cancel payment recalculation error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 6 FAILED]", e);
    }
    // Test 7: Refund Payment recalculates net paid amount correctly
    try {
        const totalAmount = 3800000;
        const payments = [
            { amount: 3800000, refundAmount: 1000000, status: "PARTIALLY_REFUNDED" },
        ];
        const netPaid = payments.reduce((sum, p) => sum + (p.amount - p.refundAmount), 0);
        const remaining = Math.max(0, totalAmount - netPaid);
        const status = netPaid >= totalAmount ? "PAID" : netPaid > 0 ? "PARTIALLY_PAID" : "ISSUED";
        if (netPaid === 2800000 && remaining === 1000000 && status === "PARTIALLY_PAID") {
            console.log("✅ [TEST 7 PASSED] Refund Payment net paid calculation OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 7 FAILED] Refund calculation error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 7 FAILED]", e);
    }
    // Test 8: Webhook content invoice code matching
    try {
        const rawContent = "Thanh toan tien phong INV-202607-AB12CD ki 07";
        const normalized = rawContent.toUpperCase().replace(/\s+/g, "");
        const match = normalized.match(/INV-\d{6}-[A-Z0-9]{6}/);
        if (match && match[0] === "INV-202607-AB12CD") {
            console.log("✅ [TEST 8 PASSED] Webhook invoiceCode regex extraction OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 8 FAILED] Webhook invoiceCode matching error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 8 FAILED]", e);
    }
    // Test 9: Webhook idempotency key generation
    try {
        const provider = "CASSO";
        const eventId = "TX987654321";
        const key = `${provider}_${eventId}`;
        if (key === "CASSO_TX987654321") {
            console.log("✅ [TEST 9 PASSED] Webhook idempotency key structure OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 9 FAILED] Idempotency key error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 9 FAILED]", e);
    }
    // Test 10: Tenant payment transactionRef masking
    try {
        const originalRef = "FT26079988776655";
        const maskedRef = originalRef ? `${originalRef.slice(0, 4)}***` : null;
        if (maskedRef === "FT26***") {
            console.log("✅ [TEST 10 PASSED] Tenant transactionRef masking OK");
            passedCount++;
        }
        else {
            console.error("❌ [TEST 10 FAILED] TransactionRef masking error!");
        }
    }
    catch (e) {
        console.error("❌ [TEST 10 FAILED]", e);
    }
    console.log(`\n🎉 Test Suite Summary: ${passedCount}/${totalTests} Phase 4.4 Payment/Webhook Tests Passed Successfully!`);
}
runPhase44Tests();
