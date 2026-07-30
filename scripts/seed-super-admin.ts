import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.SUPER_ADMIN_PHONE || "0900000000";
  const email = process.env.SUPER_ADMIN_EMAIL || "admin@system.local";
  const password = process.env.SUPER_ADMIN_PASSWORD || "SuperAdminSecret123!";
  const fullName = process.env.SUPER_ADMIN_NAME || "Tổng Quản Trị Hệ Thống";

  console.log("🌱 Checking initial SUPER_ADMIN account...");

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  });

  if (existingUser) {
    console.log(`ℹ️ SUPER_ADMIN account already exists (ID: ${existingUser.id}). Skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.create({
    data: {
      phone,
      email,
      passwordHash,
      fullName,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log(`✅ SUPER_ADMIN account created successfully! User ID: ${superAdmin.id}`);
}

main()
  .catch((err) => {
    console.error("❌ Error seeding SUPER_ADMIN:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
