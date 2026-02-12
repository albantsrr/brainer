#!/bin/bash
# Push Docker images to registry

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

echo -e "${GREEN}🚀 Pushing Brainer Docker images${NC}"
echo -e "${YELLOW}Registry: $DOCKER_REGISTRY${NC}"
echo -e "${YELLOW}Username: $DOCKER_USERNAME${NC}"
echo -e "${YELLOW}Version: $VERSION${NC}"
echo ""

# Login to registry
echo -e "${GREEN}🔐 Logging in to $DOCKER_REGISTRY...${NC}"
if [ "$DOCKER_REGISTRY" = "ghcr.io" ]; then
    echo -e "${YELLOW}Using GitHub Container Registry${NC}"
    echo -e "${YELLOW}Make sure you have a GitHub Personal Access Token with 'write:packages' scope${NC}"
    echo -e "${YELLOW}Set it with: export GITHUB_TOKEN=your_token${NC}"
    echo ""

    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}Error: GITHUB_TOKEN not set${NC}"
        echo "Generate a token at: https://github.com/settings/tokens"
        exit 1
    fi

    echo "$GITHUB_TOKEN" | docker login ghcr.io -u $DOCKER_USERNAME --password-stdin
elif [ "$DOCKER_REGISTRY" = "docker.io" ]; then
    echo -e "${YELLOW}Using Docker Hub${NC}"
    docker login
else
    echo -e "${YELLOW}Using custom registry: $DOCKER_REGISTRY${NC}"
    docker login $DOCKER_REGISTRY
fi

echo ""

# Push backend image
echo -e "${GREEN}📤 Pushing backend image...${NC}"
docker push $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-backend:$VERSION
docker push $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-backend:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push backend image${NC}"
    exit 1
fi

echo ""

# Push frontend image
echo -e "${GREEN}📤 Pushing frontend image...${NC}"
docker push $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-frontend:$VERSION
docker push $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-frontend:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend image pushed successfully${NC}"
else
    echo -e "${RED}❌ Failed to push frontend image${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 All images pushed successfully!${NC}"
echo ""
echo -e "${YELLOW}Images available at:${NC}"
echo "  - $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-backend:$VERSION"
echo "  - $DOCKER_REGISTRY/$DOCKER_USERNAME/brainer-frontend:$VERSION"
echo ""
echo -e "${YELLOW}Next step:${NC}"
echo "  Deploy to server: ./scripts/deploy.sh"
