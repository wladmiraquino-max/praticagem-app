$env:ANTHROPIC_API_KEY = $env:ANTHROPIC_API_KEY
if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "AVISO: ANTHROPIC_API_KEY nao definida. O Tutor IA e geracao de materiais nao funcionarao." -ForegroundColor Yellow
    Write-Host "Para definir: `$env:ANTHROPIC_API_KEY = 'sk-ant-...'" -ForegroundColor Yellow
}
Set-Location "$PSScriptRoot\backend"
Write-Host "Iniciando backend em http://localhost:8000 ..." -ForegroundColor Green
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
