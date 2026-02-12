#!/bin/bash
# Deploy Brainer application to server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
DEPLOY_PATH="/opt/brainer"

if [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}Error: SERVER_HOST not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Deploying Brainer to $SERVER_HOST${NC}"
echo ""

# Test SSH connection
echo -e "${GREEN}🔐 Testing SSH connection...${NC}"
if ssh -i $SERVER_SSH_KEY -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    echo -e "${YELLOW}Check your SERVER_HOST, SERVER_USER, and SERVER_SSH_KEY in .env${NC}"
    exit 1
fi

echo ""

# Create deployment directory
echo -e "${GREEN}📁 Creating deployment directory...${NC}"
ssh -i $SERVER_SSH_KEY $SERVER_USER@$SERVER_HOST "mkdir -p $DEPLOY_PATH"

# Copy deployment files
echo -e "${GREEN}📤 Copying deployment files...${NC}"
scp -i $SERVER_SSH_KEY docker-compose.yml $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/
scp -i $SERVER_SSH_KEY nginx.conf $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/
scp -i $SERVER_SSH_KEY .env $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/

echo -e "${GREEN}✅ Files copied successfully${NC}"
echo ""

# Pull and deploy
echo -e "${GREEN}🐳 Pulling latest images and deploying...${NC}"
ssh -i $SERVER_SSH_KEY $SERVER_USER@$SERVER_HOST << EOF
    cd $DEPLOY_PATH

    # Load environment variables
    export \$(grep -v '^#' .env | xargs)

    # Login to registry if using GHCR
    if [ "$DOCKER_REGISTRY" = "ghcr.io" ]; then
        echo "$GITHUB_TOKEN" | docker login ghcr.io -u $DOCKER_USERNAME --password-stdin
    fi

    # Pull latest images
    docker-compose pull

    # Stop old containers
    docker-compose down

    # Start new containers
    docker-compose up -d

    # Show status
    docker-compose ps
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    echo -e "${YELLOW}Application URLs:${NC}"
    echo "  Frontend: http://$SERVER_HOST"
    echo "  Backend API: http://$SERVER_HOST/api"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "  View logs: ssh $SERVER_USER@$SERVER_HOST 'cd $DEPLOY_PATH && docker-compose logs -f'"
    echo "  Check status: ssh $SERVER_USER@$SERVER_HOST 'cd $DEPLOY_PATH && docker-compose ps'"
    echo "  Restart services: ssh $SERVER_USER@$SERVER_HOST 'cd $DEPLOY_PATH && docker-compose restart'"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
