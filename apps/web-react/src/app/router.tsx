import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/auth/components/protected-route";

// Layouts
import { OwnerLayout } from "@/layouts/owner-layout";
import { TenantLayout } from "@/layouts/tenant-layout";
import { SuperAdminLayout } from "@/layouts/super-admin-layout";

// Auth Pages
import { LoginPage } from "@/auth/pages/login-page";
import { ChangePasswordPage } from "@/auth/pages/change-password-page";

// Features Pages
import { OwnerDashboardPage, TenantDashboardPage, SuperAdminDashboardPage } from "@/features/dashboard/pages/dashboards";
import { BuildingsPage } from "@/features/buildings/pages/buildings-page";
import { BuildingDetailPage } from "@/features/buildings/pages/building-detail-page";
import { RoomsPage } from "@/features/rooms/pages/rooms-page";
import { RoomDetailPage } from "@/features/rooms/pages/room-detail-page";
import { TenantsPage } from "@/features/tenants/pages/tenants-page";
import { TenantDetailPage } from "@/features/tenants/pages/tenant-detail-page";
import { ContractsPage } from "@/features/contracts/pages/contracts-page";
import { ContractDetailPage } from "@/features/contracts/pages/contract-detail-page";
import { TenantContractDetailPage } from "@/features/contracts/pages/tenant-contract-detail-page";
import { MetersPage } from "@/features/meters/pages/meters-page";
import { MeterDetailPage } from "@/features/meters/pages/meter-detail-page";
import { InvoicesPage } from "@/features/invoices/pages/invoices-page";
import { InvoiceDetailPage } from "@/features/invoices/pages/invoice-detail-page";
import { TenantInvoicesPage } from "@/features/invoices/pages/tenant-invoices-page";
import { TenantInvoiceDetailPage } from "@/features/invoices/pages/tenant-invoice-detail-page";
import { PaymentsPage } from "@/features/payments/pages/payments-page";
import { PaymentDetailPage } from "@/features/payments/pages/payment-detail-page";
import { TenantPaymentsPage } from "@/features/payments/pages/tenant-payments-page";
import { UnmatchedWebhooksPage } from "@/features/webhooks/pages/unmatched-webhooks-page";

// Error Pages
import { UnauthorizedPage } from "@/pages/errors/unauthorized-page";
import { ForbiddenPage } from "@/pages/errors/forbidden-page";
import { NotFoundPage } from "@/pages/errors/not-found-page";

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* Error Pages */}
        <Route path="/401" element={<UnauthorizedPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Default Root Redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* OWNER Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<OwnerDashboardPage />} />
          <Route path="buildings" element={<BuildingsPage />} />
          <Route path="buildings/:buildingId" element={<BuildingDetailPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="rooms/:roomId" element={<RoomDetailPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/:tenantId" element={<TenantDetailPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="contracts/:contractId" element={<ContractDetailPage />} />
          <Route path="meters" element={<MetersPage />} />
          <Route path="meters/:meterId" element={<MeterDetailPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/:paymentId" element={<PaymentDetailPage />} />
          <Route path="webhooks/unmatched" element={<UnmatchedWebhooksPage />} />
          <Route path="maintenance" element={<div>Maintenance List</div>} />
          <Route path="audit-logs" element={<div>Audit Log List</div>} />
        </Route>

        {/* TENANT Routes */}
        <Route
          path="/tenant"
          element={
            <ProtectedRoute allowedRoles={["TENANT"]}>
              <TenantLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TenantDashboardPage />} />
          <Route path="room" element={<div>My Room</div>} />
          <Route path="contract" element={<TenantContractDetailPage />} />
          <Route path="invoices" element={<TenantInvoicesPage />} />
          <Route path="invoices/:invoiceId" element={<TenantInvoiceDetailPage />} />
          <Route path="payments" element={<TenantPaymentsPage />} />
          <Route path="maintenance" element={<div>My Maintenance Requests</div>} />
          <Route path="profile" element={<div>My Profile</div>} />
        </Route>

        {/* SUPER_ADMIN Routes */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="owners" element={<div>Owner Management</div>} />
          <Route path="system-settings" element={<div>System Settings</div>} />
          <Route path="audit-logs" element={<div>System Audit Logs</div>} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
