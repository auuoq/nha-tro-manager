from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password, hash_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import LoginRequest, TokenResponse, UserMeData, ChangePasswordRequest
from app.schemas.common import APIResponse
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.phone == body.phone.strip(), User.deletedAt.is_(None))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Số điện thoại hoặc mật khẩu không chính xác",
        )

    if not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị tạm khóa, vui lòng liên hệ Admin",
        )

    access_token = create_access_token(user_id=user.id, role=user.role.value, token_version=user.tokenVersion)
    refresh_token = create_refresh_token(user_id=user.id, token_version=user.tokenVersion)

    # Browser SPA Policy: HttpOnly cookie for Refresh Token
    response.set_cookie(
        key="refreshToken",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/api/v1/auth",
    )

    user_data = UserMeData(
        id=user.id,
        phone=user.phone,
        email=user.email,
        fullName=user.fullName,
        role=user.role,
        isActive=user.isActive,
        mustChangePassword=user.mustChangePassword,
    )

    return APIResponse(
        success=True,
        data=TokenResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
            tokenType="Bearer",
            user=user_data,
        ),
        message="Đăng nhập thành công",
    )

@router.post("/logout", response_model=APIResponse[dict])
async def logout(response: Response):
    response.delete_cookie(
        key="refreshToken",
        path="/api/v1/auth",
    )
    return APIResponse(
        success=True,
        data={},
        message="Đăng xuất thành công",
    )

@router.get("/me", response_model=APIResponse[UserMeData])
async def get_me(current_user: User = Depends(get_current_user)):
    user_data = UserMeData(
        id=current_user.id,
        phone=current_user.phone,
        email=current_user.email,
        fullName=current_user.fullName,
        role=current_user.role,
        isActive=current_user.isActive,
        mustChangePassword=current_user.mustChangePassword,
    )
    return APIResponse(
        success=True,
        data=user_data,
        message="Lấy thông tin tài khoản thành công",
    )

@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Strict Browser SPA Refresh: Extract refresh token exclusively from HttpOnly cookie."""
    token_str = request.cookies.get("refreshToken")

    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token HttpOnly cookie không tồn tại trong yêu cầu",
        )

    try:
        payload = decode_token(token_str)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Refresh token không hợp lệ: {str(e)}")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không phải là refresh token")

    user_id = payload.get("sub")
    token_version = payload.get("tokenVersion", 1)

    stmt = select(User).where(User.id == user_id, User.deletedAt.is_(None))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.isActive or user.tokenVersion != token_version:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Phiên làm việc hết hạn hoặc đã bị hủy")

    new_access_token = create_access_token(user_id=user.id, role=user.role.value, token_version=user.tokenVersion)
    new_refresh_token = create_refresh_token(user_id=user.id, token_version=user.tokenVersion)

    response.set_cookie(
        key="refreshToken",
        value=new_refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/api/v1/auth",
    )

    user_data = UserMeData(
        id=user.id,
        phone=user.phone,
        email=user.email,
        fullName=user.fullName,
        role=user.role,
        isActive=user.isActive,
        mustChangePassword=user.mustChangePassword,
    )

    return APIResponse(
        success=True,
        data=TokenResponse(
            accessToken=new_access_token,
            refreshToken=new_refresh_token,
            tokenType="Bearer",
            user=user_data,
        ),
        message="Làm mới token thành công",
    )

@router.post("/change-password", response_model=APIResponse[dict])
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(body.oldPassword, current_user.passwordHash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mật khẩu hiện tại không chính xác")

    current_user.passwordHash = hash_password(body.newPassword)
    current_user.mustChangePassword = False
    current_user.tokenVersion += 1  # Increment version to invalidate all past tokens

    await db.commit()

    return APIResponse(
        success=True,
        data={"userId": current_user.id, "newTokenVersion": current_user.tokenVersion},
        message="Đổi mật khẩu thành công. Tất cả các phiên làm việc cũ đã bị vô hiệu hóa.",
    )
