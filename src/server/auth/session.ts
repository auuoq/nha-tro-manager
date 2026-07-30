import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./auth-service";
import { prisma } from "../database/prisma";

export interface SessionUser {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
  mustChangePassword: boolean;
}

export interface UserSession {
  user: SessionUser;
}

export async function getServerSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        isActive: true,
        tokenVersion: true,
        mustChangePassword: true,
      },
    });

    if (!dbUser || !dbUser.isActive || dbUser.tokenVersion !== payload.tokenVersion) {
      return null; // Session vắng mặt hoặc bị vô hiệu hóa
    }

    return {
      user: {
        id: dbUser.id,
        phone: dbUser.phone,
        fullName: dbUser.fullName,
        role: dbUser.role,
        mustChangePassword: dbUser.mustChangePassword,
      },
    };
  } catch {
    return null;
  }
}

export async function requireUserSession(): Promise<SessionUser> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
