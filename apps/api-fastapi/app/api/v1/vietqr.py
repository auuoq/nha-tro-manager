from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.vietqr_service import VietQRService
from app.schemas.vietqr import VietQRResponseSchema
from app.schemas.common import APIResponse

router = APIRouter(prefix="/invoices", tags=["VietQR Integrations"])
vietqr_service = VietQRService()

@router.get("/{invoice_id}/vietqr", response_model=APIResponse[VietQRResponseSchema])
async def get_invoice_vietqr(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    qr_data = await vietqr_service.generate_vietqr_for_invoice(db, invoice_id)
    return APIResponse(
        success=True,
        data=qr_data,
        message="Sinh mã VietQR thanh toán hóa đơn thành công",
    )
