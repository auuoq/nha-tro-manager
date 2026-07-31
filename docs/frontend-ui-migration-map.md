# Frontend UI Migration Map (Next.js → React Vite SPA)

Tài liệu ghi nhận bản đồ chuyển đổi giao diện UI từ dự án Next.js cũ sang dự án React SPA mới (`apps/web-react`).

> [!IMPORTANT]
> **Nguyên tắc UI Freeze:**
> - Giữ nguyên 100% bố cục, màu sắc, typography, animation, spacing, Tailwind classes và wording tiếng Việt.
> - Tuyệt đối không redesign hay tự ý thay đổi visual style.

---

## Phase F1 & Phase F2 Migration Mapping

| STT | Route Next.js Cũ | File Nguồn Next.js | Route React Mới | Component React Mới | API Endpoints | Query Keys | Visual Status |
|---|---|---|---|---|---|---|---|
| 1 | `/login` | `src/app/(auth)/login/page.tsx` | `/login` | `apps/web-react/src/pages/login-page.tsx` | `POST /auth/login` | - | **Port 100%** |
| 2 | `/change-password` | Form Modal | `/change-password` | `apps/web-react/src/pages/auth/change-password-page.tsx` | `POST /auth/change-password` | - | **Port 100%** |
| 3 | `/admin/dashboard` | `src/app/(admin)/admin/dashboard/page.tsx` | `/admin/dashboard` | `apps/web-react/src/pages/dashboards.tsx` | - | - | **Port 100%** |
| 4 | `/admin/buildings` | `src/app/(admin)/admin/buildings/page.tsx` | `/admin/buildings` | `apps/web-react/src/pages/buildings/buildings-page.tsx` | `GET /buildings`<br>`POST /buildings`<br>`PATCH /buildings/{id}`<br>`DELETE /buildings/{id}` | `["buildings", filters]` | **Port 100%** |
| 5 | `/admin/buildings/:id` | `src/app/(admin)/admin/buildings/[buildingId]/page.tsx` | `/admin/buildings/:buildingId` | `apps/web-react/src/pages/buildings/building-detail-page.tsx` | `GET /buildings/{id}`<br>`GET /buildings/{id}/charge-configs`<br>`POST /buildings/{id}/charge-configs` | `["building", id]`<br>`["building-charge-configs", id]` | **Port 100%** |
| 6 | `/admin/rooms` | `src/app/(admin)/admin/rooms/page.tsx` | `/admin/rooms` | `apps/web-react/src/pages/rooms/rooms-page.tsx` | `GET /rooms`<br>`POST /rooms`<br>`PATCH /rooms/{id}`<br>`PATCH /rooms/{id}/maintenance-status`<br>`DELETE /rooms/{id}` | `["rooms", filters]` | **Port 100%** |
| 7 | `/admin/rooms/:id` | `src/app/(admin)/admin/rooms/[roomId]/page.tsx` | `/admin/rooms/:roomId` | `apps/web-react/src/pages/rooms/room-detail-page.tsx` | `GET /rooms/{id}`<br>`GET /rooms/{id}/assets`<br>`POST /rooms/{id}/assets`<br>`PATCH /rooms/{id}/assets/{assetId}`<br>`DELETE /rooms/{id}/assets/{assetId}` | `["room", id]`<br>`["room-assets", id]` | **Port 100%** |

---

## Technical Error Code Mappings (Phase F2)

| Error Code Backend | Tiếng Việt Hiển Thị UI |
|---|---|
| `BUILDING_NOT_FOUND` | Tòa nhà không tồn tại hoặc không có quyền truy cập |
| `ROOM_NOT_FOUND` | Phòng trọ không tồn tại hoặc không có quyền truy cập |
| `ROOM_NUMBER_ALREADY_EXISTS` | Số phòng này đã tồn tại trong tòa nhà |
| `ROOM_HAS_ACTIVE_CONTRACT` | Không thể lưu trữ/xóa phòng/tòa nhà đang có hợp đồng hoạt động |
| `INVALID_ROOM_STATUS_TRANSITION` | Chỉ cho phép chuyển trạng thái giữa Trong Trống (VACANT) và Bảo Trì (MAINTENANCE) |
| `CHARGE_CONFIG_OVERLAP` | Đơn giá dịch vụ đã tồn tại trong khoảng thời gian áp dụng |
| `FORBIDDEN_RESOURCE_ACCESS` | Bạn không có quyền truy cập tài nguyên này |
