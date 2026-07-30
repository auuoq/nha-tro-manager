"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContractOverlapService = validateContractOverlapService;
async function validateContractOverlapService(tx, params) {
    const overlapping = await tx.contract.findMany({
        where: {
            roomId: params.roomId,
            status: { in: ["ACTIVE"] },
            deletedAt: null,
            ...(params.excludeContractId ? { id: { not: params.excludeContractId } } : {}),
            startDate: { lte: params.endDate },
            endDate: { gte: params.startDate },
        },
        select: { id: true, contractCode: true, startDate: true, endDate: true },
    });
    if (overlapping.length > 0) {
        const conflict = overlapping[0];
        throw new Error(`CONFLICT_CONTRACT_OVERLAP: Phòng đã có Hợp đồng đang hoạt động (${conflict.contractCode}) bị trùng thời gian thuê từ ${new Date(conflict.startDate).toLocaleDateString("vi-VN")} đến ${new Date(conflict.endDate).toLocaleDateString("vi-VN")}.`);
    }
}
