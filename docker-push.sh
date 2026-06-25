#!/bin/bash

echo "📦 Building docker image..."
docker build -t  970817258126.dkr.ecr.ap-south-1.amazonaws.com/chat-man-ai-ecr:latest .

echo "🔐 Logging into ECR..."
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 970817258126.dkr.ecr.ap-south-1.amazonaws.com

echo "🚀 Pushing image to ECR..."
docker push 970817258126.dkr.ecr.ap-south-1.amazonaws.com/chat-man-ai-ecr:latest

echo "✅ Docker image pushed successfully!"