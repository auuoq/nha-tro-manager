"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_COOKIE_OPTIONS = exports.AUTH_COOKIE_NAME = void 0;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateRandomTempPassword = generateRandomTempPassword;
exports.createSessionToken = createSessionToken;
exports.verifySessionToken = verifySessionToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jose_1 = require("jose");
const env_1 = require("../../config/env");
const secretKey = new TextEncoder().encode(env_1.env.AUTH_SECRET);
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 12);
}
async function verifyPassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function generateRandomTempPassword(length = 8) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    const randomBytes = crypto_1.default.randomBytes(length);
    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    return result;
}
async function createSessionToken(payload) {
    return new jose_1.SignJWT({
        sub: payload.sub,
        role: payload.role,
        tokenVersion: payload.tokenVersion,
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
}
async function verifySessionToken(token) {
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, secretKey);
        return {
            sub: payload.sub,
            role: payload.role,
            tokenVersion: Number(payload.tokenVersion ?? 1),
        };
    }
    catch {
        return null;
    }
}
exports.AUTH_COOKIE_NAME = "app_session_token";
exports.AUTH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
};
