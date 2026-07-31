from typing import Optional
from pydantic import BaseModel, Field
from app.models.enums import UserRole

class LoginRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, description="Số điện thoại đăng nhập")
    password: str = Field(..., min_length=6, description="Mật khẩu")

class UserMeData(BaseModel):
    id: str
    phone: str
    email: Optional[str] = None
    fullName: str
    role: UserRole
    isActive: bool = True
    mustChangePassword: bool = False

class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    tokenType: str = "Bearer"
    user: UserMeData

class RefreshTokenRequest(BaseModel):
    refreshToken: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    oldPassword: str = Field(..., min_length=6)
    newPassword: str = Field(..., min_length=6)
