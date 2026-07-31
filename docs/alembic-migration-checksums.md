# Alembic Migration Immutability & Checksums Audit Report

Báo cáo kiểm soát tính bất biến (Immutability) và Checksum SHA-256 của các file Alembic Migration.

---

## 1. MIGRATION IMMUTABILITY AUDIT ANALYSIS

- **Lịch sử sửa đổi Baseline `55c82edd1bb1`**:
  - Khi khởi tạo ban đầu, baseline revision `55c82edd1bb1` chỉ chứa phần định nghĩa 16 Native PostgreSQL ENUM types (do các bảng lúc trước được khởi tạo bằng `prisma db push`).
  - Khi chuyển sang kiểm thử tái khởi tạo trên database sạch, dòng `app.models.Base.metadata.create_all(op.get_bind())` đã được thêm vào `55c82edd1bb1` để khởi tạo toàn bộ 19 bảng nghiệp vụ từ con số 0.
- **Danh sách Database từng stamp revision**:
  1. `postgres` (Development Database cũ trên Supabase/Local): Đã stamp `55c82edd1bb1` từ giai đoạn tạo ENUMs.
  2. `nha_tro_clean_test` (Clean Schema Test Database): Đã stamp `55c82edd1bb1` từ baseline mới chứa full `create_all`.
- **Đánh giá rủi ro & Giải pháp khắc phục**:
  - Không sửa đổi trực tiếp bất kỳ file migration đã áp dụng nào nữa.
  - Từ Phase G.1 trở đi, tất cả file Alembic Migration hiện tại là **IMMUTABLE (Cố định)**.
  - Mọi thay đổi cấu trúc bảng, thêm cột hoặc chỉ mục mới bắt buộc phải tạo file revision mới (`alembic revision -m "description"`).

---

## 2. TABLE CHECKSUM SHA-256 REGISTRY

| Revision ID | File Name | SHA-256 Checksum | Status |
|---|---|---|---|
| `55c82edd1bb1` | `55c82edd1bb1_baseline.py` | `E9F5D6B1E45E685A7D911D514B0F55DABF69ACB7296890EFE42D3AF174F2E3B8` | **IMMUTABLE — VERIFIED** |
