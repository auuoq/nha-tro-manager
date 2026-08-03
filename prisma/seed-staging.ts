import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const defaultPasswordHash = await bcrypt.hash("123456", 10);

  // 1. SuperAdmin (0833737181 / 123456)
  await prisma.user.upsert({
    where: { phone: "0833737181" },
    update: {
      role: "SUPER_ADMIN",
      isActive: true,
      passwordHash: defaultPasswordHash,
      fullName: "Quản Trị Viên Staging",
      email: "admin.0833737181@nhatro.com",
    },
    create: {
      phone: "0833737181",
      email: "admin.0833737181@nhatro.com",
      fullName: "Quản Trị Viên Staging",
      passwordHash: defaultPasswordHash,
      role: "SUPER_ADMIN",
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log("✅ [STAGING SEED] SUPER_ADMIN (0833737181) seeded.");

  // 2. Owner (0972095088 / 123456)
  const owner = await prisma.user.upsert({
    where: { phone: "0972095088" },
    update: {
      role: "OWNER",
      isActive: true,
      passwordHash: defaultPasswordHash,
      fullName: "Chủ Nhà Mẫu Staging",
      email: "owner.0972095088@nhatro.com",
    },
    create: {
      phone: "0972095088",
      email: "owner.0972095088@nhatro.com",
      fullName: "Chủ Nhà Mẫu Staging",
      passwordHash: defaultPasswordHash,
      role: "OWNER",
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log("✅ [STAGING SEED] OWNER (0972095088) seeded.");

  // Owner Profile
  const existingProf = await prisma.ownerProfile.findFirst({ where: { userId: owner.id } });
  if (!existingProf) {
    await prisma.ownerProfile.create({
      data: {
        userId: owner.id,
        businessName: "Chu Nha Staging Boutique",
      },
    });
  }

  // 3. Tenant (083373181 / 123456)
  await prisma.user.upsert({
    where: { phone: "083373181" },
    update: {
      role: "TENANT",
      isActive: true,
      passwordHash: defaultPasswordHash,
      fullName: "Khách Thuê Mẫu Staging",
      email: "tenant.083373181@nhatro.com",
    },
    create: {
      phone: "083373181",
      email: "tenant.083373181@nhatro.com",
      fullName: "Khách Thuê Mẫu Staging",
      passwordHash: defaultPasswordHash,
      role: "TENANT",
      isActive: true,
      mustChangePassword: false,
    },
  });
  console.log("✅ [STAGING SEED] TENANT (083373181) seeded.");
}

main()
  .catch((e) => {
    console.error("❌ [STAGING SEED] Error seeding staging database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
