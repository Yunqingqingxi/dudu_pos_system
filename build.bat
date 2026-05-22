@echo off
chcp 65001 >nul 2>&1
cls
echo ====================================
echo   Building dudu POS...
echo ====================================
echo.
echo [1/2] Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
echo.
echo [2/2] Building frontend...
call npm run build
cd /d "%~dp0"
echo.
echo ====================================
echo   Build complete!
echo   Run start.bat to launch.
echo ====================================
pause