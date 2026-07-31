from pydantic import BaseModel

class TenantAccountCreateResponseSchema(BaseModel):
    tenantId: str
    userId: str
    phone: str
    tempPassword: str
    mustChangePassword: bool = True
    message: str = "Tạo tài khoản thành công. Mật khẩu tạm thời chỉ hiển thị một lần duy nhất này."

class TempPasswordResponseSchema(BaseModel):
    tenantId: str
    userId: str
    tempPassword: str
    message: str = "Đặt lại mật khẩu thành công. Tất cả các phiên làm việc cũ đã bị hủy."
