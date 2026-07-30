import bcrypt from "bcryptjs";
import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@prisma/client";
import { env } from "../../config/env";

export interface JWTPayload {
  sub: string; // userId
  role: UserRole;
  tokenVersion: number;
}

const secretKey = new TextEncoder().encode(env.AUTH_SECRET);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateRandomTempPassword(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

export async function createSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({
    sub: payload.sub,
    role: payload.role,
    tokenVersion: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      sub: payload.sub as string,
      role: payload.role as UserRole,
      tokenVersion: Number(payload.tokenVersion ?? 1),
    };
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = "app_session_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 ngày
};
