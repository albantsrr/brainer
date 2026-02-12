# Server Setup Guide

Complete guide for setting up a VPS for Brainer deployment.

## Table of Contents

1. [VPS Requirements](#vps-requirements)
2. [Initial Server Setup](#initial-server-setup)
3. [Docker Installation](#docker-installation)
4. [Security Configuration](#security-configuration)
5. [Domain and SSL](#domain-and-ssl)
6. [Monitoring](#monitoring)

## VPS Requirements

### Minimum Specifications

For a production Brainer deployment:
- **CPU**: 2 cores (1 core may work for low traffic)
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 20GB SSD (more if storing many books)
- **Network**: 1TB bandwidth/month
- **OS**: Ubuntu 22.04 LTS or Debian 12

### Recommended Providers

**Budget-friendly ($5-10/month):**
- DigitalOcean (Droplet Basic)
- Linode (Nanode)
- Vultr (Regular Performance)
- Hetzner (CX21)

**Enterprise:**
- AWS EC2 (t3.small)
- Google Cloud (e2-small)
- Azure (B2s)

## Initial Server Setup

### 1. Connect to Server

```bash
ssh root@your-server-ip
```

### 2. Update System

```bash
apt-get update
apt-get upgrade -y
```

### 3. Create Non-Root User (Recommended)

```bash
# Create user
adduser deploy
usermod -aG sudo deploy

# Copy SSH keys
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Test login
# From local machine: ssh deploy@your-server-ip
```

### 4. Configure SSH

Edit `/etc/ssh/sshd_config`:

```bash
# Disable root login
PermitRootLogin no

# Disable password authentication (key-only)
PasswordAuthentication no
PubkeyAuthentication yes

# Optional: Change SSH port
Port 2222
```

Restart SSH:
```bash
systemctl restart sshd
```

### 5. Set Hostname

```bash
hostnamectl set-hostname brainer-prod
```

## Docker Installation

### Automated Setup

Use the provided script:

```bash
# From local machine
./scripts/setup_server.sh
```

### Manual Installation

If you prefer to install manually:

```bash
# Install dependencies
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker-compose --version
```

### Add User to Docker Group

```bash
usermod -aG docker deploy

# Logout and login for changes to take effect
```

## Security Configuration

### Firewall (UFW)

```bash
# Install UFW
apt-get install -y ufw

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (adjust port if changed)
ufw allow 22/tcp
# or: ufw allow 2222/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status verbose
```

### Fail2Ban (Brute Force Protection)

```bash
# Install
apt-get install -y fail2ban

# Configure
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
EOF

# Restart
systemctl restart fail2ban
systemctl enable fail2ban

# Check status
fail2ban-client status sshd
```

### Automatic Security Updates

```bash
# Install unattended-upgrades
apt-get install -y unattended-upgrades

# Configure
dpkg-reconfigure -plow unattended-upgrades

# Verify
cat /etc/apt/apt.conf.d/20auto-upgrades
```

Should contain:
```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

### Docker Security

**1. Use non-root containers:**
Already configured in Dockerfiles for frontend (nextjs user).

**2. Scan images for vulnerabilities:**
```bash
# Install trivy
apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee -a /etc/apt/sources.list.d/trivy.list
apt-get update
apt-get install -y trivy

# Scan images
trivy image brainer-backend:latest
trivy image brainer-frontend:latest
```

**3. Enable Docker content trust:**
```bash
export DOCKER_CONTENT_TRUST=1
```

## Domain and SSL

### Domain Configuration

**1. Purchase domain** (Namecheap, Google Domains, Cloudflare)

**2. Configure DNS records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your-server-ip | 300 |
| A | api | your-server-ip | 300 |
| AAAA | @ | your-ipv6 (optional) | 300 |

**3. Wait for DNS propagation** (5-60 minutes)

Verify: `dig yourdomain.com`

### SSL with Let's Encrypt

**Using Certbot:**

```bash
# Install Certbot
apt-get install -y certbot

# Stop nginx temporarily
docker-compose stop nginx

# Obtain certificate
certbot certonly --standalone \
    -d yourdomain.com \
    -d api.yourdomain.com \
    --agree-tos \
    --email your-email@example.com

# Copy certificates to deployment directory
mkdir -p /opt/brainer/ssl
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/brainer/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/brainer/ssl/key.pem

# Update nginx.conf to use HTTPS
# (uncomment HTTPS server block)

# Restart nginx
docker-compose up -d nginx
```

**Auto-renewal:**

```bash
# Test renewal
certbot renew --dry-run

# Add cron job
echo "0 3 * * * certbot renew --quiet --post-hook 'cp /etc/letsencrypt/live/yourdomain.com/*.pem /opt/brainer/ssl/ && docker-compose -f /opt/brainer/docker-compose.yml restart nginx'" | crontab -
```

### SSL with Cloudflare

If using Cloudflare as DNS:

1. Enable "Proxied" (orange cloud) in DNS settings
2. Set SSL/TLS mode to "Full" or "Full (strict)"
3. Generate Cloudflare Origin Certificate
4. Use certificate in nginx.conf

**Benefits:**
- Free SSL
- DDoS protection
- CDN for static assets
- No certbot needed

## Monitoring

### Basic Monitoring

**1. Check container status:**
```bash
docker-compose ps
docker stats
```

**2. View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last N lines
docker-compose logs --tail=100 backend
```

**3. System resources:**
```bash
# CPU and memory
htop  # or: apt-get install -y htop

# Disk usage
df -h
docker system df
```

### Advanced Monitoring

**Option 1: Portainer (Docker UI)**

```bash
docker run -d \
    -p 9000:9000 \
    --name portainer \
    --restart=unless-stopped \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce

# Access at: http://your-server-ip:9000
```

**Option 2: Prometheus + Grafana**

Create `monitoring/docker-compose.yml`:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  prometheus_data:
  grafana_data:
```

**Option 3: Simple uptime monitoring**

```bash
# Create monitoring script
cat > /opt/brainer/monitor.sh << 'EOF'
#!/bin/bash
if ! curl -sf http://localhost/health > /dev/null; then
    echo "Brainer is down!" | mail -s "Brainer Alert" your-email@example.com
    docker-compose -f /opt/brainer/docker-compose.yml restart
fi
EOF

chmod +x /opt/brainer/monitor.sh

# Add to cron (every 5 minutes)
echo "*/5 * * * * /opt/brainer/monitor.sh" | crontab -
```

### Log Management

**Rotate Docker logs:**

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
systemctl restart docker
```

**External logging (optional):**

Services like Papertrail, Logtail, or Loki can centralize logs.

## Maintenance Tasks

### Regular Updates

**Weekly:**
```bash
# Update system packages
apt-get update && apt-get upgrade -y

# Update Docker images
cd /opt/brainer
docker-compose pull
docker-compose up -d
```

**Monthly:**
```bash
# Clean up Docker
docker system prune -a --volumes -f

# Check disk space
df -h

# Review logs for errors
docker-compose logs --tail=1000 | grep -i error
```

### Backup Checklist

- [ ] Database backup (automated daily)
- [ ] Docker volumes backup (weekly)
- [ ] Configuration files (.env, nginx.conf)
- [ ] SSL certificates
- [ ] Server snapshot (monthly)

## Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs servicename

# Check if port is in use
netstat -tulpn | grep :80

# Rebuild container
docker-compose up -d --force-recreate servicename
```

**Out of disk space:**
```bash
# Clean Docker
docker system prune -a --volumes

# Check largest directories
du -sh /* | sort -rh | head -10
```

**High memory usage:**
```bash
# Check container stats
docker stats

# Restart containers
docker-compose restart

# Add swap if needed (4GB)
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Performance issues:**
```bash
# Monitor system
htop
iotop  # disk I/O

# Check PostgreSQL queries
docker exec brainer-postgres psql -U brainer -c "SELECT * FROM pg_stat_activity;"

# Enable query logging
docker exec brainer-postgres psql -U postgres -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"
docker-compose restart postgres
```
