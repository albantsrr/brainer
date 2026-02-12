# PostgreSQL Migration Guide

Complete guide for migrating Brainer from SQLite to PostgreSQL.

## Table of Contents

1. [Why PostgreSQL?](#why-postgresql)
2. [Migration Process](#migration-process)
3. [Database Configuration](#database-configuration)
4. [Testing Migration](#testing-migration)
5. [Rollback Plan](#rollback-plan)

## Why PostgreSQL?

### SQLite Limitations

While SQLite works well for development, it has limitations for production:
- Single writer at a time (write locks entire database)
- No built-in replication or clustering
- Limited concurrency for web applications
- File-based (harder to backup/restore in containers)

### PostgreSQL Benefits

PostgreSQL is better suited for production:
- Multi-user concurrent access
- ACID compliance with row-level locking
- Built-in backup and replication
- Better performance for complex queries
- Industry-standard for web applications

## Migration Process

### Step 1: Update Backend Code

**Update database connection in `api/database.py`:**

```python
# OLD (SQLite)
SQLALCHEMY_DATABASE_URL = "sqlite:///./brainer.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# NEW (PostgreSQL)
import os
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://brainer:password@localhost/brainer"
)
engine = create_engine(SQLALCHEMY_DATABASE_URL)
```

**Key differences:**
- Remove `check_same_thread` (PostgreSQL-specific)
- Use environment variable for connection string
- Change database URL format

### Step 2: Update SQLAlchemy Models

Most models work unchanged, but check for SQLite-specific features:

**JSON columns:**
```python
# Works for both SQLite and PostgreSQL
from sqlalchemy import JSON
content = Column(JSON)
```

**Auto-increment IDs:**
```python
# Works for both (PostgreSQL uses SERIAL)
id = Column(Integer, primary_key=True, index=True)
```

**Timestamps:**
```python
# Works for both
from datetime import datetime
created_at = Column(DateTime, default=datetime.utcnow)
```

### Step 3: Install PostgreSQL Driver

Add to `requirements.txt`:
```
psycopg2-binary==2.9.9
```

Then install:
```bash
pip install psycopg2-binary
```

### Step 4: Run Migration Script

**Prepare:**
1. Ensure SQLite database exists (`brainer.db`)
2. Start PostgreSQL container: `docker-compose up -d postgres`
3. Set DATABASE_URL environment variable

**Execute migration:**
```bash
# Set PostgreSQL connection
export DATABASE_URL="postgresql://brainer:your-password@localhost:5432/brainer"

# Run migration
python scripts/migrate_db.py
```

**What the script does:**
1. Connects to both SQLite and PostgreSQL
2. Creates PostgreSQL tables (if not exist)
3. Migrates data in order: courses → parts → chapters → exercises
4. Updates sequences for auto-increment IDs
5. Verifies migration success

### Step 5: Update Dockerfile

**Ensure PostgreSQL driver is installed:**

```dockerfile
# Dockerfile.backend
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \  # Add this
    && rm -rf /var/lib/apt/lists/*
```

### Step 6: Test Backend

**Test locally:**
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Set environment
export DATABASE_URL="postgresql://brainer:password@localhost:5432/brainer"

# Run backend
uvicorn api.main:app --reload
```

**Verify:**
- API starts without errors
- Endpoints return correct data
- Create/update/delete operations work

### Step 7: Update Docker Compose

Ensure `docker-compose.yml` has correct DATABASE_URL:

```yaml
backend:
  environment:
    DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```

### Step 8: Deploy

```bash
# Build with PostgreSQL support
./scripts/build_images.sh

# Push images
./scripts/push_images.sh

# Deploy to server
./scripts/deploy.sh
```

## Database Configuration

### Connection Pool Settings

For production, configure connection pooling in `api/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,          # Max connections
    max_overflow=10,      # Allow burst
    pool_timeout=30,      # Wait time for connection
    pool_recycle=3600,    # Recycle connections after 1h
)
```

### PostgreSQL Configuration

Optimize PostgreSQL for your workload:

**For small VPS (2GB RAM):**
```ini
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB
max_connections = 50
```

Add to `docker-compose.yml`:
```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "max_connections=50"
```

## Testing Migration

### Data Verification

**Compare record counts:**
```bash
# SQLite
sqlite3 brainer.db "SELECT COUNT(*) FROM courses;"
sqlite3 brainer.db "SELECT COUNT(*) FROM chapters;"

# PostgreSQL
docker exec brainer-postgres psql -U brainer -c "SELECT COUNT(*) FROM courses;"
docker exec brainer-postgres psql -U brainer -c "SELECT COUNT(*) FROM chapters;"
```

**Verify data integrity:**
```python
# Test script
import requests

# Compare API responses before/after
courses_before = requests.get("http://localhost:8000/api/courses").json()
# ... run migration ...
courses_after = requests.get("http://localhost:8000/api/courses").json()

assert len(courses_before) == len(courses_after)
```

### Performance Testing

**Simple load test:**
```bash
# Install ab (Apache Bench)
apt-get install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://localhost:8000/api/courses
```

Compare SQLite vs PostgreSQL response times.

## Rollback Plan

If migration fails or causes issues:

### Option 1: Revert Backend Code

```bash
# Switch back to SQLite
git checkout main -- api/database.py

# Restart backend with SQLite
export DATABASE_URL="sqlite:///./brainer.db"
uvicorn api.main:app --reload
```

### Option 2: Keep Both Databases

Run SQLite and PostgreSQL in parallel during transition:

```python
# api/database.py
import os

DB_TYPE = os.getenv("DB_TYPE", "sqlite")

if DB_TYPE == "postgres":
    SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./brainer.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
```

Switch between them with environment variable.

### Option 3: Restore from Backup

```bash
# If you have a backup
docker exec -i brainer-postgres psql -U brainer brainer < backup_before_migration.sql

# Restart containers
docker-compose restart
```

## Post-Migration Tasks

### 1. Remove SQLite Artifacts

After successful migration:
```bash
# Remove SQLite database from backend image
rm brainer.db

# Update .dockerignore to exclude SQLite
echo "*.db" >> .dockerignore
```

### 2. Setup Automated Backups

```bash
# Create backup script
cat > /opt/brainer/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/brainer/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker exec brainer-postgres pg_dump -U brainer brainer > $BACKUP_DIR/backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x /opt/brainer/backup.sh

# Add to cron (daily at 2am)
echo "0 2 * * * /opt/brainer/backup.sh" | crontab -
```

### 3. Monitor Performance

Use PostgreSQL's built-in monitoring:

```sql
-- Slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Database size
SELECT pg_size_pretty(pg_database_size('brainer'));

-- Table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Connection Errors

**Error:** `could not connect to server: Connection refused`

**Solutions:**
1. Check PostgreSQL is running: `docker-compose ps postgres`
2. Verify port is exposed: `docker-compose port postgres 5432`
3. Check DATABASE_URL format: `postgresql://user:pass@host:port/db`

### Authentication Errors

**Error:** `FATAL: password authentication failed`

**Solutions:**
1. Verify POSTGRES_PASSWORD in .env matches DATABASE_URL
2. Check user exists: `docker exec brainer-postgres psql -U postgres -c "\du"`
3. Reset password if needed: `ALTER USER brainer WITH PASSWORD 'newpass';`

### Migration Script Errors

**Error:** `psycopg2.errors.UniqueViolation`

**Solution:**
Database not empty. Drop and recreate:
```bash
docker exec brainer-postgres psql -U postgres -c "DROP DATABASE brainer;"
docker exec brainer-postgres psql -U postgres -c "CREATE DATABASE brainer;"
docker exec brainer-postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE brainer TO brainer;"
```

### Data Type Errors

**Error:** `column "content" is of type json but expression is of type text`

**Solution:**
Cast explicitly in queries:
```python
# SQLAlchemy
from sqlalchemy import cast, JSON
query.filter(cast(Exercise.content, JSON)["type"] == "multiple_choice")
```
