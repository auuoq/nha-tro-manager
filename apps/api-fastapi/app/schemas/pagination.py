from typing import Generic, TypeVar, List
from pydantic import BaseModel, Field

T = TypeVar("T")

class PaginatedData(BaseModel, Generic[T]):
    items: List[T]
    page: int
    pageSize: int
    total: int
    totalPages: int

class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1, description="Trang cần lấy")
    pageSize: int = Field(default=20, ge=1, le=100, description="Số lượng mục trên mỗi trang (tối đa 100)")
