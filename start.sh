#!/bin/bash

# EOXS Ticket Checker Startup Script

echo "🚀 Starting EOXS Ticket Checker..."

# Load environment variables
if [ -f "config.env" ]; then
    echo "📋 Loading environment variables from config.env..."
    export $(cat config.env | grep -v '^#' | xargs)
else
    echo "⚠️  config.env not found, using default values"
    export NODE_ENV="production"
    export HEADLESS="true"
    export PORT="3000"
fi

# Check if required environment variables are set
if [ -z "$EOXS_EMAIL" ] || [ -z "$EOXS_PASSWORD" ]; then
    echo "❌ Error: EOXS_EMAIL and EOXS_PASSWORD must be set"
    echo "   Either set them in config.env or as environment variables"
    exit 1
fi

echo "✅ Environment configured:"
echo "   EOXS_EMAIL: $EOXS_EMAIL"
echo "   NODE_ENV: $NODE_ENV"
echo "   HEADLESS: $HEADLESS"
echo "   PORT: $PORT"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Playwright browsers are installed
echo "🔍 Checking Playwright installation..."
if ! npx playwright --version > /dev/null 2>&1; then
    echo "📦 Installing Playwright browsers..."
    npx playwright install chromium
fi

# Start the server
echo "🌐 Starting server on port $PORT..."
echo "   Health check: http://localhost:$PORT/health"
echo "   API docs: http://localhost:$PORT/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js
