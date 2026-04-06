# me-feels Windows Start Script
# Run from repo root: .\scripts\start.ps1

Write-Host "Starting me-feels dev environment..." -ForegroundColor Cyan

docker compose up --build -d

Write-Host ""
Write-Host "Services started:" -ForegroundColor Green
Write-Host "  Web:     http://localhost:3000" -ForegroundColor White
Write-Host "  Service: http://localhost:3001" -ForegroundColor White
Write-Host "  DB:      localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Run 'docker compose logs -f' to stream logs."
Write-Host "Run 'docker compose down' to stop."
