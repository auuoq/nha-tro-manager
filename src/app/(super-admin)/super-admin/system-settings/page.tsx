import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, ShieldCheck } from "lucide-react";

export default function SuperAdminSystemSettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Cấu Hình Nền Tảng"
        description="Quản lý cấu hình chung, thông số tích hợp Bank Webhook và giới hạn hệ thống"
      />

      <Card
        title={
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#3F594F]" />
            <span>Thông Số Nền Tảng Chung</span>
          </div>
        }
        subtitle="Các thiết lập mặc định cho toàn bộ tài khoản chủ nhà"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Tên Hệ Thống" defaultValue="Nha Tro Manager" />
            <Input label="Email Hỗ Trợ Kỹ Thuật" defaultValue="support@nhatromanager.vn" />
            <Input label="Số Hạn Ngày Thanh Toán Mặc Định" type="number" defaultValue="5" helperText="Số ngày từ khi phát hành đến dueDate" />
            <Input label="Thời Gian Hạn Session Cookie (Ngày)" type="number" defaultValue="7" />
          </div>

          <div className="pt-4 border-t border-[#E8E5DF] flex justify-end">
            <Button type="button" variant="primary" size="md">
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
