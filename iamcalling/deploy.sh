#!/bin/bash

# IAMCALLING Quick Deployment Script
# This script automates the deployment process

echo "🚀 IAMCALLING Deployment Script"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created. Please edit it with your credentials."
        echo "📝 Edit .env file: nano .env"
        exit 0
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

echo "✅ .env file exists"

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Create uploads directory
mkdir -p uploads
echo "✅ Uploads directory created"

# Ask deployment method
echo ""
echo "Choose deployment method:"
echo "1) Direct (npm start)"
echo "2) PM2 (process manager)"
echo "3) Docker"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting application with npm..."
        npm start
        ;;
    2)
        if ! command -v pm2 &> /dev/null; then
            echo "📦 Installing PM2..."
            npm install -g pm2
        fi
        echo "🚀 Starting application with PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        echo "✅ Application started with PM2"
        echo "📊 View logs: pm2 logs iamcalling"
        echo "🔄 Restart: pm2 restart iamcalling"
        ;;
    3)
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed"
            exit 1
        fi
        echo "🐳 Building Docker image..."
        docker-compose up -d --build
        echo "✅ Application started with Docker"
        echo "📊 View logs: docker-compose logs -f"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application should be running on http://localhost:1000"
echo ""
echo "📚 For more information, see DEPLOYMENT_GUIDE.md"
