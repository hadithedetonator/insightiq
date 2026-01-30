#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Starting InsightIQ with Docker...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running."
    echo "Please start 'Docker Desktop' from your Applications folder and try again."
    exit 1
fi

# 1. Create Network
docker network create app-network 2>/dev/null || true

# 2. Build Backend
echo -e "${GREEN}Building Backend...${NC}"
docker build -f backend/Dockerfile -t insightiq-backend .

# 3. Build Frontend
echo -e "${GREEN}Building Frontend...${NC}"
# Note: For local docker dev, we point to localhost because the browser runs on the host
docker build -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001/api \
  -t insightiq-frontend .

# 4. Cleanup old containers
echo -e "${GREEN}Cleaning up old containers...${NC}"
docker stop insightiq-backend insightiq-frontend 2>/dev/null || true
docker rm insightiq-backend insightiq-frontend 2>/dev/null || true

# 5. Start Backend
echo -e "${GREEN}Starting Backend...${NC}"
if [ -f backend/.env ]; then
    docker run -d \
      --name insightiq-backend \
      --network app-network \
      --env-file backend/.env \
      -p 3001:3001 \
      insightiq-backend
else
    echo "Warning: backend/.env not found. Starting without env file."
    docker run -d \
      --name insightiq-backend \
      --network app-network \
      -p 3001:3001 \
      insightiq-backend
fi

# 6. Start Frontend
echo -e "${GREEN}Starting Frontend...${NC}"
docker run -d \
  --name insightiq-frontend \
  --network app-network \
  -p 3000:3000 \
  insightiq-frontend

echo -e "${GREEN}Done!${NC}"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
