@echo off
title PraticagemStudy
color 0A
echo.
echo  ==========================================
echo   PraticagemStudy - Iniciando...
echo  ==========================================
echo.

cd /d "%~dp0backend"

python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao encontrado. Instale Python 3.11+
    pause & exit /b 1
)

if not exist "data\praticagem.db" (
    echo [INFO] Banco nao encontrado. Criando...
    python seed_data.py
)

echo [OK] Abrindo: http://localhost:8080
echo [OK] Modo offline: Questoes e simulados funcionam sem internet.
echo [OK] Recursos de IA precisam de ANTHROPIC_API_KEY.
echo.
echo  Pressione Ctrl+C para encerrar.
echo.

start "" "http://localhost:8080"
python -m uvicorn main:app --host 0.0.0.0 --port 8080

pause
