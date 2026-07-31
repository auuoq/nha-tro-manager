# Frontend-Backend Endpoint Audit Report

Báo cáo kiểm tra và đối chiếu 100% giữa API Functions ở Frontend (`apps/web-react/src`) với FastAPI OpenAPI Specs thực tế (`apps/api-fastapi/openapi.json`).

Nguồn sự thật: **FastAPI OpenAPI Schema Live Generation (`GET /openapi.json`)**.

---

## BẢNG ĐỐI CHIẾU ENDPOINT (ENDPOINT AUDIT MATRIX)

| STT | Feature | Frontend API Function | HTTP Method | URL Frontend Gọi | FastAPI Endpoint Thực Tế | Request/Response Schema | Trạng Thái (Status) | Action Required |
|---|---|---|---|---|---|---|---|---|
| 1 | Auth | `authApi.login` | POST | `/auth/login` | `/api/v1/auth/login` | Match (`email`, `password`) -> `accessToken`, `user` | **MATCHED** | Không |
| 2 | Auth | `authApi.getMe` | GET | `/auth/me` | `/api/v1/auth/me` | Match -> User profile | **MATCHED** | Không |
| 3 | Auth | `authApi.refreshToken` | POST | `/auth/refresh` | `/api/v1/auth/refresh` | Match | **MATCHED** | Không |
| 4 | Auth | `authApi.changePassword` | POST | `/auth/change-password` | `/api/v1/auth/change-password` | Match | **MATCHED** | Không |
| 5 | Auth | `authApi.logout` | POST | `/auth/logout` | *(Không có)* | Frontend client clearance | **MISSING BACKEND** | Client tự xóa token/state client-side |
| 6 | Buildings | `buildingsApi.list` | GET | `/buildings` | `/api/v1/buildings` | Match (filters: page, pageSize) | **MATCHED** | Không |
| 7 | Buildings | `buildingsApi.create` | POST | `/buildings` | `/api/v1/buildings` | Match | **MATCHED** | Không |
| 8 | Buildings | `buildingsApi.getById` | GET | `/buildings/:id` | `/api/v1/buildings/{building_id}` | Match | **MATCHED** | Không |
| 9 | Buildings | `buildingsApi.update` | PATCH | `/buildings/:id` | `/api/v1/buildings/{building_id}` | Match | **MATCHED** | Không |
| 10 | Buildings | `buildingsApi.delete` | DELETE | `/buildings/:id` | `/api/v1/buildings/{building_id}` | Match | **MATCHED** | Không |
| 11 | ChargeConfigs | `buildingsApi.getChargeConfigs` | GET | `/buildings/:id/charge-configs` | `/api/v1/buildings/{building_id}/charge-configs` | Match | **MATCHED** | Không |
| 12 | ChargeConfigs | `buildingsApi.createChargeConfig` | POST | `/buildings/:id/charge-configs` | `/api/v1/buildings/{building_id}/charge-configs` | Match | **MATCHED** | Không |
| 13 | ChargeConfigs | `buildingsApi.updateChargeConfig` | PATCH | `/buildings/:id/charge-configs/:configId` | `/api/v1/buildings/{building_id}/charge-configs/{config_id}` | Match | **MATCHED** | Không |
| 14 | Rooms | `roomsApi.list` | GET | `/rooms` | `/api/v1/rooms` | Match | **MATCHED** | Không |
| 15 | Rooms | `roomsApi.create` | POST | `/rooms` | `/api/v1/rooms` | Match | **MATCHED** | Không |
| 16 | Rooms | `roomsApi.getById` | GET | `/rooms/:id` | `/api/v1/rooms/{room_id}` | Match | **MATCHED** | Không |
| 17 | Rooms | `roomsApi.update` | PATCH | `/rooms/:id` | `/api/v1/rooms/{room_id}` | Match | **MATCHED** | Không |
| 18 | Rooms | `roomsApi.delete` | DELETE | `/rooms/:id` | `/api/v1/rooms/{room_id}` | Match | **MATCHED** | Không |
| 19 | RoomAssets | `roomsApi.getAssets` | GET | `/rooms/:id/assets` | `/api/v1/rooms/{room_id}/assets` | Match | **MATCHED** | Không |
| 20 | RoomAssets | `roomsApi.createAsset` | POST | `/rooms/:id/assets` | `/api/v1/rooms/{room_id}/assets` | Match | **MATCHED** | Không |
| 21 | RoomAssets | `roomsApi.updateAsset` | PATCH | `/rooms/:id/assets/:assetId` | `/api/v1/rooms/{room_id}/assets/{asset_id}` | Match | **MATCHED** | Không |
| 22 | RoomAssets | `roomsApi.deleteAsset` | DELETE | `/rooms/:id/assets/:assetId` | `/api/v1/rooms/{room_id}/assets/{asset_id}` | Match | **MATCHED** | Không |
| 23 | Tenants | `tenantsApi.list` | GET | `/tenants` | `/api/v1/tenants` | Match | **MATCHED** | Không |
| 24 | Tenants | `tenantsApi.create` | POST | `/tenants` | `/api/v1/tenants` | Match | **MATCHED** | Không |
| 25 | Tenants | `tenantsApi.getById` | GET | `/tenants/:id` | `/api/v1/tenants/{tenant_id}` | Match | **MATCHED** | Không |
| 26 | Tenants | `tenantsApi.createAccount` | POST | `/tenants/:id/account` | `/api/v1/tenants/{tenant_id}/account` | Match | **MATCHED** | Không |
| 27 | Contracts | `contractsApi.list` | GET | `/contracts` | `/api/v1/contracts` | Match | **MATCHED** | Không |
| 28 | Contracts | `contractsApi.create` | POST | `/contracts` | `/api/v1/contracts` | Match | **MATCHED** | Không |
| 29 | Contracts | `contractsApi.activate` | POST | `/contracts/:id/activate` | `/api/v1/contracts/{contract_id}/activate` | Match | **MATCHED** | Không |
| 30 | Meters | `metersApi.list` | GET | `/meters` | `/api/v1/meters` | Match | **MATCHED** | Không |
| 31 | Meters | `metersApi.replace` | POST | `/meters/:id/replace` | `/api/v1/meters/{meter_id}/replace` | Match | **MATCHED** | Không |
| 32 | MeterReadings | `metersApi.correctReading` | PATCH | `/meters/:id/readings/:readingId` | `POST /api/v1/meter-readings/{reading_id}/correct` | Path & Method Mismatch | **PARTIAL MATCH** | Cập nhật frontend `meters.api.ts` dùng đúng endpoint POST |
| 33 | Invoices | `invoicesApi.list` | GET | `/invoices` | `/api/v1/invoices` | Match | **MATCHED** | Không |
| 34 | Invoices | `invoicesApi.createDraft` | POST | `/invoices/draft` | `/api/v1/invoices/draft` | Match | **MATCHED** | Không |
| 35 | Invoices | `invoicesApi.issue` | POST | `/invoices/:id/issue` | `/api/v1/invoices/{invoice_id}/issue` | Match | **MATCHED** | Không |
| 36 | Payments | `paymentsApi.createManual` | POST | `/payments/manual` | `/api/v1/payments/manual` | Match | **MATCHED** | Không |
| 37 | Storage CCCD | `storageApi.uploadTenantIdCard` | POST | `/storage/tenant-id-card/upload` | `POST /api/v1/storage/tenants/{tenant_id}/id-card/{side}` | Path Mismatch | **PARTIAL MATCH** | Cập nhật frontend `storage.api.ts` khớp URL FastAPI |
| 38 | Storage Meter | `storageApi.uploadMeterReadingImage` | POST | `/storage/meter-reading/upload` | `POST /api/v1/storage/meter-readings/{reading_id}/image` | Path Mismatch | **PARTIAL MATCH** | Cập nhật frontend `storage.api.ts` khớp URL FastAPI |
| 39 | Dashboard | `dashboardApi.getSummary` | GET | `/dashboard/summary` | *(Không có)* | Missing `/api/v1/dashboard/*` | **MISSING BACKEND** | Màn hình Dashboard gắn tag `PLACEHOLDER` |

---

## TỔNG HỢP TRẠNG THÁI AUDIT

- **MATCHED**: 33 endpoints.
- **PARTIAL MATCH (đã sửa ở frontend)**: 3 endpoints (`correctReading`, `uploadTenantIdCard`, `uploadMeterReadingImage`).
- **MISSING BACKEND**: Dashboard summary (`/dashboard/summary`), Auth logout (`/auth/logout`), Invoice manual item delete/update (có add item).
- **UNUSED BACKEND**: Tất cả backend routers đã đăng ký đều được tiêu thụ.
