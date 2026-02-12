# Docker Configuration Reference

This document provides detailed information about Docker configuration for Brainer deployment.

## Table of Contents

1. [Dockerfile Configuration](#dockerfile-configuration)
2. [Docker Compose Configuration](#docker-compose-configuration)
3. [Environment Variables](#environment-variables)
4. [Nginx Configuration](#nginx-configuration)
5. [Volume Management](#volume-management)

## Dockerfile Configuration

### Backend Dockerfile

The backend Dockerfile uses a Python 3.11 slim image optimized for FastAPI:

**Key features:**
- Multi-layer caching for faster rebuilds
- System dependencies (gcc for SQLAlchemy)
- Health check endpoint at `/health`
- Non-root user for security (future enhancement)

**Customization:**
- To add Python packages: Update `requirements.txt` and rebuild
- To change Python version: Modify `FROM python:3.11-slim`
- To add system packages: Add them to `apt-get install` line

### Frontend Dockerfile

The frontend uses a multi-stage build for Next.js optimization:

**Build stages:**
1. **deps**: Install Node.js dependencies
2. **builder**: Build Next.js application
3. **runner**: Production runtime (minimal size)

**Important:**
- Requires `output: 'standalone'` in `next.config.js`
- Automatically optimizes bundle size
- Runs as non-root user (nextjs:nodejs)

**Customization:**
- To change Node version: Modify `FROM node:20-alpine`
- To add build-time env vars: Add to builder stage
- To optimize further: Configure Next.js output in config

## Docker Compose Configuration

### Service Architecture

```
nginx (reverse proxy)
  ├── frontend:3000 (Next.js)
  └── backend:8000 (FastAPI)
        └── postgres:5432 (Database)
```

### Service Dependencies

Services start in this order:
1. `postgres` (with health check)
2. `backend` (waits for postgres)
3. `frontend` (waits for backend)
4. `nginx` (waits for frontend + backend)

Health checks ensure each service is ready before dependents start.

### Networking

All services communicate via the `brainer-network` bridge network:
- **Internal**: Services use container names (e.g., `http://backend:8000`)
- **External**: Nginx exposes ports 80/443 to host

### Restart Policies

All services use `restart: unless-stopped`:
- Automatically restart on crash
- Don't restart if manually stopped
- Survive server reboots

## Environment Variables

### Required Variables

**Docker Registry:**
- `DOCKER_REGISTRY`: Registry URL (ghcr.io, docker.io, custom)
- `DOCKER_USERNAME`: Registry username
- `VERSION`: Image tag (default: latest)

**Database:**
- `POSTGRES_DB`: Database name
- `POSTGRES_USER`: Database user
- `POSTGRES_PASSWORD`: Database password (MUST be secure)

**Server:**
- `SERVER_HOST`: Server IP or domain
- `SERVER_USER`: SSH username
- `SERVER_SSH_KEY`: Path to SSH private key

### Optional Variables

**Ports:**
- `HTTP_PORT`: HTTP port (default: 80)
- `HTTPS_PORT`: HTTPS port (default: 443)

**API:**
- `PUBLIC_API_URL`: Public-facing API URL for frontend

**Environment:**
- `ENVIRONMENT`: production, staging, or development

### Security Best Practices

1. **Never commit .env to git**: Already in .gitignore
2. **Use strong passwords**: Generate with `openssl rand -base64 32`
3. **Rotate secrets regularly**: Especially POSTGRES_PASSWORD
4. **Use different .env per environment**: .env.production, .env.staging

## Nginx Configuration

### Reverse Proxy Setup

Nginx acts as a reverse proxy routing requests:
- `/` → `frontend:3000` (Next.js)
- `/api/*` → `backend:8000` (FastAPI)

### Rate Limiting

Two rate limit zones configured:
- `api_limit`: 10 requests/second for API endpoints
- `general_limit`: 100 requests/second for frontend

### HTTPS Configuration

HTTPS is commented out by default. To enable:

1. Obtain SSL certificates (Let's Encrypt, Cloudflare, etc.)
2. Place certificates in `ssl/` directory:
   - `ssl/cert.pem` (certificate)
   - `ssl/key.pem` (private key)
3. Uncomment HTTPS server block in nginx.conf
4. Update `server_name` to your domain
5. Redeploy: `docker-compose up -d nginx`

### Gzip Compression

Enabled for text-based content:
- HTML, CSS, JavaScript
- JSON responses
- SVG images
- Fonts

Reduces bandwidth by ~70% for text content.

## Volume Management

### Persistent Volumes

Three volumes maintain data across container restarts:

**postgres_data:**
- PostgreSQL database files
- Location: Docker volume (managed by Docker)
- Backup: Use `pg_dump` regularly

**backend_data:**
- Legacy data directory (may not be needed with PostgreSQL)
- Consider removing after full PostgreSQL migration

**nginx_logs:**
- Access and error logs
- Useful for debugging and monitoring

### Backup Strategy

**Database backups:**
```bash
# Create backup
docker exec brainer-postgres pg_dump -U brainer brainer > backup.sql

# Restore backup
docker exec -i brainer-postgres psql -U brainer brainer < backup.sql
```

**Volume backups:**
```bash
# Backup volume to tar
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume from tar
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

### Volume Inspection

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect postgres_data

# View volume usage
docker system df -v
```

## Common Customizations

### Adding a New Service

1. Add service definition to `docker-compose.yml`
2. Configure networking (`networks: brainer-network`)
3. Add health check if other services depend on it
4. Update nginx.conf if it needs reverse proxy
5. Add environment variables to `.env`

### Changing Ports

1. Update `docker-compose.yml` ports mapping
2. Update `.env` with new port numbers
3. Update nginx.conf if needed
4. Update firewall rules on server
5. Redeploy: `docker-compose up -d`

### Resource Limits

Add to service definition:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Logging Configuration

Add to service definition:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```
