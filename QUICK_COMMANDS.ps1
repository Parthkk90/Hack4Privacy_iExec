# PrivateAlpha - Quick Commands Reference (PowerShell)
# Usage: Run .\QUICK_COMMANDS.ps1 or copy commands as needed

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  PrivateAlpha - Monorepo Quick Commands" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Display current directory
Write-Host "📂 Current directory:" -ForegroundColor Yellow
Get-Location
Write-Host ""

Write-Host "Available commands:" -ForegroundColor Green
Write-Host ""

Write-Host "🏠 SETUP & INSTALLATION" -ForegroundColor Magenta
Write-Host "  npm install                    # Install all packages"
Write-Host "  npm run build                  # Build all packages"
Write-Host "  Copy-Item .env.example .env    # Create environment file"
Write-Host ""

Write-Host "🧪 TESTING" -ForegroundColor Magenta
Write-Host "  npm test                       # Test all packages"
Write-Host "  npm test --workspace=packages/contracts"
Write-Host "  npm test --workspace=packages/backend"
Write-Host ""

Write-Host "🚀 DEVELOPMENT" -ForegroundColor Magenta
Write-Host "  npm run dev:contracts          # Start Hardhat node"
Write-Host "  npm run dev:backend            # Start backend server"
Write-Host "  npm run dev:mobile             # Start mobile app (web)"
Write-Host ""

Write-Host "📦 PACKAGE-SPECIFIC COMMANDS" -ForegroundColor Magenta
Write-Host "  cd packages\contracts; npm run compile"
Write-Host "  cd packages\contracts; npm run deploy:testnet"
Write-Host "  cd packages\backend; npm run dev"
Write-Host "  cd packages\mobile; npm run web"
Write-Host "  cd packages\tee-worker; cargo build"
Write-Host ""

Write-Host "🔨 BUILD & DEPLOY" -ForegroundColor Magenta
Write-Host "  npm run deploy:testnet         # Deploy contracts"
Write-Host "  npm run deploy:all             # Deploy everything"
Write-Host ""

Write-Host "🧹 CLEANUP" -ForegroundColor Magenta
Write-Host "  npm run clean                  # Clean all build artifacts"
Write-Host "  Remove-Item -Recurse node_modules; npm install  # Fresh install"
Write-Host ""

Write-Host "📚 DOCUMENTATION" -ForegroundColor Magenta
Write-Host "  Start here: README.md"
Write-Host "  Structure:  WORKSPACE_GUIDE.md"
Write-Host "  Diagrams:   STRUCTURE_DIAGRAM.md"
Write-Host "  Migration:  MIGRATION_GUIDE.md"
Write-Host "  Summary:    STRUCTURE_FIX_SUMMARY.md"
Write-Host ""

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  💡 Tip: Always run commands from project root" -ForegroundColor Yellow
Write-Host "     (f:\W3\iExec\iExecX\)" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan

# Optionally, wait for user input
# Read-Host "Press Enter to continue"
