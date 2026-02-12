#!/bin/bash
# Setup server for Brainer deployment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Server configuration
SERVER_HOST=${SERVER_HOST:-}
SERVER_USER=${SERVER_USER:-root}
SERVER_SSH_KEY=${SERVER_SSH_KEY:-~/.ssh/id_rsa}

if [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}Error: SERVER_HOST not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}🔧 Setting up server: $SERVER_HOST${NC}"
echo ""

# Test SSH connection
echo -e "${GREEN}🔐 Testing SSH connection...${NC}"
if ssh -i $SERVER_SSH_KEY -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

echo ""

# Run setup commands on server
ssh -i $SERVER_SSH_KEY $SERVER_USER@$SERVER_HOST << 'ENDSSH'
    set -e

    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m'

    echo -e "${BLUE}📦 Updating system packages...${NC}"
    apt-get update
    apt-get upgrade -y

    echo ""
    echo -e "${BLUE}🐳 Installing Docker...${NC}"

    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        echo -e "${YELLOW}Docker is already installed${NC}"
        docker --version
    else
        # Install Docker
        apt-get install -y \
            ca-certificates \
            curl \
            gnupg \
            lsb-release

        # Add Docker's official GPG key
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

        # Set up the repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker Engine
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

        # Start and enable Docker
        systemctl start docker
        systemctl enable docker

        echo -e "${GREEN}✅ Docker installed successfully${NC}"
        docker --version
    fi

    echo ""
    echo -e "${BLUE}🔧 Installing Docker Compose...${NC}"

    # Check if docker-compose is already installed
    if command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}Docker Compose is already installed${NC}"
        docker-compose --version
    else
        # Install docker-compose
        DOCKER_COMPOSE_VERSION="v2.24.5"
        curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose

        echo -e "${GREEN}✅ Docker Compose installed successfully${NC}"
        docker-compose --version
    fi

    echo ""
    echo -e "${BLUE}🔥 Configuring firewall...${NC}"

    # Install UFW if not present
    if ! command -v ufw &> /dev/null; then
        apt-get install -y ufw
    fi

    # Configure UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable

    echo -e "${GREEN}✅ Firewall configured${NC}"
    ufw status

    echo ""
    echo -e "${BLUE}📁 Creating deployment directory...${NC}"
    mkdir -p /opt/brainer
    mkdir -p /opt/brainer/ssl

    echo ""
    echo -e "${GREEN}🎉 Server setup complete!${NC}"
    echo ""
    echo -e "${YELLOW}Installed:${NC}"
    echo "  - Docker: $(docker --version)"
    echo "  - Docker Compose: $(docker-compose --version)"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Build images: ./scripts/build_images.sh"
    echo "  2. Push images: ./scripts/push_images.sh"
    echo "  3. Deploy: ./scripts/deploy.sh"
ENDSSH

echo ""
echo -e "${GREEN}✅ Server setup completed successfully!${NC}"
