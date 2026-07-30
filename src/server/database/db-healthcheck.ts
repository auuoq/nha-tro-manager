import { prisma } from "./prisma";

export async function checkDatabaseConnection(): Promise<{ ok: boolean; userCount: number; message: string }> {
  try {
    const count = await prisma.user.count();
    return {
      ok: true,
      userCount: count,
      message: `Database connection verified successfully. Total users: ${count}`,
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      userCount: 0,
      message: `Database connection test: ${errMessage}`,
    };
  }
}
