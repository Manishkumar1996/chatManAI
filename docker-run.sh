#!/bin/bash

# echo "🔐 Logging into ECR..."
# sudo aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 970817258126.dkr.ecr.ap-south-1.>

# echo "📦 Pulling latest image..."
# sudo docker pull 970817258126.dkr.ecr.ap-south-1.amazonaws.com/chat-man-ai-ecr:latest

echo "📦 Building docker image..."
docker build -t  970817258126.dkr.ecr.ap-south-1.amazonaws.com/chat-man-ai-ecr:latest .

echo "🛑 Stopping old container..."
docker stop chat-man-ai || true
docker rm chat-man-ai || true

echo "🚀 Starting new container..."
docker run -d \
  --name chat-man-ai \
  --restart always \
  -p 80:5173 \
  970817258126.dkr.ecr.ap-south-1.amazonaws.com/chat-man-ai-ecr:latest

echo "✅ Docker container started successfully!"