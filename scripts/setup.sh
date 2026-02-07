#!/bin/bash

# PUREIS  Setup Script for Unix/Linux/macOS

set -e

echo "🚀 PUREIS  Setup Script"
echo "============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check Rust
if command -v rustc &> /dev/null; then
    echo "✅ Rust: $(rustc --version)"
else
    echo "⚠️  Rust not found. TEE worker build will be skipped."
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version)"
else
    echo "⚠️  Docker not found. TEE worker Docker build will be skipped."
fi

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install contracts dependencies
echo "Installing contracts dependencies..."
cd packages/contracts && npm install && cd ../..

# Install backend dependencies
echo "Installing backend dependencies..."
cd packages/backend && npm install && cd ../..

# Install mobile dependencies
echo "Installing mobile dependencies..."
cd packages/mobile && npm install && cd ../..

echo ""
echo "🔨 Building packages..."

# Compile contracts
echo "Compiling smart contracts..."
cd packages/contracts && npm run compile && cd ../..

# Build TEE worker if Rust is available
if command -v rustc &> /dev/null; then
    echo "Building TEE worker..."
    cd packages/tee-worker && cargo build --release && cd ../..
fi

echo ""
echo "🧪 Running tests..."

# Run contract tests
echo "Testing smart contracts..."
cd packages/contracts && npm test && cd ../..

# Run TEE worker tests if Rust is available
if command -v cargo &> /dev/null; then
    echo "Testing TEE worker..."
    cd packages/tee-worker && cargo test && cd ../..
fi

echo ""
echo "📝 Creating environment file..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit .env with your configuration"
else
    echo "ℹ️  .env file already exists, skipping..."
fi

echo ""
echo "========================================"
echo "✨ Setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Get testnet funds:"
echo "   - Arbitrum Sepolia ETH: https://faucet.quicknode.com/arbitrum/sepolia"
echo "   - iExec RLC: https://faucet.iex.ec/"
echo "3. Deploy contracts:"
echo "   cd packages/contracts"
echo "   npm run deploy:testnet"
echo "4. Start backend:"
echo "   cd packages/backend"
echo "   npm run dev"
echo "5. Run mobile app:"
echo "   cd packages/mobile"
echo "   npm run web"
echo ""
echo "📚 Documentation: docs/QUICKSTART.md"
echo ""
