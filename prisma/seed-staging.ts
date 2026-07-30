import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.SUPER_ADMIN_PHONE || "0900000000";
  const email = process.env.SUPER_ADMIN_EMAIL || "admin.staging@nhatro.test";
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || "StagingAdminPass2026!";
  const fullName = process.env.SUPER_ADMIN_NAME || "Super Admin Staging";

  console.log(`[STAGING SEED] Checking SUPER_ADMIN account (Phone: ${phone})...`);

  const existingUser = await prisma.user.findUnique({
    where: { phone },
  });

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  if (existingUser) {
    console.log(`[STAGING SEED] Updating existing SUPER_ADMIN user ID: ${existingUser.id}...`);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: "SUPER_ADMIN",
        isActive: true,
        passwordHash,
        fullName,
        email,
      },
    });
  } else {
    console.log(`[STAGING SEED] Creating new SUPER_ADMIN user...`);
    await prisma.user.create({
      data: {
        phone,
        email,
        fullName,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
        mustChangePassword: false,
      },
    });
  }

  console.log(`✅ [STAGING SEED] SUPER_ADMIN account seeded successfully.`);
}

main()
  .catch((e) => {
    console.error("❌ [STAGING SEED] Error seeding staging database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
