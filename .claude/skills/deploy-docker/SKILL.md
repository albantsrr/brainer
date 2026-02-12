---
name: deploy-docker
description: Deploy Brainer application (FastAPI backend + Next.js frontend) to VPS using Docker. Includes server setup, Docker image building, PostgreSQL migration, and deployment automation. Use when the user wants to (1) set up a production server, (2) build and push Docker images, (3) migrate from SQLite to PostgreSQL, (4) deploy or update the application, or (5) configure deployment infrastructure.
---

# Deploy Docker

Deploy Brainer to production using Docker containers on a VPS.

## Overview

This skill provides a complete Docker deployment workflow for Brainer:
- **Infrastructure**: VPS setup with Docker, docker-compose, firewall, and security
- **Database**: PostgreSQL migration from SQLite
- **Containers**: FastAPI backend + Next.js frontend + PostgreSQL + Nginx
- **Deployment**: Automated build, push, and deploy scripts

## Deployment Workflow

### First-Time Setup

**1. Configure environment:**
```bash
# Copy template and customize
cp assets/.env.example .env

# Edit required variables
nano .env
```

Required variables in `.env`:
- `DOCKER_REGISTRY` and `DOCKER_USERNAME` (e.g., ghcr.io/yourusername)
- `POSTGRES_PASSWORD` (strong password)
- `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` (VPS connection)

**2. Setup server:**
```bash
# Automated setup (installs Docker, configures firewall)
scripts/setup_server.sh
```

This script:
- Updates system packages
- Installs Docker and docker-compose
- Configures UFW firewall (SSH, HTTP, HTTPS)
- Creates deployment directory at `/opt/brainer`

For manual setup or troubleshooting, see [references/server-setup.md](references/server-setup.md).

**3. Migrate to PostgreSQL:**

Before building images, migrate from SQLite to PostgreSQL:

```bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Update api/database.py to use PostgreSQL
# See references/postgres-migration.md for code changes

# Start local PostgreSQL for testing
docker-compose up -d postgres

# Run migration
export DATABASE_URL="postgresql://brainer:password@localhost:5432/brainer"
python scripts/migrate_db.py --sqlite-path brainer.db
```

For detailed migration guide, see [references/postgres-migration.md](references/postgres-migration.md).

**4. Copy Docker configuration:**
```bash
# Copy all assets to project root
cp assets/Dockerfile.backend ./
cp assets/Dockerfile.frontend ./
cp assets/docker-compose.yml ./
cp assets/nginx.conf ./
```

**5. Update Next.js config:**

Add to `frontend/next.config.js`:
```javascript
module.exports = {
  output: 'standalone',  // Required for Docker
  // ... rest of config
}
```

### Regular Deployment

**1. Build images:**
```bash
scripts/build_images.sh
```

Builds both backend and frontend Docker images with tags from `.env`.

**2. Push to registry:**
```bash
# Login to GitHub Container Registry
export GITHUB_TOKEN=your_personal_access_token

# Push images
scripts/push_images.sh
```

For Docker Hub or other registries, update `DOCKER_REGISTRY` in `.env`.

**3. Deploy to server:**
```bash
scripts/deploy.sh
```

This script:
- Copies docker-compose.yml and .env to server
- Pulls latest images
- Restarts containers with zero downtime
- Shows deployment status

**4. Verify deployment:**
```bash
# Check service status
ssh user@server "cd /opt/brainer && docker-compose ps"

# View logs
ssh user@server "cd /opt/brainer && docker-compose logs -f"
```

Application available at:
- Frontend: `http://your-server-ip`
- Backend API: `http://your-server-ip/api`

## Architecture

### Container Stack

```
nginx (reverse proxy) → ports 80/443
├── frontend:3000 (Next.js)
└── backend:8000 (FastAPI)
      └── postgres:5432 (PostgreSQL)
```

### Service Communication

- **External → Nginx**: Public HTTP/HTTPS traffic
- **Nginx → Frontend**: Proxies `/` to Next.js
- **Nginx → Backend**: Proxies `/api` to FastAPI
- **Backend → PostgreSQL**: Internal connection via `postgres:5432`

### Persistent Data

Three Docker volumes maintain data:
- `postgres_data`: PostgreSQL database files
- `backend_data`: Backend data directory (legacy, may not be needed)
- `nginx_logs`: Access and error logs

### Health Checks

All services have health checks:
- **PostgreSQL**: `pg_isready` command
- **Backend**: HTTP GET to `/health`
- **Frontend**: HTTP GET to `/`
- **Nginx**: HTTP GET to `/health`

