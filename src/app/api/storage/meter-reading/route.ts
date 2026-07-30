import { NextRequest, NextResponse } from "next/server";
import { verifyMeterSignedUrlParams, readPrivateMeterFileBuffer } from "@/server/storage/private-meter-storage.service";
import { prisma } from "@/server/database/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const readingId = searchParams.get("readingId");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  if (!readingId || !expires || !signature) {
    return new NextResponse("Bad Request: Missing parameters", { status: 400 });
  }

  const isValid = verifyMeterSignedUrlParams(readingId, expires, signature);
  if (!isValid) {
    return new NextResponse("Forbidden: Invalid or expired signed URL", { status: 403 });
  }

  const reading = await prisma.meterReading.findUnique({
    where: { id: readingId },
    select: { imagePath: true },
  });

  if (!reading || !reading.imagePath) {
    return new NextResponse("Not Found: Reading image not found", { status: 404 });
  }

  const buffer = readPrivateMeterFileBuffer(reading.imagePath);
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
