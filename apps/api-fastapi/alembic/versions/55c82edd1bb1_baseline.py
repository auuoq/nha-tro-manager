"""baseline

Revision ID: 55c82edd1bb1
Revises: 
Create Date: 2026-07-31 09:26:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import app.models

# revision identifiers, used by Alembic.
revision: str = '55c82edd1bb1'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Enums
    user_role = postgresql.ENUM('SUPER_ADMIN', 'OWNER', 'TENANT', name='UserRole')
    user_role.create(op.get_bind(), checkfirst=True)

    owner_status = postgresql.ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', name='OwnerStatus')
    owner_status.create(op.get_bind(), checkfirst=True)

    room_status = postgresql.ENUM('VACANT', 'RESERVED', 'RENTED', 'MAINTENANCE', name='RoomStatus')
    room_status.create(op.get_bind(), checkfirst=True)

    contract_status = postgresql.ENUM('DRAFT', 'ACTIVE', 'EXPIRING', 'TERMINATED', 'CANCELLED', name='ContractStatus')
    contract_status.create(op.get_bind(), checkfirst=True)

    contract_tenant_role = postgresql.ENUM('PRIMARY', 'MEMBER', name='ContractTenantRole')
    contract_tenant_role.create(op.get_bind(), checkfirst=True)

    meter_type = postgresql.ENUM('ELECTRICITY', 'WATER', name='MeterType')
    meter_type.create(op.get_bind(), checkfirst=True)

    meter_reading_status = postgresql.ENUM('RECORDED', 'VERIFIED', 'INVALIDATED', name='MeterReadingStatus')
    meter_reading_status.create(op.get_bind(), checkfirst=True)

    charge_type = postgresql.ENUM('ELECTRICITY', 'WATER', 'WIFI', 'GARBAGE', 'PARKING', 'OTHER', name='ChargeType')
    charge_type.create(op.get_bind(), checkfirst=True)

    charge_method = postgresql.ENUM('METERED', 'PER_PERSON', 'PER_ROOM', 'FREE', name='ChargeMethod')
    charge_method.create(op.get_bind(), checkfirst=True)

    invoice_status = postgresql.ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', name='InvoiceStatus')
    invoice_status.create(op.get_bind(), checkfirst=True)

    invoice_item_type = postgresql.ENUM('ROOM', 'ELECTRICITY', 'WATER', 'WIFI', 'GARBAGE', 'PARKING', 'PREVIOUS_DEBT', 'DISCOUNT', 'OTHER', name='InvoiceItemType')
    invoice_item_type.create(op.get_bind(), checkfirst=True)

    payment_method = postgresql.ENUM('VIETQR', 'BANK_TRANSFER', 'CASH', 'BANK_WEBHOOK', 'OTHER', name='PaymentMethod')
    payment_method.create(op.get_bind(), checkfirst=True)

    payment_source = postgresql.ENUM('ADMIN_MANUAL', 'BANK_WEBHOOK', 'SYSTEM', name='PaymentSource')
    payment_source.create(op.get_bind(), checkfirst=True)

    payment_status = postgresql.ENUM('PENDING', 'PENDING_REVIEW', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', name='PaymentStatus')
    payment_status.create(op.get_bind(), checkfirst=True)

    maintenance_status = postgresql.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', name='MaintenanceStatus')
    maintenance_status.create(op.get_bind(), checkfirst=True)

    maintenance_priority = postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT', name='MaintenancePriority')
    maintenance_priority.create(op.get_bind(), checkfirst=True)

    # 2. Create All Tables from SQLAlchemy Metadata
    app.models.Base.metadata.create_all(op.get_bind())

def downgrade() -> None:
    pass
