# Staging UAT Report — Phase H

> Tài li?u này s? du?c di?n khi staging infrastructure dã du?c provisioned và deployed.
> Agent s? update t?ng h?ng m?c sau khi ch?y ki?m tra th?t.

---

## THÔNG TIN STAGING

| Thông tin | Giá tr? |
|---|---|
| Backend URL | *(ch? provisioning)* |
| Frontend URL | *(ch? provisioning)* |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (S3-compatible) |
| Alembic revision | *(ch? upgrade head)* |
| UAT Date | *(ch?)* |

---

## GATE 1 — HEALTH CHECK

| Check | URL | Expected | Result |
|---|---|---|---|
| `/api/v1/health` | `{BACKEND}/api/v1/health` | HTTP 200 | ? |
| `/api/v1/health/ready` | `{BACKEND}/api/v1/health/ready` | HTTP 200 | ? |

---

## GATE 2 — DATABASE MIGRATION

| Check | Command | Expected | Result |
|---|---|---|---|
| Alembic current | `alembic current` | `55c82edd1bb1 (head)` | ? |
| Tables exist | psql inspect | 20 tables | ? |

---

## GATE 3 — SPA ROUTING

| Check | Method | Expected | Result |
|---|---|---|---|
| `/login` renders | Browser | Login page | ? |
| `/admin/buildings` direct URL | Browser refresh | Buildings page (not 404) | ? |
| `/admin/invoices` direct URL | Browser refresh | Invoices page (not 404) | ? |
| `/non-existent` | Browser | 404 page component | ? |

---

## GATE 4 — AUTH FLOW (Cookie-based)

| Check | Method | Expected | Result |
|---|---|---|---|
| Login v?i dúng credential | POST /api/v1/auth/login | 200, accessToken tr? v? | ? |
| Login v?i sai credential | POST /api/v1/auth/login | 401 | ? |
| GET /api/v1/auth/me (v?i token) | Auth header | 200, user data | ? |
| Refresh token | POST /api/v1/auth/refresh | 200, new accessToken | ? |
| Logout | POST /api/v1/auth/logout | 200 | ? |
| CORS header tr? v? | Response headers | `Access-Control-Allow-Origin` = frontend URL | ? |
| Cookie `refreshToken` set | Response headers | `Set-Cookie: refreshToken=...; HttpOnly` | ? |

---

## GATE 5 — OWNER CORE FLOW E2E

Playwright spec: `e2e/owner-core-flow.spec.ts` (ch?y trên staging URL)

| Test | Expected | Result |
|---|---|---|
| 2.1 Owner creates building & room | Pass | ? |
| 2.2 Owner creates tenant and activates contract | Pass | ? |
| 2.3 Owner records meter reading and issues invoice | Pass | ? |
| 2.4 Owner records payment and partial refund | Pass | ? |
| 2.5 Owner core-flow smoke UI verification | Pass | ? |

---

## GATE 6 — TENANT CORE FLOW E2E

Playwright spec: `e2e/tenant-core-flow.spec.ts`

| Test | Expected | Result |
|---|---|---|
| 3.1 Tenant Login & Route Access | Pass | ? |
| 3.2 Tenant Contract Page Access | Pass | ? |
| 3.3 Tenant Invoices & VietQR Access | Pass | ? |
| 3.4 Tenant Payments Access | Pass | ? |

---

## GATE 7 — AUTHORIZATION / RBAC

Playwright spec: `e2e/authorization.spec.ts`

| Test | Expected | Result |
|---|---|---|
| Unauthenticated ? redirect to /login | Pass | ? |
| Non-existent route ? 404 page | Pass | ? |
| Owner role ? can access /admin/* | Pass | ? |
| Tenant role ? blocked /admin/* ? 403 | Pass | ? |

---

## GATE 8 — S3 STORAGE (Supabase Storage)

| Check | Method | Expected | Result |
|---|---|---|---|
| Upload file (< 5MB) | POST /api/v1/storage/upload | 200, objectKey tr? v? | ? |
| Generate signed URL | GET /api/v1/storage/signed-url | 200, URL valid = 300s | ? |
| Access signed URL tr?c ti?p | Browser GET | File download / render | ? |
| Delete file | DELETE /api/v1/storage/{key} | 200 | ? |
| Upload vu?t 5MB | POST /api/v1/storage/upload | 413 / 400 | ? |
| Signed URL expired sau 300s | Browser GET after 5min | 403 / 400 | ? |

---

## GATE 9 — SECRET AUDIT

| Check | Command | Expected | Result |
|---|---|---|---|
| Không có staging password trong git | `git log -S "staging_password"` | No output | ? |
| `.env` files không b? track | `git ls-files .env*` | No output | ? |
| `apps/api-fastapi/.env` không b? track | `git ls-files apps/api-fastapi/.env` | No output | ? |

---

## T?NG K?T

| Gate | Ði?u ki?n | Pass/Fail |
|---|---|---|
| Gate 1 | Health Check | ? |
| Gate 2 | Database Migration | ? |
| Gate 3 | SPA Routing | ? |
| Gate 4 | Auth Flow | ? |
| Gate 5 | Owner E2E | ? |
| Gate 6 | Tenant E2E | ? |
| Gate 7 | Authorization | ? |
| Gate 8 | S3 Storage | ? |
| Gate 9 | Secret Audit | ? |

---

## FINAL VERDICT

> **NOT READY FOR STAGING UAT** — staging infrastructure not provisioned.
>
> Verdict s? du?c c?p nh?t sau khi ngu?i dùng provisioning và agent ch?y UAT trên staging URL th?t.
