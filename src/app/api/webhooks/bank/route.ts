import { NextRequest, NextResponse } from "next/server";
import { processBankWebhookService } from "@/features/payments/services/process-bank-webhook.service";

export async function POST(req: NextRequest) {
  try {
    // Optional secret verification
    const secretHeader = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
    const expectedSecret = process.env.BANK_WEBHOOK_SECRET;

    if (expectedSecret && secretHeader !== expectedSecret && secretHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ success: false, error: "UNAUTHORIZED_WEBHOOK_SECRET" }, { status: 401 });
    }

    const body = await req.json();

    // Support common bank webhook payload formats (Casso, SeAPay, Custom VietQR Webhook)
    const provider = body.provider || body.gateway || "BANK_WEBHOOK";
    const eventId = String(body.eventId || body.id || body.transactionId || body.tid || Date.now());
    const amount = Number(body.amount || body.transferAmount || body.creditAmount || 0);
    const transactionRef = String(body.transactionRef || body.reference || body.refNo || eventId);
    const content = String(body.content || body.description || body.remark || body.addInfo || "");

    const result = await processBankWebhookService({
      provider,
      eventId,
      amount,
      transactionRef,
      content,
      rawPayload: body,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "WEBHOOK_PROCESSING_FAILED";
    console.error("[BANK_WEBHOOK_ERROR]", message);

    // Always return 200/400 JSON so webhook providers receive structured status
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
