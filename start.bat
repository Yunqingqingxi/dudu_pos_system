@echo off
chcp 65001 >nul 2>&1
cls

echo ====================================
echo   dudu POS - starting...
echo ====================================
echo.
echo [1/2] Starting backend (Python FastAPI)...
start "dudu-backend" cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --port 8000 --host 0.0.0.0"

echo [2/2] Starting frontend (React + Vite)...
start "dudu-frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo Waiting for services to start...
timeout /t 5 /nobreak >nul

echo.
echo ====================================
echo   Ready!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API docs: http://localhost:8000/docs
echo ====================================
echo.
echo Press any key to exit...
pause >nul