Services start only after dependencies are healthy.

## Docker Configuration

### Backend (FastAPI)

**Dockerfile:** `Dockerfile.backend`

Key features:
- Python 3.11 slim base image
- Multi-layer caching (requirements → code)
- Health check on port 8000
- Environment: `DATABASE_URL` for PostgreSQL connection

**Environment variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `ENVIRONMENT`: production/staging/development

### Frontend (Next.js)

**Dockerfile:** `Dockerfile.frontend`

Multi-stage build:
1. **deps**: Install npm dependencies
2. **builder**: Build Next.js app (requires `output: 'standalone'`)
3. **runner**: Minimal production image (~100MB)

**Environment variables:**
- `NEXT_PUBLIC_API_URL`: Internal API URL (`http://backend:8000/api`)
- `NEXT_PUBLIC_API_BASE_URL`: Public API URL for client

### PostgreSQL

**Image:** `postgres:16-alpine`

**Configuration:**
- Database, user, password from `.env`
- Persistent volume for data
- Health check with `pg_isready`

**Connection string:**
```
postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
```

### Nginx

**Configuration:** `nginx.conf`

Features:
- Reverse proxy for frontend and backend
- Rate limiting (10 req/s for API, 100 req/s for general)
- Gzip compression
- CORS headers (configurable)
- Health check endpoint

**HTTPS:** Commented out by default. See [references/server-setup.md](references/server-setup.md) for SSL setup with Let's Encrypt.

## Scripts Reference

### build_images.sh

Builds Docker images for backend and frontend.

**Usage:**
```bash
scripts/build_images.sh
```

**What it does:**
1. Loads configuration from `.env`
2. Builds backend image with Dockerfile.backend
3. Builds frontend image with Dockerfile.frontend
4. Tags images with `VERSION` and `latest`

**Requirements:**
- `.env` file with `DOCKER_REGISTRY`, `DOCKER_USERNAME`, `VERSION`
- Docker daemon running

### push_images.sh

Pushes built images to Docker registry.

**Usage:**
```bash
# For GitHub Container Registry
export GITHUB_TOKEN=your_token
scripts/push_images.sh
```

**What it does:**
1. Logs in to registry (GHCR, Docker Hub, or custom)
2. Pushes backend image
3. Pushes frontend image

**Registry support:**
- GitHub Container Registry (ghcr.io): Requires `GITHUB_TOKEN`
- Docker Hub (docker.io): Uses `docker login`
- Custom: Uses `docker login $DOCKER_REGISTRY`

### deploy.sh

Deploys application to server.

**Usage:**
```bash
scripts/deploy.sh
```

**What it does:**
1. Tests SSH connection
2. Copies deployment files (docker-compose.yml, nginx.conf, .env)
3. Pulls latest images on server
4. Restarts containers with `docker-compose up -d`
5. Shows deployment status

**Requirements:**
- SSH access to server
- Docker and docker-compose installed on server
- `.env` with `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`

### setup_server.sh

One-time server setup script.

**Usage:**
```bash
scripts/setup_server.sh
```

**What it does:**
1. Updates system packages
2. Installs Docker and docker-compose
3. Configures UFW firewall
4. Creates deployment directory

**Requirements:**
- Fresh Ubuntu/Debian VPS
- Root or sudo access
- SSH key authentication

### migrate_db.py

Migrates SQLite database to PostgreSQL.

**Usage:**
```bash
# Using environment variable
export DATABASE_URL="postgresql://user:pass@host:5432/db"
python scripts/migrate_db.py --sqlite-path brainer.db

# Using command line
python scripts/migrate_db.py \
    --sqlite-path brainer.db \
    --postgres-url "postgresql://user:pass@host:5432/db"
```

**What it does:**
1. Connects to SQLite and PostgreSQL
2. Creates tables in PostgreSQL
3. Migrates data: courses → parts → chapters → exercises
4. Updates sequences for auto-increment IDs

**Requirements:**
- `psycopg2-binary` installed (`pip install psycopg2-binary`)
- SQLite database file exists
- PostgreSQL database created and accessible

## Detailed References

For in-depth information, see these reference documents:

### [docker-config.md](references/docker-config.md)

Comprehensive Docker configuration guide:
- Dockerfile customization
- docker-compose.yml architecture
- Environment variables reference
- Nginx configuration details
- Volume management and backups
- Resource limits and logging

**When to read:** When customizing Docker setup, adding services, or troubleshooting container issues.

