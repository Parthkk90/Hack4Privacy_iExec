#!/bin/bash

# PrivateAlpha - Quick Commands Reference
# Usage: Copy and paste these commands as needed

echo "==================================================="
echo "  PrivateAlpha - Monorepo Quick Commands"
echo "==================================================="
echo ""

# Display current directory
echo "📂 Current directory:"
pwd
echo ""

echo "Available commands:"
echo ""

echo "🏠 SETUP & INSTALLATION"
echo "  npm install                    # Install all packages"
echo "  npm run build                  # Build all packages"
echo "  cp .env.example .env           # Create environment file"
echo ""

echo "🧪 TESTING"
echo "  npm test                       # Test all packages"
echo "  npm test --workspace=packages/contracts"
echo "  npm test --workspace=packages/backend"
echo ""

echo "🚀 DEVELOPMENT"
echo "  npm run dev:contracts          # Start Hardhat node"
echo "  npm run dev:backend            # Start backend server"
echo "  npm run dev:mobile             # Start mobile app (web)"
echo ""

echo "📦 PACKAGE-SPECIFIC COMMANDS"
echo "  cd packages/contracts && npm run compile"
echo "  cd packages/contracts && npm run deploy:testnet"
echo "  cd packages/backend && npm run dev"
echo "  cd packages/mobile && npm run web"
echo "  cd packages/tee-worker && cargo build"
echo ""

echo "🔨 BUILD & DEPLOY"
echo "  npm run deploy:testnet         # Deploy contracts"
echo "  npm run deploy:all             # Deploy everything"
echo ""

echo "🧹 CLEANUP"
echo "  npm run clean                  # Clean all build artifacts"
echo "  rm -rf node_modules && npm install  # Fresh install"
echo ""

echo "📚 DOCUMENTATION"
echo "  Start here: README.md"
echo "  Structure:  WORKSPACE_GUIDE.md"
echo "  Diagrams:   STRUCTURE_DIAGRAM.md"
echo "  Migration:  MIGRATION_GUIDE.md"
echo "  Summary:    STRUCTURE_FIX_SUMMARY.md"
echo ""

echo "==================================================="
echo "  💡 Tip: Always run commands from project root"
echo "     (f:\W3\iExec\iExecX\)"
echo "==================================================="
