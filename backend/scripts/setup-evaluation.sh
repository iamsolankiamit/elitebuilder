#!/bin/bash

set -e

echo "🚀 Setting up EliteBuilders Evaluation Pipeline..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is available and running"

# Start Redis container if not already running
if docker ps | grep -q "redis-evaluation"; then
    echo "✅ Redis container is already running"
else
    echo "🔄 Starting Redis container..."
    docker run -d --name redis-evaluation -p 6379:6379 redis:alpine
    echo "✅ Redis container started"
fi

# Check Redis connectivity
echo "🔄 Testing Redis connection..."
if docker exec redis-evaluation redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is responding"
else
    echo "❌ Redis is not responding"
    exit 1
fi

# Create directories for evaluation
echo "🔄 Creating evaluation directories..."
sudo mkdir -p /tmp/evaluations
sudo mkdir -p /tmp/repos
sudo mkdir -p /tmp/packs
sudo mkdir -p /tmp/results
sudo chmod 755 /tmp/evaluations /tmp/repos /tmp/packs /tmp/results

echo "✅ Evaluation directories created"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "🔄 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Evaluation pipeline setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the correct database URL and other settings"
echo "2. Run 'npm run start:dev' to start the server"
echo "3. The evaluation pipeline will automatically process submissions"
echo ""
echo "Useful commands:"
echo "- Check Redis: docker exec redis-evaluation redis-cli ping"
echo "- View Redis logs: docker logs redis-evaluation"
echo "- Stop Redis: docker stop redis-evaluation"
echo "- Remove Redis: docker rm redis-evaluation"
echo "" 