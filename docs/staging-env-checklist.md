# Staging Environment Checklist — Phase H

> Checklist này hu?ng d?n ngu?i dùng provisioning staging infrastructure.
> Agent KHÔNG yêu c?u paste secret vào chat.
> Agent CH? c?n các giá tr? không bí m?t (public URL, bucket name, region).

---

## PH?N 1 — SUPABASE POSTGRESQL

### 1.1 T?o Project

- [ ] Truy c?p https://supabase.com/dashboard
- [ ] T?o m?i project (ví d?: `nha-tro-manager-staging`)
- [ ] Ch?n region g?n nh?t (Singapore ho?c Tokyo)
- [ ] Ghi l?i `Project Reference ID` (public, không ph?i secret)

### 1.2 L?y DATABASE_URL

- [ ] Vào **Settings ? Database**
- [ ] Copy connection string d?ng **Transaction Pooler** (port 6543) ho?c **Session Mode** (port 5432)
- [ ] Format: `postgresql+asyncpg://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres`
- [ ] **Luu vào môi tru?ng local** (không paste vào chat)
- [ ] Set giá tr? này vào dashboard hosting backend (Render/Railway) du?i key `DATABASE_URL`

### 1.3 Xác nh?n

- [ ] `DATABASE_URL` dã set trên dashboard backend
- [ ] Không commit `DATABASE_URL` vào git

---

## PH?N 2 — SUPABASE STORAGE (S3-compatible)

### 2.1 T?o Bucket

- [ ] Vào **Storage** trong Supabase dashboard
- [ ] T?o bucket m?i, d?t tên: `private-uploads`
- [ ] **T?t** "Public bucket" ? ch?n **Private**
- [ ] Ghi l?i bucket name: `private-uploads`

### 2.2 L?y S3 Credentials

- [ ] Vào **Settings ? Storage ? S3 Connection**
- [ ] Ghi l?i:
  - `S3_ENDPOINT_URL`: `https://<project-ref>.supabase.co/storage/v1/s3`
  - `S3_REGION`: `us-east-1` (Supabase dùng c? d?nh)
  - `S3_BUCKET`: `private-uploads`
  - `S3_ACCESS_KEY_ID`: *(secret — ch? set vào dashboard, không paste vào chat)*
  - `S3_SECRET_ACCESS_KEY`: *(secret — ch? set vào dashboard, không paste vào chat)*

### 2.3 Cung c?p cho Agent (Public values only)

Sau khi t?o xong, cung c?p các giá tr? **không bí m?t** sau:

```
S3_ENDPOINT_URL=https://<project-ref>.supabase.co/storage/v1/s3
S3_REGION=us-east-1
S3_BUCKET=private-uploads
S3_FORCE_PATH_STYLE=true
```

### 2.4 Set Secrets trên Dashboard Backend

- [ ] `S3_ACCESS_KEY_ID` ? set trên Render/Railway dashboard
- [ ] `S3_SECRET_ACCESS_KEY` ? set trên Render/Railway dashboard

---

## PH?N 3 — BACKEND HOSTING (Render.com)

### 3.1 T?o Web Service

- [ ] Truy c?p https://render.com
- [ ] T?o **New Web Service**
- [ ] Connect repository ho?c deploy t? Dockerfile
- [ ] Runtime: **Docker** (dùng `apps/api-fastapi/Dockerfile`)
  - Root Directory: `apps/api-fastapi`
  - Dockerfile Path: `./Dockerfile`
- [ ] Ghi l?i **Public Service URL** (ví d?: `https://nha-tro-api-staging.onrender.com`)

### 3.2 Set Environment Variables trên Render Dashboard

Set các bi?n sau trên **Render ? Environment**:

| Key | Ghi chú |
|---|---|
| `DATABASE_URL` | Supabase transaction pooler URL (secret) |
| `JWT_SECRET` | Random 32+ char string (secret — KHÔNG dùng l?i local JWT secret) |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `CORS_ORIGINS` | `https://<frontend-url>.vercel.app` (public) |
| `APP_ENV` | `staging` |
| `STORAGE_PROVIDER` | `s3` |
| `S3_ENDPOINT_URL` | Supabase S3 endpoint (public) |
| `S3_REGION` | `us-east-1` |
| `S3_BUCKET` | `private-uploads` |
| `S3_ACCESS_KEY_ID` | Supabase S3 key (secret) |
| `S3_SECRET_ACCESS_KEY` | Supabase S3 secret (secret) |
| `S3_FORCE_PATH_STYLE` | `true` |

> **KHÔNG** set `DATABASE_URL` local, `JWT_SECRET` local, hay b?t k? credential nào dùng cho `nha_tro_integration_test` lên staging.

### 3.3 Xác nh?n cho Agent

Sau khi set xong, cung c?p (public info only):

```
BACKEND_STAGING_URL=https://nha-tro-api-staging.onrender.com
CORS_ORIGINS_VALUE=https://nha-tro-staging.vercel.app
```

---

## PH?N 4 — FRONTEND HOSTING (Vercel)

### 4.1 T?o Project

- [ ] Truy c?p https://vercel.com
- [ ] Import repository
- [ ] **Framework Preset**: Vite
- [ ] **Root Directory**: `apps/web-react`
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`

### 4.2 Set Environment Variables trên Vercel

| Key | Giá tr? |
|---|---|
| `VITE_API_BASE_URL` | `https://nha-tro-api-staging.onrender.com` |

> `VITE_API_BASE_URL` là public URL — không ph?i secret. An toàn d? cung c?p cho Agent.

### 4.3 Xác nh?n cho Agent

Sau khi deploy xong:

```
FRONTEND_STAGING_URL=https://nha-tro-staging.vercel.app
```

---

## PH?N 5 — XÁC NH?N CU?I CÙNG CHO AGENT

Sau khi hoàn thành t?t c? bu?c trên, cung c?p cho Agent:

```
BACKEND_STAGING_URL=https://...
FRONTEND_STAGING_URL=https://...
S3_ENDPOINT_URL=https://...
S3_BUCKET=private-uploads
```

Xác nh?n (ch? nói "dã set"):
- [ ] T?t c? secrets dã set trên Render dashboard
- [ ] Supabase S3 credentials dã set trên Render dashboard
- [ ] Vercel `VITE_API_BASE_URL` dã set

Agent s? th?c hi?n ti?p sau khi nh?n xác nh?n.

---

## PH?N 6 — SECRET ROTATION CHECKLIST (Khi staging b? compromise)

- [ ] Rotate Supabase database password ? update `DATABASE_URL` trên Render dashboard
- [ ] Generate JWT_SECRET m?i ? update trên Render dashboard ? yêu c?u t?t c? user login l?i
- [ ] Rotate S3_ACCESS_KEY_ID/SECRET ? update trên Render dashboard
- [ ] Ki?m tra git history: `git log -S "old_password_value"` ? không du?c match
- [ ] Revoke Supabase API key cu n?u b? l?
- [ ] Verify health/ready endpoint sau khi rotate

---

## T?NG K?T TR?NG THÁI

| Infrastructure | Tr?ng thái |
|---|---|
| Supabase PostgreSQL | ? Ch? User provisioning |
| Supabase Storage | ? Ch? User provisioning |
| Render.com Backend | ? Ch? User provisioning |
| Vercel Frontend | ? Ch? User provisioning |
| Alembic upgrade head | ? Ch? DATABASE_URL staging |
| Health/Ready check | ? Ch? backend deploy |
| SPA rewrite | ? Ch? vercel.json deploy |
| Playwright E2E Staging | ? Ch? d? infrastructure |
