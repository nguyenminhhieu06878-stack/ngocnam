#!/bin/bash

echo "🚀 Starting all services..."

# Start MongoDB
echo "📦 Starting MongoDB..."
mkdir -p ~/data/db
nohup mongod --dbpath ~/data/db --logpath ~/data/db/mongodb.log > /dev/null 2>&1 &
MONGO_PID=$!
echo "MongoDB PID: $MONGO_PID"

# Wait a bit
sleep 3

# Start ChromaDB using Docker
echo "🔷 Starting ChromaDB..."
if command -v docker &> /dev/null; then
    # Stop existing container if any
    docker stop chromadb 2>/dev/null || true
    docker rm chromadb 2>/dev/null || true
    
    # Start new container
    docker run -d -p 8000:8000 --name chromadb chromadb/chroma:latest
    echo "ChromaDB started in Docker container"
else
    echo "⚠️  Docker not found. Please install Docker or start ChromaDB manually:"
    echo "   Option 1: Install Docker Desktop from https://www.docker.com/products/docker-desktop"
    echo "   Option 2: Run ChromaDB with Python:"
    echo "     pip3 install --break-system-packages chromadb"
    echo "     python3 -m uvicorn chromadb.app:app --host localhost --port 8000"
fi

# Wait for services to start
sleep 3

echo ""
echo "✅ Services status:"
echo "- MongoDB: localhost:27017 (PID: $MONGO_PID)"
if command -v docker &> /dev/null; then
    echo "- ChromaDB: localhost:8000 (Docker container)"
else
    echo "- ChromaDB: ⚠️  Not started (Docker not available)"
fi
echo ""
echo "To start backend:"
echo "cd backend && npm run dev"
echo ""
echo "To stop services:"
echo "- MongoDB: kill $MONGO_PID"
echo "- ChromaDB: docker stop chromadb"
