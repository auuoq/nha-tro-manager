import enum

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    OWNER = "OWNER"
    TENANT = "TENANT"

class OwnerStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    TERMINATED = "TERMINATED"

class RoomStatus(str, enum.Enum):
    VACANT = "VACANT"
    RESERVED = "RESERVED"
    RENTED = "RENTED"
    MAINTENANCE = "MAINTENANCE"

class ContractStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    EXPIRING = "EXPIRING"
    TERMINATED = "TERMINATED"
    CANCELLED = "CANCELLED"

class ContractTenantRole(str, enum.Enum):
    PRIMARY = "PRIMARY"
    MEMBER = "MEMBER"

class MeterType(str, enum.Enum):
    ELECTRICITY = "ELECTRICITY"
    WATER = "WATER"

class MeterReadingStatus(str, enum.Enum):
    RECORDED = "RECORDED"
    VERIFIED = "VERIFIED"
    INVALIDATED = "INVALIDATED"

class ChargeType(str, enum.Enum):
    ELECTRICITY = "ELECTRICITY"
    WATER = "WATER"
    WIFI = "WIFI"
    GARBAGE = "GARBAGE"
    PARKING = "PARKING"
    OTHER = "OTHER"

class ChargeMethod(str, enum.Enum):
    METERED = "METERED"
    PER_PERSON = "PER_PERSON"
    PER_ROOM = "PER_ROOM"
    FREE = "FREE"

class InvoiceStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ISSUED = "ISSUED"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    CANCELLED = "CANCELLED"

class InvoiceItemType(str, enum.Enum):
    ROOM = "ROOM"
    ELECTRICITY = "ELECTRICITY"
    WATER = "WATER"
    WIFI = "WIFI"
    GARBAGE = "GARBAGE"
    PARKING = "PARKING"
    PREVIOUS_DEBT = "PREVIOUS_DEBT"
    DISCOUNT = "DISCOUNT"
    OTHER = "OTHER"

class PaymentMethod(str, enum.Enum):
    VIETQR = "VIETQR"
    BANK_TRANSFER = "BANK_TRANSFER"
    CASH = "CASH"
    BANK_WEBHOOK = "BANK_WEBHOOK"
    OTHER = "OTHER"

class PaymentSource(str, enum.Enum):
    ADMIN_MANUAL = "ADMIN_MANUAL"
    BANK_WEBHOOK = "BANK_WEBHOOK"
    SYSTEM = "SYSTEM"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PENDING_REVIEW = "PENDING_REVIEW"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED"

class WebhookEventStatus(str, enum.Enum):
    UNMATCHED = "UNMATCHED"
    PROCESSED = "PROCESSED"
    REJECTED = "REJECTED"

class MaintenanceStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"

class MaintenancePriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"
