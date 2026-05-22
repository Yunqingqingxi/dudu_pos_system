@echo off
chcp 65001 >nul 2>&1
cls

echo ====================================
echo   dudu POS - starting...
echo ====================================
echo.

cd /d "%~dp0"

if not exist "frontend\dist\index.html" (
    echo [0/2] Frontend not built. Building now...
    cd frontend
    call npm install --silent
    call npm run build
    cd ..
    echo.
)

echo [1/2] Installing Python dependencies...
cd backend
pip install -r requirements.txt -q
python seed.py
echo.

echo [2/2] Starting server...
echo.
echo ====================================
echo   Ready! Open http://localhost:8000
echo   API docs: http://localhost:8000/docs
echo ====================================
echo.
python -m uvicorn main:app --port 8000 --host 0.0.0.0