### [postgres-migration.md](references/postgres-migration.md)

Complete PostgreSQL migration guide:
- Why migrate from SQLite
- Step-by-step migration process
- Backend code changes required
- Database configuration and tuning
- Testing and verification
- Rollback procedures
- Post-migration tasks (backups, monitoring)

**When to read:** Before migrating database or troubleshooting PostgreSQL issues.

### [server-setup.md](references/server-setup.md)

Full VPS setup and maintenance guide:
- Server requirements and provider recommendations
- Initial server configuration (users, SSH, firewall)
- Docker installation (automated and manual)
- Security hardening (Fail2Ban, automatic updates)
- Domain and SSL setup (Let's Encrypt, Cloudflare)
- Monitoring and logging
- Backup strategies
- Troubleshooting common issues

**When to read:** When setting up a new server, configuring SSL, or implementing monitoring.

## Common Tasks

### Update Application

```bash
# 1. Make code changes locally
# 2. Build new images
scripts/build_images.sh

# 3. Push to registry
scripts/push_images.sh

# 4. Deploy to server
scripts/deploy.sh
```

### View Logs

```bash
# All services
ssh user@server "cd /opt/brainer && docker-compose logs -f"

# Specific service
ssh user@server "cd /opt/brainer && docker-compose logs -f backend"

# Last 100 lines
ssh user@server "cd /opt/brainer && docker-compose logs --tail=100 backend"
```

### Restart Service

```bash
# Single service
ssh user@server "cd /opt/brainer && docker-compose restart backend"

# All services
ssh user@server "cd /opt/brainer && docker-compose restart"
```

### Backup Database

```bash
# Create backup
ssh user@server "docker exec brainer-postgres pg_dump -U brainer brainer" > backup.sql

# Restore backup
cat backup.sql | ssh user@server "docker exec -i brainer-postgres psql -U brainer brainer"
```

### Check Service Health

```bash
# Container status
ssh user@server "cd /opt/brainer && docker-compose ps"

# Resource usage
ssh user@server "docker stats"

# Disk space
ssh user@server "df -h && docker system df"
```

## Troubleshooting

### Build Failures

**Error:** `failed to compute cache key`

**Solution:** Clean Docker build cache
```bash
docker builder prune -a
```

**Error:** Next.js build fails with `output: 'standalone'` error

**Solution:** Ensure `next.config.js` has correct format:
```javascript
module.exports = {
  output: 'standalone',
}
```

### Push Failures

**Error:** `denied: access forbidden`

**Solution:** Check registry authentication
```bash
# For GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u username --password-stdin

# For Docker Hub
docker login
```

### Deployment Failures

**Error:** SSH connection refused

**Solution:**
1. Verify server is running
2. Check firewall allows SSH
3. Verify `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY` in `.env`

**Error:** Container won't start

**Solution:**
```bash
# Check logs
ssh user@server "cd /opt/brainer && docker-compose logs servicename"

# Restart service
ssh user@server "cd /opt/brainer && docker-compose up -d --force-recreate servicename"
```

### Database Issues

**Error:** Backend can't connect to PostgreSQL

**Solution:**
1. Verify `DATABASE_URL` format: `postgresql://user:pass@postgres:5432/db`
2. Check PostgreSQL is healthy: `docker-compose ps postgres`
3. Test connection: `docker exec brainer-postgres psql -U brainer -c "SELECT 1"`

**Error:** Data not migrated correctly

**Solution:** See [postgres-migration.md](references/postgres-migration.md) for verification and rollback procedures.

## Security Checklist

Before deploying to production:

- [ ] Strong `POSTGRES_PASSWORD` in `.env` (use `openssl rand -base64 32`)
- [ ] `.env` not committed to git (in `.gitignore`)
- [ ] SSH key authentication enabled (no password login)
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] SSL/HTTPS configured with valid certificate
- [ ] Regular backups scheduled (database + volumes)
- [ ] Automatic security updates enabled
- [ ] Monitoring/alerting configured
- [ ] Non-root SSH user created
- [ ] Docker images scanned for vulnerabilities

## Next Steps

After successful deployment:

1. **Configure SSL**: Follow SSL setup in [server-setup.md](references/server-setup.md)
2. **Setup monitoring**: Install Portainer or Prometheus (see server-setup.md)
3. **Automate backups**: Add cron job for database backups
4. **Configure domain**: Point DNS to server IP
5. **Test application**: Verify all features work in production
6. **Document**: Add deployment notes to project README
