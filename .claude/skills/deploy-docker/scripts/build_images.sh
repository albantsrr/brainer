#!/bin/bash
# Build Docker images for Brainer application

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

# Default values
VERSION=${VERSION:-latest}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-ghcr.io}
DOCKER_USERNAME=${DOCKER_USERNAME:-}

if [ -z "$DOCKER_USERNAME" ]; then
    echo -e "${RED}Error: DOCKER_USERNAME not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}🏗️  Building Brainer Docker images${NC}"
echo -e "${YELLOW}Registry: $DOCKER_REGISTRY${NC}"
echo -e "${YELLOW}Username: $DOCKER_USERNAME${NC}"
echo -e "${YELLOW}Version: $VERSION${NC}"
echo ""

# Build backend image
echo -e "${GREEN}📦 Building backend image...${NC}"
docker build \
    -f Dockerfile.backend \
    -t $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-backend:$VERSION \
    -t $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-backend:latest \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build backend image${NC}"
    exit 1
fi

echo ""

# Build frontend image
echo -e "${GREEN}📦 Building frontend image...${NC}"

# Check if Next.js is configured for standalone output
if ! grep -q "output: 'standalone'" frontend/next.config.js 2>/dev/null && \
   ! grep -q 'output: "standalone"' frontend/next.config.js 2>/dev/null && \
   ! grep -q "output: 'standalone'" frontend/next.config.ts 2>/dev/null && \
   ! grep -q 'output: "standalone"' frontend/next.config.ts 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Warning: next.config.js should have output: 'standalone' for Docker${NC}"
    echo -e "${YELLOW}   Add this to next.config.js: { output: 'standalone' }${NC}"
fi

docker build \
    -f Dockerfile.frontend \
    -t $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-frontend:$VERSION \
    -t $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-frontend:latest \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build frontend image${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All images built successfully!${NC}"
echo ""
echo -e "${YELLOW}Images:${NC}"
echo "  - $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-backend:$VERSION"
echo "  - $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-frontend:$VERSION"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test images locally: docker-compose up"
echo "  2. Push images: ./scripts/push_images.sh"
echo "  3. Deploy to server: ./scripts/deploy.sh"
