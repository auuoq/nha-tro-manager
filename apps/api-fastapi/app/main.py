import uuid
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.buildings import router as buildings_router
from app.api.v1.rooms import router as rooms_router
from app.api.v1.room_assets import router as room_assets_router
from app.api.v1.tenants import router as tenants_router
from app.api.v1.tenant_accounts import router as tenant_accounts_router
from app.api.v1.tenant_profile import router as tenant_profile_router
from app.api.v1.contracts import router as contracts_router
from app.api.v1.contract_tenants import router as contract_tenants_router
from app.api.v1.meters import router as meters_router
from app.api.v1.meter_readings import router as meter_readings_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.tenant_invoices import router as tenant_invoices_router
from app.api.v1.payments import router as payments_router
from app.api.v1.payment_webhooks import router as payment_webhooks_router
from app.api.v1.vietqr import router as vietqr_router
from app.api.v1.tenant_payments import router as tenant_payments_router
from app.api.v1.storage import router as storage_router

app = FastAPI(
    title="Nha Tro Manager API",
    description="Hệ thống RESTful API Quản lý Nhà trọ theo kiến trúc Tách biệt FastAPI & React SPA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS — must be registered before other middlewares.
# allow_credentials=True is required for httpOnly cookie refresh token.
# CORS_ORIGINS must list exact frontend origin(s); wildcard "*" is incompatible with credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    err_code = getattr(exc, "code", f"HTTP_{exc.status_code}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": str(exc.detail),
            "code": err_code,
            "requestId": request_id,
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    first_err = exc.errors()[0] if exc.errors() else {}
    msg = f"Dữ liệu không hợp lệ: {first_err.get('msg', 'Validation Error')} tại {first_err.get('loc', [])}"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "data": None,
            "message": msg,
            "code": "VALIDATION_ERROR",
            "requestId": request_id,
        },
    )

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(buildings_router, prefix="/api/v1")
app.include_router(rooms_router, prefix="/api/v1")
app.include_router(room_assets_router, prefix="/api/v1")
app.include_router(tenants_router, prefix="/api/v1")
app.include_router(tenant_accounts_router, prefix="/api/v1")
app.include_router(tenant_profile_router, prefix="/api/v1")
app.include_router(contracts_router, prefix="/api/v1")
app.include_router(contract_tenants_router, prefix="/api/v1")
app.include_router(meters_router, prefix="/api/v1")
app.include_router(meter_readings_router)
app.include_router(invoices_router, prefix="/api/v1")
app.include_router(tenant_invoices_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
app.include_router(payment_webhooks_router)
app.include_router(vietqr_router, prefix="/api/v1")
app.include_router(tenant_payments_router, prefix="/api/v1")
app.include_router(storage_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Nha Tro Manager FastAPI Server is Running"}
