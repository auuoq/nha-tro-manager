# Auth Flow Audit Report

Báo cáo kiểm tra và đánh giá chi tiết cơ chế Xác thực & Phân quyền (Authentication & Authorization) giữa Backend FastAPI và Frontend React SPA.

Nguồn sự thật: **Code thực tế (`app/api/v1/auth.py`, `app/core/security.py`, `src/auth/context/auth-context.tsx`, `src/api/client.ts`)**.

---

## 1. KẾT QUẢ AUDIT CHI TIẾT THEO YÊU CẦU RULE 4

| Câu Hỏi Audit | Kết Quả Thực Tế | Ghi Chú & Cơ Chế Hoạt Động |
|---|---|---|
| **Login trả JSON gì?** | `APIResponse<TokenResponse>` | Trả về object `{ success: true, data: { accessToken, refreshToken, tokenType: "Bearer", user: UserMeData } }` |
| **Set-Cookie có tồn tại không?** | **CÓ** | Backend `login` và `refresh` endpoint tự động phát hành `Set-Cookie` header |
| **Cookie options?** | `key="refreshToken"`, `HttpOnly=True`, `SameSite=Lax`, `Path=/api/v1/auth` | Đảm bảo an toàn chống XSS, chỉ gửi cookie khi gọi route `/api/v1/auth/*` |
| **Access Token Field là gì?** | `accessToken` | Chuỗi JWT token ngắn hạn (15-30 phút), chứa `sub` (userId), `role`, `tokenVersion` |
| **Refresh Token Field là gì?** | `refreshToken` | Chuỗi JWT token dài hạn (7 ngày), lưu trong HttpOnly Cookie |
| **Frontend lưu gì?** | In-Memory Token & LocalStorage Fallback | AccessToken lưu trong state/memory, user info lưu state |
| **Axios gửi gì?** | Header `Authorization: Bearer <accessToken>` | Mọi API request được tự động đính kèm Bearer token qua Axios Interceptor; `withCredentials: true` được bật cho cookie |
| **`/refresh` nhận gì?** | HttpOnly Cookie `refreshToken` | Endpoint `/api/v1/auth/refresh` đọc `request.cookies.get("refreshToken")` |
| **`/logout` có xóa cookie không?** | Cần bổ sung `/logout` route trên backend | Đã bổ sung xóa `refreshToken` cookie với `max_age=0` khi đăng xuất |
| **`/me` dựa vào gì?** | Header `Authorization: Bearer <accessToken>` | Dependency `get_current_user` verify Bearer token trong Authorization Header |

---

## 2. QUY TRÌNH QUẢN LÝ PHIÊN (SESSION LIFECYCLE)

```
[Browser Client]                                  [FastAPI Server]
       │                                                 │
       │─── 1. POST /api/v1/auth/login ─────────────────>│ Verify Phone/Password
       │<── 2. Response: {accessToken, user} + Cookie ───│ Set HttpOnly Cookie refreshToken
       │                                                 │
       │─── 3. GET /api/v1/rooms (Bearer accessToken) ──>│ Verify Bearer Token
       │<── 4. Response: 200 OK + Data ──────────────────│
       │                                                 │
  (AccessToken Expired)                                  │
       │─── 5. GET /api/v1/rooms (Bearer Expired) ──────>│ 401 Unauthorized
       │<── 6. Response 401 ─────────────────────────────│
       │                                                 │
       │─── 7. POST /api/v1/auth/refresh (Cookie) ──────>│ Verify HttpOnly Cookie
       │<── 8. Response: {newAccessToken} + New Cookie ──│ Issue new AccessToken & Cookie
       │                                                 │
       │─── 9. Retry GET /api/v1/rooms (New Bearer) ────>│ 200 OK
```

---

## 3. CÁC KỊCH BẢN ĐÃ ĐƯỢC XÁC MINH (VERIFIED BEHAVIORS)

- **Login Đúng**: Trả về AccessToken + User Data, set HttpOnly Cookie thành công.
- **Login Sai**: Trả về HTTP 401 với message tiếng Việt rõ ràng (`Số điện thoại hoặc mật khẩu không chính xác`).
- **Reload Trang**: App gọi `/auth/me` hoặc `/auth/refresh` để khôi phục session.
- **TokenVersion Thay Đổi (Đổi mật khẩu / Hủy phiên)**: Tự động từ chối cả Access Token lẫn Refresh Token cũ.
- **Role Authorization (RBAC)**: Enforce ở backend qua `require_owner`, `require_tenant`, `require_super_admin`.
