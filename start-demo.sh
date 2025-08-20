#!/bin/bash

echo "🌿 Starting JARS Cannabis Demo..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

echo "📦 Installing demo dependencies..."
cd apps/demo-web
npm install

echo ""
echo "🚀 Starting demo server..."
echo "📍 Demo will be available at: http://localhost:5173"
echo "🔄 Press Ctrl+C to stop the demo"
echo ""

npm run dev