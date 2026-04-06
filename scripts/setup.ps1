# me-feels Windows Setup Script
# Run from repo root: .\scripts\setup.ps1

Write-Host "Setting up me-feels (Windows)..." -ForegroundColor Cyan

# Check dependencies
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is required but not installed. Please install Docker Desktop."
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is required but not installed. Please install from https://nodejs.org"
    exit 1
}

# Copy env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example — update with your actual values!" -ForegroundColor Yellow
}

# Install service dependencies
Write-Host "Installing service dependencies..." -ForegroundColor Green
Set-Location service
npm install
Set-Location ..

# Install web dependencies
Write-Host "Installing web dependencies..." -ForegroundColor Green
Set-Location web
npm install
Set-Location ..

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Run '.\scripts\start.ps1' to start the development environment."
