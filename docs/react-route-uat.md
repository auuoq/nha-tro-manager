# React SPA Route UAT Audit Matrix

Báo cáo kiểm thử UAT giao diện người dùng trên toàn bộ các tuyến đường (Routes) của ứng dụng React Vite SPA (`apps/web-react`).

Nguồn sự thật: **Playwright Browser Test & Route Execution thực tế**.

---

## MA TRẬN PHÂN TÍCH ROUTES (ROUTE AUDIT MATRIX)

| STT | Route Path | Role Access | Route Loads | Authorization | Actual API Request | Success Data State | Empty State | Loading State | Error State | Primary Mutation | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/login` | Public | PASS | Public | `POST /auth/login` | PASS | N/A | PASS | PASS | Form Login | **LOADS & READY** |
| 2 | `/change-password` | Public | PASS | Public | `POST /auth/change-password` | PASS | N/A | PASS | PASS | Change Password | **LOADS & READY** |
| 3 | `/admin/dashboard` | OWNER | PASS | Bearer Token | *(Local Analytics)* | PASS | PASS | PASS | PASS | Filter Year | **PLACEHOLDER** |
| 4 | `/admin/buildings` | OWNER | PASS | Bearer Token | `GET /buildings` | PASS | PASS | PASS | PASS | Create Building | **LOADS & READY** |
| 5 | `/admin/buildings/:id` | OWNER | PASS | Bearer Token | `GET /buildings/:id` | PASS | PASS | PASS | PASS | ChargeConfig Form | **LOADS & READY** |
| 6 | `/admin/rooms` | OWNER | PASS | Bearer Token | `GET /rooms` | PASS | PASS | PASS | PASS | Create Room | **LOADS & READY** |
| 7 | `/admin/rooms/:id` | OWNER | PASS | Bearer Token | `GET /rooms/:id` | PASS | PASS | PASS | PASS | Room Asset Modal | **LOADS & READY** |
| 8 | `/admin/tenants` | OWNER | PASS | Bearer Token | `GET /tenants` | PASS | PASS | PASS | PASS | Create Tenant | **LOADS & READY** |
| 9 | `/admin/tenants/:id` | OWNER | PASS | Bearer Token | `GET /tenants/:id` | PASS | PASS | PASS | PASS | Account Dialog | **LOADS & READY** |
| 10 | `/admin/contracts` | OWNER | PASS | Bearer Token | `GET /contracts` | PASS | PASS | PASS | PASS | Create Contract | **LOADS & READY** |
| 11 | `/admin/contracts/:id` | OWNER | PASS | Bearer Token | `GET /contracts/:id` | PASS | PASS | PASS | PASS | Activate / Cancel | **LOADS & READY** |
| 12 | `/admin/meters` | OWNER | PASS | Bearer Token | `GET /meters` | PASS | PASS | PASS | PASS | Create Meter | **LOADS & READY** |
| 13 | `/admin/meters/:id` | OWNER | PASS | Bearer Token | `GET /meters/:id` | PASS | PASS | PASS | PASS | Reading / Replace | **LOADS & READY** |
| 14 | `/admin/invoices` | OWNER | PASS | Bearer Token | `GET /invoices` | PASS | PASS | PASS | PASS | Create Draft | **LOADS & READY** |
| 15 | `/admin/invoices/:id` | OWNER | PASS | Bearer Token | `GET /invoices/:id` | PASS | PASS | PASS | PASS | Issue / Discount | **LOADS & READY** |
| 16 | `/admin/payments` | OWNER | PASS | Bearer Token | `GET /payments` | PASS | PASS | PASS | PASS | Manual Payment | **LOADS & READY** |
| 17 | `/admin/payments/:id` | OWNER | PASS | Bearer Token | `GET /payments/:id` | PASS | PASS | PASS | PASS | Refund / Cancel | **LOADS & READY** |
| 18 | `/admin/webhooks/unmatched` | OWNER | PASS | Bearer Token | `GET /webhooks/bank/unmatched` | PASS | PASS | PASS | PASS | Manual Match | **LOADS & READY** |
| 19 | `/tenant/dashboard` | TENANT | PASS | Bearer Token | *(Local View)* | PASS | PASS | PASS | PASS | Quick Actions | **PLACEHOLDER** |
| 20 | `/tenant/contract` | TENANT | PASS | Bearer Token | `GET /tenant/contracts/current` | PASS | PASS | PASS | PASS | View Details | **LOADS & READY** |
| 21 | `/tenant/invoices` | TENANT | PASS | Bearer Token | `GET /tenant/invoices` | PASS | PASS | PASS | PASS | View Invoices | **LOADS & READY** |
| 22 | `/tenant/invoices/:id` | TENANT | PASS | Bearer Token | `GET /tenant/invoices/:id` | PASS | PASS | PASS | PASS | View VietQR | **LOADS & READY** |
| 23 | `/tenant/payments` | TENANT | PASS | Bearer Token | `GET /tenant/payments` | PASS | PASS | PASS | PASS | View Payments | **LOADS & READY** |
| 24 | `/401` | Public | PASS | Public | N/A | PASS | N/A | N/A | N/A | Back to Login | **LOADS & READY** |
| 25 | `/403` | Public | PASS | Public | N/A | PASS | N/A | N/A | N/A | Back Home | **LOADS & READY** |
| 26 | `/404` | Public | PASS | Public | N/A | PASS | N/A | N/A | N/A | Back Home | **LOADS & READY** |

---

## GHI CHÚ BẢO THỦ & THÔNG TIN AUDIT

- Màn hình `/admin/dashboard` và `/tenant/dashboard` hiện đang render theo mockup analytics UI (chưa có `/api/v1/dashboard/*` backend endpoint) -> Đã đánh dấu `PLACEHOLDER` minh bạch theo Rule 13.
- Các màn hình nghiệp vụ chính (Buildings, Rooms, Tenants, Contracts, Meters, Invoices, Payments, Webhooks) đã hoạt động 100% qua API thật.
