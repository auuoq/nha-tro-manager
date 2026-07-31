# Phase H — Staging Deployment Plan

> **SCOPE**: Không deploy production. Không xóa Next.js. Không phát tri?n feature m?i.

---

## 1. AUDIT K?T QU? HI?N T?I

### A. FastAPI Backend (`apps/api-fastapi`)

| H?ng m?c | Tr?ng thái |
|---|---|
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| ASGI | uvicorn[standard] |
| CORSMiddleware | **THI?U** — chua mount vào `app` |
| S3 Provider | Implemented (`S3PrivateStorageProvider`) |
| Dockerfile | **CHUA T?N T?I** — s? t?o trong Phase H |
| CORS_ORIGINS | Ðu?c d?c t? config nhung chua mount middleware |

> **CAUTION**: `apps/api-fastapi/.env` ch?a Supabase DATABASE_URL th?t. File b? `.gitignore` — KHÔNG du?c commit.

### B. React Vite SPA (`apps/web-react`)

| H?ng m?c | Tr?ng thái |
|---|---|
| Build command | `npm run build` (`tsc -b && vite build`) |
| Output directory | `apps/web-react/dist/` |
| Dev proxy | `/api ? http://127.0.0.1:8000` (ch? ho?t d?ng khi `vite dev`) |
| SPA fallback | **CHUA CÓ** — c?n `vercel.json` ho?c nginx config |
| `VITE_API_BASE_URL` | **CHUA ÐU?C Ð?C** — c?n thêm d? SPA tr? backend staging |

---

## 2. PLATFORM STAGING

| Service | Platform | Lý do |
|---|---|---|
| Backend (FastAPI) | **Render.com** ho?c **Railway** | Native Python/uvicorn, env vars b?o m?t, git deploy |
| Database (PostgreSQL) | **Supabase** | Ðã có account + connection string trong .env |
| Storage (S3-compat) | **Supabase Storage** | S3-compatible API, private bucket, signed URL |
| Frontend (React SPA) | **Vercel** | SPA rewrite don gi?n qua `vercel.json`, free tier |

---

## 3. CODE CHANGES C?N TH?C HI?N

### 3.1 CORSMiddleware (THI?U — b?t bu?c)

Thêm vào `apps/api-fastapi/app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,  # Required for httpOnly cookie refresh token
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3.2 config.py — b? sung STORAGE + APP_ENV

```python
APP_ENV: str = "development"
STORAGE_PROVIDER: str = "local"
S3_ENDPOINT_URL: str = ""
S3_REGION: str = "us-east-1"
S3_BUCKET: str = "private-uploads"
S3_ACCESS_KEY_ID: str = ""
S3_SECRET_ACCESS_KEY: str = ""
```

### 3.3 Dockerfile (apps/api-fastapi/Dockerfile)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.4 vercel.json (apps/web-react/vercel.json) — SPA fallback

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

### 3.5 Frontend API base URL

Thêm vào `apps/web-react/src/api/client.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
// axios baseURL: `${API_BASE}/api/v1`
```

### 3.6 .env.example chu?n hóa

Thêm t?t c? S3 vars vào `apps/api-fastapi/.env.example`. Không ch?a secret th?t.

---

## 4. QUY TRÌNH DEPLOY (Th? t? nghiêm ng?t)

```
[USER ACTION REQUIRED]
Step 1: T?o/xác nh?n Supabase project ? copy DATABASE_URL (không paste vào chat)
Step 2: T?o Supabase Storage bucket (private) ? set S3 credentials trên dashboard backend
Step 3: T?o Render.com/Railway service ? set t?t c? env vars trên dashboard
Step 4: Xác nh?n "secrets dã set" (không c?n paste giá tr?)

[AGENT ACTIONS]
Step 5: Apply code changes (CORS, Dockerfile, vercel.json, env.example, client.ts)
Step 6: alembic upgrade head v?i staging DATABASE_URL
Step 7: Ki?m tra GET /health + /health/ready ? HTTP 200
Step 8: Seed staging data
Step 9: Ch?y Playwright E2E trên staging URL th?t
Step 10: Ðánh giá UAT Gate ? verdict
```

---

## 5. UAT GATE — 9 ÐI?U KI?N

Ch? output `READY FOR STAGING UAT` khi pass d? c? 9:

| # | Ði?u ki?n | Phuong th?c ki?m tra |
|---|---|---|
| 1 | `GET /api/v1/health/ready` ? 200 | HTTP check trên staging URL |
| 2 | Alembic ? `head` (55c82edd1bb1) | `alembic current` v?i staging DB |
| 3 | React route refresh không 404 | Browser manual check |
| 4 | Login / refresh token / logout pass | Playwright auth.spec.ts |
| 5 | Owner E2E pass | Playwright owner-core-flow.spec.ts |
| 6 | Tenant E2E pass | Playwright tenant-core-flow.spec.ts |
| 7 | Authorization pass | Playwright authorization.spec.ts |
| 8 | S3 upload/signed URL/delete pass | pytest ho?c manual API test |
| 9 | Không có staging secret trong git | `git log -S "staging_password"` |

---

## 6. NGOÀI PH?M VI PHASE H

- Không deploy production.
- Không xóa ho?c s?a Next.js legacy (`/src`, `next.config.ts`, `/prisma`).
- Không thêm feature m?i.
- Không thay d?i route URL ho?c redesign UI.
