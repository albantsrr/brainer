#!/usr/bin/env python3
"""
Migrate SQLite database to PostgreSQL for Brainer application.

This script:
1. Reads data from SQLite database (brainer.db)
2. Connects to PostgreSQL database
3. Creates tables if they don't exist
4. Migrates all data (courses, parts, chapters, exercises)

Usage:
    python migrate_db.py [--sqlite-path PATH] [--postgres-url URL]
"""

import argparse
import sqlite3
import sys
from typing import Optional

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("Error: psycopg2 not installed. Install it with: pip install psycopg2-binary")
    sys.exit(1)


def get_sqlite_connection(db_path: str = "brainer.db") -> sqlite3.Connection:
    """Connect to SQLite database."""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Error connecting to SQLite: {e}")
        sys.exit(1)


def get_postgres_connection(database_url: str) -> psycopg2.extensions.connection:
    """Connect to PostgreSQL database."""
    try:
        conn = psycopg2.connect(database_url)
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        sys.exit(1)


def create_postgres_tables(pg_conn: psycopg2.extensions.connection) -> None:
    """Create tables in PostgreSQL if they don't exist."""

    schema = """
    CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parts (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        "order" INTEGER NOT NULL,
        title VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE (course_id, "order")
    );

    CREATE TABLE IF NOT EXISTS chapters (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        part_id INTEGER,
        "order" INTEGER NOT NULL,
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE SET NULL,
        UNIQUE (course_id, "order"),
        UNIQUE (course_id, slug)
    );

    CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER NOT NULL,
        "order" INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        content JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
        UNIQUE (chapter_id, "order")
    );

    CREATE INDEX IF NOT EXISTS idx_parts_course_id ON parts(course_id);
    CREATE INDEX IF NOT EXISTS idx_chapters_course_id ON chapters(course_id);
    CREATE INDEX IF NOT EXISTS idx_chapters_part_id ON chapters(part_id);
    CREATE INDEX IF NOT EXISTS idx_exercises_chapter_id ON exercises(chapter_id);
    """

    try:
        with pg_conn.cursor() as cursor:
            cursor.execute(schema)
        pg_conn.commit()
        print("✅ PostgreSQL tables created successfully")
    except psycopg2.Error as e:
        print(f"❌ Error creating tables: {e}")
        pg_conn.rollback()
        sys.exit(1)


def migrate_table(
    sqlite_conn: sqlite3.Connection,
    pg_conn: psycopg2.extensions.connection,
    table_name: str,
    columns: list[str],
) -> int:
    """Migrate data from SQLite table to PostgreSQL table."""

    print(f"📦 Migrating {table_name}...")

    # Read from SQLite
    sqlite_cursor = sqlite_conn.cursor()
    sqlite_cursor.execute(f"SELECT {', '.join(columns)} FROM {table_name}")
    rows = sqlite_cursor.fetchall()

    if not rows:
        print(f"  No data to migrate in {table_name}")
        return 0

    # Convert rows to list of tuples
    data = [tuple(row) for row in rows]

    # Insert into PostgreSQL
    placeholders = ', '.join(['%s'] * len(columns))
    insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"

    try:
        with pg_conn.cursor() as cursor:
            cursor.executemany(insert_query, data)
        pg_conn.commit()
        print(f"  ✅ Migrated {len(rows)} rows from {table_name}")
        return len(rows)
    except psycopg2.Error as e:
        print(f"  ❌ Error migrating {table_name}: {e}")
        pg_conn.rollback()
        return 0


def migrate_database(sqlite_path: str, postgres_url: str) -> None:
    """Migrate entire database from SQLite to PostgreSQL."""

    print("🚀 Starting database migration")
    print(f"  SQLite: {sqlite_path}")
    print(f"  PostgreSQL: {postgres_url.split('@')[1] if '@' in postgres_url else 'localhost'}")
    print()

    # Connect to databases
    sqlite_conn = get_sqlite_connection(sqlite_path)
    pg_conn = get_postgres_connection(postgres_url)

    # Create PostgreSQL tables
    create_postgres_tables(pg_conn)
    print()

    # Migrate data in order (respecting foreign keys)
    tables = [
        ("courses", ["id", "slug", "title", "description", "image", "created_at", "updated_at"]),
        ("parts", ["id", "course_id", '"order"', "title", "created_at"]),
        ("chapters", ["id", "course_id", "part_id", '"order"', "slug", "title", "content", "image", "created_at", "updated_at"]),
        ("exercises", ["id", "chapter_id", '"order"', "type", "content", "created_at"]),
    ]

    total_rows = 0
    for table_name, columns in tables:
        count = migrate_table(sqlite_conn, pg_conn, table_name, columns)
        total_rows += count

    # Update sequences for auto-increment
    print()
    print("🔧 Updating sequences...")
    for table_name, _ in tables:
        try:
            with pg_conn.cursor() as cursor:
                cursor.execute(f"""
                    SELECT setval(
                        pg_get_serial_sequence('{table_name}', 'id'),
                        COALESCE((SELECT MAX(id) FROM {table_name}), 1)
                    )
                """)
            pg_conn.commit()
        except psycopg2.Error as e:
            print(f"  ⚠️  Warning: Could not update sequence for {table_name}: {e}")

    # Close connections
    sqlite_conn.close()
    pg_conn.close()

    print()
    print(f"🎉 Migration completed successfully!")
    print(f"  Total rows migrated: {total_rows}")


def main():
    parser = argparse.ArgumentParser(
        description="Migrate Brainer database from SQLite to PostgreSQL"
    )
    parser.add_argument(
        "--sqlite-path",
        default="brainer.db",
        help="Path to SQLite database file (default: brainer.db)",
    )
    parser.add_argument(
        "--postgres-url",
        help="PostgreSQL connection URL (e.g., postgresql://user:pass@localhost/brainer)",
    )

    args = parser.parse_args()

    # Get PostgreSQL URL from args or environment
    postgres_url = args.postgres_url
    if not postgres_url:
        import os
        postgres_url = os.getenv("DATABASE_URL")
        if not postgres_url:
            print("Error: PostgreSQL URL not provided")
            print("  Use --postgres-url or set DATABASE_URL environment variable")
            sys.exit(1)

    # Run migration
    try:
        migrate_database(args.sqlite_path, postgres_url)
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
