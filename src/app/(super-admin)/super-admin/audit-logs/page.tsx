import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldCheck } from "lucide-react";

export default function SuperAdminAuditLogsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Nhật Ký Thao Tác Hệ Thống (Audit Logs)"
        description="Nhật ký truy vết toàn bộ thao tác hệ thống và kiểm soát an toàn dữ liệu"
      />
      <EmptyState
        icon={ShieldCheck}
        title="Nhật ký thao tác toàn sàn"
        description="Toàn bộ hoạt động tạo tài khoản chủ nhà, thay đổi cấu hình hệ thống và rà soát giao dịch sẽ được tự động lưu trữ tại đây."
      />
    </div>
  );
}
