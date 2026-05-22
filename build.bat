@echo off
chcp 65001 >nul 2>&1
cls

echo ====================================
echo   dudu POS - Building release...
echo ====================================
echo.

cd /d "%~dp0"

echo [1/3] Building frontend...
cd frontend
call npm install --silent
call npm run build
cd ..
echo.

echo [2/3] Creating release folder...
if exist "release" rmdir /s /q "release"
mkdir release
mkdir release\backend
mkdir release\logs

echo [3/3] Copying files...
xcopy /e /i /q "backend\*.py" "release\backend\"
copy /y "backend\requirements.txt" "release\backend\" >nul
xcopy /e /i /q "frontend\dist" "release\frontend\dist\"
copy /y "README.md" "release\" >nul

:: Create release start.bat
(
echo @echo off
echo chcp 65001 ^>nul 2^>^&1
echo cls
echo.
echo echo ====================================
echo echo   dudu POS - starting...
echo echo ====================================
echo echo.
echo.
echo cd /d "%%~dp0"
echo if not exist "logs" mkdir logs
echo.
echo echo [1/2] Installing Python dependencies...
echo cd backend
echo pip install -r requirements.txt -q
echo python seed.py
echo cd ..
echo echo.
echo.
echo echo [2/2] Starting server...
echo echo.
echo echo ====================================
echo echo   Ready! Open http://localhost:8000
echo echo   API docs: http://localhost:8000/docs
echo echo   Logs: logs\server.log
echo echo ====================================
echo echo.
echo cd backend
echo python -m uvicorn main:app --port 8000 --host 0.0.0.0
) > "release\start.bat"

echo.
echo ====================================
echo   Build complete!
echo   Release folder: release\
echo   Run release\start.bat to launch.
echo ====================================
pause