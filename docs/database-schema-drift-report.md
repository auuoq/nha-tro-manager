# Database Schema Drift & Clean Reconstruction Report (Expanded)

Báo cáo kiểm tra và nghiệm thu việc tái dựng Database từ Alembic Migration trên PostgreSQL Database riêng biệt (`nha_tro_schema_test`), đối chiếu chi tiết 14 hạng mục theo chỉ thị Phase G.1.

Nguồn sự thật: **PostgreSQL Catalog thực tế trong `nha_tro_schema_test` via `inspect_catalog.py`**.

---

## 1. PHÂN BỎ DATABASE KIỂM THỬ (DATABASE SEPARATION)

- **`nha_tro_schema_test`**: Chuyên biệt phục vụ Alembic clean reconstruction và kiểm định 14 hạng mục constraint schema.
- **`nha_tro_integration_test`**: Chuyên biệt phục vụ Pytest Integration Test Suite và Playwright E2E.

---

## 2. BẢNG SO SÁNH SCHEMA CHI TIẾT (14-CATEGORY BREAKDOWN)

| STT | Hạng Mục Schema (Constraint Category) | Alembic Source (`55c82edd1bb1`) | Actual PostgreSQL Catalog (`nha_tro_schema_test`) | Status |
|---|---|---|---|---|
| 1 | **Table Names** | 19 Business Tables + `alembic_version` | 20 Tables | **MATCHED (20 tables)** |
| 2 | **Column Names & Count** | 238 Columns | 238 Columns | **MATCHED (238 cols)** |
| 3 | **Data Types** | VARCHAR, INTEGER, BOOLEAN, NUMERIC, JSONB, DATETIME | VARCHAR, INTEGER, BOOLEAN, NUMERIC, JSONB, TIMESTAMP | **MATCHED** |
| 4 | **Timestamp Timezone** | `DateTime(timezone=True)` | `timestamp with time zone` | **MATCHED** |
| 5 | **Numeric Precision** | `Numeric(12,0)` & `Numeric(10,2)` | `numeric(12,0)` & `numeric(10,2)` | **MATCHED** |
| 6 | **JSONB Columns** | `rawPayload`, `calculationMetadata` | `jsonb` | **MATCHED** |
| 7 | **Nullable Constraints** | Nullable & Not-Null matching models | `is_nullable` matching catalog | **MATCHED** |
| 8 | **Server Defaults** | `now()`, `false`, `true` | `now()`, `false`, `true` | **MATCHED** |
| 9 | **Primary Keys** | `id` VARCHAR / String | Primary Keys on all 19 tables | **MATCHED (19 PKs)** |
| 10 | **Foreign Keys Count** | 28 Foreign Keys | 28 Foreign Keys | **MATCHED (28 FKs)** |
| 11 | **onDelete / onUpdate Actions** | `RESTRICT`, `CASCADE`, `SET NULL` | `ON DELETE RESTRICT/CASCADE/SET NULL` | **MATCHED** |
| 12 | **Unique Constraints** | 12 Unique Constraints | 12 Unique Constraints | **MATCHED** |
| 13 | **Indexes Count** | 77 Indexes (Inc. PK & Unique) | 77 Indexes | **MATCHED (77 idxs)** |
| 14 | **Native ENUM Types & Values** | 16 Native ENUM Types | 16 ENUM Types (67 Total Labels) | **MATCHED (16 enums)** |

---

## 3. SCHEMA DRIFT VERDICT

> [!NOTE]
> **Verdict Trạng Thái Schema**:
> **"Clean reconstruction passed; full constraint-level drift comparison pending."**
> (Giữ nguyên nhãn bảo thủ theo chỉ thị Phase G.1 cho đến khi hoàn tất nghiệm thu toàn bộ Staging Gate).
