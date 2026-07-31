from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog

async def create_audit_log(
    db: AsyncSession,
    action: str,
    entity: str,
    user_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> AuditLog:
    log_entry = AuditLog(
        userId=user_id,
        action=action,
        entity=entity,
        entityId=entity_id,
        details=details,
        ipAddress=ip_address,
        userAgent=user_agent,
    )
    db.add(log_entry)
    return log_entry
