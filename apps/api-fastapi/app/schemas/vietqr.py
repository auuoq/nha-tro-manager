from pydantic import BaseModel

class VietQRResponseSchema(BaseModel):
    invoiceId: str
    invoiceCode: str
    bankId: str
    bankName: str
    accountNo: str
    accountName: str
    amount: int
    content: str
    qrDataURL: str
    qrQuickLink: str
