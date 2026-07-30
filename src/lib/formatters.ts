export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "0 ₫";
  }
  const val = Number(amount);
  return `${val.toLocaleString("vi-VN")} ₫`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "-";
  }
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${hours}:${minutes}, ${day}/${month}/${year}`;
  } catch {
    return "-";
  }
}

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export function translateInvoiceStatus(status: string | null | undefined): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "DRAFT":
      return { label: "Nháp", variant: "neutral" };
    case "ISSUED":
      return { label: "Đã phát hành", variant: "info" };
    case "PARTIALLY_PAID":
      return { label: "Thanh toán một phần", variant: "warning" };
    case "PAID":
      return { label: "Đã thanh toán", variant: "success" };
    case "OVERDUE":
      return { label: "Quá hạn", variant: "danger" };
    case "CANCELLED":
      return { label: "Đã hủy", variant: "neutral" };
    default:
      return { label: status || "-", variant: "neutral" };
  }
}

export function translateContractStatus(status: string | null | undefined): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "DRAFT":
      return { label: "Nháp", variant: "neutral" };
    case "ACTIVE":
      return { label: "Đang hiệu lực", variant: "success" };
    case "EXPIRING":
      return { label: "Sắp hết hạn", variant: "warning" };
    case "TERMINATED":
      return { label: "Đã kết thúc", variant: "neutral" };
    case "CANCELLED":
      return { label: "Đã hủy", variant: "danger" };
    default:
      return { label: status || "-", variant: "neutral" };
  }
}

export function translateRoomStatus(status: string | null | undefined): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "VACANT":
      return { label: "Còn trống", variant: "neutral" };
    case "RENTED":
      return { label: "Đang thuê", variant: "success" };
    case "RESERVED":
      return { label: "Đã cọc", variant: "warning" };
    case "MAINTENANCE":
      return { label: "Đang bảo trì", variant: "danger" };
    default:
      return { label: status || "-", variant: "neutral" };
  }
}

export function translatePaymentStatus(status: string | null | undefined): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "PENDING":
      return { label: "Chờ xử lý", variant: "warning" };
    case "PENDING_REVIEW":
      return { label: "Chờ rà soát", variant: "warning" };
    case "CONFIRMED":
      return { label: "Đã xác nhận", variant: "success" };
    case "REJECTED":
      return { label: "Từ chối", variant: "danger" };
    case "CANCELLED":
      return { label: "Đã hủy", variant: "neutral" };
    case "REFUNDED":
      return { label: "Đã hoàn tiền", variant: "info" };
    case "PARTIALLY_REFUNDED":
      return { label: "Hoàn tiền 1 phần", variant: "warning" };
    default:
      return { label: status || "-", variant: "neutral" };
  }
}

export function translatePaymentMethod(method: string | null | undefined): string {
  switch (method) {
    case "VIETQR":
      return "VietQR";
    case "BANK_TRANSFER":
      return "Chuyển khoản";
    case "CASH":
      return "Tiền mặt";
    case "BANK_WEBHOOK":
      return "Bank Webhook";
    case "OTHER":
      return "Khác";
    default:
      return method || "-";
  }
}

export function translateUserRole(role: string | null | undefined): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Quản trị hệ thống";
    case "OWNER":
      return "Chủ nhà";
    case "TENANT":
      return "Khách thuê";
    default:
      return role || "Thành viên";
  }
}

export function translateMaintenanceStatus(status: string | null | undefined): { label: string; variant: BadgeVariant } {
  switch (status) {
    case "PENDING":
      return { label: "Chờ tiếp nhận", variant: "warning" };
    case "IN_PROGRESS":
      return { label: "Đang sửa chữa", variant: "info" };
    case "RESOLVED":
      return { label: "Đã khắc phục", variant: "success" };
    case "REJECTED":
      return { label: "Từ chối", variant: "danger" };
    default:
      return { label: status || "-", variant: "neutral" };
  }
}

export function translateMaintenancePriority(priority: string | null | undefined): { label: string; variant: BadgeVariant } {
  switch (priority) {
    case "LOW":
      return { label: "Thấp", variant: "neutral" };
    case "MEDIUM":
      return { label: "Vừa", variant: "info" };
    case "HIGH":
      return { label: "Cao", variant: "warning" };
    case "URGENT":
      return { label: "Khẩn cấp", variant: "danger" };
    default:
      return { label: priority || "-", variant: "neutral" };
  }
}
