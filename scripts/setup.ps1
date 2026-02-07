#!/usr/bin/env pwsh

# PUREIS  Setup Script
# Automates initial project setup

Write-Host "🚀 PUREIS  Setup Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Rust
try {
    $rustVersion = rustc --version
    Write-Host "✅ Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Rust not found. TEE worker build will be skipped." -ForegroundColor Yellow
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker not found. TEE worker Docker build will be skipped." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}

# Install contracts dependencies
Write-Host "Installing contracts dependencies..." -ForegroundColor Cyan
Set-Location packages/contracts
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install contracts dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ../..

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location packages/backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ../..

# Install mobile dependencies
Write-Host "Installing mobile dependencies..." -ForegroundColor Cyan
Set-Location packages/mobile
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install mobile dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ../..

Write-Host ""
Write-Host "🔨 Building packages..." -ForegroundColor Yellow

# Compile contracts
Write-Host "Compiling smart contracts..." -ForegroundColor Cyan
Set-Location packages/contracts
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to compile contracts" -ForegroundColor Red
    exit 1
}
Set-Location ../..

# Build TEE worker if Rust is available
if (Get-Command rustc -ErrorAction SilentlyContinue) {
    Write-Host "Building TEE worker..." -ForegroundColor Cyan
    Set-Location packages/tee-worker
    cargo build --release
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  TEE worker build failed" -ForegroundColor Yellow
    }
    Set-Location ../..
}

Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Yellow

# Run contract tests
Write-Host "Testing smart contracts..." -ForegroundColor Cyan
Set-Location packages/contracts
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Some contract tests failed" -ForegroundColor Yellow
} else {
    Write-Host "✅ All contract tests passed!" -ForegroundColor Green
}
Set-Location ../..

# Run TEE worker tests if Rust is available
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    Write-Host "Testing TEE worker..." -ForegroundColor Cyan
    Set-Location packages/tee-worker
    cargo test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Some TEE worker tests failed" -ForegroundColor Yellow
    } else {
        Write-Host "✅ All TEE worker tests passed!" -ForegroundColor Green
    }
    Set-Location ../..
}

Write-Host ""
Write-Host "📝 Creating environment file..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  .env file already exists, skipping..." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your configuration"
Write-Host "2. Get testnet funds:"
Write-Host "   - Arbitrum Sepolia ETH: https://faucet.quicknode.com/arbitrum/sepolia"
Write-Host "   - iExec RLC: https://faucet.iex.ec/"
Write-Host "3. Deploy contracts:"
Write-Host "   cd packages/contracts"
Write-Host "   npm run deploy:testnet"
Write-Host "4. Start backend:"
Write-Host "   cd packages/backend"
Write-Host "   npm run dev"
Write-Host "5. Run mobile app:"
Write-Host "   cd packages/mobile"
Write-Host "   npm run web"
Write-Host ""
Write-Host "📚 Documentation: docs/QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
