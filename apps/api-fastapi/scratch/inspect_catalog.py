import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine("postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/nha_tro_schema_test")
    async with engine.connect() as conn:
        print("=== 1. TABLES ===")
        tables = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"))
        t_rows = tables.fetchall()
        print(f"Total tables: {len(t_rows)}")
        for r in t_rows:
            print(" -", r[0])

        print("\n=== 2. COLUMNS & DATA TYPES & TIMEZONES & PRECISION & NULLABLE & DEFAULTS ===")
        cols = await conn.execute(text("""
            SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default, numeric_precision, numeric_scale
            FROM information_schema.columns
            WHERE table_schema='public'
            ORDER BY table_name, ordinal_position;
        """))
        col_rows = cols.fetchall()
        print(f"Total columns across all tables: {len(col_rows)}")

        print("\n=== 3. FOREIGN KEYS & ON DELETE / ON UPDATE ===")
        fks = await conn.execute(text("""
            SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name, rc.update_rule, rc.delete_rule
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            JOIN information_schema.referential_constraints AS rc ON tc.constraint_name = rc.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
        """))
        fk_rows = fks.fetchall()
        print(f"Total Foreign Keys: {len(fk_rows)}")
        for r in fk_rows[:10]:
            print(f" - {r[0]}.{r[1]} -> {r[2]}.{r[3]} (ON DELETE {r[5]}, ON UPDATE {r[4]})")

        print("\n=== 4. UNIQUE CONSTRAINTS & INDEXES ===")
        idxs = await conn.execute(text("SELECT indexname, tablename, indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname;"))
        idx_rows = idxs.fetchall()
        print(f"Total Indexes (including PK/Unique): {len(idx_rows)}")

        print("\n=== 5. NATIVE ENUMS ===")
        enums = await conn.execute(text("SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder;"))
        enum_rows = enums.fetchall()
        enum_map = {}
        for typ, label in enum_rows:
            enum_map.setdefault(typ, []).append(label)
        print(f"Total Native Enum Types: {len(enum_map)}")
        for e_name, e_vals in enum_map.items():
            print(f" - {e_name}: {e_vals}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
