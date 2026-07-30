import React from "react";
import Link from "next/link";
import { LayoutDashboard, Home, Receipt, FileText, User, Wrench, LogOut } from "lucide-react";
import { logoutAction } from "@/features/auth/actions/logout.action";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col text-[#252724]">
      {/* Header Desktop */}
      <header className="bg-[#1F2421] text-[#D9DDD8] border-b border-[#2A312C] sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3F594F] flex items-center justify-center text-white font-serif font-bold text-sm">
              N
            </div>
            <span className="font-semibold text-sm text-white tracking-wide">CỔNG KHÁCH THUÊ</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <Link href="/tenant/dashboard" className="px-3 py-2 rounded-xl text-[#B2B8AF] hover:text-white hover:bg-[#282F2B] transition-colors">
              Trang Chủ
            </Link>
            <Link href="/tenant/room" className="px-3 py-2 rounded-xl text-[#B2B8AF] hover:text-white hover:bg-[#282F2B] transition-colors">
              Phòng Trọ
            </Link>
            <Link href="/tenant/invoices" className="px-3 py-2 rounded-xl text-[#B2B8AF] hover:text-white hover:bg-[#282F2B] transition-colors">
              Hóa Đơn
            </Link>
            <Link href="/tenant/contract" className="px-3 py-2 rounded-xl text-[#B2B8AF] hover:text-white hover:bg-[#282F2B] transition-colors">
              Hợp Đồng
            </Link>
            <Link href="/tenant/maintenance" className="px-3 py-2 rounded-xl text-[#B2B8AF] hover:text-white hover:bg-[#282F2B] transition-colors">
              Báo Hỏng
            </Link>
            <Link href="/tenant/profile" className="px-3 py-2 rounded-xl text-[#B2B8AF] hover:text-white hover:bg-[#282F2B] transition-colors">
              Cá Nhân
            </Link>
          </nav>

          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-[#868D84] hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#282F2B] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">{children}</main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E5DF] flex justify-around p-2 text-[11px] text-[#73766F] z-50 shadow-lg">
        <Link href="/tenant/dashboard" className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:text-[#3F594F]">
          <LayoutDashboard className="w-4 h-4" />
          <span>Trang chủ</span>
        </Link>
        <Link href="/tenant/invoices" className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:text-[#3F594F]">
          <Receipt className="w-4 h-4" />
          <span>Hóa đơn</span>
        </Link>
        <Link href="/tenant/room" className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:text-[#3F594F]">
          <Home className="w-4 h-4" />
          <span>Phòng</span>
        </Link>
        <Link href="/tenant/maintenance" className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:text-[#3F594F]">
          <Wrench className="w-4 h-4" />
          <span>Báo hỏng</span>
        </Link>
        <Link href="/tenant/profile" className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg hover:text-[#3F594F]">
          <User className="w-4 h-4" />
          <span>Cá nhân</span>
        </Link>
      </nav>
    </div>
  );
}
