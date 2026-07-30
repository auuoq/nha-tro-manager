import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export interface TransactionOptions {
  /**
   * Số lần thử lại SAU LẦN THỰC THI ĐẦU TIÊN bị thất bại do xung đột P2034.
   * Tổng số lần thực thi tối đa = 1 + maxRetries (Mặc định: 1 + 3 = 4 lần).
   */
  maxRetries?: number;
  /**
   * Thời gian chờ ban đầu (ms) trước khi thử lại (Exponential backoff).
   */
  backoffMs?: number;
}

/**
 * Helper thực thi một callback nghiệp vụ bên trong Prisma Transaction với isolation level Serializable.
 * CHỈ tự động retry khi gặp lỗi xung đột khóa/giao dịch P2034 (Serialization Failure).
 * KHÔNG retry khi gặp lỗi validation, authorization hoặc lỗi nghiệp vụ domain.
 */
export async function runSerializableTransaction<T>(
  action: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialBackoff = options.backoffMs ?? 100;

  let retriesAttempted = 0;

  while (true) {
    try {
      return await prisma.$transaction(action, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const isSerializationConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"; // Serialization failure code

      if (isSerializationConflict && retriesAttempted < maxRetries) {
        retriesAttempted++;
        const delay = initialBackoff * Math.pow(2, retriesAttempted - 1);
        console.warn(
          `[SerializableTx] Retrying attempt ${retriesAttempted}/${maxRetries} due to P2034 conflict. Delay ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Ném lại lỗi gốc nếu hết số lần retry hoặc là lỗi nghiệp vụ khác
      throw error;
    }
  }
}
