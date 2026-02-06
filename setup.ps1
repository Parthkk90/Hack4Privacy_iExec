# PrivateAlpha - Complete Setup Script for Windows
# Run this in PowerShell as Administrator

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  PrivateAlpha - Complete Setup" -ForegroundColor Cyan
Write-Host "  Decentralized Private Trading on Arbitrum Sepolia" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Please run this script as Administrator" -ForegroundColor Yellow
    exit 1
}

# Function to check if command exists
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

# Step 1: Check Prerequisites
Write-Host "📋 Step 1: Checking Prerequisites..." -ForegroundColor Green
Write-Host ""

$prerequisites = @{
    "node" = "Node.js"
    "npm" = "npm"
    "git" = "Git"
    "docker" = "Docker"
    "rustc" = "Rust"
    "cargo" = "Cargo"
}

$missing = @()

foreach ($cmd in $prerequisites.Keys) {
    if (Test-Command $cmd) {
        Write-Host "  ✓ $($prerequisites[$cmd]) installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($prerequisites[$cmd]) NOT installed" -ForegroundColor Red
        $missing += $prerequisites[$cmd]
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Missing prerequisites: $($missing -join ', ')" -ForegroundColor Yellow
    Write-Host "Please install them and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation links:" -ForegroundColor Cyan
    Write-Host "  - Node.js: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host "  - Git: https://git-scm.com/" -ForegroundColor Cyan
    Write-Host "  - Docker: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
    Write-Host "  - Rust: https://rustup.rs/" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Step 2: Install Project Dependencies
Write-Host "📦 Step 2: Installing Project Dependencies..." -ForegroundColor Green
Write-Host ""

# Root dependencies
Write-Host "  Installing root dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Root dependencies installed" -ForegroundColor Green

# Backend dependencies
Write-Host "  Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "  ✓ Backend dependencies installed" -ForegroundColor Green

# Mobile dependencies
Write-Host "  Installing mobile dependencies..." -ForegroundColor Cyan
Set-Location mobile
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install mobile dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "  ✓ Mobile dependencies installed" -ForegroundColor Green

Write-Host ""

# Step 3: Build TEE Worker
Write-Host "🦀 Step 3: Building TEE Worker (Rust)..." -ForegroundColor Green
Write-Host ""

Set-Location privatealpha-tee
Write-Host "  Building Rust project..." -ForegroundColor Cyan
cargo build --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to build TEE worker" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ TEE worker built successfully" -ForegroundColor Green
Set-Location ..

Write-Host ""

# Step 4: Configure Environment
Write-Host "⚙️  Step 4: Configuring Environment..." -ForegroundColor Green
Write-Host ""

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Created .env file from template" -ForegroundColor Green
    Write-Host "  ⚠️  Please edit .env file with your values:" -ForegroundColor Yellow
    Write-Host "     - PRIVATE_KEY" -ForegroundColor Yellow
    Write-Host "     - ARBITRUM_SEPOLIA_RPC" -ForegroundColor Yellow
    Write-Host "     - ARBISCAN_API_KEY" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ .env file already exists" -ForegroundColor Green
}

Write-Host ""

# Step 5: Compile Smart Contracts
Write-Host "📝 Step 5: Compiling Smart Contracts..." -ForegroundColor Green
Write-Host ""

npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to compile contracts" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Contracts compiled successfully" -ForegroundColor Green

Write-Host ""

# Step 6: Run Tests
Write-Host "🧪 Step 6: Running Tests..." -ForegroundColor Green
Write-Host ""

Write-Host "  Running smart contract tests..." -ForegroundColor Cyan
npx hardhat test
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ⚠️  Some tests failed, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "  ✓ All tests passed" -ForegroundColor Green
}

Write-Host ""

# Summary
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Get Testnet Funds:" -ForegroundColor White
Write-Host "   - Arbitrum Sepolia ETH: https://faucet.quicknode.com/arbitrum/sepolia" -ForegroundColor Gray
Write-Host "   - iExec RLC: https://faucet.iex.ec/" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure .env file:" -ForegroundColor White
Write-Host "   - Add your PRIVATE_KEY" -ForegroundColor Gray
Write-Host "   - Add RPC URL (or use default)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy Smart Contracts:" -ForegroundColor White
Write-Host "   npx hardhat run scripts/deploy.js --network arbitrumSepolia" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start Backend API:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Run Mobile App:" -ForegroundColor White
Write-Host "   cd mobile" -ForegroundColor Gray
Write-Host "   npm run web" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md - Complete documentation" -ForegroundColor Gray
Write-Host "   - QUICKSTART.md - 5-minute quick start" -ForegroundColor Gray
Write-Host "   - ARCHITECTURE.md - Technical architecture" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Happy Building!" -ForegroundColor Green
Write-Host ""
