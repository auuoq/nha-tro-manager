import { NextRequest, NextResponse } from "next/server";
import { verifyCCCDSignedUrlParams } from "@/server/storage/signed-url.service";
import { readPrivateCCCDFileBuffer } from "@/server/storage/private-storage.service";
import { prisma } from "@/server/database/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tenantId = searchParams.get("tenantId");
  const side = searchParams.get("side") as "FRONT" | "BACK" | null;
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  if (!tenantId || !side || !expires || !signature) {
    return new NextResponse("Bad Request: Missing parameters", { status: 400 });
  }

  const isValid = verifyCCCDSignedUrlParams(tenantId, side, expires, signature);
  if (!isValid) {
    return new NextResponse("Forbidden: Invalid or expired signed URL", { status: 403 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { idCardFrontPath: true, idCardBackPath: true },
  });

  if (!tenant) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const storagePath = side === "FRONT" ? tenant.idCardFrontPath : tenant.idCardBackPath;
  if (!storagePath) {
    return new NextResponse("Not Found: Image not uploaded", { status: 404 });
  }

  const buffer = readPrivateCCCDFileBuffer(storagePath);
  if (!buffer) {
    return new NextResponse("Not Found: Image file missing", { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
