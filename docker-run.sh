#!/bin/bash

# Script to build and run the movietheater-frontend Docker container

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting movietheater-frontend Docker build and deploy${NC}\n"

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker compose build

# Run the Docker container
echo -e "\n${YELLOW}Starting Docker container...${NC}"
docker compose up -d

# Show running containers
echo -e "\n${YELLOW}Running containers:${NC}"
docker ps

echo -e "\n${GREEN}Done! The application is now running at http://localhost:80${NC}"
echo -e "Use 'docker compose down' to stop the container."
