import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldCheck } from "lucide-react";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Nhật Ký Thao Tác Hệ Thống"
        description="Truy vết truy cập thông tin nhạy cảm và thay đổi dữ liệu theo thời gian thực"
      />
      <EmptyState
        icon={ShieldCheck}
        title="Nhật ký thao tác hệ thống"
        description="Các hoạt động tạo mới, cập nhật, hủy giao dịch và truy cập dữ liệu sẽ được ghi nhận minh bạch tại đây."
      />
    </div>
  );
}
