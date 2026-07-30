"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/database/prisma";
import { verifyPassword, createSessionToken, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/server/auth/auth-service";

export async function loginAction(prevState: any, formData: FormData) {
  const phone = (formData.get("phone") as string || "").trim();
  const password = formData.get("password") as string || "";

  if (!phone || !password) {
    return { error: "Vui lòng nhập đầy đủ số điện thoại và mật khẩu." };
  }

  let targetPath = "";

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return { error: "Số điện thoại hoặc mật khẩu không chính xác." };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Số điện thoại hoặc mật khẩu không chính xác." };
    }

    const token = await createSessionToken({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    if (user.role === "SUPER_ADMIN") targetPath = "/super-admin/dashboard";
    else if (user.role === "OWNER") targetPath = "/admin/dashboard";
    else targetPath = "/tenant/dashboard";
  } catch (err: any) {
    console.error("Login action error:", err);
    return { error: "Đã xảy ra lỗi hệ thống khi đăng nhập." };
  }

  if (targetPath) {
    redirect(targetPath);
  }
}
