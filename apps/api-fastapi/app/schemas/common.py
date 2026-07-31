import uuid
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")

class APIResponse(BaseModel, Generic[DataT]):
    success: bool = True
    data: Optional[DataT] = None
    message: Optional[str] = None
    requestId: str = Field(default_factory=lambda: str(uuid.uuid4()))

class APIErrorResponse(BaseModel):
    success: bool = False
    data: None = None
    message: str
    code: str
    requestId: str = Field(default_factory=lambda: str(uuid.uuid4()))
